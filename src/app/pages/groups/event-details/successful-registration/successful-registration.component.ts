import { EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { User } from 'src/app/interfaces/user';
import { Component, Input, OnInit, Output } from '@angular/core';
import { GroupEventModel } from 'src/app/models/GroupModel';

@Component({
  selector: 'app-successful-registration',
  templateUrl: './successful-registration.component.html',
  styleUrls: ['./successful-registration.component.scss']
})
export class SuccessfulRegistrationComponent implements OnInit {

  @Input() currentUser: User;
  @Input() group_event: GroupEventModel;
  @Input() full_form: FormGroup;
  @Input() login_form: FormGroup;

  @Output() redirect = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  handleRedirectByRole(user) {
    this.redirect.emit(user);
  }

}
