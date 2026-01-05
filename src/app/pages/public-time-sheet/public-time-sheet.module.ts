import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicTimeSheetRoutingModule } from './public-time-sheet-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { PublicTimeSheetFormComponent } from './public-time-sheet-form/public-time-sheet-form.component';
import { PublicTimeSheetHomeComponent } from './public-time-sheet-home/public-time-sheet-home.component';

@NgModule({
  declarations: [PublicTimeSheetHomeComponent, PublicTimeSheetFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PublicTimeSheetRoutingModule,
    TranslateModule.forChild(),
    NgMultiSelectDropDownModule,
    MatIconModule,
    NgxSmartModalModule
  ],
  exports: [
    PublicTimeSheetFormComponent
  ]
})
export class PublicTimeSheetModule { }
