import { GroupReportModel } from './../groups-report-builder/groups-report-builder.component';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment-timezone';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { GroupsReportService } from 'src/app/services/groups-report.service';
import { UserService } from 'src/app/services/user.service';

import { GroupsReportEntryFormComponent } from '../groups-report-entry-form/groups-report-entry-form.component';
import { OrganizationService } from './../../../services/organization/organization.service';
import { GroupReportRecordModel } from './../groups-report-entry-form/groups-report-entry-form.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { GroupReportRecordsTableComponent } from '../group-report-records-table/group-report-records-table.component';

@Component({
  selector: 'app-groups-report-detail',
  templateUrl: './groups-report-detail.component.html',
  styleUrls: ['./groups-report-detail.component.scss']
})
export class GroupsReportDetailComponent implements OnInit {

  @ViewChild('group_report_entry_form') group_report_entry_form: GroupsReportEntryFormComponent
  @ViewChild('group_reports_table') group_reports_table: GroupReportRecordsTableComponent;

  idGroupReport: number;
  origin: string;

  show_editable: boolean = false;

  report: any;
  combined_columns: any[] = [];

  organization: OrganizationModel;
  current_user: User;
  show_detail: boolean = false;
  printing: boolean = false;
  filtering: boolean = false;

  filter_form: FormGroup = this.form_builder.group({
    dates: new FormControl([])
  });

  dates = [];

  selectOptions: IDropdownSettings = {
    singleSelection: false,
    idField: 'value',
    textField: 'name',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
    itemsShowLimit: 1
  };

  constructor(
    private activated_route: ActivatedRoute,
    private router: Router,
    private group_report_service: GroupsReportService,
    private decimal_pipe: DecimalPipe,
    private currency_pipe: CurrencyPipe,
    private organization_service: OrganizationService,
    private user_service: UserService,
    private form_builder: FormBuilder
  ) {
    this.current_user = this.user_service.getCurrentUser();
    this.idGroupReport = Number(this.activated_route.snapshot.params['idGroupReport']);
  }

  async ngOnInit() {
    this.origin = this.activated_route.snapshot.queryParams['origin'];

    await this.getOrganization();
    this.getRows();
  }

  async getFilterDropdows() {
    const payload = this.getPayload();
    const response: any = await this.group_report_service.getGroupReportFilterDropdows(payload).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.dates = response.dates;
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
    }
  }

  async getRows() {
    this.show_detail = false;
    const payload = this.getPayload();
    await this.getFilterDropdows();
    const response = await this.group_report_service.filterEntries(payload).toPromise()
      .catch(error => {
        console.error(error);
        this.show_detail = true;
        return;
      });
    if (response) {
      this.report = response;
      this.combined_columns = [];
      this.report.categories.forEach(element => {
        if (element.columns) {
          element.columns.forEach(col => {
            this.combined_columns.push(col);
          })
        }
      });
      this.show_detail = true;
    }
  }

  getPayload(): Partial<GroupReportModel> {
    let payload: Partial<GroupReportModel>;
    if (this.group_reports_table) {
      payload = this.group_reports_table.getPayload();
    } else {
      payload = {
        id: this.idGroupReport,
        idOrganization: this.organization.idIglesia
      }
      const dates = this.filter_form.value.dates;
      if (dates.length > 0) {
        payload.dates = dates.map(x => x.value);
      }
    }
    return payload;
  }

  dismiss(response?) {
    if (this.origin) {
      this.router.navigateByUrl(this.origin);
      return;
    }
    this.router.navigateByUrl('/groups/reports');
  }

  openRegisterRow() {
    this.show_editable = true;
  }

  dismissRow(response?) {
    this.show_editable = false;
    if (response) {
      this.getRows();
    }
  }

  getValue(record, column) {
    let col;
    if (!record.columns) {
      col = {
        value: ''
      }
    } else {
      col = record.columns.find(x => x.idGroupRecordOptionalField === column.id);
    }
    let value = col ? col.value : undefined;
    const format_value = this.formatValue(value, column);
    return format_value;
  }
  formatValue(value, column) {
    const supported = [1, 2, 5, 6]
    if (supported.includes(column.input_type)) {
      if (column.input_display_type === 1) {
        return this.decimal_pipe.transform(value, '1.0-0');
      } else if (column.input_display_type === 2) {
        return this.decimal_pipe.transform(value, '1.0-2');
      } else if (column.input_display_type === 3) {
        return this.currency_pipe.transform(value, '$', 'symbol', '1.2-2')
      } else if (column.input_display_type === 4) {
        if (value) {
          return `${this.decimal_pipe.transform(value, '1.0-2')}%`;
        }
      }
    } else if (column.input_type === 4) {
      return value ? JSON.parse(value) : false;
    } else {
      //text
      return value ? value : '';
    }
  }

  editRecord(record: GroupReportRecordModel) {
    this.show_editable = true;
    setTimeout(() => {
      if (this.group_report_entry_form) {
        this.group_report_entry_form.initForm(record);
      }
    }, 100);
  }

  deleteRecord(record: GroupReportRecordModel) {
    if (confirm(`Delete this record?. This will delete any other information associated with it.`)) {
      this.group_report_service.deleteEntry(record)
        .subscribe(data => {
          this.getRows();
          this.group_report_service.api.showToast(`Record successfully deleted.`, ToastType.success);
        },
          err => {
            console.error(err);
            this.group_report_service.api.showToast(`Error deleting record.`, ToastType.error);
          });
    }
  }

  async print() {
    this.printing = true;
    let payload;
    if (this.group_reports_table) {
      payload = this.group_reports_table.getPayload();
    } else {
      payload = this.getPayload();
    }
    const response: any = await this.group_report_service.print(payload).toPromise()
      .catch(error => {
        console.error(error);
        this.printing = false;
        this.group_report_service.api.showToast(`Something went wrong while trying to get the QRs`, ToastType.error);
        return;
      });
    if (response) {
      const contentType: string = response.headers.get("Content-Type");
      let fileBlob = new Blob([response.body], { type: contentType });

      const fileData = window.URL.createObjectURL(fileBlob);

      // Generate virtual link
      let link = document.createElement("a");
      link.href = fileData;
      link.download = `group_report_${this.report.name}_${moment.tz(this.organization.timezone).format('YYYY-MM-DD_HH:mm:ss')}.pdf`;
      link.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window
        })
      );
      setTimeout(() => {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(fileData);
        link.remove();
        this.printing = false;
      }, 100);
    }
  }

  setFilters() {
    if (this.dates.length) {
      this.filtering = true;
    }
  }

  applyFilter(event) {
    const dates = this.filter_form.value.dates;
    this.getRows();
  }

  cancel() {
    this.filtering = false;
    this.filter_form.get('dates').setValue([]);
    this.getRows();
  }

}
