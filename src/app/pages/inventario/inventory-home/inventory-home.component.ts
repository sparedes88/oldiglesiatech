import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryProductModel, InventoryProductCategoryModel, OptionalFieldModel, InventoryPlaceModel, InventoryPlaceProductModel } from 'src/app/models/InventoryModel';
import { InventoryService } from 'src/app/inventory.service';
import { environment } from 'src/environments/environment.prod';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { ToastType } from 'src/app/login/ToastTypes';
import { AddProductsToInventoryPlaceFormComponent } from '../add-products-to-inventory-place-form/add-products-to-inventory-place-form.component';
import { InventoryPlaceFormComponent } from '../inventory-place-form/inventory-place-form.component';
import * as moment from 'moment';
export interface FilterInventoryModel {
  product_type: InventoryProductModel[];
  category: InventoryProductCategoryModel[];
  place: InventoryPlaceModel[];
  optional_fields: OptionalFieldModel[];

  products: number[];
  categories: number[];
  places: number[];
  fields: number[];

  last_search_has_filters: boolean;
  idOrganization: number;
}

@Component({
  selector: 'app-inventory-home',
  templateUrl: './inventory-home.component.html',
  styleUrls: ['./inventory-home.component.scss']
})
export class InventoryHomeComponent implements OnInit {

  filter_form: FormGroup = this.form_builder.group({
    product_type: new FormControl([], []),
    category: new FormControl([], []),
    place: new FormControl([], []),
    optional_fields: new FormControl([], []),
    last_search_has_filters: new FormControl(false)
  });

  select_options: {
    [key: string]: IDropdownSettings
  } = {
      product_type: {
        singleSelection: true,
        idField: 'idInventoryProduct',
        textField: 'name',
        allowSearchFilter: true
      },
      category: {
        singleSelection: true,
        idField: 'idInventoryProductCategory',
        textField: 'name',
        allowSearchFilter: true
      },
      place: {
        singleSelection: true,
        idField: 'idInventoryPlace',
        textField: 'name',
        allowSearchFilter: true
      },
      optional_fields: {
        singleSelection: false,
        idField: 'id',
        textField: 'name',
        allowSearchFilter: true,
        itemsShowLimit: 2
      },
    }

  dropdowns: {
    products: InventoryProductModel[],
    categories: InventoryProductCategoryModel[],
    places: InventoryPlaceModel[],
    optional_fields: OptionalFieldModel[]
  } = {
      products: [],
      categories: [],
      places: [],
      optional_fields: []
    };

  places: InventoryPlaceModel[] = [];
  product_on_detail: InventoryPlaceProductModel;
  currentUser: User;
  loading: boolean = false;
  printing: boolean = false;

  constructor(
    private form_builder: FormBuilder,
    private inventory_service: InventoryService,
    private user_service: UserService,
    private modal: NgxSmartModalService
  ) {
    this.currentUser = this.user_service.getCurrentUser();
  }

  get has_filters(): boolean {
    const search_filters: FilterInventoryModel = this.filter_form.value;
    return search_filters.last_search_has_filters;
  }

  ngOnInit() {
    this.getDropdowns();
  }

  async getDropdowns() {
    const promises = [];
    promises.push(this.inventory_service.getProducts().toPromise());
    promises.push(this.inventory_service.getProductCategories().toPromise());
    promises.push(this.getPlaces());
    promises.push(this.inventory_service.getOptionalFields().toPromise());
    const responses = await Promise.all(promises)
      .catch(error => {
        console.error(error);
        return;
      });
    if (responses) {
      this.dropdowns.products = responses[0];
      this.dropdowns.categories = responses[1];
      this.dropdowns.places = responses[2];
      this.dropdowns.optional_fields = responses[3];
    }
  }
  async getPlaces() {
    return this.inventory_service.getInventoryPlaces().toPromise()
  }

  async search() {
    this.loading = true;
    const payload: Partial<FilterInventoryModel> = this.getFilterInfo();

    const response: any = await this.inventory_service.search(payload).toPromise()
      .catch(error => {
        console.error(error);
        return [];
      });
    console.log(response);
    this.filter_form.get('last_search_has_filters').setValue(payload.last_search_has_filters);
    this.loading = false;
    this.places = response;
  }

