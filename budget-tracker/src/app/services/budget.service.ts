import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

import { Budget, BudgetPeriod } from '../models/budget.model';
import { DatabaseService } from './database.service';

export type BudgetListItem = Budget & {
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  spentAmount: number;
};

type BudgetRow = {
  budget_id: string;
  user_id: string;
  category_id: string;
  period: BudgetPeriod;
  limit_amount: number;
  start_date: string;
  end_date: string;
  is_active: number;
  spent_amount: number;
  categoryName?: string | null;
  categoryIcon?: string | null;
  categoryColor?: string | null;
};

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  constructor(private databaseService: DatabaseService) {}

  private formatLocalDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private getPeriodRange(period: BudgetPeriod, now = new Date()): { startDate: string; endDate: string } {
    if (period === 'weekly') {
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

    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      startDate: this.formatLocalDate(start),
      endDate: this.formatLocalDate(end)
    };
  }

  async createBudget(input: {
    userId: string;
    categoryId: string;
    period: BudgetPeriod;
    limitAmount: number;
  }): Promise<string> {
    const id = uuidv4();
    const { startDate, endDate } = this.getPeriodRange(input.period);

    await this.databaseService.run(
      'UPDATE budgets SET is_active = 0 WHERE user_id = ? AND category_id = ? AND period = ? AND is_active = 1',
      [input.userId, input.categoryId, input.period]
    );

    await this.databaseService.run(
      'INSERT INTO budgets (budget_id, user_id, category_id, period, limit_amount, start_date, end_date, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [id, input.userId, input.categoryId, input.period, input.limitAmount, startDate, endDate]
    );

    return id;
  }

  async updateBudgetLimit(input: { budgetId: string; limitAmount: number }): Promise<void> {
    await this.databaseService.run(
      'UPDATE budgets SET limit_amount = ? WHERE budget_id = ?',
      [input.limitAmount, input.budgetId]
    );
  }

  async switchBudgetPeriod(input: {
    budgetId: string;
    userId: string;
    newPeriod: BudgetPeriod;
  }): Promise<string> {
    const rows = await this.databaseService.query<{ category_id: string; limit_amount: number }>(
      'SELECT category_id, limit_amount FROM budgets WHERE budget_id = ? AND user_id = ? LIMIT 1',
      [input.budgetId, input.userId]
    );

    const current = rows[0];
    if (!current) {
      throw new Error('Budget not found');
    }

    await this.databaseService.run(
      'UPDATE budgets SET is_active = 0 WHERE budget_id = ?',
      [input.budgetId]
    );

    return await this.createBudget({
      userId: input.userId,
      categoryId: current.category_id,
      period: input.newPeriod,
      limitAmount: current.limit_amount
    });
  }

  async listBudgets(userId: string): Promise<BudgetListItem[]> {
    const sql = `
      SELECT
        b.budget_id,
        b.user_id,
        b.category_id,
        b.period,
        b.limit_amount,
        b.start_date,
        b.end_date,
        b.is_active,
        COALESCE(SUM(t.amount), 0) AS spent_amount,
        c.name AS categoryName,
        c.icon AS categoryIcon,
        c.color AS categoryColor
      FROM budgets b
      LEFT JOIN categories c ON c.category_id = b.category_id
      LEFT JOIN transactions t
        ON t.user_id = b.user_id
        AND t.type = 'expense'
        AND t.category_id = b.category_id
        AND t.date >= b.start_date
        AND t.date <= b.end_date
      WHERE b.user_id = ? AND b.is_active = 1
      GROUP BY b.budget_id
      ORDER BY b.period ASC, c.name ASC
    `;

    const rows = await this.databaseService.query<BudgetRow>(sql, [userId]);

    return rows.map(r => ({
      id: r.budget_id,
      userId: r.user_id,
      categoryId: r.category_id,
      period: r.period,
      limitAmount: r.limit_amount,
      startDate: r.start_date,
      endDate: r.end_date,
      isActive: r.is_active === 1,
      spentAmount: r.spent_amount,
      categoryName: r.categoryName ?? undefined,
      categoryIcon: r.categoryIcon ?? undefined,
      categoryColor: r.categoryColor ?? undefined
    }));
  }
}
