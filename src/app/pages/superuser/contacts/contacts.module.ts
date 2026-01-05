import { NgxMaskModule } from 'ngx-mask';
import { MatIconModule } from '@angular/material';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContactsRoutingModule } from './contacts-routing.module';
import { ContactsHomeComponent } from './contacts-home/contacts-home.component';
import { ContactsFormComponent } from './contacts-form/contacts-form.component';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ContactsHomeComponent, ContactsFormComponent],
  entryComponents: [
    ContactsHomeComponent,
    ContactsFormComponent
  ],
  imports: [
    CommonModule,
    ContactsRoutingModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    NgxMaskModule.forChild(),
  ],
  exports: [
    ContactsHomeComponent,
    ContactsFormComponent
  ]
})
export class ContactsModule { }
