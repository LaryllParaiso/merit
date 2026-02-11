import { Component, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { ToastController } from '@ionic/angular';

import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { AppNotificationService } from '../../services/app-notification.service';

type ReportPeriod = 'all' | 'week' | 'month';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  standalone: false,
})
export class ReportsPage {
  @ViewChild('expensePieCanvas', { static: false }) expensePieCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('incomeExpenseBarCanvas', { static: false }) incomeExpenseBarCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('spendingTrendCanvas', { static: false }) spendingTrendCanvas?: ElementRef<HTMLCanvasElement>;

  isLoading = true;
  isExporting = false;
  period: ReportPeriod | 'custom' = 'all';
  customStartDate = this.formatIsoDate(new Date());
  customEndDate = this.formatIsoDate(new Date());
  expenseTotals: Array<{ categoryId: string; categoryName: string; categoryColor?: string; total: number }> = [];
  incomeExpenseTotals: { totalIncome: number; totalExpense: number } = { totalIncome: 0, totalExpense: 0 };
  spendingTrend: Array<{ date: string; total: number }> = [];

  private expensePieChart?: Chart;
  private incomeExpenseBarChart?: Chart;
  private spendingTrendChart?: Chart;
  private chartRegistered = false;

  constructor(
    private userService: UserService,
    private transactionService: TransactionService,
    private toastController: ToastController,
    private notificationService: AppNotificationService
  ) {}

  async ionViewWillEnter(): Promise<void> {
    await this.refresh();
  }

