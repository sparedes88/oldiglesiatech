import { FinanceDashboardComponent } from './finance-dashboard/finance-dashboard.component';
import { DonationCategoryFormComponent } from './donation-category-form/donation-category-form.component';
import { DonationCategoryComponent } from './donation-category/donation-category.component';
import { DonationsRoutingModule } from './donations-routing.module';
import { DonationsComponent } from './donations.component';
import { ListComponent } from './list/list.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatFormFieldModule,
  MatInputModule,
} from '@angular/material';
import {
  AggregateService,
  ColumnChooserService,
  ColumnMenuService,
  FilterService,
  GridModule,
  GroupService,
  PageService,
  PdfExportService,
  ResizeService,
  SortService,
  ToolbarService,

} from '@syncfusion/ej2-angular-grids';

import { DataTablesModule } from 'angular-datatables';
import { NgxMaskModule } from 'ngx-mask';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DonationsV2Component } from './donations-v2/donations-v2.component';
import { CardUiModule } from 'src/app/component/card-ui/card-ui.module';
import { ManualDonationFormComponent } from './manual-donation-form/manual-donation-form.component';
import { StripeInfoFormComponent } from './stripe-info-form/stripe-info-form.component';
import { HowToSetStripeComponent } from './how-to-set-stripe/how-to-set-stripe.component';
import { DonationFormsModule } from './forms/forms.module';
@NgModule({
  declarations: [
    DonationsComponent,
    ListComponent,
    DonationCategoryComponent,
    DonationCategoryFormComponent,
    DonationsV2Component,
    ManualDonationFormComponent,
    FinanceDashboardComponent,
    StripeInfoFormComponent,
    HowToSetStripeComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DonationsRoutingModule,
    CommonModule,
    DataTablesModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    NgxSmartModalModule.forChild(),
    NgxMaskModule.forChild(),
    GridModule,
    NgMultiSelectDropDownModule,
    CardUiModule,
    DonationFormsModule
  ],
  providers: [
    SortService,
    FilterService,
    PageService,
    PdfExportService,
    ToolbarService,
    ColumnChooserService,
    ColumnMenuService,
    AggregateService,
    ResizeService,
    GroupService
  ],
  exports: [DonationsComponent, DonationsV2Component, FinanceDashboardComponent, StripeInfoFormComponent, HowToSetStripeComponent],
  entryComponents: [
    DonationsV2Component,
    FinanceDashboardComponent,
    StripeInfoFormComponent,
    HowToSetStripeComponent,
    DonationCategoryComponent,
    ListComponent
  ]
})

export class DonationsModule { }
