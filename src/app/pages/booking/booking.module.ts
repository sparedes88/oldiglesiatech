import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgxMaskModule } from 'ngx-mask';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookingRoutingModule } from './booking-routing.module';
import { BookingHomeComponent } from './booking-home/booking-home.component';
import { BookingDetailComponent } from './booking-detail/booking-detail.component';
import { BookingPreviewComponent } from './booking-preview/booking-preview.component';
import { BookingAppointmentFormComponent } from './booking-appointment-form/booking-appointment-form.component';

@NgModule({
  declarations: [BookingHomeComponent, BookingDetailComponent, BookingPreviewComponent, BookingAppointmentFormComponent],
  imports: [
    CommonModule,
    BookingRoutingModule,
    ReactiveFormsModule,
    TranslateModule.forChild(),
    NgxMaskModule.forChild(),
    NgxSmartModalModule.forChild()
  ]
})
export class BookingModule { }
