import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

const ONBOARDING_DONE_KEY = 'merit_onboarding_done';

export const onboardingGuard: CanMatchFn = () => {
  try {
    const done = localStorage.getItem(ONBOARDING_DONE_KEY) === '1';
    if (done) {
      return true;
    }
  } catch {
  }

  const router = inject(Router);
  return router.createUrlTree(['/onboarding']);
};
