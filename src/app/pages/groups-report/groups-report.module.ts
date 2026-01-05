import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';

import { GroupsReportRoutingModule } from './groups-report-routing.module';
import { GroupsReportHomeComponent } from './groups-report-home/groups-report-home.component';
import { GroupsReportBuilderComponent } from './groups-report-builder/groups-report-builder.component';
import { GroupsReportBuilderFormComponent } from './groups-report-builder-form/groups-report-builder-form.component';
import { GroupsReportDetailComponent } from './groups-report-detail/groups-report-detail.component';
import { GroupsReportEntryFormComponent } from './groups-report-entry-form/groups-report-entry-form.component';
import { GroupsReportOptionalFieldsHomeComponent } from './groups-report-optional-fields-home/groups-report-optional-fields-home.component';
import { GroupsReportOptionalFieldsFormComponent } from './groups-report-optional-fields-form/groups-report-optional-fields-form.component';
import { RouterModule } from '@angular/router';
import { GroupsReportOptionalFieldCategoriesHomeComponent } from './groups-report-optional-field-categories-home/groups-report-optional-field-categories-home.component';
import { GroupsReportOptionalFieldCategoryFormComponent } from './groups-report-optional-field-category-form/groups-report-optional-field-category-form.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { GroupReportRecordsTableComponent } from './group-report-records-table/group-report-records-table.component';

@NgModule({
  declarations: [GroupsReportHomeComponent, GroupsReportBuilderComponent, GroupsReportBuilderFormComponent, GroupsReportDetailComponent, GroupsReportEntryFormComponent, GroupsReportOptionalFieldsHomeComponent, GroupsReportOptionalFieldsFormComponent, GroupsReportOptionalFieldCategoriesHomeComponent, GroupsReportOptionalFieldCategoryFormComponent, GroupReportRecordsTableComponent],
  imports: [
    CommonModule,
    GroupsReportRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule
  ],
  entryComponents: [
    GroupsReportBuilderComponent
  ],
  exports: [
    GroupsReportBuilderComponent
  ],
  providers: [
    DecimalPipe,
    CurrencyPipe
  ]
})
export class GroupsReportModule { }
