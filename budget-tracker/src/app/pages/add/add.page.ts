import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

import { Category } from '../../models/category.model';
import { TransactionType } from '../../models/transaction.model';
import { CategoryService } from '../../services/category.service';
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
  standalone: false,
})
export class AddPage implements OnInit {
  categories: Category[] = [];
  isSaving = false;
  editingTransactionId?: string;

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
    private toastController: ToastController,
    private userService: UserService,
    private categoryService: CategoryService,
    private transactionService: TransactionService
  ) { }

  ngOnInit() {
    this.form.get('type')?.valueChanges.subscribe(async (type) => {
      if (!type) {
        return;
      }
      await this.loadCategories(type);
    });
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadFromRoute();
  }

  get pageTitle(): string {
    if (this.editingTransactionId) {
      return 'Edit Transaction';
    }
    return this.isIncome ? 'Add Income' : 'Add Expense';
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

  private async loadFromRoute(): Promise<void> {
    const transactionId = this.route.snapshot.queryParamMap.get('transactionId') ?? undefined;
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
        await this.router.navigate(['/tabs/add']);
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

      await this.loadCategories(tx.type);

      this.form.patchValue(
        {
          categoryId: tx.categoryId
        },
        { emitEvent: false }
      );

      return;
    }

    const presetType = this.route.snapshot.queryParamMap.get('presetType') as TransactionType | null;
    const type: TransactionType = presetType === 'income' || presetType === 'expense'
      ? presetType
      : (this.form.get('type')?.value ?? 'expense');

    this.form.patchValue({ type }, { emitEvent: false });
    await this.loadCategories(type);
  }

  private async loadCategories(type: TransactionType): Promise<void> {
    this.categories = await this.categoryService.getCategories(type);

    const current = this.form.get('categoryId')?.value;
    const exists = !!current && this.categories.some(c => c.id === current);
    if (!exists) {
      this.form.patchValue({ categoryId: this.categories[0]?.id ?? '' }, { emitEvent: false });
    }
  }

  async save(): Promise<void> {
    if (this.isSaving) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
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

      await this.router.navigate(['/tabs/transactions']);
    } catch (err) {
      console.error(err);
      const toast = await this.toastController.create({
        message: 'Save failed',
        duration: 1500,
        position: 'bottom'
      });
      await toast.present();
    } finally {
      this.isSaving = false;
    }
  }

}
