import { ViewEventActivitiesComponent } from './../../pages/groups/view-event-activities/view-event-activities.component';
import { Subject } from 'rxjs';
import { ToastType } from './../../login/ToastTypes';
import { GroupEventFormComponent } from './../../pages/groups/group-event-form/group-event-form.component';
import { GroupEventModel } from './../../models/GroupModel';
import { NgxSmartModalComponent } from 'ngx-smart-modal';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import * as moment from 'moment';
import * as moment_tz from 'moment-timezone';
import { GroupsService } from 'src/app/services/groups.service';
import {
  CalendarDateFormatter,
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarUtils,
  CalendarView,
} from 'angular-calendar';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { random_color } from 'src/app/models/Utility';
import { environment } from 'src/environments/environment';

export class EventTemplateSettingsModel {
  id?: number;
  idIglesiaProfile: number;
  idProfileTab: number;
  default_view: string;
  text_color: string;
  calendar_header_background: string;
  calendar_subheader_background: string;
  calendar_subheader_hover: string;
  show_attendances: boolean;
  show_capacity: boolean;
  show_v2: boolean;

  constructor() {
    this.default_view = 'list';
    this.text_color = '#000000';
    this.calendar_header_background = '#e65100';
    this.calendar_subheader_background = '#ff7529';
    this.calendar_subheader_hover = '#e65100';
    this.show_attendances = true;
    this.show_capacity = true;
    this.show_v2 = false;
  }
}

@Component({
  selector: 'app-event-calendar',
  templateUrl: './event-calendar.component.html',
  styleUrls: ['./event-calendar.component.scss']
})
export class EventCalendarComponent implements OnInit, OnChanges {

  ranges: {
    id: string,
    name: string,
    start_date: string,
    end_date: string,
    show_controls: boolean
  }[] = [
      {
        id: 'week',
        name: 'This week',
        start_date: moment_tz.tz().format('YYYY-MM-DD'),
        end_date: moment_tz.tz().add(7, 'day').format('YYYY-MM-DD'),
        show_controls: false
      },
      {
        id: 'next_month',
        name: 'Next month',
        start_date: moment_tz.tz().format('YYYY-MM-DD'),
        end_date: moment_tz.tz().add(1, 'month').format('YYYY-MM-DD'),
        show_controls: false
      },
      {
        id: 'next_3_month',
        name: 'Next 3 month',
        start_date: moment_tz.tz().format('YYYY-MM-DD'),
        end_date: moment_tz.tz().add(3, 'month').format('YYYY-MM-DD'),
        show_controls: false
      },
      {
        id: 'custom',
        name: 'Custom',
        start_date: moment_tz.tz().format('YYYY-MM-DD'),
        end_date: moment_tz.tz().add(3, 'month').format('YYYY-MM-DD'),
        show_controls: true
      },
    ];

  range_selected: {
    id: string,
    name: string,
    start_date: string,
    end_date: string,
    show_controls: boolean
  };

  @Input('filter_dates') filter_dates: { range: string, start_date: string, end_date: string } = {
    range: 'next_3_month',
    start_date: moment(new Date()).format('YYYY-MM-DD'),
    end_date: moment(new Date()).add(3, 'month').format('YYYY-MM-DD')
  };
  @Input('set_range') set_range: boolean = false;
  @Input('show_add_button') show_add_button: boolean = false;
  @Input('show_options') show_options: boolean = true;
  @Input('events') raw_events: GroupEventModel[] = [];
  @Input('idGroup') idGroup: number;
  @Input('idOrganization') idOrganization: number;
  @Input('show_view_type') show_view_type: boolean = false;
  @Input('view_type') view_type: string = 'calendar';
  @Input('event_template_settings') event_template_settings: EventTemplateSettingsModel;
  @Input('style_settings') style_settings: any;
  events: CalendarEvent[] = [];
  events_original: CalendarEvent[] = [];
  events_clear: any[] = [];;

  @Output('add_event') add_event: EventEmitter<any> = new EventEmitter();
  @Output('update_event') update_event: EventEmitter<CalendarEvent> = new EventEmitter<CalendarEvent>();
  @Output('view_activities') view_activities: EventEmitter<CalendarEvent> = new EventEmitter();
  @Output('view_reviews') view_reviews: EventEmitter<CalendarEvent> = new EventEmitter();
  @Output('view_finances') view_finances: EventEmitter<CalendarEvent> = new EventEmitter();
  @Output('view_attendances') view_attendances: EventEmitter<CalendarEvent> = new EventEmitter();
  @Output('make_refresh') make_refresh: EventEmitter<any> = new EventEmitter();
  @Output('go_back') go_back: EventEmitter<any> = new EventEmitter();

  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  viewDateNext: Date = new Date();
  activeDayIsOpen: boolean = true;
  activeSecondDayIsOpen: boolean = false;
  weekDays = this.utils.getWeekViewHeader({
    viewDate: this.viewDate,
    weekStartsOn: 0,
    excluded: [],
    weekendDays: [0, 6]
  });
  refresh: Subject<any> = new Subject();

