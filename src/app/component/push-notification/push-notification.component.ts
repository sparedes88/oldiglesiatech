import { User } from './../../interfaces/user';
import { UserService } from './../../services/user.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-push-notification',
  templateUrl: './push-notification.component.html',
  styleUrls: ['./push-notification.component.scss']
})
export class PushNotificationComponent implements OnInit {

  currentUser: User;
  message: {
    body: string,
    title: string
  } = {
      body: '',
      title: ''
    };


  @Output() onDismiss = new EventEmitter()

  constructor(
    private userService: UserService,
    private api: ApiService,
    private router: Router,
  ) {
    this.currentUser = this.userService.getCurrentUser();
    this.userService.getExpiration().then(() => {});
    /*if(!this.currentUser.isSuperUser){
      const userStr: string = JSON.stringify(this.currentUser);
      localStorage.setItem('currentUser', userStr)
    }*/
  }

  ngOnInit() {
  }

  submit() {
    if (this.message.body === '') {
      alert(`The notification's body can't be empty.`);
      return;
    }
    if (this.message.title === '') {
      const alert = confirm(`The notification's title is empty, are you sure you want to send it empty?`);
      if (alert) {
        this.dismiss(this.message);
      }
    } else {
      this.dismiss(this.message);
    }
  }

  dismiss(response?) {
    if (response) {
      this.onDismiss.emit(response);
    } else {
      if (this.message.body !== '' || this.message.title !== '') {
        const alert = confirm(`Please confirm... It seems you made some changes... Are yor sure you want to close this?


The notification won't be send it.
          `);
        if (alert) {
          this.onDismiss.emit();
        }
      } else {
        this.onDismiss.emit();
      }
    }
  }

}
