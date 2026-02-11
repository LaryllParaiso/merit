import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

import { SavingsGoal } from '../models/savings-goal.model';
import { SavingsGoalEvent, SavingsGoalEventType } from '../models/savings-goal-event.model';
import { DatabaseService } from './database.service';

type SavingsGoalRow = {
  goal_id: string;
  user_id: string;
  name: string;
  icon?: string | null;
  target_amount: number;
  current_amount: number;
  target_date?: string | null;
  is_completed: number;
  created_at: string;
};

type SavingsGoalEventRow = {
  event_id: string;
  goal_id: string;
  user_id: string;
  event_type: SavingsGoalEventType;
  amount_delta?: number | null;
  old_current_amount?: number | null;
  new_current_amount?: number | null;
  old_target_amount?: number | null;
  new_target_amount?: number | null;
  old_target_date?: string | null;
  new_target_date?: string | null;
  note?: string | null;
  created_at: string;
};

@Injectable({
  providedIn: 'root'
})
export class SavingsGoalService {
  constructor(private databaseService: DatabaseService) {}

  private toGoal(row: SavingsGoalRow): SavingsGoal {
    return {
      id: row.goal_id,
      userId: row.user_id,
      name: row.name,
      icon: row.icon ?? undefined,
      targetAmount: Number(row.target_amount),
      currentAmount: Number(row.current_amount),
      targetDate: row.target_date ?? undefined,
      isCompleted: row.is_completed === 1,
      createdAt: this.parseCreatedAt(row.created_at)
    };
  }

  private toEvent(row: SavingsGoalEventRow): SavingsGoalEvent {
    return {
      id: row.event_id,
      goalId: row.goal_id,
      userId: row.user_id,
      type: row.event_type,
      amountDelta: row.amount_delta ?? undefined,
      oldCurrentAmount: row.old_current_amount ?? undefined,
      newCurrentAmount: row.new_current_amount ?? undefined,
      oldTargetAmount: row.old_target_amount ?? undefined,
      newTargetAmount: row.new_target_amount ?? undefined,
      oldTargetDate: row.old_target_date ?? undefined,
      newTargetDate: row.new_target_date ?? undefined,
      note: row.note ?? undefined,
      createdAt: this.parseCreatedAt(row.created_at)
    };
  }

