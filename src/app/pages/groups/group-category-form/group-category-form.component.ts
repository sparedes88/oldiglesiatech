import { GroupCategoryModel } from './../../../models/GroupModel';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ToastType } from 'src/app/login/ToastTypes';
import { GroupsService } from 'src/app/services/groups.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-group-category-form',
  templateUrl: './group-category-form.component.html',
  styleUrls: ['./group-category-form.component.scss']
})
export class GroupCategoryFormComponent implements OnInit {

  group_category: GroupCategoryModel = new GroupCategoryModel();

  serverBusy = false;

  @Output('onDismiss') onDismiss = new EventEmitter();

  constructor(private groupService: GroupsService) { }

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
    // group_category.idUser = this.currentUser.idUsuario;
    const validate = this.validateInputs(group_category);
    let subscription: Observable<any>;
    if (validate.success) {
      if (!this.group_category.idGroupCategory) {
        // add
        subscription = this.groupService.saveGroupCategory(group_category);
      } else {
        // update
        subscription = this.groupService.updateGroupCategory(group_category);
      }
      subscription
        .subscribe(response => {
          this.groupService.api.showToast('Record saved correctly', ToastType.success);
          this.dismiss(response);
          this.serverBusy = false;
        }, err => {
          console.error(JSON.stringify(err));
          this.groupService.api.showToast('Error saving the category', ToastType.error);
          this.serverBusy = false;
        });
    } else {
      this.serverBusy = false;
      this.groupService.api.showToast(validate.message, ToastType.info, 'Ups!');
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
