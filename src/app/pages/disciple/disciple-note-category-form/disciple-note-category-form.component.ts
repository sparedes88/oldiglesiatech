import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { ToastType } from 'src/app/login/ToastTypes';
import { GroupCategoryModel } from 'src/app/models/GroupModel';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-disciple-note-category-form',
  templateUrl: './disciple-note-category-form.component.html',
  styleUrls: ['./disciple-note-category-form.component.scss']
})
export class DiscipleNoteCategoryFormComponent implements OnInit {

  group_category: GroupCategoryModel = new GroupCategoryModel();

  serverBusy = false;

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

  submit(group_category: GroupCategoryModel) {
    this.serverBusy = true;
    let action: string;
    // group_category.idUser = this.currentUser.idUsuario;
    const validate = this.validateInputs(group_category);
    let subscription: Observable<any>;
    if (validate.success) {
      if (!this.group_category.id) {
        // add
        subscription = this.api.post('disciples/categories', group_category);
        action = 'add';
      } else {
        // update
        subscription = this.api.patch(`disciples/categories/${this.group_category.id}`, group_category);
        action = 'edit';
      }
      subscription
        .subscribe(response => {
          this.api.showToast('Record saved correctly', ToastType.success);
          this.dismiss({ response, action });
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

  validateInputs(group_category: GroupCategoryModel) {
    const validate = {
      success: false,
      message: 'Success'
    };

    if (group_category.name === '') {
      validate.message = 'You have to add a name of the category.';
    } else if (group_category.description === '') {
      validate.message = 'You have to add a note/description of the category.';
    } else if (!group_category.created_by && group_category.created_by !== undefined) {
      validate.message = 'There is something wrong with your user';
    } else {
      validate.success = true;
    }
    return validate;
  }

  setCategory(contact_category: any) {
    this.group_category = Object.assign({}, contact_category);
    // this.basicInfoForm.patchValue(contact_category);
  }
}
