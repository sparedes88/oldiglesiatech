import { DomSanitizer } from '@angular/platform-browser';
import { ToastType } from 'src/app/login/ToastTypes';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { InventoryService } from 'src/app/inventory.service';
import { InventoryPlaceProductModel, OptionalFieldModel } from 'src/app/models/InventoryModel';
import { FormControl, FormGroup, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { FileUploadService } from 'src/app/services/file-upload.service';

export interface RefreshPlaceProductEvent {
  product?: InventoryPlaceProductModel;
  key?: string;
  refresh_all: boolean;
}

@Component({
  selector: 'app-inventory-product-detail',
  templateUrl: './inventory-product-detail.component.html',
  styleUrls: ['./inventory-product-detail.component.scss']
})
export class InventoryProductDetailComponent implements OnInit {

  @Input('idInventoryPlace') idInventoryPlace: number;
  @Input('idInventoryPlaceProduct') idInventoryPlaceProduct: number;
  @Input('product') product: InventoryPlaceProductModel;

  @Output('on_close') on_close: EventEmitter<any> = new EventEmitter<any>();
  @Output('on_refresh') on_refresh: EventEmitter<RefreshPlaceProductEvent> = new EventEmitter<RefreshPlaceProductEvent>();

  @ViewChild('img_tag') img_tag: any;

  loading: boolean = true;

  categories: any[] = [];
  statuses: any[] = [];

  form_group: FormGroup = this.form_builder.group({
    name: new FormControl(undefined, [Validators.required]),
    vendor: new FormControl(undefined, []),
    price_bought_at: new FormControl(0, [Validators.required, Validators.min(0.01)]),
    idInventoryProductStatus: new FormControl(undefined, []),
    idInventoryProductCategory: new FormControl(undefined, []),
    file_info: new FormControl(undefined, []),
    img_file: new FormControl(),
    temp_src: new FormControl(undefined),
    optional_fields: new FormArray([])
  })

  editable_values = {
    name: false,
    vendor: false,
    price_bought_at: false,
    idInventoryProductStatus: false,
    idInventoryProductCategory: false,
  }

  current_user: User;

  selectStatusOptions: any = {
    singleSelection: true,
    idField: 'idInventoryProductStatus',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  };
  selectCategoryOptions: any = {
    singleSelection: true,
    idField: 'idInventoryProductCategory',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  };

  constructor(
    private inventory_service: InventoryService,
    private form_builder: FormBuilder,
    private user_service: UserService,
    private sanitizer: DomSanitizer,
    private fus: FileUploadService
  ) {
    this.current_user = this.user_service.getCurrentUser();
  }

  ngOnInit() {
    this.getProductDetail();
    this.getCategoriesAndStatuses();
  }

  async getCategoriesAndStatuses() {
    const promises = [];
    promises.push(this.inventory_service.getProductCategories().toPromise());
    promises.push(this.inventory_service.getProductStatus().toPromise());
    const responses = await Promise.all(promises);
    this.categories = responses[0];
    this.statuses = responses[1];
  }

  async getProductDetail() {
    this.loading = true;
    const product: Partial<InventoryPlaceProductModel> = {
      idInventoryPlaceProduct: this.idInventoryPlaceProduct,
      idInventoryPlace: this.idInventoryPlace
    };
    const response: any = await this.inventory_service.getProductDetail(product as InventoryPlaceProductModel)
      .toPromise()
      .catch(error => {
        console.error(error);
        this.inventory_service.api.showToast(`Error getting info`, ToastType.error);
        this.loading = false;
        this.close();
      });
    if (response) {
      this.form_group.patchValue(response.product);

      this.product = response;
      if (this.product.product.idResource) {
        this.form_group.get('file_info').setValue(this.product.product.file_info);
      }
      console.log(this.form_group);
      console.log(this.form_group.value);
      this.cleanOptionalFields();
      this.fillOptionalFields();


      this.loading = false;
    }
  }
  fillOptionalFields() {

    this.product.optional_fields.forEach(optional_field => {
      const group = this.form_builder.group({
        id: new FormControl(),
        name: new FormControl(),
        value: new FormControl(),
        idOptionalField: new FormControl(),
        is_editing: new FormControl(false)
      });
      group.patchValue(optional_field);
      this.optional_fields.push(group);
    })
  }

  get optional_fields() {
    return this.form_group.get('optional_fields') as FormArray;
  }
  cleanOptionalFields() {
    while (this.optional_fields.length > 0) {
      this.optional_fields.removeAt(0);
    }
  }


  close() {
    this.on_close.emit();
  }

  startEdit(optional: FormGroup) {
    optional.get('is_editing').setValue(true);
  }

  async save(optional: FormGroup, index: number) {
    if (optional.valid) {
      const payload: OptionalFieldModel = optional.value;
      const product: Partial<InventoryPlaceProductModel> = {
        idInventoryPlaceProduct: this.idInventoryPlaceProduct,
        idInventoryPlace: this.idInventoryPlace
      };
      let method: Observable<any>;

      if (payload.id) {
        method = this.inventory_service.updateProductOptionalField(product as InventoryPlaceProductModel, payload);

      } else {
        payload.created_by = this.current_user.idUsuario;
        method = this.inventory_service.saveProductOptionalField(product as InventoryPlaceProductModel, payload);
      }
      const response: any = await method.toPromise()
        .catch(error => {
          console.error(error);
          return;
        });
      console.log(response);
      if (response) {
        this.product.optional_fields[index].value = payload.value;
        if (!payload.id) {
          optional.get('id').setValue(response.id);
        }
        optional.get('is_editing').setValue(false);
        optional.markAsPristine();
        const event: RefreshPlaceProductEvent = {
          product: this.product.product,
          key: 'optional_fields',
          refresh_all: true
        }
        this.on_refresh.emit(event);
      }
    }
  }

  cancel(optional: FormGroup, index: number) {
    const optional_field = this.product.optional_fields[index];
    optional.patchValue(optional_field);
    optional.get('is_editing').setValue(false);
    optional.markAsPristine();
  }

  fixPicture() {
    if (this.form_group.get('temp_src').value) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(this.form_group.get('temp_src').value);
    } else if (this.form_group.get('file_info').value) {
      return `${environment.serverURL}${this.form_group.get('file_info').value.src_path}`;
    } else {
      return `/assets/img/no-product-available.png`
    }
  }

  uploadFile(event: { target: { files: File[] } }) {
    console.log(event);
    this.uploaded = false;
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      console.log(file);
      this.form_group.get('img_file').setValue(file)
      console.log(this.form_group);
      setTimeout(async () => {
        const src = URL.createObjectURL(file);
        console.log(src);

        this.img_tag.nativeElement.src = src;
        console.log(this.img_tag.nativeElement.src);
        this.form_group.get('temp_src').setValue(this.img_tag.nativeElement.src);

        // idResource
        const response: any = await this.fus.uploadWithProgress(file, false, this.uploadProgress(file), 'products')
          .catch(error => {
            console.error(error);
            return;
          });
        if (response) {
          const json_response = response.target.response;
          this.product.product.file_info = json_response.file_info;
          this.form_group.get('file_info').setValue(this.product.product.file_info);
          this.form_group.get('temp_src').setValue(undefined);
          this.form_group.get('img_file').setValue(undefined);
          this.product.idResource = this.product.product.file_info.id;
          this.product.product.idResource = this.product.product.file_info.id;
          this.product.product.idInventoryPlace = this.idInventoryPlace;
          this.product.product.idInventoryPlaceProduct = this.product.idInventoryPlaceProduct;
          await this.inventory_service.updateProductPlace(this.product.product).toPromise();
          const event: RefreshPlaceProductEvent = {
            product: this.product.product,
            key: 'file_info',
            refresh_all: false
          }
          this.on_refresh.emit(event);
        } else {
          this.uploaded = true;
          this.fus.api.showToast(`Error uploading the file.`, ToastType.error);
          return;
        }
      }, 600);

    }
  }

  uploaded: boolean = true;

  uploadProgress(file: File) {
    return (e) => {
      var file1Size = file.size;
      if (e.loaded <= file1Size) {
        var percent = Math.round(e.loaded / file1Size * 100);
        document.getElementById('progress-bar-file1').style.width = percent + '%';
        document.getElementById('progress-bar-file1').innerHTML = `${percent}%`;
        this.uploaded = false;

      }

      if (e.loaded == e.total) {
        document.getElementById('progress-bar-file1').style.width = '100%';
        document.getElementById('progress-bar-file1').innerHTML = `100%`;
        this.uploaded = true;
      }
    }
  }

  editMainValues(key: string) {
    this.editable_values[key] = true;
  }

  async saveMainValue(key) {
    const control = this.form_group.get(key);
    if (control.valid) {
      const value = control.value;
      const original_value = this.product.product[key];
      this.product.product[key] = value;
      this.product.product.idInventoryPlace = this.idInventoryPlace;
      this.product.product.idInventoryPlaceProduct = this.product.idInventoryPlaceProduct;
      const response: any = await this.inventory_service.updateProductPlace(this.product.product).toPromise()
        .catch(error => {
          console.error(error);
          this.product.product[key] = original_value;
          this.fus.api.showToast(`Error updating the product`, ToastType.error);
          return;
        });
      if (response) {
        this.editable_values[key] = false;
        this.form_group.get(key).markAsPristine();

        this.fus.api.showToast(`Info saved`, ToastType.success);
        let event: RefreshPlaceProductEvent = {
          refresh_all: false
        }
        if (key == 'idInventoryProductStatus' || key == 'idInventoryProductCategory') {
          if (key == 'idInventoryProductStatus') {
            const status = this.statuses.find(x => x.idInventoryProductStatus == value);
            this.product.product.status_name = status.name;
          }
          if (key == 'idInventoryProductCategory') {
            const category = this.categories.find(x => x.idInventoryProductCategory == value);
            this.product.product.category_name = category.name;
          }
        } else if (key === 'price_bought_at') {
          event.refresh_all = true;
        } else {
          //name, vendor
          if (key === 'name') {
            this.product.product.product_name = this.product.product[key];
            event.key = 'product_name';
          } else {
            event.key = key;
          }
          event.product = this.product.product;
        }
        this.on_refresh.emit(event);
      }
    }
  }

  cancelMainValue(key: string) {
    this.editable_values[key] = false;
    this.form_group.get(key).setValue(this.product.product[key]);
    this.form_group.get(key).markAsPristine();
  }


  fixIdField(key: string, event) {
    this.form_group.patchValue({ [key]: event[key] });
  }
}
