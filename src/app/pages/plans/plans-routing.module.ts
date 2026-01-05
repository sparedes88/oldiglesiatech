import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlanHomeComponent } from './plan-home/plan-home.component';

const routes: Routes = [
  {
    path: '',
    component: PlanHomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlansRoutingModule { }
