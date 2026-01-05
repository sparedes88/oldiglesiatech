import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileTextButtonComponent } from './profile-text-button.component';

@NgModule({
  declarations: [
    ProfileTextButtonComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    ProfileTextButtonComponent
  ],
  exports: [
    ProfileTextButtonComponent
  ]
})
export class ProfileTextButtonModule { }
