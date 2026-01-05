import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { HeaderMenuSettingModel } from './../organization-profile.component';
import { AddressModel, GoogleAddressComponent } from './../../../component/google-places/google-places.component';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';
import { environment as prod_environment } from 'src/environments/environment.prod';
import { NetworkOrganizationModel } from '../../networks/NetworkModel';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { OrganizationService } from 'src/app/services/organization/organization.service';

@Component({
  selector: 'app-footer-section',
  templateUrl: './footer-section.component.html',
  styleUrls: ['./footer-section.component.scss']
})
export class FooterSectionComponent implements OnInit, OnChanges {

  @Input('style_settings') style_settings;
  @Input('profile_tabs') profile_tabs: any[] = [];
  @Input('idOrganization') idOrganization: number;
  @Input('can_edit') can_edit: boolean;

  @Output('on_click') on_click: EventEmitter<any> = new EventEmitter<any>();
  @Output('on_submit') on_submit: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  networks: NetworkOrganizationModel[] = [];
  store_networks_ids = [9, 10];
  contact: {
    emails: any[],
    phones: any[]
  };
  organization: OrganizationModel;
  addresses: AddressModel[] = [];
  footers: { id: number; name: string; }[] = [];
  loading: boolean = true;
  footer_form: FormGroup = this.form_builder.group({
    id: new FormControl()
  });

  preview = {
    tabs: [
      {
        name: 'Inicio'
      },
      {
        name: 'Ejemplo'
      },
      {
        name: 'Ejemplo 2'
      },
      {
        name: 'Ejemplo 3'
      },
    ],
    networks: [
      {
        idNetwork: 1,
        full_site_link: 'https://www.facebook.com/iglesiatech',
        icon_svg: 'fab fa-facebook-f'
      },
      {
        "idNetwork": 9,
        "full_site_link": "https://play.google.com/store/apps/details?id=E2+Outlook+%26+iGLESIA+TEC",
        "icon_svg": "fab fa-android",
      },
      {
        idNetwork: 4,
        full_site_link: 'https://www.youtube.com/channel/UCj1qrTMwox-52KZsSs_Wn0w',
        "icon_svg": "fab fa-youtube",
      },
      {
        "idNetwork": 10,
        "full_site_link": "https://apps.apple.com/us/app/id1434886871",
        "icon_svg": "fab fa-apple",
      }
    ],
    contact: {
      emails: [
        {
          email: 'justanexamplemail@example.com'
        }
      ],
      phones: [
        {
          country_code: '+1',
          phone: '(000) 000-0000'
        }
      ]
    },
    addresses: [{
      full_address: 'Dirección ejemplo'
    }
    ]
  }

  constructor(
    private api: ApiService,
    private form_builder: FormBuilder,
    private organization_service: OrganizationService
  ) { }

  get non_store_networks() {
    // if (this.can_edit) {
    //   return this.preview.networks.filter(x => !this.store_networks_ids.includes(x.idNetwork))
    // }
    return this.networks.filter(x => !this.store_networks_ids.includes(x.idNetwork));
  }

  get store_networks() {
    // if (this.can_edit) {
    //   return this.preview.networks.filter(x => this.store_networks_ids.includes(x.idNetwork));
    // }
    return this.networks.filter(x => this.store_networks_ids.includes(x.idNetwork));
  }

  get phones() {
    // if (this.can_edit) {
    //   return this.preview.contact.phones;
    // }
    if (this.contact) {
      return this.contact.phones;
    }
    return [];
  }
  get emails() {
    // if (this.can_edit) {
    //   return this.preview.contact.emails;
    // }
    if (this.contact) {
      return this.contact.emails;
    }
    return [];
  }

  get addresses_items() {
    // if (this.can_edit) {
    //   return this.preview.addresses;
    // }
    return this.addresses;
  }

  get profile_tabs_items() {
    // if (this.can_edit) {
    //   return this.preview.tabs;
    // }
    return this.profile_tabs;
  }

