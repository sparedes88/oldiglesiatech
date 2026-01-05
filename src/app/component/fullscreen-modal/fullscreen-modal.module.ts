import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullscreenModalComponent } from './fullscreen-modal.component';
import { MatButtonModule, MatIconModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [FullscreenModalComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    FullscreenModalComponent
  ]
})
export class FullscreenModalModule { }
