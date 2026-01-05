import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyBoxModule } from 'src/app/component/property-box/property-box.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule } from '@angular/material';
import { MaterialFileInputModule } from 'ngx-material-file-input';

import { ReportPdfComponent} from './report-pdf.component';
import { ReportPdfRoutingModule } from './report-pdf-routing.module';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    ReportPdfComponent

  ],
  imports: [
    CommonModule,
    PropertyBoxModule,
    ReportPdfRoutingModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MaterialFileInputModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatIconModule,
    DragDropModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgxSmartModalModule.forChild()
  ]
})
export class ReportPdfModule { }
