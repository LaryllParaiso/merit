import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GoalDetailsPageRoutingModule } from './goal-details-routing.module';

import { GoalDetailsPage } from './goal-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GoalDetailsPageRoutingModule
  ],
  declarations: [GoalDetailsPage]
})
export class GoalDetailsPageModule {}
