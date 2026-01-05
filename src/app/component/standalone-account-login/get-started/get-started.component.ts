import { TranslateService } from '@ngx-translate/core';
import { User } from 'src/app/interfaces/user';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MaskApplierService, MaskPipe } from 'ngx-mask';
import { GroupEventModel } from 'src/app/models/GroupModel';
import { UserService } from 'src/app/services/user.service';
import { GroupsService } from 'src/app/services/groups.service';
import { ToastType } from 'src/app/login/ToastTypes';

@Component({
  selector: 'app-get-started',
  templateUrl: './get-started.component.html',
  styleUrls: ['./get-started.component.scss']
})
export class GetStartedComponent implements OnInit {

  @Input() currentUser: User;
  @Input() group_event: GroupEventModel;
  @Input() get_started_form: FormGroup;
  @Input() header_message : string = this.translate_service.instant('events.verify_email_or_phone_disclaimer');
  @Input() login_text_button : string = this.translate_service.instant('generals.verify');
  // {
  //   value_to_verify: ['', [Validators.required]],
  //   login_type: ''
  // };
  @Output() user_status = new EventEmitter<string>();


  constructor(
    private form_builder: FormBuilder,
    private mask_service: MaskApplierService,
    private userService: UserService,
    private groupsService: GroupsService,
    private translate_service: TranslateService
  ) { }

  ngOnInit() {
    if(!this.header_message){
      this.header_message = this.translate_service.instant('events.verify_email_or_phone_disclaimer');
    }
    if(!this.login_text_button){
      this.login_text_button = this.translate_service.instant('generals.verify');
    }
  }

  validateInputType() {
    const value_to_verify: string = this.get_started_form.get('value_to_verify').value;
    let type: string = value_to_verify.includes('@') ? 'email' : 'phone';
    if (this.get_started_form.get('login_type')) {
      this.get_started_form.get('login_type').setValue(type);
    } else {
      this.get_started_form.addControl('login_type', new FormControl(type))
    }
    if (type === 'email') {
      const form_control = new FormGroup({
        value_to_verify: new FormControl(value_to_verify, [
          Validators.required,
          Validators.pattern(new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/))
        ])
      });
      if (form_control.get('value_to_verify').valid) {
        // continue
        this.continueHandleLogin();
      }
    } else {
      let only_numbers = true;
      let clean_text = value_to_verify.replace(/\s/g, '');
      clean_text = this.remove_mask(clean_text);

      if (clean_text.length === 10) {
        for (let index = 0; index < clean_text.length; index++) {
          const char = clean_text[index];
          if (Number.isNaN(Number(char))) {
            only_numbers = false;
          }
        }
        if (only_numbers) {
          this.mask_service.maskExpression = '(000) 000-0000';
          this.mask_service.dropSpecialCharacters = false;
          const pipe = new MaskPipe(this.mask_service);
          const format_phone = pipe.transform(clean_text, this.mask_service.maskExpression);
          this.get_started_form.get('value_to_verify').setValue(format_phone);
          // continue
          this.continueHandleLogin();
        } else {
          const message = this.translate_service.instant('users.phone_should_only_numbers');
          this.groupsService.api.showToast(message, ToastType.info);
        }
      } else {
        const message = this.translate_service.instant('users.phone_should_has_10_digits');
        this.groupsService.api.showToast(message, ToastType.info);
      }
      return;

    }
  }

  continueHandleLogin() {
    const value_to_verify = this.get_started_form.get('value_to_verify').value;
    const login_type = this.get_started_form.get('login_type').value;
    let idIglesia: number;
    if (this.currentUser) {

      if (this.currentUser.isSuperUser) {
        idIglesia = 0;
      } else {
        idIglesia = this.currentUser.idIglesia;
      }
    } else {
      idIglesia = this.group_event.idOrganization;
    }
    this.userService.checkUserAvailable(value_to_verify, idIglesia, login_type)
      .subscribe((response: any) => {
        // this.loading = false;
        if (response.message && response.message === 'This user exists but not in your organization.') {
          // this.select_manual_organization = true;
          this.get_started_form.addControl('idUser', new FormControl(response.idUsuario));
          // this.userAvailable = false;
          // this.errorChecking = false;
          // this.isChecked = true;
          this.user_status.emit('checked_in_organization');
          return;
        }
        if (response.message && response.message === 'This user exist but was deleted.') {
          const message = this.translate_service.instant('users.user_exist_but_deleted');
          this.groupsService.api.showToast(message, ToastType.info);
          return;
        }
        // this.userAvailable = true;
        // this.errorChecking = false;
        // this.isChecked = true;
        this.user_status.emit('checked_ok');
      }, error => {
        console.error(error);
        // this.loading = false;
        if (!error.error.msg.Message) {
          // this.userAvailable = false;
          // this.errorChecking = false;
          // this.select_manual_organization = false;
          this.user_status.emit('checked_not_available');
        } else {
          // this.userAvailable = false;
          // this.errorChecking = true;
          this.user_status.emit('checked_error');
        }
        // this.isChecked = true;
      });
  }

  _regExpForRemove(specialCharactersForRemove) {
    return new RegExp(specialCharactersForRemove.map((item) => `\\${item}`).join('|'), 'gi');
  }

  remove_mask(value,) {
    const specialCharactersForRemove = ['$', ',', '(', ')', ' ', '-']
    return value
      ? value.replace(this._regExpForRemove(specialCharactersForRemove), '')
      : value;
  }

  checkType() {
    let only_numbers = true;
    const value_to_verify = this.get_started_form.get('value_to_verify').value;
    let clean_text = value_to_verify.replace(/\s/g, '');
    clean_text = this.remove_mask(clean_text);

    for (let index = 0; index < clean_text.length; index++) {
      const char = clean_text[index];
      if (Number.isNaN(Number(char))) {
        only_numbers = false;
      }
    }
    if (only_numbers) {
      if (this.get_started_form.get('login_type')) {
        this.get_started_form.get('login_type').setValue('phone');
      } else {
        this.get_started_form.addControl('login_type', new FormControl('phone'))
      }
    } else {
      if (value_to_verify.includes('@')) {
        if (this.get_started_form.get('login_type')) {
          this.get_started_form.get('login_type').setValue('email');
        } else {
          this.get_started_form.addControl('login_type', new FormControl('email'))
        }
      }
    }

  }

}
