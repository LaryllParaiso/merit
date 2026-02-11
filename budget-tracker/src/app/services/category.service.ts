import { Injectable } from '@angular/core';

import { Category, CategoryType } from '../models/category.model';
import { DatabaseService } from './database.service';

type CategoryRow = {
  category_id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  is_default: number;
  user_id: string | null;
};

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private databaseService: DatabaseService) {}

  async seedDefaultCategories(): Promise<void> {
    const defaults: Array<{ id: string; name: string; type: CategoryType; icon: string; color: string }> = [
      { id: 'expense_food', name: 'Food', type: 'expense', icon: 'fast-food', color: '#FA8C16' },
      { id: 'expense_transportation', name: 'Transportation', type: 'expense', icon: 'bus', color: '#4A90E2' },
      { id: 'expense_school_supplies', name: 'School Supplies', type: 'expense', icon: 'school', color: '#4A90E2' },
      { id: 'expense_leisure', name: 'Leisure', type: 'expense', icon: 'game-controller', color: '#52C41A' },
      { id: 'expense_others', name: 'Others', type: 'expense', icon: 'ellipsis-horizontal', color: '#666666' },

      { id: 'income_allowance', name: 'Allowance', type: 'income', icon: 'cash', color: '#52C41A' },
      { id: 'income_gift', name: 'Gift', type: 'income', icon: 'gift', color: '#52C41A' },
      { id: 'income_earnings', name: 'Earnings', type: 'income', icon: 'briefcase', color: '#52C41A' },
      { id: 'income_other', name: 'Other', type: 'income', icon: 'ellipsis-horizontal', color: '#666666' }
    ];

    for (const c of defaults) {
      await this.databaseService.run(
        'INSERT OR IGNORE INTO categories (category_id, name, type, icon, color, is_default, user_id) VALUES (?, ?, ?, ?, ?, 1, NULL)',
        [c.id, c.name, c.type, c.icon, c.color]
      );
    }
  }

  async getCategories(type: CategoryType): Promise<Category[]> {
    const rows = await this.databaseService.query<CategoryRow>(
      'SELECT category_id, name, type, icon, color, is_default, user_id FROM categories WHERE type = ? ORDER BY is_default DESC, name ASC',
      [type]
    );

    return rows.map(r => ({
      id: r.category_id,
      name: r.name,
      type: r.type,
      icon: r.icon,
      color: r.color,
      isDefault: r.is_default === 1,
      userId: r.user_id ?? undefined
    }));
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const rows = await this.databaseService.query<CategoryRow>(
      'SELECT category_id, name, type, icon, color, is_default, user_id FROM categories WHERE category_id = ? LIMIT 1',
      [id]
    );

    const r = rows[0];
    if (!r) {
      return undefined;
    }

    return {
      id: r.category_id,
      name: r.name,
      type: r.type,
      icon: r.icon,
      color: r.color,
      isDefault: r.is_default === 1,
      userId: r.user_id ?? undefined
    };
  }
}
