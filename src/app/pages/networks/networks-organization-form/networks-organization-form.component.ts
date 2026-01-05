import { environment } from './../../../../environments/environment';
import { OrganizationService } from './../../../services/organization/organization.service';
import { DesignRequestImageModel } from './../../../models/DesignRequestModel';
import { UserService } from './../../../services/user.service';
import { Observable, Subscription } from 'rxjs';
import { ToastType } from './../../../login/ToastTypes';
import { EventEmitter, NgZone, ViewChild } from '@angular/core';
import { Output } from '@angular/core';
import { NetworkModel, NetworkOrganizationModel } from './../NetworkModel';
import { Validators } from '@angular/forms';
import { ApiService } from './../../../services/api.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Country, MatSelectCountryComponent } from '@angular-material-extensions/select-country';
import { OrganizationModel } from 'src/app/models/OrganizationModel';


@Component({
  selector: 'app-networks-organization-form',
  templateUrl: './networks-organization-form.component.html',
  styleUrls: ['./networks-organization-form.component.scss']
})
export class NetworksOrganizationFormComponent implements OnInit {

  @Input('idOrganization') idOrganization: number;
  @Input('is_for_ezlink') is_for_ezlink: boolean = false;

  @ViewChild('mat_select_country') mat_select_country: MatSelectCountryComponent;

  @Output('on_cancel') on_cancel: EventEmitter<any> = new EventEmitter<any>();
  @Output('make_refresh') make_refresh: EventEmitter<any> = new EventEmitter<any>();
  network_organization_form: FormGroup;

  selected_network: NetworkModel;
  temp_network: NetworkModel;
  networks: NetworkModel[] = [];
  selected_country: Country;
  user: any = this.userService.getCurrentUser();

  constructor(
    private api: ApiService,
    private form_builder: FormBuilder,
    private userService: UserService,
    private ngZone: NgZone,
    private organizationService: OrganizationService
  ) { }

  ngOnInit() {
    if (!this.network_organization_form) {
      this.initForm();
    }
  }

  initForm() {
    this.network_organization_form = this.form_builder.group({
      idNetwork: new FormControl(0, [Validators.required, Validators.min(1)]),
      custom_name: new FormControl('', [Validators.required]),
      site_link: new FormControl('', [Validators.required]),
      description: new FormControl('', []),
      extra_params: new FormControl('', []),
      icon_svg: new FormControl('', []),
      is_custom_icon: new FormControl(false),
      icon_path: new FormControl('', []),
      background_color: new FormControl('', []),
      text_color: new FormControl('', []),
      sort_by: new FormControl('', []),
      idIglesia: new FormControl(this.idOrganization, [Validators.required]),
      icon_temp: new FormControl(),
      is_for_profile: new FormControl(true),
      is_for_ezlink: new FormControl(false),
      ezlink_category_id: new FormControl()
    });
    if (this.is_for_ezlink) {
      this.network_organization_form.get('is_for_profile').setValue(false);
      this.network_organization_form.get('is_for_ezlink').setValue(true);
    }
    this.selected_network = undefined;
    this.temp_network = undefined;
  }

  setNetwork(network: NetworkOrganizationModel) {
    if (this.network_organization_form) {
      const id_control = this.network_organization_form.get('id');
      if (!id_control) {
        this.network_organization_form.addControl('id', new FormControl('', [Validators.required]))
      }
      console.log(network);
      this.network_organization_form.patchValue(network);
      this.selected_network = this.networks.find(x => x.idNetwork === network.idNetwork);
      this.temp_network = Object.assign({}, network);
      if (network.idNetwork === 5) {
        // Try to get country... ?
        setTimeout(() => {
          if (this.mat_select_country) {
            const country = this.mat_select_country.countries.find(x => x.callingCode === `+${network.extra_params}`);
            this.selected_country = country;
            this.mat_select_country.value = this.selected_country;
            this.mat_select_country.writeValue(this.selected_country);
            const site_link = network.site_link.replace(country.callingCode.replace('+', ''), '');
            this.network_organization_form.get('site_link').setValue(site_link.substring(1));
          }
        }, 100);
      }
    }
  }

