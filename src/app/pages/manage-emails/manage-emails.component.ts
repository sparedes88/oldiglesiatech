import { ApiService } from './../../services/api.service';
import { Component, Input, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-manage-emails',
  templateUrl: './manage-emails.component.html',
  styleUrls: ['./manage-emails.component.scss']
})
export class ManageEmailsComponent implements OnInit {

  @Input('idOrganization') idOrganization: number;

  currentUser: any;
  contact_types: any = []

  constructor(
    private userService: UserService,
    private api: ApiService) {
    this.currentUser = this.userService.getCurrentUser();
  }

  ngOnInit() {
    this.api.get(`iglesias/contact_info/filter`)
      .subscribe((data: any) => {
        console.log(data);
        this.contact_types = data.contact_types;
      }, error => {
        console.error(error);
      });
  }

}
