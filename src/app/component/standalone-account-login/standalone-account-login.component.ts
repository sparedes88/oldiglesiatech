import { UserService } from './../../services/user.service';
import { FormGroup, Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-standalone-account-login',
  templateUrl: './standalone-account-login.component.html',
  styleUrls: ['./standalone-account-login.component.scss']
})
export class StandaloneAccountLoginComponent implements OnInit {

  @Input('idOrganization') idOrganization: number;
  @Input('handle_as_template') handle_as_template: boolean = false;
  @Output('on_login_success') on_login_success: EventEmitter<any> = new EventEmitter();

  full_form: FormGroup = new FormGroup({
    user_status: new FormControl(undefined, [Validators.required]),
    get_started_form: this.form_builder.group({
      value_to_verify: ['', [Validators.required]],
      login_type: ''
    }),
    login_form: this.form_builder.group({
      usuario: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    }),
    register_form: this.form_builder.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      // tslint:disable-next-line: max-line-length
      email: ['', [Validators.required, Validators.pattern(new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/))]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required, Validators.minLength(6)]],
      pass: [''],
      reset_password: [false],
      calle: [''],
      ciudad: [''],
      provincia: [''],
      zip: [''],
      isSuperUser: false,
      isNewUser: false,
      login_type: '',
      idIglesia: [Validators.required],
      telefono: [''],
      country_code: [Validators.required],
      idUserType: new FormControl(2, [Validators.required]),
      is_available: new FormControl(false, [Validators.required, Validators.pattern(/^(?:1|y(?:es)?|t(?:rue)?|on)$/i)]),
      accept_empty_phone: false
    })
  });

  currentUser: User;
  logged_user: User;
  userSelectionList: any[];

  constructor(
    private form_builder: FormBuilder,
    private userService: UserService
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  ngOnInit() {
  }

  get actual_user_status(): string {
    return this.full_form.get('user_status').value;
  }

  set actual_user_status(value: string) {
    this.full_form.get('user_status').setValue(value);
  }

  getUserStatus(event: string) {
    this.full_form.get('user_status').setValue(event);
    console.log(this.full_form);
    this.full_form.get('login_form').reset();
    if (this.full_form.get('user_status').value === 'checked_ok') {
      this.full_form.get('register_form').get('idIglesia').setValue(this.idOrganization);
      this.full_form.get('register_form').get('idUserType').setValue(2);
      console.log(this.full_form.get('register_form'));
    }
  }

  cancelForm() {
    this.full_form.get('user_status').setValue(undefined);
  }

  loginResponse(user) {
    if (user) {
      console.log(user);
      this.currentUser = user;
      this.logged_user = user;
      user._loading = true;
      const userStr: string = JSON.stringify(user);
      // Store the current user on local storage
      localStorage.setItem('currentUser', userStr);

      let companies: any[];
      if (this.userSelectionList) {
        companies = this.userSelectionList.map(user => user.idIglesia);
      } else {
        companies = [user.idIglesia];
      }

      localStorage.setItem('companies', JSON.stringify(companies));
      this.currentUser = user;
      this.logged_user = user;
      // this.login_complete = true;

      setTimeout(() => {
        // this.app.footer.currentUser = user;
        // this.app.menu.currentUser = user;
      });
      this.on_login_success.emit(this.currentUser);
    }
  }



  cancelRegister() {
    this.full_form.get('register_form').reset();
    this.full_form.get('register_form').get('idIglesia').setValue(this.idOrganization);
    this.full_form.get('register_form').get('idUserType').setValue(2);
    this.full_form.get('user_status').reset();
  }

  openResetPassword(event) {
    this.actual_user_status = 'reset_password';
  }

}
