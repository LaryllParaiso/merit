import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';

import { Category } from '../../models/category.model';
import { CategoryService } from '../../services/category.service';
import { UserService } from '../../services/user.service';
import { WeeklyBudgetSummary } from '../../models/weekly-budget.model';
import { WeeklyBudgetService } from '../../services/weekly-budget.service';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.page.html',
  styleUrls: ['./budget.page.scss'],
  standalone: false,
})
export class BudgetPage {
  categories: Category[] = [];
  weeklyBudget?: WeeklyBudgetSummary;
  isLoading = false;
  isSaving = false;
  isCreateOpen = false;

  form = this.formBuilder.nonNullable.group({
    appliesToAllCategories: this.formBuilder.nonNullable.control(false),
    categoryIds: this.formBuilder.control<string[]>([]),
    limitAmount: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(0.01)])
  });

  constructor(
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController,
    private userService: UserService,
    private categoryService: CategoryService,
    private weeklyBudgetService: WeeklyBudgetService
  ) {}

  get weeklyLimitAmount(): number {
    return Number(this.weeklyBudget?.limitAmount ?? 0);
  }

  get weeklySpentAmount(): number {
    return Number(this.weeklyBudget?.weekSpentAmount ?? 0);
  }

  get weeklyPercent(): number {
    return this.getPercent(this.weeklySpentAmount, this.weeklyLimitAmount);
  }

  get dailyLimitAmount(): number {
    return this.weeklyBudgetService.getDailyLimit(this.weeklyLimitAmount);
  }

  get todaySpentAmount(): number {
    return Number(this.weeklyBudget?.todaySpentAmount ?? 0);
  }

  async ionViewWillEnter(): Promise<void> {
    await this.refresh();
  }

  openCreate(): void {
    const selectedIds = this.weeklyBudget?.appliesToAllCategories
      ? []
      : (this.weeklyBudget?.categoryIds ?? []);

    this.form.reset(
      {
        appliesToAllCategories: this.weeklyBudget?.appliesToAllCategories ?? false,
        categoryIds: selectedIds,
        limitAmount: this.weeklyBudget?.limitAmount ?? null
      },
      { emitEvent: false }
    );
    this.isCreateOpen = true;
  }

  closeCreate(): void {
    this.isCreateOpen = false;
    this.isSaving = false;
  }

  async confirmDeleteWeeklyBudget(): Promise<void> {
    if (!this.weeklyBudget) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Delete weekly budget?',
      message: 'This will remove your current weekly budget.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            void this.deleteWeeklyBudget();
          }
        }
      ]
    });

    await alert.present();
  }

  async refresh(ev?: CustomEvent): Promise<void> {
    this.isLoading = true;
    try {
      await this.loadCategories();
      await this.loadWeeklyBudget();
    } finally {
      this.isLoading = false;
      (ev?.target as any)?.complete?.();
    }
  }

  private async loadCategories(): Promise<void> {
    this.categories = await this.categoryService.getCategories('expense');
  }

  private async loadWeeklyBudget(): Promise<void> {
    const userId = await this.userService.getOrCreateUserId();
    this.weeklyBudget = await this.weeklyBudgetService.getWeeklyBudgetSummary(userId, this.formatLocalDate(new Date()));
  }

  getWeekProgressValue(): number {
    const limit = this.weeklyLimitAmount;
    if (!Number.isFinite(limit) || limit <= 0) {
      return 0;
    }
    const ratio = this.weeklySpentAmount / limit;
    return Math.max(0, Math.min(1, ratio));
  }

  getWeekProgressColor(): string {
    return this.getColorForPercent(this.weeklyPercent);
  }

  getTodayProgressValue(): number {
    const limit = this.dailyLimitAmount;
    if (!Number.isFinite(limit) || limit <= 0) {
      return 0;
    }
    const ratio = this.todaySpentAmount / limit;
    return Math.max(0, Math.min(1, ratio));
  }

  getTodayProgressColor(): string {
    const pct = this.getPercent(this.todaySpentAmount, this.dailyLimitAmount);
    return this.getColorForPercent(pct);
  }

  getSelectedCategoryNames(): string {
    if (!this.weeklyBudget) {
      return '';
    }
    if (this.weeklyBudget.appliesToAllCategories) {
      return 'All categories';
    }
    const map = new Map(this.categories.map(c => [c.id, c.name] as const));
    return (this.weeklyBudget.categoryIds ?? []).map(id => map.get(id) ?? id).join(', ');
  }

  private getPercent(spent: number, limit: number): number {
    if (!Number.isFinite(limit) || limit <= 0) {
      return 0;
    }
    const pct = (Number(spent) / Number(limit)) * 100;
    return Number.isFinite(pct) ? pct : 0;
  }

  private getColorForPercent(percent: number): string {
    if (percent > 100) {
      return 'var(--ion-color-danger)';
    }
    if (percent >= 90) {
      return 'var(--ion-color-tertiary)';
    }
    if (percent >= 70) {
      return 'rgba(var(--ion-color-primary-rgb), 0.75)';
    }
    return 'var(--ion-color-secondary)';
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

      if (!value.appliesToAllCategories && (!value.categoryIds || value.categoryIds.length === 0)) {
        const toast = await this.toastController.create({
          message: 'Select at least one category',
          duration: 1500,
          position: 'bottom'
        });
        await toast.present();
        return;
      }

      await this.weeklyBudgetService.upsertWeeklyBudget({
        userId,
        limitAmount: Number(value.limitAmount),
        appliesToAllCategories: value.appliesToAllCategories,
        categoryIds: value.categoryIds ?? []
      });

      const toast = await this.toastController.create({
        message: 'Weekly budget saved',
        duration: 1200,
        position: 'bottom'
      });
      await toast.present();

      this.closeCreate();
      await this.loadWeeklyBudget();
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

  private async deleteWeeklyBudget(): Promise<void> {
    try {
      const userId = await this.userService.getOrCreateUserId();
      await this.weeklyBudgetService.deleteActiveWeeklyBudget(userId);
      await this.loadWeeklyBudget();

      const toast = await this.toastController.create({
        message: 'Weekly budget deleted',
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

  get dailyLimitPreview(): number {
    const raw = Number(this.form.get('limitAmount')?.value ?? 0);
    return this.weeklyBudgetService.getDailyLimit(raw);
  }

  private formatLocalDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }
}