  fixAsNumber(id_to_fix: number) {
    const idNetwork = Number(id_to_fix);
    this.network_organization_form.get('idNetwork').setValue(idNetwork);
    if (Number(idNetwork > 0)) {
      this.selected_network = this.networks.find(x => x.idNetwork === idNetwork);
      if (this.selected_network) {
        this.network_organization_form.get('is_custom_icon').setValue(this.selected_network.is_custom_icon);
      }
      if (this.network_organization_form.get('is_custom_icon').value) {
        this.network_organization_form.get('icon_svg').setValue(undefined);
        this.network_organization_form.get('background_color').setValue(undefined);
        this.network_organization_form.get('text_color').setValue(undefined);
        if (this.temp_network) {
          if (this.temp_network.idNetwork === idNetwork) {
            this.network_organization_form.get('icon_path').setValue(this.temp_network.icon_path);
          } else {
            this.network_organization_form.get('icon_path').setValue(this.selected_network.icon_path);
          }
        } else if (this.selected_network) {
          this.network_organization_form.get('icon_path').setValue(this.selected_network.icon_path);
        }
      } else {
        this.network_organization_form.get('icon_path').setValue(undefined);
        if (this.temp_network) {
          if (this.temp_network.idNetwork === idNetwork) {
            this.network_organization_form.get('icon_svg').setValue(this.temp_network.icon_svg);
            this.network_organization_form.get('background_color').setValue(this.temp_network.background_color);
            this.network_organization_form.get('text_color').setValue(this.temp_network.text_color);
          } else {
            this.network_organization_form.get('icon_svg').setValue(this.selected_network.icon_svg);
            this.network_organization_form.get('background_color').setValue(this.selected_network.background_color);
            this.network_organization_form.get('text_color').setValue(this.selected_network.text_color);
          }
        } else if (this.selected_network) {
          this.network_organization_form.get('icon_svg').setValue(this.selected_network.icon_svg);
          this.network_organization_form.get('background_color').setValue(this.selected_network.background_color);
          this.network_organization_form.get('text_color').setValue(this.selected_network.text_color);
        }
      }
    } else {
      this.selected_network = undefined;
    }
  }

  getNetworks() {
    this.api.get(`networks`,
      {
        idIglesia: this.idOrganization
      })
      .subscribe((response: any) => {
        this.networks = response.networks;
      }, error => {
        this.networks = [];
      });
  }

  getNetworksAsPromise() {
    return new Promise((resolve, reject) => {
      this.api.get(`networks`,
        {
          idIglesia: this.idOrganization
        })
        .subscribe((response: any) => {
          this.networks = response.networks;
          return resolve(this.networks);
        }, error => {
          this.networks = [];
          return resolve(this.networks);
        });
    })
  }

  onCountrySelected(event, component) {
    const callingCode = event.callingCode.replace('+', '');
    this.network_organization_form.get('extra_params').setValue(callingCode)
    this.selected_country = event;
  }

  cancelForm() {
    this.on_cancel.emit();
  }

  async saveNetworkOrganization() {
    let site_link = this.network_organization_form.get('site_link').value;
    if (this.network_organization_form.get('idNetwork').value === 5) {
      if (!this.selected_country) {
        this.api.showToast(`You need to select a country`, ToastType.info);
        return;
      } else {
        site_link = `${this.selected_country.callingCode.replace('+', '')}1${site_link}`;
      }
    }

    let subscription: Subscription;
    let observable: Observable<any>;
    const payload = this.network_organization_form.value;
    const iglesia_temp = new OrganizationModel();
    iglesia_temp.idIglesia = this.idOrganization;
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
    payload.site_link = site_link;
    if (payload.id) {
      observable = this.api.patch(`networks/organization/${payload.id}`, payload);
    } else {
      payload.created_by = this.user.idUsuario;
      observable = this.api.post(`networks/organization`, payload);
    }
    subscription = observable
      .subscribe(response => {
        subscription.unsubscribe();
        this.api.showToast(`Network saved successfully`, ToastType.success);
        this.refreshItems();
      }, error => {
        console.error(error);
        this.api.showToast(`Error saving the network`, ToastType.error);
      })
  }

  refreshItems() {
    this.make_refresh.emit();
  }

  getLink() {
    let site_link = this.network_organization_form.get('site_link').value;
    if (this.selected_network) {
      if (this.network_organization_form.get('idNetwork').value === 5) {
        if (!this.selected_country) {
          return `You need to select a country`;
        } else {
          site_link = `${this.selected_network.base_url}${this.selected_country.callingCode.replace('+', '')}1${site_link}`;
          return site_link;
        }
      } else {
        return this.selected_network.base_url + site_link;
      }
    }
  }

  toggleCustomIcon() {
    if (this.network_organization_form.get('is_custom_icon').value) {
      this.network_organization_form.get('icon_svg').setValue(undefined);
      this.network_organization_form.get('background_color').setValue(undefined);
      this.network_organization_form.get('text_color').setValue(undefined);
      if (this.temp_network) {
        this.network_organization_form.get('icon_path').setValue(this.temp_network.icon_path);
      } else if (this.selected_network) {
        this.network_organization_form.get('icon_path').setValue(this.selected_network.icon_path);
      }
    } else {
      this.network_organization_form.get('icon_path').setValue(undefined);
      if (this.temp_network) {
        this.network_organization_form.get('icon_svg').setValue(this.temp_network.icon_svg);
        this.network_organization_form.get('background_color').setValue(this.temp_network.background_color);
        this.network_organization_form.get('text_color').setValue(this.temp_network.text_color);
      } else if (this.selected_network) {
        this.network_organization_form.get('icon_svg').setValue(this.selected_network.icon_svg);
        this.network_organization_form.get('background_color').setValue(this.selected_network.background_color);
        this.network_organization_form.get('text_color').setValue(this.selected_network.text_color);
      }
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

}
