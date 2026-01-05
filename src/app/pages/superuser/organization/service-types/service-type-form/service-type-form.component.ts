import { environment } from 'src/environments/environment';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { DesignRequestImageModel } from './../../../../../models/DesignRequestModel';
import { UserService } from 'src/app/services/user.service';
import { ApiService } from 'src/app/services/api.service';
import { FormBuilder, Validators, FormGroup, NgForm, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { ToastType } from 'src/app/login/ToastTypes';
import { Component, OnInit, EventEmitter, Output, ViewChild, Input, NgZone } from '@angular/core';
import { OrganizationService } from 'src/app/services/organization/organization.service';

@Component({
  selector: 'app-service-type-form',
  templateUrl: './service-type-form.component.html',
  styleUrls: ['./service-type-form.component.scss']
})
export class ServiceTypeFormComponent implements OnInit {

  // tslint:disable-next-line: no-output-rename no-output-on-prefix
  @Output('onDismiss') onDismiss = new EventEmitter();
  @ViewChild('basic_form') basic_form: NgForm;
  @Input() iglesias: any[];

  service_type: any;

  basicInfoForm: FormGroup = this.formBuilder.group({
    nombre: ['', Validators.required],
    description: [''],
    idTipoServicio: [''],
    picture: new FormGroup({
      file: new FormControl(),
      blob: new FormControl(),
      url: new FormControl(),
      type: new FormControl()
    })
  });

  serverBusy: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private api: ApiService,
    private userService: UserService,
    private ngZone: NgZone,
    private organizationService: OrganizationService
  ) { }

  ngOnInit() {
    this.basicInfoForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      description: [''],
      idTipoServicio: [''],
      picture: new FormGroup({
        file: new FormControl(),
        blob: new FormControl(),
        url: new FormControl(),
        type: new FormControl()
      })
    });

  }

  async onRegister() {
    this.serverBusy = true;
    const payload = this.basicInfoForm.value;

    let subscription: Observable<any>;
    let message_success: string;
    let message_error: string;
    if (this.service_type) {
      message_success = `Service type updated successfully.`;
      message_error = `Error updating service type.`;
      subscription = this.api.patch(`service-types/${this.service_type.idTipoServicio}`, payload);
    } else {
      message_success = `Service type created successfully.`;
      message_error = `Error creating service type.`;
      subscription = this.api.post(`service-types`, payload);
    }
    const iglesia_temp = new OrganizationModel();
    iglesia_temp.idIglesia = 0;
    iglesia_temp.topic = 'general_images';
    if (this.image) {
      const image = this.image.value;
      if (image.blob) {
        const image_response: any = await new Promise((resolve, reject) => {
          const indexPoint = (image.file.name as string).lastIndexOf('.');
          const extension = (image.file.name as string).substring(indexPoint);
          const ticks = (Number(String(Math.random()).slice(2)) + Date.now() + Math.round(performance.now())
          ).toString(36);
          const myUniqueFileName = ticks + extension;

          return resolve(this.organizationService.uploadFile(image.file, iglesia_temp, myUniqueFileName, 'service_types'));
        })
        payload.picture = `${image_response.file_info.src_path}`;
        this.image.get('url').setValue(payload.picture);
      } else {
        payload.picture = this.service_type.picture;
      }
    } else {
      payload.picture = null;
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

  setServiceType(service_type: any) {
    this.service_type = service_type;
    this.basicInfoForm.patchValue(
      {
        nombre: service_type.nombre,
        description: service_type.description,
        idTipoServicio: service_type.idTipoServicio,
      });
    if (service_type.picture) {
      this.basicInfoForm.get('picture').get('type').setValue('image');
      this.basicInfoForm.get('picture').get('url').setValue(service_type.picture);
    }
  }

  showActionSheet(idDesignRequestImageType: number, input_file) {
    const a = new DesignRequestImageModel();
    a.idDesignRequestImageType = idDesignRequestImageType;

    this.ngZone.run(() => {
      if (input_file) {
        input_file.onchange = (event: { target: { files: FileList } }) => {

          Array.from(event.target.files).forEach(file => {
            a.file = file;
            if (file.type.includes('image')) {
              a.type = 'image';
            } else {
              a.type = 'file';
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
              a.blob = reader.result as any;
              this.basicInfoForm.get('picture').patchValue(a);
            };
          });
        };
      }
      input_file.click();
    });
  }

  get image() {
    const obj = this.basicInfoForm.get('picture').value;
    if (obj.file || obj.url) {
      return this.basicInfoForm.get('picture');
    } else {
      return undefined;
    }
  }

  fixUrlDesign(image) {
    if (image.type === 'image') {
      if (image.blob) {
        return image.blob;
      } else {
        return `${environment.serverURL}${image.url}`;
      }
    } else {
      return '/assets/img/file-image.png';
    }
  }

  removeImage(form_control: FormControl, index: number) {
    form_control.patchValue({
      url: null,
      file: null,
      blob: null
    });
  }

}
