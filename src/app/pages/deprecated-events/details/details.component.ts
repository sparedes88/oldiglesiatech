import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  constructor(
    public api: ApiService,
    public route: ActivatedRoute,
    public snackbar: MatSnackBar,
    public userService: UserService) {
    this.eventId = route.snapshot.params['id']
  }

  // Data
  public currentUser: any = this.userService.getCurrentUser()
  public eventId: any
  public event: any = {}

  ngOnInit() {
    this.getEvent()
  }

  getEvent() {
    this.api.get(`getEventos`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (response: any) => {
          if (response.msg.Code == 200) {
            this.event = response.eventos.find(ev => ev.idEvento == this.eventId)
          } else {
            this.snackbar.open(`Status ${response.msg.Code}: ${response.msg.Message}`, 'Ok')
          }
        },
        err => {
          console.error(err)
          this.snackbar.open(`Couldn't load the event list`, 'Ok')
        }
      )
  }

  get urlAttr() {
    if (this.event && this.event.foto) {
      return `url("${this.event.foto}")`
    } else {
      return `url("/assets/img/default-image.jpg")`
    }
  }

}
