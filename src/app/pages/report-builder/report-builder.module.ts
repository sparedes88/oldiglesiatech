import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportBuilderRoutingModule } from './report-builder-routing.module';
import { ReportBuilderComponent } from './report-builder.component';
import { PropertyBoxModule } from 'src/app/component/property-box/property-box.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule, MatTooltipModule, MatSlideToggleModule } from '@angular/material';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { PreviewComponent } from './preview/preview.component';

@NgModule({
  declarations: [ReportBuilderComponent, PreviewComponent],
  imports: [
    CommonModule,
    ReportBuilderRoutingModule,
    PropertyBoxModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    FormsModule,
    DragDropModule,
    MatTooltipModule,
    MatSlideToggleModule,
    NgxSmartModalModule.forChild(),
  ]
})
export class ReportBuilderModule { }
