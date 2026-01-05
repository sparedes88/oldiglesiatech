import { ResetPasswordComponent } from './reset-password/reset-password';
import { ReplacePipe } from './../../pipes/replace.pipe';
import { ContactModule } from './../../pages/contact/contact.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { PropertyBoxModule } from './../property-box/property-box.module';
import { NgxMaskModule } from 'ngx-mask';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateAccountPortalComponent } from './create-account-portal/create-account-portal.component';
import { LoginPortalComponent } from './login-portal/login-portal.component';
import { GetStartedComponent } from './get-started/get-started.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StandaloneAccountLoginComponent } from './standalone-account-login.component';
import { AccountProfileComponent } from './account-profile/account-profile.component';
import { MatExpansionModule, MatSlideToggleModule } from '@angular/material';
import { CustomSelectCountryModule } from '../custom-select-country/custom-select-country.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { AppPipesModule } from 'src/app/pipes/app-pipes/app-pipes.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { GooglePlacesModule } from '../google-places/google-places.module';
import { RouterModule } from '@angular/router';
import { EmbedProfileComponent } from './embed-profile/embed-profile.component';
import { SkeletonModule } from '../skeleton/skeleton.module';
import { NgxQRCodeModule } from 'ngx-qrcode2';

@NgModule({
  declarations: [
    StandaloneAccountLoginComponent,
    GetStartedComponent,
    LoginPortalComponent,
    CreateAccountPortalComponent,
    AccountProfileComponent,
    ResetPasswordComponent,
    EmbedProfileComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskModule.forChild(),
    PropertyBoxModule,
    MatExpansionModule,
    MatSlideToggleModule,
    NgxSmartModalModule.forChild(),
    ContactModule,
    CustomSelectCountryModule,
    NgMultiSelectDropDownModule,
    TranslateModule,
    AppPipesModule,
    NgSelectModule,
    GooglePlacesModule,
    RouterModule,
    SkeletonModule,
    NgxQRCodeModule
  ],
  exports: [
    StandaloneAccountLoginComponent,
    GetStartedComponent,
    LoginPortalComponent,
    CreateAccountPortalComponent,
    AccountProfileComponent,
    ResetPasswordComponent,
    EmbedProfileComponent
  ],
  entryComponents: [
    StandaloneAccountLoginComponent,
    GetStartedComponent,
    LoginPortalComponent,
    CreateAccountPortalComponent,
    AccountProfileComponent,
    ResetPasswordComponent,
    EmbedProfileComponent
  ],
  providers:[
    ReplacePipe
  ]
})
export class StandaloneAccountLoginModule { }
