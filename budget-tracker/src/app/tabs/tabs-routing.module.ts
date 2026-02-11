import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('../pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'transactions',
        loadChildren: () => import('../pages/transactions/transactions.module').then(m => m.TransactionsPageModule)
      },
      {
        path: 'add',
        loadChildren: () => import('../pages/add/add.module').then(m => m.AddPageModule)
      },
      {
        path: 'budget',
        loadChildren: () => import('../pages/budget/budget.module').then(m => m.BudgetPageModule)
      },
      {
        path: 'reports',
        loadChildren: () => import('../pages/reports/reports.module').then(m => m.ReportsPageModule)
      },
      {
        path: 'goals',
        loadChildren: () => import('../pages/goals/goals.module').then(m => m.GoalsPageModule)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
