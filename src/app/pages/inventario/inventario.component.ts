import { InventoryProductCategoryFormComponent } from './inventory-product-category-form/inventory-product-category-form.component';
import { InventoryPlaceModel } from './../../models/InventoryModel';
import { ToastType } from './../../login/ToastTypes';
import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { InventoryService } from 'src/app/inventory.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';
import { InventoryPlaceFormComponent } from './inventory-place-form/inventory-place-form.component';
import { InventoryProductFormComponent } from './inventory-product-form/inventory-product-form.component';
import { InventoryProductStatusFormComponent } from './inventory-product-status-form/inventory-product-status-form.component';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.scss']
})
export class InventarioComponent implements OnInit {

  currentUser: User;
  inventory_places: InventoryPlaceModel[] = [];
  hide_products: boolean = true;
  hide_status: boolean = true;
  hide_categories: boolean = true;

  constructor(
    public modal: NgxSmartModalService,
    private inventoryService: InventoryService,
    private userService: UserService
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  ngOnInit() {
    this.inventoryService.getInventoryPlaces()
      .subscribe((response: any) => {
        this.inventory_places = response;
      }, error => {
        console.error(error);
        this.inventory_places = [];
        this.inventoryService.api.showToast(`Error getting places...`, ToastType.error);
      });
  }

  deleteInventoryPlace(inventario: InventoryPlaceModel) {
    if (confirm(`Are you sure you want to delete this place/inventory?`)) {
      this.inventoryService.deleteInventoryPlace(inventario.idInventoryPlace)
        .subscribe(response => {
          this.ngOnInit();
          this.inventoryService.api.showToast(`Inventory deleted successfully`, ToastType.success);
        }, error => {
          console.error(error);
          this.inventoryService.api.showToast(`Error deleting inventory...`, ToastType.error);
        });
    }
  }

  addInventory(
    add_inventory_place_modal: NgxSmartModalComponent,
    add_inventory_place_form: InventoryPlaceFormComponent) {
    add_inventory_place_form.ngOnInit();
    add_inventory_place_form.getProducts()
      .then(data => {
        add_inventory_place_modal.open();
      });
  }

  onModalDidDismiss(
    add_inventory_place_modal: NgxSmartModalComponent,
    add_inventory_place_form: InventoryPlaceFormComponent,
    event: any) {
    add_inventory_place_modal.close();
    add_inventory_place_form.ngOnInit();
    if (event === true) {
      this.ngOnInit();
    }
  }

  showProducts(inventory_product_form: InventoryProductFormComponent) {
    inventory_product_form.getProducts()
      .then(response => {
        this.hide_products = false;
      });
  }

  showStatuses(inventory_status_form: InventoryProductStatusFormComponent) {
    inventory_status_form.getStatuses()
      .then(response => {
        this.hide_status = false;
      });
  }

  showCategories(inventory_category_form: InventoryProductCategoryFormComponent) {
    inventory_category_form.getCategories()
      .then(response => {
        this.hide_categories = false;
      });
  }

}
