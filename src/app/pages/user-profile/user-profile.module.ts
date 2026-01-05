import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserProfileRoutingModule } from './user-profile-routing.module';
import { UserProfileComponent } from './user-profile.component';
import { DataTablesModule } from 'angular-datatables';
import { PropertyBoxModule } from 'src/app/component/property-box/property-box.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatInputModule, MatFormFieldModule, MatIconModule, MatButtonModule, MatExpansionModule, MatSlideToggleModule } from '@angular/material';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgxMaskModule } from 'ngx-mask';
import { ContactModule } from '../contact/contact.module';
import { StandaloneAccountLoginModule } from 'src/app/component/standalone-account-login/standalone-account-login.module';

@NgModule({
  declarations: [UserProfileComponent],
  imports: [
    CommonModule,
    UserProfileRoutingModule,
    DataTablesModule,
    PropertyBoxModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MaterialFileInputModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgxSmartModalModule.forChild(),
    NgxMaskModule.forChild(),
    MatExpansionModule,
    MatSlideToggleModule,
    ContactModule,
    StandaloneAccountLoginModule
  ]
})
export class UserProfileModule { }
