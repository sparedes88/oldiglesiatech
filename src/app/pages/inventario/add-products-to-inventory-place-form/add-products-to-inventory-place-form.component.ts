import { InventoryPlaceModel } from './../../../models/InventoryModel';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { InventoryProductModel } from 'src/app/models/InventoryModel';
import { InventoryService } from 'src/app/inventory.service';
import { UserService } from 'src/app/services/user.service';
import { ToastType } from 'src/app/login/ToastTypes';

@Component({
  selector: 'app-add-products-to-inventory-place-form',
  templateUrl: './add-products-to-inventory-place-form.component.html',
  styleUrls: ['./add-products-to-inventory-place-form.component.scss']
})
export class AddProductsToInventoryPlaceFormComponent implements OnInit {

  // tslint:disable-next-line: no-output-rename no-output-on-prefix
  @Output('onDismiss') onDismiss = new EventEmitter();

  select_products_options: any = {
    singleSelection: true,
    idField: 'idInventoryProduct',
    textField: 'name',
    allowSearchFilter: true
  };

  currentUser: User;
  products: InventoryProductModel[] = [];
  inventory_place: InventoryPlaceModel;

  public inventory_place_form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private inventoryService: InventoryService,
    private userService: UserService
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  ngOnInit() {
    this.inventory_place_form = this.formBuilder.group({
      idOrganization: [this.currentUser.idIglesia, Validators.required],
      idInventoryPlace: [this.inventory_place ? this.inventory_place.idInventoryPlace : undefined, Validators.required],
      created_by: [this.currentUser.idUsuario, Validators.required],
      products: this.formBuilder.array([])
    });
  }

  getProducts() {

    return new Promise((resolve, reject) => {
      this.inventoryService.getProducts()
        .subscribe((response: any) => {
          this.products = response;
          return resolve(this.products);
        }, error => {
          console.error(error);
          this.products = [];
          return resolve(this.products);
        });
    });
  }

  addProduct() {
    const control = this.inventory_place_form.controls.products as FormArray;
    control.push(this.formBuilder.group({
      idInventoryProduct: new FormControl('', [Validators.required]),
      name: new FormControl('', [Validators.required]),
      price_bought_at: new FormControl(0, [Validators.required, Validators.min(1)]),
      vendor: new FormControl(''),
      idInventoryProductStatus: new FormControl(null),
      idInventoryProductCategory: new FormControl(null),
      assigned_to: [],
      created_by: [this.currentUser.idUsuario, Validators.required],
      available_products: [this.get_available_products()]
    }));
    console.log(control);
  }

  get_available_products() {
    // const control = this.inventory_place_form.controls.products as FormArray;
    // const idProducts = [];
    // control.controls.forEach(control_in_array => {
    //   idProducts.push(control_in_array.get('idInventoryProduct').value);
    // });
    return this.products;
  }

  get products_array() {
    return (this.inventory_place_form.get('products') as FormArray).controls;
  }

  fixProductFilter(item: FormGroup, event: any) {
    console.log(item);
    console.log(event);
    item.patchValue({ name: event.name, idInventoryProduct: event.idInventoryProduct });
    const product = this.products.find(x => x.idInventoryProduct === event.idInventoryProduct);
    if (product) {
      if (product.idInventoryProductCategory) {
        item.get('idInventoryProductCategory').setValue(product.idInventoryProductCategory);
      }
      if (product.idInventoryProductStatus) {
        item.get('idInventoryProductStatus').setValue(product.idInventoryProductStatus);
      }
    }
    this.resetAllControls();
  }

  resetProductAvailable(item: FormGroup) {
    console.log(item);

    item.patchValue(
      {
        name: undefined,
        idInventoryProduct: undefined,
      });
    item.get('name').markAsPristine();
    const available_products = this.get_available_products();
    item.patchValue(
      {
        available_products
      });
  }

  removeProduct(index: number) {
    const array = this.inventory_place_form.controls.products as FormArray;
    // const index = array.value.findIndex(image => image.idInventoryProduct === idInventoryProduct);
    // console.log(index);
    array.removeAt(index);
    this.resetAllControls();
  }

  resetAllControls() {
    const array_1 = this.inventory_place_form.controls.products as FormArray;
    array_1.controls.forEach(control => {
      console.log(control);
      const available_products = this.get_available_products();
      control.patchValue(
        {
          available_products
        });
    });
  }

  submitInventory(inventory_place_form: FormGroup) {
    console.log(inventory_place_form);
    if (inventory_place_form.valid) {
      const payload = inventory_place_form.value;
      let subscription: Observable<any>;
      let success_message: string;
      let error_message: string;
      if (payload.idInventoryPlace) {
        // update
        subscription = this.inventoryService.addProductsToInventory(payload);
        success_message = `Inventory updated successfully.`;
        error_message = `Error updating inventory`;
      } else {
        // add
        subscription = this.inventoryService.addInventory(payload);
        success_message = `Inventory added successfully.`;
        error_message = `Error adding inventory`;
      }
      subscription
        .subscribe(response => {
          this.inventoryService.api.showToast(`${success_message}`, ToastType.success);
          this.dismiss(true);
        }, error => {
          console.error(error);
          this.inventoryService.api.showToast(`${error_message}`, ToastType.error);
        });
    }
  }

  dismiss(response?: boolean) {
    this.onDismiss.emit(response);
  }



}
