import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArticleCategoriesHomeComponent } from './article-categories-home/article-categories-home.component';

const routes: Routes = [
  {
    path: '',
    component: ArticleCategoriesHomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoriesRoutingModule { }
