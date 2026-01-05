import { ApiService } from '../../../services/api.service';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, FormControl, Validators, NgForm } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ToastType } from 'src/app/login/ToastTypes';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-organization-category-form',
  templateUrl: './organization-category-form.component.html',
  styleUrls: ['./organization-category-form.component.scss']
})
export class OrganizationCategoryFormComponent implements OnInit {

  category: any;
  @Output() dismiss_form = new EventEmitter();
  show_detail: boolean = true;

  category_form: FormGroup = this.form_builder.group({
    name: new FormControl('', [Validators.required]),
    descripcion: new FormControl(''),
  });

  current_user: User;

  constructor(
    private form_builder: FormBuilder,
    private api: ApiService,
    private user_service: UserService
  ) {
    this.current_user = this.user_service.getCurrentUser();
  }

  ngOnInit() {
    if (this.category) {
      console.log(this.category);
      this.category_form.addControl('id', new FormControl(this.category.id, [Validators.required]));
      this.category_form.patchValue(this.category);
    } else {
      console.log(this.category);
      this.category_form.removeControl('id');
      this.category_form.reset();
    }
  }

  submitCategory(organization_category_form: FormGroup, group_form: NgForm) {
    console.log(organization_category_form.value);
    this.show_detail = false;
    if (organization_category_form.valid) {
      const organization_category = organization_category_form.value;
      organization_category.created_by = this.current_user.idUsuario;
      let subscription: Observable<any>;
      let success_message: string;
      let error_message: string;
      if (organization_category.id) {
        // update
        subscription = this.api.patch(`organization_categories/${organization_category.id}`, organization_category);
        success_message = `Category updated successfully.`;
        error_message = `Error updating Category.`;
      } else {
        // add
        subscription = this.api.post(`organization_categories/`, organization_category);
        success_message = `Category added successfully.`;
        error_message = `Error adding Category.`;
      }
      subscription
        .subscribe(response => {
          this.api.showToast(`${success_message}`, ToastType.success);
          console.log(response);
          this.show_detail = true;
          this.close(true);
        }, error => {
          this.api.showToast(`${error_message}`, ToastType.error);
          console.error(error);
          this.show_detail = true;
        });
    } else {
      setTimeout(() => {
        this.show_detail = true;
      }, 6000);
      this.api.showToast(`Please check the info provided. Some fields are required.`, ToastType.error);
    }

  }

  close(response?: boolean) {
    this.dismiss_form.emit(response);
  }

}
