import { ArticuloMediaComponent } from './../../component/articulo-media/articulo-media.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleComponent } from './article/article.component';
import { TranslateModule } from '@ngx-translate/core';
import { VideosModule } from '../videos/videos.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ResizableModule } from 'angular-resizable-element';
import { QuillModule } from 'ngx-quill';
import { TextEditorModule } from 'src/app/component/text-editor/text-editor.module';
import { MailingListModule } from '../mailing-list/mailing-list.module';

@NgModule({
  entryComponents: [
    ArticleComponent,
    ArticuloMediaComponent
  ],
  declarations: [
    ArticleComponent,
    ArticuloMediaComponent],
  imports: [
    CommonModule,
    TranslateModule.forChild(),
    VideosModule,
    FormsModule,
    ReactiveFormsModule,
    ResizableModule,
    QuillModule.forRoot(),
    TextEditorModule,
    MailingListModule
  ],
  exports: [
    ArticleComponent,
    ArticuloMediaComponent]
})
export class ArticleModule { }
