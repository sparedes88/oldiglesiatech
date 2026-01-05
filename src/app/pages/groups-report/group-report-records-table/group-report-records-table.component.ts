import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { GroupsReportService } from 'src/app/services/groups-report.service';
import { UserService } from 'src/app/services/user.service';
import { GroupReportModel } from '../groups-report-builder/groups-report-builder.component';
import { GroupReportRecordModel } from '../groups-report-entry-form/groups-report-entry-form.component';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-group-report-records-table',
  templateUrl: './group-report-records-table.component.html',
  styleUrls: ['./group-report-records-table.component.scss']
})
export class GroupReportRecordsTableComponent implements OnInit, OnChanges {

  @Input('loading') loading: boolean = true;
  @Input('columns') categories: any[] = [];
  @Input('is_simulated') is_simulated: boolean = false;
  @Input('record_size') record_size;
  @Input('records') records: GroupReportRecordModel[] = [];
  @Input('idGroupReport') idGroupReport: number;
  @Input('organization') organization: OrganizationModel;

  current_user: User;

  filter_form: FormGroup = this.form_builder.group({
    dates: new FormControl([])
  });
  dates = [];
  filtering: boolean = false;
  selectOptions: IDropdownSettings = {
    singleSelection: false,
    idField: 'value',
    textField: 'name',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
    itemsShowLimit: 1
  };

  combined_columns: any[] = [];

  @Output('on_edit') on_edit: EventEmitter<GroupReportRecordModel> = new EventEmitter<GroupReportRecordModel>();
  @Output('on_delete') on_delete: EventEmitter<GroupReportRecordModel> = new EventEmitter<GroupReportRecordModel>();
  @Output('on_refresh') on_refresh: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private group_report_service: GroupsReportService,
    private decimal_pipe: DecimalPipe,
    private currency_pipe: CurrencyPipe,
    private form_builder: FormBuilder,
    private user_service: UserService
  ) {
    this.current_user = this.user_service.getCurrentUser();
  }

  ngOnInit() {
    this.setColumns();
    if (this.is_simulated) {
      if (this.record_size) {
        let timezone: string;
        if (this.organization) {
          timezone = this.organization.timezone;
        }
        let start_date = moment.tz(timezone);
        for (let index = 0; index < this.record_size; index++) {
          const element: Partial<GroupReportRecordModel> = {
            report_date: start_date.format('MMM DD, YYYY hh:mm a'),
            columns: []
          };
          this.records.push(element as GroupReportRecordModel);
          start_date = start_date.add(1, 'day');
        }
        this.loading = false;
      } else {
        this.group_report_service.api.showToast(`This preview setup is incorrect.`, ToastType.error);
        this.loading = false;
      }
    } else {
      this.getFilterDropdows();
    }
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

  getPayload(): Partial<GroupReportModel> {
    const payload: Partial<GroupReportModel> = {
      id: this.idGroupReport,
      idOrganization: this.organization ? this.organization.idIglesia : this.current_user.idIglesia
    }
    const dates = this.filter_form.value.dates;
    if (dates.length > 0) {
      payload.dates = dates.map(x => x.value);
    }
    return payload;
  }

  setColumns() {
    this.combined_columns = [];
    this.categories.forEach(element => {
      if (element.columns) {
        element.columns.forEach(col => {
          this.combined_columns.push(col);
        })
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.categories) {
      const categories_change = changes.categories;
      if (!categories_change.firstChange) {
        this.setColumns();
      }
    }
    if (changes.idGroupReport) {
      if (!changes.idGroupReport.firstChange) {
        this.getFilterDropdows();
      }
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
    if (!this.is_simulated) {
      this.on_edit.emit(record);
    }
  }

  deleteRecord(record: GroupReportRecordModel) {
    if (!this.is_simulated) {
      this.on_delete.emit(record);
    }
  }

  setFilters() {
    if (this.dates.length) {
      this.filtering = true;
    }
  }

  cancel() {
    this.filtering = false;
    this.filter_form.get('dates').setValue([]);
    this.on_refresh.emit();
  }

  getRows() {
    this.on_refresh.emit();
  }

}
