import { DetailsV2Component } from './details-v2/details-v2.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MailingListRoutingModule } from './mailing-list-routing.module';
import { ListComponent } from './list/list.component';
import { DetailsComponent } from './details/details.component';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { ConvertToUserComponent } from './convert-to-user/convert-to-user.component';
import { NgxMaskModule } from 'ngx-mask';
import { PreviewComponent } from './preview/preview.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CustomSelectCountryModule } from 'src/app/component/custom-select-country/custom-select-country.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CategoriesComponent } from './categories/categories.component';
import { MailingListContactCategoryFormComponent } from './contact-category-form/contact-category-form.component';
import { ContactDetailComponent } from './contact-detail/contact-detail.component';
import { ContactEditComponent } from './contact-edit/contact-edit.component';
import { NotesModule } from '../superuser/notes/notes.module';
import { ContactNoteFormComponent } from './contact-note-form/contact-note-form.component';
import { MailingListFormV2Component } from './mailing-list-form-v2/mailing-list-form-v2.component';
import { MailingListInputFormComponent } from './mailing-list-input-form/mailing-list-input-form.component';
import { MailingListInputSetupComponent } from './mailing-list-input-setup/mailing-list-input-setup.component';
import { MailingListViewComponent } from './mailing-list-view/mailing-list-view.component';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { ContactInboxEmbedComponent } from './contact-inbox-embed/contact-inbox-embed.component';

@NgModule({
  declarations: [ListComponent, DetailsComponent, DetailsV2Component, ConvertToUserComponent, PreviewComponent, CategoriesComponent, MailingListContactCategoryFormComponent, ContactDetailComponent, ContactEditComponent, ContactNoteFormComponent, MailingListFormV2Component, MailingListInputFormComponent, MailingListInputSetupComponent, MailingListViewComponent, ContactInboxEmbedComponent],
  imports: [
    CommonModule,
    MailingListRoutingModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSmartModalModule.forChild(),
    NgxMaskModule.forChild(),
    DragDropModule,
    NgSelectModule,
    CustomSelectCountryModule,
    NgMultiSelectDropDownModule,
    NotesModule,
    NgxQRCodeModule
  ],
  exports: [
    MailingListViewComponent,
    ContactInboxEmbedComponent
  ]
})
export class MailingListModule { }
