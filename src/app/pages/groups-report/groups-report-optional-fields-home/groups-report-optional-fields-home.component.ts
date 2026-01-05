import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { InventoryService } from 'src/app/inventory.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { GroupsReportService } from 'src/app/services/groups-report.service';
import { UserService } from 'src/app/services/user.service';
import { GroupsReportOptionalFieldsFormComponent } from '../groups-report-optional-fields-form/groups-report-optional-fields-form.component';


export class GroupReportOptionalFieldModel {
  id: number;
  name: string;
  idGroupReport: number;
  idGroupReportOptionalFieldCategory: number;
  description: string;
  input_type: number;
  input_display_type: number;
  created_by: number;
  value: any;
  created_at: number;
  idGroupRecordOptionalField?: number;
}

export class GroupReportInputType {
  id: number;
  name: string;
  accepted_display_formats: number[];
  accepted_display_formats_items: {
    id: number;
    name: string;
  }[];
}

@Component({
  selector: 'app-groups-report-optional-fields-home',
  templateUrl: './groups-report-optional-fields-home.component.html',
  styleUrls: ['./groups-report-optional-fields-home.component.scss']
})
export class GroupsReportOptionalFieldsHomeComponent implements OnInit {

  idGroupReport: number;



  @Input() show_dismiss: boolean = true;

  @ViewChild('groups_report_optional_fields_form') groups_report_optional_fields_form: GroupsReportOptionalFieldsFormComponent;

  optional_fields: GroupReportOptionalFieldModel[] = [];
  currentUser: User;
  show_editable: boolean = false;
  show_loading: boolean = false;

  constructor(
    private userService: UserService,
    private group_report_service: GroupsReportService,
    private activated_route: ActivatedRoute
  ) {
    this.currentUser = this.userService.getCurrentUser();
    this.idGroupReport = Number(this.activated_route.snapshot.params['idGroupReport']);
  }

  ngOnInit() {
    this.getOptionalFields();
  }

  getOptionalFields() {
    this.show_loading = true;
    return new Promise((resolve, reject) => {
      const promises = [];
      // promises.push(this.inventoryService.getCategoryes().toPromise());
      // promises.push(this.inventoryService.getCategoryCategories().toPromise());
      promises.push(this.group_report_service.getOptionalFields({
        idGroupReport: this.idGroupReport
      }).toPromise());
      Promise.all(promises)
        .then((response: any) => {
          this.optional_fields = response[0];
          this.show_loading = false;
          return resolve(this.optional_fields);
        }, error => {
          this.show_loading = false;
          console.error(error);
          this.optional_fields = [];
          return resolve(this.optional_fields);
        });
    });
  }

  dismiss(response?) {
    this.deactivateForm();
    if (response) {
      this.getOptionalFields();
    }
  }

  getPermissions() {
    if (this.currentUser.isSuperUser) {
      return false;
    }
    if (this.currentUser.idUserType === 1) {
      return false;
    }
    return true;
  }

  activateForm(optional_field?: GroupReportOptionalFieldModel) {
    this.show_editable = true;
    setTimeout(() => {
      this.groups_report_optional_fields_form.initForm(optional_field);
    }, 100);
  }

  deactivateForm(response?) {
    this.show_editable = false;
    if (response) {
      this.getOptionalFields();
    }
    // this.reviewForm = undefined;
  }

  updateOptionalField(optional_field: GroupReportOptionalFieldModel) {
    this.activateForm(Object.assign({}, optional_field));
  }


  deleteOptionalField(optional_fields: GroupReportOptionalFieldModel) {
    if (confirm(`Delete ${optional_fields.name}?. This will delete any other information associated with it.`)) {
      this.group_report_service.deleteOptionalField(optional_fields)
        .subscribe(data => {
          this.getOptionalFields();
          this.group_report_service.api.showToast(`Optional field successfully deleted.`, ToastType.success);
        },
          err => {
            console.error(err);
            this.group_report_service.api.showToast(`Error deleting optional field.`, ToastType.error);
          });
    }
  }
}
