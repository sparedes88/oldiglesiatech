import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileArticlesDisplayComponent } from './profile-articles-display.component';
import { TranslateModule } from '@ngx-translate/core';
import { ArticlesPerCategoryComponent } from './articles-per-category/articles-per-category.component';

@NgModule({
  declarations: [
    ProfileArticlesDisplayComponent,
    ArticlesPerCategoryComponent
  ],
  imports: [
    CommonModule,
    TranslateModule.forChild(),
    RouterModule
  ],
  exports: [
    ProfileArticlesDisplayComponent,
    ArticlesPerCategoryComponent
  ],
  entryComponents: [
    ProfileArticlesDisplayComponent,
    ArticlesPerCategoryComponent
  ]
})
export class ProfileArticlesDisplayModule { }
