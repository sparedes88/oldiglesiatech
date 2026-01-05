import { MatIconModule, MatExpansionModule } from '@angular/material';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgToggleModule } from '@nth-cloud/ng-toggle';
import { DesignRequestHomeComponent } from './admin-design-request-home/admin-design-request-home.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DesignRequestRoutingModule } from './admin-design-request-routing.module';
import { DataTablesModule } from 'angular-datatables';
import { AdminDesignRequestDetailComponent } from './admin-design-request-detail/admin-design-request-detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DesignRequestFormComponent } from './admin-design-request-form/admin-design-request-form.component';
import { DesignRequestPlanningComponent } from './admin-design-request-planning/admin-design-request-planning.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DesignRequestNoteFormComponent } from './admin-design-request-note-form/admin-design-request-note-form.component';
import { DesignRequestNoteDetailComponent } from './admin-design-request-note-detail/admin-design-request-note-detail.component';
import { AppPipesModule } from 'src/app/pipes/app-pipes/app-pipes.module';
import { DesignRequestModule } from 'src/app/component/design-request/design-request.module';

@NgModule({
  declarations: [
    DesignRequestHomeComponent,
    AdminDesignRequestDetailComponent,
    DesignRequestFormComponent,
    DesignRequestPlanningComponent,
    DesignRequestNoteFormComponent,
    DesignRequestNoteDetailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    DataTablesModule,
    DesignRequestRoutingModule,
    NgToggleModule,
    NgxSmartModalModule,
    MatIconModule,
    NgMultiSelectDropDownModule,
    MatExpansionModule,
    AppPipesModule,
    ReactiveFormsModule,
    DesignRequestModule
  ],
  exports: [
    DesignRequestNoteFormComponent,
    DesignRequestFormComponent
  ],
  bootstrap: [DesignRequestHomeComponent,
    AdminDesignRequestDetailComponent,
    DesignRequestFormComponent,
    DesignRequestPlanningComponent,
    DesignRequestNoteFormComponent,
    DesignRequestNoteDetailComponent,]
})
export class AdminDesignRequestModule { }
