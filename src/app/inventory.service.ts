import { InventoryPlaceProductModel, InventoryProductCategoryModel, OptionalFieldModel } from './models/InventoryModel';
import { InventoryProductModel, InventoryProductStatusModel } from 'src/app/models/InventoryModel';
import { Injectable } from '@angular/core';
import { ApiService } from './services/api.service';
import { UserService } from './services/user.service';
import { User } from './interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(public api: ApiService, private userService: UserService) { }

  getInventoryPlaces() {
    const user = this.userService.getCurrentUser();
    const resp = this.api.get(`inventories/places`,
      // Params
      { idIglesia: user.idIglesia }
      // reqOptions
    );
    return resp;
  }

  getInventoryDetail(idInventoryPlace: number) {
    const user = this.userService.getCurrentUser();
    const resp = this.api.get(`inventories/places/${idInventoryPlace}`,
      // Params
      { idOrganization: user.idIglesia }
      // reqOptions
    );
    return resp;
  }

  addInventory(payload: any) {
    const resp = this.api.post(`inventories/places/`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  updateInventory(payload: any) {
    const resp = this.api.patch(`inventories/places/${payload.idInventoryPlace}`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  addProductsToInventory(payload: any) {
    const resp = this.api.post(`inventories/places/${payload.idInventoryPlace}/products`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  deleteInventoryPlace(idInventoryPlace: number) {
    const user: User = this.userService.getCurrentUser();
    const resp = this.api.delete(`inventories/places/${idInventoryPlace}`,
      // Params
      {
        deleted_by: user.idUsuario
      }
      // reqOptions
    );
    return resp;
  }

  getProducts() {
    const user = this.userService.getCurrentUser();
    const resp = this.api.get(`inventories/products`,
      // Params
      { idIglesia: user.idIglesia }
      // reqOptions
    );
    return resp;
  }

  addProduct(payload: any) {
    const resp = this.api.post(`inventories/products`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  updateProduct(payload: any) {
    const resp = this.api.patch(`inventories/products/${payload.idInventoryProduct}`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  deleteProduct(payload: InventoryProductModel) {
    const user: User = this.userService.getCurrentUser();
    const resp = this.api.delete(`inventories/products/${payload.idInventoryProduct}`,
      // Params
      {
        deleted_by: user.idUsuario
      }
      // reqOptions
    );
    return resp;
  }

  /********************************************* STATUS *********************************************/
  getProductStatus() {
    const user = this.userService.getCurrentUser();
    const resp = this.api.get(`inventories/statuses`,
      // Params
      { idOrganization: user.idIglesia }
      // reqOptions
    );
    return resp;
  }

  addStatus(payload: InventoryProductStatusModel) {
    const resp = this.api.post(`inventories/statuses`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  updateStatus(payload: InventoryProductStatusModel) {
    const resp = this.api.patch(`inventories/statuses/${payload.idInventoryProductStatus}`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  deleteStatus(status: InventoryProductStatusModel) {
    const user = this.userService.getCurrentUser();
    const resp = this.api.delete(`inventories/statuses/${status.idInventoryProductStatus}`,
      // Params
      {
        deleted_by: user.idUsuario
      }
      // reqOptions
    );
    return resp;
  }

  /********************************************* END STATUS *********************************************/

  /********************************************* CATEGORY *********************************************/
  getProductCategories() {
    const user = this.userService.getCurrentUser();
    const resp = this.api.get(`inventories/categories`,
      // Params
      { idOrganization: user.idIglesia }
      // reqOptions
    );
    return resp;
  }

  addCategory(payload: InventoryProductCategoryModel) {
    const resp = this.api.post(`inventories/categories`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  updateCategory(payload: InventoryProductCategoryModel) {
    const resp = this.api.patch(`inventories/categories/${payload.idInventoryProductCategory}`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  deleteCategory(category: InventoryProductCategoryModel) {
    const user = this.userService.getCurrentUser();
    const resp = this.api.delete(`inventories/categories/${category.idInventoryProductCategory}`,
      // Params
      {
        deleted_by: user.idUsuario
      }
      // reqOptions
    );
    return resp;
  }
  /********************************************* END CATEGORY *********************************************/

  deleteProductFromInventory(product: InventoryPlaceProductModel) {
    const user: User = this.userService.getCurrentUser();
    const resp = this.api.delete(`inventories/places/${product.idInventoryPlace}/products/${product.idInventoryPlaceProduct}`,
      // Params
      {
        deleted_by: user.idUsuario
      }
      // reqOptions
    );
    return resp;
  }

  getProductDetail(product: InventoryPlaceProductModel) {
    const resp = this.api.get(`inventories/places/${product.idInventoryPlace}/products/${product.idInventoryPlaceProduct}`,
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

  updateProductPlace(payload: InventoryPlaceProductModel) {
    const resp = this.api.patch(`inventories/places/${payload.idInventoryPlace}/products/${payload.idInventoryPlaceProduct}`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  saveProductOptionalField(product: InventoryPlaceProductModel, payload: OptionalFieldModel) {
    const resp = this.api.post(`inventories/places/${product.idInventoryPlace}/products/${product.idInventoryPlaceProduct}/optional_fields`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }
  updateProductOptionalField(product: InventoryPlaceProductModel, payload: OptionalFieldModel) {
    const resp = this.api.patch(`inventories/places/${product.idInventoryPlace}/products/${product.idInventoryPlaceProduct}/optional_fields/${payload.id}`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  getOptionalFields() {
    const user = this.userService.getCurrentUser();
    const resp = this.api.get(`inventories/optional_fields`,
      // Params
      { idOrganization: user.idIglesia }
      // reqOptions
    );
    return resp;
  }
  saveOptionalFields() {
    const user = this.userService.getCurrentUser();
    const resp = this.api.get(`inventories/optional_fields`,
      // Params
      { idOrganization: user.idIglesia }
      // reqOptions
    );
    return resp;
  }

  addOptionalField(payload: OptionalFieldModel) {
    const resp = this.api.post(`inventories/optional_fields`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  updateOptionalField(payload: OptionalFieldModel) {
    const resp = this.api.patch(`inventories/optional_fields/${payload.id}`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  deleteOptionalField(category: OptionalFieldModel) {
    const user = this.userService.getCurrentUser();
    const resp = this.api.delete(`inventories/optional_fields/${category.id}`,
      // Params
      {
        deleted_by: user.idUsuario
      }
      // reqOptions
    );
    return resp;
  }

  downloadQRs(payload: { ids: number[]; }) {
    const resp = this.api.post(`inventories/print_qrs`,
      // Params
      payload,
      { observe: "response", responseType: "ArrayBuffer" }
      // reqOptions
    );
    return resp;
  }

  print(payload: Partial<import("./pages/inventario/inventory-home/inventory-home.component").FilterInventoryModel>) {
    const resp = this.api.post(`inventories/print_pdf`,
      // Params
      payload,
      { observe: "response", responseType: "ArrayBuffer" }
      // reqOptions
    );
    return resp;
  }

  search(payload: Partial<import("./pages/inventario/inventory-home/inventory-home.component").FilterInventoryModel>) {
    const resp = this.api.post(`inventories/search`,
      // Params
      payload
      // reqOptions
    );
    return resp;
  }
}
