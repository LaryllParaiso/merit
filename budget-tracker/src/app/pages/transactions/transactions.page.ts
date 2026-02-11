import { Component, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonContent, IonList, ToastController } from '@ionic/angular';

import { Category } from '../../models/category.model';
import { TransactionType } from '../../models/transaction.model';
import { TransactionListItem, TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
  standalone: false,
})
export class TransactionsPage {
  @ViewChild('txList', { read: IonList }) txList?: IonList;
  @ViewChild(IonContent) content?: IonContent;

  isLoading = false;
  transactions: TransactionListItem[] = [];
  filteredTransactions: TransactionListItem[] = [];

  focusedTxId?: string;
  private pendingFocusTxId?: string;

  isTxModalOpen = false;
  isTxSaving = false;
  txCategories: Category[] = [];
  editingTransactionId?: string;

  typeFilter: 'all' | TransactionType = 'all';
  searchText = '';

  form = this.formBuilder.nonNullable.group({
    type: this.formBuilder.nonNullable.control<TransactionType>('expense', [Validators.required]),
    amount: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    categoryId: this.formBuilder.nonNullable.control('', [Validators.required]),
    date: this.formBuilder.nonNullable.control(new Date().toISOString().slice(0, 10), [Validators.required]),
    notes: this.formBuilder.nonNullable.control('')
  });

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private userService: UserService,
    private categoryService: CategoryService,
    private transactionService: TransactionService
  ) { }

  async ionViewWillEnter(): Promise<void> {
    const focusTxId = this.route.snapshot.queryParamMap.get('focusTxId') ?? undefined;
    this.pendingFocusTxId = focusTxId;
    await this.load();

    if (this.pendingFocusTxId) {
      await this.focusTransaction(this.pendingFocusTxId);
      this.pendingFocusTxId = undefined;
    }
  }

  async load(): Promise<void> {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    try {
      const userId = await this.userService.getOrCreateUserId();
      this.transactions = await this.transactionService.listTransactions(userId);
      this.applyFilters();
    } catch (err) {
      console.error(err);
      const toast = await this.toastController.create({
        message: 'Failed to load transactions',
        duration: 1500,
        position: 'bottom'
      });
      await toast.present();
    } finally {
      this.isLoading = false;
    }
  }

  applyFilters(): void {
    const search = this.searchText.trim().toLowerCase();

    this.filteredTransactions = this.transactions
      .filter(t => {
      if (this.typeFilter !== 'all' && t.type !== this.typeFilter) {
        return false;
      }

      if (!search) {
        return true;
      }

      const haystack = `${t.categoryName ?? ''} ${t.notes ?? ''} ${t.date}`.toLowerCase();
      return haystack.includes(search);
      })
      .sort((a, b) => String(b.date ?? '').localeCompare(String(a.date ?? '')));
  }

  private async focusTransaction(transactionId: string): Promise<void> {
    this.typeFilter = 'all';
    this.searchText = '';
    this.applyFilters();

    const el = await this.waitForElementById(`tx-${transactionId}`, 1800);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      this.focusedTxId = transactionId;
      window.setTimeout(() => {
        if (this.focusedTxId === transactionId) {
          this.focusedTxId = undefined;
        }
      }, 2200);
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { focusTxId: null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private async waitForElementById(id: string, timeoutMs: number): Promise<HTMLElement | null> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const el = document.getElementById(id);
      if (el) {
        return el;
      }
      await new Promise(resolve => setTimeout(resolve, 60));
    }
    return null;
  }

  getSectionLabel(date: string): string {
    const d = String(date ?? '').trim();
    if (!d) {
      return '';
    }

    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);
    const yesterdayIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    if (d === todayIso) {
      return 'Today';
    }
    if (d === yesterdayIso) {
      return 'Yesterday';
    }
    return d;
  }

  addNew(): void {
    void this.closeSlidingItems();
    void this.openTxModal();
  }

  edit(tx: TransactionListItem): void {
    void this.closeSlidingItems();
    void this.openTxModal(tx.id);
  }

  async closeSlidingItems(): Promise<void> {
    await this.txList?.closeSlidingItems();
  }

  get isIncome(): boolean {
    return this.form.get('type')?.value === 'income';
  }

  get amountColor(): string {
    return this.isIncome ? 'var(--ion-color-secondary)' : 'var(--ion-color-danger)';
  }

  selectCategory(c: Category): void {
    this.form.patchValue({ categoryId: c.id });
  }

  trackByCategoryId(_: number, c: Category): string {
    return c.id;
  }

  async openTxModal(transactionId?: string): Promise<void> {
    this.editingTransactionId = transactionId;

    if (transactionId) {
      const tx = await this.transactionService.getTransactionById(transactionId);
      if (!tx) {
        const toast = await this.toastController.create({
          message: 'Transaction not found',
          duration: 1500,
          position: 'bottom'
        });
        await toast.present();
        return;
      }

      this.form.patchValue(
        {
          type: tx.type,
          amount: tx.amount,
          date: tx.date,
          notes: tx.notes ?? ''
        },
        { emitEvent: false }
      );

      await this.loadTxCategories(tx.type);
      this.form.patchValue({ categoryId: tx.categoryId }, { emitEvent: false });
    } else {
      const type: TransactionType = this.form.get('type')?.value ?? 'expense';
      this.form.reset(
        {
          type,
          amount: null,
          categoryId: '',
          date: new Date().toISOString().slice(0, 10),
          notes: ''
        },
        { emitEvent: false }
      );

      await this.loadTxCategories(type);
      this.form.patchValue({ categoryId: this.txCategories[0]?.id ?? '' }, { emitEvent: false });
    }

    this.isTxModalOpen = true;
  }

  closeTxModal(): void {
    this.isTxModalOpen = false;
    this.isTxSaving = false;
    this.editingTransactionId = undefined;
  }

  async onTxTypeChange(ev: CustomEvent): Promise<void> {
    const type = ev.detail.value as TransactionType | undefined;
    if (type !== 'income' && type !== 'expense') {
      return;
    }

    await this.loadTxCategories(type);
    const current = this.form.get('categoryId')?.value;
    const exists = !!current && this.txCategories.some(c => c.id === current);
    if (!exists) {
      this.form.patchValue({ categoryId: this.txCategories[0]?.id ?? '' }, { emitEvent: false });
    }
  }

  private async loadTxCategories(type: TransactionType): Promise<void> {
    this.txCategories = await this.categoryService.getCategories(type);
  }

  async saveTx(): Promise<void> {
    if (this.isTxSaving) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isTxSaving = true;
    try {
      const value = this.form.getRawValue();
      const userId = await this.userService.getOrCreateUserId();

      const type: TransactionType = value.type;
      const categoryId = value.categoryId;
      const date = value.date;
      const notes = value.notes.length > 0 ? value.notes : undefined;
      const amount = Number(value.amount);

      if (this.editingTransactionId) {
        await this.transactionService.updateTransaction({
          id: this.editingTransactionId,
          type,
          amount,
          categoryId,
          date,
          notes
        });
      } else {
        await this.transactionService.addTransaction({
          userId,
          type,
          amount,
          categoryId,
          date,
          notes
        });
      }

      const toast = await this.toastController.create({
        message: 'Saved',
        duration: 1200,
        position: 'bottom'
      });
      await toast.present();

      this.closeTxModal();
      await this.load();
    } catch (err) {
      console.error(err);
      const toast = await this.toastController.create({
        message: 'Save failed',
        duration: 1500,
        position: 'bottom'
      });
      await toast.present();
    } finally {
      this.isTxSaving = false;
    }
  }

  async confirmDelete(tx: TransactionListItem): Promise<void> {
    await this.closeSlidingItems();
    const alert = await this.alertController.create({
      header: 'Delete transaction?',
      message: 'This will remove it permanently.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            void this.delete(tx);
          }
        }
      ]
    });

    await alert.present();
  }

  private async delete(tx: TransactionListItem): Promise<void> {
    try {
      await this.transactionService.deleteTransaction(tx.id);
      await this.load();

      const toast = await this.toastController.create({
        message: 'Deleted',
        duration: 1200,
        position: 'bottom'
      });
      await toast.present();
    } catch (err) {
      console.error(err);
      const toast = await this.toastController.create({
        message: 'Delete failed',
        duration: 1500,
        position: 'bottom'
      });
      await toast.present();
    }
  }

  async doRefresh(ev: CustomEvent): Promise<void> {
    await this.load();
    (ev.target as any).complete();
  }

  trackById(_: number, item: TransactionListItem): string {
    return item.id;
  }
}
