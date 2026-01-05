import { InventoryProductStatusModel, InventoryProductCategoryModel } from './../../../models/InventoryModel';
import { Observable } from 'rxjs';
import { FileUploadService } from './../../../services/file-upload.service';
import { RandomService } from './../../../services/random.service';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, NgForm } from '@angular/forms';
import { Component, OnInit, ViewChild, EventEmitter, Output, Input } from '@angular/core';
import { MultiSelectComponent } from 'ng-multiselect-dropdown';
import { UserService } from 'src/app/services/user.service';
import { InventoryService } from 'src/app/inventory.service';
import { User } from 'src/app/interfaces/user';
import { InventoryProductModel } from 'src/app/models/InventoryModel';
import { ToastType } from 'src/app/login/ToastTypes';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventory-product-form',
  templateUrl: './inventory-product-form.component.html',
  styleUrls: ['./inventory-product-form.component.scss']
})
export class InventoryProductFormComponent implements OnInit {

  @ViewChild('multi_select_category') multi_select_category: MultiSelectComponent;
  @ViewChild('multi_select_status') multi_select_status: MultiSelectComponent;
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onDismiss = new EventEmitter();

  @Input() show_dismiss: boolean = true;
  @Input() is_embed: boolean = false;

  product: InventoryProductModel;
  products: InventoryProductModel[] = [];
  qr_code: string;
  statuses: InventoryProductStatusModel[] = [];
  categories: InventoryProductCategoryModel[] = [];

  currentUser: User;
  show_editable: boolean = false;
  show_loading: boolean = false;

  reviewForm: FormGroup;

  reviewStatusForm: FormGroup = this.formBuilder.group({
    statuses: this.formBuilder.array([])
  });

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
    private userService: UserService,
    private inventoryService: InventoryService,
    private formBuilder: FormBuilder,
    private random: RandomService,
    private fus: FileUploadService,
    private router: Router
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  get optional_fields(): FormArray {
    if (this.reviewForm) {
      return this.reviewForm.get('optional_fields') as FormArray;
    }
    return new FormArray([]);
  }

  ngOnInit() {
    this.getProducts();
  }

  getProducts() {
    this.show_loading = true;
    return new Promise((resolve, reject) => {
      const promises = [];
      promises.push(this.inventoryService.getProducts().toPromise());
      promises.push(this.inventoryService.getProductCategories().toPromise());
      promises.push(this.inventoryService.getProductStatus().toPromise());
      Promise.all(promises)
        .then((response: any) => {
          this.products = response[0];
          this.reviewStatusForm = this.formBuilder.group({
            statuses: this.formBuilder.array([])
          });
          this.products.forEach(review => {
            const control = this.reviewStatusForm.controls.statuses as FormArray;
            control.push(this.formBuilder.group({
              idInventoryProductStatus: new FormControl(review.idInventoryProductStatus, [
                Validators.required,
              ]),
              idInventoryProductCategory: new FormControl(review.idInventoryProductCategory, [
                Validators.required,
              ])
            }));
          });
          this.categories = response[1];
          this.statuses = response[2];
          this.show_loading = false;
          return resolve(this.products);
        }, error => {
          this.show_loading = false;
          console.error(error);
          this.products = [];
          return resolve(this.products);
        });
    });
  }

