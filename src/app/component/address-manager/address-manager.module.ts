import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressManagerComponent } from './address-manager/address-manager.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material';
import { GooglePlacesModule } from '../google-places/google-places.module';

@NgModule({
  declarations: [
    AddressManagerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    GooglePlacesModule
  ],
  entryComponents: [
    AddressManagerComponent
  ],
  exports: [
    AddressManagerComponent
  ]
})
export class AddressManagerModule { }
