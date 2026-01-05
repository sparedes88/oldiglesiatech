import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-steps',
  templateUrl: './steps.component.html',
  styleUrls: ['./steps.component.scss']
})
export class StepsComponent implements OnInit {

  constructor(
    public api: ApiService, public userService: UserService) {
      this.currentUser = userService.getCurrentUser()
  }

  currentUser: any

  // IO
  @Input() level: any

  // Data
  steps: any[] = []

  ngOnInit() {
  }

  /**
   * Get al
   */
  getSteps() {

  }

}
