import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventCalendarComponent } from './event-calendar.component';
import {
  CalendarCommonModule,
  CalendarMonthModule,
  CalendarWeekModule,
  CalendarDayModule
} from "angular-calendar";

@NgModule({
  declarations: [EventCalendarComponent],
  entryComponents: [EventCalendarComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CalendarCommonModule,
    CalendarMonthModule,
    CalendarWeekModule,
    CalendarDayModule
  ],
  exports: [EventCalendarComponent]
})
export class EventCalendarModule { }
