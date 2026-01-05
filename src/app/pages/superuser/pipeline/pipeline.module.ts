import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PipelineRoutingModule } from './pipeline-routing.module';
import { PipelineHomeComponent } from './pipeline-home/pipeline-home.component';
import { PipelineFormComponent } from './pipeline-form/pipeline-form.component';
import { DataTablesModule } from 'angular-datatables';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ContactsModule } from '../contacts/contacts.module';
import { OrganizationModule } from '../organization/organization.module';

@NgModule({
  declarations: [PipelineHomeComponent, PipelineFormComponent],
  imports: [
    CommonModule,
    PipelineRoutingModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    ContactsModule,
    OrganizationModule
  ],
  bootstrap: [PipelineHomeComponent, PipelineFormComponent]
})
export class PipelineModule { }
