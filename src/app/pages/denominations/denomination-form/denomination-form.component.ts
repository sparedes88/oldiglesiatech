import { ApiService } from '../../../services/api.service';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, FormControl, Validators, NgForm } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ToastType } from 'src/app/login/ToastTypes';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-denomination-form',
  templateUrl: './denomination-form.component.html',
  styleUrls: ['./denomination-form.component.scss']
})
export class DenominationFormComponent implements OnInit {

  denomination: any;
  @Output() dismiss_form = new EventEmitter();
  show_detail: boolean = true;

  denomination_form: FormGroup = this.form_builder.group({
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
    if (this.denomination) {
      console.log(this.denomination);
      this.denomination_form.addControl('id', new FormControl(this.denomination.id, [Validators.required]));
      this.denomination_form.patchValue(this.denomination);
    } else {
      console.log(this.denomination);
      this.denomination_form.removeControl('id');
      this.denomination_form.reset();
    }
  }

  submitDenomination(organization_denomination_form: FormGroup, group_form: NgForm) {
    console.log(organization_denomination_form.value);
    this.show_detail = false;
    if (organization_denomination_form.valid) {
      const organization_denomination = organization_denomination_form.value;
      organization_denomination.created_by = this.current_user.idUsuario;
      let subscription: Observable<any>;
      let success_message: string;
      let error_message: string;
      if (organization_denomination.id) {
        // update
        subscription = this.api.patch(`denominations/${organization_denomination.id}`, organization_denomination);
        success_message = `Denomination updated successfully.`;
        error_message = `Error updating Denomination.`;
      } else {
        // add
        subscription = this.api.post(`denominations/`, organization_denomination);
        success_message = `Denomination added successfully.`;
        error_message = `Error adding Denomination.`;
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
