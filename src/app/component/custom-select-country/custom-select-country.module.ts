import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectCountryModule } from '@angular-material-extensions/select-country';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectCountryComponent } from './custom-select-country.component';

@NgModule({
  declarations: [SelectCountryComponent],
  imports: [
    CommonModule,
    MatSelectCountryModule,
    FormsModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    SelectCountryComponent
  ], exports: [
    SelectCountryComponent
  ]
})
export class CustomSelectCountryModule { }
