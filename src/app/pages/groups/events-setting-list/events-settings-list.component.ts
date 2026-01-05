import { GoogleAddressComponent } from '../../../component/google-places/google-places.component';
import { Component, OnInit, ViewChild } from "@angular/core";
import { environment } from "src/environments/environment";
import { GroupsService } from "src/app/services/groups.service";
import { NgxSmartModalService, NgxSmartModalComponent } from "ngx-smart-modal";
import { UserService } from "src/app/services/user.service";
import { DataTableDirective } from "angular-datatables";
import { Observable, Subject } from "rxjs";
import { ToastType } from "src/app/login/ToastTypes";
import { GroupEventModel, GroupModel } from "src/app/models/GroupModel";
import { GroupEventSettingFormComponent } from "../group-event-setting-form/group-event-setting-form.component";
import { ViewEventActivitiesComponent } from "../view-event-activities/view-event-activities.component";
import { ViewEventReviewsComponent } from "../view-event-reviews/view-event-reviews.component";
import { ViewEventFinancesComponent } from "../view-event-finances/view-event-finances.component";
import { ViewEventAttendanceComponent } from "../view-event-attendance/view-event-attendance.component";
import { FileUploadService } from "src/app/services/file-upload.service";
import { GroupEventSettingFormV2Component } from '../group-event-setting-form-v2/group-event-setting-form-v2.component';

@Component({
  selector: "app-events-setting-list",
  templateUrl: "./events-settings-list.component.html",
  styleUrls: ["./events-settings-list.component.scss"],
})
export class EventsSettingListComponent implements OnInit {

