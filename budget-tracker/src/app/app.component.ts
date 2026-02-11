import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';

import { CategoryService } from './services/category.service';
import { DatabaseService } from './services/database.service';
import { AppNotificationService } from './services/app-notification.service';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private userService: UserService,
    private categoryService: CategoryService,
    private databaseService: DatabaseService,
    private notificationService: AppNotificationService
  ) {
    void this.initializeApp();
  }

  private async initializeApp(): Promise<void> {
    await this.platform.ready();

    try {
      if (Capacitor.getPlatform() !== 'web') {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.show();
      }

      await this.notificationService.initialize();

      await this.databaseService.initialize();

      await this.userService.getOrCreateUserId();
      await this.categoryService.seedDefaultCategories();
    } catch (err) {
      console.error(err);
    }
  }
}
