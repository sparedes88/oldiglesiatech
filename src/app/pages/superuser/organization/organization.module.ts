import { ContactInfoModule } from './../../../component/contact-info/contact-info.module';
import { MapModule } from './../../../component/map/map.module';
import { NotesModule } from './../notes/notes.module';
//import { Select2Module } from './../../../component/select2/select2.module';
import { MatIconModule, MatExpansionModule } from '@angular/material';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationRoutingModule } from './organization-routing.module';
import { OrganizationHomeComponent } from './organization-home/organization-home.component';
import { DataTablesModule } from 'angular-datatables';
import { OrganizationFormComponent } from './organization-form/organization-form.component';
import { MatStepperModule, MatSlideToggleModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { ProjectTrackingModule } from '../../project-tracking/project-tracking.module';
import { AppPipesModule } from 'src/app/pipes/app-pipes/app-pipes.module';
import { PipelineSimplifiedFormComponent } from './pipeline-simplified-form/pipeline-simplified-form.component';
import { NgxMaskModule } from 'ngx-mask';
import { ContactsModule } from '../contacts/contacts.module';
import { GooglePlacesModule } from 'src/app/component/google-places/google-places.module';
import { CustomSelectCountryModule } from 'src/app/component/custom-select-country/custom-select-country.module';

@NgModule({
  declarations: [OrganizationHomeComponent, OrganizationFormComponent, PipelineSimplifiedFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OrganizationRoutingModule,
    TranslateModule,
    DataTablesModule,
    NgxSmartModalModule,
    MatStepperModule,
    NgMultiSelectDropDownModule,
    NgxQRCodeModule,
    MatSlideToggleModule,
    ProjectTrackingModule,
    MatFormFieldModule,
    MatInputModule,
    AppPipesModule,
    MatIconModule,
    NgxMaskModule.forChild(),
    MatExpansionModule,
    //Select2Module,
    ContactsModule,
    NotesModule,
    GooglePlacesModule,
    MapModule,
    ContactInfoModule,
    CustomSelectCountryModule
  ],
  exports:[
    OrganizationFormComponent,
    PipelineSimplifiedFormComponent
  ]
})
export class OrganizationModule { }
