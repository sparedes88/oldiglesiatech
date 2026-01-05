import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FontsHomeComponent } from './fonts-home/fonts-home.component';

const routes: Routes = [
  {
    path: '',
    component: FontsHomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FontsRoutingModule { }