  getFilterInfo(): Partial<FilterInventoryModel> {
    let last_search_has_filters = false;
    const search_filters: FilterInventoryModel = this.filter_form.value;
    console.log(search_filters);
    const payload: Partial<FilterInventoryModel> = {};
    if (search_filters.product_type.length > 0) {
      last_search_has_filters = true;
      payload.products = search_filters.product_type.map(x => x.idInventoryProduct);
    }
    if (search_filters.category.length > 0) {
      last_search_has_filters = true;
      payload.categories = search_filters.category.map(x => x.idInventoryProductCategory);
    }
    if (search_filters.place.length > 0) {
      last_search_has_filters = true;
      payload.places = search_filters.place.map(x => x.idInventoryPlace);
    }
    payload.fields = search_filters.optional_fields.map(x => x.id);
    payload.idOrganization = this.currentUser.idIglesia;
    console.log(payload);
    payload.last_search_has_filters = last_search_has_filters;
    return payload;
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

  showQR(product: InventoryPlaceProductModel) {
    // this.qr_code = `${qr_code}`;
    this.modal.get('qr_product_detail_modal').open();
    console.log(product);
    this.product_on_detail = product;
  }

  refreshItems(event: {
    product: InventoryPlaceProductModel;
    key?: string;
    refresh_all: boolean;
  }) {
    if (event.refresh_all) {
      this.search();
    } else {
      const place = this.places.find(x => x.idInventoryPlace === x.idInventoryPlace);
      if (place) {
        const product = place.products.find(x => x.idInventoryPlaceProduct === event.product.idInventoryPlaceProduct);
        if (product) {
          if (event.key) {
            product[event.key] = event.product[event.key];
          }
        }
      }
    }
  }

  deleteProduct(product: InventoryPlaceProductModel) {
    if (confirm(`Are you sure yo want to delete this product?`)) {
      this.inventory_service.deleteProductFromInventory(product)
        .subscribe(response => {
          this.search();
          this.inventory_service.api.showToast(`Product deleted.`, ToastType.info);
        }, error => {
          console.error(error);
          this.inventory_service.api.showToast(`Error deleting product.`, ToastType.error);
        });
    }
  }

  openModalAddProducts(
    inventory_place: InventoryPlaceModel,
    add_products_to_inventory_modal: NgxSmartModalComponent,
    add_products_to_inventory_place_form: AddProductsToInventoryPlaceFormComponent
  ) {
    add_products_to_inventory_place_form.inventory_place = Object.assign({}, inventory_place);
    add_products_to_inventory_place_form.ngOnInit();
    add_products_to_inventory_place_form.getProducts()
      .then(data => {
        add_products_to_inventory_modal.open();
      });
  }

  onModalQuantityDidDismiss(modify_quantity_modal: NgxSmartModalComponent, event: boolean) {
    modify_quantity_modal.close();
    if (event) {
      // this.show_detail = true;
      this.search();
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

  deleteInventoryPlace(inventario: InventoryPlaceModel) {
    if (confirm(`Are you sure you want to delete this place/inventory?`)) {
      this.inventory_service.deleteInventoryPlace(inventario.idInventoryPlace)
        .subscribe(response => {
          this.getDropdowns();
          this.search();
          this.inventory_service.api.showToast(`Inventory deleted successfully`, ToastType.success);
        }, error => {
          console.error(error);
          this.inventory_service.api.showToast(`Error deleting inventory...`, ToastType.error);
        });
    }
  }

  async onModalDidDismiss(
    add_inventory_place_modal: NgxSmartModalComponent,
    add_inventory_place_form: InventoryPlaceFormComponent,
    event: any) {
    add_inventory_place_modal.close();
    add_inventory_place_form.ngOnInit();
    if (event === true) {
      this.dropdowns.places = await this.getPlaces() as any;
      if (this.filter_form.value.place.length === 0) {
        this.search();
      }
    }
  }

  async printProducts(inventory_place: InventoryPlaceModel) {
    this.printing = true;
    const ids = inventory_place.products.map(x => x.idInventoryPlaceProduct);

    const payload = {
      ids
    }
    const response: any = await this.inventory_service.downloadQRs(payload).toPromise()
      .catch(error => {
        console.error(error);
        this.printing = false;
        this.inventory_service.api.showToast(`Something went wrong while trying to get the QRs`, ToastType.error);
        return;
      });
    if (response) {
      const contentType: string = response.headers.get("Content-Type");
      let fileBlob = new Blob([response.body], { type: contentType });

      const fileData = window.URL.createObjectURL(fileBlob);

      // Generate virtual link
      let link = document.createElement("a");
      link.href = fileData;
      link.download = `place_${inventory_place.idInventoryPlace}_qrs_sticker.pdf`;
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

  async print() {
    this.printing = true;
    const payload = this.getFilterInfo();
    const response: any = await this.inventory_service.print(payload).toPromise()
      .catch(error => {
        console.error(error);
        this.printing = false;
        this.inventory_service.api.showToast(`Something went wrong while trying to get the QRs`, ToastType.error);
        return;
      });
    if (response) {
      const contentType: string = response.headers.get("Content-Type");
      let fileBlob = new Blob([response.body], { type: contentType });

      const fileData = window.URL.createObjectURL(fileBlob);

      // Generate virtual link
      let link = document.createElement("a");
      link.href = fileData;
      link.download = `inventory_${moment.tz().format('YYYY-MM-DD_HH:mm:ss')}.pdf`;
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

  editMainValues(inventory_place: InventoryPlaceModel) {
    inventory_place.form = this.form_builder.group({
      name: new FormControl(inventory_place.name, [Validators.required]),
      description: new FormControl(inventory_place.description, [])
    });
    inventory_place.editing = true;
  }

  cancelMainValue(inventory_place: InventoryPlaceModel) {
    inventory_place.editing = false;
    inventory_place.form = undefined;
  }

  async saveMainValue(inventory_place: InventoryPlaceModel) {
    const value = inventory_place.form.value;
    value.created_by = this.currentUser.idUsuario;
    value.idInventoryPlace = inventory_place.idInventoryPlace;
    const response: any = await this.inventory_service.updateInventory(value).toPromise()
      .catch(error => {
        console.error(error);
        this.inventory_service.api.showToast(`Error updating the inventory.`, ToastType.error);
        return;
      });
    if (response) {
      inventory_place.name = value.name;
      inventory_place.description = value.description;
      inventory_place.editing = false;
      this.dropdowns.places = await this.getPlaces() as any;
      if (this.filter_form.value.place.length === 0) {
        this.search();
      }
    }
  }

}
