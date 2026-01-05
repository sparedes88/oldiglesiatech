import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DenominationHomeComponent } from './denominations-home/denominations-home.component';

const routes: Routes = [
  {
    path: '',
    component: DenominationHomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DenominationsRoutingModule { }
