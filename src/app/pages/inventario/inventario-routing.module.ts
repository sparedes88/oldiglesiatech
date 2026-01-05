import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InventarioComponent } from './inventario.component';
import { InventoryHomeComponent } from './inventory-home/inventory-home.component';
import { InventoryPlaceDetailComponent } from './inventory-place-detail/inventory-place-detail.component';
import { InventoryProductCategoryFormComponent } from './inventory-product-category-form/inventory-product-category-form.component';
import { InventoryProductFormComponent } from './inventory-product-form/inventory-product-form.component';
import { InventoryProductStatusFormComponent } from './inventory-product-status-form/inventory-product-status-form.component';
import { OptionalFieldsComponent } from './optional-fields/optional-fields.component';


const routes: Routes = [
  {
    path: 'detail/:idInventoryPlace',
    redirectTo: 'place/:idInventoryPlace'
  },
  {
    path: '',
    // redirectTo: 'home',
    component: InventoryHomeComponent
  },
  {
    path: 'home',
    component: InventoryHomeComponent
  },
  {
    path: 'products/categories',
    component: InventoryProductCategoryFormComponent
  },
  {
    path: 'products/statuses',
    component: InventoryProductStatusFormComponent
  },
  {
    path: 'optional-fields',
    component: OptionalFieldsComponent
  },
  {
    path: 'products',
    component: InventoryProductFormComponent
  },
  {
    path: 'place/:idInventoryPlace',
    component: InventoryPlaceDetailComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventarioRoutingModule { }
