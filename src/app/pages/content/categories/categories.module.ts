import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoriesRoutingModule } from './categories-routing.module';
import { ArticleCategoriesHomeComponent } from './article-categories-home/article-categories-home.component';
import { ArticleCategoryFormComponent } from './article-category-form/article-category-form.component';

@NgModule({
  declarations: [ArticleCategoriesHomeComponent, ArticleCategoryFormComponent],
  imports: [
    CommonModule,
    CategoriesRoutingModule,
    DataTablesModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSmartModalModule.forChild()
  ],
  entryComponents:[
    ArticleCategoriesHomeComponent
  ],
  exports:[
    ArticleCategoriesHomeComponent
  ]
})
export class CategoriesModule { }
