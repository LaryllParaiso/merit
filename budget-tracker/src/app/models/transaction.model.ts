export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
