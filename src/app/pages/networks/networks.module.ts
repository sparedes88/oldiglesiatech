import { CustomIconPickerModule } from './../../component/icon-picker/custom-icon-picker.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NetworksRoutingModule } from './networks-routing.module';
import { NetworksHomeComponent } from './networks-home/networks-home.component';
import { NetworksFormComponent } from './networks-form/networks-form.component';
import { NetworksProfileFormComponent } from './networks-profile-form/networks-profile-form.component';
import { NetworksOrganizationFormComponent } from './networks-organization-form/networks-organization-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectCountryModule } from '@angular-material-extensions/select-country';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DataTablesModule } from 'angular-datatables';
import { NgxSmartModalModule } from 'ngx-smart-modal';

@NgModule({
  declarations: [NetworksHomeComponent, NetworksFormComponent, NetworksProfileFormComponent, NetworksOrganizationFormComponent],
  imports: [
    CommonModule,
    NetworksRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectCountryModule,
    CustomIconPickerModule,
    DragDropModule,
    DataTablesModule,
    NgxSmartModalModule.forChild()
  ],
  entryComponents: [
    NetworksProfileFormComponent
  ],
  exports: [
    NetworksProfileFormComponent,
    NetworksOrganizationFormComponent
  ]
})
export class NetworksModule { }
