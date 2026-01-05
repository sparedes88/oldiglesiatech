import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HelpRequestRoutingModule } from './help-request-routing.module';
import { HelpRequestComponent } from './help-request.component';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [HelpRequestComponent],
  imports: [
    CommonModule,
    HelpRequestRoutingModule,
    DataTablesModule,
    FormsModule,
  ]
})
export class HelpRequestModule { }
