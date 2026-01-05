import { ContentHomeComponent } from './content-home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArticleComponent } from '../article/article/article.component';
import { PhotoEditorComponent } from './photo-editor/photo-editor.component';
import { SuperUserOnlyGuard } from 'src/app/guards/super-user-only.guard';

const routes: Routes = [
  {
    path: '',
    component: ContentHomeComponent
  },
  {
    path: 'article/:id',
    component: ArticleComponent
  },
  {
    path: 'photo-editor',
    component: PhotoEditorComponent
  },
  {
    path: 'categories',
    loadChildren: 'src/app/pages/content/categories/categories.module#CategoriesModule'
  },
  {
    path: 'fonts',
    canActivate: [SuperUserOnlyGuard],
    loadChildren: 'src/app/pages/content/fonts/fonts.module#FontsModule'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContentRoutingModule { }
