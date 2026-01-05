import { UserService } from 'src/app/services/user.service';
import { ApiService } from 'src/app/services/api.service';
import { FormBuilder, Validators, FormGroup, NgForm, FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { ToastType } from 'src/app/login/ToastTypes';
import { Component, OnInit, EventEmitter, Output, ViewChild, Input } from '@angular/core';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { OrganizationService } from 'src/app/services/organization/organization.service';

@Component({
  selector: 'app-font-form',
  templateUrl: './font-form.component.html',
  styleUrls: ['./font-form.component.scss']
})
export class FontFormComponent implements OnInit {

  // tslint:disable-next-line: no-output-rename no-output-on-prefix
  @Output('onDismiss') onDismiss = new EventEmitter();
  @ViewChild('basic_form') basic_form: NgForm;
  @Input() iglesias: any[];
  @Input('idOrganization') idOrganization: number;

  font: any;

  font_form: FormGroup = this.formBuilder.group({
    name: new FormControl('', [Validators.required]),
    file: new FormControl(undefined, [Validators.required]),
    font: new FormControl(undefined, [Validators.required]),
    ext: new FormControl(undefined, [Validators.required]),
    id: ['']
  });

  serverBusy: boolean = false;
  user;

  constructor(
    private formBuilder: FormBuilder,
    private api: ApiService,
    private userService: UserService,
    private organizationService: OrganizationService
  ) {
    this.user = this.userService.getCurrentUser();
  }

  ngOnInit() {
    if (!this.idOrganization) {
      if (this.user) {
        this.idOrganization = this.user.idIglesia;
      }
    }
    this.font_form = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      file: new FormControl(undefined, [Validators.required]),
      font: new FormControl(undefined, []),
      ext: new FormControl(undefined, [Validators.required]),
      id: ['']
    });
  }

  async onRegister() {
    this.serverBusy = true;
    const payload = this.font_form.value;

    if (payload.file) {
      const iglesia_temp = new OrganizationModel();
      iglesia_temp.idIglesia = 0;
      iglesia_temp.topic = 'general_fonts';
      const image = payload.file;
      const image_response: any = await new Promise((resolve, reject) => {
        const indexPoint = (image.name as string).lastIndexOf('.');
        const extension = (image.name as string).substring(indexPoint);
        const ticks = (Number(String(Math.random()).slice(2)) + Date.now() + Math.round(performance.now())
        ).toString(36);
        const myUniqueFileName = ticks + extension;

        return resolve(this.organizationService.uploadFile(image, iglesia_temp, myUniqueFileName, 'fonts', true));
      });
      payload.link = `${image_response.file_info.src_path}`;

    } else {
      if (!this.font) {
        this.serverBusy = false;
        this.api.showToast(`You need to select a font.`, ToastType.error);
        return;
      }
    }

    payload.created_by = this.user.idUsuario;

    let subscription: Observable<any>;
    let message_success: string;
    let message_error: string;
    if (this.font) {
      message_success = `Font updated successfully.`;
      message_error = `Error updating font.`;
      subscription = this.api.patch(`configuracionesTabs/fonts/${this.font.id}`, payload);
    } else {
      message_success = `Font created successfully.`;
      message_error = `Error creating font.`;
      subscription = this.api.post(`configuracionesTabs/fonts`, payload);
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

  setFont(contact_font: any) {
    this.font = contact_font;
    this.font_form.patchValue(contact_font);
  }

  addFontFile(file: File) {
    if (file) {
      const extension = file.name.substring(file.name.lastIndexOf('.') + 1);
      this.font_form.get('file').setValue(file);
      this.font_form.get('ext').setValue(extension);
    } else {
      this.font_form.get('file').setValue(undefined);
      this.font_form.get('ext').setValue(undefined);
    }
  }

}
