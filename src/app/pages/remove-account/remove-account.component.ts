import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import * as uuid_v4 from 'uuid';
import { ToastType } from '../contact/toastTypes';
import { Router } from '@angular/router';

@Component({
  selector: 'app-remove-account',
  templateUrl: './remove-account.component.html',
  styleUrls: ['./remove-account.component.scss']
})
export class RemoveAccountComponent implements OnInit {

  @Input('idOrganization') idOrganization: number;

  current_user: User;

  confirmation_form: FormGroup = this.form_builder.group({
    uuid: new FormControl(uuid_v4.v4(), [Validators.required]),
    uuid_confirm: new FormControl('', [Validators.required])
  });

  constructor(
    private form_builder: FormBuilder,
    private user_service: UserService,
    private router: Router
  ) {
    this.current_user = this.user_service.getCurrentUser();
  }

  ngOnInit() {
  }


  handleLogOff() {
    this.current_user = undefined;
  }

  setUser(user) {
    this.current_user = this.user_service.getCurrentUser();
  }

  async requestDelete() {
    const payload = this.confirmation_form.value;
    if (!payload.uuid_confirm) {
      this.user_service.api.showToast(`Please copy the exact text to confirm your deletion account.`, ToastType.error);
      this.confirmation_form.get('uuid_confirm').markAsTouched();
      return;
    }
    if (payload.uuid != payload.uuid_confirm) {
      this.user_service.api.showToast(`Please copy the exact text to confirm your deletion account. We generated a new confirmation text.`, ToastType.error);
      this.confirmation_form.get('uuid_confirm').setValue('');
      this.confirmation_form.get('uuid_confirm').markAsPristine();
      this.confirmation_form.get('uuid').setValue(uuid_v4.v4());
      return;
    }
    const response: any = await this.user_service.deleteInfoUser(this.current_user.idUsuario)
      .toPromise()
      .catch(error => {
        console.info(error);
        return;
      });

    if (response) {
      this.current_user = undefined;
      this.user_service.logout();
      // if (this.handle_logout) {
      //   this.logout.emit({});
      // } else {
      //   this.router.navigate(['/login']);
      // }
    }
  }

  goToMyProfile() {
    this.router.navigate([`/user-profile/details/${this.current_user.idUsuario}`]);
  }
}
