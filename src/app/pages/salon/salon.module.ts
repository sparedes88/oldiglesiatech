import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalonRoutingModule } from './salon-routing.module';
import { SalonComponent } from './salon.component';
import { DataTablesModule } from 'angular-datatables';
import { PropertyBoxModule } from 'src/app/component/property-box/property-box.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AddFormsalonComponent } from './add-formsalon/add-formsalon.component';
import { MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule } from '@angular/material';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { PapaParseModule } from 'ngx-papaparse';
import { EditFormsalonComponent } from './edit-formsalon/edit-formsalon.component';

@NgModule({
  declarations: [
    SalonComponent,
    AddFormsalonComponent,
    EditFormsalonComponent
  ],
  imports: [
    CommonModule,
    SalonRoutingModule,
    DataTablesModule,
    PropertyBoxModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MaterialFileInputModule,
    MatIconModule,
    MatButtonModule,
    PapaParseModule,
    FormsModule,
    MatIconModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgxSmartModalModule.forChild()
  ]
})
export class SalonModule { }
