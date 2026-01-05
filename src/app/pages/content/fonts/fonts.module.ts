import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FontsRoutingModule } from './fonts-routing.module';
import { FontsHomeComponent } from './fonts-home/fonts-home.component';
import { FontFormComponent } from './font-form/font-form.component';

@NgModule({
  declarations: [FontsHomeComponent, FontFormComponent],
  imports: [
    CommonModule,
    FontsRoutingModule,
    DataTablesModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSmartModalModule.forChild()
  ],
  entryComponents: [
    FontsHomeComponent
  ],
  exports: [
    FontsHomeComponent
  ]
})
export class FontsModule { }