  private async createEvent(input: {
    goalId: string;
    userId: string;
    type: SavingsGoalEventType;
    amountDelta?: number;
    oldCurrentAmount?: number;
    newCurrentAmount?: number;
    oldTargetAmount?: number;
    newTargetAmount?: number;
    oldTargetDate?: string;
    newTargetDate?: string;
    note?: string;
  }): Promise<void> {
    const id = uuidv4();

    await this.databaseService.run(
      `
        INSERT INTO savings_goal_events (
          event_id,
          goal_id,
          user_id,
          event_type,
          amount_delta,
          old_current_amount,
          new_current_amount,
          old_target_amount,
          new_target_amount,
          old_target_date,
          new_target_date,
          note
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        input.goalId,
        input.userId,
        input.type,
        input.amountDelta ?? null,
        input.oldCurrentAmount ?? null,
        input.newCurrentAmount ?? null,
        input.oldTargetAmount ?? null,
        input.newTargetAmount ?? null,
        input.oldTargetDate ?? null,
        input.newTargetDate ?? null,
        input.note ?? null
      ]
    );
  }

  async createGoal(input: {
    userId: string;
    name: string;
    icon?: string;
    targetAmount: number;
    currentAmount?: number;
    targetDate?: string;
  }): Promise<string> {
    const id = uuidv4();
    const currentAmount = Number(input.currentAmount ?? 0);
    const isCompleted = currentAmount >= Number(input.targetAmount) ? 1 : 0;

    await this.databaseService.run(
      'INSERT INTO savings_goals (goal_id, user_id, name, icon, target_amount, current_amount, target_date, is_completed) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        input.userId,
        input.name.trim(),
        input.icon ?? null,
        Number(input.targetAmount),
        currentAmount,
        input.targetDate ?? null,
        isCompleted
      ]
    );

    await this.createEvent({
      goalId: id,
      userId: input.userId,
      type: 'create',
      newCurrentAmount: currentAmount,
      newTargetAmount: Number(input.targetAmount),
      newTargetDate: input.targetDate
    });

    return id;
  }

  async getGoalById(goalId: string): Promise<SavingsGoal | undefined> {
    const rows = await this.databaseService.query<SavingsGoalRow>(
      `
        SELECT
          goal_id,
          user_id,
          name,
          icon,
          target_amount,
          current_amount,
          target_date,
          is_completed,
          created_at
        FROM savings_goals
        WHERE goal_id = ?
        LIMIT 1
      `,
      [goalId]
    );

    const row = rows[0];
    return row ? this.toGoal(row) : undefined;
  }

  async listGoals(userId: string): Promise<SavingsGoal[]> {
    const rows = await this.databaseService.query<SavingsGoalRow>(
      `
        SELECT
          goal_id,
          user_id,
          name,
          icon,
          target_amount,
          current_amount,
          target_date,
          is_completed,
          created_at
        FROM savings_goals
        WHERE user_id = ?
        ORDER BY (target_date IS NULL) ASC, target_date ASC, created_at DESC
      `,
      [userId]
    );

    return rows.map(r => this.toGoal(r));
  }

  async listEventsForGoal(goalId: string): Promise<SavingsGoalEvent[]> {
    const rows = await this.databaseService.query<SavingsGoalEventRow>(
      `
        SELECT
          event_id,
          goal_id,
          user_id,
          event_type,
          amount_delta,
          old_current_amount,
          new_current_amount,
          old_target_amount,
          new_target_amount,
          old_target_date,
          new_target_date,
          note,
          created_at
        FROM savings_goal_events
        WHERE goal_id = ?
        ORDER BY created_at DESC
      `,
      [goalId]
    );

    return rows.map(r => this.toEvent(r));
  }

  private parseCreatedAt(createdAt: string): Date {
    const raw = String(createdAt ?? '').trim();
    const asIso = raw.includes('T') ? raw : raw.replace(' ', 'T');
    const parsed = new Date(asIso);
    if (Number.isFinite(parsed.getTime())) {
      return parsed;
    }

    const parsedUtc = new Date(`${asIso}Z`);
    if (Number.isFinite(parsedUtc.getTime())) {
      return parsedUtc;
    }

    return new Date();
  }

  async addToGoal(input: { goalId: string; amountToAdd: number }): Promise<void> {
    const add = Number(input.amountToAdd);
    if (!Number.isFinite(add) || add <= 0) {
      throw new Error('Invalid amount');
    }

    const before = await this.getGoalById(input.goalId);
    if (!before) {
      throw new Error('Goal not found');
    }

    const oldCurrent = Number(before.currentAmount);
    const newCurrent = oldCurrent + add;
    const willComplete = newCurrent >= Number(before.targetAmount);

    await this.databaseService.run(
      `
        UPDATE savings_goals
        SET
          current_amount = current_amount + ?,
          is_completed = CASE WHEN (current_amount + ?) >= target_amount THEN 1 ELSE is_completed END
        WHERE goal_id = ?
      `,
      [add, add, input.goalId]
    );

    await this.createEvent({
      goalId: input.goalId,
      userId: before.userId,
      type: 'add',
      amountDelta: add,
      oldCurrentAmount: oldCurrent,
      newCurrentAmount: newCurrent
    });

    if (!before.isCompleted && willComplete) {
      await this.createEvent({
        goalId: input.goalId,
        userId: before.userId,
        type: 'complete'
      });
    }
  }

  async setCurrentAmount(input: { goalId: string; currentAmount: number }): Promise<void> {
    const amt = Number(input.currentAmount);
    if (!Number.isFinite(amt) || amt < 0) {
      throw new Error('Invalid amount');
    }

    const before = await this.getGoalById(input.goalId);
    if (!before) {
      throw new Error('Goal not found');
    }

    const willComplete = amt >= Number(before.targetAmount);

    await this.databaseService.run(
      `
        UPDATE savings_goals
        SET
          current_amount = ?,
          is_completed = CASE WHEN ? >= target_amount THEN 1 ELSE 0 END
        WHERE goal_id = ?
      `,
      [amt, amt, input.goalId]
    );

    await this.createEvent({
      goalId: input.goalId,
      userId: before.userId,
      type: 'set_current',
      oldCurrentAmount: Number(before.currentAmount),
      newCurrentAmount: amt
    });

    if (!before.isCompleted && willComplete) {
      await this.createEvent({ goalId: input.goalId, userId: before.userId, type: 'complete' });
    }
    if (before.isCompleted && !willComplete) {
      await this.createEvent({ goalId: input.goalId, userId: before.userId, type: 'reopen' });
    }
  }

  async updateGoal(input: {
    goalId: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate?: string;
  }): Promise<void> {
    const targetAmount = Number(input.targetAmount);
    const currentAmount = Number(input.currentAmount);

    if (!input.name || input.name.trim().length < 2) {
      throw new Error('Invalid name');
    }
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      throw new Error('Invalid target amount');
    }
    if (!Number.isFinite(currentAmount) || currentAmount < 0) {
      throw new Error('Invalid current amount');
    }

    const before = await this.getGoalById(input.goalId);
    if (!before) {
      throw new Error('Goal not found');
    }

    const willComplete = currentAmount >= targetAmount;
    const isCompleted = willComplete ? 1 : 0;

    await this.databaseService.run(
      `
        UPDATE savings_goals
        SET
          name = ?,
          target_amount = ?,
          current_amount = ?,
          target_date = ?,
          is_completed = ?
        WHERE goal_id = ?
      `,
      [input.name.trim(), targetAmount, currentAmount, input.targetDate ?? null, isCompleted, input.goalId]
    );

    await this.createEvent({
      goalId: input.goalId,
      userId: before.userId,
      type: 'edit',
      oldCurrentAmount: Number(before.currentAmount),
      newCurrentAmount: currentAmount,
      oldTargetAmount: Number(before.targetAmount),
      newTargetAmount: targetAmount,
      oldTargetDate: before.targetDate,
      newTargetDate: input.targetDate
    });

    if (!before.isCompleted && willComplete) {
      await this.createEvent({ goalId: input.goalId, userId: before.userId, type: 'complete' });
    }
    if (before.isCompleted && !willComplete) {
      await this.createEvent({ goalId: input.goalId, userId: before.userId, type: 'reopen' });
    }
  }

  async setGoalCompleted(input: { goalId: string; isCompleted: boolean }): Promise<void> {
    const before = await this.getGoalById(input.goalId);
    if (!before) {
      throw new Error('Goal not found');
    }

    const isCompleted = input.isCompleted ? 1 : 0;

    await this.databaseService.run(
      'UPDATE savings_goals SET is_completed = ? WHERE goal_id = ?',
      [isCompleted, input.goalId]
    );

    await this.createEvent({
      goalId: input.goalId,
      userId: before.userId,
      type: input.isCompleted ? 'complete' : 'reopen'
    });
  }

  async deleteGoal(goalId: string): Promise<void> {
    await this.databaseService.run('DELETE FROM savings_goal_events WHERE goal_id = ?', [goalId]);
    await this.databaseService.run('DELETE FROM savings_goals WHERE goal_id = ?', [goalId]);
  }
}
