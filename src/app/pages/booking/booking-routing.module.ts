import { BookingHomeComponent } from './booking-home/booking-home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BookingDetailComponent } from './booking-detail/booking-detail.component';
import { BookingPreviewComponent } from './booking-preview/booking-preview.component';

const routes: Routes = [
  {
    path: '',
    component: BookingHomeComponent
  },
  {
    path: 'detail/:idBookingCalendar/:calendar_id',
    component: BookingDetailComponent
  },
  {
    path: 'preview/:idBookingCalendar/:calendar_id',
    component: BookingPreviewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingRoutingModule { }
