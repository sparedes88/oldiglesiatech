import { BookingModel, BookingSettingsDaysModel, BookingIncrementDurationModel, BookingSettingsModel } from './../../../models/BookingModel';
import { ToastType } from './../../../login/ToastTypes';
import { BookingService } from './../../../services/booking.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormBuilder, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { Component, OnInit, ViewChild, NgZone } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { BookingPreviewComponent } from '../booking-preview/booking-preview.component';

@Component({
  selector: 'app-booking-detail',
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.scss']
})
export class BookingDetailComponent implements OnInit {

  @ViewChild('booking_preview') booking_preview: BookingPreviewComponent;

  currentUser: User;
  booking: BookingModel;
  idBookingCalendar: number;
  calendar_id: string;
  token: any;

  show_detail = false;
  show_detail_loading = false;

  hide_preview: boolean = true;

  public formBooking: FormGroup = this.formBuilder.group({
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
  durations: BookingIncrementDurationModel[];

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    public route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private zone: NgZone
  ) {
    this.currentUser = this.userService.getCurrentUser();
    this.idBookingCalendar = this.route.snapshot.params.idBookingCalendar;
    this.calendar_id = atob(this.route.snapshot.params.calendar_id);
    this.token = JSON.parse(localStorage.getItem('token_google_auth'));
  }

  ngOnInit() {
    this.hide_preview = true;
    this.getBookingDetail();
  }

  initClient() {
    return new Promise((resolve, reject) => {
      return resolve(true);
    });
  }

  getPermissions() {
    if (this.currentUser) {
      if (this.currentUser.isSuperUser) {
        return false;
      }
      if (this.currentUser.idUserType === 1) {
        return false;
      }
      return true;
    }
    return true;
  }

  getBookingDetail() {
    this.bookingService.getBookingDetail(this.idBookingCalendar, this.calendar_id)
      .subscribe((data: any) => {
        this.formBooking.patchValue(data.booking);
        this.booking = data.booking;
        this.durations = data.durations;
        if (this.currentUser) {
          this.settings_form.patchValue({
            created_by: this.currentUser.idUsuario
          });
        }
        if (!this.booking.settings.has_break) {
          this.settings_form.get('break_start').disable({ onlySelf: true });
          this.settings_form.get('break_end').disable({ onlySelf: true });
        } else {
          this.settings_form.get('break_start').enable();
          this.settings_form.get('break_end').enable();
        }
        this.booking.settings.days.forEach(day => {
          const control = this.formBooking.get('days') as FormArray;
          control.push(this.formBuilder.group({
            idBookingSettingDay: day.idBookingSettingDay,
            is_available: day.is_available,
            name: day.name,
            time_start: new FormControl(day.time_start, [Validators.required]),
            time_end: new FormControl(day.time_end, [Validators.required]),
          }));
        });

        this.show_detail = true;
      }, error => {
        console.error(error);
        console.error(error.status);
        if (error.status === 404) {
          this.bookingService.api.showToast(`This booking was deleted.`, ToastType.error);
        } else if (error.status === 403) {
          this.bookingService.api.showToast(`You need to link your Google account to see this information. Please go back`, ToastType.error);
          this.router.navigate(['/booking']);
        } else {
          this.bookingService.api.showToast(`Something happened while trying to get the booking details.`, ToastType.error);
        }
        this.show_detail = true;
      }, () => {
        this.hide_preview = false;
      });
  }

  get days_on_form() {
    return (this.formBooking.get('days') as FormArray).controls;
  }

  get settings_form() {
    return this.formBooking.get('settings') as FormGroup;
  }

  changeAvailability(day: BookingSettingsDaysModel, control: FormGroup) {
    day.is_available = !day.is_available;
    control.get('is_available').setValue(day.is_available);
  }

  saveSettingsDays(form_group: FormArray | AbstractControl) {
    const days = form_group.value as BookingSettingsDaysModel[];
    days.forEach(day => {
      if (day.time_start > '23:59') {
        day.time_start = '23:00';
      }
      const time_start_splitted = day.time_start.split(':');
      if (time_start_splitted[1] > '60') {
        let hour = Number(time_start_splitted[0]);
        hour++;
        day.time_start = `${hour}:00`;
      }
      if (day.time_end > '23:59') {
        day.time_end = '23:00';
      }
      const time_end_splitted = day.time_end.split(':');
      if (time_end_splitted[1] > '60') {
        let hour = Number(time_end_splitted[0]);
        hour++;
        day.time_end = `${hour}:00`;
      }
    });

    const payload = this.settings_form.value;
    payload.days = [...days];

    this.bookingService.saveSettings(payload)
      .subscribe(success => {
        this.bookingService.api.showToast(`Changes successfully saved...!`, ToastType.success);
        this.booking.settings.days = [...days];
        this.booking.settings.break_start = this.settings_form.get('break_start').value;
        this.booking.settings.break_end = this.settings_form.get('break_end').value;
        this.booking_preview.ngOnInit();
      }, error => {
        console.error(error);
        this.bookingService.api.showToast(`Something went wrong trying to save changes.`, ToastType.error);
      });

  }

  updateIncrementDuration(settings_form: FormGroup, key: string) {
    const payload = this.settings_form.value;
    this.bookingService.saveSettings(payload)
      .subscribe(success => {
        const idBookingIncrementDuration = Number(settings_form.get(key).value);
        this.booking.settings.idBookingIncrementDuration = idBookingIncrementDuration;
        const duration = this.durations.find(x => x.idBookingIncrementDuration === idBookingIncrementDuration);
        this.booking.settings.duration_minutes = duration.duration_minutes;
        this.booking_preview.ngOnInit();

        settings_form.get(key).setValue(this.booking.settings[key]);
        settings_form.get(key).markAsPristine();
      });
  }

  changeIncrementDuration(control: FormGroup, key: string, event: any) {
    const idDurationTemp = Number(JSON.parse(control.get(key).value));
    if (idDurationTemp === this.booking.settings[key]) {
      control.get(key).setValue(this.booking.settings[key]);
      control.get(key).markAsPristine();
    } else {
      // this.groupsService.updateMemberType(member_temp)
      //   .subscribe(response => {
      //     this.groupsService.api.showToast(`Role updated.`, ToastType.info);
      //     control.get(key).setValue(member_temp.is_leader);
      //     control.get(key).markAsPristine();
      //   }, error => {
      //     console.error(error);
      //     this.groupsService.api.showToast(`Error updating the user's role. Reversing changes...`, ToastType.error);
      //     control.get(key).setValue(member.is_leader);
      //     control.get(key).markAsPristine();
      //   });
    }

  }

  resetForm(formGroup: FormGroup, key: string, primary_key?: string) {
    if (primary_key) {
      formGroup.get(key).setValue(this.booking[primary_key][key]);
    } else {
      formGroup.get(key).setValue(this.booking[key]);
    }
    formGroup.get(key).markAsPristine();
  }

  changeBreakSettings(settings: BookingSettingsModel, control: FormGroup) {
    settings.has_break = !settings.has_break;
    control.get('has_break').setValue(settings.has_break);
    if (!settings.has_break) {
      control.get('break_start').disable({ onlySelf: true });
      control.get('break_end').disable({ onlySelf: true });
    } else {
      control.get('break_start').enable();
      control.get('break_end').enable();
    }
  }

  updateValue(formGroup: FormGroup, key: string) {
    this.show_detail = false;
    const group = Object.assign({}, this.booking);
    group[key] = formGroup.get(key).value;
    group.created_by = this.currentUser.idUsuario;
    this.bookingService.updateBooking(group)
      .subscribe(response => {
        this.booking[key] = formGroup.get(key).value;
        formGroup.get(key).markAsPristine();
        // Object.keys(formGroup.controls).forEach(element => {
        //   formGroup.controls[element].markAsPristine();
        // });
        // this.getGroup();
        this.show_detail = true;
      }, error => {
        console.error(error);
        this.bookingService.api.showToast(`Error updating the ${key} of the booking.`, ToastType.error);
      });
  }

}
