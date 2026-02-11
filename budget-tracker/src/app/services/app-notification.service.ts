import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Share } from '@capacitor/share';

@Injectable({
  providedIn: 'root'
})
export class AppNotificationService {
  private readonly weeklyMotivationId = 9001;
  private readonly channelId = 'budget_alerts';
  private actionListenerAttached = false;

  async initialize(): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
      return;
    }

    if (!this.actionListenerAttached) {
      this.actionListenerAttached = true;

      try {
        await LocalNotifications.addListener('localNotificationActionPerformed', async (event) => {
          const extra: any = (event as any)?.notification?.extra;
          if (!extra || extra.action !== 'openFile' || !extra.uri) {
            return;
          }

          try {
            await Share.share({
              title: extra.title ?? 'Open file',
              text: extra.title ?? '',
              files: [String(extra.uri)],
              dialogTitle: 'Open CSV'
            });
          } catch {
          }
        });
      } catch {
      }
    }

    try {
      await LocalNotifications.requestPermissions();
    } catch {
    }

    try {
      await LocalNotifications.createChannel({
        id: this.channelId,
        name: 'Budget Alerts',
        description: 'Notifications about budgets and spending'
      });
    } catch {
    }

    await this.scheduleWeeklyMotivation();
  }

  async notifyOneOff(input: { title: string; body: string; extra?: any }): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
      return;
    }

    try {
      const status = await LocalNotifications.checkPermissions();
      if (status.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }
    } catch {
    }

    try {
      await LocalNotifications.createChannel({
        id: this.channelId,
        name: 'Budget Alerts',
        description: 'Notifications about budgets and spending'
      });
    } catch {
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: this.getOneOffNotificationId(),
          title: input.title,
          body: input.body,
          extra: input.extra,
          channelId: this.channelId,
          schedule: {
            at: new Date(Date.now() + 750),
            allowWhileIdle: true
          }
        }
      ]
    });
  }

  async notifyDailyBudgetExceeded(input: { date: string; spentAmount: number; dailyLimit: number }): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
      return;
    }

    const date = input.date.length >= 10 ? input.date.slice(0, 10) : input.date;
    const key = `budget_daily_exceeded_notified:${date}`;
    if (localStorage.getItem(key) === '1') {
      return;
    }

    const spent = Number(input.spentAmount);
    const limit = Number(input.dailyLimit);

    if (!Number.isFinite(spent) || !Number.isFinite(limit)) {
      return;
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: this.getDailyNotificationId(date),
          title: 'Daily budget limit exceeded',
          body: `You spent ₱${spent.toFixed(2)} today. Your daily limit is ₱${limit.toFixed(2)}.`,
          channelId: this.channelId,
          schedule: {
            at: new Date(Date.now() + 1000),
            allowWhileIdle: true
          }
        }
      ]
    });

    localStorage.setItem(key, '1');
  }

  async scheduleWeeklyMotivation(): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
      return;
    }

    const pending = await LocalNotifications.getPending();
    const already = pending.notifications?.some((n: { id: number }) => n.id === this.weeklyMotivationId);
    if (already) {
      return;
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: this.weeklyMotivationId,
          title: 'Weekly check-in',
          body: this.pickWeeklyQuote(),
          channelId: this.channelId,
          schedule: {
            on: {
              weekday: 1,
              hour: 20,
              minute: 0
            },
            repeats: true,
            allowWhileIdle: true
          }
        }
      ]
    });
  }

  private getDailyNotificationId(date: string): number {
    const digits = date.replace(/[^0-9]/g, '');
    const n = Number(digits.slice(-6));
    return Number.isFinite(n) ? 800000 + n : 800000;
  }

  private getOneOffNotificationId(): number {
    const n = Date.now() % 2000000000;
    return Number.isFinite(n) ? Math.floor(n) : 700000;
  }

  private pickWeeklyQuote(): string {
    const quotes = [
      'Small steps add up. Your future self will thank you for saving today.',
      'Spend wisely, live freely. Keep going!',
      'Every peso you save is a vote for your goals.',
      'Discipline now, comfort later. You’ve got this!',
      'Progress is progress—stay consistent and keep your spending mindful.'
    ];

    return quotes[Math.floor(Math.random() * quotes.length)];
  }
}
