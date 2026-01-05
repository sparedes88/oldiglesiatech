import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';
import { GroupsReportService } from 'src/app/services/groups-report.service';
import { UserService } from 'src/app/services/user.service';
import { GroupsReportOptionalFieldCategoryFormComponent } from '../groups-report-optional-field-category-form/groups-report-optional-field-category-form.component';
import { GroupReportOptionalFieldCategoryModel } from '../groups-report-optional-fields-form/groups-report-optional-fields-form.component';

@Component({
  selector: 'app-groups-report-optional-field-categories-home',
  templateUrl: './groups-report-optional-field-categories-home.component.html',
  styleUrls: ['./groups-report-optional-field-categories-home.component.scss']
})
export class GroupsReportOptionalFieldCategoriesHomeComponent implements OnInit {

  origin: string;
  @Input() show_dismiss: boolean = true;

  @ViewChild('groups_report_optional_field_category_form') groups_report_optional_field_category_form: GroupsReportOptionalFieldCategoryFormComponent;

  optional_fields: GroupReportOptionalFieldCategoryModel[] = [];
  currentUser: User;
  show_editable: boolean = false;
  show_loading: boolean = false;

  constructor(
    private userService: UserService,
    private group_report_service: GroupsReportService,
    private activated_route: ActivatedRoute,
    private router: Router
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  ngOnInit() {
    this.origin = this.activated_route.snapshot.queryParams['origin'];
    this.getOptionalFields();
  }

  getOptionalFields() {
    this.show_loading = true;
    return new Promise((resolve, reject) => {
      const promises = [];
      promises.push(this.group_report_service.getOptionalFieldCategories(true).toPromise());
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
    if (this.origin) {
      this.router.navigateByUrl(this.origin);
      return;
    }
    this.router.navigateByUrl('/groups/reports');
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

  deactivateForm(response?) {
    this.show_editable = false;
    if (response) {
      this.getOptionalFields();
    }
  }

  activateForm(optional_field?: GroupReportOptionalFieldCategoryModel) {
    this.show_editable = true;
    setTimeout(() => {
      this.groups_report_optional_field_category_form.initForm(optional_field);
    }, 100);
  }

  deleteOptionalField(optional_fields: GroupReportOptionalFieldCategoryModel) {
    if (confirm(`Delete ${optional_fields.name}?. This will delete any other information associated with it.`)) {
      this.group_report_service.deleteOptionalFieldCategory(optional_fields)
        .subscribe(data => {
          this.getOptionalFields();
          this.group_report_service.api.showToast(`Category successfully deleted.`, ToastType.success);
        },
          err => {
            console.error(err);
            this.group_report_service.api.showToast(`Error deleting category.`, ToastType.error);
          });
    }
  }

}
