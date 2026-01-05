import { TranslateService } from '@ngx-translate/core';
import { FormGroup } from '@angular/forms';
import { User } from 'src/app/interfaces/user';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { GroupEventModel } from 'src/app/models/GroupModel';
import { GroupsService } from 'src/app/services/groups.service';
import { UserService } from 'src/app/services/user.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { ReplacePipe } from 'src/app/pipes/replace.pipe';

@Component({
  selector: 'app-create-account-portal',
  templateUrl: './create-account-portal.component.html',
  styleUrls: ['./create-account-portal.component.scss']
})
export class CreateAccountPortalComponent implements OnInit {

  @Input() currentUser: User;
  @Input() group_event: GroupEventModel;
  @Input() full_form: FormGroup;
  @Input() register_form: FormGroup;
  @Input() is_not_event: boolean = false;
  @Input() custom_message: string = 'events.acceptation_disclaimer';
  // {
  //   usuario: new FormControl('', [Validators.email, Validators.required]),
  //   password: new FormControl('', [Validators.required])
  // };
  @Output() cancel_login = new EventEmitter();
  @Output() register_response = new EventEmitter();

  toggle_pass: {
    password: boolean,
    confirm_password: boolean
  } = {
      password: true,
      confirm_password: true
    };
  serverBusy: boolean = false;

  constructor(
    private groupsService: GroupsService,
    private userService: UserService,
    private translate_service: TranslateService,
    private replace_pipe: ReplacePipe
  ) { }

  ngOnInit() {
    const get_started_form = this.full_form.get('get_started_form');
    let field_ok: string, non_field: string;
    if (get_started_form.get('login_type').value === 'phone') {
      field_ok = 'telefono';
      non_field = 'email';
    } else {
      field_ok = 'email';
      non_field = 'telefono';
    }
    this.register_form.get(field_ok).setValue(get_started_form.get('value_to_verify').value);
    this.register_form.get(non_field).reset();

    if (this.is_not_event) {
      this.register_form.get('is_available').setValue(true);
    }
  }

  toggleAcceptace(form_group: FormGroup, field: string) {
    const actual_value = form_group.get(field).value;
    form_group.get(field).setValue(!actual_value);
    console.log(this.full_form);

  }

  onRegister() {
    this.serverBusy = true;
    const payload = this.register_form.value;

    const get_started_form = this.full_form.get('get_started_form');
    let value_to_verify: string;
    let login_type: string;
    if (get_started_form.get('login_type').value === 'phone') {
      // check email if exists.
      value_to_verify = this.register_form.get('email').value;
      login_type = 'email';
    } else {
      // check phone if exists.
      value_to_verify = this.register_form.get('telefono').value;
      login_type = 'phone';
    }
    const translation = this.translate_service.instant('users.user_with_value_already_exists');
    const value_trans = login_type == 'phone' ? 'Miembro_Telefono' : 'Miembro_Correo';
    const item_value_trans = this.translate_service.instant(value_trans);
    const message = this.replace_pipe.transform(translation, 'login_type', item_value_trans);
    this.userService.checkUserAvailable(value_to_verify, payload.idIglesia, login_type)
      .subscribe((response: any) => {
        // this.loading = false;
        if (response.message && response.message === 'This user exists but not in your organization.') {
          // this.select_manual_organization = true;
          // // // // this.get_started_form.addControl('idUser', new FormControl(response.idUsuario));
          // this.userAvailable = false;
          // this.errorChecking = false;
          // this.isChecked = true;
          // // // this.user_status.emit('checked_in_organization');
          this.groupsService.api.showToast(message, ToastType.info);
          this.serverBusy = false;
          return;
        }
        if (response.message && response.message === 'This user exist but was deleted.') {
          this.groupsService.api.showToast(message, ToastType.info);
          this.serverBusy = false;
          return;
        }
        // this.userAvailable = true;
        // this.errorChecking = false;
        // this.isChecked = true;
        console.log(response);
        console.log('Email not exist');
        this.completeRegister(payload);
        // // // // this.user_status.emit('checked_ok');
      }, error => {
        console.error(error);
        // this.loading = false;
        if (!error.error.msg.Message) {
          // this.userAvailable = false;
          // this.errorChecking = false;
          // this.select_manual_organization = false;
          // // // // this.user_status.emit('checked_not_available');
          this.groupsService.api.showToast(message, ToastType.info);
          this.serverBusy = false;
        } else {
          // this.userAvailable = false;
          // this.errorChecking = true;
          // // // // this.user_status.emit('checked_error');
          this.groupsService.api.showToast(message, ToastType.info);
          this.serverBusy = false;
        }
        // this.isChecked = true;
      });
  }
  completeRegister(payload: any) {
    let message_success: string;
    let message_error: string;

    payload.pass = UserService.encryptPass(payload.password);
    const message_valid_organization = this.translate_service.instant('users.select_valid_organization');
    const message_valid_role = this.translate_service.instant('users.select_valid_role');
    if (Array.isArray(payload.idIglesia)) {
      if (payload.idIglesia.length > 0) {
        payload.idIglesia = payload.idIglesia[0].idIglesia;
      } else {
        this.groupsService.api.showToast(message_valid_organization, ToastType.info);
        this.serverBusy = false;
        return;
      }
    } else if (payload.idIglesia == null) {
      this.groupsService.api.showToast(message_valid_organization, ToastType.info);
      this.serverBusy = false;
      return;
    }
    if (payload.idIglesia === 0) {
      this.groupsService.api.showToast(message_valid_organization, ToastType.info);
      this.serverBusy = false;
      return;
    }
    if (Array.isArray(payload.idUserType)) {
      if (payload.idUserType.length > 0) {
        payload.idUserType = payload.idUserType[0].idUserType;
      } else {
        this.groupsService.api.showToast(message_valid_role, ToastType.info);
        this.serverBusy = false;
        return;
      }
    } else if (payload.idUserType == null) {
      this.groupsService.api.showToast(message_valid_role, ToastType.info);
      this.serverBusy = false;
      return;
    }
    if (payload.idUserType === 0) {
      this.groupsService.api.showToast(message_valid_role, ToastType.info);
      this.serverBusy = false;
      return;
    }
    if (payload.password !== payload.confirm_password) {
      const message = this.translate_service.instant('users.password_did_not_match');
      this.groupsService.api.showToast(message, ToastType.info);
      this.serverBusy = false;
      return;
    }
    message_success = this.replace_pipe.transform(this.translate_service.instant('users.created_successfully'), 'email', payload.email);
    message_error = `Error creating user.`;
    // payload.created_by = this.currentUser.idUsuario;
    console.log(payload);

    this.groupsService.api.post_old(`registerUsuario`, payload)
      .subscribe((data: any) => {
        payload.idUsuario = data.idUsuario;
        const idUsuario = payload.idUsuario;
        // const iglesia = this.userConfig.getIglesia();
        // const topic = iglesia.topic;
        // const device = this.userConfig.getDevice();
        this.groupsService.api.showToast(`${message_success}`, ToastType.success);
        this.serverBusy = false;

        // this.selectLoginUser(payload);

        // this.registerOnEvent(this.group_event);
        // this.dismiss(data);
        this.register_response.emit(payload);
      }, err => {
        console.error(err);
        this.groupsService.api.showToast(`${message_error}`, ToastType.error);
        this.serverBusy = false;
      });
  }

}