  @ViewChild('group_event_setting_form_v2') group_event_setting_form_v2: GroupEventSettingFormV2Component;
  // Data tables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: "Blfrtip",
    lengthMenu: [10, 25, 50, 100, 250, 500],
    buttons: [
      { extend: "copy", className: "btn btn-outline-primary btn-sm" },
      {
        extend: "print",
        className: "btn btn-outline-primary btn-sm",
        action: this.print.bind(this),
      },
      { extend: "csv", className: "btn btn-outline-primary btn-sm" },
    ],
  };
  selected_event_id: number;
  iglesia: any;
  // { extend: 'print', className: 'btn btn-outline-primary btn-sm', action: this.print.bind(this) },

  // data
  public currentUser: any;
  public events: GroupEventModel[] = [];
  public totalEvents: number;
  selectedEvent: GroupEventModel;

  show_detail = false;
  show_detail_loading = false;
  hide_activities: boolean = true;
  hide_reviews: boolean = true;
  hide_finances: boolean = true;
  hide_attendance: boolean = true;

  total_attendances: {
    count: number;
    total: number;
  } = {
      count: 0,
      total: 0,
    };

  public iframeLang: string = "en";
  public iframeMode: string = "";
  public displayMode: string = "false";

  get iframeCode() {
    return {
      entry_point: '<div id="appEvents"></div>',
      scripts: `
<script>
var IDIGLESIA =${this.currentUser.idIglesia}
var LANG = '${this.iframeLang}'
var SLIDER = ${this.displayMode}
</script>
<script src="https://cdn.jsdelivr.net/npm/vue@2.5.16/dist/vue.js"></script>
<link
rel="stylesheet"
href="https://cdnjs.cloudflare.com/ajax/libs/flexboxgrid/6.3.1/flexboxgrid.min.css"
/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js"></script>
<link
href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap"
rel="stylesheet"
/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment-with-locales.min.js"></script>
<link rel="stylesheet" href="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/styles" />
<script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/vue-carousel"></script>
<script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/format-events"></script>
<script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/events${this.iframeMode}/scripts"></script>`,
      event_link: `${environment.server_calendar}/group/events/detail/${this.selected_event_id}?action=register`
    };
  }


  constructor(
    public groupsService: GroupsService,
    public modal: NgxSmartModalService,
    public userService: UserService,
    private fus: FileUploadService
  ) {
    // Load current user
    this.currentUser = this.userService.getCurrentUser();
  }

  ngOnInit() {
    this.getEvents();
    this.getIglesia();
  }

  /**
   * Retrieve events list from API
   */
  getEvents() {
    this.groupsService.getGroupsEventsSettingByIdIglesia().subscribe(
      (data: any) => {
        this.events = data.events;
        this.restartTable();
        this.totalEvents = this.events.length;
        this.total_attendances = {
          count: 0,
          total: 0,
        };
        this.events.forEach((event) => {
          this.total_attendances.count += event.attendances_count;
          this.total_attendances.total += event.attendances_total;
        });
      },
      (error) => {
        console.error(error);
        if (error.error.msg.Code === 404) {
          // this.groupsService.api.showToast(
          //   `There aren't events yet.`,
          //   ToastType.info,
          //   `Nothing found.`
          // );
        } else {
          this.groupsService.api.showToast(
            `Something happened while trying to get organization's events.`,
            ToastType.error
          );
        }
      },
      () => this.dtTrigger.next()
    );
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
  }

  // addGroup(groupFormModal: NgxSmartModalComponent, group_form: GroupFormComponent) {
  //   group_form.ngOnInit();
  //   groupFormModal.open();
  // }

  updateGroup() {
    this.modal.getModal("editFormModal").close();
    setTimeout(() => {
      this.getEvents();
    }, 300);
  }

  fixUrl(url: string) {
    if (url) {
      if (url.includes("https")) {
        return url;
      } else {
        if (url.startsWith('/')) {
          return `${environment.serverURL}${url}`;
        }
        return `${environment.serverURL}/${url}`;
      }
    } else {
      if (this.iglesia) {
        const path = this.fixUrl(this.iglesia.portadaArticulos);
        return path;
      }
      return "assets/img/default-image.jpg";
    }
  }

  getIglesia() {
    this.groupsService.api
      .get(`getIglesiaFullData/`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          this.iglesia = data.iglesia;
        },
        (err: any) => console.error(err)
      );
  }

  onModalDidDismiss(categoryFormModal: NgxSmartModalComponent, response?: any) {
    categoryFormModal.close();
  }

  print() {
    const path: string = `${environment.apiUrl}/groups/events_organization/pdf?idIglesia=${this.currentUser.idIglesia}`;
    const win = window.open(path, "_blank");
    win.focus();
  }

  openModalUpdateEvent(
    group_event_modal: NgxSmartModalComponent,
    group_event_setting_form: GroupEventSettingFormComponent,
    group_event: GroupEventModel
  ) {
    if (group_event.is_v2) {
      // V2
      this.openEventSettingFormV2(group_event);
    } else {
      const promises = [];
      promises.push(group_event_setting_form.loadFrequencies());
      console.log("1")
      promises.push(
        this.groupsService.getSettingEventDetail(group_event).toPromise()
      );
      group_event_setting_form.init_map = false;
      group_event_setting_form.showGroupDropdown();
      Promise.all(promises)
        .then((success) => {
          const group_event_response = success[1].group;
          if (group_event_response.idFrequency == 7) {
            group_event_response.each_date = group_event_response.custom_dates.filter(x => x.has_own_time).length > 0;
          }
          group_event_setting_form.group_event = Object.assign({}, group_event_response);
          // group_event_setting_form.group_event.idGroup = this.groupId;
          if (group_event_setting_form.eventFormGroup.get('custom_dates')) {
            group_event_setting_form.eventFormGroup.removeControl('each_date');
            group_event_setting_form.eventFormGroup.removeControl('custom_dates');
          }
          group_event_setting_form.ngOnInit();
          group_event_modal.open();
        })
        .catch((error) => {
          console.error(error);
          this.groupsService.api.showToast(
            `Error getting event info. Please, try again later.`,
            ToastType.error
          );
        });
    }
  }
  async openEventSettingFormV2(group_event: GroupEventModel) {
    this.selected_event_v2 = Object.assign({}, group_event);
    const modal = this.modal.get('group_event_modal_v2');
    const response: any = await this.groupsService.getSettingV2(group_event).toPromise().catch(error => {
      console.error(error);
      return;
    });
    if (response) {
      modal.open();
      setTimeout(() => {
        if (this.group_event_setting_form_v2) {
          this.group_event_setting_form_v2.setGroupEvent(response);
        }
      }, 100);
    }
  }

  deleteEvent(event: GroupEventModel) {
    if (
      confirm(
        `Are you sure yo want to delete this event setting? This will delete any further events associated`
      )
    ) {
      const group_event = event;
      this.groupsService.deleteSettingEvent(group_event).subscribe(
        (response) => {
          this.getEvents();
          this.updateRequestCount()
          this.groupsService.api.showToast(`Event deleted.`, ToastType.info);
        },
        (error) => {
          console.error(error);
          this.groupsService.api.showToast(
            `Error deleting event.`,
            ToastType.error
          );
        }
      );
    }
  }

  viewActivities(
    event: GroupEventModel,
    view_event_activities_form: ViewEventActivitiesComponent
  ) {
    this.show_detail_loading = true;
    this.groupsService.getGroupEventDetail(event).subscribe((response: any) => {
      const group = new GroupModel();
      group.is_leader = event.is_leader;
      group.idGroup = event.idGroup;
      view_event_activities_form.group = group;
      view_event_activities_form.group_event = response.group;
      view_event_activities_form
        .getActivities()
        .then((data) => {
          // view_event_activities_modal.open();
          this.selectedEvent = response.group;
          this.show_detail_loading = false;
          this.hide_activities = false;
        })
        .catch((error) => {
          this.groupsService.api.showToast(
            `Error getting the activities for this event.`,
            ToastType.error
          );
          this.show_detail_loading = false;
        });
    });
  }

  viewReviews(
    event: GroupEventModel,
    view_event_reviews_form: ViewEventReviewsComponent
  ) {
    this.show_detail_loading = true;
    this.groupsService.getGroupEventDetail(event).subscribe((response: any) => {
      const group = new GroupModel();
      group.is_leader = event.is_leader;
      group.idGroup = event.idGroup;
      view_event_reviews_form.group = group;
      view_event_reviews_form.group_event = response.group;
      view_event_reviews_form
        .getReviews()
        .then((data) => {
          // view_event_activities_modal.open();
          this.selectedEvent = response.group;
          this.show_detail_loading = false;
          this.hide_reviews = false;
        })
        .catch((error) => {
          this.groupsService.api.showToast(
            `Error getting the activities for this event.`,
            ToastType.error
          );
          this.show_detail_loading = false;
        });
    });
  }

  viewFinance(
    event: GroupEventModel,
    view_event_finances_form: ViewEventFinancesComponent
  ) {
    this.show_detail_loading = true;
    this.groupsService.getGroupEventDetail(event).subscribe((response: any) => {
      const group = new GroupModel();
      group.is_leader = event.is_leader;
      group.idGroup = event.idGroup;
      view_event_finances_form.group = group;
      view_event_finances_form.group_event = response.group;
      view_event_finances_form
        .getFinances()
        .then((data) => {
          // view_event_activities_modal.open();
          this.selectedEvent = response.group;
          this.show_detail_loading = false;
          this.hide_finances = false;
        })
        .catch((error) => {
          this.groupsService.api.showToast(
            `Error getting the finances for this event.`,
            ToastType.error
          );
          this.show_detail_loading = false;
        });
    });
  }

  closeViews(event?: any) {
    if (!this.hide_attendance) {
      if (event) {
        this.getEvents();
      }
    }
    this.hide_activities = true;
    this.hide_reviews = true;
    this.hide_finances = true;
    this.hide_attendance = true;
    this.selectedEvent = undefined;
  }

  viewAttendance(
    event: GroupEventModel,
    view_event_attendance_form: ViewEventAttendanceComponent
  ) {
    this.show_detail_loading = true;
    this.groupsService.getGroupEventDetail(event).subscribe((response: any) => {
      view_event_attendance_form.was_saved = false;
      const group = new GroupModel();
      group.is_leader = event.is_leader;
      group.idGroup = event.idGroup;
      view_event_attendance_form.group = group;
      view_event_attendance_form.group_event = response.group;
      view_event_attendance_form
        .getAttendance()
        .then((data) => {
          // view_event_activities_modal.open();
          this.selectedEvent = response.group;
          this.show_detail_loading = false;
          this.hide_attendance = false;
        })
        .catch((error) => {
          this.groupsService.api.showToast(
            `Error getting the attendance for this event.`,
            ToastType.error
          );
          this.show_detail_loading = false;
        });
    });
  }

  reloadEvents(group_event_modal: NgxSmartModalComponent, event: any) {
    group_event_modal.close();
    if (event === true) {
      // load events.
      this.getEvents();
    }
  }

  openModalAddEvent(
    group_event_modal: NgxSmartModalComponent,
    group_event_setting_form: GroupEventSettingFormComponent
  ) {
    group_event_setting_form.group_event = new GroupEventModel();
    // group_event_setting_form.group_event.idGroup = this.groupId;
    group_event_setting_form.init_map = false;
    group_event_setting_form
      .loadFrequencies()
      .then((success) => {
        group_event_modal.open();
        group_event_setting_form.showGroupDropdown();
        group_event_setting_form.selected_frequency = undefined;
        group_event_setting_form.init_map = true
        group_event_setting_form.eventFormGroup.reset();
        if (group_event_setting_form.eventFormGroup.get('custom_dates')) {
          group_event_setting_form.eventFormGroup.removeControl('each_date');
          group_event_setting_form.eventFormGroup.removeControl('custom_dates');
        }
        while (group_event_setting_form.days_on_form.length > 0) {
          group_event_setting_form.days_on_form.removeAt(0);
        }
        group_event_setting_form.dias = [];
        group_event_setting_form.eventFormGroup.get('publish_status').setValue('draft');
        // group_event_setting_form.multi_select.selectedItems = [];
      })
      .catch((error) => {
        console.log(error);

        this.groupsService.api.showToast(
          `Error getting frequencies. Please, try again later.`,
          ToastType.error
        );
      });
  }

  openModalAddEventV2(form_event_modal: NgxSmartModalComponent) {
    this.selected_event_v2 = new GroupEventModel();
    form_event_modal.open();
    // group_event_setting_form.group_event = new GroupEventModel();
    // // group_event_setting_form.group_event.idGroup = this.groupId;
    // group_event_setting_form.init_map = false;
    // group_event_setting_form
    //   .loadFrequencies()
    //   .then((success) => {
    //     group_event_modal.open();
    //     group_event_setting_form.showGroupDropdown();
    //     group_event_setting_form.selected_frequency = undefined;
    //     group_event_setting_form.init_map = true
    //     group_event_setting_form.eventFormGroup.reset();
    //     if (group_event_setting_form.eventFormGroup.get('custom_dates')) {
    //       group_event_setting_form.eventFormGroup.removeControl('each_date');
    //       group_event_setting_form.eventFormGroup.removeControl('custom_dates');
    //     }
    //     while (group_event_setting_form.days_on_form.length > 0) {
    //       group_event_setting_form.days_on_form.removeAt(0);
    //     }
    //     group_event_setting_form.dias = [];
    //     group_event_setting_form.eventFormGroup.get('publish_status').setValue('draft');
    //     // group_event_setting_form.multi_select.selectedItems = [];
    //   })
    //   .catch((error) => {
    //     console.log(error);

    //     this.groupsService.api.showToast(
    //       `Error getting frequencies. Please, try again later.`,
    //       ToastType.error
    //     );
    //   });
  }

  updateRequestCount() {
    let subscription: Observable<any>;

    subscription = this.groupsService.getRequestCount();
    subscription.subscribe(response => {
      this.groupsService.helpRequestCount = response.count
    }, error => {
      console.error(error);
    });
  }
  resetForm(group_event_setting_form: GroupEventSettingFormComponent) {
    group_event_setting_form = new GroupEventSettingFormComponent(
      group_event_setting_form.groupService,
      group_event_setting_form.formBuilder,
      group_event_setting_form.fus,
      group_event_setting_form.userService,
      group_event_setting_form.organizationService,
      group_event_setting_form.wpService,
      group_event_setting_form.api,
      group_event_setting_form.ngZone,
      group_event_setting_form.designRequestService,
      group_event_setting_form.router
    );
  }

  selected_event_v2: any;

  handleCloseV2(event?: any) {
    this.selected_event_v2 = undefined;
    this.modal.get('group_event_modal_v2').close();
    if (event === true) {
      // load events.
      this.getEvents();
    }
  }
}
