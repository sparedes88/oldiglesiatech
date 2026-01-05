import { NgxSmartModalModule } from 'ngx-smart-modal';
import { MatIconModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimeSheetRoutingModule } from './time-sheet-routing.module';
import { TimeSheetHomeComponent } from './time-sheet-home/time-sheet-home.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TimeSheetFormComponent } from './time-sheet-form/time-sheet-form.component';

@NgModule({
  declarations: [TimeSheetHomeComponent, TimeSheetFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TimeSheetRoutingModule,
    TranslateModule.forChild(),
    NgMultiSelectDropDownModule,
    MatIconModule,
    NgxSmartModalModule
  ],
  exports: [
    TimeSheetFormComponent
  ]
})
export class TimeSheetModule { }
