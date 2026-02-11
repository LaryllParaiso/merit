import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade_level INTEGER,
  currency TEXT DEFAULT 'PHP',
  week_start_day INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  category_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('income', 'expense')),
  icon TEXT,
  color TEXT,
  is_default INTEGER DEFAULT 0,
  user_id TEXT,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS transactions (
  transaction_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT CHECK(type IN ('income', 'expense')),
  amount REAL NOT NULL,
  category_id TEXT NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE IF NOT EXISTS budgets (
  budget_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  period TEXT CHECK(period IN ('weekly', 'monthly')),
  limit_amount REAL NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE IF NOT EXISTS weekly_budgets (
  weekly_budget_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  limit_amount REAL NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  applies_all_categories INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS weekly_budget_categories (
  weekly_budget_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  PRIMARY KEY (weekly_budget_id, category_id),
  FOREIGN KEY (weekly_budget_id) REFERENCES weekly_budgets(weekly_budget_id),
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE IF NOT EXISTS savings_goals (
  goal_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  target_amount REAL NOT NULL,
  current_amount REAL DEFAULT 0,
  target_date DATE,
  is_completed INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS savings_goal_events (
  event_id TEXT PRIMARY KEY,
  goal_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  amount_delta REAL,
  old_current_amount REAL,
  new_current_amount REAL,
  old_target_amount REAL,
  new_target_amount REAL,
  old_target_date DATE,
  new_target_date DATE,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_active ON budgets(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_weekly_budgets_user_active ON weekly_budgets(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_weekly_budget_categories_budget ON weekly_budget_categories(weekly_budget_id);
CREATE INDEX IF NOT EXISTS idx_goal_events_goal_time ON savings_goal_events(goal_id, created_at);
`;

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db?: SQLiteDBConnection;
  private initialized = false;
  private platform = Capacitor.getPlatform();

  private async ensureSavingsGoalsIconColumn(): Promise<void> {
    if (!this.db) {
      return;
    }

    try {
      const res = await this.db.query('PRAGMA table_info(savings_goals)');
      const cols = (res.values ?? []) as Array<{ name?: string }>;
      const hasIcon = cols.some(c => c.name === 'icon');
      if (!hasIcon) {
        await this.db.execute('ALTER TABLE savings_goals ADD COLUMN icon TEXT');
      }
    } catch {
      // ignore
    }
  }

  private async ensureJeepSqliteWebComponent(): Promise<void> {
    if (this.platform !== 'web') {
      return;
    }

    const existingEl = document.querySelector('jeep-sqlite');
    if (!existingEl) {
      const el = document.createElement('jeep-sqlite');
      el.setAttribute('autoSave', 'true');
      document.body.appendChild(el);
    }

    if (!customElements.get('jeep-sqlite')) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'assets/jeep-sqlite/jeep-sqlite.esm.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load jeep-sqlite script'));
        document.head.appendChild(script);
      });
    }

    await customElements.whenDefined('jeep-sqlite');
  }

  private async persistIfWeb(): Promise<void> {
    if (this.platform !== 'web') {
      return;
    }

    await this.sqlite.saveToStore('merit');
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.platform === 'web') {
      await this.ensureJeepSqliteWebComponent();
      await this.sqlite.initWebStore();
    }

    this.db = await this.sqlite.createConnection('merit', false, 'no-encryption', 1, false);
    await this.db.open();
    await this.db.execute(SCHEMA_SQL);

    await this.ensureSavingsGoalsIconColumn();
    await this.persistIfWeb();

    this.initialized = true;
  }

  async execute(statements: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    await this.db.execute(statements);
    await this.persistIfWeb();
  }

  async run(statement: string, values: any[] = []): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    await this.db.run(statement, values);
    await this.persistIfWeb();
  }

  async query<T = any>(statement: string, values: any[] = []): Promise<T[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const res = await this.db.query(statement, values);
    return (res.values ?? []) as T[];
  }
}
