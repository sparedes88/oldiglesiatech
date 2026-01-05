import { EventCalendarModule } from './../event-calendar/event-calendar.module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventCalendarComponentV2 } from './event-calendar-v2.component';
import {
  CalendarCommonModule,
  CalendarMonthModule,
  CalendarWeekModule,
  CalendarDayModule
} from "angular-calendar";

@NgModule({
  declarations: [EventCalendarComponentV2],
  entryComponents: [EventCalendarComponentV2],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CalendarCommonModule,
    CalendarMonthModule,
    CalendarWeekModule,
    CalendarDayModule,
    EventCalendarModule
  ],
  exports: [EventCalendarComponentV2]
})
export class EventCalendarV2Module { }
