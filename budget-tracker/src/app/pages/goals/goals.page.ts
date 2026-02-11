import { Component, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { AlertController, IonList, ToastController } from '@ionic/angular';

import { SavingsGoal } from '../../models/savings-goal.model';
import { SavingsGoalService } from '../../services/savings-goal.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  standalone: false,
})
export class GoalsPage {
  @ViewChild('goalList', { read: IonList }) goalList?: IonList;

  isLoading = true;
  isSaving = false;
  isUpdatingGoalId?: string;

  isCreateOpen = false;
  iconOptions: string[] = [
    'phone-portrait',
    'game-controller',
    'headset',
    'airplane',
    'basket',
    'school',
    'football',
    'musical-notes',
    'laptop',
    'color-palette',
    'videocam',
    'car'
  ];

  goals: SavingsGoal[] = [];

  form = this.formBuilder.nonNullable.group({
    name: this.formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
    icon: this.formBuilder.nonNullable.control('phone-portrait', [Validators.required]),
    targetAmount: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(1)]),
    currentAmount: this.formBuilder.control<number | null>(0, [Validators.min(0)]),
    targetDate: this.formBuilder.control<string | null>(null)
  });

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private userService: UserService,
    private savingsGoalService: SavingsGoalService
  ) {}

  async ionViewWillEnter(): Promise<void> {
    const openCreate = this.route.snapshot.queryParamMap.get('openCreate') === '1';
    if (openCreate) {
      this.openCreate();
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { openCreate: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }
    await this.refresh();
  }

  openCreate(): void {
    this.form.reset({
      name: '',
      icon: 'phone-portrait',
      targetAmount: null,
      currentAmount: 0,
      targetDate: null
    });
    this.isCreateOpen = true;
  }

  closeCreate(): void {
    this.isCreateOpen = false;
  }

  async closeSlidingItems(): Promise<void> {
    await this.goalList?.closeSlidingItems();
  }

  selectIcon(icon: string): void {
    this.form.patchValue({ icon });
  }

  trackByIcon(_: number, icon: string): string {
    return icon;
  }

  async refresh(ev?: CustomEvent): Promise<void> {
    this.isLoading = true;
    try {
      const userId = await this.userService.getOrCreateUserId();
      this.goals = await this.savingsGoalService.listGoals(userId);
    } finally {
      this.isLoading = false;
      (ev?.target as any)?.complete?.();
    }
  }

  getProgressPercent(g: SavingsGoal): number {
    const target = Number(g.targetAmount);
    if (!Number.isFinite(target) || target <= 0) {
      return 0;
    }
    const pct = (Number(g.currentAmount) / target) * 100;
    return Number.isFinite(pct) ? pct : 0;
  }

  getProgressValue(g: SavingsGoal): number {
    const target = Number(g.targetAmount);
    if (!Number.isFinite(target) || target <= 0) {
      return 0;
    }
    const ratio = Number(g.currentAmount) / target;
    return Math.max(0, Math.min(1, ratio));
  }

  getProgressColor(g: SavingsGoal): string {
    if (g.isCompleted) {
      return 'var(--ion-color-primary)';
    }

    if (this.isBehindSchedule(g)) {
      return 'var(--ion-color-tertiary)';
    }

    return 'var(--ion-color-secondary)';
  }

  openGoal(g: SavingsGoal): void {
    void this.router.navigate(['/tabs/goals', g.id]);
  }

  private isBehindSchedule(g: SavingsGoal): boolean {
    if (!g.targetDate) {
      return false;
    }

    const target = new Date(`${g.targetDate}T00:00:00.000Z`);
    const start = new Date(g.createdAt);
    const now = new Date();

    const totalMs = target.getTime() - start.getTime();
    if (!Number.isFinite(totalMs) || totalMs <= 0) {
      return now.getTime() > target.getTime();
    }

    const elapsedMs = Math.max(0, Math.min(totalMs, now.getTime() - start.getTime()));
    const expectedRatio = elapsedMs / totalMs;

    const actualRatio = this.getProgressValue(g);
    return actualRatio + 0.05 < expectedRatio;
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
      const userId = await this.userService.getOrCreateUserId();
      const value = this.form.getRawValue();

      await this.savingsGoalService.createGoal({
        userId,
        name: value.name,
        icon: value.icon,
        targetAmount: Number(value.targetAmount),
        currentAmount: Number(value.currentAmount ?? 0),
        targetDate: value.targetDate || undefined
      });

      const toast = await this.toastController.create({
        message: 'Goal saved',
        duration: 1200,
        position: 'bottom'
      });
      await toast.present();

      this.form.reset({
        name: '',
        icon: 'phone-portrait',
        targetAmount: null,
        currentAmount: 0,
        targetDate: null
      });

      this.closeCreate();

      await this.refresh();
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

  async addSavings(g: SavingsGoal): Promise<void> {
    if (this.isUpdatingGoalId) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Add savings',
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: '0.00'
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: (data) => {
            const amount = Number(data?.amount);
            if (!Number.isFinite(amount) || amount <= 0) {
              return false;
            }
            void this.applyAdd(g, amount);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async editGoal(g: SavingsGoal): Promise<void> {
    if (this.isUpdatingGoalId) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Edit goal',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Goal name',
          value: g.name
        },
        {
          name: 'targetAmount',
          type: 'number',
          placeholder: 'Target amount',
          value: String(g.targetAmount ?? '')
        },
        {
          name: 'currentAmount',
          type: 'number',
          placeholder: 'Current amount',
          value: String(g.currentAmount ?? '')
        },
        {
          name: 'targetDate',
          type: 'date',
          value: g.targetDate ?? ''
        }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (data) => {
            const name = String(data?.name ?? '').trim();
            const targetAmount = Number(data?.targetAmount);
            const currentAmount = Number(data?.currentAmount);
            const targetDate = String(data?.targetDate ?? '').trim();

            if (!name || name.length < 2) {
              return false;
            }
            if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
              return false;
            }
            if (!Number.isFinite(currentAmount) || currentAmount < 0) {
              return false;
            }

            void this.applyEdit(g, {
              name,
              targetAmount,
              currentAmount,
              targetDate: targetDate.length > 0 ? targetDate : undefined
            });

            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  private async applyEdit(
    g: SavingsGoal,
    input: { name: string; targetAmount: number; currentAmount: number; targetDate?: string }
  ): Promise<void> {
    this.isUpdatingGoalId = g.id;
    try {
      await this.savingsGoalService.updateGoal({
        goalId: g.id,
        name: input.name,
        targetAmount: input.targetAmount,
        currentAmount: input.currentAmount,
        targetDate: input.targetDate
      });

      await this.refresh();

      const toast = await this.toastController.create({
        message: 'Goal updated',
        duration: 1200,
        position: 'bottom'
      });
      await toast.present();
    } catch (err) {
      console.error(err);
      const toast = await this.toastController.create({
        message: 'Update failed',
        duration: 1500,
        position: 'bottom'
      });
      await toast.present();
    } finally {
      this.isUpdatingGoalId = undefined;
    }
  }

  private async applyAdd(g: SavingsGoal, amount: number): Promise<void> {
    this.isUpdatingGoalId = g.id;
    try {
      await this.savingsGoalService.addToGoal({ goalId: g.id, amountToAdd: amount });
      await this.refresh();

      const toast = await this.toastController.create({
        message: 'Updated',
        duration: 1200,
        position: 'bottom'
      });
      await toast.present();
    } catch (err) {
      console.error(err);
      const toast = await this.toastController.create({
        message: 'Update failed',
        duration: 1500,
        position: 'bottom'
      });
      await toast.present();
    } finally {
      this.isUpdatingGoalId = undefined;
    }
  }

  async confirmDelete(g: SavingsGoal): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Delete goal?',
      message: 'This will remove it permanently.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            void this.deleteGoal(g);
          }
        }
      ]
    });

    await alert.present();
  }

  private async deleteGoal(g: SavingsGoal): Promise<void> {
    if (this.isUpdatingGoalId) {
      return;
    }

    this.isUpdatingGoalId = g.id;
    try {
      await this.savingsGoalService.deleteGoal(g.id);
      await this.refresh();

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
    } finally {
      this.isUpdatingGoalId = undefined;
    }
  }

  trackById(_: number, item: SavingsGoal): string {
    return item.id;
  }
}