  tag_filtered: CalendarEvent;
  is_filtered: boolean = false;

  private currentUser: any;
  iglesia
  most_recent: CalendarEvent;
  loading_colors: boolean = false;

  constructor(
    private userService: UserService,
    private groupsService: GroupsService,
    protected utils: CalendarUtils,
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  ngOnInit() {
    if (this.set_range) {
      console.log(this.filter_dates);
      this.range_selected = this.ranges.find(r => r.id === this.filter_dates.range);
      console.log(this.range_selected);
      this.filter_dates.range = this.range_selected.id;
    }
    this.viewDateNext = moment(this.viewDate).add(3, 'month').toDate();
    this.getIglesia();
    setTimeout(() => {
      // this.printEvents(this.raw_events);
      this.getEventsAsNewSchema(moment(this.viewDate).format('YYYY-MM-DD'), moment(this.viewDateNext).format('YYYY-MM-DD'));
    }, 200);

    if (this.event_template_settings) {
      this.setColors();
    }
  }

  ngOnChanges(event) {
    if (event.raw_events) {
      if (!event.raw_events.firstChange) {
        this.raw_events = event.raw_events.currentValue;
        // this.printEvents(this.raw_events);
        this.formatEvents();
      }
    } else if (event.event_template_settings) {
      this.loading_colors = true;
      this.setColors();
      setTimeout(() => {
        this.loading_colors = false;
      }, 200);
    }
  }

  getIglesia() {
    this.groupsService.api
      .get(`getIglesiaFullData/`, { idIglesia: this.idOrganization })
      .subscribe(
        (data: any) => {
          this.iglesia = data.iglesia;
        },
        (err: any) => console.error(err)
      );
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

  openModalAddEvent(
    // group_event_modal: NgxSmartModalComponent, group_event_form: GroupEventFormComponent
  ) {
    // group_event_form.group_event = new GroupEventModel();
    // group_event_form.group_event.idGroup = this.groupId;
    // group_event_form.loadFrequencies().then(success => {
    //   group_event_modal.open();
    //   // group_event_form.eventFormGroup.reset();
    //   group_event_form.selected_frequency = undefined;
    // }).catch(error => {
    //   this.groupsService.api.showToast(`Error getting frequencies. Please, try again later.`, ToastType.error);
    // });
    this.add_event.emit();
  }

  printEventsPdf() {
    let path: string;
    if (this.idGroup) {
      path = `${environment.apiUrl}/groups/events/pdf/?idGroup=${this.idGroup}&idIglesia=${this.idOrganization}&start=${this.filter_dates.start_date}&end=${this.filter_dates.end_date}`;
      if (this.currentUser) {
        path = `${path}&idUsuario=${this.currentUser.idUsuario}`;
      }
    } else {
      path = `${environment.apiUrl}/groups/events_organization/pdf?idIglesia=${this.idOrganization}`;
    }
    const win = window.open(path, "_blank");
    win.focus();
  }

  updateViewItems() {
    if (this.view_type === 'calendar') {
      this.viewDate = moment(this.filter_dates.start_date).startOf('M').toDate();
      this.viewDateNext = moment(this.viewDate).add(3, 'M').toDate();
      this.filter_dates = {
        range: 'next_3_month',
        start_date: moment(this.viewDate).format('YYYY-MM-DD'),
        end_date: moment(this.viewDateNext).format('YYYY-MM-DD')
      }
    } else {
      this.filter_dates = {
        range: 'next_3_month',
        start_date: moment(new Date()).format('YYYY-MM-DD'),
        end_date: moment(new Date()).add(3, 'month').format('YYYY-MM-DD')
      };
    }
    this.getEventsAsNewSchema(moment(this.filter_dates.start_date).format('YYYY-MM-DD'), moment(this.filter_dates.end_date).format('YYYY-MM-DD'))
  }

  closeOpenMonthViewDay(add: number) {
    this.activeDayIsOpen = false;
    this.activeSecondDayIsOpen = false;

    if (add > 0) {
      this.viewDate = moment(this.viewDate).add(add, 'M').toDate();
      this.viewDateNext = moment(this.viewDate).add(1, 'M').toDate();
    } else {
      this.viewDateNext = moment(this.viewDate).add(1, 'M').toDate();
    }

    this.filter_dates = {
      range: 'next_month',
      start_date: moment(this.viewDate).startOf('M').format('YYYY-MM-DD'),
      end_date: moment(this.viewDateNext).endOf('M').format('YYYY-MM-DD')
    };
    this.getEventsAsNewSchema(moment(this.filter_dates.start_date).format('YYYY-MM-DD'), moment(this.filter_dates.end_date).format('YYYY-MM-DD'))
    // this.printEvents(this.raw_events);
    this.setColors();
  }

  verifyColors() {
    if (this.view_type == 'calendar') {
      this.loading_colors = true;
      this.setColors();
      setTimeout(() => {
        this.loading_colors = false;
      }, 200);
    }
  }

  setColors() {
    setTimeout(() => {
      const elements: NodeListOf<HTMLElement> = document.getElementsByName('cal-header-custom');
      for (let index = 0; index < elements.length; index++) {
        const element = elements.item(index);
        element.style.setProperty('--header_background_color', this.event_template_settings.calendar_header_background);
      }
      const headers = document.getElementsByClassName('cal-header')
      for (let index = 0; index < headers.length; index++) {
        const element = headers.item(index) as HTMLElement;
        element.style.setProperty('--subheader_background_color', this.event_template_settings.calendar_subheader_background);
      }
      const cells = document.getElementsByClassName('cal-cell');
      for (let index = 0; index < cells.length; index++) {
        const element = cells.item(index) as HTMLElement;
        element.style.setProperty('--subheader_background_color_hover', this.event_template_settings.calendar_subheader_hover);
      }
    }, 100);
  }

  printEvents(raw_events: GroupEventModel[]) {
    this.events = [];

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
                idGroupEvent: event.idGroupEvent,
                description: event.description,
                attendances_count: event.attendances_count,
                attendances_total: event.attendances_total,
                capacity: event.capacity,
                picture: event.picture,
                all_day: event.all_day
              }
            };
            event_end_to_others = undefined;
            if (
              // Check that month and year is same.
              (
                event_actual_date.getMonth() === this.viewDate.getMonth()
                && event_actual_date.getFullYear() === this.viewDate.getFullYear()
              )
              ||
              (
                event_actual_date.getMonth() === this.viewDateNext.getMonth()
                && event_actual_date.getFullYear() === this.viewDateNext.getFullYear()
              )
            ) {
              if (event.repeat_until_date) {
                // Has until_date field
                if (moment(event.repeat_until_date).isSameOrAfter(event_actual_date, 'day')) {
                  // Validate that repeat until is same of after to add it to calendar.
                  this.events.push(event_fixed);
                }
              } else {
                // Added to calendar cause there isn't limit.
                this.events.push(event_fixed);
              }
            }
            event_actual_date = moment(event_actual_date).add(event.quantity, this.parseSegment(event.segment)).toDate();
          } while (event_actual_date < last_day_of_end && event.quantity > 0);
        });
    });
    // Sort array for start date
    this.events.sort((a, b) => {
      return a.start > b.start ? 1 : -1;
    });

    // Fix id's to use it ascending
    let j = 0;
    this.events.forEach(x => {
      x.id = j++;
    });

    // Create copy temp to filter.
    this.events_original = [...this.events];

    // Get only colors to clean.
    const colors_clear = this.events_original
      .map(e => e.color.primary)
      // store the keys of the unique objects
      .map((e, index, final) => final.indexOf(e) === index && index)
      // eliminate the dead keys & store unique objects
      .filter(e => this.events_original[e]).map(e => this.events_original[e]);

    // Copy to events
    this.events_clear = [...colors_clear];
    if (this.events.length > 0) {
      // const first_event: CalendarEvent = this.events_clear[0];
      const event_in_date = this.events.find((x: CalendarEvent) => {
        return moment(x.start).isSame(new Date(), 'day') || moment(new Date()).isBetween(x.start, x.end);
      });
      if (event_in_date) {
        this.dayClicked({ date: new Date(), events: this.events }, true);
      } else {
        this.activeDayIsOpen = false;
        this.activeSecondDayIsOpen = false;
      }
    } else {
      this.activeDayIsOpen = false;
      this.activeSecondDayIsOpen = false;
    }
  }

  fixDate(event) {
    if (event.target.value) {
      this.filter_dates.end_date = moment(event.target.value).endOf('W').format('YYYY-MM-DD');
    }
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }, init?: boolean): void {
    // if (moment(this.viewDate).isSame(date, 'month')) {
    //   if (
    //     (moment(this.viewDate).isSame(date, 'day') && this.activeDayIsOpen === true) ||
    //     events.length === 0
    //   ) {
    //     this.activeDayIsOpen = false;
    //   } else {
    //     this.activeDayIsOpen = true;
    //   }
    //   this.viewDate = date;
    // }
    if (moment(this.viewDate).isSame(date, 'month')) {
      if (
        (moment(this.viewDate).isSame(date, 'day') && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        if (init) {
          if (moment(new Date()).isSame(date, 'day')) {
            this.activeDayIsOpen = true;
          } else {
            this.activeDayIsOpen = false;
          }
        } else {
          this.activeDayIsOpen = true;
        }
      }
      this.viewDate = date;
    }

    if (moment(date).isSame(this.viewDateNext, 'month')) {
      if (
        (moment(this.viewDateNext).isSame(date, 'day') && this.activeSecondDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeSecondDayIsOpen = false;
      } else {
        this.activeSecondDayIsOpen = true;
      }
      this.viewDateNext = date;
    }
  }

  handleEvent(action: string, event: CalendarEvent): void {
    const event_id = document.getElementById(`event_${event.id}`);
    event_id.style.animationName = 'example';
    event_id.style.animationDuration = '2.5s';
    const options: ScrollIntoViewOptions = {
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    };
    event_id.scrollIntoView(options);
    setTimeout(() => {
      event_id.style.animationName = 'unset';
      // event_id.style.animationDuration = 'unset';
    }, 1000);
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map(iEvent => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  filterByTagColor(event: CalendarEvent) {
    if (this.is_filtered) {
      // filtered true
      if (this.tag_filtered.color.primary !== event.color.primary) {
        this.events = this.events_original.filter(ev => ev.color.primary === event.color.primary);
        this.tag_filtered = this.events[0];
      } else {
        this.is_filtered = false;
        this.events = [...this.events_original];
        this.tag_filtered = undefined;
      }
    } else {
      this.is_filtered = true;
      this.events = this.events_original.filter(ev => ev.color.primary === event.color.primary);
      this.tag_filtered = this.events[0];
    }
  }

  getRouterForEvent(group_event: GroupEventModel) {
    if (!this.getPermissions()) {
      return `/groups/events/detail/${group_event.idGroupEvent}`;
    }
    return `/group/events/detail/${group_event.idGroupEvent}`;
  }

  deleteEvent(event: CalendarEvent) {
    if (confirm(`Are you sure yo want to delete this event? This will delete any further events associated`)) {
      const group_event = event.meta as GroupEventModel;
      this.groupsService.deleteEvent(group_event)
        .subscribe(response => {
          // this.getGroup();
          this.make_refresh.emit();
          this.groupsService.api.showToast(`Event deleted.`, ToastType.info);
        }, error => {
          console.error(error);
          this.groupsService.api.showToast(`Error deleting event.`, ToastType.error);
        });
    }
  }

  openModalUpdateEvent(event: CalendarEvent) {
    this.update_event.emit(event);
  }

  viewEvent(event: CalendarEvent, action: string) {
    let emit: EventEmitter<CalendarEvent>;
    if (action === 'activities') {
      emit = this.view_activities;
    } else if (action === 'reviews') {
      emit = this.view_reviews;
    } else if (action === 'finances') {
      emit = this.view_finances;
    } else {
      emit = this.view_attendances;
    }
    emit.emit(event);
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

  fixUrl(image: string) {
    if (image) {
      if (image.includes('https://')) {
        return `${image}`;
      }
      return `${this.groupsService.api.baseUrl}${image}`;
    }
    if (this.iglesia) {
      const path = this.fixUrl(this.iglesia.portadaArticulos);
      return path;
    }
    return '/assets/img/default-image.jpg';
  }

  toggleScheme() {
    this.getEventsAsNewSchema(moment(this.viewDate).format('YYYY-MM-DD'), moment(this.viewDateNext).format('YYYY-MM-DD'));
    // if (this.new_schema) {
    // } else {

    // }
  }

  getEventsAsNewSchema(start_date: string, end_date: string) {
    this.events = [];
    if (this.idGroup) {
      this.formatEvents();
    } else {
      const resp = this.groupsService.getStandaloneGroupsEventsByIdIglesia(this.idOrganization, start_date, end_date, 'publish')
        .subscribe((response: any) => {
          resp.unsubscribe();
          if (response.events) {
            this.raw_events = response.events;
            this.formatEvents();
            if (this.view_type === 'list') {
              this.most_recent = this.events.find(x => moment(x.start).isAfter(moment(), 'minute') && x.meta.idFrequency === 1);
              if (this.most_recent) {
                const index = this.events.indexOf(this.most_recent);
                this.events.splice(index, 1);
              }

            } else {
              this.most_recent = undefined;
            }
          }
        }, error => {
          resp.unsubscribe();
          this.raw_events = [];
          this.formatEvents();
        });
    }
  }

  refreshEvents(event, control_name) {
    // if (control_name === 'end_date') {
    //   this.filter_dates.end_date = moment(this.filter_dates.end_date).endOf('W').format('YYYY-MM-DD');
    // }
    if ((control_name === 'start_date' || control_name === 'end_date') && this.filter_dates.range === 'custom') {
      const range = this.ranges.find(x => x.id === 'custom');
      if (control_name === 'start_date') {
        range.start_date = moment(this.filter_dates.start_date).format('YYYY-MM-DD');
      }
      if (control_name === 'end_date') {
        range.end_date = moment(this.filter_dates.end_date).format('YYYY-MM-DD');
      }
    }
    this.getEventsAsNewSchema(moment(this.filter_dates.start_date).format('YYYY-MM-DD'), moment(this.filter_dates.end_date).format('YYYY-MM-DD'))
  }

  formatEvents() {
    this.events = [];
    let i = 0;
    this.raw_events.forEach(event => {
      const color = { primary: random_color(), secondary: random_color() };
      const event_actual_date = event.start_date;
      let end_date;
      if (event.end_date) {
        end_date = moment_tz.tz(event.end_date, event.timezone).toDate();
      }

      const event_fixed: CalendarEvent = {
        id: i++,
        color,
        title: event.name,
        start: new Date(event.start_date),
        end: new Date(event.end_date),
        allDay: false,
        resizable: {
          beforeStart: false,
          afterEnd: false
        },
        draggable: false,
        meta: {
          idGroupEvent: event.idGroupEvent,
          description: event.description,
          attendances_count: event.attendances_count,
          attendances_total: event.attendances_total,
          capacity: event.capacity,
          picture: event.picture,
          idFrequency: event.idFrequency,
          start_date: moment_tz.tz(event.start_date, event.timezone).format('MMM. DD YYYY'),
          end_date: moment_tz.tz(event.end_date, event.timezone).format('MMM. DD YYYY'),
          start_time: moment_tz.tz(event.start_date, event.timezone).format('hh:mm a'),
          end_time: moment_tz.tz(event.end_date, event.timezone).format('hh:mm a'),
          is_same_date: moment_tz.tz(event.end_date, event.timezone).isSame(moment_tz.tz(event.start_date, event.timezone), 'day'),
          timezone: event.timezone,
          all_day: event.all_day
        }
      };
      this.events.push(event_fixed);
    });

    // Sort array for start date
    this.events.sort((a, b) => {
      return a.start > b.start ? 1 : -1;
    });

    // Fix id's to use it ascending
    let j = 0;
    this.events.forEach(x => {
      x.id = j++;
    });

    // Create copy temp to filter.
    this.events_original = [...this.events];

    // Get only colors to clean.
    const colors_clear = this.events_original
      .map(e => e.color.primary)
      // store the keys of the unique objects
      .map((e, index, final) => final.indexOf(e) === index && index)
      // eliminate the dead keys & store unique objects
      .filter(e => this.events_original[e]).map(e => this.events_original[e]);

    // Copy to events
    this.events_clear = [...colors_clear];
    if (this.events.length > 0) {
      // const first_event: CalendarEvent = this.events_clear[0];
      const event_in_date = this.events.find((x: CalendarEvent) => {
        return moment(x.start).isSame(new Date(), 'day') || moment(new Date()).isBetween(x.start, x.end);
      });
      if (event_in_date) {
        this.dayClicked({ date: new Date(), events: this.events }, true);
      } else {
        this.activeDayIsOpen = false;
        this.activeSecondDayIsOpen = false;
      }
    } else {
      this.activeDayIsOpen = false;
      this.activeSecondDayIsOpen = false;
    }
  }

  rangeChanged(event) {
    // console.log(event);
    this.range_selected = this.ranges.find(r => r.id === this.filter_dates.range);
    console.log(this.range_selected);
    this.filter_dates = {
      range: this.range_selected.id,
      start_date: this.range_selected.start_date,
      end_date: this.range_selected.end_date
    }
    this.refreshEvents(null, null);
  }

}
