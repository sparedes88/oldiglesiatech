import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { InventoryService } from 'src/app/inventory.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { InventoryProductCategoryModel, OptionalFieldModel } from 'src/app/models/InventoryModel';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-optional-fields',
  templateUrl: './optional-fields.component.html',
  styleUrls: ['./optional-fields.component.scss']
})
export class OptionalFieldsComponent implements OnInit {
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onDismiss = new EventEmitter();

  @Input() show_dismiss: boolean = true;
  @Input() is_embed: boolean = false;

  optional_field: OptionalFieldModel;
  optional_fields: OptionalFieldModel[] = [];
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
    this.getOptionalFields();
  }

  getOptionalFields() {
    this.show_loading = true;
    return new Promise((resolve, reject) => {
      const promises = [];
      // promises.push(this.inventoryService.getCategoryes().toPromise());
      // promises.push(this.inventoryService.getCategoryCategories().toPromise());
      promises.push(this.inventoryService.getOptionalFields().toPromise());
      Promise.all(promises)
        .then((response: any) => {
          this.optional_fields = response[0];
          this.show_loading = false;
          return resolve(this.optional_fields);
        }, error => {
          this.show_loading = false;
          console.error(error);
          this.optional_fields = [];
          return resolve(this.optional_fields);
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
      this.router.navigateByUrl('inventory');
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

  activateForm(optional_field?: OptionalFieldModel) {
    this.reviewForm = this.formBuilder.group({
      idOrganization: [this.currentUser.idIglesia, Validators.required],
      name: [optional_field ? optional_field.name : '', Validators.required],
      description: [optional_field ? optional_field.description : ''],
      created_by: [this.currentUser.idUsuario, Validators.required],
    });

    this.show_editable = true;
    if (optional_field) {
      this.reviewForm.addControl('id', new FormControl(optional_field.id, Validators.required));

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

  updateMemberType(control: FormGroup, optional_field: InventoryProductCategoryModel, field: string, namespace: string) {
    // Compared as string because the form parse the value as string.
    if (control.value === 'undefined') {
      control.markAsPristine();
      return;
    }
    const product_temp = Object.assign({}, optional_field);
    product_temp[field] = Number(JSON.parse(control.get(field).value));
    if (product_temp[field] === optional_field[field]) {
      control.get(field).setValue(optional_field[field]);
      control.get(field).markAsPristine();
    } else {
      this.inventoryService.updateCategory(product_temp)
        .subscribe(response => {
          this.inventoryService.api.showToast(`${namespace} updated.`, ToastType.info);
          optional_field[field] = product_temp[field];
          control.get(field).setValue(product_temp[field]);
          control.get(field).markAsPristine();
        }, error => {
          console.error(error);
          this.inventoryService.api.showToast(`Error updating the optional field's ${namespace.toLowerCase()}. Reversing changes...`, ToastType.error);
          control.get(field).setValue(optional_field[field]);
          control.get(field).markAsPristine();
        });
    }

  }

  updateReview(optional_field: OptionalFieldModel) {
    this.activateForm(Object.assign({}, optional_field));
  }

  resetReviewCategoryForm(control: FormGroup, optional_field: OptionalFieldModel, field: string) {
    control.get(field).setValue(optional_field[field]);
    control.get(field).markAsPristine();
  }


  deleteReview(optional_fields: OptionalFieldModel) {
    if (confirm(`Delete ${optional_fields.name}?. This will delete any other information associated with it.`)) {
      this.inventoryService.deleteOptionalField(optional_fields)
        .subscribe(data => {
          this.getOptionalFields();
          this.inventoryService.api.showToast(`Optional field successfully deleted.`, ToastType.success);
        },
          err => {
            console.error(err);
            this.inventoryService.api.showToast(`Error deleting optional field.`, ToastType.error);
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
      if (payload.id) {
        // update
        subscription = this.inventoryService.updateOptionalField(payload);
        success_message = `Optional field updated successfully.`;
        error_message = `Error updating optional field.`;
      } else {
        // add
        subscription = this.inventoryService.addOptionalField(payload);
        success_message = `Optional field added successfully.`;
        error_message = `Error adding optional field.`;
      }
      subscription
        .subscribe(response => {
          this.getOptionalFields();
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
