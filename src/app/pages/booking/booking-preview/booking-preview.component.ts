import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, interval } from 'rxjs';
import { Router } from '@angular/router';
import { ToastType } from 'src/app/login/ToastTypes';
import { BookingService } from './../../../services/booking.service';
import { NgxSmartModalComponent } from 'ngx-smart-modal';
import { BookingModel, BookingSettingsDaysModel, BookingSessionModel, BookingDayModel } from './../../../models/BookingModel';
import { FormGroup, FormArray, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit, Input, ViewChild, HostListener, AfterViewInit } from '@angular/core';
import * as moment from 'moment-timezone';
import { BookingAppointmentFormComponent } from '../booking-appointment-form/booking-appointment-form.component';

@Component({
  selector: 'app-booking-preview',
  templateUrl: './booking-preview.component.html',
  styleUrls: ['./booking-preview.component.scss']
})
export class BookingPreviewComponent implements OnInit, AfterViewInit {

  @Input() form: FormGroup;
  @Input() booking: BookingModel;
  @Input() hide_preview: boolean;
  @ViewChild('booking_appointment_form') booking_appointment_form: BookingAppointmentFormComponent;
  subscription: Subscription;

  view_type: string = 'weekly';

  time_zone: {
    id: string,
    name: string,
  } = {
      id: 'Time_Zone',
      name: 'Time Zone'
    };

  days: BookingDayModel[] = [
    {
      id: 1,
      name: 'dia_lunes',
      index_day: 0,
      appointments: []
    },
    {
      id: 2,
      name: 'dia_martes',
      index_day: 1,
      appointments: []
    },
    {
      id: 3,
      name: 'dia_miercoles',
      index_day: 2,
      appointments: []
    },
    {
      id: 4,
      name: 'dia_jueves',
      index_day: 3,
      appointments: []
    },
    {
      id: 5,
      name: 'dia_viernes',
      index_day: 4,
      appointments: []
    },
    {
      id: 6,
      name: 'dia_sabado',
      index_day: 5,
      appointments: []
    },
    {
      id: 7,
      name: 'dia_domingo',
      index_day: 6,
      appointments: []
    }
  ];

  booking_days: BookingSettingsDaysModel[];
  // appointment_selected: BookingAppointmentModel;
  appointment_selected: BookingSessionModel;

  min_hour: string;
  max_hour: string;
  days_to_add: number = 0;
  is_preview: boolean = false;

  constructor(
    private bookingService: BookingService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.is_preview = this.router.url.includes('preview');
    // const source = interval(5000);
    const source = interval(300000);
    this.subscription = source.subscribe(val => this.getBookingDetail());
  }

  ngAfterViewInit() {
    const width = window.innerWidth;
    if (width < 768) {
      this.view_type = 'daily';
    }
  }

