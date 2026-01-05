import { GroupModel } from 'src/app/models/GroupModel';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { ApiService } from 'src/app/services/api.service';
import { GroupsReportService } from 'src/app/services/groups-report.service';
import { GroupsReportBuilderFormComponent } from '../groups-report-builder-form/groups-report-builder-form.component';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { ToastType } from 'src/app/login/ToastTypes';

export class GroupReportModel {
  id: number;
  name: string;
  description: string;
  composed_by: string;
  composed_by_name: string;
  idGroupBelongsTo: number[];
  groups_belongs_to: GroupModel[];
  groups_belongs_to_name: string;
  created_at: string;
  created_by: number
  is_template: boolean;

  idOrganization?: number;

  dates: string[];
}

@Component({
  selector: 'app-groups-report-builder',
  templateUrl: './groups-report-builder.component.html',
  styleUrls: ['./groups-report-builder.component.scss']
})
export class GroupsReportBuilderComponent implements OnInit {

  @Input('idGroup') group_id: number;
  @Input('hide_header') hide_header: boolean;
  @Input('origin') origin: string;

  @ViewChild('groups_report_form') groups_report_form: GroupsReportBuilderFormComponent;

  current_user: User;

  reports: GroupReportModel[] = [];
  organization: any;

  show_editable: boolean = false;
  show_detail: boolean = false;
  busy: boolean = false;

  constructor(
    private user_service: UserService,
    private api: ApiService,
    private group_report_service: GroupsReportService,
    private organization_service: OrganizationService
  ) {
    this.current_user = this.user_service.getCurrentUser();
  }

  ngOnInit() {
    this.getGroupReports();
    this.getOrganization();
  }

  async getOrganization() {
    const response: any = await this.organization_service.getOrganizationMinimal(this.current_user.idIglesia).toPromise()
      .catch(error => {
        console.error(error);
        return;
      })
    if (response) {
      this.organization = response.iglesia;
    }
  }

  async getGroupReports() {
    this.show_detail = false;
    let params: Partial<{ idOrganization: number, idGroup: number[] }> = {
      idOrganization: this.current_user.idIglesia
    }
    if (this.group_id) {
      params.idGroup = [this.group_id];
    }
    const response: any = await this.group_report_service.getReports(params).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.reports = response;
    }
    this.show_detail = true;
  }

  activateForm(form?: GroupReportModel) {
    this.show_editable = true;
    setTimeout(() => {
      this.groups_report_form.getTypeOfForm(form);
    }, 100);
  }

  deactivateForm(response?) {
    this.show_editable = false;
    if (response) {
      this.getGroupReports();
    }
  }

  async makeACopy(report) {
    this.show_detail = false;
    report.created_by = this.current_user.idUsuario;
    const response = await this.group_report_service.duplicate(report).toPromise()
      .catch(error => {
        console.error(error);
        this.group_report_service.api.showToast(`Error duplicating this report`, ToastType.error);
        return;
      });
    if (response) {
      await this.getGroupReports();
    } else {
      this.show_detail = true;
    }
  }

  async toggleAsTemplate(report) {
    this.busy = true;
    let message: string;
    let value: boolean;
    if (report.is_template) {
      message = `This report is being used as a template, are you sure you want to disable it as template`;
      value = false;
    }
    else {
      message = `Are you sure you want to enable this report as template`;
      value = true;
    }
    const confirmation = confirm(message);
    if (confirmation) {
      const payload = Object.assign({}, report);
      payload.is_template = value;
      const response = await this.group_report_service.updateReportGroup(payload).toPromise()
        .catch(error => {
          console.error(error);
          this.group_report_service.api.showToast(`Error saving your configuration`, ToastType.error);
          return;
        });
      if (response) {
        report.is_template = value;
        // this.getGroupReports();
      }
    }
    this.busy = false;
  }

  editRecord(form?: GroupReportModel) {
    this.show_editable = true;
    setTimeout(() => {
      this.groups_report_form.initForm(form);
      this.groups_report_form.show_save = true;
    }, 100);
  }

  deleteRecord(record: GroupReportModel) {
    if (confirm(`Delete this report?. This will delete any other information associated with it.`)) {
      this.group_report_service.deleteReport(record)
        .subscribe(data => {
          this.getGroupReports();
          this.group_report_service.api.showToast(`Report successfully deleted.`, ToastType.success);
        },
          err => {
            console.error(err);
            this.group_report_service.api.showToast(`Error deleting report.`, ToastType.error);
          });
    }
  }

}
