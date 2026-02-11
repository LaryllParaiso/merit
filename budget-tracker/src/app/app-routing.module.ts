import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { onboardingGuard } from './guards/onboarding.guard';

const routes: Routes = [
  {
    path: 'onboarding',
    loadChildren: () => import('./pages/onboarding/onboarding.module').then(m => m.OnboardingPageModule)
  },
  {
    path: 'tabs',
    canMatch: [onboardingGuard],
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsPageModule)
  },
  {
    path: '',
    redirectTo: 'tabs/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'tabs/dashboard'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
