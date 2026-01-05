import { UserService } from 'src/app/services/user.service';
import { ApiService } from 'src/app/services/api.service';
import { FormBuilder, Validators, FormGroup, NgForm, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { ToastType } from 'src/app/login/ToastTypes';
import { Component, OnInit, EventEmitter, Output, ViewChild, Input } from '@angular/core';

@Component({
  selector: 'app-article-category-form',
  templateUrl: './article-category-form.component.html',
  styleUrls: ['./article-category-form.component.scss']
})
export class ArticleCategoryFormComponent implements OnInit {

  // tslint:disable-next-line: no-output-rename no-output-on-prefix
  @Output('onDismiss') onDismiss = new EventEmitter();
  @ViewChild('basic_form') basic_form: NgForm;
  @Input() iglesias: any[];
  @Input('idOrganization') idOrganization: number;

  category: any;

  basicInfoForm: FormGroup = this.formBuilder.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    idIglesia: ['', Validators.required],
    idCategoriaArticulo: [''],
    sort_type: new FormControl('date_desc')
  });

  serverBusy: boolean = false;
  user;

  constructor(
    private formBuilder: FormBuilder,
    private api: ApiService,
    private userService: UserService
  ) {
    this.user = this.userService.getCurrentUser();
  }

  ngOnInit() {
    if(!this.idOrganization){
      if(this.user){
        this.idOrganization = this.user.idIglesia;
      }
    }
    this.basicInfoForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      idIglesia: [this.idOrganization, Validators.required],
      idCategoriaArticulo: [''],
      sort_type: new FormControl('date_desc')
    });
    this.basicInfoForm.get('idIglesia').setValue(this.idOrganization);

  }

  onRegister() {
    this.serverBusy = true;
    const payload = this.basicInfoForm.value;

    let subscription: Observable<any>;
    let message_success: string;
    let message_error: string;
    if (this.category) {
      message_success = `Category updated successfully.`;
      message_error = `Error updating category.`;
      subscription = this.api.patch(`articulos/categories/${this.category.idCategoriaArticulo}`, payload);
    } else {
      if (payload.idIglesia == null) {
        this.api.showToast(`Please select a valid organization.`, ToastType.info);
        this.serverBusy = false;
        return;
      }
      message_success = `Category created successfully.`;
      message_error = `Error creating category.`;
      subscription = this.api.post(`articulos/categories`, payload);
    }

    subscription
      .subscribe((data: any) => {
        this.api.showToast(`${message_success}`, ToastType.success);
        this.serverBusy = false;
        this.dismiss(data);
      }, err => {
        console.error(err);
        this.api.showToast(`${message_error}`, ToastType.error);
        this.serverBusy = false;
      });
  }

  dismiss(response?) {
    if (response) {
      this.onDismiss.emit(response);
    } else {
      this.onDismiss.emit();
    }
    this.serverBusy = false;
  }

  setCategory(contact_category: any) {
    this.category = contact_category;
    this.basicInfoForm.patchValue(contact_category);
  }

}
