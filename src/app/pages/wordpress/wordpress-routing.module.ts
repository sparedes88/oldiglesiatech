import { PagesListComponent } from './pages-list/pages-list.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WordpressComponent } from './wordpress.component';

const routes: Routes = [
  {
    path:'',
    component: WordpressComponent
  },
  {
    path:'pageDetails/:id',
    component: PagesListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WordpressRoutingModule { }
