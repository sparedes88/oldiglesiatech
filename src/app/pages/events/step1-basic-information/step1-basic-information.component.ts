import { COUNTRIES_DB } from '@angular-material-extensions/select-country';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { AutocompleteResponseModel, GoogleAddressComponent } from 'src/app/component/google-places/google-places.component';
import { User } from 'src/app/interfaces/user';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { UserService } from 'src/app/services/user.service';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-step1-basic-information',
  templateUrl: './step1-basic-information.component.html',
  styleUrls: ['./step1-basic-information.component.scss']
})
export class Step1BasicInformationComponent implements OnInit {

  init_map: boolean = false;
  current_user: User;
  countries = COUNTRIES_DB;
  zones: { name: string, value: string, utc?: any }[] = [];

  timezone_options: {
    country: string;
    timezone: string
  } = {
      country: '',
      timezone: ''
    }

  @Input('form') form: FormGroup;

  @ViewChild('address_component') address_component: GoogleAddressComponent;

  constructor(
    private user_service: UserService,
    private organization_service: OrganizationService
  ) {
    this.current_user = this.user_service.getCurrentUser();
  }

  get is_unique() {
    return this.form.get('is_unique').value === true;
  }

  get is_location_virtual() {
    return this.form.get('is_location_virtual').value === true;
  }

  async ngOnInit() {
    setTimeout(() => {
      this.init_map = true
    }, 200);
    const response = await this.organization_service.api.get(`iglesias/contact_info/getCountryCode`, { idIglesia: this.current_user.idIglesia }).toPromise().catch(err => { return { country_code: undefined, country: undefined } }) as any;
    console.log(response);
    if (response.country) {
      this.timezone_options.country = response.country;
      this.getZonesForCountry(this.timezone_options.country);
    }
    // this.selected_country = this.countries.filter(x => x.alpha2Code === this.iglesia.country);
  }

  setCountry(event) {
    console.log(event);
    this.getZonesForCountry(event.target.value);
  }

  getZonesForCountry(country_code: string) {
    this.zones = [];
    const zones = moment.tz.zonesForCountry(country_code);
    zones.forEach(x => {
      const abbr = moment.tz(x).format('z')
      const utc = moment.tz(x).format('ZZ')
      const item = {
        name: `(${abbr}${utc}) ${x.replace(/_/g, ' ')}`,
        value: x,
        utc
      }
      this.zones.push(item);
    });
    this.zones.sort((a, b) => {
      return a.utc > b.utc ? 1 : -1;
    })
    console.log(this.zones);
    if (this.zones.length > 0) {
      this.form.get('timezone').setValue(this.zones[0].value);
    }
  }

  setFrequency(is_unique: boolean) {
    this.form.get('is_unique').setValue(is_unique);
    this.form.get('is_unique').markAsTouched();
    if (is_unique) {
      this.form.removeControl('is_weekly');
      this.form.removeControl('days');

      this.form.addControl('start_date', new FormControl(undefined, [Validators.required]));
      this.form.addControl('start_time', new FormControl(undefined, [Validators.required]));
      this.form.addControl('end_date', new FormControl(undefined));
      this.form.addControl('end_time', new FormControl(undefined));
    } else {
      this.form.removeControl('start_date');
      this.form.removeControl('start_time');
      this.form.removeControl('end_date');
      this.form.removeControl('end_time');


      this.form.addControl('is_weekly', new FormControl(undefined, [Validators.required]));
      this.form.addControl('days', new FormArray([]));

    }
  }

  cleanEnd(control_name: string) {
    this.form.get(control_name).setValue(undefined);
    this.form.get(control_name).markAsPristine();
  }

  setFrequencyTime(is_weekly: boolean) {
    this.form.get('is_weekly').setValue(is_weekly);
    this.form.get('is_weekly').markAsTouched();
  }

  setLocation(is_location_virtual: boolean) {
    this.form.get('is_location_virtual').setValue(is_location_virtual);
    this.form.get('is_location_virtual').markAsTouched();
    if (!is_location_virtual) {
      this.form.removeControl('site_type');
      this.form.removeControl('link');
      this.form.removeControl('instructions');

      this.form.addControl('same_address_as_church', new FormControl(false));
      this.form.addControl('full_address', new FormControl('', [Validators.required]));
      this.form.addControl('detail_address_info', new FormGroup({
        city: new FormControl(),
        street: new FormControl(),
        state: new FormControl(),
        zip_code: new FormControl(),
        country: new FormControl(),
        full_address: new FormControl(),
        lat: new FormControl(),
        lng: new FormControl()
      }));
    } else {
      this.form.removeControl('same_address_as_church');
      this.form.removeControl('full_address');
      this.form.removeControl('detail_address_info');

      this.form.addControl('site_type', new FormControl(undefined));
      this.form.addControl('link', new FormControl('', [Validators.required]));
      this.form.addControl('instructions', new FormControl('', [Validators.required]));
    }
  }

  public getAddress(item: AutocompleteResponseModel) {
    console.log(item);
    if (item) {
      if (item.address) {
        this.form.get('full_address').setValue(item.address.full_address);
        // this.group_event.location = item.address.full_address;
        this.form.get('detail_address_info').patchValue(item.address);
        // this.eventFormGroup.patchValue(item.address);
      }
    }
  }

  async setOrganizationAddress() {
    console.log(this.is_location_virtual);

    if (this.form.get('same_address_as_church').value) {
      const item = new OrganizationModel();
      item.idIglesia = this.current_user.idIglesia;
      const response: any = await this.organization_service.getIglesiaDetail(item).toPromise();
      if (response) {

        const organization = response.iglesia;
        organization.full_address = GoogleAddressComponent.formatFullAddress(organization, ['Calle', 'Ciudad', 'Provincia', 'ZIP', 'country']);
        console.log(organization);
        if (organization.idIglesia && (!organization.lat || !organization.lng)) {
          const pin_info = await GoogleAddressComponent.convert(organization.full_address).catch(error => {
            console.error(error);
            return error;
          });
          if (JSON.stringify(pin_info) !== '{}') {
            const address = pin_info.address;
            address.idIglesia = organization.idIglesia;
            this.getAddress(address)
            this.organization_service.api
              .post(`iglesias/updateOrganizationAddress`, address)
              .subscribe(response => {
              });
          }
        } else {
          const item: AutocompleteResponseModel = {
            address: {
              street: organization.Calle,
              city: organization.Ciudad,
              state: organization.Provincia,
              zip_code: organization.ZIP,
              country: organization.country,
              lat: organization.lat,
              lng: organization.lng,
              full_address: organization.full_address
            },
            place: {
              name: ''
            }
          }
          this.form.get('full_address').setValue(item.address.full_address);
          if (this.address_component) {
            this.address_component.value = item.address.full_address;
            this.address_component.autocompleteInput = item.address.full_address;
          }
          this.getAddress(item);
        }
      }
    }
  }

  setSiteType(site_type: 'Zoom' | 'GoToMeetings' | 'Other') {
    this.form.get('site_type').setValue(site_type);
  }

  submit() {
    console.log(this.form.valid);
    console.log(this.form);

  }

}
