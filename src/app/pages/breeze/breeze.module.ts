import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BreezeRoutingModule } from './breeze-routing.module';
import { BreezeHomeComponent } from './breeze-home/breeze-home.component';
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaskPipe } from 'ngx-mask';

@NgModule({
  declarations: [BreezeHomeComponent],
  imports: [
    CommonModule,
    BreezeRoutingModule,
    GridModule,
    DropDownListAllModule,
    FormsModule,
    ReactiveFormsModule
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
    MaskPipe
  ]
})
export class BreezeModule { }
