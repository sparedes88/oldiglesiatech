import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { UserService } from 'src/app/services/user.service';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {

  constructor(
    public route: ActivatedRoute,
    public snackbar: MatSnackBar,
    public userService: UserService,
    public api: ApiService) {
    this.user = this.userService.getCurrentUser()
    this.processId = this.route.snapshot.params['id']
  }

  public user: any
  public processId: any
  public process: any = {}

  ngOnInit() {
    this.getProcess()
  }

  getProcess() {
    this.api.get(`process/getProcess/${this.processId}`, {})
      .subscribe(
        (data: any) => {
          this.process = data.process
        },
        err => {
          console.error(err)
          this.snackbar.open(`Can't load process list`, null, { duration: 3000 })
        }
      )

  }
}
