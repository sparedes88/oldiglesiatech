import { ArticleFormModule } from './article-form/article-form.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgSelectModule } from '@ng-select/ng-select';
import { TextEditorModule } from 'src/app/component/text-editor/text-editor.module';
import { MatSlideToggleModule } from '@angular/material';
import { ArticleModule } from './../article/article.module';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgxSmartModalModule } from 'ngx-smart-modal';

import { ContentHomeComponent } from './content-home.component';
import { ContentRoutingModule } from './content-routing.module';
import { SelectTemplateComponent } from './select-template/select-template.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PixieModule } from 'src/app/component/pixie/pixie.module';
import { FullscreenModalModule } from 'src/app/component/fullscreen-modal/fullscreen-modal.module';
import { PhotoEditorComponent } from './photo-editor/photo-editor.component';
import { RouterModule } from '@angular/router';
import { TemplatePreviewComponent } from './template-preview/template-preview.component';

@NgModule({
  entryComponents: [],
  declarations: [ContentHomeComponent, SelectTemplateComponent, PhotoEditorComponent, TemplatePreviewComponent],
  imports: [
    CommonModule,
    FormsModule,
    ContentRoutingModule,
    ReactiveFormsModule,
    DataTablesModule,
    NgxSmartModalModule.forChild(),
    TranslateModule.forChild(),
    ArticleModule,
    NgMultiSelectDropDownModule,
    PixieModule,
    FullscreenModalModule,
    MatSlideToggleModule,
    TextEditorModule,
    RouterModule,
    NgSelectModule,
    DragDropModule,
    ArticleFormModule
  ]
})
export class ContentModule { }
