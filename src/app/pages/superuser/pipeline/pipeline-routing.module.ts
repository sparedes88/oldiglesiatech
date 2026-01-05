import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PipelineHomeComponent } from './pipeline-home/pipeline-home.component';

const routes: Routes = [
  {
    path: '',
    component: PipelineHomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PipelineRoutingModule { }
