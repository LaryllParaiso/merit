import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';

import { SavingsGoal } from '../../../models/savings-goal.model';
import { SavingsGoalEvent } from '../../../models/savings-goal-event.model';
import { SavingsGoalService } from '../../../services/savings-goal.service';

@Component({
  selector: 'app-goal-details',
  templateUrl: './goal-details.page.html',
  styleUrls: ['./goal-details.page.scss'],
  standalone: false,
})
export class GoalDetailsPage {
  isLoading = true;
  isWorking = false;

  goalId = '';
  goal?: SavingsGoal;
  events: SavingsGoalEvent[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private savingsGoalService: SavingsGoalService
  ) {}

  async ionViewWillEnter(): Promise<void> {
    this.goalId = this.route.snapshot.paramMap.get('goalId') ?? '';
    await this.refresh();
  }

  async refresh(ev?: CustomEvent): Promise<void> {
    this.isLoading = true;
    try {
      if (!this.goalId) {
        this.goal = undefined;
        this.events = [];
        return;
      }

      this.goal = await this.savingsGoalService.getGoalById(this.goalId);
      this.events = await this.savingsGoalService.listEventsForGoal(this.goalId);

      if (!this.goal) {
        await this.router.navigate(['/tabs/goals']);
      }
    } finally {
      this.isLoading = false;
      (ev?.target as any)?.complete?.();
    }
  }

  get progressValue(): number {
    if (!this.goal) {
      return 0;
    }
    const target = Number(this.goal.targetAmount);
    if (!Number.isFinite(target) || target <= 0) {
      return 0;
    }
    const ratio = Number(this.goal.currentAmount) / target;
    return Math.max(0, Math.min(1, ratio));
  }

  get progressPercent(): number {
    if (!this.goal) {
      return 0;
    }
    const target = Number(this.goal.targetAmount);
    if (!Number.isFinite(target) || target <= 0) {
      return 0;
    }
    const pct = (Number(this.goal.currentAmount) / target) * 100;
    return Number.isFinite(pct) ? pct : 0;
  }

  get remainingAmount(): number {
    if (!this.goal) {
      return 0;
    }
    return Math.max(0, Number(this.goal.targetAmount) - Number(this.goal.currentAmount));
  }

  get daysRemaining(): number | null {
    if (!this.goal?.targetDate) {
      return null;
    }

    const target = new Date(`${this.goal.targetDate}T00:00:00.000Z`);
    const now = new Date();
    const ms = target.getTime() - now.getTime();
    if (!Number.isFinite(ms)) {
      return null;
    }
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  }

  get requiredPerDay(): number | null {
    const days = this.daysRemaining;
    if (days === null || days <= 0) {
      return null;
    }
    return this.remainingAmount / days;
  }

  get isBehindSchedule(): boolean {
    if (!this.goal?.targetDate) {
      return false;
    }

    const target = new Date(`${this.goal.targetDate}T00:00:00.000Z`);
    const start = new Date(this.goal.createdAt);
    const now = new Date();

    const totalMs = target.getTime() - start.getTime();
    if (!Number.isFinite(totalMs) || totalMs <= 0) {
      return now.getTime() > target.getTime();
    }

    const elapsedMs = Math.max(0, Math.min(totalMs, now.getTime() - start.getTime()));
    const expectedRatio = elapsedMs / totalMs;

    return this.progressValue + 0.05 < expectedRatio;
  }

  get progressColor(): string {
    if (!this.goal) {
      return 'var(--ion-color-secondary)';
    }

    if (this.goal.isCompleted) {
      return 'var(--ion-color-primary)';
    }

    if (this.isBehindSchedule) {
      return 'var(--ion-color-tertiary)';
    }

    return 'var(--ion-color-secondary)';
  }

  async addSavings(): Promise<void> {
    if (!this.goal || this.isWorking) {
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
            void this.applyAdd(amount);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  private async applyAdd(amount: number): Promise<void> {
    if (!this.goal) {
      return;
    }

    this.isWorking = true;
    try {
      await this.savingsGoalService.addToGoal({ goalId: this.goal.id, amountToAdd: amount });
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
      this.isWorking = false;
    }
  }

  async editGoal(): Promise<void> {
    if (!this.goal || this.isWorking) {
      return;
    }

    const g = this.goal;

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

            void this.applyEdit({
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

  private async applyEdit(input: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate?: string;
  }): Promise<void> {
    if (!this.goal) {
      return;
    }

    this.isWorking = true;
    try {
      await this.savingsGoalService.updateGoal({
        goalId: this.goal.id,
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
      this.isWorking = false;
    }
  }

  async toggleCompleted(): Promise<void> {
    if (!this.goal || this.isWorking) {
      return;
    }

    this.isWorking = true;
    try {
      const next = !this.goal.isCompleted;
      await this.savingsGoalService.setGoalCompleted({ goalId: this.goal.id, isCompleted: next });
      await this.refresh();

      const toast = await this.toastController.create({
        message: next ? 'Marked completed' : 'Reopened',
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
      this.isWorking = false;
    }
  }

  formatEventTitle(e: SavingsGoalEvent): string {
    if (e.type === 'create') {
      return 'Created goal';
    }
    if (e.type === 'add') {
      return 'Added savings';
    }
    if (e.type === 'edit') {
      return 'Edited goal';
    }
    if (e.type === 'complete') {
      return 'Marked completed';
    }
    if (e.type === 'reopen') {
      return 'Reopened goal';
    }
    if (e.type === 'set_current') {
      return 'Set current amount';
    }
    return 'Updated';
  }

  trackEventById(_: number, item: SavingsGoalEvent): string {
    return item.id;
  }
}
