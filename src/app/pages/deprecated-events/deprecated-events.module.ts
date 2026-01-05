import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventsRoutingModule } from './deprecated-events-routing.module';
import { ListComponent } from './list/list.component';
import { FormComponent } from './form/form.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { DataTablesModule } from 'angular-datatables';
import { MatSnackBarModule, MatSlideToggleModule } from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';
import { DetailsComponent } from './details/details.component';
import { PropertyBoxModule } from 'src/app/component/property-box/property-box.module';

/**
 * @deprecated Use EventsModule instead.
 */
@NgModule({
  declarations: [ListComponent, FormComponent, DetailsComponent],
  imports: [
    CommonModule,
    EventsRoutingModule,
    NgxSmartModalModule.forChild(),
    DataTablesModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    PropertyBoxModule
  ]
})
export class DeprecatedEventsModule {

  constructor() {
    console.warn('DeprecatedEventsModule is deprecated. Use EventsModule instead.');
  }
}
