import { AppComponent } from 'src/app/app.component';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { Validators, FormBuilder, FormControl, FormArray, FormGroup } from '@angular/forms';
import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from 'src/app/services/groups.service';
import { GroupEventModel, FrequencyModel, GroupEventDayModel, GroupModel } from 'src/app/models/GroupModel';
import { ToastType } from 'src/app/login/ToastTypes';
import { random_color } from 'src/app/models/Utility';
import * as moment from 'moment';
import { ViewEventActivitiesComponent } from '../view-event-activities/view-event-activities.component';
import { ViewEventAttendanceComponent } from '../view-event-attendance/view-event-attendance.component';
import { ViewEventFinancesComponent } from '../view-event-finances/view-event-finances.component';
import { ViewEventReviewsComponent } from '../view-event-reviews/view-event-reviews.component';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { CalendarEvent } from 'angular-calendar';
import { MaskApplierService, MaskPipe } from 'ngx-mask';
import { TranslateService } from '@ngx-translate/core';
export enum user_status_types {
  login,
  checked_not_available,
  checked_error,
  checked_ok,
  checked_in_organization,
  already_member,
  group_detail
}
import * as moment_tz from 'moment-timezone';
@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit {

  user_status_types = user_status_types;
  start_register: boolean = false;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private groupsService: GroupsService,
    private formBuilder: FormBuilder,
    private router: Router,
    private fus: FileUploadService,
    private organizationService: OrganizationService,
    private modal: NgxSmartModalService,
    private app: AppComponent,
    private mask_service: MaskApplierService,
    private translate_service: TranslateService
  ) {
    this.currentUser = this.userService.getCurrentUser();
    this.id_group_event = this.route.snapshot.params.id;
    this.origin = this.route.snapshot.queryParams.origin;
  }

  get days_on_form(): FormArray {
    return this.formGroup.get('days') as FormArray;
  }

  @ViewChild('view_event_activities_form') view_event_activities_form: ViewEventActivitiesComponent;
  @ViewChild('view_event_reviews_form') view_event_reviews_form: ViewEventReviewsComponent;
  @ViewChild('view_event_finances_form') view_event_finances_form: ViewEventFinancesComponent;
  @ViewChild('view_event_attendances_form') view_event_attendances_form: ViewEventAttendanceComponent;
  @ViewChild('input_file') input_file;

  group_event: GroupEventModel;
  group: GroupModel;

  uploadingCover: boolean = false;
  uploadingLogo: boolean = false;

  currentUser: User;
  logged_user: User;
  id_group_event: number;
  show_detail_loading: boolean;
  photo: File;

  frequencies: FrequencyModel[] = [];
  selected_frequency: FrequencyModel;
  dias: any[] = [];
  dias_form = [
    {
      id: 1,
      name: 'dia_lunes'
    },
    {
      id: 2,
      name: 'dia_martes'
    },
    {
      id: 3,
      name: 'dia_miercoles'
    },
    {
      id: 4,
      name: 'dia_jueves'
    },
    {
      id: 5,
      name: 'dia_viernes'
    },
    {
      id: 6,
      name: 'dia_sabado'
    },
    {
      id: 7,
      name: 'dia_domingo'
    }
  ];

  public formGroup: FormGroup = this.formBuilder.group({
    idGroupEvent: [''],
    idGroup: [''],
    name: ['', Validators.required],
    description: [''],
    // idFrequency: new FormControl(0, [
    //   Validators.required,
    //   Validators.pattern(/[^0]+/),
    //   Validators.min(0)
    // ]),
    // event_as_range: [false],
    // event_date: [undefined],
    // event_date_start: [undefined],
    // event_date_end: new FormControl({ value: 0, disabled: true }, [
    //   Validators.required,
    //   Validators.min(this.getMin())
    // ]),
    // event_time_start: [undefined],
    // event_time_end: [undefined],
    // repeat_until_date: [undefined],
    // event_current_week: [''],
    // days: this.formBuilder.array([]),
    created_by: [''],
    // is_exact_date: [],
    picture: [null],
    // button_text: [null],
    // button_color: [null],
    // live_event_url: [null],
    // capacity: [null]
  });

  login_form: FormGroup = this.formBuilder.group({
    usuario: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [Validators.required])
  });
  additional_form: FormGroup = this.formBuilder.group({
    covid_quest: new FormControl(false, [Validators.required]),
    guests: new FormControl(0, [Validators.required, Validators.min(0)])
  });
  userSelectionList: any[];
  display_login_form: boolean = false;
  display_register_form: boolean = true;
  display_reset_form: boolean = false;
  display_full_form: boolean = false;
  display_already_member: boolean = false;
  login_complete: boolean = false;
  register_form: FormGroup = this.formBuilder.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    // tslint:disable-next-line: max-line-length
    email: ['', [Validators.required, Validators.pattern(new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/))]],
    value_to_verify: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm_password: ['', [Validators.required, Validators.minLength(6)]],
    pass: [''],
    reset_password: [false],
    calle: [''],
    ciudad: [''],
    provincia: [''],
    zip: [''],
    isSuperUser: false,
    isNewUser: false,
    login_type: '',
    idIglesia: [Validators.required],
    telefono: ['', Validators.required],
    country_code: ['', Validators.required],
    idUserType: new FormControl(2, [Validators.required]),
    is_available: new FormControl(false, [Validators.required, Validators.pattern(/^(?:1|y(?:es)?|t(?:rue)?|on)$/i)])
  });

  userAvailable: boolean = false;
  errorChecking: boolean = false;
  isChecked: boolean = false;
  loading: boolean;
  typingTimer;                // timer identifier
  typingTimerLoading;         // timer identifier
  doneTypingInterval = 3000;
  serverBusy: boolean = false;

  viewDate: Date = new Date();
  viewDateNext: Date = new Date();
  events: CalendarEvent[] = [];

  visiblePixieModal: boolean = false;
  toggle_pass: {
    password: boolean,
    confirm_password: boolean
  } = {
      password: true,
      confirm_password: true
    };

  full_form: FormGroup = new FormGroup({
    user_status: new FormControl(undefined, [Validators.required]),
    get_started_form: this.formBuilder.group({
      value_to_verify: ['', [Validators.required]],
      login_type: ''
    }),
    login_form: this.formBuilder.group({
      usuario: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    }),
    register_form: this.formBuilder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      // tslint:disable-next-line: max-line-length
      email: ['', [Validators.required, Validators.pattern(new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/))]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required, Validators.minLength(6)]],
      pass: [''],
      reset_password: [false],
      calle: [''],
      ciudad: [''],
      provincia: [''],
      zip: [''],
      isSuperUser: false,
      isNewUser: false,
      login_type: '',
      idIglesia: [Validators.required],
      telefono: ['', Validators.required],
      country_code: ['', Validators.required],
      idUserType: new FormControl(2, [Validators.required]),
      is_available: new FormControl(false, [Validators.required, Validators.pattern(/^(?:1|y(?:es)?|t(?:rue)?|on)$/i)])
    }),
    additional_form: this.formBuilder.group({
      covid_quest: new FormControl(false, [Validators.required]),
      guests: new FormControl(0, [Validators.required, Validators.min(0)])
    })
  })

  origin: string;

  ngOnInit() {
    this.getGroupEvent();
    this.viewDate = moment().startOf('month').toDate();
    this.viewDateNext = moment(this.viewDate).add(1, 'M').endOf('M').toDate();
    // Activities
    $('#v-pills-tab a[href="#v-pills-activities"]').on('click', (e) => {
      e.preventDefault();
      this.view_event_activities_form.group_event = this.group_event;
      this.view_event_activities_form.group = this.group;
      this.view_event_activities_form.getActivities()
        .then(response => {
          console.log(response);

        })
        .catch(error => {
          console.log(error);

          this.groupsService.api.showToast(`Error getting the activities for this event.`, ToastType.error);
          this.show_detail_loading = false;
        });
    });

    // Reviews
    $('#v-pills-tab a[href="#v-pills-reviews"]').on('click', (e) => {
      e.preventDefault();
      console.log();
      this.view_event_reviews_form.group_event = this.group_event;
      this.view_event_reviews_form.group = this.group;
      this.view_event_reviews_form.getReviews()
        .then(response => {
        })
        .catch(error => {
          console.log(error);

          this.groupsService.api.showToast(`Error getting the reviews for this event.`, ToastType.error);
          this.show_detail_loading = false;
        });
    });

    // Finances
    $('#v-pills-tab a[href="#v-pills-finances"]').on('click', (e) => {
      e.preventDefault();
      this.view_event_finances_form.group_event = this.group_event;
      this.view_event_finances_form.group = this.group;
      this.view_event_finances_form.getFinances()
        .then(response => {
        })
        .catch(error => {
          this.groupsService.api.showToast(`Error getting the finances for this event.`, ToastType.error);
          this.show_detail_loading = false;
        });
    });

    // Finances
    $('#v-pills-tab a[href="#v-pills-attendances"]').on('click', (e) => {
      e.preventDefault();
      console.log(this.view_event_attendances_form);
      this.view_event_attendances_form.group_event = this.group_event;
      this.view_event_attendances_form.group = this.group;
      this.view_event_attendances_form.getAttendance()
        .then(response => {
        })
        .catch(error => {
          this.groupsService.api.showToast(`Error getting the attendances for this event.`, ToastType.error);
          this.show_detail_loading = false;
        });
    });
  }

  initForm() {
    console.log(this.group_event);

    if (this.group_event.idGroupEvent) {
      this.formGroup.patchValue(
        {
          idGroupEvent: this.group_event.idGroupEvent,
          // idFrequency: this.group_event.idFrequency
        }
      );
      // this.formGroup.removeControl('days');
      // this.formGroup.addControl('days', this.formBuilder.array([]));
      // this.dias = [];

      // this.onSelectFrequency();

      // this.formGroup.patchValue(
      //   {
      //     event_as_range: this.group_event.event_as_range
      //   }
      // );
      // if (this.group_event.is_exact_date) {
      //   this.printChange(this.group_event.is_exact_date);
      // } else {
      //   this.formGroup.get('event_current_week').setValue(moment(this.group_event.start_date).format('YYYY-MM-DD'));
      // }

      this.formGroup.patchValue(this.group_event);
      // if (this.group_event.days) {
      //   this.group_event.days.forEach(day => {
      //     this.addDay(day);
      //   });
      // }

      if (this.getPermissions()) {
        // Doesn't have permissions
        Object.keys(this.formGroup.controls).forEach(control => {
          this.formGroup.controls[control].disable({ onlySelf: true });
        });
      }
    }
  }

  printChange(event) {
    const is_range: boolean = this.formGroup.get('event_as_range').value;
    if (is_range) {
      this.formGroup.addControl('event_date_start', new FormControl(['', Validators.required]));
      this.formGroup.addControl('event_date_end', new FormControl(['', Validators.required]));
      this.formGroup.removeControl('event_date');
      this.formGroup.get('event_date_start').setValue(undefined);
      this.formGroup.get('event_date_end').setValue(undefined);
      this.formGroup.get('event_date_end').disable();
    } else {
      // this.formGroup.get('event_date_start').setValue(undefined);
      // this.formGroup.get('event_date_end').setValue(undefined);
      // this.formGroup.get('event_date_end').disable();
      this.formGroup.addControl('event_date', new FormControl(['', Validators.required]));
      this.formGroup.removeControl('event_date_start');
      this.formGroup.removeControl('event_date_end');
      this.formGroup.get('event_date').setValue(undefined);
    }
  }

  addDay(exist_day?: GroupEventDayModel) {
    let day;
    if (exist_day) {
      day = {
        idDay: exist_day.idDay,
        event_time_start: exist_day.event_time_start,
        event_time_end: exist_day.event_time_end,
      };
    } else {
      day = {
        idDay: 0,
        event_time_start: undefined,
        event_time_end: undefined,
      };

    }

    const control = this.days_on_form;

    control.push(this.formBuilder.group({
      idDia: new FormControl(day.idDay, [
        Validators.required,
        Validators.pattern(/[^0]+/),
        Validators.min(0)
      ]),
      event_time_start: new FormControl(day.event_time_start, [
        Validators.required
      ]),
      event_time_end: new FormControl(day.event_time_end, [
        Validators.required
      ])
    }
    ));
    this.dias.push(day);
  }

  getCover() {
    if (this.group_event) {
      if (this.group_event.picture) {
        return `url(${environment.serverURL}${this.group_event.picture})`;
      }
      return `url('/assets/img/default-cover-image.jpg`;
    } else {
      return `url('/assets/img/default-cover-image.jpg`;
    }
  }

  fixCover() {
    if (this.group_event) {
      if (this.group_event.picture) {
        return `${environment.serverURL}${this.group_event.picture}`;
      }
      return `/assets/img/default-cover-image.jpg`;
    } else {
      return `/assets/img/default-cover-image.jpg`;
    }
  }

  getPermissions() {
    // read only
    // if (this.group.is_leader) {
    //   return false;
    // }
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

  getGroupEvent() {
    this.show_detail_loading = true;
    const group_event = new GroupEventModel();
    group_event.idGroupEvent = this.id_group_event;
    this.groupsService.getGroupEventDetail(group_event)
      .subscribe((response: any) => {
        console.log(response);

        this.group_event = response.group;
        this.group_event['meta'] = {
          start_date: moment_tz.tz(this.group_event.start_date as string, 'YYYY-MM-DD', this.group_event.timezone).format('MMM. DD YYYY'),
          end_date: moment_tz.tz(this.group_event.end_date as string, 'YYYY-MM-DD', this.group_event.timezone).format('MMM. DD YYYY'),
          start_time: moment_tz.tz(this.group_event.event_time_start as string,'HH:mm',  this.group_event.timezone).format('hh:mm a'),
          end_time: moment_tz.tz(this.group_event.event_time_end as string, 'HH:mm', this.group_event.timezone).format('hh:mm a'),
          is_same_date: moment_tz.tz(this.group_event.full_end_date, this.group_event.timezone).isSame(moment_tz.tz(this.group_event.full_start_date, this.group_event.timezone), 'day'),
          is_same_hour: moment_tz.tz(this.group_event.full_end_date, this.group_event.timezone).isSame(moment_tz.tz(this.group_event.full_start_date, this.group_event.timezone), 'minute'),
          timezone: this.group_event.timezone
        }
        console.log(this.group_event['meta']);

        this.group_event.full_address = this.getAddress(this.group_event);

        this.checkUserEvents();

        if (this.currentUser || this.logged_user) {
          console.log(this.group_event);

          this.groupsService.getGroupDetail(this.group_event.idGroup, this.group_event.idOrganization)
            .subscribe((data_group: any) => {
              this.group = data_group.group;
              this.formGroup.patchValue(this.group_event);
              const promises: Promise<any>[] = [];
              promises.push(this.getActivities());
              promises.push(this.loadFrequencies());
              Promise.all(promises)
                .then(data => {
                  // view_event_activities_modal.open();
                  this.initForm();
                  console.log(this.view_event_activities_form);
                  console.log(this.view_event_reviews_form);

                  if (this.view_event_activities_form) {
                    this.view_event_activities_form.group_event = this.group_event;
                    this.view_event_activities_form.group = this.group;
                  }
                  if (this.view_event_reviews_form) {
                    this.view_event_reviews_form.group_event = this.group_event;
                    this.view_event_reviews_form.group = this.group;
                  }
                  if (this.view_event_finances_form) {
                    this.view_event_finances_form.group_event = this.group_event;
                    this.view_event_finances_form.group = this.group;
                  }
                  if (this.view_event_attendances_form) {
                    this.view_event_attendances_form.group_event = this.group_event;
                    this.view_event_attendances_form.group = this.group;
                  }
                  const hash = window.location.hash;
                  if (hash) {
                    setTimeout(() => {
                      ($(`${hash}`) as any).tab('show');
                      $(`${hash}`).trigger('click');
                    }, 500);
                  }

                  const query_params = this.route.snapshot.queryParams;
                  if (query_params.action === 'register') {
                    const user = this.logged_user || this.currentUser;
                    this.groupsService.checkMemberInEvent(user.idUsuario, this.group_event.idGroupEvent)
                      .subscribe((response: any) => {
                        console.log(response);
                        if (response.msg.Code === 200) {
                          this.showHowManyForm(user);
                          this.login_complete = true;
                        } else {
                          this.registerOnEvent(this.group_event);
                        }
                      });
                  } else {
                    this.actual_user_status = 'group_detail';
                  }
                  // this.hide_activities = false;
                  this.show_detail_loading = false;
                })
                .catch(error => {
                  console.error(error);
                  this.groupsService.api.showToast(`Error getting the activities for this event.`, ToastType.error);
                  this.show_detail_loading = false;
                });
            }, error => {
              console.error(error);
              const query_params = this.route.snapshot.queryParams;
              if (query_params.action === 'register') {
                this.registerOnEvent(this.group_event);
              } else {
                if (error.status === 404) {
                  this.groupsService.api.showToast(`The group of this event was deleted.`, ToastType.error);
                  this.handleRedirect();
                } else {
                  this.groupsService.api.showToast(`Something happened while trying to get the group details.`, ToastType.error);
                }
              }
            });
        } else {
          this.register_form.get('idIglesia').setValue(this.group_event.idOrganization);
          this.show_detail_loading = false;
        }
      });

  }

  registerOnEvent(event: any) {
    const user = this.logged_user || this.currentUser;
    console.log(user);

    if (user) {
      const additional_value = this.full_form.get('additional_form').value;
      this.groupsService.addMemberToEvent(user.idUsuario, event.idGroup, event.idGroupEvent, additional_value)
        .subscribe((response: any) => {
          this.group_event.confirmation_number = response.msg.confirmation_number;
          this.group_event.guests = response.msg.guests;
          if (response.msg.Code === 409) {
            const translate = this.translate_service.instant('events.already_member_in_event');
            this.groupsService.api.showToast(translate, ToastType.info);
            const url_without_action = this.router.url.split('?')[0];
            // this.router.navigateByUrl(url_without_action);
            // this.handleRedirectByRole(user);
            this.display_already_member = true;
            this.login_complete = false;
            this.actual_user_status = 'display_already_member';
          } else {
            const translate = this.translate_service.instant('events.you_were_added');
            this.groupsService.api.showToast(translate, ToastType.success);
            // const url_without_action = this.router.url.split('?')[0];
            // this.router.navigateByUrl(url_without_action);
            this.login_complete = true;
            this.actual_user_status = 'display_already_member';
            // this.handleRedirectByRole(user);
          }
        }, error => {
          console.error(error);
          this.groupsService.api.showToast('Error trying to add you to this event', ToastType.error);
        });
    } else {
      this.hideRegisterForm();
    }
  }

  checkUserEvents() {
    const user = this.currentUser;
    if (this.currentUser) {
      this.userService.getNextEvents(user.idUsuario, user.idIglesia)
        .subscribe((response: any) => {
          const events = response.events;
          const events_parsed = this.printEvents(events);
          this.group_event.is_member = false;
          events_parsed.forEach(event_parsed => {
            if (event_parsed.meta.idGroupEvent === this.group_event.idGroupEvent) {
              // User belongs to event
              this.group_event.is_member = true;
            }
          });
        }, error => {
          console.error(error);
        });
    }
  }

  printEvents(raw_events: GroupEventModel[]) {
    const events_to_return = [];

    const events = raw_events.concat([]);

    const events_clear = events
      .map(e => e.idGroupEvent)
      .map((e, index, final) => final.indexOf(e) === index && index)
      .filter(e => events[e]).map(e => events[e]);

    let i = 0;
    // iterate clean array to filter raw events and use the same color for each event.
    events_clear.forEach(event_clear => {
      const color = { primary: random_color(), secondary: random_color() };
      event_clear.color = color;
      events
        .filter(event => event.idGroupEvent === event_clear.idGroupEvent)
        // iterate filtered arrays
        .forEach(event => {
          let event_end;
          if (event.event_as_range) {
            // is range
            if (event.event_date_end) {
              event_end = (event.event_date_end as string).substring(0, 10) + ' ';
              event_end += event.event_time_end;
              event_end = moment(event_end).toDate();
            }
          } else {
            if (event.is_exact_date) {
              event_end = (event.event_date_ as string).substring(0, 10) + ' ';
              event_end += event.event_time_end;
              event_end = moment(event_end).toDate();
            }
          }
          let event_actual_date = moment(event.event_date_).toDate();
          const last_day_of_end = moment(this.viewDateNext).endOf('month').toDate();
          // const last_day_of_end = lastDayOfMonth(this.viewDateNext);
          do {
            let event_end_to_others;
            if (!event_end) {
              // Fix event_end for events without range and not exact date.
              event_end_to_others = moment(event_actual_date).format('YYYY-MM-DD hh:mm').substring(0, 10) + ' ';
              event_end_to_others += event.event_time_end;
              event_end_to_others = moment(event_end_to_others).toDate();
            }
            const event_fixed: CalendarEvent = {
              id: i++,
              color,
              title: event.name,
              start: moment(event_actual_date).toDate(),
              end: event_end ? event_end : event_end_to_others ? event_end_to_others : undefined,
              allDay: false,
              resizable: {
                beforeStart: false,
                afterEnd: false
              },
              draggable: false,
              meta: {
                idGroup: event.idGroup,
                idGroupEvent: event.idGroupEvent,
                name: event.name,
                description: event.description,
                attendances_count: event.attendances_count,
                attendances_total: event.attendances_total,
                picture: event.picture
              }
            };
            event_end_to_others = undefined;
            if (
              // Check that month and year is same.
              (event_actual_date.getMonth() === this.viewDate.getMonth() &&
                event_actual_date.getFullYear() === this.viewDate.getFullYear()) ||
              (event_actual_date.getMonth() === this.viewDateNext.getMonth() &&
                event_actual_date.getFullYear() === this.viewDateNext.getFullYear()) ||
              (moment(event_actual_date).isSameOrAfter(this.viewDate, 'minute') &&
                moment(event_actual_date).isSameOrBefore(this.viewDateNext, 'minute'))
            ) {
              if (event.repeat_until_date) {
                // Has until_date field
                if (moment(event.repeat_until_date).isSameOrAfter(event_actual_date, 'day')) {
                  // Validate that repeat until is same of after to add it to calendar.
                  // this.events.push(event_fixed);
                  events_to_return.push(event_fixed);
                }
              } else {
                // Added to calendar cause there isn't limit.
                // this.events.push(event_fixed);
                events_to_return.push(event_fixed);
              }
            }
            event_actual_date = moment(event_actual_date).add(event.quantity, this.parseSegment(event.segment)).toDate();
          } while (event_actual_date < last_day_of_end && event.quantity > 0);
        });
    });
    // Sort array for start date
    // this.events.sort((a, b) => {
    events_to_return.sort((a, b) => {
      return a.start > b.start ? 1 : -1;
    });

    // Fix id's to use it ascending
    let j = 0;
    // this.events.forEach(x => {
    events_to_return.forEach(x => {
      x.id = j++;
    });

    // Create copy temp to filter.
    // this.events_original = [...this.events];
    // this.events_original = [...events_to_return];

    // Get only colors to clean.
    const colors_clear = events_to_return
      .map(e => e.color.primary)
      // store the keys of the unique objects
      .map((e, index, final) => final.indexOf(e) === index && index)
      // eliminate the dead keys & store unique objects
      .filter(e => events_to_return[e]).map(e => events_to_return[e]);

    // Copy to events
    // this.events_clear = [...colors_clear];
    return events_to_return;
  }

  parseSegment(segment: string): moment.unitOfTime.DurationConstructor {
    switch (segment) {
      case 'day':
        return 'day';
      case 'month':
        return 'month';
      case 'year':
        return 'year';
      default:
        return 'day';
    }
  }

  handleRedirect() {
    if (this.currentUser.idUserType === 2) {
      this.router.navigate([`/user-profile/details/${this.currentUser.idUsuario}`]);
    } else {
      this.router.navigate(['dashboard']);
    }
  }

  getActivities() {
    // const array = ['activity', 'time', 'notes', 'teams_involved', 'resources', 'files', 'time_start', 'time_end'];
    // if (!this.getPermissions()) {
    //   array.push('actions');
    // }

    // this.displayedColumns = [...array];

    return new Promise((resolve, reject) => {
      this.groupsService.getEventActivities(this.group_event)
        .subscribe((response: any) => {
          this.group_event.activities = response.activities;
          // this.calculateStartsAndEnds();
          return resolve(this.group_event.activities);
        }, error => {
          if (error.error.msg.Code === 404) {
            this.group_event.activities = [];
            return resolve([]);
          }
          console.error(error);
          return reject([]);
        });
    });
  }

  getMin() {
    if (this.formGroup) {
      return this.formGroup.get('event_date_start').value;
    } else {
      return undefined;
    }
  }

  resetForm(formGroup: FormGroup, key: string) {
    formGroup.get(key).setValue(this.group_event[key]);
    formGroup.get(key).markAsPristine();
  }

  loadFrequencies() {
    return new Promise((resolve, reject) => {
      this.groupsService.getFrequencies()
        .subscribe((data: any) => {
          this.frequencies = data.frecuencias_v2;
          return resolve(true);
        }, error => {
          console.error(error);
          return reject(false);
        });
    });
  }

  onSelectFrequency() {
    const id_temp = +this.formGroup.get('idFrequency').value;
    if (id_temp === 0) {
      if (this.dias.length > 0) {
        const confirmation = confirm(`You add some days and these will be loose. Are you sure to continue?`);
        if (!confirmation) {
          this.formGroup.get('idFrequency').setValue(this.selected_frequency.id);
          return;
        }
        this.dias = [];
        this.formGroup.get('idFrequency').setValue(id_temp);
        this.formGroup.get('idFrequency').markAsPristine();
        this.days_on_form.controls.forEach(control => {
          const index = this.days_on_form.controls.indexOf(control);
          this.days_on_form.removeAt(index);
        });
      } else {
        this.selected_frequency = undefined;
      }
      return;
    }
    const freq_temp = this.frequencies.find(x => x.id === id_temp);
    if (freq_temp.is_exact_date && this.dias.length > 0) {
      const confirmation = confirm(`You add some days and these will be loose. Are you sure to continue?`);
      if (!confirmation) {
        this.formGroup.get('idFrequency').setValue(this.selected_frequency.id);
        return;
      }
    }
    const idFrequency = +this.formGroup.get('idFrequency').value;
    this.selected_frequency = this.frequencies.find(x => x.id === idFrequency);

    if (this.selected_frequency.is_exact_date) {
      this.days_on_form.controls.forEach(control => {
        const index = this.days_on_form.controls.indexOf(control);
        this.days_on_form.removeAt(index);
      });
      this.dias = [];
      this.formGroup.removeControl('event_current_week');
      this.formGroup.get('repeat_until_date').setValue(undefined);
      const is_range = this.formGroup.get('event_as_range').value;
      this.formGroup.addControl('event_time_start', new FormControl('', Validators.required));
      this.formGroup.addControl('event_time_end', new FormControl('', Validators.required));
      this.formGroup.addControl('event_time_end', new FormControl('', Validators.required));
      if (is_range) {
        // Clear event_date
        this.formGroup.removeControl('event_date');

        this.formGroup.addControl('event_date_start', new FormControl('', Validators.required));
        this.formGroup.addControl('event_date_end', new FormControl('', Validators.required));

      } else {
        // Clear event_start_date and end
        this.formGroup.addControl('event_date', new FormControl('', Validators.required));

        this.formGroup.removeControl('event_date_start');
        this.formGroup.removeControl('event_date_end');
      }
    } else {
      this.formGroup.addControl('event_current_week', new FormControl('', Validators.required));

      this.formGroup.removeControl('event_date');
      this.formGroup.removeControl('event_date_start');
      this.formGroup.removeControl('event_date_end');
      this.formGroup.removeControl('event_time_start');
      this.formGroup.removeControl('event_time_end');
    }
  }

  refreshTotals(event) {
    this.group_event.attendances_total = event.totals;
    this.group_event.attendances_count = event.count;
    this.group_event.attendances_available = event.available;
  }

  /*
   * Change cover
   */
  addCover() {
    this.input_file.nativeElement.onchange = (event: {
      target: { files: File[] };
    }) => {
      if (event.target.files.length > 0) {
        const confirmation = confirm(
          `You want to update this event cover?. This could take a while.`
        );
        if (confirmation) {
          this.photo = event.target.files[0];
          this.uploadCoverImage();
        }
      }
    };
    (this.input_file as ElementRef).nativeElement.click();
  }
  handlePixieExport(file: any) {
    this.visiblePixieModal = false;
    this.photo = file;
    this.uploadCoverImage();
  }

  uploadCoverImage() {
    this.uploadingCover = true;

    const indexPoint = (this.photo.name as string).lastIndexOf('.');
    const extension = (this.photo.name as string).substring(indexPoint);
    const ticks = (
      Number(String(Math.random()).slice(2)) +
      Date.now() +
      Math.round(performance.now())
    ).toString(36);
    const myUniqueFileName = `group_event_picture_${this.group_event.idGroup}_${this.group_event.idGroupEvent}_${ticks}${extension}`;
    const iglesia_temp = new OrganizationModel();
    iglesia_temp.idIglesia = this.currentUser.idIglesia;
    iglesia_temp.topic = this.currentUser.topic;

    this.organizationService
      .uploadFile(this.photo, iglesia_temp, myUniqueFileName, `events_pictures`)
      .then((response: any) => {
        // Update additional data
        this.group_event.picture = this.fus.cleanPhotoUrl(response.response);

        this.group_event.days.forEach(day => {
          day.idDia = day.idDay;
        });

        this.groupsService.updateEvent(this.group_event)
          .subscribe(response_updated => {
            // Reload Cover
            // this.getGroupEvent();
            this.uploadingCover = false;
          }, error => {
            console.error(error);
            this.uploadingCover = false;
            this.organizationService.api.showToast(
              `Something happened trying to save the slider.`,
              ToastType.error
            );
          }
          );
      }).catch(error => {
        this.uploadingCover = false;
      });
  }

  getGroupRouter() {
    const hash = window.location.hash;
    const item = {
      link: '',
      place: 'Group'
    };
    if (hash) {
      if (this.currentUser.isSuperUser || this.currentUser.idUserType === 1) {
        item.link = `/dashboard`;
      } else {
        item.link = `/user-profile/details/${this.currentUser.idUsuario}`;
      }
      item.place = 'Dashboard';
    } else {
      if (this.group_event) {
        if (!this.getPermissions()) {
          item.link = `/groups/details/${this.group_event.idGroup}`;
        } else {
          item.link = `/group/detail/${this.group_event.idGroup}`;
        }
      }
      item.place = 'Group';
    }
    return item;
  }

  submitForm(form: FormGroup) {
    // if (this.selected_frequency) {
    //   if (!this.selected_frequency.is_exact_date) {
    //     // not exact date
    //     form.value.event_date = undefined;
    //     form.value.event_date_start = undefined;
    //     form.value.event_date_end = undefined;
    //     form.value.event_time_start = undefined;
    //     form.value.event_time_end = undefined;
    //     if (this.dias.length === 0) {
    //       this.groupsService.api.showToast(`With this frequency you need to add at least one day.`, ToastType.info);
    //       return;
    //     }
    //   }
    // } else {
    //   this.groupsService.api.showToast(`You should select a frequency.`, ToastType.info);
    //   return;
    // }

    if (form.invalid) {
      this.groupsService.api.showToast(`Please check the form and try again`, ToastType.warning);
    }
    form.patchValue({ idGroup: this.group_event.idGroup });
    this.group_event = form.value;

    // this.group_event.is_exact_date = this.selected_frequency.is_exact_date;
    let subscription: Observable<any>;
    let message_error: string;
    let message_success: string;
    if (this.group_event.idGroupEvent) {
      subscription = this.groupsService.updateEvent(this.group_event);
      message_error = `Error updating the event.`;
      message_success = `Event updated successfully.`;
    } else {
      subscription = this.groupsService.addEvent(this.group_event);
      message_error = `Error adding the event.`;
      message_success = `Event added successfully.`;
    }
    subscription.subscribe(response => {
      this.groupsService.api.showToast(message_success, ToastType.success);
      // this.submit.emit(true);
    }, error => {
      console.error(error);
      if (error.error.msg.Code === 422) {
        this.groupsService.api.showToast(`${error.error.msg.Message}`, ToastType.info);
      } else {
        this.groupsService.api.showToast(message_error, ToastType.error);
        // this.submit.emit();
      }
    });
  }

  checkKey(event) {
    return event.code === 'Tab';
  }

  removeDay(dia) {
    const index = this.dias.indexOf(dia);
    if (index !== -1) {
      this.days_on_form.removeAt(index);
      this.dias.splice(index, 1);
    }
  }



  makeLogin(form: FormGroup) {
    if (form.invalid) {
      return this.groupsService.api.showToast(
        'error, name or password incorrect',
        ToastType.error
      );
    }
    // Start login progress
    this.show_detail_loading = true;

    const form_values = form.value;
    form_values.pass = UserService.encryptPass(form_values.password);
    this.groupsService.api
      .post(`users/login_v2`, form_values)
      .subscribe(
        (data: any) => {
          // Open user selection modal if needed
          if (data.users.length > 0) {
            const user = data.users[0];
            if (!user.estatus) {
              this.groupsService.api.showToast('This user was deleted.', ToastType.error);
              return;
            }
          }
          const active_users: any[] = data.users.filter(user => user.code !== 403);
          if (active_users.length > 1) {
            if (active_users[0].isSuperUser) {
              this.userSelectionList = active_users;
              this.selectLoginUser(active_users[0]);
            } else {
              this.userSelectionList = active_users;
              const same_church_as_event = this.userSelectionList.find(x => x.idIglesia === this.group_event.idOrganization);
              if (same_church_as_event) {
                this.selectLoginUser(same_church_as_event);
              } else {
                // Not user found for this organization.
                this.groupsService.api.showToast(`Your user doesn't belong to this organization. We will select another organization and you
                will be redirected.`, ToastType.success);
                this.selectLoginUser(active_users[0], true);
              }
              // this.modal.getModal('selectUserModal').open();
            }
          } else if (active_users.length === 1) {
            this.selectLoginUser(active_users[0]);
          } else {
            this.groupsService.api.showToast('Success', ToastType.success);
          }
        },
        err => {
          this.groupsService.api.showToast('E-mail or password incorrect', ToastType.error);
          this.show_detail_loading = false;
          // this.btnLogin = 'Login';
        },
        () => (this.show_detail_loading = false)
      );
  }

  selectLoginUser(user: any, should_redirect?: boolean) {
    user._loading = true;
    const userStr: string = JSON.stringify(user);
    // Store the current user on local storage
    localStorage.setItem('currentUser', userStr);

    let companies: any[];
    if (this.userSelectionList) {
      companies = this.userSelectionList.map(user => user.idIglesia);
    } else {
      companies = [user.idIglesia];
    }

    localStorage.setItem('companies', JSON.stringify(companies));
    this.currentUser = user;
    this.logged_user = user;
    this.login_complete = true;

    setTimeout(() => {
      this.app.footer.currentUser = user;
      this.app.menu.currentUser = user;
    });
    if (should_redirect) {
      this.handleRedirectByRole(user);
    } else {
      this.ngOnInit();
    }
  }

  showRegisterForm() {
    this.show_detail_loading = true;
    setTimeout(() => {
      this.login_form.reset();
      this.show_detail_loading = false;
      this.display_login_form = false;
      this.display_register_form = true;
      this.register_form.reset();
      this.initRegisterDefault();
    }, 350);
  }

  initRegisterDefault() {
    this.register_form.get('idUserType').setValue(2);
    this.register_form.get('idIglesia').setValue(this.group_event.idOrganization);
    this.register_form.get('isSuperUser').setValue(false);
    this.register_form.get('isNewUser').setValue(false);
  }

  hideRegisterForm(email?: string) {
    this.show_detail_loading = true;
    setTimeout(() => {
      this.login_form.reset();
      this.show_detail_loading = false;
      this.display_login_form = true;
      this.display_register_form = false;
      this.register_form.reset();
      if (email) {
        this.login_form.get('usuario').setValue(email);
      }
      this.additional_form.reset();
      this.additional_form.get('guests').setValue(0);
      this.initRegisterDefault();
    }, 350);
  }

  showLoading() {
    const email: string = this.register_form.get('email').value;
    if (!email) {
      return;
    }
    if (email.length > 4 && this.register_form.get('email').valid) {
      this.loading = true;
    }
  }

  startTimeout(event) {
    // clearTimeout(this.typingTimer);
    // clearTimeout(this.typingTimerLoading);
    // this.typingTimer = setTimeout(() => this.checkUser(), this.doneTypingInterval);
    // this.typingTimerLoading = setTimeout(() => this.showLoading(), 1000);
    if (!this.display_full_form) {
      this.userAvailable = false;
      this.isChecked = false;
    }
    // this.select_manual_organization = false;
  }

  clearTimeout(event) {
    clearTimeout(this.typingTimer);
    clearTimeout(this.typingTimerLoading);
  }

  checkUser() {
    const email: string = this.register_form.get('email').value;
    if (!email) {
      return;
    }
    if (email.length > 4 && this.register_form.get('email').valid) {
      let idIglesia: number;
      if (this.currentUser) {

        if (this.currentUser.isSuperUser) {
          idIglesia = 0;
        } else {
          idIglesia = this.currentUser.idIglesia;
        }
      } else {
        idIglesia = this.group_event.idOrganization;
      }
      this.userService.checkUserAvailable(email, idIglesia)
        .subscribe((response: any) => {
          this.loading = false;
          if (response.message && response.message === 'This user exists but not in your organization.') {
            // this.select_manual_organization = true;
            this.register_form.addControl('idUser', new FormControl(response.idUsuario));
            this.userAvailable = false;
            this.errorChecking = false;
            this.isChecked = true;
            return;
          }
          if (response.message && response.message === 'This user exist but was deleted.') {
            this.groupsService.api.showToast(`This user in this organization was deleted. Please contact the organization's admin.`, ToastType.info);
            return;
          }
          this.userAvailable = true;
          this.errorChecking = false;
          this.isChecked = true;
          // this.select_manual_organization = false;
        }, error => {
          console.error(error);
          this.loading = false;
          if (!error.error.msg.Message) {
            this.userAvailable = false;
            this.errorChecking = false;
            // this.select_manual_organization = false;
          } else {
            this.userAvailable = false;
            this.errorChecking = true;
          }
          this.isChecked = true;
        });
    }
  }

  onRegister() {
    this.serverBusy = true;
    const payload = this.register_form.value;
    let message_success: string;
    let message_error: string;

    payload.pass = UserService.encryptPass(payload.password);
    if (Array.isArray(payload.idIglesia)) {
      if (payload.idIglesia.length > 0) {
        payload.idIglesia = payload.idIglesia[0].idIglesia;
      } else {
        this.groupsService.api.showToast(`Please select a valid organization.`, ToastType.info);
        this.serverBusy = false;
        return;
      }
    } else if (payload.idIglesia == null) {
      this.groupsService.api.showToast(`Please select a valid organization.`, ToastType.info);
      this.serverBusy = false;
      return;
    }
    if (payload.idIglesia === 0) {
      this.groupsService.api.showToast(`Please select a valid organization.`, ToastType.info);
      this.serverBusy = false;
      return;
    }
    if (Array.isArray(payload.idUserType)) {
      if (payload.idUserType.length > 0) {
        payload.idUserType = payload.idUserType[0].idUserType;
      } else {
        this.groupsService.api.showToast(`Please select a valid role.`, ToastType.info);
        this.serverBusy = false;
        return;
      }
    } else if (payload.idUserType == null) {
      this.groupsService.api.showToast(`Please select a valid role.`, ToastType.info);
      this.serverBusy = false;
      return;
    }
    if (payload.idUserType === 0) {
      this.groupsService.api.showToast(`Please select a valid role.`, ToastType.info);
      this.serverBusy = false;
      return;
    }
    if (payload.password !== payload.confirm_password) {
      this.groupsService.api.showToast(`Your passwords didn't match.`, ToastType.info);
      this.serverBusy = false;
      return;
    }
    message_success = `User: ${payload.email}, created successfully.`;
    message_error = `Error creating user.`;
    // payload.created_by = this.currentUser.idUsuario;

    this.groupsService.api.post_old(`registerUsuario`, payload)
      .subscribe((data: any) => {
        payload.idUsuario = data.idUsuario;
        const idUsuario = payload.idUsuario;
        // const iglesia = this.userConfig.getIglesia();
        // const topic = iglesia.topic;
        // const device = this.userConfig.getDevice();
        this.groupsService.api.showToast(`${message_success}`, ToastType.success);
        this.serverBusy = false;
        this.selectLoginUser(payload);
        // this.registerOnEvent(this.group_event);
        // this.dismiss(data);
      }, err => {
        console.error(err);
        this.groupsService.api.showToast(`${message_error}`, ToastType.error);
        this.serverBusy = false;
      });
  }

  handleRedirectByRole(user: User) {
    if (user.idUserType === 1 || user.isSuperUser) {
      if (user.isSuperUser) {
        this.router.navigate(['/admin/organization']);
      } else {
        this.router.navigate(['dashboard']);
      }
      setTimeout(() => {
        this.app.footer.currentUser = user;
        this.app.menu.currentUser = user;
      });
    } else {
      this.router.navigate([`/user-profile/details/${user.idUsuario}`]);
    }
  }

  cancelResetForm() {
    this.display_register_form = true;
    this.display_login_form = false;
    this.display_reset_form = false;
    this.startTimeout({});
  }

  showResetPassForm() {
    this.display_register_form = true;
    this.display_login_form = false;
    this.display_reset_form = true;
    this.startTimeout({});
  }

  sendRecoveryEmail(form: FormGroup) {
    if (form.get('email').invalid) {
      return this.organizationService.api.showToast('Invalid e-mail format.', ToastType.error);
    }

    if (form.value) {
      this.loading = true;
      this.organizationService.api.post(`users/user_password_reset`, form.value).subscribe(
        data => {
          form.reset();
        },
        error => {
          console.error(error);
        },
        () => {
          this.loading = false;
          this.organizationService.api.showToast(
            `We've emailed you instructions for setting your password,
            if an account exists with the email you entered. You should receive them shortly.\n
            If you don't receive an email, please make sure you've entered the address you registered with, and check your spam folder.`,
            ToastType.info
          );
          this.display_reset_form = false;
          this.display_login_form = true;
          this.display_register_form = false;
        }
      );
    } else {
      this.organizationService.api.showToast(
        'Please check the form and try again',
        ToastType.error
      );
      this.loading = false;
    }
  }

  toggleAcceptace(form_group: FormGroup, field: string) {
    const actual_value = form_group.get(field).value;
    form_group.get(field).setValue(!actual_value);
  }

  cancelRegister() {
    this.register_form.get('is_available').setValue(false);
    this.display_full_form = false;
    const email = this.register_form.get('email').value;
    this.register_form.patchValue({ email });

    this.full_form.get('register_form').reset();
    this.full_form.get('register_form').get('idIglesia').setValue(this.group_event.idOrganization);
    this.full_form.get('register_form').get('idUserType').setValue(2);
    this.full_form.get('user_status').reset();
  }

  addQuantity(qty: number) {
    const original_qty = this.additional_form.get('guests').value;
    this.additional_form.get('guests').setValue(original_qty + qty);
  }

  validateInputType() {
    const value_to_verify: string = this.register_form.get('value_to_verify').value;
    let type: string = value_to_verify.includes('@') ? 'email' : 'phone';
    if (this.register_form.get('login_type')) {
      this.register_form.get('login_type').setValue(type);
    } else {
      this.register_form.addControl('login_type', new FormControl(type))
    }
    if (type === 'email') {
      const form_control = new FormGroup({
        value_to_verify: new FormControl(value_to_verify, [
          Validators.required,
          Validators.pattern(new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/))
        ])
      });
      if (form_control.get('value_to_verify').valid) {
        // continue
        this.continueHandleLogin();
      }
    } else {
      let only_numbers = true;
      let clean_text = value_to_verify.replace(/\s/g, '');
      clean_text = this.groupsService.api.remove_mask(clean_text);

      if (clean_text.length === 10) {
        for (let index = 0; index < clean_text.length; index++) {
          const char = clean_text[index];
          if (Number.isNaN(Number(char))) {
            only_numbers = false;
          }
        }

        if (only_numbers) {
          this.mask_service.maskExpression = '(000) 000-0000';
          this.mask_service.dropSpecialCharacters = false;
          const pipe = new MaskPipe(this.mask_service);
          const format_phone = pipe.transform(clean_text, this.mask_service.maskExpression);
          console.log(format_phone);
          this.register_form.get('value_to_verify').setValue(format_phone);
          // continue
          this.continueHandleLogin();
        } else {
          this.groupsService.api.showToast(`The phone number should has only numbers.`, ToastType.info);
        }
      } else {
        this.groupsService.api.showToast(`The phone number should has 10 digits.`, ToastType.info);
      }
      return;

    }
  }

  continueHandleLogin() {
    console.log('verify');
    console.log(this.register_form.value);
    const value_to_verify = this.register_form.get('value_to_verify').value;
    const login_type = this.register_form.get('login_type').value;
    let idIglesia: number;
    if (this.currentUser) {

      if (this.currentUser.isSuperUser) {
        idIglesia = 0;
      } else {
        idIglesia = this.currentUser.idIglesia;
      }
    } else {
      idIglesia = this.group_event.idOrganization;
    }
    this.userService.checkUserAvailable(value_to_verify, idIglesia, login_type)
      .subscribe((response: any) => {
        this.loading = false;
        if (response.message && response.message === 'This user exists but not in your organization.') {
          // this.select_manual_organization = true;
          this.register_form.addControl('idUser', new FormControl(response.idUsuario));
          this.userAvailable = false;
          this.errorChecking = false;
          this.isChecked = true;
          return;
        }
        if (response.message && response.message === 'This user exist but was deleted.') {
          this.groupsService.api.showToast(`This user in this organization was deleted. Please contact the organization's admin.`, ToastType.info);
          return;
        }
        this.userAvailable = true;
        this.errorChecking = false;
        this.isChecked = true;
        console.log(response);

        // this.select_manual_organization = false;
      }, error => {
        console.error(error);
        this.loading = false;
        if (!error.error.msg.Message) {
          this.userAvailable = false;
          this.errorChecking = false;
          // this.select_manual_organization = false;
        } else {
          this.userAvailable = false;
          this.errorChecking = true;
        }
        this.isChecked = true;
      });
  }


  getUserStatus(event: string) {
    this.full_form.get('user_status').setValue(event);
    console.log(this.full_form);
    this.full_form.get('login_form').reset();
    if (this.full_form.get('user_status').value === 'checked_ok') {
      this.full_form.get('register_form').get('idIglesia').setValue(this.group_event.idOrganization);
      this.full_form.get('register_form').get('idUserType').setValue(2);
      console.log(this.full_form.get('register_form'));
    }

  }

  cancelForm() {
    this.full_form.get('user_status').setValue(undefined);
  }

  loginResponse(response) {
    if (response) {
      console.log(response);
      this.currentUser = response;
      this.logged_user = response;
      this.ngOnInit();
    }
  }

  showHowManyForm(user) {
    console.log(user);
    this.full_form.get('user_status').setValue('how_many');
  }

  acceptInvitation(additional_value) {
    console.log(this.full_form.value);
    console.log(additional_value);
    // verify if is in group.
    const user = this.currentUser || this.logged_user;
    this.groupsService.checkMemberInEvent(user.idUsuario, this.group_event.idGroupEvent)
      .subscribe((response: any) => {
        console.log(response);
        if (response.msg.Code === 200) {
          this.logged_user = user;
        }
        this.selectLoginUser(user);
        this.registerOnEvent(this.group_event);
      });
  }

  get actual_user_status(): string {
    return this.full_form.get('user_status').value;
  }

  set actual_user_status(value: string) {
    this.full_form.get('user_status').setValue(value);
  }

  get iframeCode() {
    return {
      link: `${environment.server_calendar}/group/events/detail/${this.id_group_event}?action=register`
    };
  }

  async shareQR(qr_code) {
    const element = qr_code.qrcElement.nativeElement;
    const img_child = element.firstChild;
    try {
      const imgURL = img_child.src;
      const data = await fetch(imgURL);
      const blob = await data.blob();
      await navigator['clipboard'].write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      this.groupsService.api.showToast('QR copied to clipboard', ToastType.success);
    } catch (err) {
      console.error(err.name, err.message);
    }

  }

  openResetPassword(event) {
    this.actual_user_status = 'reset_password';
  }

  backToSearch() {
    this.router.navigateByUrl(`/organization-profile/main/${this.group_event.idOrganization}/inicio`);
  }

  getAddress(event) {
    let street = ``;
    if (event.street) {
      street = event.street;
    }
    if (event.city) {
      street = `${street}, ${event.city}`;
    }
    if (event.state) {
      street = `${street}, ${event.state}`;
    }
    if (event.zip_code) {
      street = `${street}, ${event.zip_code}`;
    }
    if (event.country) {
      street = `${street}, ${event.country}`;
    }
    while (street.startsWith(',')) {
      street = street.substring(1);
    }
    return street;
  }

}
