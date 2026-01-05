import { Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { VersionModel } from 'src/app/models/VersionModel';

@Component({
  selector: 'app-version-form',
  templateUrl: './version-form.component.html',
  styleUrls: ['./version-form.component.scss']
})
export class VersionFormComponent implements OnInit {

  currentUser: User;
  form: FormGroup;
  version: VersionModel;
  last_version: VersionModel;

  @Input('trigger_event') trigger_event: boolean;
  @Output('on_close') on_close: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private form_builder: FormBuilder,
    private api: ApiService,
    private user_service: UserService
  ) {
    this.currentUser = this.user_service.getCurrentUser();
    this.initForm();
  }

  ngOnInit() {
    this.getLastVersion();
  }

  async getLastVersion() {
    const response: any = await this.api.get(`versions/last`).toPromise();
    if (response) {
      console.log(response);
      if (response.last_version) {
        const version: Partial<VersionModel> = {};
        const version_parts = response.last_version.split('.');
        const number_indexes = [
          {
            name: 'major',
            index: 0,
            is_number: true
          }, {
            name: 'minor',
            index: 1,
            is_number: true
          }, {
            name: 'patch',
            index: 2,
            is_number: true
          }];
        number_indexes.forEach(x => {
          let value: any = version_parts[x.index];
          if (x.is_number) {
            value = Number(value);
          }
          version[x.name] = value;
        });
        version.version = response.last_version;
        this.form.get('major').setValidators([Validators.required, Validators.min(version.major)]);
        this.form.get('minor').setValidators([Validators.required, Validators.min(version.minor)]);
        this.form.get('patch').setValidators([Validators.required, Validators.min(version.patch + 1)]);
        this.last_version = version as VersionModel;
      }
    }
  }

  setVersion(version: VersionModel) {
    console.log(version);
    this.form.addControl('id', new FormControl(version.id, [Validators.required]));
    this.form.patchValue(version);
  }

  initForm() {
    this.form = this.form_builder.group({
      major: new FormControl('', [Validators.required]),
      minor: new FormControl('', [Validators.required]),
      patch: new FormControl('', [Validators.required]),
      change_log: new FormControl('', [Validators.required]),
      is_mandatory: new FormControl(false)
    });
  }

  close(trigger_event?: boolean) {
    this.initForm();
    this.version = undefined;
    this.on_close.emit(trigger_event);
  }

  async save() {
    if (this.form.valid) {
      const payload = this.form.value;
      payload.created_by = this.currentUser.idUsuario;
      const version = `${payload.major}.${payload.minor}.${payload.patch}`;
      console.log(version);
      payload.version = version;
      const call_obj: Partial<{
        method: Observable<any>,
        msg_success: string,
        msg_error: string;
      }> = {};
      if (payload.id) {
        call_obj.method = this.api.patch(`versions/${payload.id}`, payload);
      } else {
        call_obj.method = this.api.post(`versions`, payload);
      }

      const response = await call_obj.method.toPromise()
        .catch(error => {
          this.api.showToast(call_obj.msg_error, ToastType.error);
          return;
        });
      if (response) {
        this.api.showToast(call_obj.msg_success, ToastType.success);
        this.close(this.trigger_event);
      }
    }
  }

}
