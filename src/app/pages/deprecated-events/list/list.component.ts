import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { MatSnackBar } from '@angular/material';
import * as Moment from 'moment'
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  constructor(
    public api: ApiService,
    public userService: UserService,
    public modal: NgxSmartModalService,
    public snackbar: MatSnackBar) {
    this.user = this.userService.getCurrentUser()
  }

  // Data tables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: "Blfrtip",
    lengthMenu: [10, 25, 50, 100, 250, 500],
    buttons: [
      { extend: 'copy', className: 'btn btn-outline-primary btn-sm' },
      { extend: 'print', className: 'btn btn-outline-primary btn-sm' },
      { extend: 'csv', className: 'btn btn-outline-primary btn-sm' },
    ]
  }

  /** DATA */
  public user: any
  public events: any[] = []
  public selectedEvent: any

  ngOnInit() {
    this.getEvents()
  }

  /**
   * Get the list of events for the current chuch
   */
  getEvents() {
    this.api.get(`getEventos`, { idIglesia: this.user.idIglesia })
      .subscribe(
        (response: any) => {
          if (response.msg.Code == 200) {
            this.events = response.eventos
          } else {
            this.snackbar.open(`Status ${response.msg.Code}: ${response.msg.Message}`, 'Ok')
          }
          this.restartTable()
        },
        err => {
          console.error(err)
          this.snackbar.open(`Couldn't load the event list`, 'Ok')
        },
        () => this.dtTrigger.next()
      )
  }

  addEvent(data: any) {
    this.api.post(`insertEvento`, data)
      .subscribe(
        (data: any) => {
          this.getEvents()
          this.modal.getModal('eventFormModal').close()
        },
        err => {
          console.error(err)
          this.snackbar.open(`Couldn't create the new event, please check the form`, 'Ok', { duration: 3000 })
        }
      )
  }

  updateEvent(data: any) {
    this.api.post(`updateEvento`, data)
      .subscribe(
        (data: any) => {
          this.getEvents()
          this.modal.getModal('eventEditModal').close()
        },
        err => {
          console.error(err)
          this.snackbar.open(`Couldn't update the event, please check the form`, 'Ok', { duration: 3000 })
        }
      )
  }

  /** Convert 24h format to 12h */
  getTimeAs12h(time: string) {
    Moment(time, 'HH:mm').format('hh:mm')
  }

  /** Open edit modal for event */
  openEditModal(event) {
    this.selectedEvent = event
    this.modal.getModal('eventEditModal').open()
  }

  /** Delete an event */
  deleteEvent(event) {
    if (!confirm(`Are you sure you want to delete this Event?`)) {
      return false
    }
    this.api.post(`deleteReactivateEvento`, { idEvento: event.idEvento, estatus: false })
      .subscribe(
        (data: any) => {
          this.getEvents()
        },
        err => {
          console.error(err)
          this.snackbar.open(`Couldn't delete the event!`, 'Ok', { duration: 3000 })
        }
      )
  }

  /** Destroy table instance */
  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      })
    }
  }
}
