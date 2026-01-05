import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { ToastType } from 'src/app/login/ToastTypes';

@Component({
  selector: "push-notification",
  templateUrl: './push-notification.component.html',
  styleUrls: ['./push-notification.component.scss']
})
export class PushNotificationComponent implements OnInit {
  currentUser: User;
  message: {
    body: string;
    title: string;
  } = {
      body: '',
      title: ''
    };

  page: number = 1;

  array: any[] = [
    {
      title: 'Notif 1',
      created_at: new Date(),
      created_by_user: 'Jaime Here',
      body: 'Testing styles.'
    },
    {
      title: 'Notif 1',
      created_at: new Date(),
      created_by_user: 'Jaime Here',
      body: 'Testing styles.'
    },
    {
      title: 'Notif 1',
      created_at: new Date(),
      created_by_user: 'Jaime Here',
      body: 'Testing styles.'
    },
    {
      title: 'Notif 1',
      created_at: new Date(),
      created_by_user: 'Jaime Here',
      body: 'Testing styles.'
    },
    {
      title: 'Notif 1',
      created_at: new Date(),
      created_by_user: 'Jaime Here',
      body: 'Testing styles.'
    },
    {
      title: 'Notif 1',
      created_at: new Date(),
      created_by_user: 'Jaime Here',
      body: 'Testing styles.'
    },
    {
      title: 'Notif 1',
      created_at: new Date(),
      created_by_user: 'Jaime Here',
      body: 'Testing styles.'
    },
    {
      title: 'Notif 1',
      created_at: new Date(),
      created_by_user: 'Jaime Here',
      body: 'Testing styles.'
    },
    {
      title: 'Notif 1',
      created_at: new Date(),
      created_by_user: 'Jaime Here',
      body: 'Testing styles.'
    },
    {
      title: 'Notif 1',
      created_at: new Date(),
      created_by_user: 'Jaime Here',
      body: 'Testing styles.'
    },
  ];

  @Output() onDismiss = new EventEmitter();

  constructor(
    private userService: UserService,
    private organizationService: OrganizationService
  ) {
    this.currentUser = this.userService.getCurrentUser();
    console.log(this.currentUser);
  }

  ngOnInit() { }

  submit() {
    if (this.message.body === '') {
      alert(`The notification's body can't be empty.`);
      return;
    }
    if (this.message.title === '') {
      const alert = confirm(
        `The notification's title is empty, are you sure you want to send it empty?`
      );
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

  getLastNotifications() {
    return new Promise((resolve, reject) => {
      this.message = {
        body: '',
        title: ''
      };
      this.organizationService.getLastNotifications(this.page)
        .subscribe((data: any) => {
          this.array = data.notifications;
          return resolve(this.array);
        }, error => {
          console.error(error);
          this.array = [];
          this.organizationService.api.showToast(`Error getting the lastest notifications`, ToastType.error);
          return resolve([]);
        });
    });
  }
}
