import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

import { DatabaseService } from './database.service';
import { WeeklyBudget, WeeklyBudgetSummary } from '../models/weekly-budget.model';
import { AppNotificationService } from './app-notification.service';

type WeeklyBudgetRow = {
  weekly_budget_id: string;
  user_id: string;
  limit_amount: number;
  start_date: string;
  end_date: string;
  applies_all_categories: number;
  is_active: number;
};

@Injectable({
  providedIn: 'root'
})
export class WeeklyBudgetService {
  constructor(
    private databaseService: DatabaseService,
    private notificationService: AppNotificationService
  ) {}

  private formatLocalDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  getCurrentWeekRange(now = new Date()): { startDate: string; endDate: string } {
    const weekStartDay = 1;
    const day = now.getDay();
    const daysSinceStart = (day - weekStartDay + 7) % 7;

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - daysSinceStart);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
      startDate: this.formatLocalDate(start),
      endDate: this.formatLocalDate(end)
    };
  }

  async upsertWeeklyBudget(input: {
    userId: string;
    limitAmount: number;
    appliesToAllCategories: boolean;
    categoryIds: string[];
  }): Promise<string> {
    const id = uuidv4();
    const { startDate, endDate } = this.getCurrentWeekRange();

    await this.databaseService.run('UPDATE weekly_budgets SET is_active = 0 WHERE user_id = ? AND is_active = 1', [
      input.userId
    ]);

    await this.databaseService.run(
      'INSERT INTO weekly_budgets (weekly_budget_id, user_id, limit_amount, start_date, end_date, applies_all_categories, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [id, input.userId, input.limitAmount, startDate, endDate, input.appliesToAllCategories ? 1 : 0]
    );

    if (!input.appliesToAllCategories) {
      const unique = Array.from(new Set(input.categoryIds)).filter(c => c && c.length > 0);
      for (const categoryId of unique) {
        await this.databaseService.run(
          'INSERT OR IGNORE INTO weekly_budget_categories (weekly_budget_id, category_id) VALUES (?, ?)',
          [id, categoryId]
        );
      }
    }

    return id;
  }

  async getActiveWeeklyBudget(userId: string): Promise<WeeklyBudget | undefined> {
    const rows = await this.databaseService.query<WeeklyBudgetRow>(
      'SELECT weekly_budget_id, user_id, limit_amount, start_date, end_date, applies_all_categories, is_active FROM weekly_budgets WHERE user_id = ? AND is_active = 1 ORDER BY start_date DESC LIMIT 1',
      [userId]
    );

    const r = rows[0];
    if (!r) {
      return undefined;
    }

    const appliesToAllCategories = r.applies_all_categories === 1;
    const categoryIds = appliesToAllCategories
      ? []
      : await this.databaseService
          .query<{ category_id: string }>(
            'SELECT category_id FROM weekly_budget_categories WHERE weekly_budget_id = ? ORDER BY category_id ASC',
            [r.weekly_budget_id]
          )
          .then(list => list.map(x => x.category_id));

    const currentRange = this.getCurrentWeekRange();
    const isCurrentWeek = r.start_date === currentRange.startDate && r.end_date === currentRange.endDate;
    if (!isCurrentWeek) {
      await this.upsertWeeklyBudget({
        userId,
        limitAmount: Number(r.limit_amount),
        appliesToAllCategories,
        categoryIds
      });

      return await this.getActiveWeeklyBudget(userId);
    }

    return {
      id: r.weekly_budget_id,
      userId: r.user_id,
      limitAmount: r.limit_amount,
      startDate: r.start_date,
      endDate: r.end_date,
      isActive: r.is_active === 1,
      appliesToAllCategories,
      categoryIds
    };
  }

  async getWeeklyBudgetSummary(userId: string, todayIso?: string): Promise<WeeklyBudgetSummary | undefined> {
    const budget = await this.getActiveWeeklyBudget(userId);
    if (!budget) {
      return undefined;
    }

    const today = (todayIso && todayIso.length >= 10 ? todayIso.slice(0, 10) : this.formatLocalDate(new Date()));

    const weekSpentAmount = await this.getSpentAmount({
      userId,
      startDate: budget.startDate,
      endDate: budget.endDate,
      appliesToAllCategories: budget.appliesToAllCategories,
      budgetId: budget.id
    });

    const todaySpentAmount = await this.getSpentAmount({
      userId,
      startDate: today,
      endDate: today,
      appliesToAllCategories: budget.appliesToAllCategories,
      budgetId: budget.id
    });

    return {
      ...budget,
      weekSpentAmount,
      todaySpentAmount
    };
  }

  getDailyLimit(weeklyLimit: number): number {
    const value = Number(weeklyLimit) / 7;
    return Number.isFinite(value) ? value : 0;
  }

  async checkDailyLimitAndNotify(input: { userId: string; date: string }): Promise<void> {
    const summary = await this.getWeeklyBudgetSummary(input.userId, input.date);
    if (!summary) {
      return;
    }

    const dailyLimit = this.getDailyLimit(summary.limitAmount);
    if (!Number.isFinite(dailyLimit) || dailyLimit <= 0) {
      return;
    }

    if (Number(summary.todaySpentAmount) > dailyLimit) {
      await this.notificationService.notifyDailyBudgetExceeded({
        date: input.date,
        spentAmount: Number(summary.todaySpentAmount),
        dailyLimit
      });
    }
  }

  async deleteActiveWeeklyBudget(userId: string): Promise<void> {
    const rows = await this.databaseService.query<{ weekly_budget_id: string }>(
      'SELECT weekly_budget_id FROM weekly_budgets WHERE user_id = ? AND is_active = 1 ORDER BY start_date DESC LIMIT 1',
      [userId]
    );

    const id = rows[0]?.weekly_budget_id;
    if (!id) {
      return;
    }

    await this.databaseService.run('DELETE FROM weekly_budget_categories WHERE weekly_budget_id = ?', [id]);
    await this.databaseService.run('UPDATE weekly_budgets SET is_active = 0 WHERE weekly_budget_id = ?', [id]);
  }

  private async getSpentAmount(input: {
    userId: string;
    startDate: string;
    endDate: string;
    appliesToAllCategories: boolean;
    budgetId: string;
  }): Promise<number> {
    if (input.appliesToAllCategories) {
      const rows = await this.databaseService.query<{ total: number }>(
        `
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM transactions
        WHERE user_id = ?
          AND type = 'expense'
          AND date >= ?
          AND date <= ?
        `,
        [input.userId, input.startDate, input.endDate]
      );
      return Number(rows[0]?.total ?? 0);
    }

    const rows = await this.databaseService.query<{ total: number }>(
      `
      SELECT COALESCE(SUM(t.amount), 0) AS total
      FROM transactions t
      WHERE t.user_id = ?
        AND t.type = 'expense'
        AND t.date >= ?
        AND t.date <= ?
        AND t.category_id IN (
          SELECT category_id
          FROM weekly_budget_categories
          WHERE weekly_budget_id = ?
        )
      `,
      [input.userId, input.startDate, input.endDate, input.budgetId]
    );

    return Number(rows[0]?.total ?? 0);
  }
}
