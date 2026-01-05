import { ApiService } from 'src/app/services/api.service';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { GroupReportOptionalFieldModel } from '../pages/groups-report/groups-report-optional-fields-home/groups-report-optional-fields-home.component';
import { GroupReportOptionalFieldCategoryModel } from '../pages/groups-report/groups-report-optional-fields-form/groups-report-optional-fields-form.component';
import { GroupReportRecordModel } from '../pages/groups-report/groups-report-entry-form/groups-report-entry-form.component';
import { GroupReportModel } from '../pages/groups-report/groups-report-builder/groups-report-builder.component';

@Injectable({
  providedIn: 'root'
})
export class GroupsReportService {

  constructor(
    public api: ApiService,
    private userService: UserService
  ) { }

  getReports(payload: Partial<{ idOrganization: number, idGroup: number[], is_template: boolean }>) {
    return this.api.post('groups/reports/filter', payload);
  }

  getReportDetail(params: { idGroupReport: number; }) {
    const user = this.userService.getCurrentUser();
    return this.api.get(`groups/reports/${params.idGroupReport}`, { idOrganization: user.idIglesia });
  }

  updateReportGroup(payload: GroupReportModel): import("rxjs").Observable<any> {
    return this.api.patch(`groups/reports/${payload.id}`, payload);
  }

  deleteReport(record: GroupReportModel) {
    const user = this.userService.getCurrentUser();
    return this.api.delete(`groups/reports/${record.id}`, {
      deleted_by: user.idUsuario
    });
  }

  addReportGroup(payload: GroupReportModel): import("rxjs").Observable<any> {
    return this.api.post('groups/reports/', payload);
  }

  saveEntry(payload: GroupReportRecordModel) {
    return this.api.post(`groups/reports/${payload.idGroupReport}/entries`, payload);
  }

  updateEntry(payload: GroupReportRecordModel) {
    return this.api.patch(`groups/reports/${payload.idGroupReport}/entries/${payload.id}`, payload);
  }

  deleteEntry(payload: GroupReportRecordModel) {
    const user = this.userService.getCurrentUser();
    return this.api.delete(`groups/reports/${payload.idGroupReport}/entries/${payload.id}`, {
      deleted_by: user.idUsuario
    });
  }

  getOptionalFields(payload: Partial<GroupReportOptionalFieldModel>) {
    const resp = this.api.get(`groups/reports/${payload.idGroupReport}/optional_fields/`,
      // Params

      // reqOptions
    );
    return resp;
  }

  addOptionalField(payload: GroupReportOptionalFieldModel): import("rxjs").Observable<any> {
    const resp = this.api.post(`groups/reports/${payload.idGroupReport}/optional_fields/`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }
  updateOptionalField(payload: GroupReportOptionalFieldModel): import("rxjs").Observable<any> {
    const resp = this.api.patch(`groups/reports/${payload.idGroupReport}/optional_fields/${payload.id}`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }
  deleteOptionalField(optional_field: GroupReportOptionalFieldModel) {
    const user = this.userService.getCurrentUser();
    const resp = this.api.delete(`groups/reports/${optional_field.idGroupReport}/optional_fields/${optional_field.id}`,
      // Params
      {
        deleted_by: user.idUsuario
      }
      // reqOptions
    );
    return resp;
  }

  async getOptionalFieldDropdows() {
    const response: any = await this.getOptionalFieldCategories().toPromise().catch(error => {
      console.error(error);
      return;
    });
    let categories = [];
    if (response) {
      categories = response;
    }
    const response_types: any = await this.getInputTypes().toPromise().catch(error => {
      console.error(error);
      return;
    });
    let types = [];
    if (response_types) {
      types = response_types;
    }
    return {
      categories,
      types
    };
  }

  getOptionalFieldCategories(exclude?: boolean) {
    const user = this.userService.getCurrentUser();
    const payload: Partial<{
      idOrganization: number;
      exclude: boolean;
    }> = {};
    payload.idOrganization = user.idIglesia;
    if (exclude) {
      payload.exclude = true;
    }
    const resp = this.api.get(`groups/reports/settings/optional_field_categories/`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  addOptionalFieldCategory(payload: GroupReportOptionalFieldCategoryModel): import("rxjs").Observable<any> {
    const resp = this.api.post(`groups/reports/settings/optional_field_categories/`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }
  updateOptionalFieldCategory(payload: GroupReportOptionalFieldCategoryModel): import("rxjs").Observable<any> {
    const resp = this.api.patch(`groups/reports/settings/optional_field_categories/${payload.id}`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }
  deleteOptionalFieldCategory(optional_field: GroupReportOptionalFieldCategoryModel) {
    const user = this.userService.getCurrentUser();
    const resp = this.api.delete(`groups/reports/settings/optional_field_categories/${optional_field.id}`,
      // Params
      {
        deleted_by: user.idUsuario
      }
      // reqOptions
    );
    return resp;
  }

  getInputTypes() {
    const resp = this.api.get(`groups/reports/settings/types/`,
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

  getGroupReportFilterDropdows(payload: Partial<GroupReportModel>) {
    return this.api.post(`groups/reports/${payload.id}/searches`, payload);
  }

  filterEntries(payload: Partial<GroupReportModel>) {
    return this.api.post(`groups/reports/${payload.id}/filter`, payload);
  }

  duplicate(payload: Partial<GroupReportModel>) {
    return this.api.post(`groups/reports/${payload.id}/duplicate`, payload);
  }

  print(payload: Partial<GroupReportModel>) {
    return this.api.post(`groups/reports/${payload.id}/pdf`, payload, { observe: "response", responseType: "ArrayBuffer" });
  }

}
