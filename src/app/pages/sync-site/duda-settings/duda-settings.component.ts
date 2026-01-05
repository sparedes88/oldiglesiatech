import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { SyncService } from 'src/app/services/sync.service';
import { UserService } from 'src/app/services/user.service';

import { ToastType } from '../../contact/toastTypes';
import { SyncDudaModel } from '../sync-duda.model';


@Component({
  selector: 'app-duda-settings',
  templateUrl: './duda-settings.component.html',
  styleUrls: ['./duda-settings.component.scss']
})
export class DudaSettingsComponent implements OnInit {

  @Input('is_modal') is_modal: boolean;

  @Output('on_refresh') on_refresh: EventEmitter<any> = new EventEmitter<any>();
  @Output('on_close') on_close: EventEmitter<any> = new EventEmitter<any>();

  current_user: User = this.user_service.getCurrentUser();;
  organization: OrganizationModel;
  settings: SyncDudaModel;

  is_linked: boolean = false;
  editing: boolean = false;
  show_warning: boolean = false;
  loading: boolean = true;

  settings_form: FormGroup = this.form_builder.group({
    site_id: new FormControl(undefined, [Validators.required]),
    idOrganization: new FormControl(undefined, [Validators.required]),
    created_by: new FormControl(undefined, [Validators.required])
  });


  constructor(
    private activated_route: ActivatedRoute,
    private router: Router,
    private sync_service: SyncService,
    private user_service: UserService,
    private form_builder: FormBuilder
  ) {
    this.settings_form.get('idOrganization').setValue(this.current_user.idIglesia);
    this.settings_form.get('created_by').setValue(this.current_user.idUsuario);
  }

  ngOnInit() {
    this.checkSettings();
  }

  async checkSettings() {
    this.loading = true;
    let params: Partial<{ idOrganization: number; extended: boolean }> = {
      idOrganization: this.current_user.idIglesia,
      extended: true
    };
    const response: any = await this.sync_service.checkOrganization(params).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.organization = response.organization;
      this.settings = response.settings;
      if (JSON.stringify(this.settings) === '{}') {
        // this.sync_service.api.showToast('Need to sync', ToastType.info);
        this.is_linked = false;
        // return;
      } else {
        if(!this.settings.site){
          this.show_warning = true;
        } else {
          this.show_warning = false;
        }
        this.is_linked = true;
        this.settings_form.get('site_id').setValue(this.settings.site_id);
      }
    }
    console.log('Pass');

    this.loading = false;
  }

  async setSiteID() {
    if (this.settings_form.invalid) {
      this.sync_service.api.showToast(`Please fill the site ID.`, ToastType.error);
      return;
    }

    const payload = this.settings_form.value;
    const response: any = await this.sync_service.setSiteID(payload).toPromise()
      .catch(error => {
        console.error(error);
        this.sync_service.api.showToast(`Error saving the Site ID`, ToastType.error);
        return;
      });
    if (response) {
      if (this.editing) {
        this.editing = false;
      }
      if(this.is_modal){
        this.on_refresh.emit(true);
      }
      this.checkSettings();
    }
  }

  cancelEditForm() {
    this.editing = false;
  }

  close() {
    this.on_close.emit(this.is_linked);
  }

}