  async ngOnInit() {
    this.loading = true;
    this.getFooterStyles();
    if (this.style_settings) {
      if (!this.style_settings.idFooterStyle) {
        this.style_settings.idFooterStyle = 1;
      }
    } else {
      this.style_settings = new HeaderMenuSettingModel();
    }
    this.footer_form.get('id').setValue(this.style_settings.idFooterStyle);

    await this.getOrganization();
    await this.getNetworks();
    await this.getContactInfo();
    await this.getAddresses();
    await this.getTabs();
    this.loading = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.style_settings.currentValue) {
      if (!changes.style_settings.currentValue.idFooterStyle) {
        this.footer_form.get('id').setValue(1);
      } else {
        this.footer_form.get('id').setValue(changes.style_settings.currentValue.idFooterStyle);
      }
    } else {
      this.footer_form.get('id').setValue(1);
    }
  }

  async getOrganization() {
    const response: any = await this.organization_service.getOrganizationMinimal(this.idOrganization).toPromise()
      .catch(error => {
        console.error(error);
        return;
      })
    if (response) {
      this.organization = response.iglesia;
    }
  }

  async getContactInfo() {
    const response: any = await this.api.get(`iglesias/contact_info/filter`, {
      idIglesia: this.idOrganization,
      contact_type: 3
    })
      .toPromise()
      .catch(error => {
        console.error(error);
        return;
      })
    if (response) {
      this.contact = response.contact;
    }
  }
  async getAddresses() {
    const response: any = await this.api.get(`iglesias/addresses`, {
      idIglesia: this.idOrganization
    })
      .toPromise()
      .catch(error => {
        console.error(error);
        return;
      })
    if (response) {
      this.addresses = response.addresses;
      this.addresses.forEach(x => {
        x.full_address = GoogleAddressComponent.formatFullAddress(x, ['street', 'city', 'state', 'zip_code', 'country']);
      });
    }
  }

  async getFooterStyles() {
    const response: any = await this.api.get(`iglesias/footers`).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.footers = response.footers;
    }
  }
  async getTabs() {
    const response: any = await this.api.get(`iglesias/headers`, {
      idIglesia: this.idOrganization,
      extended: true
    }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.profile_tabs = response.profile_tabs;
    }
  }

  getNetworks() {
    const payload: {
      idIglesia: number,
      profile?: boolean
    } = {
      idIglesia: this.idOrganization,
      profile: true
    };
    // this.loading = true;
    this.api.get(`networks/organization`, payload)
      .subscribe((response: any) => {
        this.networks = response.networks;
      }, error => {
        this.networks = [];
      });
  }

  shouldShow(item) {
    const include_ids = [2, 4, 6, 7, 8, 9];
    if (item.idModule === 3) {
      // if (this.iglesia) {
      //   if (this.iglesia.events) {
      //     return this.iglesia.events.length > 0;
      //   }
      // }
    } else if (item.idModule === 5) {
      // if (this.iglesia) {
      //   if (this.iglesia.groups) {
      //     return this.iglesia.groups.length > 0;
      //   }
      // }
    } else if (include_ids.includes(item.idModule)) {
      if (item.profile_tab_settings) {
        if (item.profile_tab_settings.categories) {
          if (item.idModule === 4) {
            // return this.check_stripe_settings;
          } else {
            return item.profile_tab_settings.categories.length > 0;
          }
        }
      }
      return false;
    }
    return true;
  }

  handleTabClick(item) {
    this.on_click.emit(item);
  }

  handleAction(net: NetworkOrganizationModel) {
    if (net.action_type === 'link') {
      window.open(net.full_site_link, "_blank");
    } else if (net.action_type === 'email') {
      window.open(net.full_site_link, "_blank");
    }
  }

  fixUrl(image: string, force_prod?: boolean) {
    if (image) {
      if (image.includes('https://')) {
        return `${image}`;
      }
      if (force_prod) {
        return `${prod_environment.serverURL}${image}`;
      } else {
        return `${environment.serverURL}${image}`;
      }
    }
    return 'assets/img/default-image.jpg';
  }

  saveFooter() {
    this.on_submit.emit(this.footer_form);
  }

}
