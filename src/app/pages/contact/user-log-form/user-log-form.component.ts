import { ToastType } from './../../../login/ToastTypes';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';
import { UserLogModel } from 'src/app/models/UserLogModel';

@Component({
  selector: 'app-user-log-form',
  templateUrl: './user-log-form.component.html',
  styleUrls: ['./user-log-form.component.scss']
})
export class UserLogFormComponent implements OnInit {

  // tslint:disable-next-line: no-output-rename no-output-on-prefix
  @Output('onDismiss') onDismiss = new EventEmitter();
  @Input() member: User;

  currentUser: User;
  basicInfoForm: FormGroup;
  log: UserLogModel;
  serverBusy: boolean = false;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    this.initForm();
  }

  initForm() {
    this.basicInfoForm = this.formBuilder.group({
      idActivityType: [1, Validators.required],
      idUserOrganization: [this.member.idUserOrganization, Validators.required],
      submitted_date: [new Date(), [Validators.required]],
      note: ['', [Validators.required]],
      createdBy: [this.currentUser.idUsuario]
    });
    if (this.log) {
      this.basicInfoForm.addControl('idUserOrganizationLog', new FormControl(this.log.idUserOrganizationLog,
        [
          Validators.required
        ]));

      this.basicInfoForm.patchValue(this.log);
      this.basicInfoForm.addControl('updatedBy', new FormControl(this.currentUser.idUsuario,
        [
          Validators.required
        ]));
    }
  }

  dismiss(response?: any) {
    this.log = undefined;
    this.initForm();
    if (response) {
      this.onDismiss.emit(response);
    } else {
      this.onDismiss.emit();
    }
  }

  submitLog() {
    this.serverBusy = true;
    const payload: UserLogModel = this.basicInfoForm.value;
    let subscription: Observable<any>;
    let success_message: string;
    let error_message: string;
    if (payload.idUserOrganizationLog) {
      // update
      subscription = this.userService.updateUserOrganizationLog(payload);
      success_message = `Note updated successfully.`;
      error_message = `Error updating note.`;
    } else {
      // add
      subscription = this.userService.addUserOrganizationLog(payload);
      success_message = `Note added successfully.`;
      error_message = `Error adding note.`;
    }

    subscription.subscribe(response => {
      this.userService.api.showToast(`${success_message}`, ToastType.success);
      this.dismiss(response);
      this.serverBusy = false;
    }, error => {
      console.error(error);
      this.userService.api.showToast(`${error_message}`, ToastType.error);
      this.serverBusy = false;
    });
  }

}
