import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoicesTableComponent } from './invoices-table.component';
import { CardUiModule } from '../card-ui/card-ui.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [InvoicesTableComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSmartModalModule,
    NgMultiSelectDropDownModule,
    RouterModule,
    CardUiModule
  ],
  entryComponents: [
    InvoicesTableComponent
  ],
  exports: [
    InvoicesTableComponent
  ]
})
export class InvoicesTableModule { }
