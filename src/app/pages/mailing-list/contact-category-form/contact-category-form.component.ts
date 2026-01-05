import { MailingListContactCategoryModel } from '../../../models/MailingListContactCategoryModel';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { ToastType } from 'src/app/login/ToastTypes';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-contact-category-form',
  templateUrl: './contact-category-form.component.html',
  styleUrls: ['./contact-category-form.component.scss']
})
export class MailingListContactCategoryFormComponent implements OnInit {

  contact_category: MailingListContactCategoryModel = new MailingListContactCategoryModel();

  serverBusy = false;
  @Input('mailingListId') mailingListId: number;

  @Output('onDismiss') onDismiss = new EventEmitter();

  constructor(private api: ApiService) { }

  ngOnInit() {
  }

  dismiss(response?) {
    if (response) {
      this.onDismiss.emit(response);
    } else {
      this.onDismiss.emit();
    }
  }

  submit(contact_category: MailingListContactCategoryModel) {
    this.serverBusy = true;
    // contact_category.idUser = this.currentUser.idUsuario;
    const validate = this.validateInputs(contact_category);
    let subscription: Observable<any>;
    if (validate.success) {
      if (!this.contact_category.idMailingListContactStatus) {
        // add
        subscription = this.api.post(`mailingList/${this.mailingListId}/categories`, contact_category);
      } else {
        // update
        subscription = this.api.patch(`mailingList/${this.mailingListId}/categories/${contact_category.idMailingListContactStatus}`, contact_category);
      }
      subscription
        .subscribe(response => {
          this.api.showToast('Record saved correctly', ToastType.success);
          this.dismiss(response);
          this.serverBusy = false;
        }, err => {
          console.error(JSON.stringify(err));
          this.api.showToast('Error saving the category', ToastType.error);
          this.serverBusy = false;
        });
    } else {
      this.serverBusy = false;
      this.api.showToast(validate.message, ToastType.info, 'Ups!');
    }
  }

  validateInputs(contact_category: MailingListContactCategoryModel) {
    const validate = {
      success: false,
      message: 'Success'
    };

    if (contact_category.name === '') {
      validate.message = 'You have to add a name of the category.';
    } else if (contact_category.description === '') {
      validate.message = 'You have to add a note/description of the category.';
    } else if (!contact_category.created_by && contact_category.created_by !== undefined) {
      validate.message = 'There is something wrong with your user';
    } else {
      validate.success = true;
    }
    return validate;
  }

  setCategory(contact_category: any) {
    this.contact_category = Object.assign({}, contact_category);
    // this.basicInfoForm.patchValue(contact_category);
  }

}