  ngOnInit() {
    this.hide_preview = true;

    if (this.booking) {
      this.min_hour = undefined;
      this.max_hour = undefined;
      const time_zone = moment.tz.guess();
      this.time_zone = {
        id: time_zone,
        name: time_zone.replace(/_/g, ' ')
      };
      this.resetDays();


      this.booking.settings.days.forEach(day => {
        if (!this.min_hour) {
          this.min_hour = day.time_start;
          this.max_hour = day.time_end;
        }
        if (day.time_start < this.min_hour) {
          this.min_hour = day.time_start;
        }

        if (day.time_end > this.max_hour) {
          this.max_hour = day.time_end;
        }
      });

      let day_moment = moment().add(this.days_to_add, 'day');
      this.days.forEach((day, index) => {
        if (day.index_day === day_moment.day()) {
          if (index > 0) {
            index--;
          } else {
            index = 6;
          }
          const array_saved = [...this.days].splice(0, index);
          const settings_array_saved = [...this.booking.settings.days].splice(0, index);
          this.days = this.days.splice(index).concat(array_saved);
          this.booking_days = [...this.booking.settings.days].splice(index).concat(settings_array_saved);
          return;
        }
      });

      this.days.forEach((day, index) => {
        day.date = day_moment.format('YYYY-MM-DD');
        day.appointments = this.getAppointmentDay(day, index);
        day_moment = day_moment.add(1, 'day');
      });

      this.booking.events.forEach(event => {
        if (event.start.dateTime) {
          const event_day = this.days.find(x => {
            return moment(x.date).isSame(event.start.dateTime, 'day');
          });

          if (event_day) {
            let event_time_zone: string;
            let event_end_time_zone: string;
            if (event.start.timeZone) {
              event_time_zone = event.start.timeZone;
            } else {
              event_time_zone = this.time_zone.id;
            }
            if (event.end.timeZone) {
              event_end_time_zone = event.end.timeZone;
            } else {
              event_end_time_zone = this.time_zone.id;
            }
            const event_start_fixed = moment(event.start.dateTime).tz(event_time_zone).format('HH:mm');
            const event_end_fixed = moment(event.end.dateTime).tz(event_end_time_zone).format('HH:mm');
            // Day exist
            event_day.appointments.forEach(appointment_in_array => {
              // array.push({
              //   start_time: start_moment,
              //   end_time: appointment_end,
              //   available: is_available
              // });

              // 8:00 == 8:00
              const not_available_exact = appointment_in_array.start_time === event_start_fixed;
              // Event start is between start time and end time.
              // 8:20 > 8:00
              // 9:00 > 8:00
              const not_available_between = (
                appointment_in_array.start_time > event_start_fixed &&
                appointment_in_array.end_time < event_start_fixed
              );

              // Event starts and finishes between appoint start
              // 7:00 > 8:00
              // 9:00 < 9:00
              const not_available_accross = (
                appointment_in_array.start_time < event_end_fixed
                && event_end_fixed <= appointment_in_array.end_time
              );

              // Appointment starts and finishes between event
              // 8:15 > 8:00
              // 8:30 < 9:00
              const not_available_as_finish = (
                event_start_fixed < appointment_in_array.start_time
                && appointment_in_array.end_time <= event_end_fixed
              );

              // Event start between appointment.
              // 11:30 < 11:40
              // 11:45 > 11:40
              const not_available_end_across = (
                appointment_in_array.start_time < event_start_fixed
                && appointment_in_array.end_time > event_start_fixed
              );
              if (not_available_exact
                || not_available_between
                || not_available_accross
                || not_available_as_finish
                || not_available_end_across
              ) {
                appointment_in_array.available = false;
              }
            });
            // if (appointment) {
            //   appointment.available = false;
            // }
          }
        }
      });
      setTimeout(() => {
        this.hide_preview = false;
      }, 350);
    } else {
      if (this.is_preview) {
        this.initFormASPreview();
        this.getBookingDetail()
          .then(finished => {
          }).catch(error => {
            console.error(error);
          });
      }
    }

  }
  initFormASPreview() {
    this.form = this.formBuilder.group({
      idBookingCalendar: [''],
      idIglesia: [''],
      summary: ['', Validators.required],
      description: [''],
      settings: this.formBuilder.group({
        idBookingSetting: ['', Validators.required],
        idBookingCalendar: ['', Validators.required],
        idBookingIncrementDuration: ['', Validators.required],
        duration_minutes: ['', Validators.required],
        has_break: [false, Validators.required],
        break_start: ['08:00'],
        break_end: ['18:44'],
        created_by: ['', Validators.required]
      }),
      days: this.formBuilder.array([])
    });
  }

  resetDays() {
    this.days = [
      {
        id: 1,
        name: 'dia_lunes',
        index_day: 0,
        appointments: []
      },
      {
        id: 2,
        name: 'dia_martes',
        index_day: 1,
        appointments: []
      },
      {
        id: 3,
        name: 'dia_miercoles',
        index_day: 2,
        appointments: []
      },
      {
        id: 4,
        name: 'dia_jueves',
        index_day: 3,
        appointments: []
      },
      {
        id: 5,
        name: 'dia_viernes',
        index_day: 4,
        appointments: []
      },
      {
        id: 6,
        name: 'dia_sabado',
        index_day: 5,
        appointments: []
      },
      {
        id: 7,
        name: 'dia_domingo',
        index_day: 6,
        appointments: []
      }
    ];
  }

