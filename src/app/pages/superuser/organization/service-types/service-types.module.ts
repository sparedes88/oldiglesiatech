import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { ServiceTypesRoutingModule } from './service-types-routing.module';
import { ServiceTypesHomeComponent } from './service-types-home/service-types-home.component';
import { ServiceTypeFormComponent } from './service-type-form/service-type-form.component';

@NgModule({
  declarations: [ServiceTypesHomeComponent, ServiceTypeFormComponent],
  imports: [
    CommonModule,
    ServiceTypesRoutingModule,
    DataTablesModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSmartModalModule.forChild()
  ]
})
export class ServiceTypesModule { }
