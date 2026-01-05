import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-embed-profile',
  templateUrl: './embed-profile.component.html',
  styleUrls: ['./embed-profile.component.scss']
})
export class EmbedProfileComponent implements OnInit {

  @Input('idOrganization') idOrganization: number;

  current_user: User;

  constructor(
    private user_service: UserService
  ) {
    this.current_user = this.user_service.getCurrentUser();
  }

  ngOnInit() {
  }


  handleLogOff() {
    this.current_user = undefined;
  }

  setUser(user) {
    this.current_user = this.user_service.getCurrentUser();
  }

}
