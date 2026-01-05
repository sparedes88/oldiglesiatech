import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileItemsDisplayComponent } from './profile-items-display.component';
import { RouterModule } from '@angular/router';
import { DonationsModule } from 'src/app/pages/donations/donations.module';

@NgModule({
  declarations: [
    ProfileItemsDisplayComponent
  ],
  imports: [
    CommonModule,
    DonationsModule,
    RouterModule
  ],
  exports: [
    ProfileItemsDisplayComponent
  ],
  entryComponents: [
    ProfileItemsDisplayComponent
  ]
})
export class ProfileItemsDisplayModule { }
