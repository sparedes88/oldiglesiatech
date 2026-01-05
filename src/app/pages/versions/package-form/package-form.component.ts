import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { throwToolbarMixedModesError } from '@angular/material';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';
import { PackageModel } from 'src/app/models/VersionModel';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-package-form',
  templateUrl: './package-form.component.html',
  styleUrls: ['./package-form.component.scss']
})
export class PackageFormComponent implements OnInit {

  currentUser: User;
  form: FormGroup;
  package: PackageModel;
  last_package: PackageModel;

  iglesias: any[] = [];
  selectCatOptions: any = {
    singleSelection: true,
    idField: 'idIglesia',
    textField: 'Nombre',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  }

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
    this.getIglesias();
  }

  async getLastVersion() {
    const response: any = await this.api.get(`versions/packages/sequencer/last`).toPromise();
    if (response) {
      console.log(response);
      if (response.last_sequencer) {
        const package_obj: Partial<PackageModel> = {
          package_segment_domain: 'com.e2outlook.iglesia',
          sequencer: response.next_sequencer,
        };
        package_obj.app_package = `${package_obj.package_segment_domain}${package_obj.sequencer}`;
        this.form.get('package_segment_domain').setValidators([Validators.required]);
        this.form.get('package_segment_sequencer').setValidators([Validators.required, Validators.min(response.last_sequencer)]);
        this.form.get('package_segment_sequencer').setValue(response.next_sequencer);
        this.form.get('sequencer').setValue(response.next_sequencer);
        this.form.get('package_segment_domain').setValue(package_obj.package_segment_domain);
        this.form.patchValue(package_obj);
        this.last_package = package_obj as PackageModel;
      }
    }
  }
  async getIglesias() {
    const response: any = await this.api.get(`iglesias/getIglesias`, { minimal: true }).toPromise();
    if (response) {
      console.log(response.iglesias);
      this.iglesias = response.iglesias;
    }
  }

  setVersion(version) {

  }

  initForm() {
    this.form = this.form_builder.group({
      package_segment_domain: new FormControl('', [Validators.required]),
      package_segment_sequencer: new FormControl('', [Validators.required]),
      sequencer: new FormControl('', [Validators.required]),
      app_package: new FormControl('', [Validators.required]),
      android_id: new FormControl('', []),
      apple_id: new FormControl('', []),
      organizations: new FormControl([]),
      idOrganization: new FormControl()
    });
  }

  setOrganization() {
    const selected_organization = this.form.get('organizations').value.map(x => x.idIglesia);
    if (selected_organization.length > 0) {
      this.form.get('idOrganization').setValue(selected_organization[0]);
    } else {
      this.form.get('idOrganization').setValue(undefined);
    }
  }

  close(response?) {
    this.initForm();
    this.package = undefined;
    this.on_close.emit(response);
  }

  async save() {
    if (this.form.valid) {
      const payload: PackageModel = this.form.value;
      payload.created_by = this.currentUser.idUsuario;
      payload.app_package = `${payload.package_segment_domain}${payload.sequencer}`;
      payload.android_id = `${payload.package_segment_domain}${payload.sequencer}`;
      const call_obj: Partial<{
        method: Observable<any>,
        msg_success: string,
        msg_error: string;
      }> = {};
      if (payload.idIdentificador) {
        call_obj.method = this.api.patch(`versions/packages/${payload.idIdentificador}`, payload);
      } else {
        call_obj.method = this.api.post(`versions/packages`, payload);
      }

      const response = await call_obj.method.toPromise()
        .catch(error => {
          this.api.showToast(call_obj.msg_error, ToastType.error);
          return;
        });
      if (response) {
        this.api.showToast(call_obj.msg_success, ToastType.success);
        this.close(response);
      }
    }
  }

}
