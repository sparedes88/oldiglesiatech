import { NgxMaskModule } from 'ngx-mask';
import { MatIconModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationContactInfoFormComponent } from './organization-contact-info-form/organization-contact-info-form.component';
import { CustomSelectCountryModule } from '../custom-select-country/custom-select-country.module';

@NgModule({
  declarations: [
    OrganizationContactInfoFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    NgxMaskModule.forChild(),
    CustomSelectCountryModule
  ],
  entryComponents: [
    OrganizationContactInfoFormComponent
  ],
  exports: [
    OrganizationContactInfoFormComponent
  ]
})
export class ContactInfoModule { }
