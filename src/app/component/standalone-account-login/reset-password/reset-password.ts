
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { PasswordValidator } from 'src/app/models/Utility';
import { ApiService } from 'src/app/services/api.service';
import { User } from 'src/app/interfaces/user';
import { GroupEventModel } from 'src/app/models/GroupModel';
import { UserService } from 'src/app/services/user.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { TranslateService } from '@ngx-translate/core';

/**
 * Generated class for the ResetPasswordComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'app-reset-password',
  templateUrl: 'reset-password.html'
})
export class ResetPasswordComponent implements OnInit {

  @Input() currentUser: User;
  @Input() group_event: GroupEventModel;
  @Input() full_form: FormGroup;
  @Input() login_form: FormGroup;

  @Output() cancel_login = new EventEmitter();

  verification_code_form: FormGroup = this.form_builder.group({
    code: new FormControl('', [Validators.required, Validators.minLength(9), Validators.maxLength(9)])
  });

  new_password_form: FormGroup = this.form_builder.group({
    matching_passwords: new FormGroup({
      password: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(50)
      ])),
      confirm_password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(50)
      ])
    }, (formGroup: FormGroup) => PasswordValidator.areEqual(formGroup)),
    token: new FormControl('', Validators.required)
  });

  get password_did_not_match() {
    const control = this.new_password_form.get('matching_passwords');
    return control.hasError('areEqual') && (control.dirty || control.touched)
  }

  selected_type: string;
  iglesia: any;
  actual_step: number = 1;

  waiting_time: number = 0;

  options: {
    email: string;
    phone: string
  }

  is_verifying: boolean = false;
  wait_reset: boolean = false;
  show_detail_loading: boolean = true;

  constructor(
    private userConfig: UserService,
    private api: ApiService,
    private form_builder: FormBuilder,
    private translate_service: TranslateService
  ) {
    // this.iglesia = this.userConfig.getIglesia();
    // setTimeout(() => {
    //   this.show_detail_loading = false;
    // }, 2000);
  }

  async ngOnInit() {
    const iglesia_response: any = await this.api
      .get(`getIglesiaFullData/`, { idIglesia: this.group_event.idOrganization })
      .toPromise().catch(err => {
        console.error(err)
        this.show_detail_loading = false;
        return;
      });
    if (iglesia_response) {
      this.iglesia = iglesia_response.iglesia;
      this.show_detail_loading = false;

    }

    const options = this.full_form.get('get_started_form').value;
    this.selected_type = options.login_type;
    const response: any = await this.api.post('users/reset/login_options', {
      type: options.login_type,
      value: options.value_to_verify
    }).toPromise()
      .catch(error => {
        return;
      });
    if (response) {
      this.options = response.options;
    }
  }

  async sentRequestToReset() {
    this.waiting_time = 60;
    const options = this.full_form.get('get_started_form').value;
    let known_value: string;
    if (options.login_type === 'phone') {
      known_value = this.options.phone;
    } else {
      known_value = this.options.email;
    }
    const response: any = await this.api.post('users/reset/request', {
      type: this.selected_type,
      value: known_value,
      language: localStorage.getItem('lang') || 'es',
      idIglesia: this.group_event.idOrganization
    }).toPromise()
      .catch(error => {
        return;
      });
    if (response) {
      this.actual_step = 2;
      const interval = setInterval(() => {
        this.waiting_time--;
        if (this.waiting_time === 0) {
          clearInterval(interval);
        }
      }, 1000);
    }
  }

  async verifyCode() {
    this.is_verifying = true;
    const options = this.full_form.get('get_started_form').value;
    let known_value: string;
    if (options.login_type === 'phone') {
      known_value = this.options.phone;
    } else {
      known_value = this.options.email;
    }
    const code = this.verification_code_form.value.code.replace('-', '');
    const response: any = await this.api.post('users/reset/verify', {
      code,
      value: known_value,
    }).toPromise()
      .catch(error => {
        this.is_verifying = false;
        return;
      });
    if (response) {
      if (response.msg.Code === 200) {
        this.actual_step = 3;
        this.new_password_form.get('token').setValue(response.token);
      } else {
        this.new_password_form.get('token').setValue(undefined);
        if (response.msg.Code === 403) {
          this.actual_step = 1;
          this.api.showToast(this.translate_service.instant('users.reset_token_expired'), ToastType.info);
          this.verification_code_form.get('code').setValue(undefined);
        } else {
          this.api.showToast(this.translate_service.instant('users.verification_code_incorrect'), ToastType.error);
        }
        setTimeout(() => {
          this.is_verifying = false;
        }, 3000);
      }
    }
  }

  async updatePassword() {
    this.wait_reset = true;
    const token = this.new_password_form.get('token').value;
    const password = this.new_password_form.get('matching_passwords').get('password').value;
    const response: any = await this.api.post('users/reset', {
      token,
      password,
      language: localStorage.getItem('lang') || 'es',
      idIglesia: this.group_event.idOrganization
    }).toPromise()
      .catch(error => {
        this.wait_reset = false;
        return;
      });
    if (response) {
      if (response.msg.Code === 200) {
        this.actual_step = 4;
        this.wait_reset = false;
      } else {
        this.api.showToast(this.translate_service.instant('users.something_wrong_at_reset'), ToastType.success);
        setTimeout(() => {
          this.wait_reset = false;
          this.cancel_login.emit('checked_ok');
        }, 3000);
      }
    }
  }

}
