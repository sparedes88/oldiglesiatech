import { UserService } from './../../../services/user.service';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-register-in-organization-form',
  templateUrl: './register-in-organization-form.component.html',
  styleUrls: ['./register-in-organization-form.component.scss']
})
export class RegisterInOrganizationFormComponent implements OnInit {

  idOrganization = undefined;
  organization: any = {};
  registered: boolean = false;
  exists: boolean = false;
  logged: boolean = false;
  loading: boolean = false;
  facebook = {
    FB: {},
    model: {},
    scope: {}
  };
  login_token: string;

  langDB = undefined;
  currentLang = 'en';
  lang: any;

  loginForm: FormGroup = new FormGroup({
    telefono: new FormControl(undefined, []),
    email: new FormControl(undefined, [Validators.email]),
    password: new FormControl(undefined, [Validators.required, Validators.minLength(6)]),
    login_type: new FormControl('', [Validators.required]),
  });
  userForm: FormGroup = new FormGroup({
    nombre: new FormControl(undefined, [Validators.required]),
    apellido: new FormControl(undefined, [Validators.required]),
    email: new FormControl(undefined, [Validators.required, Validators.email]),
    sexo: new FormControl('', [Validators.required]),
    telefono: new FormControl(undefined, [Validators.required]),
    country_code: new FormControl(undefined, [Validators.required]),
    password: new FormControl(undefined, [Validators.required, Validators.minLength(6)]),
    passConfirm: new FormControl(undefined, [Validators.required, Validators.minLength(6)]),
    idUserType: new FormControl(2),
    idIglesia: new FormControl(undefined, [Validators.required]),
    ciudad: new FormControl('City'),
    calle: new FormControl('Street'),
    provincia: new FormControl('state'),
    estadoCivil: new FormControl('Soltero'),
    niveles: new FormArray([]),
    categorias: new FormArray([]),
  });

  constructor(
    private api: ApiService,
    private activated_route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.idOrganization = this.activated_route.snapshot.params.id;
    this.currentLang = this.activated_route.snapshot.queryParams.lang || "en";
    this.getLangs();
    this.getIglesia();
  }
  getIglesia() {
    this.api.get(
      `getIglesiaFullData`, { idIglesia: this.idOrganization }
    )
      .subscribe((response: any) => {
        console.log(response);

        this.organization = response.iglesia;
      }, (error) => {
        console.error(error);
      });
  }


  getLangs() {
    this.api
      .get("public/langs")
      .subscribe((response: any) => {
        this.langDB = response;
        console.log(response);
        this.lang = this.getLang();
      }, (error) => {
        console.log(error.response);
      });
  }

  getLang() {
    if (this.langDB && this.currentLang) {
      const lang = this.langDB.find((l) => l.lang == this.currentLang);
      console.log(lang);
      return lang;
    }
    return {
      keys: {},
    };
  }

  registerUser() {
    if (this.userForm.value.password != this.userForm.value.passConfirm) {
      return alert(this.lang.keys["verify_password"]);
    }
    console.log(this.userForm.value);

    if (
      this.userForm.value.telefono.includes("(") &&
      this.userForm.value.telefono.includes(")") &&
      this.userForm.value.telefono.includes("-") &&
      this.userForm.value.telefono.includes(" ")
    ) {
      // correct format
      if (this.userForm.value.telefono.length != 14) {
        return alert(this.lang.keys["phone_incomplete"]);
      }
    } else {
      return alert(this.lang.keys["incorrect_format"]);
    }
    // Set loading state
    this.loading = true;

    this.api
      .post(
        `users/checkUser/`,
        {
          usuario: this.userForm.value.email,
          idIglesia: this.idOrganization,
          login_type: "email",
        }
      )
      .subscribe((response: any) => {
        if (
          (response.message &&
            response.message ===
            "This user exists but not in your organization.") ||
          (response.message &&
            response.message === "This user exist but was deleted.")
        ) {
          this.loading = false;
          this.loading = false;
          this.exists = true;
          const message = `${this.lang.keys.user_with_email_exists}. ${this.lang.keys.make_login_instead}`;
          const confirmation = confirm(message);
          if (confirmation) {
            this.loginForm.get('login_type').setValue("Email");
            this.loginForm.get('telefono').setValue("");
            this.loginForm.get('email').setValue(this.userForm.value.email);
            return;
          } else {
            this.exists = false;
            return;
          }
        } else {
          // Check Phone
          this.api
            .post(
              `users/checkUser/`,
              {
                usuario: this.userForm.value.telefono,
                idIglesia: this.idOrganization,
                login_type: "phone",
              }
            )
            .subscribe((response: any) => {
              if (
                (response.message &&
                  response.message ===
                  "This user exists but not in your organization.") ||
                (response.message &&
                  response.message === "This user exist but was deleted.")
              ) {
                this.loading = false;
                this.exists = true;
                const message = `${this.lang.keys.user_with_phone_exists}. ${this.lang.keys.make_login_instead}`;
                const confirmation = confirm(message);
                if (confirmation) {
                  this.loginForm.get('login_type').setValue("Phone");;
                  this.loginForm.get('email').setValue('');;
                  this.loginForm.get('telefono').setValue(this.userForm.value.telefono);
                  return;
                } else {
                  this.exists = false;
                  return;
                }
              }

              // Set id iglesia
              this.userForm.value.idIglesia = this.idOrganization;

              // Crypt pass
              this.userForm.value.pass = UserService.encryptPass(
                this.userForm.value.password
              );
              const payload = this.userForm.value;
              payload.create_token = true;
              this.api
                .post(
                  `insertUsuario/`,
                  this.userForm.value
                )
                .subscribe((response: any) => {
                  this.registered = true;
                  this.loading = false;
                  this.login_token = response.login_token;
                }, (error) => {
                  this.registered = true;
                  this.loading = false;
                });
            }, (error) => {
              return alert(this.lang.keys["user_with_phone_exists"]);
              this.loading = false;
            });
        }
      }, (error) => {
        return alert(this.lang.keys["user_with_email_exists"]);
        this.loading = false;
      });
  }

  makeLogin() {
    this.loading = false;
    let user;
    if (this.loginForm.get('login_type').value === "Email") {
      user = this.loginForm.value.email;
    } else {
      user = this.loginForm.value.telefono;
    }
    const hashedPwd = UserService.encryptPass(this.loginForm.value.password);
    //this.userForm.create_token = true;
    this.api
      .post(`users/login_v2/`, {
        usuario: user,
        pass: hashedPwd,
      })
      .subscribe((response: any) => {
        if (response.users.length > 0) {
          const user = response.users[0];
          this.login_token = user.login_token;
          const url = `https://iglesiatech.app/login?token=${this.login_token}`;
          window.open(url, "_blank");
          this.logged = true;
          this.exists = false;
        }
        this.loading = false;
        // this.registered = false;
        // this.exists = false;
      }, (error) => {
        // this.registered = true;
        this.loading = false;
      });
  }

}
