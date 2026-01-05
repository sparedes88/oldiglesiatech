import { GroupReportInputType, GroupReportOptionalFieldModel } from './../groups-report-optional-fields-home/groups-report-optional-fields-home.component';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { GroupsReportService } from 'src/app/services/groups-report.service';
import { Observable } from 'rxjs';

export class GroupReportOptionalFieldCategoryModel {
  id: number;
  name: string;
  description: string;
}

@Component({
  selector: 'app-groups-report-optional-fields-form',
  templateUrl: './groups-report-optional-fields-form.component.html',
  styleUrls: ['./groups-report-optional-fields-form.component.scss']
})
export class GroupsReportOptionalFieldsFormComponent implements OnInit {

  @Output() onDismiss = new EventEmitter();

  @Input('idGroupReport') idGroupReport: number;

  reviewForm: FormGroup;
  currentUser: User;

  types: GroupReportInputType[] = [];
  categories: GroupReportOptionalFieldCategoryModel[] = [];
  selected_type: GroupReportInputType;

  constructor(
    private form_builder: FormBuilder,
    private group_report_service: GroupsReportService,
    private user_service: UserService
  ) {
    this.currentUser = this.user_service.getCurrentUser();
  }

  ngOnInit() {
    this.getDropdowns();
  }

  async getDropdowns() {
    const response = await this.group_report_service.getOptionalFieldDropdows();
    this.types = response.types;
    this.categories = response.categories;
    this.setType(true);
  }

  initForm(optional_field: GroupReportOptionalFieldModel) {
    this.reviewForm = this.form_builder.group({
      idOrganization: [this.currentUser.idIglesia, Validators.required],
      idGroupReport: new FormControl(this.idGroupReport, [Validators.required]),
      name: [optional_field ? optional_field.name : '', Validators.required],
      description: [optional_field ? optional_field.description : ''],
      idGroupReportOptionalFieldCategory: new FormControl(optional_field ? optional_field.idGroupReportOptionalFieldCategory : null),
      input_type: new FormControl(optional_field ? optional_field.input_type : null),
      input_display_type: new FormControl(optional_field ? optional_field.input_display_type : null),
      created_by: [this.currentUser.idUsuario, Validators.required],
    });

    if (optional_field) {
      this.reviewForm.addControl('id', new FormControl(optional_field.id, Validators.required));
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

  deactivateForm(response?: any) {
    this.onDismiss.emit(response);
  }

  async addOptionalField() {
    if (this.selected_type) {
      const input_display_type = this.reviewForm.get('input_display_type').value;
      if (this.selected_type.accepted_display_formats_items.length > 0 && !input_display_type) {
        this.group_report_service.api.showToast(`This type need you select a view type`, ToastType.error);
        return;
      }
    }
    const idGroupReportOptionalFieldCategory = Number(this.reviewForm.get('idGroupReportOptionalFieldCategory').value);
    if (isNaN((idGroupReportOptionalFieldCategory))) {
      this.reviewForm.get('idGroupReportOptionalFieldCategory').setValue(null);
    }
    // this.show_loading = true;
    if (this.reviewForm.valid) {
      const payload = this.reviewForm.value;
      let subscription: Observable<any>;
      let success_message: string;
      let error_message: string;
      if (payload.id) {
        // update
        subscription = this.group_report_service.updateOptionalField(payload);
        success_message = `Optional field updated successfully.`;
        error_message = `Error updating optional field.`;
      } else {
        // add
        subscription = this.group_report_service.addOptionalField(payload);
        success_message = `Optional field added successfully.`;
        error_message = `Error adding optional field.`;
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

  setType(prevent_reset?: boolean) {
    const idInputType = Number(this.reviewForm.get('input_type').value);
    this.selected_type = this.types.find(x => x.id === idInputType);
    if (!prevent_reset) {
      this.reviewForm.get('input_display_type').setValue(null);
    }
  }

  checkValue() {
    const idInputDisplayType = Number(this.reviewForm.get('input_display_type').value);
    if (isNaN(idInputDisplayType)) {
      this.reviewForm.get('input_display_type').setValue(null);
    }
  }

}
