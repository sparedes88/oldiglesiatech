import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GroupsReportDetailComponent } from './groups-report-detail/groups-report-detail.component';
import { GroupsReportHomeComponent } from './groups-report-home/groups-report-home.component';
import { GroupsReportOptionalFieldCategoriesHomeComponent } from './groups-report-optional-field-categories-home/groups-report-optional-field-categories-home.component';
import { GroupsReportOptionalFieldsHomeComponent } from './groups-report-optional-fields-home/groups-report-optional-fields-home.component';

const routes: Routes = [
  {
    path: '',
    component: GroupsReportHomeComponent
  },
  {
    path: ':idGroupReport/detail',
    component: GroupsReportDetailComponent
  },
  {
    path: ':idGroupReport/optional_fields',
    component: GroupsReportOptionalFieldsHomeComponent
  },
  {
    path: 'optional_field_categories',
    component: GroupsReportOptionalFieldCategoriesHomeComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupsReportRoutingModule { }
