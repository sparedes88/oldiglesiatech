import { Observable } from 'rxjs';
import { FormGroup, NgForm, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit, EventEmitter, Input, ViewChild, Output } from '@angular/core';
import { MultiSelectComponent } from 'ng-multiselect-dropdown';
import { ApiService } from 'src/app/services/api.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-donation-category-form',
  templateUrl: './donation-category-form.component.html',
  styleUrls: ['./donation-category-form.component.scss']
})
export class DonationCategoryFormComponent implements OnInit {

  // tslint:disable-next-line: no-output-rename no-output-on-prefix
  @Output('onDismiss') onDismiss = new EventEmitter();
  @ViewChild('basic_form') basic_form: NgForm;
  @Input() iglesias: any[];

  category: any;

  basicInfoForm: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    idIglesia: ['', Validators.required],
    created_by: ['', Validators.required],
    idDonationCategory: ['']
  });

  serverBusy: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private api: ApiService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.basicInfoForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      idIglesia: [this.userService.getCurrentUser().idIglesia, Validators.required],
      created_by: [this.userService.getCurrentUser().idUsuario, Validators.required],
      idDonationCategory: ['']
    });
    this.basicInfoForm.get('idIglesia').setValue(this.userService.getCurrentUser().idIglesia);
    this.basicInfoForm.get('created_by').setValue(this.userService.getCurrentUser().idUsuario);

  }

  onRegister() {
    this.serverBusy = true;
    const payload = this.basicInfoForm.value;

    let subscription: Observable<any>;
    let message_success: string;
    let message_error: string;
    if (this.category) {
      message_success = `Category updated successfully.`;
      message_error = `Error updating category.`;
      subscription = this.api.patch(`donations/categories/${this.category.idDonationCategory}`, payload);
    } else {
      if (payload.idIglesia == null) {
        this.api.showToast(`Please select a valid organization.`, ToastType.info);
        this.serverBusy = false;
        return;
      }
      message_success = `Category created successfully.`;
      message_error = `Error creating category.`;
      subscription = this.api.post(`donations/categories/`, payload);
    }

    subscription
      .subscribe((data: any) => {
        this.api.showToast(`${message_success}`, ToastType.success);
        this.serverBusy = false;
        this.dismiss(data);
      }, err => {
        console.error(err);
        this.api.showToast(`${message_error}`, ToastType.error);
        this.serverBusy = false;
      });
  }

  dismiss(response?) {
    if (response) {
      this.onDismiss.emit(response);
    } else {
      this.onDismiss.emit();
    }
    this.serverBusy = false;
  }

  setCategory(donation_category: any) {
    this.category = donation_category;
    this.basicInfoForm.patchValue(donation_category);
  }

}
