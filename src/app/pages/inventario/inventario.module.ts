import { NgxQRCodeModule } from 'ngx-qrcode2';
import { InventoryProductCategoryFormComponent } from './inventory-product-category-form/inventory-product-category-form.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventarioRoutingModule } from './inventario-routing.module';
import { InventarioComponent } from './inventario.component';
import { DataTablesModule } from 'angular-datatables';
import { PropertyBoxModule } from 'src/app/component/property-box/property-box.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AddForminventarioComponent } from './add-forminventario/add-forminventario.component';
import { MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule } from '@angular/material';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { PapaParseModule } from 'ngx-papaparse';
import { EditForminventarioComponent } from './edit-forminventario/edit-forminventario.component';
import { QRCodeModule } from 'angularx-qrcode';
import { InventoryPlaceDetailComponent } from './inventory-place-detail/inventory-place-detail.component';
import { InventoryPlaceFormComponent } from './inventory-place-form/inventory-place-form.component';
import { InventoryProductFormComponent } from './inventory-product-form/inventory-product-form.component';
import { AddProductsToInventoryPlaceFormComponent } from './add-products-to-inventory-place-form/add-products-to-inventory-place-form.component';
import { InventoryProductStatusFormComponent } from './inventory-product-status-form/inventory-product-status-form.component';
import { InventoryProductDetailComponent } from './inventory-product-detail/inventory-product-detail.component';
import { OptionalFieldsComponent } from './optional-fields/optional-fields.component';
import { OptionalFieldsFormComponent } from './optional-fields/optional-fields-form/optional-fields-form.component';
import { InventoryHomeComponent } from './inventory-home/inventory-home.component';


@NgModule({
  declarations: [
    InventarioComponent,
    AddForminventarioComponent,
    EditForminventarioComponent,
    InventoryPlaceDetailComponent,
    InventoryPlaceFormComponent,
    InventoryProductFormComponent,
    AddProductsToInventoryPlaceFormComponent,
    InventoryProductStatusFormComponent,
    InventoryProductCategoryFormComponent,
    InventoryProductDetailComponent,
    OptionalFieldsComponent,
    OptionalFieldsFormComponent,
    InventoryHomeComponent
  ],
  imports: [
    CommonModule,
    DataTablesModule,
    QRCodeModule,
    InventarioRoutingModule,
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
    NgxSmartModalModule.forChild(),
    NgxQRCodeModule
  ]
})
export class InventarioModule { }
