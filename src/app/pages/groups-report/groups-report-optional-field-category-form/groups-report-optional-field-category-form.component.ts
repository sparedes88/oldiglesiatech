import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';
import { GroupsReportService } from 'src/app/services/groups-report.service';
import { UserService } from 'src/app/services/user.service';
import { GroupReportOptionalFieldCategoryModel } from '../groups-report-optional-fields-form/groups-report-optional-fields-form.component';

@Component({
  selector: 'app-groups-report-optional-field-category-form',
  templateUrl: './groups-report-optional-field-category-form.component.html',
  styleUrls: ['./groups-report-optional-field-category-form.component.scss']
})
export class GroupsReportOptionalFieldCategoryFormComponent implements OnInit {

  @Output() onDismiss = new EventEmitter();

  reviewForm: FormGroup;
  currentUser: User;

  constructor(
    private form_builder: FormBuilder,
    private group_report_service: GroupsReportService,
    private user_service: UserService
  ) {
    this.currentUser = this.user_service.getCurrentUser();
  }

  ngOnInit() {
  }

  initForm(optional_field: GroupReportOptionalFieldCategoryModel) {
    this.reviewForm = this.form_builder.group({
      idOrganization: [this.currentUser.idIglesia, Validators.required],
      name: [optional_field ? optional_field.name : '', Validators.required],
      description: [optional_field ? optional_field.description : ''],
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
    // this.show_loading = true;
    if (this.reviewForm.valid) {
      const payload = this.reviewForm.value;
      let subscription: Observable<any>;
      let success_message: string;
      let error_message: string;
      if (payload.id) {
        // update
        subscription = this.group_report_service.updateOptionalFieldCategory(payload);
        success_message = `Category updated successfully.`;
        error_message = `Error updating category.`;
      } else {
        // add
        subscription = this.group_report_service.addOptionalFieldCategory(payload);
        success_message = `Category added successfully.`;
        error_message = `Error adding category.`;
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
}
