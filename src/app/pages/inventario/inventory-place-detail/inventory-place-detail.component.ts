import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { UserService } from './../../../services/user.service';
import { InventoryPlaceModel, InventoryPlaceProductModel, InventoryProductModel } from './../../../models/InventoryModel';
import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';
import { InventoryService } from 'src/app/inventory.service';
import { environment } from 'src/environments/environment';
import { AddProductsToInventoryPlaceFormComponent } from '../add-products-to-inventory-place-form/add-products-to-inventory-place-form.component';
@Component({
  selector: 'app-inventory-place-detail',
  templateUrl: './inventory-place-detail.component.html',
  styleUrls: ['./inventory-place-detail.component.scss']
})
export class InventoryPlaceDetailComponent implements OnInit {

  currentUser: User;
  inventory_id: number;
  inventory_place: InventoryPlaceModel = new InventoryPlaceModel();
  show_detail = false;
  show_detail_loading = false;
  printing = false;

  product_on_detail: InventoryPlaceProductModel;

  public formInventory: FormGroup = this.formBuilder.group({
    idInventoryPlace: [''],
    idIglesia: [''],
    name: ['', Validators.required],
    fotoUrl: [''],
    description: [''],
    products: this.formBuilder.array([])
  });

  constructor(
    private userService: UserService,
    private inventoryService: InventoryService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private modal: NgxSmartModalService
  ) {
    this.inventory_id = this.route.snapshot.params.idInventoryPlace;
    this.currentUser = this.userService.getCurrentUser();
  }

  ngOnInit() {
    this.getInventory();
  }

  getInventory() {
    this.inventoryService.getInventoryDetail(this.inventory_id)
      .subscribe((data: any) => {
        this.formInventory.patchValue(data);
        this.inventory_place = data;
        this.inventory_place.products.forEach(product => {
          const control = this.formInventory.get('products') as FormArray;
          control.push(this.formBuilder.group({
            is_leader: new FormControl(product.quantity, [
              Validators.required,
            ])
          }));
        });



        this.show_detail = true;
        // this.restartTable();
      }, error => {
        console.error(error);
        if (error.status === 404) {
          this.inventoryService.api.showToast(`This group was deleted.`, ToastType.error);
        } else {
          this.inventoryService.api.showToast(`Something happened while trying to get the group details.`, ToastType.error);
        }
      }, () => {
        // this.dtTrigger.next();
      });
  }

  getPermissions() {
    if (this.currentUser.isSuperUser) {
      return false;
    }
    if (this.currentUser.idUserType === 1) {
      return false;
    }
    return true;
  }

  resetForm(formInventory: FormGroup, key: string) {
    formInventory.get(key).setValue(this.inventory_place[key]);
    formInventory.get(key).markAsPristine();
  }


  updateValue(formInventory: FormGroup, key: string) {
    this.show_detail = false;
    const group = Object.assign({}, this.inventory_place);
    group[key] = formInventory.get(key).value;
    group.created_by = this.currentUser.idUsuario;
    this.inventoryService.updateInventory(group)
      .subscribe(response => {
        this.inventory_place[key] = formInventory.get(key).value;
        formInventory.get(key).markAsPristine();
        // Object.keys(formInventory.controls).forEach(element => {
        //   formInventory.controls[element].markAsPristine();
        // });
        // this.getInventory();
        this.show_detail = true;
      }, error => {
        console.error(error);
        this.show_detail = true;
        this.inventoryService.api.showToast(`Error updating the ${key} of the inventory.`, ToastType.error);
      });
  }

  get products_on_form() {
    return this.formInventory.get('products') as FormArray;
  }

  fixUrl(product: InventoryPlaceProductModel) {
    if (product.file_info) {
      if (product.file_info.src_path) {
        return `${environment.serverURL}${product.file_info.src_path}`;
      }
      return `/assets/img/no-product-available.png`
    } else {
      return `/assets/img/no-product-available.png`
    }
  }

  deleteProduct(product: InventoryPlaceProductModel) {
    if (confirm(`Are you sure yo want to delete this product?`)) {
      product.idInventoryPlace = this.inventory_id;
      this.inventoryService.deleteProductFromInventory(product)
        .subscribe(response => {
          this.getInventory();
          this.inventoryService.api.showToast(`Product deleted.`, ToastType.info);
        }, error => {
          console.error(error);
          this.inventoryService.api.showToast(`Error deleting product.`, ToastType.error);
        });
    }

  }

  get selected_products() {
    if (this.inventory_place) {
      return this.inventory_place.products.filter(x => x.print_qr)
    } return [];
  }

  async printProducts() {
    this.printing = true;
    const ids = this.selected_products.map(x => x.idInventoryPlaceProduct);

    const payload = {
      ids
    }
    const response: any = await this.inventoryService.downloadQRs(payload).toPromise()
      .catch(error => {
        console.error(error);
        this.printing = false;
        this.inventoryService.api.showToast(`Something went wrong while trying to get the QRs`, ToastType.error);
        return;
      });
    if (response) {
      const contentType: string = response.headers.get("Content-Type");
      let fileBlob = new Blob([response.body], { type: contentType });

      const fileData = window.URL.createObjectURL(fileBlob);

      // Generate virtual link
      let link = document.createElement("a");
      link.href = fileData;
      link.download = `place_${this.inventory_id}_qrs_sticker.pdf`;
      link.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window
        })
      );
      setTimeout(() => {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(fileData);
        link.remove();
        this.printing = false;
      }, 100);
    }
  }

  showQR(product: InventoryPlaceProductModel) {
    // this.qr_code = `${qr_code}`;
    this.modal.get('qr_product_detail_modal').open();
    this.product_on_detail = product;
  }

  refreshItems(event: {
    product: InventoryPlaceProductModel;
    key?: string;
    refresh_all: boolean;
  }) {
    if (event.refresh_all) {
      this.getInventory();
    } else {
      const product = this.inventory_place.products.find(x => x.idInventoryPlaceProduct === event.product.idInventoryPlaceProduct);
      if (product) {
        if (event.key) {
          product[event.key] = event.product[event.key];
        }
      }
    }
  }

  openModalAddProducts(
    add_products_to_inventory_modal: NgxSmartModalComponent,
    add_products_to_inventory_place_form: AddProductsToInventoryPlaceFormComponent
  ) {
    add_products_to_inventory_place_form.inventory_place = Object.assign({}, this.inventory_place);
    add_products_to_inventory_place_form.ngOnInit();
    add_products_to_inventory_place_form.getProducts()
      .then(data => {
        add_products_to_inventory_modal.open();
      });
  }

  onModalQuantityDidDismiss(modify_quantity_modal: NgxSmartModalComponent, event: boolean) {
    modify_quantity_modal.close();
    if (event) {
      this.show_detail = true;
      this.getInventory();
    }
  }

}
