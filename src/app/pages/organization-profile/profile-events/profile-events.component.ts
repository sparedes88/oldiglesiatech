import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import * as moment from 'moment';

@Component({
  selector: 'app-profile-events',
  templateUrl: './profile-events.component.html',
  styleUrls: ['./profile-events.component.scss']
})
export class ProfileEventsComponent implements OnInit {

  @Input('idOrganization') idOrganization: number;
  @Input('iglesia') iglesia: any;
  events: any[] = [];

  constructor(
    private api: ApiService
  ) { }

  ngOnInit() {
    this.getEvents();
  }

  getEvents() {
    this.api
      .post(`groups/getGroupsEventsByIdIglesia`, {
        idIglesia: this.idOrganization,
        publish_status: 'publish',
      })
      .subscribe(
        (data: any) => {
          data.events.map(function (event) {
            event.order = moment(event.event_date || event.start_date)
              .toDate()
              .getTime();
          });

          this.events = data.events
            .filter(function (event) {
              const time = moment(event.order).add(24, "hours");
              const today = moment();
              return time > today;
            })
            .sort(function (a, b) {
              return a.order - b.order;
            });
        },
        (err: any) => {
          this.events = [];
        },
        () => {
          //this.loadingIglesia = false
        }
      );
  }

  fixUrl(image: string) {
    if (image) {
      if (image.includes('https://')) {
        return `${image}`;
      }
      return `${this.api.baseUrl}${image}`;
    }
    if (this.iglesia) {
      if (this.iglesia.portadaArticulos) {
        const path = this.fixUrl(this.iglesia.portadaArticulos);
        return path;
      }
    }
    return 'assets/img/default-image.jpg';
  }

}
