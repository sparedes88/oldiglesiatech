import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomIconPickerComponent } from './custom-icon-picker.component';
import { IconPickerModule } from 'ngx-icon-picker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [CustomIconPickerComponent],
  imports: [
    CommonModule,
    IconPickerModule,
    FormsModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    CustomIconPickerComponent
  ],
  exports: [
    CustomIconPickerComponent
  ]
})
export class CustomIconPickerModule { }
