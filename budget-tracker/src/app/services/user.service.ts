import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

import { DatabaseService } from './database.service';

const USER_ID_STORAGE_KEY = 'merit_user_id';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userId?: string;

  constructor(private databaseService: DatabaseService) {}

  async getOrCreateUserId(): Promise<string> {
    if (this.userId) {
      return this.userId;
    }

    const stored = localStorage.getItem(USER_ID_STORAGE_KEY);
    const id = stored && stored.length > 0 ? stored : uuidv4();

    localStorage.setItem(USER_ID_STORAGE_KEY, id);
    this.userId = id;

    await this.databaseService.run(
      'INSERT OR IGNORE INTO users (user_id, name) VALUES (?, ?)',
      [id, 'Student']
    );

    return id;
  }
}
