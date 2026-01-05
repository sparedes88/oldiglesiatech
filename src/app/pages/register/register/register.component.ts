import { DashboardComponent } from './../../dashboard/dashboard.component';
import { COUNTRIES_DB, Country } from '@angular-material-extensions/select-country';
import { AutocompleteResponseModel } from './../../../component/google-places/google-places.component';
import { ToastType } from './../../../login/ToastTypes';
import { OrganizationService } from './../../../services/organization/organization.service';
import { FormGroup, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';
import { AppComponent } from 'src/app/app.component';
import { Router } from '@angular/router';
import { time } from 'console';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, AfterViewInit {

  activityForm: FormGroup;
  currentUser: User;
  show_detail_loading: boolean = false;
  init_map: boolean = false;

  country: Country;

  constructor(
    private organizationService: OrganizationService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private app: AppComponent,
    private router: Router
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  ngOnInit() {
    this.init_map = false;
    this.activityForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      // tslint:disable-next-line: max-line-length
      email: ['', [Validators.required, Validators.pattern(new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/))]],
      organization_name: ['', Validators.required],
      password: ['', Validators.required],
      repeat_password: ['', Validators.required],
      city: ['', Validators.required],
      street: ['', Validators.required],
      zip_code: [''],
      state: ['', Validators.required],
      country: ['', Validators.required],
      country_code: ['', Validators.required],
      lat: ['', Validators.required],
      lng: ['', Validators.required],
      location: ['']
    });
  }

  ngAfterViewInit() {
    console.log('after view');

    setTimeout(() => {
      this.init_map = true;
    }, 250);
  }

  reloadMap() {
    this.init_map = false;
    setTimeout(() => {
      this.init_map = true;
    }, 250);
  }

  registerOrganization(form: FormGroup) {
    this.show_detail_loading = true;
    if (form.invalid) {
      this.organizationService.api.showToast(`Please check all the required fields.`, ToastType.info);
      this.show_detail_loading = false;
      return;
    }
    const payload = form.value;

    this.userService.checkUserAvailable(payload.email, 0)
      .subscribe((response: any) => {
        if (response === true) {
          // not exist
          if (payload.password === payload.repeat_password) {
            this.organizationService.registerOrganization(payload)
              .subscribe(response_register => {
                this.makeLogin(payload);
              }, error => {
                console.error(error);
              });
          } else {
            this.show_detail_loading = false;
            this.organizationService.api.showToast(`The passwords don't match.`, ToastType.info);
          }
        } else if (response.message) {
          this.show_detail_loading = false;
          this.organizationService.api.showToast(`This email is already register in out system. Please try with other email.`, ToastType.error);
        }
      }, error => {
        console.error(error);
        this.show_detail_loading = false;
        this.organizationService.api.showToast(`Error trying to check if this email is available. Please try again in a few seconds.`, ToastType.error);
      });

  }
  makeLogin(payload: any) {
    const hashedPwd: string = UserService.encryptPass(payload.password);

    this.organizationService.api
      .post(`users/login_v2`, {
        usuario: payload.email,
        pass: hashedPwd
      })
      .subscribe(
        (data: any) => {
          // Open user selection modal if needed
          if (data.users.length > 0) {
            const user = data.users[0];
            if (!user.estatus) {
              this.organizationService.api.showToast('This user was deleted.', ToastType.error);
              this.show_detail_loading = false;
              return;
            }
          }
          const active_users: any[] = data.users.filter(user => user.code !== 403);
          if (active_users.length > 1) {
            this.selectLoginUser(active_users[0]);
          } else if (active_users.length === 1) {
            this.selectLoginUser(active_users[0]);
          } else {
            this.organizationService.api.showToast('Success', ToastType.success);
            this.show_detail_loading = false;
          }
        },
        err => {
          this.organizationService.api.showToast('E-mail or password incorrect', ToastType.error);
          this.show_detail_loading = false;
          // this.loading = false;
          // this.btnLogin = 'Login';
        }
      );
  }

  selectLoginUser(user: any) {
    user._loading = true;
    const userStr: string = JSON.stringify(user);
    // Store the current user on local storage
    localStorage.setItem('currentUser', userStr);

    let companies: any[];
    companies = [user.idIglesia];


    localStorage.setItem('companies', JSON.stringify(companies));

    this.handleRedirectByRole(user);
  }

  handleRedirectByRole(user: User) {
    if (user.idUserType === 1 || user.isSuperUser) {
      // if (user.isSuperUser) {
      //   this.router.navigate(['/admin/organization']);
      // } else {
      //   this.router.navigate([`/organization-profile/main/${user.idIglesia}/inicio`]);
      // }
      // this.router.navigate([`/register/${user.idIglesia}/disclaimer`]);
      this.router.navigate([`/dashboard`]);
      setTimeout(() => {
        this.app.footer.currentUser = user;
        this.app.menu.currentUser = user;
        this.organizationService.api.showToast('Organization created successfully. Please go to Content to Start to set your organization app.', ToastType.success);
        this.show_detail_loading = false;
      }, 200);
    } else {
      this.router.navigate([`/user-profile/details/${user.idUsuario}`]);
    }
  }

  public getAddress(item: AutocompleteResponseModel) {
    if (item) {
      if (item.address) {
        this.activityForm.get('location').setValue(item.address.full_address);
        this.activityForm.patchValue(item.address);
        console.log(this.activityForm);

      }
    }
  }

  printFormValue() {
    console.log(this.activityForm);
    console.log(this.activityForm.value);

  }

}
