import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProcessRoutingModule } from './process-routing.module';
import { ListComponent } from './list/list.component';
import { FormComponent } from './form/form.component';
import { DetailsComponent } from './details/details.component';
import { DataTablesModule } from 'angular-datatables';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { MatSnackBarModule, MatSlideToggleModule, MatExpansionModule, MatProgressSpinnerModule } from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { StepsComponent } from './steps/steps.component';
import { LevelsComponent } from './levels/levels.component';
import { LevelFormComponent } from './level-form/form.component';
import { BuilderComponent } from './builder/builder.component';
import { OrgchartComponent } from './orgchart/orgchart.component';
import { OrgchartModule } from 'src/app/component/orgchart/orgchart.module';
import { ContactProcessComponent } from './contact-process/contact-process.component';
import { ContactStepsComponent } from './contact-steps/contact-steps.component';
import { ContactLevelsComponent } from './contact-levels/contact-levels.component';
import { AccumulationAnnotationService, AccumulationChartModule, AccumulationDataLabelService, AccumulationLegendService, AccumulationTooltipService, PieSeriesService } from '@syncfusion/ej2-angular-charts';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { PieChartGraphComponent } from './pie-chart-graph/pie-chart-graph.component';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { RegisterViaQRComponent } from './register-via-qr/register-via-qr.component';
import { StandaloneAccountLoginModule } from 'src/app/component/standalone-account-login/standalone-account-login.module';
import { SuccessfulProcessAssignedComponent } from './successful-process-assigned/successful-process-assigned.component';
import { StepLogComponent } from './step-log/step-log.component';
import { AppPipesModule } from 'src/app/pipes/app-pipes/app-pipes.module';

@NgModule({
  declarations: [ListComponent,
    FormComponent,
    DetailsComponent,
    StepsComponent,
    LevelsComponent,
    LevelFormComponent,
    BuilderComponent,
    OrgchartComponent,
    ContactProcessComponent,
    ContactStepsComponent,
    ContactLevelsComponent,
    PieChartComponent,
    PieChartGraphComponent,
    RegisterViaQRComponent,
    SuccessfulProcessAssignedComponent,
    StepLogComponent
  ],
  imports: [
    CommonModule,
    ProcessRoutingModule,
    DataTablesModule,
    NgxSmartModalModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    MatSlideToggleModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    OrgchartModule,
    MatProgressSpinnerModule,
    AccumulationChartModule,
    NgxQRCodeModule,
    StandaloneAccountLoginModule,
    TranslateModule,
    AppPipesModule
  ],
  exports: [
    FormComponent,
    ListComponent,
    StepsComponent,
    LevelsComponent,
    SuccessfulProcessAssignedComponent
  ],
  providers: [
    PieSeriesService, AccumulationLegendService, AccumulationTooltipService, AccumulationDataLabelService,
    AccumulationAnnotationService
  ]
})
export class ProcessModule { }
