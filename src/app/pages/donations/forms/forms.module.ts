import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsRoutingModule } from './forms-routing.module';
import { DonationFormListComponent } from './donation-form-list/donation-form-list.component';
import { DonationFormFormComponent } from './donation-form-form/donation-form-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgxQRCodeModule } from 'ngx-qrcode2';

@NgModule({
  declarations: [DonationFormListComponent, DonationFormFormComponent],
  imports: [
    CommonModule,
    FormsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSmartModalModule,
    NgxQRCodeModule
  ],
  exports: [
    DonationFormListComponent
  ],
  entryComponents: [
    DonationFormListComponent
  ]
})
export class DonationFormsModule { }
