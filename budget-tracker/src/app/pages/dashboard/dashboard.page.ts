import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { TransactionType } from '../../models/transaction.model';
import { SavingsGoal } from '../../models/savings-goal.model';
import { WeeklyBudgetSummary } from '../../models/weekly-budget.model';
import { SavingsGoalService } from '../../services/savings-goal.service';
import { TransactionService } from '../../services/transaction.service';
import { TransactionListItem } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { WeeklyBudgetService } from '../../services/weekly-budget.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage {
  isLoading = true;
  totalIncome = 0;
  totalExpense = 0;
  balance = 0;
  todayExpense = 0;
  todayCount = 0;
  todayDate = this.formatLocalDate(new Date());
  weeklyBudget?: WeeklyBudgetSummary;
  recentTransactions: TransactionListItem[] = [];
  goals: SavingsGoal[] = [];

  constructor(
    private router: Router,
    private userService: UserService,
    private weeklyBudgetService: WeeklyBudgetService,
    private savingsGoalService: SavingsGoalService,
    private transactionService: TransactionService
  ) {}

  async ionViewWillEnter(): Promise<void> {
    await this.refresh();
  }

  async refresh(ev?: CustomEvent): Promise<void> {
    this.isLoading = true;
    try {
      const userId = await this.userService.getOrCreateUserId();
      this.todayDate = this.formatLocalDate(new Date());

      const totals = await this.transactionService.getBalanceTotals(userId);
      this.totalIncome = totals.totalIncome;
      this.totalExpense = totals.totalExpense;
      this.balance = this.totalIncome - this.totalExpense;

      const today = await this.transactionService.getTodaySummary(userId, this.todayDate);
      this.todayExpense = today.todayExpense;
      this.todayCount = today.todayCount;

      this.weeklyBudget = await this.weeklyBudgetService.getWeeklyBudgetSummary(userId, this.todayDate);
      this.recentTransactions = await this.transactionService.listRecentTransactions(userId, 5);
      this.goals = await this.savingsGoalService.listGoals(userId);
    } finally {
      this.isLoading = false;
      (ev?.target as any)?.complete?.();
    }
  }

  goToBudgets(): void {
    void this.router.navigate(['/tabs/budget']);
  }

  goToTransactions(): void {
    void this.router.navigate(['/tabs/transactions']);
  }

  goToGoals(): void {
    void this.router.navigate(['/tabs/goals']);
  }

  openCreateGoal(): void {
    void this.router.navigate(['/tabs/goals'], { queryParams: { openCreate: '1' } });
  }

  openTransaction(tx: TransactionListItem): void {
    void this.router.navigate(['/tabs/transactions'], { queryParams: { focusTxId: tx.id } });
  }

  quickAdd(type: TransactionType): void {
    void this.router.navigate(['/tabs/add'], { queryParams: { presetType: type } });
  }

  getWeeklyBudgetPercent(): number {
    const limit = Number(this.weeklyBudget?.limitAmount ?? 0);
    if (!Number.isFinite(limit) || limit <= 0) {
      return 0;
    }
    const pct = (Number(this.weeklyBudget?.weekSpentAmount ?? 0) / limit) * 100;
    return Number.isFinite(pct) ? pct : 0;
  }

  getWeeklyBudgetProgressValue(): number {
    const limit = Number(this.weeklyBudget?.limitAmount ?? 0);
    if (!Number.isFinite(limit) || limit <= 0) {
      return 0;
    }
    const ratio = Number(this.weeklyBudget?.weekSpentAmount ?? 0) / limit;
    return Math.max(0, Math.min(1, ratio));
  }

  getWeeklyBudgetProgressColor(): string {
    const percent = this.getWeeklyBudgetPercent();
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

  getGoalProgressValue(g: SavingsGoal): number {
    const target = Number(g.targetAmount);
    if (!Number.isFinite(target) || target <= 0) {
      return 0;
    }
    const ratio = Number(g.currentAmount) / target;
    return Math.max(0, Math.min(1, ratio));
  }

  getGoalPercent(g: SavingsGoal): number {
    const target = Number(g.targetAmount);
    if (!Number.isFinite(target) || target <= 0) {
      return 0;
    }
    const pct = (Number(g.currentAmount) / target) * 100;
    return Number.isFinite(pct) ? pct : 0;
  }

  getGoalProgressColor(g: SavingsGoal): string {
    const pct = this.getGoalPercent(g);
    if (g.isCompleted) {
      return 'var(--ion-color-primary)';
    }
    if (pct >= 70) {
      return 'var(--ion-color-secondary)';
    }
    if (pct >= 40) {
      return 'rgba(var(--ion-color-primary-rgb), 0.75)';
    }
    return 'var(--ion-color-tertiary)';
  }

  get balanceColor(): string {
    return this.balance >= 0 ? 'var(--ion-color-secondary)' : 'var(--ion-color-danger)';
  }

  private formatLocalDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }
}
