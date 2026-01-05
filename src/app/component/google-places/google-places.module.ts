import { MatInputModule, MatFormFieldModule } from '@angular/material';
import { GoogleAddressComponent } from './google-places.component';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [GoogleAddressComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  exports: [GoogleAddressComponent],
})
export class GooglePlacesModule { }
