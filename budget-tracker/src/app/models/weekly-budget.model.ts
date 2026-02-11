export interface WeeklyBudget {
  id: string;
  userId: string;
  limitAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  appliesToAllCategories: boolean;
  categoryIds: string[];
}

export interface WeeklyBudgetSummary extends WeeklyBudget {
  weekSpentAmount: number;
  todaySpentAmount: number;
}
