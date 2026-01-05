import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject, config } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-list-levels',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  constructor(public api: ApiService, public userService: UserService, public modal: NgxSmartModalService) {
    this.user = userService.getCurrentUser()
  }

  // Data tables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: "Blfrtip",
    lengthMenu: [10, 25, 50, 100, 250, 500],
    order: [[1, 'asc']],
    rowReorder: true,
    buttons: [
      { extend: 'copy', className: 'btn btn-outline-primary btn-sm' },
      { extend: 'print', className: 'btn btn-outline-primary btn-sm' },
      { extend: 'csv', className: 'btn btn-outline-primary btn-sm' },
    ]
  }

  public levels: any[] = []
  public user: any
  public selectedLevel: any

  ngOnInit() {
    this.getLevels()
  }

  getLevels() {
    this.api.get(`getNiveles`, { idIglesia: this.user.idIglesia })
      .subscribe(
        (data: any) => {
          if (data.niveles && data.niveles.length) {
            this.levels = data.niveles.filter(nv => nv.estatus == true)
            this.restartTable()
          }
        },
        err => console.error(err),
        () => this.dtTrigger.next()
      )
  }

  /** Create a new level */
  createLevel(data: any) {
    // Set id iglesia
    data.idIglesia = this.user.idIglesia
    // Send post
    this.api.post('insertNivel', data)
      .subscribe(
        (data: any) => {
          if (data.msg.Code == 200) {
            this.getLevels()
            this.modal.getModal('levelFormModal_1').close()
          } else {
            console.log(data)
            alert(data.msg.Message)
          }
        },
        err => console.error(err)
      )
  }

  /** Update selected level */
  updateLevel(data: any) {
    // Set id iglesia
    data.idIglesia = this.user.idIglesia
    // Send post
    this.api.post('updateNivel', data)
      .subscribe(
        (data: any) => {
          if (data.msg.Code == 200) {
            this.getLevels()
            this.modal.getModal('editFormModal_1').close()
            this.selectedLevel = undefined
          } else {
            console.log(data)
            alert(data.msg.Message)
          }
        },
        err => console.error(err)
      )
  }

  deleteLevel(id: any) {
    if (!confirm(`Are you sure you want to delete this Level?`)) {
      return
    }

    // Deactivate Level
    this.api.post(`deleteReactivateNivel`, { idNivel: id, estatus: false })
      .subscribe(
        (res: any) => {
          if (res.msg.Code == 200) {
            this.getLevels()
          } else {
            alert(res.msg.Message)
          }
        },
        err => console.error(err)
      )
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      })
    }
  }


}
