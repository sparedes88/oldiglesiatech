import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { IDropdownSettings, MultiSelectComponent } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { SelectCountryComponent } from 'src/app/component/custom-select-country/custom-select-country.component';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';

import { AutocompleteResponseModel, GoogleAddressComponent } from './../../../component/google-places/google-places.component';

@Component({
  selector: 'app-simple-member-form',
  templateUrl: './simple-member-form.component.html',
  styleUrls: ['./simple-member-form.component.scss']
})
export class SimpleMemberFormComponent implements OnInit {

  // tslint:disable-next-line: no-output-rename no-output-on-prefix
  @Output('onDismiss') onDismiss = new EventEmitter();
  @Output('onDismissOnlyLoad') onDismissOnlyLoad = new EventEmitter();
  @ViewChild('multi_select') multi_select: MultiSelectComponent;
  @ViewChild('multi_user_type_select') multi_user_type_select: MultiSelectComponent;
  @ViewChild('basic_form') basic_form: NgForm;
  @ViewChild('custom_select_country') custom_select_country: SelectCountryComponent;
  @Input() iglesias: any[];
  user_types = [{
    idUserType: 1,
    name: 'Organization admin'
  }, {
    idUserType: 2,
    name: 'Member'
  }];

  user: any;

  basicInfoForm: FormGroup = this.formBuilder.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    // tslint:disable-next-line: max-line-length
    email: ['', [Validators.required, Validators.pattern(new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/))]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    pass: [''],
    reset_password: [false],
    calle: [''],
    ciudad: [''],
    provincia: [''],
    zip: [''],
    isSuperUser: false,
    isNewUser: false,
    idIglesia: [Validators.required],
    telefono: ['', Validators.required],
    country_code: ['', Validators.required],
    idUserType: [Validators.required],
    location: [''],
    country: [''],
    lat: undefined,
    lng: undefined
  });

  selectOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idIglesia',
    textField: 'Nombre',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  selectUserTypeOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idUserType',
    textField: 'name',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  userAvailable: boolean = false;
  errorChecking: boolean = false;
  isChecked: boolean = false;
  select_manual_organization: boolean = false;
  typingTimer;                // timer identifier
  typingTimerLoading;         // timer identifier
  doneTypingInterval = 3000;

  currentUser: User;
  loading: boolean;
  serverBusy: boolean = false;

  show_super_user_fields: boolean = true;
  display_re_add: boolean = false;
  init_map: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private api: ApiService,
    private toastr: ToastrService
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  ngOnInit() {
    this.init_map = false;
    this.basicInfoForm.reset();
    this.basicInfoForm.patchValue({
      nombre: '',
      apellido: '',
      // tslint:disable-next-line: max-line-length
      email: '',
      password: '',
      pass: '',
      reset_password: false,
      calle: '',
      ciudad: '',
      provincia: '',
      zip: '',
      isSuperUser: false,
      isNewUser: false,
      idIglesia: '',
      telefono: '',
      country_code: '',
      idUserType: [],
      country: '',
      location: '',
      lat: undefined,
      lng: undefined
    });
    this.loading = false;
    setTimeout(() => {
      this.init_map = true;
    }, 100);
  }

  dismiss(response?, only_load?: boolean) {
    this.multi_select.selectedItems = [];
    this.multi_user_type_select.selectedItems = [];
    if (response) {
      if (only_load) {
        this.onDismissOnlyLoad.emit(response);
      } else {
        this.onDismiss.emit(response);
      }
    } else {
      this.onDismiss.emit();
    }
    this.clearTimeout({});
    this.userAvailable = false;
    this.errorChecking = false;
    this.isChecked = false;
    this.serverBusy = false;
    this.loading = false;
    this.select_manual_organization = false;
    this.display_re_add = false;
  }

  startTimeout(event) {
    // clearTimeout(this.typingTimer);
    // clearTimeout(this.typingTimerLoading);
    // this.typingTimer = setTimeout(() => this.checkUser(), this.doneTypingInterval);
    // this.typingTimerLoading = setTimeout(() => this.showLoading(), 1000);
    this.userAvailable = false;
    this.isChecked = false;
    this.select_manual_organization = false;
    this.display_re_add = false;
  }

  clearTimeout(event) {
    // clearTimeout(this.typingTimer);
    // clearTimeout(this.typingTimerLoading);
  }

  checkUser() {
    const email: string = this.basicInfoForm.get('email').value;
    if (!email) {
      return;
    }
    if (email.length > 4 && this.basicInfoForm.get('email').valid) {
      let idIglesia: number;
      if (this.currentUser.isSuperUser) {
        idIglesia = 0;
      } else {
        idIglesia = this.currentUser.idIglesia;
      }
      this.userService.checkUserAvailable(email, idIglesia)
        .subscribe((response: any) => {
          this.loading = false;
          if (response.message && response.message === 'This user exists but not in your organization.') {
            if (!this.currentUser.isSuperUser) {
              this.iglesias = this.iglesias.filter(x => x.idIglesia === this.currentUser.idIglesia);
            }
            this.select_manual_organization = true;
            this.basicInfoForm.addControl('idUser', new FormControl(response.idUsuario));
            return;
          }
          if (response.message && response.message === 'This user exist but was deleted.') {
            // this.api.showToast(`This user in this organization was deleted. Please contact the organization's admin.`, ToastType.info);
            // const element : IndividualConfig = {
            //   closeButton: true
            // }
            this.basicInfoForm.addControl('idUserTemp', new FormControl(response.idUsuario));
            this.toastr.info(`This user in this organization was deleted.`, '', {
              closeButton: true
            });
            this.display_re_add = true;
            return;
          }
          this.userAvailable = true;
          this.errorChecking = false;
          this.isChecked = true;
          this.select_manual_organization = false;
          this.display_re_add = false;
          if(this.custom_select_country) {
            this.custom_select_country.ngOnInit();
          }
        }, error => {
          console.error(error);
          this.loading = false;
          if (!error.error.msg.Message) {
            this.userAvailable = false;
            this.errorChecking = false;
            this.select_manual_organization = false;
          } else {
            this.userAvailable = false;
            this.errorChecking = true;
          }
          this.isChecked = true;
        });
    }
  }

  showLoading() {
    const email: string = this.basicInfoForm.get('email').value;
    if (!email) {
      return;
    }
    if (email.length > 4 && this.basicInfoForm.get('email').valid) {
      this.loading = true;
    }
  }

  onRegister() {
    this.serverBusy = true;
    console.log(this.basicInfoForm);
    if (this.basicInfoForm.invalid) {
      this.serverBusy = false;
      return;
    }
    const payload = this.basicInfoForm.value;
    let subscription: Observable<any>;
    let message_success: string;
    let message_error: string;
    if (this.user) {
      if (payload.reset_password) {
        payload.pass = UserService.encryptPass(payload.password);
      }
      payload.idUsuario = this.user.idUser;
      message_success = `User: ${this.user.email}, updated successfully.`;
      message_error = `Error updating user.`;
      subscription = this.api.post(`users/updateUsuario`, payload);
      subscription
        .subscribe((data: any) => {
          const idUsuario = payload.idUsuario;
          if (data.phone_warning) {
            this.api.showToast(`The phone provided is already in use and will not be updated`, ToastType.info);
          }
          // const iglesia = this.userConfig.getIglesia();
          // const topic = iglesia.topic;
          // const device = this.userConfig.getDevice();
          this.api.showToast(`${message_success}`, ToastType.success);
          this.serverBusy = false;
          this.dismiss(data);
        }, err => {
          console.error(err);
          this.api.showToast(`${message_error}`, ToastType.error);
          this.serverBusy = false;
        });
    } else {
      payload.pass = UserService.encryptPass(payload.password);
      if (Array.isArray(payload.idIglesia)) {
        if (payload.idIglesia.length > 0) {
          payload.idIglesia = payload.idIglesia[0].idIglesia;
        } else {
          this.api.showToast(`Please select a valid organization.`, ToastType.info);
          this.serverBusy = false;
          return;
        }
      } else if (payload.idIglesia == null) {
        this.api.showToast(`Please select a valid organization.`, ToastType.info);
        this.serverBusy = false;
        return;
      }
      if (payload.idIglesia === 0) {
        this.api.showToast(`Please select a valid organization.`, ToastType.info);
        this.serverBusy = false;
        return;
      }
      if (Array.isArray(payload.idUserType)) {
        if (payload.idUserType.length > 0) {
          payload.idUserType = payload.idUserType[0].idUserType;
        } else {
          this.api.showToast(`Please select a valid role.`, ToastType.info);
          this.serverBusy = false;
          return;
        }
      } else if (payload.idUserType == null) {
        this.api.showToast(`Please select a valid role.`, ToastType.info);
        this.serverBusy = false;
        return;
      }
      if (payload.idUserType === 0) {
        this.api.showToast(`Please select a valid role.`, ToastType.info);
        this.serverBusy = false;
        return;
      }

      const value_to_verify = payload.telefono;
      const login_type = 'phone';
      this.userService.checkUserAvailable(value_to_verify, payload.idIglesia, login_type)
        .subscribe((response: any) => {
          if (response.message && response.message === 'This user exists but not in your organization.') {
            this.userService.api.showToast(`An user with this ${login_type} already exists.`, ToastType.info);
            this.serverBusy = false;
            return;
          }
          if (response.message && response.message === 'This user exist but was deleted.') {
            this.userService.api.showToast(`An user with this ${login_type} already exists.`, ToastType.info);
            this.serverBusy = false;
            return;
          }
          console.log(response);
          console.log('Email not exist');
          message_success = `User: ${payload.email}, created successfully.`;
          message_error = `Error creating user.`;
          payload.created_by = this.currentUser.idUsuario;
          subscription = this.api.post_old(`registerUsuario`, payload);
          subscription
            .subscribe((data: any) => {
              const idUsuario = payload.idUsuario;
              // const iglesia = this.userConfig.getIglesia();
              // const topic = iglesia.topic;
              // const device = this.userConfig.getDevice();
              this.api.showToast(`${message_success}`, ToastType.success);
              this.serverBusy = false;
              this.dismiss(data);
            }, err => {
              console.error(err);
              this.api.showToast(`${message_error}`, ToastType.error);
              this.serverBusy = false;
            });
        }, error => {
          console.error(error);
          // this.loading = false;
          if (!error.error.msg.Message) {
            // this.userAvailable = false;
            // this.errorChecking = false;
            // this.select_manual_organization = false;
            // // // // this.user_status.emit('checked_not_available');
            this.userService.api.showToast(`An user with this ${login_type} already exists.`, ToastType.info);
            this.serverBusy = false;
          } else {
            // this.userAvailable = false;
            // this.errorChecking = true;
            // // // // this.user_status.emit('checked_error');
            this.userService.api.showToast(`An user with this ${login_type} already exists.`, ToastType.info);
            this.serverBusy = false;
          }
          // this.isChecked = true;
        });
    }
  }

  async setUser(contact: any) {
    this.basic_form.resetForm();
    this.user = contact;
    this.user.location = this.formatFullAddress(this.user);
    if (!this.user.lat || !this.user.lat) {
      const pin_info = await GoogleAddressComponent.convert(this.user.location).catch(error => {
        console.error(error);
        return error;
      });
      if (JSON.stringify(pin_info) !== '{}') {
        const address = pin_info.address;
        address.idUser = this.user.idUser;
        this.api
          .post(`users/updateAddress`, address)
          .subscribe(response => {
          });
      }
    }
    this.basicInfoForm.patchValue({
      nombre: this.user.name,
      apellido: this.user.lastName,
      // tslint:disable-next-line: max-line-length
      password: 'JustAPass',
      calle: this.user.street,
      ciudad: this.user.city,
      provincia: this.user.state,
      zip: this.user.zipCode,
      isSuperUser: this.user.isSuperUser,
      isNewUser: false,
      telefono: this.user.cellphone,
      country_code: this.user.country_code,
      reset_password: false,
      location: this.user.location,
      country: this.user.country,
      lat: this.user.lat,
      lng: this.user.lng
    });
    // if (this.custom_select_country) {
    //   this.custom_select_country.ngOnInit();
    // }
    this.basicInfoForm.get('email').setValue(this.user.email);
    this.userAvailable = true;
    this.errorChecking = false;
    this.isChecked = true;
  }

  printEvent(event) {
    if (event) {
      this.basicInfoForm.patchValue({ password: '' });
    } else {
      this.basicInfoForm.patchValue({ password: 'JustAPass' });
    }
  }

  // Do not delete. It is used on another form.
  disableUnusedFields() {
    this.show_super_user_fields = false;

    this.multi_select.writeValue(this.iglesias.filter(x => x.idIglesia === this.iglesias[0].idIglesia));
  }

  linkUserToOrganization() {
    const email = this.basicInfoForm.get('email').value;
    const idIglesia = this.basicInfoForm.get('idIglesia').value[0].idIglesia;
    const idUserType = this.basicInfoForm.get('idUserType').value[0].idUserType;
    const idUsuario = this.basicInfoForm.get('idUser').value;

    const user = this.currentUser;
    let assigned_by_other = false;
    if (user.idUsuario !== 0) {
      assigned_by_other = true;
    }
    this.userService.checkUserAvailable(email, idIglesia)
      .subscribe((response: any) => {
        if (response.message) {
          if (response.message === 'This user exist but was deleted.') {
            this.api.showToast(`This user was deleted.`, ToastType.info);
            return;
          }
          if (response.message === 'This user exists but not in your organization.') {
            this.userService.registerUserInOrganization(assigned_by_other, user.idUsuario, response.idUsuario, idIglesia, idUserType)
              .subscribe(response_on_register => {
                this.api.showToast(`User added to ${this.currentUser.iglesia}.`, ToastType.success);
              }, error => {
                console.error(error);
                this.api.showToast(`Error adding the user to ${this.currentUser.iglesia}`, ToastType.error);
              });
          }
        } else {
          this.userService.registerUserInOrganization(assigned_by_other, user.idUsuario, response.idUsuario, idIglesia, 2)
            .subscribe(response_on_register => {
              this.api.showToast(`User added to ${this.currentUser.iglesia}.`, ToastType.success);
            }, error => {
              console.error(error);
              this.api.showToast(`Error adding the user to ${this.currentUser.iglesia}`, ToastType.error);
            });
        }
      }, error => {
        this.loading = false;
        this.api.showToast(`This user is already linked to this organization.`, ToastType.info);
      });
  }

  reAddUser() {
    const user = this.currentUser;
    let assigned_by_other = false;
    if (user.idUsuario !== 0) {
      assigned_by_other = true;
    }
    const idIglesia = this.currentUser.idIglesia;
    const idUsuario = this.basicInfoForm.get('idUserTemp').value;
    this.userService.reactivateUserInOrganization(idUsuario, idIglesia, true)
      .subscribe(response_on_register => {
        this.api.showToast(`User re-activated.`, ToastType.success);
        this.dismiss(response_on_register, true);
      }, error => {
        console.error(error);
        this.api.showToast(`Error adding the user to ${this.currentUser.iglesia}`, ToastType.error);
      });
  }

  public getAddress(item: AutocompleteResponseModel) {
    if (item) {
      if (item.address) {
        const element = {
          calle: item.address.street,
          ciudad: item.address.city,
          provincia: item.address.state,
          zip: item.address.zip_code,
          location: item.address.full_address,
          country: item.address.country,
          lat: item.address.lat,
          lng: item.address.lng,
        }
        this.basicInfoForm.get('location').setValue(item.address.full_address);
        this.basicInfoForm.patchValue(element);

        if (this.user) {
          this.user.location = item.address.full_address;
        }
      }
    }
  }

  formatFullAddress(user: any): string {
    let full_address = ``;
    if (user.street) {
      full_address = `${user.street}`
    }
    if (user.city) {
      full_address = `${full_address}, ${user.city}`
    }
    if (user.state) {
      full_address = `${full_address}, ${user.state}`
    }
    if (user.country) {
      full_address = `${full_address}, ${user.country}`
    }
    if (user.zip_code) {
      full_address = `${full_address}, ${user.zip_code}`
    }
    if (user.zipCode) {
      full_address = `${full_address}, ${user.zipCode}`
    }
    return full_address;
  }
}
