export type BudgetPeriod = 'weekly' | 'monthly';

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  period: BudgetPeriod;
  limitAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}
