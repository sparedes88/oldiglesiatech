import { TranslateService } from '@ngx-translate/core';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { User } from 'src/app/interfaces/user';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { GroupEventModel } from 'src/app/models/GroupModel';
import { GroupsService } from 'src/app/services/groups.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { UserService } from 'src/app/services/user.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-login-portal',
  templateUrl: './login-portal.component.html',
  styleUrls: ['./login-portal.component.scss']
})
export class LoginPortalComponent implements OnInit {

  @Input() currentUser: User;
  @Input() group_event: GroupEventModel;
  @Input() full_form: FormGroup;
  @Input() login_form: FormGroup;
  @Input() close_button_text: string = this.translate_service.instant('General_Cerrar');
  @Input() close_button_position: 'top' | 'bottom' = 'top';
  @Input() close_button_alignment: 'left' | 'center' | 'right' = 'right';
  @Input() force_stay: boolean = false;
  // {
  //   usuario: new FormControl('', [Validators.email, Validators.required]),
  //   password: new FormControl('', [Validators.required])
  // };
  @Output() cancel_login = new EventEmitter();
  @Output() login_response = new EventEmitter();
  @Output() open_reset = new EventEmitter();

  userSelectionList: any[];
  show_detail_loading: boolean;
  login_complete: boolean = false;
  logged_user: User;

  disable_reset: boolean = false;

  constructor(
    private groupsService: GroupsService,
    private app: AppComponent,
    private router: Router,
    private translate_service: TranslateService
  ) { }

  ngOnInit() {
    const user = this.full_form.get('get_started_form').get('value_to_verify').value;
    if (this.full_form.get('get_started_form').get('login_type').value === 'email') {
      this.login_form.get('usuario').setValidators([
        Validators.required,
        Validators.pattern(new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/))
      ]);
    }
    this.login_form.get('usuario').setValue(user);
    // this.login_form.get('usuario').disable({ onlySelf: true });
  }

  makeLogin(form: FormGroup) {
    if (form.invalid) {
      const message = this.translate_service.instant('generals.check_form');
      return this.groupsService.api.showToast(message,
        ToastType.error
      );
    }
    // Start login progress
    this.show_detail_loading = true;

    const form_values = form.value;
    form_values.pass = UserService.encryptPass(form_values.password);
    this.groupsService.api
      .post(`users/login_v2`, form_values)
      .subscribe(
        (data: any) => {
          // Open user selection modal if needed
          if (data.users.length > 0) {
            const user = data.users[0];
            if (!user.estatus) {
              const message = this.translate_service.instant('users.was_deleted');
              this.groupsService.api.showToast(message, ToastType.error);
              return;
            }
          }
          const active_users: any[] = data.users.filter(user => user.code !== 403);
          console.log(active_users);
          console.log(this.group_event.idOrganization);

          if (active_users.length > 1) {
            if (active_users[0].isSuperUser) {
              this.userSelectionList = active_users;
              const same_church_as_event = this.userSelectionList.find(x => x.idIglesia === Number(this.group_event.idOrganization));
              if (same_church_as_event) {
                this.selectLoginUser(same_church_as_event);
              } else {
                this.selectLoginUser(active_users[0]);
              }
            } else {
              this.userSelectionList = active_users;
              const same_church_as_event = this.userSelectionList.find(x => x.idIglesia === Number(this.group_event.idOrganization));
              if (same_church_as_event) {
                this.selectLoginUser(same_church_as_event);
              } else {
                // Not user found for this organization.
                if (!this.force_stay) {
                  const message = this.translate_service.instant('users.user_not_belong_to_organization');
                  this.groupsService.api.showToast(message, ToastType.success);
                  this.selectLoginUser(active_users[0], true);
                } else {
                  this.selectLoginUser(active_users[0]);
                }
              }
              // this.modal.getModal('selectUserModal').open();
            }
          } else if (active_users.length === 1) {
            this.selectLoginUser(active_users[0]);
          } else {
            this.groupsService.api.showToast('Success', ToastType.success);
          }
        },
        err => {
          console.error(err);
          const message = this.translate_service.instant('users.auth_incorrect');
          this.groupsService.api.showToast(message, ToastType.error);
          this.show_detail_loading = false;
          // this.btnLogin = 'Login';
        },
        () => (this.show_detail_loading = false)
      );
  }

  selectLoginUser(user: any, should_redirect?: boolean) {
    user._loading = true;
    const userStr: string = JSON.stringify(user);
    // Store the current user on local storage
    localStorage.setItem('currentUser', userStr);

    let companies: any[];
    if (this.userSelectionList) {
      companies = this.userSelectionList.map(user => user.idIglesia);
    } else {
      companies = [user.idIglesia];
    }

    localStorage.setItem('companies', JSON.stringify(companies));
    this.currentUser = user;
    this.logged_user = user;
    this.login_complete = true;

    setTimeout(() => {
      this.app.footer.currentUser = user;
      this.app.menu.currentUser = user;
    });
    if (should_redirect) {
      this.handleRedirectByRole(user);
    } else {
      this.login_response.emit(user);
    }
  }

  handleRedirectByRole(user: User) {
    if (user.idUserType === 1 || user.isSuperUser) {
      if (user.isSuperUser) {
        this.router.navigate(['/admin/organization']);
      } else {
        this.router.navigate(['dashboard']);
      }
      setTimeout(() => {
        this.app.footer.currentUser = user;
        this.app.menu.currentUser = user;
      });
    } else {
      this.router.navigate([`/user-profile/details/${user.idUsuario}`]);
    }
  }

  resetPassword(form) {
    this.disable_reset = true;
    let type: string = this.full_form.get('get_started_form').get('login_type').value.includes('@') ? 'email' : 'phone';
    form.value.type = type;
    // this.loading = true;
    this.open_reset.emit({
      type,
      value: form.value.usuario,
    });

    setTimeout(() => {
      this.disable_reset = false;
    }, 1000);

    // if (form.value) {
    //   let type: string = this.full_form.get('get_started_form').get('login_type').value.includes('@') ? 'email' : 'phone';
    //   form.value.type = type;
    //   // this.loading = true;
    //   this.groupsService.api.post(`users/user_password_reset`, {
    //     type,
    //     email: form.value.usuario,
    //   }).subscribe(
    //     data => {
    //       // form.reset();
    //     },
    //     error => {
    //       console.error(error);
    //     },
    //     () => {
    //       // this.loading = false;
    //       const message = this.translate_service.instant('users.recovery_email_sent');
    //       this.groupsService.api.showToast(message, ToastType.info);
    //       // this.display_reset_form = false;
    //       // this.display_login_form = true;
    //       // this.display_register_form = false;
    //     }
    //   );
    // } else {
    //   const message = this.translate_service.instant('generals.check_form');
    //   this.groupsService.api.showToast(message, ToastType.error);
    //   // this.loading = false;
    // }
  }

}
