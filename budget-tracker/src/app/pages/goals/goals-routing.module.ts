import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GoalsPage } from './goals.page';

const routes: Routes = [
  {
    path: '',
    component: GoalsPage
  },
  {
    path: ':goalId',
    loadChildren: () => import('./goal-details/goal-details.module').then(m => m.GoalDetailsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GoalsPageRoutingModule {}
