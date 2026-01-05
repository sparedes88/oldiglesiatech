import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'process-levels',
  templateUrl: './levels.component.html',
  styleUrls: ['./levels.component.scss']
})
export class LevelsComponent implements OnInit {

  constructor(
    public api: ApiService, public userService: UserService, public modal: NgxSmartModalService) {
    this.currentUser = userService.getCurrentUser()
  }

  currentUser: any
  selectedLevel: any

  // IO
  @Input() process: any
  @Output() onChange = new EventEmitter()

  // Data
  levels: any[] = []

  ngOnInit() {
    this.getLevels()
  }

  getLevels() {
    if (this.process && this.process.levels) {
      this.levels = this.process.levels.filter(lvl => lvl.estatus == true)
    }
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.levels, event.previousIndex, event.currentIndex);
    this.exchangeOrder(event)
  }

  exchangeOrder(event) {
    // Get prev item
    const current: any = this.levels[event.currentIndex]
    const currentOrder: number = current.orden
    // Get next item
    const prev: any = this.levels[event.previousIndex]
    const prevOrder: number = prev.orden

    // Clean previous order
    // Exchange order
    current.orden = prevOrder
    prev.orden = currentOrder

    this.updateLevel(current, false)

    this.updateLevel(prev, false)
  }

  /** Create a new level */
  createLevel(data: any) {
    // Set id iglesia
    data.idIglesia = this.currentUser.idIglesia
    // Send post
    this.api.post('insertNivel', data)
      .subscribe(
        (res: any) => {
          if (data.msg.Code == 200) {
            this.getLevels()
            this.modal.getModal('levelFormModal').close()
            this.onChange.emit()
          } else {
            console.log(data)
            alert(res.msg.Message)
          }
        },
        err => console.error(err)
      )
  }

  /** Update selected level */
  updateLevel(data: any, autoRefresh = true) {
    // Set id iglesia
    data.idIglesia = this.currentUser.idIglesia
    // Send post
    this.api.post('updateNivel', data)
      .subscribe(
        (data: any) => {
          if (data.msg.Code == 200) {
            console.log(data.msg.Message)
            // Close modal
            this.modal.getModal('editFormModal').close()
            if (autoRefresh) {
              this.onChange.emit()
            }
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
            this.onChange.emit()
          } else {
            alert(res.msg.Message)
          }
        },
        err => console.error(err)
      )
  }

  countActiveSteps(reqs: any) {
    if (reqs) {
      return reqs.filter(req => req.estatus == true).length
    }
    return 0
  }
}
