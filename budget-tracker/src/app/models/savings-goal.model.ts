export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  icon?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  isCompleted: boolean;
  createdAt: Date;
}
