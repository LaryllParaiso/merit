export type SavingsGoalEventType =
  | 'create'
  | 'add'
  | 'edit'
  | 'complete'
  | 'reopen'
  | 'set_current';

export interface SavingsGoalEvent {
  id: string;
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
  createdAt: Date;
}
