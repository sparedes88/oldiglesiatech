import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BreezeHomeComponent } from './breeze-home/breeze-home.component';

const routes: Routes = [{
  path: '',
  component: BreezeHomeComponent,

}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BreezeRoutingModule { }
