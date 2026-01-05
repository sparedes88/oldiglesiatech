import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DenominationsRoutingModule } from './denominations-routing.module';
import { DenominationFormComponent } from './denomination-form/denomination-form.component';
import { DenominationHomeComponent } from './denominations-home/denominations-home.component';

@NgModule({
  declarations: [DenominationFormComponent, DenominationHomeComponent],
  imports: [
    CommonModule,
    DenominationsRoutingModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,

  ]
})
export class DenominationsModule { }
