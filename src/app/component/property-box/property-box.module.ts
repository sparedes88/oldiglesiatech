import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyBoxComponent } from './property-box.component';

@NgModule({
  declarations: [PropertyBoxComponent],
  imports: [
    CommonModule
  ],
  exports: [
    PropertyBoxComponent
  ]
})
export class PropertyBoxModule { }
