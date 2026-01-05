import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css']
})
export class PasswordResetComponent implements OnInit {

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public api: ApiService,
    public formBuilder: FormBuilder
  ) {
    this.token = this.route.snapshot.params['token']
    this.userType = this.route.snapshot.queryParams['user_type']
  }

  public token: string
  public userType: string
  public valiToken: boolean
  public loading: boolean = true
  public passInputType: string = 'password'
  public changingPass: boolean = false

  // Recovery form
  public passwordForm: FormGroup = this.formBuilder.group({
    token: ['', Validators.required],
    user_type: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]]
  })


  ngOnInit() {
    this.passwordForm.patchValue({
      user_type: this.userType,
      token: this.token
    })
    this.checkToken()
  }

  togglePassInput() {
    if (this.passInputType == 'password') {
      this.passInputType = 'text'
    } else {
      this.passInputType = 'password'
    }
  }

  checkToken() {
    this.api.post(`users/check_password_reset_token/`, {
      token: this.token,
      user_type: this.userType
    })
      .subscribe(
        data => {
          console.log(data)
          this.valiToken = true
        },
        error => {
          console.error(error)
          this.loading = false
        },
        () => {
          this.loading = false
        }
      )
  }

  updatePassword(form: FormGroup) {
    if (form.valid) {
      this.changingPass = true
      this.api.post(`users/update_password_with_token/`, form.value)
        .subscribe(
          data => {
            console.log(data)
            alert('Your password was reset successfuly.\nYou will be redirected to the login page.')
            this.router.navigate(['/login'])
          },
          error => {
            console.error(error)
            this.changingPass = false
            alert(`Could not change password.\nPlease contact technical support.`)
          },
          () => {
            this.changingPass = false
          }
        )
    }
  }

}
