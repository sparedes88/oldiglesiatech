import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserService } from "src/app/services/user.service";
import { MatSnackBar } from "@angular/material";
import { ApiService } from "src/app/services/api.service";
import { Observable } from "rxjs";

@Component({
  selector: "setup-wordpress",
  templateUrl: "./setup-wordpress.component.html",
  styleUrls: ["./setup-wordpress.component.scss"],
})
export class SetupWordpressComponent implements OnInit {
  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private snackbar: MatSnackBar,
    private api: ApiService
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  @Output() onSubmit = new EventEmitter();
  @Input() wordpressSettings: any;

  public currentUser: any;
  public loading: boolean = false;
  public wordpressSetingsForm: FormGroup = this.formBuilder.group({
    idIglesia: ["", Validators.required],
    wordpressUrl: ["", Validators.required],
    user: ["", Validators.required],
    token: ["", Validators.required],
  });

  ngOnInit() {
    this.wordpressSetingsForm.patchValue({
      idIglesia: this.currentUser.idIglesia,
    });
    console.log(this.wordpressSettings);
  }

  submitForm(form: FormGroup) {
    if (form.invalid) {
      return this.snackbar.open(`Please check the form and try again!`, "OK", {
        duration: 3000,
      });
    }

    let payload: any = form.value;
    payload.auth = `${payload.user}:${payload.token}`;

    let request: Observable<any>;

    if (this.wordpressSettings) {
      request = this.api.patch(
        `wordpress/${this.wordpressSettings.idIglesiaWordpress}`,
        payload
      );
    } else {
      request = this.api.post(`wordpress`, payload);
    }

    request.subscribe(
      (data: any) => {
        this.onSubmit.emit(data);
        this.snackbar.open(`Settings were saved!`, "OK", { duration: 3000 });
      },
      (err: any) => {
        console.error(err);
        return this.snackbar.open(
          `Please check the form and try again!`,
          "OK",
          {
            duration: 3000,
          }
        );
      }
    );
  }
}
