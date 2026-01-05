import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { GroupModel } from 'src/app/models/GroupModel';
import { AppComponent } from 'src/app/app.component';
import { ApiService } from 'src/app/services/api.service';
import { GroupsService } from 'src/app/services/groups.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register-in-group',
  templateUrl: './register-in-group.component.html',
  styleUrls: ['./register-in-group.component.scss']
})
export class RegisterInGroupComponent implements OnInit {

  full_form: FormGroup = new FormGroup({
    user_status: new FormControl(undefined, [Validators.required]),
    get_started_form: this.formBuilder.group({
      value_to_verify: ['', [Validators.required]],
      login_type: ''
    }),
    login_form: this.formBuilder.group({
      usuario: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    }),
    register_form: this.formBuilder.group({
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
      telefono: ['', Validators.required],
      country_code: ['', Validators.required],
      idUserType: new FormControl(2, [Validators.required]),
      is_available: new FormControl(false, [Validators.required, Validators.pattern(/^(?:1|y(?:es)?|t(?:rue)?|on)$/i)])
    }),
    additional_form: this.formBuilder.group({
      covid_quest: new FormControl(false, [Validators.required]),
      guests: new FormControl(0, [Validators.required, Validators.min(0)])
    })
  })

  get actual_user_status(): string {
    return this.full_form.get('user_status').value;
  }

  set actual_user_status(value: string) {
    this.full_form.get('user_status').setValue(value);
  }

  currentUser: User;
  logged_user: User;
  id_group_event: number;

  group_event: GroupModel;
  userSelectionList: any[];
  login_complete: boolean = false;

  display_already_member: boolean = false;
  user_info: any = {};
  group_info: any = {};
  show_detail_loading: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private app: AppComponent,
    private router: Router,
    private api: ApiService,
    private groupsService: GroupsService,
    private translate_service: TranslateService
  ) {
    this.currentUser = this.userService.getCurrentUser();
    this.id_group_event = this.route.snapshot.params.id;
  }

  ngOnInit() {
    this.getGroup();
  }

  async getGroup() {
    const group_response: any = await this.api.post(`groups/detail/${this.id_group_event}`, {
      idIglesia: 0,
      ignore_organization: true
    }).toPromise();
    console.log(group_response);
    if (group_response) {
      this.group_event = group_response.group;
      // this.checkUserInGroup(this.group);
      if (this.currentUser) {
        setTimeout(() => {
          this.app.menu.custom_logo_pic = this.group_event.organization_picture;
        }, 100);
      }

      const query_params = this.route.snapshot.queryParams;
      if (query_params.action === 'register') {
        const user = this.logged_user || this.currentUser;
        if (user) {
          this.groupsService.checkMemberInGroup(user.idUsuario, this.group_event.idGroup)
            .subscribe((response: any) => {
              console.log(response);
              this.user_info = response.user_info;
              this.group_info = response.group;
              if (response.msg.Code === 409) {
                const translate = this.translate_service.instant('groups.already_member');
                this.groupsService.api.showToast(translate, ToastType.success);
                this.display_already_member = true;
                this.actual_user_status = 'display_already_member';
                // this.login_complete = false;
              } else {
                // const translate = this.translate_service.instant('groups.you_were_added');
                this.actual_user_status = 'display_already_member';
                // this.groupsService.api.showToast(translate, false);
              }
              this.show_detail_loading = false;
            }, error => {
              console.error(error);
              this.groupsService.api.showToast('Error trying to add you to this group', ToastType.error);
            });
        } else {
          this.show_detail_loading = false;
        }
      } else {
        this.actual_user_status = 'group_detail';
      }

    }

  }

  getUserStatus(event: string) {
    this.full_form.get('user_status').setValue(event);
    console.log(this.full_form);
    this.full_form.get('login_form').reset();
    if (this.full_form.get('user_status').value === 'checked_ok') {
      this.full_form.get('register_form').get('idIglesia').setValue(this.group_event.idOrganization);
      this.full_form.get('register_form').get('idUserType').setValue(2);
      console.log(this.full_form.get('register_form'));
    }

  }

  loginResponse(response) {
    if (response) {
      console.log(response);
      this.currentUser = response;
      this.logged_user = response;
      this.ngOnInit();
    }
  }

  cancelForm() {
    this.full_form.get('user_status').setValue(undefined);
  }

  cancelRegister() {
    // this.register_form.get('is_available').setValue(false);
    // this.display_full_form = false;
    // const email = this.register_form.get('email').value;
    // this.register_form.patchValue({ email });

    this.full_form.get('register_form').reset();
    this.full_form.get('register_form').get('idIglesia').setValue(this.group_event.idOrganization);
    this.full_form.get('register_form').get('idUserType').setValue(2);
    this.full_form.get('user_status').reset();
  }

  selectLoginUser(user: any, should_redirect?: boolean) {
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
    this.login_complete = true;

    setTimeout(() => {
      this.app.footer.currentUser = user;
      this.app.menu.currentUser = user;
    });
    if (should_redirect) {
      this.handleRedirectByRole(user);
    } else {
      this.ngOnInit();
    }
  }

  showHowManyForm(user) {
    console.log(user);
    this.full_form.get('user_status').setValue('how_many');
  }

  handleRedirectByRole(user: User) {
    if (user.idUserType === 1 || user.isSuperUser) {
      if (user.isSuperUser) {
        this.router.navigate(['/admin/organization']);
      } else {
        this.router.navigate(['dashboard']);
      }
      setTimeout(() => {
        this.app.footer.currentUser = user;
        this.app.menu.currentUser = user;
        this.app.menu.custom_logo_pic = this.group_event.organization_picture;
      });
    } else {
      this.router.navigate([`/user-profile/details/${user.idUsuario}`]);
    }
  }

  sendRequestToJoin() {
    if (this.group_info.is_external) {
      window.open(this.group_info.external_url, '_blank');
    } else {
      this.groupsService.sendRequestToJoin(this.currentUser.idUsuario, this.group_info.idGroup)
        .subscribe((response: any) => {
          const message = this.translate_service.instant(response.response.message);
          this.groupsService.api.showToast(message, ToastType.info);
        }, error => {
          console.error(error);
          this.groupsService.api.showToast('Error trying to add you to this group', ToastType.error);
        });
    }
  }

  getCover() {
    if (this.group_event) {
      if (this.group_event.picture) {
        return `${this.groupsService.api.baseUrl}${this.group_event.picture}`;
      }
      return `/assets/img/default-image.jpg`;
    } else {
      return `/assets/img/default-image.jpg`;
    }
  }

  openResetPassword(event) {
    this.actual_user_status = 'reset_password';
  }
}
