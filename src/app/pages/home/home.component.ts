import { OrganizationService } from './../../services/organization/organization.service';
import { UserService } from './../../services/user.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  currentUser: any;

  constructor(
    private userService: UserService,
    private organizationService: OrganizationService
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  ngOnInit() {
  }

  fixUrl(image: string) {
    if (image) {
      return `${this.organizationService.api.baseUrl}${image}`;
    }
    return '/assets/img/iglesia-home.png';
  }

}