  checkDayAvailability(i: any) {
    if (this.form) {
      const days_form = this.form.get('days') as FormArray;
      const control = days_form.controls.find(x => {
        return x.get('name').value === i.name;
      });
      if (control) {
        return !control.get('is_available').value;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  getAppointmentDay(
    day_in_week:
      {
        id: number;
        name: string;
        index_day: number;
        appointments: any[];
        date?: string;
        idBookingSettingDay?: number
      },
    i: number
  ): any[] {
    {
      if (this.booking) {
        const day = this.booking_days[i];
        day_in_week.idBookingSettingDay = day.idBookingSettingDay;
        const start = day.time_start;
        const end = day.time_end;

        const array = [];

        const duration = this.booking.settings.duration_minutes;
        let start_moment = moment(this.min_hour, 'HH:mm').format('HH:mm');
        // const end_moment = moment(end, 'HH:mm').format('HH:mm');
        const end_moment = moment(this.max_hour, 'HH:mm').format('HH:mm');
        while (start_moment < end_moment) {
          let is_available = true;
          const appointment_end = moment(start_moment, 'HH:mm').add(duration, 'minutes').format('HH:mm');
          if (start_moment < start) {
            is_available = false;
          }
          if (start_moment >= end || appointment_end > end) {
            is_available = false;
          }
          const actual_moment = moment();
          if (actual_moment.isAfter(day_in_week.date, 'day')) {
            is_available = false;
          }
          if (actual_moment.isSame(day_in_week.date, 'day')) {
            if (actual_moment.format('HH:mm') > start_moment) {
              is_available = false;
            }
          }

          if (this.booking.settings.has_break) {
            const break_start = moment(this.booking.settings.break_start, 'HH:mm').format('HH:mm');
            const break_end = moment(this.booking.settings.break_end, 'HH:mm').format('HH:mm');
            // start_moment >= break_start && start_moment <= break_end
            if (start_moment === break_start
              || (start_moment < break_end && start_moment > break_start)
              || (appointment_end < break_end && appointment_end > break_start)
              || (appointment_end > end)
            ) {
              is_available = false;
            }
          }
          const start_formatted_moment = moment(start_moment, 'HH:mm').format('hh:mm A');
          array.push({
            start_time: start_moment,
            start_time_formatted: start_formatted_moment,
            end_time: appointment_end,
            available: is_available
          });
          start_moment = appointment_end;
        }
        return array;
      } else {
        return [];
      }

    }
  }

  addOrLessDays(adding_action: boolean) {
    if (this.view_type === 'weekly') {
      this.days_to_add += adding_action ? 7 : -7;
    } else if (this.view_type === 'daily') {
      this.days_to_add += adding_action ? 1 : -1;
    } else {
      // callback else
      this.days_to_add += adding_action ? 7 : -7;
    }
    this.ngOnInit();
  }

  checkIfToday(date: Date) {
    return moment().isSame(date, 'day');
  }

  bookAppointment(
    appointment: BookingSessionModel,
    day: any,
    booking_appointment_modal: NgxSmartModalComponent,
  ) {
    this.appointment_selected = appointment;
    setTimeout(() => {
      const booking_session_copy = Object.assign({}, appointment);
      booking_session_copy.session_date = day.date;
      booking_session_copy.original_date = day.date;
      booking_session_copy.original_start_time = appointment.start_time;
      booking_session_copy.original_end_time = appointment.end_time;
      booking_session_copy.idBookingSettingDay = day.idBookingSettingDay;
      booking_session_copy.start_time_formatted = moment(appointment.start_time, 'HH:mm').format('hh:mm A');
      booking_session_copy.end_time_formatted = moment(appointment.end_time, 'HH:mm').format('hh:mm A');
      this.booking_appointment_form.time_zone = this.time_zone;
      this.booking_appointment_form.booking_appointment = booking_session_copy;
      this.booking_appointment_form.booking = Object.assign({}, this.booking);
      this.booking_appointment_form.ngOnInit();
      booking_appointment_modal.open();
    }, 350);
  }

  async dismissAppointment(event: boolean, booking_appointment_modal: NgxSmartModalComponent) {
    if (event) {
      const finish = await this.getBookingDetail();
      booking_appointment_modal.close();
    } else {
      booking_appointment_modal.close();
    }
  }

  getBookingDetail() {
    return new Promise((resolve, reject) => {
      this.hide_preview = true;
      const token = JSON.parse(localStorage.getItem('token_google_auth'));
      let subscription: Observable<any>;
      if (this.is_preview) {
        const idBookingCalendar = this.route.snapshot.params.idBookingCalendar;
        const calendar_id = atob(this.route.snapshot.params.calendar_id);
        subscription = this.bookingService.getBookingDetail(idBookingCalendar, calendar_id, this.is_preview);
      } else {
        subscription = this.bookingService.getBookingDetail(this.booking.idBookingCalendar, this.booking.calendar_id, this.is_preview);
      }

      subscription.subscribe((data: any) => {
        this.form.patchValue(data.booking);
        this.booking = data.booking;
        // if (!this.booking.settings.has_break) {
        //   this.settings_form.get('break_start').disable({ onlySelf: true });
        //   this.settings_form.get('break_end').disable({ onlySelf: true });
        // } else {
        //   this.settings_form.get('break_start').enable();
        //   this.settings_form.get('break_end').enable();
        // }
        this.booking.settings.days.forEach(day => {
          const control = this.form.get('days') as FormArray;
          control.push(this.formBuilder.group({
            idBookingSettingDay: day.idBookingSettingDay,
            is_available: day.is_available,
            name: day.name,
            time_start: new FormControl(day.time_start, [Validators.required]),
            time_end: new FormControl(day.time_end, [Validators.required]),
          }));
        });
        this.ngOnInit();
      }, error => {
        console.error(error);
        if (error.status === 404) {
          this.bookingService.api.showToast(`This booking was deleted.`, ToastType.error);
        } else {
          this.bookingService.api.showToast(`Something happened while trying to get the booking details.`, ToastType.error);
        }
      }, () => {
        this.hide_preview = false;
        return resolve(true);
      });
    });
  }

  getActualDay(days: BookingDayModel) {
    return [days[0]];
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    const width = window.innerWidth;
    if (width < 768) {
      this.view_type = 'daily';
    }
  }

}
