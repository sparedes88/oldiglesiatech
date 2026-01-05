import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GroupEventModel } from 'src/app/models/GroupModel';
import { environment } from 'src/environments/environment';
import { ToastType } from 'src/app/login/ToastTypes';
import { GroupsService } from 'src/app/services/groups.service';

@Component({
  selector: 'app-select-events',
  templateUrl: './select-events.component.html',
  styleUrls: ['./select-events.component.scss']
})
export class SelectEventsComponent implements OnInit {

  @Input() id: string;
  @Output() select_event = new EventEmitter<any>();

  events: GroupEventModel[] = [];

  constructor(
    private groupsService: GroupsService
  ) { }

  ngOnInit() {
    this.getEvents();
  }

  goToRouterEvent(event: GroupEventModel) {
    if (event) {
      if (!this.id) {
        this.id = 'home';
      }
      this.select_event.emit(
        {
          url: `/groups/events/detail/${event.idGroupEvent}`,
          id: this.id
        });
    }
  }

  fixUrl(event: GroupEventModel) {
    if (event.picture) {
      return `${environment.serverURL}${event.picture}`;
    }
    return `assets/img/default-cover-image.jpg`;
  }

  /**
   * Retrieve events list from API
   */

  getEvents() {
    this.groupsService.getGroupsEventsByIdIglesia().subscribe(
      (data: any) => {
        this.events = data.events;
      },
      error => {
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
      });
  }

  getCoverByID() {
    if (this.id) {
      switch (this.id) {
        case 'activities':
          return `/assets/img/event_planning_banner_new.png`;
        case 'reviews':
          return `/assets/img/event_review_banner_new.png`;
        case 'finances':
          return `/assets/img/event_finance_banner_new.png`;
        case 'attendances':
          return `/assets/img/event_attendance_banner_new.png`;
        default:
          return `/assets/img/events_banner_new.png`;
      }
    }
  }

  dismiss() {
    this.select_event.emit();
  }
}