  private async renderSpendingTrend(): Promise<void> {
    const canvas = this.spendingTrendCanvas?.nativeElement;
    if (!canvas) {
      return;
    }

    if (!this.chartRegistered) {
      Chart.register(...registerables);
      this.chartRegistered = true;
    }

    this.destroySpendingTrendChart();

    if (!this.hasTrendData) {
      return;
    }

    const labels = this.spendingTrend.map(r => r.date);
    const data = this.spendingTrend.map(r => Number(r.total || 0));

    const danger = this.getCssColor('--ion-color-danger', '#ef4444');
    const textColor = this.getCssColor('--ion-text-color', '#111827');
    const gridColor = 'rgba(17, 24, 39, 0.08)';

    this.spendingTrendChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Daily spending',
            data,
            borderColor: danger,
            backgroundColor: this.withAlpha(danger, 0.18),
            fill: true,
            tension: 0.25,
            pointRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: textColor
            },
            grid: {
              color: gridColor
            }
          },
          x: {
            ticks: {
              color: textColor
            },
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const value = Number(ctx.parsed.y || 0);
                return `₱${value.toFixed(2)}`;
              }
            }
          }
        }
      }
    });
  }

  private getCssColor(varName: string, fallback: string): string {
    try {
      if (typeof window === 'undefined') {
        return fallback;
      }
      const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      return v || fallback;
    } catch {
      return fallback;
    }
  }

  private withAlpha(color: string, alpha: number): string {
    const c = String(color ?? '').trim();

    if (c.startsWith('#')) {
      const hex = c.length === 4
        ? `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`
        : c;

      const m = /^#([0-9a-f]{6})$/i.exec(hex);
      if (m) {
        const n = parseInt(m[1], 16);
        const r = (n >> 16) & 255;
        const g = (n >> 8) & 255;
        const b = n & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    }

    const rgb = c.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgb) {
      return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${alpha})`;
    }

    return c;
  }

  ionViewWillLeave(): void {
    this.destroyCharts();
  }

  async refresh(ev?: CustomEvent): Promise<void> {
    this.isLoading = true;
    try {
      const userId = await this.userService.getOrCreateUserId();
      const range = this.getRangeForPeriod(this.period);
      const trendRange = this.getTrendRangeForPeriod(this.period);

      this.expenseTotals = await this.transactionService.getExpenseTotalsByCategory(userId, range);
      this.incomeExpenseTotals = await this.transactionService.getIncomeExpenseTotals(userId, range);
      this.spendingTrend = await this.loadSpendingTrend(userId, trendRange);

      setTimeout(() => {
        void this.renderCharts();
      }, 0);
    } finally {
      this.isLoading = false;
      (ev?.target as any)?.complete?.();
    }
  }

  async onPeriodChange(): Promise<void> {
    if (this.period === 'custom') {
      this.customEndDate = this.formatIsoDate(new Date());
      this.customStartDate = this.customEndDate;
      return;
    }

    await this.refresh();
  }

  async applyCustomRange(): Promise<void> {
    if (this.period !== 'custom') {
      return;
    }

    if (!this.customStartDate || !this.customEndDate) {
      return;
    }

    if (this.customStartDate > this.customEndDate) {
      const tmp = this.customStartDate;
      this.customStartDate = this.customEndDate;
      this.customEndDate = tmp;
    }

    await this.refresh();
  }

  get periodLabel(): string {
    if (this.period === 'week') {
      return 'This week';
    }
    if (this.period === 'month') {
      return 'This month';
    }
    if (this.period === 'custom') {
      return `${this.customStartDate} to ${this.customEndDate}`;
    }
    return 'All-time';
  }

  get totalExpenses(): number {
    return this.expenseTotals.reduce((sum, r) => sum + Number(r.total || 0), 0);
  }

  get topCategories(): Array<{ categoryId: string; categoryName: string; categoryColor?: string; total: number }> {
    return this.expenseTotals.slice(0, 5);
  }

  get hasIncomeExpenseData(): boolean {
    const income = Number(this.incomeExpenseTotals.totalIncome || 0);
    const expense = Number(this.incomeExpenseTotals.totalExpense || 0);
    return income + expense > 0;
  }

  get hasTrendData(): boolean {
    return this.spendingTrend.some(r => Number(r.total || 0) > 0);
  }

  get totalSpent(): number {
    return this.spendingTrend.reduce((sum, r) => sum + Number(r.total || 0), 0);
  }

  get avgDailySpent(): number {
    const days = this.spendingTrend.length;
    if (!Number.isFinite(days) || days <= 0) {
      return 0;
    }
    return this.totalSpent / days;
  }

  get highestDay(): { date: string; total: number } | undefined {
    if (this.spendingTrend.length === 0) {
      return undefined;
    }

    return this.spendingTrend.reduce(
      (best, cur) => (Number(cur.total || 0) > Number(best.total || 0) ? cur : best),
      this.spendingTrend[0]
    );
  }

  get lowestDay(): { date: string; total: number } | undefined {
    if (this.spendingTrend.length === 0) {
      return undefined;
    }

    return this.spendingTrend.reduce(
      (best, cur) => (Number(cur.total || 0) < Number(best.total || 0) ? cur : best),
      this.spendingTrend[0]
    );
  }

  getExpensePercent(total: number): number {
    const denom = this.totalExpenses;
    if (!Number.isFinite(denom) || denom <= 0) {
      return 0;
    }
    const pct = (Number(total) / denom) * 100;
    return Number.isFinite(pct) ? pct : 0;
  }

  private async renderCharts(): Promise<void> {
    await this.renderExpensePie();
    await this.renderIncomeExpenseBar();
    await this.renderSpendingTrend();
  }

  private async renderExpensePie(): Promise<void> {
    const canvas = this.expensePieCanvas?.nativeElement;
    if (!canvas) {
      return;
    }

    if (!this.chartRegistered) {
      Chart.register(...registerables);
      this.chartRegistered = true;
    }

    if (this.expenseTotals.length === 0) {
      this.destroyExpensePieChart();
      return;
    }

    this.destroyExpensePieChart();

    const labels = this.expenseTotals.map(r => r.categoryName);
    const data = this.expenseTotals.map(r => r.total);
    const primary = this.getCssColor('--ion-color-primary', '#2f80ed');
    const colors = this.expenseTotals.map(r => r.categoryColor || primary);
    const total = data.reduce((sum, v) => sum + Number(v || 0), 0);
    const textColor = this.getCssColor('--ion-text-color', '#111827');

    this.expensePieChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderColor: '#ffffff',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const value = Number(ctx.parsed || 0);
                const pct = total > 0 ? (value / total) * 100 : 0;
                const label = ctx.label ?? '';
                return `${label}: ₱${value.toFixed(2)} (${pct.toFixed(1)}%)`;
              }
            }
          }
        }
      }
    });
  }

  private async renderIncomeExpenseBar(): Promise<void> {
    const canvas = this.incomeExpenseBarCanvas?.nativeElement;
    if (!canvas) {
      return;
    }

    if (!this.chartRegistered) {
      Chart.register(...registerables);
      this.chartRegistered = true;
    }

    const labels = ['Income', 'Expense'];
    const data = [
      Number(this.incomeExpenseTotals.totalIncome || 0),
      Number(this.incomeExpenseTotals.totalExpense || 0)
    ];

    this.destroyIncomeExpenseBarChart();

    if (!this.hasIncomeExpenseData) {
      return;
    }

    const success = this.getCssColor('--ion-color-secondary', '#22c55e');
    const danger = this.getCssColor('--ion-color-danger', '#ef4444');
    const textColor = this.getCssColor('--ion-text-color', '#111827');
    const gridColor = 'rgba(17, 24, 39, 0.08)';

    this.incomeExpenseBarChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: this.periodLabel,
            data,
            backgroundColor: [success, danger],
            borderColor: [success, danger],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: textColor
            },
            grid: {
              color: gridColor
            }
          },
          x: {
            ticks: {
              color: textColor
            },
            grid: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const value = Number(ctx.parsed.y || 0);
                return `₱${value.toFixed(2)}`;
              }
            }
          }
        }
      }
    });
  }

  private destroyExpensePieChart(): void {
    if (this.expensePieChart) {
      this.expensePieChart.destroy();
      this.expensePieChart = undefined;
    }
  }

  private destroyIncomeExpenseBarChart(): void {
    if (this.incomeExpenseBarChart) {
      this.incomeExpenseBarChart.destroy();
      this.incomeExpenseBarChart = undefined;
    }
  }

  private destroySpendingTrendChart(): void {
    if (this.spendingTrendChart) {
      this.spendingTrendChart.destroy();
      this.spendingTrendChart = undefined;
    }
  }

  private destroyCharts(): void {
    this.destroyExpensePieChart();
    this.destroyIncomeExpenseBarChart();
    this.destroySpendingTrendChart();
  }

  private getRangeForPeriod(period: ReportPeriod | 'custom'): { startDate: string; endDate: string } | undefined {
    if (period === 'all') {
      return undefined;
    }

    if (period === 'custom') {
      if (!this.customStartDate || !this.customEndDate) {
        return undefined;
      }
      return {
        startDate: this.customStartDate,
        endDate: this.customEndDate
      };
    }

    const now = new Date();
    if (period === 'week') {
      return this.getUtcWeekRange(now);
    }

    return this.getUtcMonthRange(now);
  }

  private formatIsoDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private getUtcWeekRange(now: Date): { startDate: string; endDate: string } {
    const weekStartDay = 1;
    const day = now.getUTCDay();
    const daysSinceStart = (day - weekStartDay + 7) % 7;

    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysSinceStart));
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + 6));

    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10)
    };
  }

  private getUtcMonthRange(now: Date): { startDate: string; endDate: string } {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10)
    };
  }

  private getTrendRangeForPeriod(period: ReportPeriod | 'custom'): { startDate: string; endDate: string } {
    if (period === 'all') {
      const end = new Date();
      const start = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
      return {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10)
      };
    }

    const r = this.getRangeForPeriod(period);
    if (r) {
      return r;
    }

    const d = this.formatIsoDate(new Date());
    return { startDate: d, endDate: d };
  }

  private async loadSpendingTrend(
    userId: string,
    range: { startDate: string; endDate: string }
  ): Promise<Array<{ date: string; total: number }>> {
    const rows = await this.transactionService.getDailyExpenseTotals(userId, range);
    const totalsByDate = new Map(rows.map(r => [r.date, Number(r.total || 0)]));

    const dates = this.enumerateIsoDates(range.startDate, range.endDate);
    return dates.map(date => ({
      date,
      total: totalsByDate.get(date) ?? 0
    }));
  }

  private enumerateIsoDates(startDate: string, endDate: string): string[] {
    const out: string[] = [];
    let cur = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T00:00:00.000Z`);

    while (cur.getTime() <= end.getTime()) {
      out.push(cur.toISOString().slice(0, 10));
      cur = new Date(Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth(), cur.getUTCDate() + 1));
      if (out.length > 4000) {
        break;
      }
    }

    return out;
  }

  async exportCsv(): Promise<void> {
    if (this.isExporting) {
      return;
    }

    this.isExporting = true;
    try {
      const userId = await this.userService.getOrCreateUserId();
      const range = this.getRangeForPeriod(this.period);
      const rows = await this.transactionService.listTransactionsForExport(userId, range);

      const header = ['Date', 'Type', 'Category', 'Amount', 'Notes'];
      const lines = [
        header.join(','),
        ...rows.map(r => [
          this.csvEscape(r.date),
          this.csvEscape(r.type),
          this.csvEscape(r.categoryName),
          this.csvEscape(Number(r.amount).toFixed(2)),
          this.csvEscape(r.notes)
        ].join(','))
      ];

      const csv = lines.join('\n');
      const filename = this.getExportFilename(range);

      if (Capacitor.isNativePlatform()) {
        const folder = 'SimpleBudgetTracker';
        const docPath = `${folder}/${filename}`;

        let hasPublicStorage = true;
        try {
          const perm = await Filesystem.checkPermissions();
          if (perm.publicStorage !== 'granted') {
            const requested = await Filesystem.requestPermissions();
            hasPublicStorage = requested.publicStorage === 'granted';
          }
        } catch {
          hasPublicStorage = false;
        }

        if (!hasPublicStorage) {
          throw new Error('Storage permission not granted');
        }

        let savedUri = '';
        try {
          const writeResult = await Filesystem.writeFile({
            path: docPath,
            data: csv,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
            recursive: true
          });
          savedUri = writeResult.uri;
        } catch (errDocs) {
          console.error(errDocs);
          throw new Error('Failed to save to Documents. Please allow file/storage permission and try again.');
        }

        const toast = await this.toastController.create({
          message: 'CSV saved (Documents)',
          duration: 1600,
          position: 'bottom'
        });
        await toast.present();

        try {
          await this.notificationService.notifyOneOff({
            title: 'CSV export saved',
            body: `${filename} saved to Documents. Tap to open.`,
            extra: {
              action: 'openFile',
              uri: savedUri,
              title: filename
            }
          });
        } catch {
        }

        return;
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      const toast = await this.toastController.create({
        message: 'CSV exported',
        duration: 1500,
        position: 'bottom'
      });
      await toast.present();
    } catch (err) {
      console.error(err);

      const message = err instanceof Error && err.message ? err.message : 'Export failed';
      const toast = await this.toastController.create({
        message,
        duration: 1800,
        position: 'bottom'
      });
      await toast.present();

      try {
        await this.notificationService.notifyOneOff({
          title: 'CSV export failed',
          body: 'Please try again.'
        });
      } catch {
      }
    } finally {
      this.isExporting = false;
    }
  }

  private getExportFilename(range?: { startDate: string; endDate: string }): string {
    const suffix = range ? `${range.startDate}_to_${range.endDate}` : 'all_time';
    return `transactions_${suffix}.csv`;
  }

  private csvEscape(value: unknown): string {
    const s = String(value ?? '');
    const escaped = s.replace(/"/g, '""');
    return `"${escaped}"`;
  }
}
