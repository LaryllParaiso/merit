import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

import { Transaction, TransactionType } from '../models/transaction.model';
import { DatabaseService } from './database.service';
import { WeeklyBudgetService } from './weekly-budget.service';

export type TransactionListItem = {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  notes?: string;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
};

type TransactionRow = {
  transaction_id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category_id: string;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  constructor(
    private databaseService: DatabaseService,
    private weeklyBudgetService: WeeklyBudgetService
  ) {}

  async addTransaction(input: {
    userId: string;
    type: TransactionType;
    amount: number;
    categoryId: string;
    date: string;
    notes?: string;
  }): Promise<string> {
    const id = uuidv4();
    const date = input.date.length >= 10 ? input.date.slice(0, 10) : input.date;

    await this.databaseService.run(
      'INSERT INTO transactions (transaction_id, user_id, type, amount, category_id, date, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
      [id, input.userId, input.type, input.amount, input.categoryId, date, input.notes ?? null]
    );

    if (input.type === 'expense') {
      await this.weeklyBudgetService.checkDailyLimitAndNotify({ userId: input.userId, date });
    }

    return id;
  }

  async updateTransaction(input: {
    id: string;
    type: TransactionType;
    amount: number;
    categoryId: string;
    date: string;
    notes?: string;
  }): Promise<void> {
    const date = input.date.length >= 10 ? input.date.slice(0, 10) : input.date;

    const userRows = await this.databaseService.query<{ user_id: string }>(
      'SELECT user_id FROM transactions WHERE transaction_id = ? LIMIT 1',
      [input.id]
    );
    const userId = userRows[0]?.user_id;

    await this.databaseService.run(
      'UPDATE transactions SET type = ?, amount = ?, category_id = ?, date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE transaction_id = ?',
      [input.type, input.amount, input.categoryId, date, input.notes ?? null, input.id]
    );

    if (userId && input.type === 'expense') {
      await this.weeklyBudgetService.checkDailyLimitAndNotify({ userId, date });
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.databaseService.run(
      'DELETE FROM transactions WHERE transaction_id = ?',
      [id]
    );
  }

  async getTransactionById(id: string): Promise<Transaction | undefined> {
    const rows = await this.databaseService.query<TransactionRow>(
      'SELECT transaction_id, user_id, type, amount, category_id, date, notes, created_at, updated_at FROM transactions WHERE transaction_id = ? LIMIT 1',
      [id]
    );

    const r = rows[0];
    if (!r) {
      return undefined;
    }

    return {
      id: r.transaction_id,
      userId: r.user_id,
      type: r.type,
      amount: r.amount,
      categoryId: r.category_id,
      date: r.date,
      notes: r.notes ?? undefined,
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at)
    };
  }

  async listTransactions(userId: string, type?: TransactionType): Promise<TransactionListItem[]> {
    const values: any[] = [userId];
    let where = 't.user_id = ?';

    if (type) {
      where += ' AND t.type = ?';
      values.push(type);
    }

    const sql = `
      SELECT
        t.transaction_id AS id,
        t.type AS type,
        t.amount AS amount,
        t.category_id AS categoryId,
        t.date AS date,
        t.notes AS notes,
        c.name AS categoryName,
        c.icon AS categoryIcon,
        c.color AS categoryColor
      FROM transactions t
      LEFT JOIN categories c ON c.category_id = t.category_id
      WHERE ${where}
      ORDER BY t.date DESC, t.created_at DESC
      LIMIT 500
    `;

    const rows = await this.databaseService.query<TransactionListItem>(sql, values);

    return rows.map(r => ({
      ...r,
      notes: (r as any).notes ?? undefined
    }));
  }

  async getExpenseTotalsByCategory(
    userId: string,
    range?: { startDate: string; endDate: string }
  ): Promise<Array<{ categoryId: string; categoryName: string; categoryColor?: string; total: number }>> {
    const values: any[] = [userId];
    let where = "t.user_id = ? AND t.type = 'expense'";

    if (range) {
      where += ' AND t.date >= ? AND t.date <= ?';
      values.push(range.startDate, range.endDate);
    }

    const sql = `
      SELECT
        t.category_id AS categoryId,
        COALESCE(c.name, t.category_id) AS categoryName,
        c.color AS categoryColor,
        COALESCE(SUM(t.amount), 0) AS total
      FROM transactions t
      LEFT JOIN categories c ON c.category_id = t.category_id
      WHERE ${where}
      GROUP BY t.category_id
      ORDER BY total DESC
    `;

    const rows = await this.databaseService.query<{ categoryId: string; categoryName: string; categoryColor: string | null; total: number }>(
      sql,
      values
    );

    return rows.map(r => ({
      categoryId: r.categoryId,
      categoryName: r.categoryName,
      categoryColor: r.categoryColor ?? undefined,
      total: Number(r.total)
    }));
  }

  async getIncomeExpenseTotals(
    userId: string,
    range?: { startDate: string; endDate: string }
  ): Promise<{ totalIncome: number; totalExpense: number }> {
    const values: any[] = [userId];
    let where = 'user_id = ?';

    if (range) {
      where += ' AND date >= ? AND date <= ?';
      values.push(range.startDate, range.endDate);
    }

    const rows = await this.databaseService.query<{ total_income: number; total_expense: number }>(
      `
        SELECT
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
        FROM transactions
        WHERE ${where}
      `,
      values
    );

    const r = rows[0];
    return {
      totalIncome: Number(r?.total_income ?? 0),
      totalExpense: Number(r?.total_expense ?? 0)
    };
  }

  async getDailyExpenseTotals(
    userId: string,
    range: { startDate: string; endDate: string }
  ): Promise<Array<{ date: string; total: number }>> {
    const rows = await this.databaseService.query<{ date: string; total: number }>(
      `
        SELECT
          date AS date,
          COALESCE(SUM(amount), 0) AS total
        FROM transactions
        WHERE user_id = ? AND type = 'expense' AND date >= ? AND date <= ?
        GROUP BY date
        ORDER BY date ASC
      `,
      [userId, range.startDate, range.endDate]
    );

    return rows.map(r => ({
      date: r.date,
      total: Number(r.total)
    }));
  }

  async listTransactionsForExport(
    userId: string,
    range?: { startDate: string; endDate: string }
  ): Promise<Array<{ date: string; type: TransactionType; categoryName: string; amount: number; notes: string }>> {
    const values: any[] = [userId];
    let where = 't.user_id = ?';

    if (range) {
      where += ' AND t.date >= ? AND t.date <= ?';
      values.push(range.startDate, range.endDate);
    }

    const sql = `
      SELECT
        t.date AS date,
        t.type AS type,
        COALESCE(c.name, t.category_id) AS categoryName,
        t.amount AS amount,
        COALESCE(t.notes, '') AS notes
      FROM transactions t
      LEFT JOIN categories c ON c.category_id = t.category_id
      WHERE ${where}
      ORDER BY t.date ASC, t.created_at ASC
    `;

    const rows = await this.databaseService.query<{ date: string; type: TransactionType; categoryName: string; amount: number; notes: string }>(
      sql,
      values
    );

    return rows.map(r => ({
      date: r.date,
      type: r.type,
      categoryName: r.categoryName,
      amount: Number(r.amount),
      notes: r.notes ?? ''
    }));
  }

  async listRecentTransactions(userId: string, limit = 5): Promise<TransactionListItem[]> {
    const sql = `
      SELECT
        t.transaction_id AS id,
        t.type AS type,
        t.amount AS amount,
        t.category_id AS categoryId,
        t.date AS date,
        t.notes AS notes,
        c.name AS categoryName,
        c.icon AS categoryIcon,
        c.color AS categoryColor
      FROM transactions t
      LEFT JOIN categories c ON c.category_id = t.category_id
      WHERE t.user_id = ?
      ORDER BY t.date DESC, t.created_at DESC
      LIMIT ?
    `;

    const rows = await this.databaseService.query<TransactionListItem>(sql, [userId, limit]);

    return rows.map(r => ({
      ...r,
      notes: (r as any).notes ?? undefined
    }));
  }

  async getBalanceTotals(userId: string): Promise<{ totalIncome: number; totalExpense: number }> {
    const rows = await this.databaseService.query<{ total_income: number; total_expense: number }>(
      `
        SELECT
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expense
        FROM transactions
        WHERE user_id = ?
      `,
      [userId]
    );

    const r = rows[0];
    return {
      totalIncome: Number(r?.total_income ?? 0),
      totalExpense: Number(r?.total_expense ?? 0)
    };
  }

  async getTodaySummary(userId: string, date: string): Promise<{ todayExpense: number; todayCount: number }> {
    const normalized = date.length >= 10 ? date.slice(0, 10) : date;

    const rows = await this.databaseService.query<{ today_expense: number; today_count: number }>(
      `
        SELECT
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS today_expense,
          COUNT(*) AS today_count
        FROM transactions
        WHERE user_id = ? AND date = ?
      `,
      [userId, normalized]
    );

    const r = rows[0];
    return {
      todayExpense: Number(r?.today_expense ?? 0),
      todayCount: Number(r?.today_count ?? 0)
    };
  }
}
