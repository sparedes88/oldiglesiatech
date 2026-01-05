import { TextEditorModule } from 'src/app/component/text-editor/text-editor.module';
import { ArticleModule } from './../../article/article.module';
import { DataTablesModule } from 'angular-datatables';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material';
import { ArticleFormComponent } from './article-form.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { ProfileTextButtonModule } from 'src/app/component/profile-text-button/profile-text-button.module';

@NgModule({
  declarations: [ArticleFormComponent],
  imports: [
    CommonModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    NgSelectModule,
    DataTablesModule,
    ArticleModule,
    NgxSmartModalModule,
    TextEditorModule,
    ProfileTextButtonModule
  ],
  exports: [
    ArticleFormComponent
  ],
  entryComponents: [ArticleFormComponent]
})
export class ArticleFormModule { }
