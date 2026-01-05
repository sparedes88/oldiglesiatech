import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlansRoutingModule } from './plans-routing.module';
import { PlanFormComponent } from './plan-form/plan-form.component';
import { PlanHomeComponent } from './plan-home/plan-home.component';

@NgModule({
  declarations: [PlanFormComponent, PlanHomeComponent],
  imports: [
    CommonModule,
    PlansRoutingModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,

  ]
})
export class PlansModule { }
