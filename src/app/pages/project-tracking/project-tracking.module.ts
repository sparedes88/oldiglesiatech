import { AppPipesModule } from 'src/app/pipes/app-pipes/app-pipes.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NotesModule } from './../superuser/notes/notes.module';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ProjectTrackingRoutingModule } from "./project-tracking-routing.module";
import { TrackingFormComponent } from "./tracking-form/tracking-form.component";
import { ChartComponent } from "./chart/chart.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TrackingLogComponent } from "./tracking-log/tracking-log.component";
import { DataTablesModule } from "angular-datatables";
import { ProjectProgressBarComponent } from "./project-progress-bar/project-progress-bar.component";
import { StepProgressBarComponent } from './step-progress-bar/step-progress-bar.component';
import { MatDatepickerInput, MatFormFieldModule, MatIconModule, MatDatepickerModule, MatInputModule, MAT_DATE_LOCALE } from '@angular/material';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MatMomentDateModule
} from '@angular/material-moment-adapter'

@NgModule({
  declarations: [
    TrackingFormComponent,
    ChartComponent,
    TrackingLogComponent,
    ProjectProgressBarComponent,
    StepProgressBarComponent,
  ],
  imports: [
    CommonModule,
    ProjectTrackingRoutingModule,
    FormsModule,
    NotesModule,
    NgSelectModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatFormFieldModule,
    AppPipesModule,
    MatInputModule,
    MatIconModule,
    DataTablesModule.forRoot(),
  ],
  exports: [TrackingFormComponent, ChartComponent, ProjectProgressBarComponent],
  providers: [
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' }
  ],
})
export class ProjectTrackingModule {}
