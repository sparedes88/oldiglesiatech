import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BillingComponent } from 'src/app/pages/billing/billing.component'
import { BillingRoutingModule } from './billing-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { NgSelectModule } from '@ng-select/ng-select';
import { BillingPaymentMethodsComponent } from './billing-payment-methods/billing-payment-methods.component';
import { CardUiModule } from 'src/app/component/card-ui/card-ui.module';
import { InvoicesTableModule } from 'src/app/component/invoices-table/invoices-table.module';
//import { Select2Module } from 'src/app/component/select2/select2.module';

@NgModule({
  declarations: [BillingComponent, BillingPaymentMethodsComponent],
  imports: [
    CommonModule,
    BillingRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskModule.forChild(),
    NgSelectModule,
    CardUiModule,
    InvoicesTableModule
    //Select2Module
  ],
  entryComponents: []
})
export class BillingModule { }
