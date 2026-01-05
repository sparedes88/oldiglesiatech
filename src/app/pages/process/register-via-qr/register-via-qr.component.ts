import { UserService } from 'src/app/services/user.service';
import { FormBuilder, Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { User } from 'src/app/interfaces/user';
import { ApiService } from 'src/app/services/api.service';

export class ProcessRegisterModel {
  action: string;
  idOrganization: number;
  level_id: number;
  level_name: string;
  process_id: number;
  process_name: string;
  step_id: number;
  step_name: string;
}

@Component({
  selector: 'app-register-via-qr',
  templateUrl: './register-via-qr.component.html',
  styleUrls: ['./register-via-qr.component.scss']
})
export class RegisterViaQRComponent implements OnInit {

  process_info: ProcessRegisterModel;
  currentUser: User;
  logged_user: User;

  userSelectionList: any[];

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

  is_loading: boolean = true;

  constructor(
    private router: Router,
    private activated_route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private api: ApiService
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  get actual_user_status(): string {
    return this.full_form.get('user_status').value;
  }

  set actual_user_status(value: string) {
    this.full_form.get('user_status').setValue(value);
  }

  ngOnInit() {
    this.activated_route.queryParams.subscribe((params: any) => {
      this.process_info = Object.assign({}, params);
      const ids_params = Object.keys(params).filter(key => key.includes('id'));
      ids_params.forEach(param => {
        this.process_info[param] = Number(this.process_info[param]);
      });
    });

    this.checkUserProcess();
  }

  checkUserProcess() {
    this.is_loading = true;
    if (this.currentUser) {
      this.getUserProcess();
    } else {
      this.actual_user_status = undefined;
      this.is_loading = false;
    }
  }

  async getUserProcess() {
    const idProcess = this.process_info.process_id;
    const idRequisito = this.process_info.step_id;
    const idNivel = this.process_info.level_id;
    const user_in_process: any = await this.api
      .get(`reportModules/userProcess`, {
        idProcess,
        idIglesia: this.process_info.idOrganization,
      }).toPromise();
    if (user_in_process) {
      const user_process = user_in_process.find(user_process => user_process.idUser === this.currentUser.idUsuario);
      if (user_process) {
        if (!user_process.assigned) {
          this.assignUserToProcess();
        }
        const user_step_accomplished: any = await this.api
          .get(`reportModules/completedUserSteps`, {
            idRequisito,
            idNivel,
            idProcess,
            idIglesia: this.process_info.idOrganization
          }).toPromise();

        if (user_step_accomplished) {
          if (user_step_accomplished.length > 0) {
            const users = user_step_accomplished[0].users;
            const user_step = users.find(user => user.idUser === this.currentUser.idUsuario);
            if (user_step) {
              if (user_step.cumplido) {
                this.actual_user_status = 'display_already_member'
                this.accomplishedStepByUser(true);
              } else {
                this.accomplishedStepByUser();
              }
            } else {
              this.accomplishedStepByUser();
            }
            this.is_loading = false;
          }
        }
      }
    }
  }
  accomplishedStepByUser(prevent_reload?: boolean) {
    // this.loading = true;
    this.api
      .post("reportModules/completeStep", {
        idRequisito: this.process_info.step_id,
        idUsuario: this.currentUser.idUsuario,
        cumplido: true,
        created_by: this.currentUser.idUsuario,
        origin_id: 1
      })
      .subscribe((data: any) => {
        if(!prevent_reload){
          this.ngOnInit();
        }
      },
        err => {
          console.error(err);
        }
      );
  }

  assignUserToProcess() {
    this.api
      .post(`reportModules/assignUserProcess`, {
        idProcess: this.process_info.process_id,
        idUser: this.currentUser.idUsuario,
        idCreateUser: this.currentUser.idUsuario
      })
      .subscribe(
        (data: any) => {
          this.getUserProcess();
        },
        err => console.error(err)
      );

  }

  getUserStatus(event: string) {
    this.full_form.get('user_status').setValue(event);
    this.full_form.get('login_form').reset();
    if (this.full_form.get('user_status').value === 'checked_ok') {
      this.full_form.get('register_form').get('idIglesia').setValue(this.process_info.idOrganization);
      this.full_form.get('register_form').get('idUserType').setValue(2);
    }
  }

  cancelForm() {
    this.full_form.get('user_status').setValue(undefined);
  }

  cancelRegister() {
    this.full_form.get('register_form').reset();
    this.full_form.get('register_form').get('idIglesia').setValue(this.process_info.idOrganization);
    this.full_form.get('register_form').get('idUserType').setValue(2);
    this.full_form.get('user_status').reset();
  }

  loginResponse(user) {
    if (user) {
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
      // this .login_complete = true;
      // this.on_login_success.emit(this.currentUser);
      this.ngOnInit();
    }
  }

  handleRedirectByRole(user: User) {
    if (user.idUserType === 1 || user.isSuperUser) {
      if (user.isSuperUser) {
        this.router.navigate(['/admin/organization']);
      } else {
        this.router.navigate(['dashboard']);
      }
    } else {
      this.router.navigate([`/user-profile/details/${user.idUsuario}`]);
    }
  }

  openResetPassword(event) {
    this.actual_user_status = 'reset_password';
  }

}
