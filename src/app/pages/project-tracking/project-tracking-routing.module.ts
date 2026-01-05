import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ChartComponent } from "./chart/chart.component";
import { TrackingFormComponent } from "./tracking-form/tracking-form.component";
import { TrackingLogComponent } from './tracking-log/tracking-log.component';

const routes: Routes = [
  {
    path: "edit",
    component: TrackingFormComponent,
  },
  {
    path: 'log',
    component: TrackingLogComponent
  },
  {
    path: 'chart/:id',
    component: ChartComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectTrackingRoutingModule {}
