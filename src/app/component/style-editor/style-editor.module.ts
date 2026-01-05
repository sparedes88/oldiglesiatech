import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StyleEditorComponent } from './style-editor/style-editor.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [StyleEditorComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TranslateModule.forChild()
  ],
  exports: [
    StyleEditorComponent
  ],
  entryComponents: [
    StyleEditorComponent
  ]
})
export class StyleEditorModule { }
