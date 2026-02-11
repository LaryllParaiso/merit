import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GoalsPageRoutingModule } from './goals-routing.module';

import { GoalsPage } from './goals.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    GoalsPageRoutingModule
  ],
  declarations: [GoalsPage]
})
export class GoalsPageModule {}
