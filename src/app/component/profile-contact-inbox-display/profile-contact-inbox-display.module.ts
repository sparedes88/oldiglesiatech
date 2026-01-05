import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileContactInboxDisplayComponent } from './profile-contact-inbox-display.component';
import { MailingListModule } from 'src/app/pages/mailing-list/mailing-list.module';

@NgModule({
  declarations: [
    ProfileContactInboxDisplayComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MailingListModule
  ],
  exports: [
    ProfileContactInboxDisplayComponent
  ],
  entryComponents: [
    ProfileContactInboxDisplayComponent
  ]
})
export class ProfileContactInboxDisplayModule { }
