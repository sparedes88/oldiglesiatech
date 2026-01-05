import { GroupReportModel } from './../groups-report-builder/groups-report-builder.component';
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { GroupReportOptionalFieldModel } from './../groups-report-optional-fields-home/groups-report-optional-fields-home.component';
import { ToastType } from 'src/app/login/ToastTypes';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GroupsReportService } from 'src/app/services/groups-report.service';
import * as moment from 'moment-timezone';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { GroupsService } from 'src/app/services/groups.service';
import { GroupModel } from 'src/app/models/GroupModel';
import { Observable } from 'rxjs';
import { OrganizationService } from 'src/app/services/organization/organization.service';

@Component({
  selector: 'app-groups-report-builder-form',
  templateUrl: './groups-report-builder-form.component.html',
  styleUrls: ['./groups-report-builder-form.component.scss']
})
export class GroupsReportBuilderFormComponent implements OnInit {

  current_user: User;

  form_group: FormGroup;
  template_form: FormGroup = this.form_builder.group({
    idGroupReportTemplate: new FormControl(undefined, [Validators.required])
  })

  @Input('idGroup') idGroup: number;
  @Input('organization') organization: any;

  @Output() on_dismiss = new EventEmitter();

  groups: GroupModel[] = [];

  has_templates: boolean = false;
  show_save: boolean = false;
  show_select_templates: boolean = false;

  constructor(
    private group_report_service: GroupsReportService,
    private form_builder: FormBuilder,
    private user_service: UserService,
    private groups_service: GroupsService,
    private organization_service: OrganizationService
  ) {
    this.current_user = this.user_service.getCurrentUser();
  }

  ngOnInit() {
    this.getGroups();
    if (!this.organization) {
      this.getOrganization()
    }
  }

  async getGroups() {
    const response: any = await this.groups_service.getGroups().toPromise().catch(error => {
      console.error(error);
      return;
    });
    if (response) {
      this.groups = response.groups;
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
      if (this.form_group) {
        const date = moment.tz(this.organization.timezone).format('MMM DD, YYYY hh:mm a');
        this.form_group.get('report_date').setValue(date);
      }
    }
  }

  templates: GroupReportModel[] = [];

  async getTypeOfForm(form: GroupReportModel) {
    let params: Partial<{ idOrganization: number, idGroup: number[], is_template: boolean }> = {
      idOrganization: this.current_user.idIglesia,
      is_template: true
    }
    const response: any = await this.group_report_service.getReports(params).toPromise();
    this.templates = response;
    if (this.templates.length === 0) {
      this.initForm(form);
      this.show_save = true;
    } else {
      this.has_templates = true;
    }
  }

  startFormAsNew() {
    this.show_save = true;
    this.initForm();
  }

  initForm(report?: GroupReportModel, is_template?: boolean) {
    let date: string;
    if (this.organization) {
      date = moment.tz(this.organization.timezone).format('MMM DD, YYYY hh:mm a');
    }
    this.form_group = this.form_builder.group({
      report_date: new FormControl(date),
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', []),
      is_template: new FormControl(false),
      idGroup: new FormControl(undefined, [Validators.required]),
      idOrganization: new FormControl(this.current_user.idIglesia, [Validators.required]),
      created_by: new FormControl(this.current_user.idUsuario, [Validators.required]),
    });
    if (this.idGroup) {
      this.form_group.get('idGroup').setValue(this.idGroup);
    } else {
      if (report) {
        if (report.groups_belongs_to.length > 0) {
          const idGroup = report.groups_belongs_to[0].idGroup;
          this.form_group.get('idGroup').setValue(idGroup);
        }
      }
    }
    if (report) {
      this.form_group.get('name').setValue(report.name);
      this.form_group.get('description').setValue(report.description);
      if (is_template) {
        this.form_group.addControl('template_id', new FormControl(report.id, Validators.required));
        this.form_group.addControl('import_template', new FormControl(true, Validators.required));
      } else {
        this.form_group.get('is_template').setValue(report.is_template);
        this.form_group.addControl('id', new FormControl(report.id, Validators.required));
      }
    }
  }

  getPermissions() {
    if (this.current_user.isSuperUser) {
      return false;
    }
    if (this.current_user.idUserType === 1) {
      return false;
    }
    return true;
  }

  deactivateForm(response?: any) {
    if (!response && this.show_save && this.has_templates) {
      this.show_save = false;
      this.form_group = undefined;
    } else if (!response && this.has_templates && this.show_select_templates) {
      this.show_select_templates = false;
      this.template_form.get('idGroupReportTemplate').setValue(undefined);
    } else {
      this.on_dismiss.emit(response);
    }
  }

  async addOptionalField() {
    // this.show_loading = true;
    if (this.form_group.valid) {
      const payload = this.form_group.value;
      const date = moment.tz(this.organization.timezone).format('MMM DD, YYYY hh:mm a');
      payload.report_date = date;
      let subscription: Observable<any>;
      let success_message: string;
      let error_message: string;
      if (payload.id) {
        // update
        subscription = this.group_report_service.updateReportGroup(payload);
        success_message = `Report updated successfully.`;
        error_message = `Error updating report.`;
      } else {
        // add
        subscription = this.group_report_service.addReportGroup(payload);
        success_message = `Report added successfully.`;
        error_message = `Error adding report.`;
      }
      subscription
        .subscribe(response => {
          this.deactivateForm(true);
          this.group_report_service.api.showToast(`${success_message}`, ToastType.success);
        }, error => {
          console.error(error);
          this.group_report_service.api.showToast(`${error_message}`, ToastType.error);
          // this.show_loading = false;
        });
    } else {
      // this.show_loading = false;
      this.group_report_service.api.showToast(`Some errors in form. Please check.`, ToastType.error);
    }
  }

  goToSelectTemplate() {
    this.show_select_templates = true;
  }

  loading_preview: boolean = false;
  columns: any[] = [];

  async onGroupTemplateSelected(event) {
    this.loading_preview = true;
    const idGroupReport = this.template_form.get('idGroupReportTemplate').value;
    const report: any = await this.group_report_service.getReportDetail({ idGroupReport }).toPromise();
    this.columns = report.categories;
    this.loading_preview = false;
  }

  goToFormGroup() {
    const idGroupReport = this.template_form.get('idGroupReportTemplate').value;
    const report = this.templates.find(x => x.id === Number(idGroupReport))
    this.show_save = true;
    this.initForm(report, true);
  }

}
