import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { ToastType } from 'src/app/login/ToastTypes';
import { ApiService } from 'src/app/services/api.service';
import { EntryGroupModel } from '../EntryGroupModel';

@Component({
  selector: 'app-entry-group-form',
  templateUrl: './entry-group-form.component.html',
  styleUrls: ['./entry-group-form.component.scss']
})
export class EntryGroupFormComponent implements OnInit {

  entry_group: EntryGroupModel = new EntryGroupModel();

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

  submit(entry_group: EntryGroupModel) {
    this.serverBusy = true;
    // entry_group.idUser = this.currentUser.idUsuario;
    const validate = this.validateInputs(entry_group);
    let subscription: Observable<any>;
    if (validate.success) {
      if (!this.entry_group.idEntryGroup) {
        // add
        subscription = this.api.post(`communityBox/meta/groups`, entry_group);
      } else {
        // update
        subscription = this.api.patch(`communityBox/meta/groups/${entry_group.idEntryGroup}`, entry_group);
      }
      subscription
        .subscribe(response => {
          this.api.showToast('Record saved correctly', ToastType.success);
          this.dismiss(response);
          this.serverBusy = false;
        }, err => {
          console.error(JSON.stringify(err));
          this.api.showToast('Error saving the entry group', ToastType.error);
          this.serverBusy = false;
        });
    } else {
      this.serverBusy = false;
      this.api.showToast(validate.message, ToastType.info, 'Ups!');
    }
  }

  validateInputs(entry_group: EntryGroupModel) {
    const validate = {
      success: false,
      message: 'Success'
    };

    if (entry_group.name === '') {
      validate.message = 'You have to add a name of the entry group.';
    } else if (entry_group.description === '') {
      validate.message = 'You have to add a note/description of the entry group.';
    } else if (!entry_group.created_by && entry_group.created_by !== undefined) {
      validate.message = 'There is something wrong with your user';
    } else {
      validate.success = true;
    }
    return validate;
  }

  setEntryGroup(entry_group: any) {
    this.entry_group = Object.assign({}, entry_group);
    // this.basicInfoForm.patchValue(entry_group);
  }

}
