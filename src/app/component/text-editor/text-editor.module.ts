import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextEditorComponent } from './text-editor.component';
import { QuillModule } from 'ngx-quill';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgxSmartModalModule } from 'ngx-smart-modal';

@NgModule({
  declarations: [TextEditorComponent],
  imports: [
    CommonModule,
    QuillModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgxSmartModalModule
  ],
  exports: [
    TextEditorComponent
  ]
})
export class TextEditorModule { }
