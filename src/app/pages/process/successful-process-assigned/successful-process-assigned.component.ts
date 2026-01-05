import { EventEmitter, Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { ProcessRegisterModel } from '../register-via-qr/register-via-qr.component';

@Component({
  selector: 'app-successful-process-assigned',
  templateUrl: './successful-process-assigned.component.html',
  styleUrls: ['./successful-process-assigned.component.scss']
})
export class SuccessfulProcessAssignedComponent implements OnInit {

  @Input() currentUser: User;
  @Input('process_info') process_info: ProcessRegisterModel;

  @Output() redirect = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  handleRedirectByRole(user) {
    this.redirect.emit(user);
  }

}
