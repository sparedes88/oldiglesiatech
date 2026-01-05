import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, NgForm } from '@angular/forms';
import { ToastType } from '../../../login/ToastTypes';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { InventoryService } from 'src/app/inventory.service';
import { InventoryProductCategoryModel } from 'src/app/models/InventoryModel';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventory-product-category-form',
  templateUrl: './inventory-product-category-form.component.html',
  styleUrls: ['./inventory-product-category-form.component.scss']
})
export class InventoryProductCategoryFormComponent implements OnInit {

  // tslint:disable-next-line: no-output-on-prefix
  @Output() onDismiss = new EventEmitter();

  @Input() show_dismiss: boolean = true;
  @Input() is_embed: boolean = false;

  category: InventoryProductCategoryModel;
  categories: InventoryProductCategoryModel[] = [];
  qr_code: string;
  currentUser: User;
  show_editable: boolean = false;
  show_loading: boolean = false;

  reviewForm: FormGroup;

  constructor(
    private userService: UserService,
    private inventoryService: InventoryService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  ngOnInit() {
    this.getCategories();
  }

  getCategories() {
    this.show_loading = true;
    return new Promise((resolve, reject) => {
      const promises = [];
      // promises.push(this.inventoryService.getCategoryes().toPromise());
      // promises.push(this.inventoryService.getCategoryCategories().toPromise());
      promises.push(this.inventoryService.getProductCategories().toPromise());
      Promise.all(promises)
        .then((response: any) => {
          this.categories = response[0];
          this.show_loading = false;
          return resolve(this.categories);
        }, error => {
          this.show_loading = false;
          console.error(error);
          this.categories = [];
          return resolve(this.categories);
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
      this.router.navigateByUrl('inventory/products');
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

  activateForm(category?: InventoryProductCategoryModel) {
    this.reviewForm = this.formBuilder.group({
      idOrganization: [this.currentUser.idIglesia, Validators.required],
      name: [category ? category.name : '', Validators.required],
      description: [category ? category.description : ''],
      created_by: [this.currentUser.idUsuario, Validators.required],
    });

    this.show_editable = true;
    if (category) {
      this.reviewForm.addControl('idInventoryProductCategory', new FormControl(category.idInventoryProductCategory, Validators.required));

    }
  }

  deactivateForm() {
    this.show_editable = false;
    this.reviewForm = undefined;
  }

  fixIdField(field: string, event) {
    this.reviewForm.patchValue({ [field]: event[field] });
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

  updateMemberType(control: FormGroup, category: InventoryProductCategoryModel, field: string, namespace: string) {
    // Compared as string because the form parse the value as string.
    if (control.value === 'undefined') {
      control.markAsPristine();
      return;
    }
    const product_temp = Object.assign({}, category);
    product_temp[field] = Number(JSON.parse(control.get(field).value));
    if (product_temp[field] === category[field]) {
      control.get(field).setValue(category[field]);
      control.get(field).markAsPristine();
    } else {
      this.inventoryService.updateCategory(product_temp)
        .subscribe(response => {
          this.inventoryService.api.showToast(`${namespace} updated.`, ToastType.info);
          category[field] = product_temp[field];
          control.get(field).setValue(product_temp[field]);
          control.get(field).markAsPristine();
        }, error => {
          console.error(error);
          this.inventoryService.api.showToast(`Error updating the category's ${namespace.toLowerCase()}. Reversing changes...`, ToastType.error);
          control.get(field).setValue(category[field]);
          control.get(field).markAsPristine();
        });
    }

  }

  updateReview(category: InventoryProductCategoryModel) {
    this.activateForm(Object.assign({}, category));
  }

  resetReviewCategoryForm(control: FormGroup, category: InventoryProductCategoryModel, field: string) {
    control.get(field).setValue(category[field]);
    control.get(field).markAsPristine();
  }


  deleteReview(category: InventoryProductCategoryModel) {
    if (confirm(`Delete ${category.name}?. This will delete any other information associated with it.`)) {
      this.inventoryService.deleteCategory(category)
        .subscribe(data => {
          this.getCategories();
          this.inventoryService.api.showToast(`Category successfully deleted.`, ToastType.success);
        },
          err => {
            console.error(err);
            this.inventoryService.api.showToast(`Error deleting category.`, ToastType.error);
          });
    }
  }

  addReview(reviewForm: NgForm) {
    this.show_loading = true;
    if (reviewForm.valid) {
      const payload = reviewForm.value;
      let subscription: Observable<any>;
      let success_message: string;
      let error_message: string;
      if (payload.idInventoryProductCategory) {
        // update
        subscription = this.inventoryService.updateCategory(payload);
        success_message = `Category updated successfully.`;
        error_message = `Error updating category.`;
      } else {
        // add
        subscription = this.inventoryService.addCategory(payload);
        success_message = `Category added successfully.`;
        error_message = `Error adding category.`;
      }
      subscription
        .subscribe(response => {
          this.getCategories();
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
