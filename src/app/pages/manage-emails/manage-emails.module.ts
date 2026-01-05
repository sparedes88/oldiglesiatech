import { ContactInfoModule } from './../../component/contact-info/contact-info.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageEmailsRoutingModule } from './manage-emails-routing.module';
import { ManageEmailsComponent } from './manage-emails.component';

@NgModule({
  declarations: [ManageEmailsComponent],
  imports: [
    CommonModule,
    ManageEmailsRoutingModule,
    ContactInfoModule
  ]
})
export class ManageEmailsModule { }
