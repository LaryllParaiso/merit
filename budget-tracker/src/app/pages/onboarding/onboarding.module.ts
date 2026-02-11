import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { OnboardingPageRoutingModule } from './onboarding-routing.module';
import { OnboardingPage } from './onboarding.page';

@NgModule({
  imports: [CommonModule, IonicModule, OnboardingPageRoutingModule],
  declarations: [OnboardingPage]
})
export class OnboardingPageModule {}
