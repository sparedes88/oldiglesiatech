import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as moment from 'moment-timezone';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { GroupsReportService } from 'src/app/services/groups-report.service';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { UserService } from 'src/app/services/user.service';

import {
  GroupReportOptionalFieldModel,
} from './../groups-report-optional-fields-home/groups-report-optional-fields-home.component';

export class GroupReportRecordModel {
  id: number;
  idGroupReport: number;
  report_date: string;
  created_by: number;
  optional_fields: GroupReportOptionalFieldModel[];
  columns?: GroupReportOptionalFieldModel[];
}

@Component({
  selector: 'app-groups-report-entry-form',
  templateUrl: './groups-report-entry-form.component.html',
  styleUrls: ['./groups-report-entry-form.component.scss']
})
export class GroupsReportEntryFormComponent implements OnInit {

  @Input('idGroupReport') idGroupReport: number;
  @Input('organization') organization: OrganizationModel;

  @Output('on_dismiss') on_dismiss: EventEmitter<any> = new EventEmitter<any>();

  optional_fields: GroupReportOptionalFieldModel[] = [];
  current_user: User;

  form_group: FormGroup = this.form_builder.group({
    report_date: new FormControl(undefined, [Validators.required]),
    idGroupReport: new FormControl(undefined, [Validators.required]),
    created_by: new FormControl(undefined, [Validators.required]),
    optional_fields: new FormArray([])
  });

  busy: boolean = false;
  record: GroupReportRecordModel;
  report_date: string;

  constructor(
    private group_report_service: GroupsReportService,
    private form_builder: FormBuilder,
    private user_service: UserService,
    private router: Router,
    private organization_service: OrganizationService
  ) {
    this.current_user = this.user_service.getCurrentUser();
  }

  ngOnInit() {
    this.form_group.get('idGroupReport').setValue(this.idGroupReport);
    this.form_group.get('created_by').setValue(this.current_user.idUsuario);
    this.getOptionalFields();
    if (!this.organization) {
      this.getOrganization()
    }
  }

  get optional_field_array() {
    return this.form_group.get('optional_fields') as FormArray;
  }

  async getOptionalFields() {
    const response: any = await this.group_report_service.getOptionalFields({
      idGroupReport: this.idGroupReport
    }).toPromise()
      .catch(error => {
        console.error(error);
        this.group_report_service.api.showToast(`Error getting the optional fields, this form will closed.`, ToastType.error);
        this.deactivateForm();
        return;
      });
    if (response) {
      this.optional_fields = response;
      this.cleanArray();
      if (this.optional_fields.length === 0) {
        this.group_report_service.api.showToast(`You need to add an optional field first.`, ToastType.info);
        this.router.navigateByUrl(`/groups/reports/${this.idGroupReport}/optional_fields`)
        return;
      }
      this.optional_fields.forEach(of => {
        let value: FormControl;
        // 1	Count
        // 2	Sum
        // 3	Text
        // 4	Check
        // 5	Average
        // 6	Max
        const supported = [1, 2, 5, 6];
        if (supported.includes(of.input_type)) {
          if (of.input_display_type === 1) {
            value = new FormControl(undefined, [Validators.required, Validators.pattern("^[0-9]*$")]);
          } else {
            if (of.input_display_type === 4) {
              value = new FormControl(undefined, [Validators.required, Validators.max(100), Validators.pattern(/^-?\d*[.,]?\d{0,2}$/)]);
            } else {
              value = new FormControl(undefined, [Validators.required, Validators.pattern(/^-?\d*[.,]?\d{0,2}$/)]);
            }
          }
        } else {
          // if (of.input_type === 3) {
          // } else if (of.input_type === 4) {
          // }
          let input_value = undefined;
          if (of.input_type === 4) {
            input_value = false;
          }
          value = new FormControl(input_value, [Validators.required]);
        }
        const group = this.form_builder.group({
          idGroupRecordOptionalField: new FormControl(of.id, [Validators.required]),
          idGroupReport: new FormControl(this.idGroupReport, [Validators.required]),
          value,
          name: new FormControl(of.name),
          input_type: new FormControl(of.input_type),
          input_display_type: new FormControl(of.input_display_type)
        });
        this.optional_field_array.push(group);
      })
      if (this.record) {
        this.setOptionalFields();
      }
    }
  }

  async getOrganization() {
    const response: any = await this.organization_service.getOrganizationMinimal(this.current_user.idIglesia).toPromise()
      .catch(error => {
        console.error(error);
        return;
      })
    if (response) {
      this.organization = response.iglesia;
      if (this.form_group && !this.record) {
        const date = moment.tz(this.organization.timezone).format('MMM DD, YYYY hh:mm a');
        this.form_group.get('report_date').setValue(date);
      }
      if (this.record) {
        this.report_date = moment.tz(this.record.report_date, 'MMM DD, YYYY hh:mm a', this.organization.timezone).toISOString(true).slice(0, 16);
      }
    }
  }

  cleanArray() {
    while (this.optional_field_array.length > 0) {
      this.optional_field_array.removeAt(0);
    }
  }

  async submit() {
    this.busy = true;

    if (!this.form_group.get('id')) {
      const date = moment.tz(this.organization.timezone).format('MMM DD, YYYY hh:mm a');
      this.form_group.get('report_date').setValue(date);
    } else {
      const date = moment.tz(this.report_date, 'YYYY-MM-DDThh:mm a', this.organization.timezone).format('MMM DD, YYYY hh:mm a');
      this.form_group.get('report_date').setValue(date);
    }
    if (this.form_group.invalid) {
      this.group_report_service.api.showToast(`Please review the form. Some info is missing or incorrect.`, ToastType.error);
      this.busy = false;
      return;
    }
    const payload: GroupReportRecordModel = this.form_group.value;
    let promise: Promise<any>;
    if (payload.id) {
      promise = this.group_report_service.updateEntry(payload).toPromise();
    } else {
      promise = this.group_report_service.saveEntry(payload).toPromise();
    }
    const response: any = await promise
      .catch(error => {
        console.error(error);
        this.group_report_service.api.showToast(`Something went wrong trying to save your info. Please try again in a few seconds.`, ToastType.error);
        return;
      });
    if (response) {
      this.group_report_service.api.showToast(`Information saved successfully`, ToastType.success);
      this.deactivateForm(true);
    }
    this.busy = false;

  }

  deactivateForm(response?: any) {
    this.on_dismiss.emit(response);
  }

  initForm(record: GroupReportRecordModel) {
    this.record = record;
    this.form_group.get('report_date').setValue(record.report_date);
    this.form_group.addControl('id', new FormControl(record.id));
    this.report_date = moment.tz(this.record.report_date, 'MMM DD, YYYY hh:mm a', this.organization.timezone).toISOString(true).slice(0, 16);
    this.setOptionalFields();
  }

  setOptionalFields() {
    if (this.record.columns) {
      this.record.columns.forEach(o_field => {
        const index_control = this.optional_field_array.controls.findIndex(control => control.get('idGroupRecordOptionalField').value == o_field.idGroupRecordOptionalField);
        if (index_control >= 0) {
          const control: FormGroup = this.optional_field_array.at(index_control) as FormGroup;
          control.get('value').setValue(control.value.input_type === 4 ? JSON.parse(o_field.value) : o_field.value);
          control.addControl('id', new FormControl(o_field.id, [Validators.required]));
        }
      });
    }
  }

}
