import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RemoveAccountRoutingModule } from './remove-account-routing.module';
import { RemoveAccountComponent } from './remove-account.component';
import { StandaloneAccountLoginModule } from 'src/app/component/standalone-account-login/standalone-account-login.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    RemoveAccountComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RemoveAccountRoutingModule,
    StandaloneAccountLoginModule
  ]
})
export class RemoveAccountModule { }
