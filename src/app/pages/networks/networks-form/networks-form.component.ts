import { DesignRequestImageModel } from './../../../models/DesignRequestModel';
import { ToastType } from './../../../login/ToastTypes';
import { NetworkModel } from './../NetworkModel';
import { NgZone, Output } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { Validators } from '@angular/forms';
import { UserService } from './../../../services/user.service';
import { ApiService } from './../../../services/api.service';
import { Observable, Subscription } from 'rxjs';
import { Component, EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/interfaces/user';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { OrganizationService } from 'src/app/services/organization/organization.service';

@Component({
  selector: 'app-networks-form',
  templateUrl: './networks-form.component.html',
  styleUrls: ['./networks-form.component.scss']
})
export class NetworksFormComponent implements OnInit {

  // tslint:disable-next-line: no-output-rename no-output-on-prefix
  @Output('onDismiss') onDismiss = new EventEmitter();
  @ViewChild('basic_form') basic_form: NgForm;
  @Input() iglesias: any[];
  @Input('idIglesia') idIglesia: number;

  network: NetworkModel;
  temp_network: NetworkModel;

  serverBusy: boolean = false;
  network_organization_form: FormGroup;

  user: User;

  constructor(
    private form_builder: FormBuilder,
    private api: ApiService,
    private userService: UserService,
    private ngZone: NgZone,
    private organizationService: OrganizationService
  ) {
    this.user = this.userService.getCurrentUser();
  }

  ngOnInit() {
    if (!this.idIglesia) {
      if(this.user){
        this.idIglesia = this.user.idIglesia;
      }
    }
    this.initForm();
  }

  initForm() {
    this.network_organization_form = this.form_builder.group({
      name: new FormControl('', [Validators.required]),
      label_name: new FormControl('', [Validators.required]),
      description: new FormControl('', []),
      base_url: new FormControl('', []),
      help_text: new FormControl('', []),
      icon_svg: new FormControl('fas fa-user', []),
      is_custom_icon: new FormControl(false),
      icon_path: new FormControl('', []),
      background_color: new FormControl('#000000', []),
      text_color: new FormControl('#ffffff', []),
      sort_by: new FormControl('', []),
      idIglesia: new FormControl(this.idIglesia, [Validators.required]),
      icon_temp: new FormControl()
    });
    // this.selected_network = undefined;
    this.temp_network = undefined;
  }

  dismiss(response?) {
    if (response) {
      this.onDismiss.emit(response);
    } else {
      this.onDismiss.emit();
    }
    this.serverBusy = false;
  }

  setNetwork(network: NetworkModel) {
    if (this.network_organization_form) {
      const id_control = this.network_organization_form.get('idNetwork');
      if (!id_control) {
        this.network_organization_form.addControl('idNetwork', new FormControl('', [Validators.required]))
      }
      this.network_organization_form.patchValue(network);
      // this.selected_network = this.networks.find(x => x.idNetwork === network.idNetwork);
      this.temp_network = Object.assign({}, network);
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
            a.idUser = this.user.idUsuario;
            if (file.type.includes('image')) {
              a.type = 'image';
            } else {
              a.type = 'file';
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
              a.blob = reader.result as any;
              const form_image = new FormGroup({
                idDesignRequestImageType: new FormControl(),
                file: new FormControl(),
                idUser: new FormControl(),
                type: new FormControl(),
                blob: new FormControl()
              });
              form_image.patchValue(a);
              this.network_organization_form.setControl('icon_temp', form_image);
            };
          });
        };
      }
      input_file.click();
    });
  }

  fixUrlDesign(image: DesignRequestImageModel) {
    if (image) {
      if (image.type === 'image') {
        if (image.blob) {
          return image.blob;
        } else {
          return image.url;
        }
      } else {
        return '/assets/img/file-image.png';
      }
    } else {
      return this.fixUrl(this.network_organization_form.get('icon_path').value);
    }
  }

  fixUrl(image: string) {
    if (image) {
      if (image.includes('https://')) {
        return `${image}`;
      }
      return `${environment.serverURL}${image}`;
    }
    return 'assets/img/default-image.jpg';
  }

  toggleCustomIcon() {
    if (this.network_organization_form.get('is_custom_icon').value) {
      this.network_organization_form.get('icon_svg').setValue(undefined);
      this.network_organization_form.get('background_color').setValue(undefined);
      this.network_organization_form.get('text_color').setValue(undefined);
      if (this.temp_network) {
        this.network_organization_form.get('icon_path').setValue(this.temp_network.icon_path);
      }
      // else if (this.selected_network) {
      //   this.network_organization_form.get('icon_path').setValue(this.selected_network.icon_path);
      // }
    } else {
      this.network_organization_form.get('icon_path').setValue(undefined);
      if (this.temp_network) {
        this.network_organization_form.get('icon_svg').setValue(this.temp_network.icon_svg);
        this.network_organization_form.get('background_color').setValue(this.temp_network.background_color);
        this.network_organization_form.get('text_color').setValue(this.temp_network.text_color);
      }
      // else if (this.selected_network) {
      //   this.network_organization_form.get('icon_svg').setValue(this.selected_network.icon_svg);
      //   this.network_organization_form.get('background_color').setValue(this.selected_network.background_color);
      //   this.network_organization_form.get('text_color').setValue(this.selected_network.text_color);
      // }
    }
  }

  async saveNetworkOrganization() {
    this.serverBusy = true;
    let subscription: Subscription;
    let observable: Observable<any>;
    const payload = this.network_organization_form.value;
    const iglesia_temp = new OrganizationModel();
    iglesia_temp.idIglesia = this.idIglesia;
    iglesia_temp.topic = this.user.topic;
    const promises = [];
    if (this.network_organization_form.get('icon_temp')) {
      const icon_temp = this.network_organization_form.get('icon_temp').value;
      if (icon_temp) {
        if (icon_temp.file) {
          promises.push(new Promise((resolve, reject) => {
            const indexPoint = (icon_temp.file.name as string).lastIndexOf('.');
            const extension = (icon_temp.file.name as string).substring(indexPoint);
            const ticks = (Number(String(Math.random()).slice(2)) + Date.now() + Math.round(performance.now())
            ).toString(36);
            const myUniqueFileName = ticks + extension;

            return resolve(this.organizationService.uploadFile(icon_temp.file, iglesia_temp, myUniqueFileName, 'custom_icon'));
          }));

        }
      }
    }
    await Promise.all(promises)
      .then(responses => {
        if (responses.length > 0) {
          // designRequest.images[index].url = ;
          // designRequest.images[index].blob = undefined;
          payload.icon_path = `${responses[0].file_info.src_path}`;
        }
      })
    if (payload.idNetwork) {
      observable = this.api.patch(`networks/${payload.idNetwork}`, payload);
    } else {
      payload.created_by = this.user.idUsuario;
      observable = this.api.post(`networks`, payload);
    }
    subscription = observable
      .subscribe(response => {
        subscription.unsubscribe();
        this.api.showToast(`Network saved successfully`, ToastType.success);
        this.serverBusy = false;
        this.dismiss(response);
      }, error => {
        console.error(error);
        this.serverBusy = false;
        this.api.showToast(`Error saving the network`, ToastType.error);
      })
  }

}
