import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  constructor(
    public api: ApiService,
    public userService: UserService,
    public modal: NgxSmartModalService,
    public route: ActivatedRoute) {
    this.currentUser = userService.getCurrentUser()
    this.levelId = this.route.snapshot.params['id']
  }

  // data
  public currentUser: any
  public levelId: number
  public level: any = {}

  ngOnInit() {
    this.getLevel()
  }

  getLevel() {
    this.api.get(`getNiveles`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          if (data.niveles && data.niveles.length) {
            this.level = data.niveles.find(lvl => lvl.idNivel == this.levelId)
            // Reorder reqs
            if (this.level.requisitos) {
              this.level.requisitos = this.level.requisitos
              .sort((a, b) => a.orden - b.orden)
              .filter(r => r.estatus == true)
            }
          } else {
            alert(data.msg.Message)
          }
        },
        err => console.error(err),
      )
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.level.requisitos, event.previousIndex, event.currentIndex);
    this.updateLevel(this.level)
  }

  deleteStep(index) {
    if (confirm(`Are you sure you want to delete this step?`))
      this.level.requisitos.splice(index, 1)
  }

  /** Update selected level */
  updateLevel(data: any) {
    if (this.level.requisitos) {
      this.level.requisitos
        .map((r, index) => { r.orden = index })
    }

    // Set id iglesia
    data.idIglesia = this.currentUser.idIglesia
    // Send post
    this.api.post('updateNivel', data)
      .subscribe(
        (data: any) => {
          if (data.msg.Code == 200) {
          } else {
            console.log(data)
            alert(data.msg.Message)
          }
        },
        err => console.error(err)
      )
  }
}
