import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GoalDetailsPage } from './goal-details.page';

const routes: Routes = [
  {
    path: '',
    component: GoalDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GoalDetailsPageRoutingModule {}
