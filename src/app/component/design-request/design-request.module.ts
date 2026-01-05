import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgToggleModule } from '@nth-cloud/ng-toggle';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { MatExpansionModule, MatIconModule } from '@angular/material';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AppPipesModule } from 'src/app/pipes/app-pipes/app-pipes.module';
import { DesignRequestDetailComponent } from './design-request-detail/design-request-detail.component';
import { DesignRequestFormComponent } from './design-request-form/design-request-form.component';
import { DesignRequestHomeComponent } from './design-request-home/design-request-home.component';
import { DesignRequestNoteDetailComponent } from './design-request-note-detail/design-request-note-detail.component';
import { DesignRequestNoteFormComponent } from './design-request-note-form/design-request-note-form.component';
import { DesignRequestPlanningComponent } from './design-request-planning/design-request-planning.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    DesignRequestDetailComponent,
    DesignRequestFormComponent,
    DesignRequestHomeComponent,
    DesignRequestNoteDetailComponent,
    DesignRequestNoteFormComponent,
    DesignRequestPlanningComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DataTablesModule,
    NgToggleModule,
    NgxSmartModalModule,
    MatIconModule,
    NgMultiSelectDropDownModule,
    MatExpansionModule,
    AppPipesModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports:[
    DesignRequestDetailComponent,
    DesignRequestFormComponent,
    DesignRequestHomeComponent,
    DesignRequestNoteDetailComponent,
    DesignRequestNoteFormComponent,
    DesignRequestPlanningComponent
  ]
})
export class DesignRequestModule { }
