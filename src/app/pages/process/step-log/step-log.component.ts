import { FormControl } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import * as moment from 'moment';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-step-log',
  templateUrl: './step-log.component.html',
  styleUrls: ['./step-log.component.scss']
})
export class StepLogComponent implements OnInit {

  @Input('step') step;

  logs: any[] = [];
  loading: boolean = true;
  filters: { dates: string[], users: string[] } = {
    dates: [],
    users: []
  };

  contact_filters_form: FormGroup = this.form_builder.group({
    users: new FormControl([]),
    dates: new FormControl([]),
    reason: new FormControl('')
  })

  selectUserTypeOptions: IDropdownSettings = {
    singleSelection: false,
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  constructor(
    private api: ApiService,
    private form_builder: FormBuilder
  ) { }

  async ngOnInit() {
    if (this.step) {
      this.contact_filters_form.patchValue({
        users: [],
        dates: [],
        reason: ''
      });
      this.loading = true;
      const response: any[] = await this.api.get("reportModules/getLogsByStep", { idRequisito: this.step.idRequisito }).toPromise<any>();
      const filters: any = await this.api.get("reportModules/getLogsByStep/filters", { idRequisito: this.step.idRequisito }).toPromise<any>();
      this.filters = filters;
      if (response) {
        this.logs = response;
      } else {
        this.logs = [];
      }
      this.loading = false;
    }
  }

  get logs_filtered() {
    const filters = this.contact_filters_form.value;
    let mailing = [...this.logs];
    if (filters.dates.length > 0) {
      // const dates = filters.dates.map(x => x.substring(0, 12));
      const filters = this.contact_filters_form.value;
      mailing = mailing.filter(x => x.fixed_date && filters.dates.includes(x.fixed_date.substring(0, 12)));
    }
    if (filters.users.length > 0) {
      // const ids = filters.status.map(x => x);
      mailing = mailing.filter(x => filters.users.includes(x.user_name));
    }
    if (filters.reason) {
      mailing = mailing.filter(x => {
        if (x.reason) {
          return x.reason.toLowerCase('').includes(filters.reason.toLowerCase());
        } else {
          return true;
        }
      });
    }
    return mailing;
  }

}
