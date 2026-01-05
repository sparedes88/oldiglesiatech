import { OrganizationDisclaimerModule } from './../../component/organization-disclaimer/organization-disclaimer.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RegisterRoutingModule } from './register-routing.module';
import { RegisterComponent } from './register/register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { RegisterInOrganizationFormComponent } from './register-in-organization-form/register-in-organization-form.component';
import { GooglePlacesModule } from 'src/app/component/google-places/google-places.module';
import { CustomSelectCountryModule } from 'src/app/component/custom-select-country/custom-select-country.module';
import { StandaloneAccountLoginModule } from 'src/app/component/standalone-account-login/standalone-account-login.module';
import { RegisterInGroupComponent } from './register-in-group/register-in-group.component';
import { DisclaimerComponent } from './disclaimer/disclaimer.component';

@NgModule({
  declarations: [RegisterComponent, RegisterInOrganizationFormComponent, RegisterInGroupComponent, DisclaimerComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RegisterRoutingModule,
    NgxMaskModule.forChild(),
    GooglePlacesModule,
    CustomSelectCountryModule,
    StandaloneAccountLoginModule,
    TranslateModule.forChild(),
    OrganizationDisclaimerModule
  ],
  exports: [RegisterInOrganizationFormComponent, RegisterInGroupComponent]
})
export class RegisterModule { }
