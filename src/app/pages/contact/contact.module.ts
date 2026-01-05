import { NgSelectModule } from '@ng-select/ng-select';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatSlideToggleModule,
} from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { NgToggleModule } from '@nth-cloud/ng-toggle';
import {
  AggregateService,
  ColumnChooserService,
  ColumnMenuService,
  ExcelExportService,
  FilterService,
  GridModule,
  GroupService,
  PageService,
  PdfExportService,
  ResizeService,
  SortService,
  ToolbarService,

} from '@syncfusion/ej2-angular-grids';

import { DropDownListAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { DataTablesModule } from 'angular-datatables';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxMaskModule } from 'ngx-mask';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { PapaParseModule } from 'ngx-papaparse';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { CheckRequirementsComponent } from 'src/app/component/check-requirements/check-requirements.component';
import { PropertyBoxModule } from 'src/app/component/property-box/property-box.module';
import { AppPipesModule } from 'src/app/pipes/app-pipes/app-pipes.module';

import { ContactCategoryFormComponent } from './contact-category-form/contact-category-form.component';
import { ContactCategoryComponent } from './contact-category/contact-category.component';
import { ContactRoutingModule } from './contact-routing.module';
import { ContactComponent } from './contact.component';
import { ImportComponent } from './import/import.component';
import { MemberFormComponent } from './member-form/member-form.component';
import { MemberProfileComponent } from './member-profile/member-profile.component';
import { PdfComponent } from './pdf/pdf.component';
import { SeeStepDetailComponent } from './see-step-detail/see-step-detail.component';
import { ShowAllUsersComponent } from './show-all-users/show-all-users.component';
import { SimpleMemberFormComponent } from './simple-member-form/simple-member-form.component';
import { UserCommitmentFormComponent } from './user-commitment-form/user-commitment-form.component';
import { UserLogFormComponent } from './user-log-form/user-log-form.component';
import { GooglePlacesModule } from 'src/app/component/google-places/google-places.module';
import { CustomSelectCountryModule } from 'src/app/component/custom-select-country/custom-select-country.module';
import { SkeletonModule } from 'src/app/component/skeleton/skeleton.module';
import { NgxQRCodeModule } from 'ngx-qrcode2';

@NgModule({
  declarations: [
    MemberFormComponent,
    MemberProfileComponent,
    ContactComponent,
    ImportComponent,
    PdfComponent,
    ShowAllUsersComponent,
    SimpleMemberFormComponent,
    ContactCategoryComponent,
    ContactCategoryFormComponent,
    CheckRequirementsComponent,
    UserLogFormComponent,
    SeeStepDetailComponent,
    UserCommitmentFormComponent
  ],
  entryComponents:[
    MemberFormComponent,
    MemberProfileComponent,
    ContactComponent,
    ImportComponent,
    PdfComponent,
    ShowAllUsersComponent,
    SimpleMemberFormComponent,
    ContactCategoryComponent,
    ContactCategoryFormComponent,
    CheckRequirementsComponent,
    UserLogFormComponent,
    SeeStepDetailComponent,
    UserCommitmentFormComponent
  ],
  imports: [
    CommonModule,
    ContactRoutingModule,
    DataTablesModule,
    PropertyBoxModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MaterialFileInputModule,
    MatIconModule,
    MatButtonModule,
    PapaParseModule,
    FormsModule,
    MatIconModule,
    DragDropModule,
    NgMultiSelectDropDownModule,
    NgxSmartModalModule.forChild(),
    NgToggleModule,
    NgxMaskModule.forChild(),
    MatExpansionModule,
    MatSlideToggleModule,
    AppPipesModule,
    TranslateModule.forChild(),
    GridModule,
    DropDownListAllModule,
    GooglePlacesModule,
    CustomSelectCountryModule,
    NgSelectModule,
    SkeletonModule,
    NgxQRCodeModule
  ],
  exports: [
    MemberFormComponent,
    MemberProfileComponent,
    ContactComponent,
    ImportComponent,
    PdfComponent,
    ShowAllUsersComponent,
    SimpleMemberFormComponent,
    ContactCategoryComponent,
    ContactCategoryFormComponent,
    CheckRequirementsComponent,
    UserLogFormComponent,
    SeeStepDetailComponent,
    UserCommitmentFormComponent
  ],
  providers: [
    SortService,
    FilterService,
    PageService,
    ToolbarService,
    PdfExportService,
    ExcelExportService,
    ColumnChooserService,
    ColumnMenuService,
    AggregateService,
    ResizeService,
    GroupService,
  ]
})
export class ContactModule { }
