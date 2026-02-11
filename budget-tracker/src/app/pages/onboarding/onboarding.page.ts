import { Component } from '@angular/core';
import { Router } from '@angular/router';

const ONBOARDING_DONE_KEY = 'merit_onboarding_done';

type OnboardingSlide = {
  image: string;
  title: string;
  description: string;
};

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  standalone: false
})
export class OnboardingPage {
  index = 0;

  private touchStartX?: number;

  slides: OnboardingSlide[] = [
    {
      image: 'assets/onboarding/bf_MqEaxDYOk5_gY.webp',
      title: 'Track Your Money',
      description: 'Easily record your expenses and income.\nKnow exactly where your money goes\nevery day!'
    },
    {
      image: 'assets/onboarding/bYwgsldi7jTH0rNW.webp',
      title: 'Set Budgets',
      description: 'Create spending limits for different\ncategories and stay on track with your\nmoney.'
    },
    {
      image: 'assets/onboarding/EqQfT-Z2OVPRSYfR.webp',
      title: 'Save for Goals',
      description: 'Want a new phone or game? Set\nsavings goals and watch your progress\ngrow!'
    },
    {
      image: 'assets/onboarding/ZkpchNH8drddliq5.webp',
      title: 'See Your Progress',
      description: 'View colorful charts and reports to\nunderstand your spending habits better.'
    }
  ];

  constructor(private router: Router) {}

  get isLast(): boolean {
    return this.index >= this.slides.length - 1;
  }

  prev(): void {
    this.index = Math.max(0, this.index - 1);
  }

  next(): void {
    if (this.isLast) {
      void this.finish();
      return;
    }
    this.index = Math.min(this.slides.length - 1, this.index + 1);
  }

  skip(): void {
    void this.finish();
  }

  onTouchStart(ev: TouchEvent): void {
    const x = ev.touches?.[0]?.clientX;
    if (typeof x !== 'number') {
      this.touchStartX = undefined;
      return;
    }
    this.touchStartX = x;
  }

  onTouchEnd(ev: TouchEvent): void {
    const start = this.touchStartX;
    this.touchStartX = undefined;
    if (typeof start !== 'number') {
      return;
    }

    const x = ev.changedTouches?.[0]?.clientX;
    if (typeof x !== 'number') {
      return;
    }

    const dx = x - start;
    if (Math.abs(dx) < 45) {
      return;
    }

    if (dx < 0) {
      this.next();
      return;
    }

    this.prev();
  }

  private async finish(): Promise<void> {
    try {
      localStorage.setItem(ONBOARDING_DONE_KEY, '1');
    } catch {
    }

    await this.router.navigate(['/tabs/dashboard'], { replaceUrl: true });
  }

  trackByIndex(i: number): number {
    return i;
  }
}
