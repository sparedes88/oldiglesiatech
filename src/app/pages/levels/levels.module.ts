import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LevelsRoutingModule } from './levels-routing.module';
import { ListComponent } from './list/list.component';
import { FormComponent } from './form/form.component';
import { DetailsComponent } from './details/details.component';
import { DataTablesModule } from 'angular-datatables';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [
    CommonModule,
    LevelsRoutingModule,
    DataTablesModule,
    ReactiveFormsModule,
    NgxSmartModalModule.forChild(),
    DragDropModule
  ],
  declarations: [ListComponent, FormComponent, DetailsComponent],
  bootstrap: [ListComponent, FormComponent, DetailsComponent],
  exports: [
    ListComponent,
  ],
})
export class LevelsModule { }
