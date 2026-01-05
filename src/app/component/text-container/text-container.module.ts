import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileTextContainerComponent } from './profile-text-container/profile-text-container.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatInputModule } from '@angular/material';
import { TextEditorModule } from '../text-editor/text-editor.module';

@NgModule({
  declarations: [
    ProfileTextContainerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    TextEditorModule
  ],
  entryComponents: [
    ProfileTextContainerComponent
  ],
  exports: [
    ProfileTextContainerComponent
  ]
})
export class TextContainerModule { }
