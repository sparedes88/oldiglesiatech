import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, NgForm } from '@angular/forms';
import { ToastType } from './../../../login/ToastTypes';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { InventoryService } from 'src/app/inventory.service';
import { InventoryProductStatusModel } from 'src/app/models/InventoryModel';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventory-product-status-form',
  templateUrl: './inventory-product-status-form.component.html',
  styleUrls: ['./inventory-product-status-form.component.scss']
})
export class InventoryProductStatusFormComponent implements OnInit {

  // tslint:disable-next-line: no-output-on-prefix
  @Output() onDismiss = new EventEmitter();

  @Input() show_dismiss: boolean = true;
  @Input() is_embed: boolean = false;

  status: InventoryProductStatusModel;
  statuses: InventoryProductStatusModel[] = [];
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
    this.getStatuses();
  }

  getStatuses() {
    this.show_loading = true;
    return new Promise((resolve, reject) => {
      const promises = [];
      // promises.push(this.inventoryService.getStatuses().toPromise());
      // promises.push(this.inventoryService.getStatusCategories().toPromise());
      promises.push(this.inventoryService.getProductStatus().toPromise());
      Promise.all(promises)
        .then((response: any) => {
          this.statuses = response[0];
          this.show_loading = false;
          return resolve(this.statuses);
        }, error => {
          this.show_loading = false;
          console.error(error);
          this.statuses = [];
          return resolve(this.statuses);
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
      this.router.navigateByUrl('/inventory/products');
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

  activateForm(status?: InventoryProductStatusModel) {
    this.reviewForm = this.formBuilder.group({
      idOrganization: [this.currentUser.idIglesia, Validators.required],
      name: [status ? status.name : '', Validators.required],
      description: [status ? status.description : ''],
      created_by: [this.currentUser.idUsuario, Validators.required],
    });

    this.show_editable = true;
    if (status) {
      this.reviewForm.addControl('idInventoryProductStatus', new FormControl(status.idInventoryProductStatus, Validators.required));

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

  updateMemberType(control: FormGroup, status: InventoryProductStatusModel, field: string, namespace: string) {
    // Compared as string because the form parse the value as string.
    if (control.value === 'undefined') {
      control.markAsPristine();
      return;
    }
    const product_temp = Object.assign({}, status);
    product_temp[field] = Number(JSON.parse(control.get(field).value));
    if (product_temp[field] === status[field]) {
      control.get(field).setValue(status[field]);
      control.get(field).markAsPristine();
    } else {
      this.inventoryService.updateStatus(product_temp)
        .subscribe(response => {
          this.inventoryService.api.showToast(`${namespace} updated.`, ToastType.info);
          status[field] = product_temp[field];
          control.get(field).setValue(product_temp[field]);
          control.get(field).markAsPristine();
        }, error => {
          console.error(error);
          this.inventoryService.api.showToast(`Error updating the status's ${namespace.toLowerCase()}. Reversing changes...`, ToastType.error);
          control.get(field).setValue(status[field]);
          control.get(field).markAsPristine();
        });
    }

  }

  updateReview(status: InventoryProductStatusModel) {
    this.activateForm(Object.assign({}, status));
  }

  resetReviewStatusForm(control: FormGroup, status: InventoryProductStatusModel, field: string) {
    control.get(field).setValue(status[field]);
    control.get(field).markAsPristine();
  }


  deleteReview(status: InventoryProductStatusModel) {
    if (confirm(`Delete ${status.name}?. This will delete any other information associated with it.`)) {
      this.inventoryService.deleteStatus(status)
        .subscribe(data => {
          this.getStatuses();
          this.inventoryService.api.showToast(`Status successfully deleted.`, ToastType.success);
        },
          err => {
            console.error(err);
            this.inventoryService.api.showToast(`Error deleting status.`, ToastType.error);
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
      if (payload.idInventoryProductStatus) {
        // update
        subscription = this.inventoryService.updateStatus(payload);
        success_message = `Status updated successfully.`;
        error_message = `Error updating status.`;
      } else {
        // add
        subscription = this.inventoryService.addStatus(payload);
        success_message = `Status added successfully.`;
        error_message = `Error adding status.`;
      }
      subscription
        .subscribe(response => {
          this.getStatuses();
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