  dismiss(response?) {
    if (this.is_embed) {
      this.onDismiss.emit(response);
      this.show_loading = false;
      this.show_editable = false;
      this.deactivateForm();
    } else {
      this.router.navigateByUrl('/inventory');
    }
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

  activateForm(product?: InventoryProductModel) {
    const promises: Promise<any>[] = [];
    promises.push(this.inventoryService.getProductCategories().toPromise());
    promises.push(this.inventoryService.getProductStatus().toPromise());
    promises.push(this.inventoryService.getOptionalFields().toPromise());
    Promise.all(promises)
      .then((data: any) => {
        this.categories = data[0];
        this.statuses = data[1];
        if (this.categories.length === 0 || this.statuses.length === 0) {
          let message_type = ``;
          let message_type_singular = ``;
          if (this.categories.length === 0 && this.statuses.length === 0) {
            message_type = `categories and statuses`;
            message_type_singular = `category and status`;
          } else if (this.categories.length === 0) {
            message_type = `categories`;
            message_type_singular = `category`;
          } else {
            message_type = `statuses`;
            message_type_singular = `status`;
          }
          this.inventoryService.api.showToast(
            `There aren't ${message_type} in your organization. Please go back to add at least one ${message_type_singular}.`,
            ToastType.warning);
          return;
        }
        this.reviewForm = this.formBuilder.group({
          idOrganization: [this.currentUser.idIglesia, Validators.required],
          name: [product ? product.name : '', Validators.required],
          description: new FormControl(product ? product.description : '', []),
          idInventoryProductCategory: [product ? product.idInventoryProductCategory : undefined, Validators.required],
          idInventoryProductStatus: [product ? product.idInventoryProductStatus : undefined, Validators.required],
          qr_code: [product ? product.qr_code : this.random.makeId(), Validators.required],
          created_by: [this.currentUser.idUsuario, Validators.required],
          optional_fields: new FormArray([])
        });

        const optional_fields = data[2];
        console.log(optional_fields);
        let prev_ids = [];
        if (product) {
          prev_ids = product.optional_fields.map(x => x.idOptionalField);
        }

        if (optional_fields.length > 0) {
          optional_fields.forEach(o_field => {
            if (prev_ids.length > 0) {
              o_field.status = prev_ids.includes(o_field.id);
            }
            const group = this.formBuilder.group({
              idOptionalField: new FormControl(o_field.id, [Validators.required]),
              status: new FormControl(o_field.status || false, []),
              name: new FormControl(o_field.name, [Validators.required]),
            });
            this.optional_fields.push(group);
          })
        }
        console.log(this.optional_fields);


        this.show_editable = true;
        if (product) {
          this.reviewForm.addControl('idInventoryProduct', new FormControl(product.idInventoryProduct, Validators.required));

        }
        setTimeout(() => {
          if (product) {
            const category_array = this.categories.filter(g => g.idInventoryProductCategory === product.idInventoryProductCategory);
            this.multi_select_category.writeValue(category_array);

            const category = category_array[0];
            this.fixIdField('idInventoryProductCategory', category);


            const status_array = this.statuses.filter(g => g.idInventoryProductStatus === product.idInventoryProductStatus);
            this.multi_select_status.writeValue(status_array);

            const status = status_array[0];
            this.fixIdField('idInventoryProductStatus', status);
          }
        }, 100);
      }, error => {
        console.error(error);
        if (error.error.msg.Code === 404) {
          // this.inventoryService.api.showToast(`There aren't team groups. You need at least 1 team group to continue.`, ToastType.info, `Nothing found.`);
        } else {
          this.inventoryService.api.showToast(`Something happened while trying to get organization's groups.`, ToastType.error);
        }
      });
  }

  deactivateForm() {
    this.show_editable = false;
    this.reviewForm = undefined;
  }

  fixIdField(field: string, event) {
    this.reviewForm.patchValue({ [field]: event[field] });
  }

  get status_on_form(): FormArray {
    return this.reviewStatusForm.get('statuses') as FormArray;
  }

  checkChange(control: FormControl, review: any, field: string) {
    // Compared as string because the form parse the value as string.
    if (control.value === 'undefined') {
      control.markAsPristine();
      return;
    }
    if (Number(JSON.parse(control.value)) === review[field]) {
      control.markAsPristine();
    }
  }

  updateMemberType(control: FormGroup, product: InventoryProductModel, field: string, namespace: string) {
    // Compared as string because the form parse the value as string.
    if (control.value === 'undefined') {
      control.markAsPristine();
      return;
    }
    const product_temp = Object.assign({}, product);
    product_temp[field] = Number(JSON.parse(control.get(field).value));
    if (product_temp[field] === product[field]) {
      control.get(field).setValue(product[field]);
      control.get(field).markAsPristine();
    } else {
      this.inventoryService.updateProduct(product_temp)
        .subscribe(response => {
          this.inventoryService.api.showToast(`${namespace} updated.`, ToastType.info);
          product[field] = product_temp[field];
          control.get(field).setValue(product_temp[field]);
          control.get(field).markAsPristine();
        }, error => {
          console.error(error);
          this.inventoryService.api.showToast(`Error updating the product's ${namespace.toLowerCase()}. Reversing changes...`, ToastType.error);
          control.get(field).setValue(product[field]);
          control.get(field).markAsPristine();
        });
    }

  }

  updateReview(event: InventoryProductModel) {
    this.activateForm(Object.assign({}, event));
  }

  resetReviewStatusForm(control: FormGroup, product: InventoryProductModel, field: string) {
    control.get(field).setValue(product[field]);
    control.get(field).markAsPristine();
  }


  deleteReview(product: InventoryProductModel) {
    if (confirm(`Delete ${product.name}?. This will delete any other information associated with it.`)) {
      this.inventoryService.deleteProduct(product)
        .subscribe(data => {
          this.getProducts();
          this.inventoryService.api.showToast(`Product successfully deleted.`, ToastType.success);
        },
          err => {
            console.error(err);
            this.inventoryService.api.showToast(`Error deleting product.`, ToastType.error);
          });
    }
  }

  uploadPicture(input_file) {
    input_file.onchange = (event: { target: { files: File[] } }) => {
      if (event.target.files.length > 0) {
        this.uploadImage(event.target.files[0]);
      }
    };
    input_file.click();
  }

  uploadImage(photo) {
    this.fus.uploadFile(photo, true, 'products')
      .subscribe((response: any) => {
        const picture = this.fus.cleanPhotoUrl(response.response);
        this.reviewForm.patchValue({
          picture
        });
      });
  }

  addReview(reviewForm: NgForm) {
    this.show_loading = true;
    if (reviewForm.valid) {
      const payload = reviewForm.value;
      payload.optional_field_ids = this.optional_fields.value.filter(x => x.status).map(x => x.idOptionalField);
      let subscription: Observable<any>;
      let success_message: string;
      let error_message: string;
      if (payload.idInventoryProduct) {
        // update
        subscription = this.inventoryService.updateProduct(payload);
        success_message = `Product updated successfully.`;
        error_message = `Error updating product.`;
      } else {
        // add
        subscription = this.inventoryService.addProduct(payload);
        success_message = `Product added successfully.`;
        error_message = `Error adding product.`;
      }
      subscription
        .subscribe(response => {
          this.getProducts();
          this.deactivateForm();
          this.inventoryService.api.showToast(`${success_message}`, ToastType.success);
        }, error => {
          console.error(error);
          this.inventoryService.api.showToast(`${error_message}`, ToastType.error);
          this.show_loading = false;
        });
    } else {
      this.show_loading = false;
      this.inventoryService.api.showToast(`Some errors in form. Please check.`, ToastType.error);
    }
  }

  mostrarQr(qr_code: string) {
    this.qr_code = `${qr_code}`;

  }

}
