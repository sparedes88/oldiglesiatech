import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportBuilderComponent } from './report-builder.component';

const routes: Routes = [
  {
    path: '',
    component: ReportBuilderComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportBuilderRoutingModule { }
