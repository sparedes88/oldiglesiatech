import { Router } from '@angular/router';
import { ToastType } from 'src/app/login/ToastTypes';
import { BookingService } from './../../../services/booking.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BookingSessionModel, GoogleCalendarEvent, BookingModel } from './../../../models/BookingModel';
import { ApiService } from 'src/app/services/api.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import * as moment from 'moment';

@Component({
  selector: 'app-booking-appointment-form',
  templateUrl: './booking-appointment-form.component.html',
  styleUrls: ['./booking-appointment-form.component.scss']
})
export class BookingAppointmentFormComponent implements OnInit {

  // tslint:disable-next-line: no-output-on-prefix
  @Output() onDismiss = new EventEmitter();

  currentUser: User;
  booking: BookingModel;
  booking_appointment: BookingSessionModel;
  formBooking: FormGroup;
  time_zone: { id: string; name: string; };

  is_preview: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private bookingService: BookingService,
    private router: Router
  ) {
    this.currentUser = this.userService.getCurrentUser();
    this.is_preview = this.router.url.includes('preview');
  }

  ngOnInit() {
    console.log(this.booking_appointment);
    if (this.booking_appointment) {
      this.formBooking = this.formBuilder.group({
        idBookingCalendar: this.booking.idBookingCalendar,
        idBookingSettingDay: [this.booking_appointment.idBookingSettingDay, Validators.required],
        first_name: ['', Validators.required],
        last_name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        summary: [''],
        description: [''],
        session_date: [this.booking_appointment.session_date, Validators.required],
        start_time: [''],
        end_time: [''],
        was_reschedule: [false, Validators.required],
        original_date: [''],
        original_start_time: [''],
        original_end_time: ['']
      });
    }
  }

  reserveAppointment() {
    console.log(this.formBooking);
    if (this.formBooking.valid) {
      const payload = this.formBooking.value;

      const only_date = moment(`${this.booking_appointment.session_date}`).format('YYYY-MM-DD');
      const full_date = moment(`${only_date} ${this.booking_appointment.start_time}`).tz(this.time_zone.id).toDate();
      const full_date_end = moment(`${only_date} ${this.booking_appointment.end_time}`).tz(this.time_zone.id).toDate();
      const calendar: GoogleCalendarEvent = {
        summary: payload.summary,
        description: payload.description,
        originalStartTime: {
          dateTime: full_date,
          timeZone: this.time_zone.id
        },
        start: {
          dateTime: full_date,
          timeZone: this.time_zone.id
        },
        end: {
          dateTime: full_date_end,
          timeZone: this.time_zone.id
        },
        attendees: [{ email: payload.email }],
        calendarId: this.booking.calendar_id
      };
      console.log(calendar);
      const token = JSON.parse(localStorage.getItem('token_google_auth'));
      this.bookingService.makeAppointment(calendar, this.is_preview)
        .subscribe(success => {
          console.log(success);
          this.bookingService.api.showToast(`Your session was schedule. Thank you!`, ToastType.success);
          this.onDismiss.emit(true);
        }, error => {
          this.bookingService.api.showToast(`Something went wrong saving your session. Please try again.`, ToastType.error);
          console.error(error);
        });
    } else {
      Object.keys(this.formBooking.controls).forEach(key => {
        this.formBooking.controls[key].markAsDirty();
      });
    }
  }

}
