import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { User } from '../interfaces/user';
import { UserService } from '../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MatSnackBar } from '@angular/material';
import { ToastType } from './ToastTypes';
import { FacebookLoginProvider, SocialUser, AuthService } from 'angularx-social-login';
import { AppComponent } from '../app.component';
import { MaskApplierService, MaskPipe } from 'ngx-mask';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  return_url: string;

  constructor(
    private userService: UserService,
    private router: Router,
    public formBuilder: FormBuilder,
    private api: ApiService,
    public modal: NgxSmartModalService,
    public snackbar: MatSnackBar,
    private authService: AuthService,
    private app: AppComponent,
    private mask_service: MaskApplierService,
    private activated_route: ActivatedRoute,
    private translate_service: TranslateService
  ) { }

  public prodServerUrl: string = 'https://iglesia-tech-api.e2api.com';

  public user = new User();
  public isSuperUser: string;
  public formMode: string = 'enterCorreo'; // or 'password_recovery'
  public sendingRequest: boolean = false;
  public loading: boolean = false;
  public btnLogin: string = 'Login_Button';
  public btnRecover: string = 'generals.send';
  public correoDelUsuario: string;
  private socialUser: SocialUser;
  private loggedIn: boolean;

  // User selection list
  public userSelectionList: any[];

  public loginCorreoFormGroup: FormGroup = this.formBuilder.group({
    Email: ['', [Validators.required]],
    login_type: ['']
  });

  public recoverPasswordFormGroup: FormGroup = this.formBuilder.group({
    email: [
      '',
      [Validators.required, Validators.pattern('^[^@]+@[^@]+.[a-zA-Z]{2,}$')]
    ]
  });

  public loginPasswordFormGroup: FormGroup = this.formBuilder.group({
    Pass: ['', Validators.required]
  });

  /**
   * Start login process
   * @param usuario
   * @param pass
   */
  loginAction(usuario: string, pass: string) {
    let userTechApp: any;
    this.userService.loginAction(usuario, pass).subscribe(
      (success: any) => {
        if (success.usuariosTechApp) {
          userTechApp = success.usuariosTechApp[0]; // Json from response API
        } else if (success.usuarioTechApp) {
          userTechApp = success.usuarioTechApp;
        } else {
          return this.api.showToast('No user found!', ToastType.error);
        }

        // Save the values from json response and send in the userService for method getCurrentUser(),
        // for obtain idIglesia and use in Contact
        localStorage.setItem(
          'currentUser',
          JSON.stringify({
            idIglesia: userTechApp.idIglesia,
            usuario: userTechApp.email,
            pass
          })
        );
        // localStorage.setItem('token', this.user.token); // Where response send token save this way for use
        this.router.navigate(['dashboard']);
      },
      error => {
        this.api.showToast(error, ToastType.error);

        // Handle error
      }
    );
  }

  loginSuperAction(usuario: string, pass: string) {
    this.userService.loginSuperAction(usuario, pass).subscribe(
      (success: any) => {
        if (success.superUser) {
          const superUser = success.superUser;
          console.log(superUser);
          // Save the values from json response and send in the userService for method getCurrentUser()
          localStorage.setItem(
            'currentUser',
            JSON.stringify({ usuario: superUser.usuario, pass: superUser.pass })
          );
          // localStorage.setItem('token', this.user.token);
          this.router.navigate(['dashboard']);
        }
      },
      error => this.api.showToast(error, ToastType.error)
    );
  }

  // where need load data from external place
  async ngOnInit() {
    console.log(this.activated_route);
    console.log(this.router);
    this.activated_route.queryParamMap
      .subscribe(query_params => {
        const token = query_params.get('token');
        this.return_url = query_params.get('returnUrl');
        if (token) {
          this.loginWithToken(token);
        } else {
          const currentUser: any = this.userService.getCurrentUser();
          if (currentUser && currentUser.idUsuario) {
            this.handleRedirectByRole(currentUser);
          }
        }
      });

    // this.authService.authState.subscribe((user) => {
    //   if (user) {
    //     this.handleSignIn(user);
    //   }
    // });
  }

  handleRedirectByRole(user: User) {
    console.log(user);

    if (user.idUserType === 1 || user.isSuperUser) {
      if (this.return_url) {
        this.router.navigate([this.return_url]);
      } else {
        if (user.isSuperUser) {
          this.router.navigate(['/admin/organization']);
        } else {
          this.router.navigate(['dashboard']);
        }
      }
      setTimeout(() => {
        if (this.app.footer) {
          this.app.footer.currentUser = user;
        }
        if (this.app.menu) {
          this.app.menu.currentUser = user;
        }
      });
    } else {
      setTimeout(() => {
        if (this.app.footer) {
          this.app.footer.currentUser = user;
        }
        if (this.app.menu) {
          this.app.menu.currentUser = user;
        }
      });
      this.router.navigate([`/user-profile/details/${user.idUsuario}`]);
    }
  }

  goRecoverPassword() {
    this.formMode = 'enterRecoverPassword';
    console.log(this.formMode);
  }
  backCorreo() {
    this.formMode = 'enterCorreo';
    this.correoDelUsuario = null;
  }
  backPassword() {
    this.formMode = 'enterPassword';
  }

  sendRecoveryEmail(form: FormGroup) {
    if (form.invalid) {
      console.log(form.value.RecoverEmail);
      return this.api.showToast('Invalid e-mail format.', ToastType.error);
    }

    if (form.value) {
      this.sendingRequest = true;
      this.loading = true;
      this.btnRecover = 'generals.loading';
      console.log(
        'imprime el correo para recuperar clave: ' + form.value.RecoverEmail
      );

      this.api.post(`users/user_password_reset`, form.value).subscribe(
        data => {
          console.log(data);
          form.reset();
        },
        error => {
          console.error(error);
          this.loading = false;
          this.btnRecover = 'generals.send';
          setTimeout(() => {
            this.sendingRequest = false;
          }, 5000);
        },
        () => {
          setTimeout(() => {
            this.sendingRequest = false;
          }, 5000);
          this.loading = false;
          this.btnRecover = 'generals.send';
          const message = this.translate_service.instant('users.recovery_email_sent');
          this.api.showToast(message,
            ToastType.info
          );
          this.backCorreo();
        }
      );
    } else {
      const message = this.translate_service.instant('generals.check_form');
      this.api.showToast(
        message,
        ToastType.error
      );
      this.loading = false;
      this.btnRecover = 'generals.send';
    }
  }

  loginCompleto(form: FormGroup) {
    if (form.invalid) {
      const message = this.translate_service.instant('generals.check_form');
      return this.api.showToast(
        message,
        ToastType.error
      );
    }
    // Start login progress
    this.loading = true;
    this.btnLogin = 'generals.loading';
    // Hash Pwd. Note: Please do this on server side
    console.log(this.btnLogin);

    const hashedPwd: string = UserService.encryptPass(form.value.Pass);
    this.api
      .post(`users/login_v2`, {
        usuario: this.correoDelUsuario,
        pass: hashedPwd
      })
      .subscribe(
        (data: any) => {
          this.handleLoginData(data);
        },
        err => {
          let type: string = this.loginCorreoFormGroup.get('login_type').value;
          type = `${type[0].toUpperCase()}${type.substring(1)}`;
          const message = this.translate_service.instant('users.auth_incorrect');
          this.api.showToast(message, ToastType.error);
          this.loading = false;
          this.btnLogin = 'Login_Button';
          console.log(this.loading);
        },
        () => (this.loading = false)
      );
  }

  loginWithToken(login_token: string) {
    // Start login progress
    this.loading = true;
    this.btnLogin = 'generals.loading';
    // Hash Pwd. Note: Please do this on server side
    console.log(this.btnLogin);
    this.api
      .post(`users/token_login`, {
        login_token
      })
      .subscribe(
        (data: any) => {
          this.handleLoginData(data);
        },
        err => {
          console.log(err);
          this.api.showToast(`This login token already expired`, ToastType.error);
          this.loading = false;
          this.btnLogin = 'generals.loading';
          console.log(this.loading);
        },
        () => (this.loading = false)
      );
  }

  handleLoginData(data: any) {
    console.log(data);
    // Open user selection modal if needed
    if (data.users.length > 0) {
      const user = data.users[0];
      if (!user.estatus) {
        this.api.showToast('This user was deleted.', ToastType.error);
        return;
      }
    }
    const active_users: any[] = data.users.filter(user => user.code !== 403);
    if (active_users.length > 1) {
      if (active_users[0].isSuperUser) {
        this.userSelectionList = active_users;
        this.selectLoginUser(active_users[0]);
      } else {
        this.userSelectionList = active_users;
        this.modal.getModal('selectUserModal').open();
      }
    } else if (active_users.length === 1) {
      this.selectLoginUser(active_users[0]);
    } else {
      this.api.showToast('Success', ToastType.success);
    }
  }

  CorreoLogin(form: FormGroup) {
    if (form.invalid) {
      console.log(form);
      const message = this.translate_service.instant('generals.check_form');
      this.api.showToast(message, ToastType.error);
      return;
    }
    const value_to_verify: string = this.loginCorreoFormGroup.get('Email').value;
    let type: string = value_to_verify.includes('@') ? 'email' : 'phone';
    if (this.loginCorreoFormGroup.get('login_type')) {
      this.loginCorreoFormGroup.get('login_type').setValue(type);
    } else {
      this.loginCorreoFormGroup.addControl('login_type', new FormControl(type))
    }
    this.loginCorreoFormGroup.get('login_type').setValue(type);
    if (type === 'email') {
      const form_control = new FormGroup({
        value_to_verify: new FormControl(value_to_verify, [
          Validators.required,
          Validators.pattern(new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/))
        ])
      });
      if (form_control.get('value_to_verify').valid) {
        // continue
        // this.continueHandleLogin();
        this.formMode = 'enterPassword';
        this.correoDelUsuario = form.value.Email;
      } else {
        this.userService.api.showToast(`The email is not correct.`, ToastType.info);
      }
    } else {
      let only_numbers = true;
      let clean_text = value_to_verify.replace(/\s/g, '');
      clean_text = this.userService.api.remove_mask(clean_text);

      if (clean_text.length === 10) {
        for (let index = 0; index < clean_text.length; index++) {
          const char = clean_text[index];
          if (Number.isNaN(Number(char))) {
            only_numbers = false;
          }
        }
        if (only_numbers) {
          this.mask_service.maskExpression = '(000) 000-0000';
          this.mask_service.dropSpecialCharacters = false;
          const pipe = new MaskPipe(this.mask_service);
          const format_phone = pipe.transform(clean_text, this.mask_service.maskExpression);
          this.loginCorreoFormGroup.get('Email').setValue(format_phone);
          // continue
          // this.continueHandleLogin();
          this.formMode = 'enterPassword';
          this.correoDelUsuario = form.value.Email;
        } else {
          const message = this.translate_service.instant('users.phone_should_only_numbers');
          this.userService.api.showToast(message, ToastType.info);
        }
      } else {
        const message = this.translate_service.instant('users.phone_should_has_10_digits');
        this.userService.api.showToast(message, ToastType.info);
      }
      return;
    }
  }


  /**
   * Cancel login event
   */
  cancelLogin() {
    this.loginCorreoFormGroup.reset();
    this.userSelectionList = [];
    this.snackbar.open(`You cancelled the login process!`, null, {
      duration: 3000
    });
  }

  async selectLoginUser(user: any) {
    user._loading = true;
    const userStr: string = JSON.stringify(user);
    // Store the current user on local storage
    localStorage.setItem('currentUser', userStr);
    console.log("login hecho")
    this.api
      .get(`iglesias/checkStripeExpiration`, { idIglesia: user.idIglesia })
      .subscribe(
        (data: any) => {
          console.log(data.response[0].is_valid)
          user.is_valid = data.response[0].is_valid
          const userStr: string = JSON.stringify(user);
          localStorage.setItem('currentUser', userStr)
        },
        (err: any) => {
          user.is_valid = false
          const userStr: string = JSON.stringify(user);
          localStorage.setItem('currentUser', userStr)
        },
        () => {
          let companies: any[];
          if (this.userSelectionList) {
            companies = this.userSelectionList.map(user => user.idIglesia);
          } else {
            companies = [user.idIglesia];
          }
          localStorage.setItem('companies', JSON.stringify(companies));
          this.handleRedirectByRole(user);
        }
      );
  }

  /** SOCIAL AUTH */

  /**
   * Facebook login
   */
  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  handleSignIn(user) {
    this.api.post(`facebook/login`, { email: user.email })
      .subscribe((response: any) => {
        this.selectLoginUser(response);
      });
  }
}
