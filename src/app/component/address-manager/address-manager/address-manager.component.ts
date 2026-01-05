import { AddressModel, AutocompleteResponseModel, GoogleAddressComponent } from './../../../component/google-places/google-places.component';
import { ToastType } from './../../../login/ToastTypes';
import { UserService } from './../../../services/user.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-address-manager',
  templateUrl: './address-manager.component.html',
  styleUrls: ['./address-manager.component.scss']
})
export class AddressManagerComponent implements OnInit {

  @Input() idOrganization: number;
  @Input('view_mode') view_mode: string = 'edition';
  @Input('show_as_minimal') show_as_minimal: boolean = false;

  show_detail: boolean = true;

  currentUser;

  contact_form: FormGroup = new FormGroup({
    idIglesia: new FormControl('', [Validators.required]),
    addresses: new FormArray([]),
  });

  address_items: AddressModel[] = [];

  constructor(
    private organizationService: OrganizationService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    if (!this.idOrganization) {
      if (this.currentUser) {
        this.idOrganization = this.currentUser.idIglesia;
      } else {
        this.route.queryParamMap.subscribe(params => {
          const code = params.get('idIglesia');
          if (code) {
            this.idOrganization = Number(code);
          }
        });
      }
    }
    if (this.idOrganization) {
      this.loadNotes();
    } else {
      setTimeout(() => {
        this.organizationService.api.showToast(`You need to select an organization, first. Please go to settings > Organizations and select one organization`, ToastType.info);
      });
      this.router.navigate([`/user-profile/details/${this.currentUser.idUsuario}`]);
    }
  }

  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  loadNotes() {
    if (this.idOrganization) {
      this.organizationService.getAddresses(this.idOrganization)
        .subscribe((data: any) => {
          this.address_items = data.addresses;
          this.clearFormArray(this.addresses);
          this.address_items.forEach(async address => {

            const form_group = new FormGroup({
              idOrganizationAddress: new FormControl('', [Validators.required]),
              name: new FormControl('', [Validators.required]),
              city: new FormControl(),
              street: new FormControl(),
              state: new FormControl(),
              zip_code: new FormControl(),
              country: new FormControl(),
              full_address: new FormControl('', [Validators.required]),
              lat: new FormControl(),
              lng: new FormControl(),
              status: new FormControl(true),
              show_map: new FormControl(false),
              created_by: new FormControl(),
              url: new FormControl()
            });
            address.full_address = GoogleAddressComponent.formatFullAddress(address, ['street', 'city', 'state', 'zip_code', 'country']);
            if (!address.url && address.idOrganizationAddress) {
              var sydney = new google.maps.LatLng(address.lat, address.lng);
              const map = new google.maps.Map(
                document.getElementById('hidden_map'), { center: sydney, zoom: 15 });
              const detail = await GoogleAddressComponent.getDetail(address, map);
              address.url = detail.url;
              await this.organizationService.updateAddresses(address).toPromise();
            }
            form_group.patchValue(address);
            this.addresses.push(form_group);
          });
          this.contact_form.get('idIglesia').setValue(this.idOrganization);
        }, error => {
          console.error(error);
          this.organizationService.api.showToast(`Error getting contact info.`, ToastType.error);
        });
    }
  }

  get addresses() {
    return this.contact_form.get('addresses') as FormArray;
  }

  get active_addresses() {
    return this.addresses.controls.filter(x => x.value.status);
  }

  get first_item() {
    if (this.addresses.length > 0) {
      const controls = this.addresses.controls.filter(x => x.value.status);
      if (controls.length > 0) {
        return controls[0];
      }
    }
  }

  addItem() {
    const control = this.addresses;
    const form_group = new FormGroup({
      idOrganizationAddress: new FormControl(0, [Validators.required]),
      name: new FormControl('', [Validators.required]),
      city: new FormControl(''),
      street: new FormControl(''),
      state: new FormControl(''),
      zip_code: new FormControl(''),
      country: new FormControl(''),
      full_address: new FormControl('', [Validators.required]),
      lat: new FormControl(),
      lng: new FormControl(),
      status: new FormControl(true),
      show_map: new FormControl(false),
      created_by: new FormControl(this.currentUser.idUsuario),
      url: new FormControl()
    });
    control.push(form_group)
  }

  removeItem(index: number) {
    const control = this.addresses;
    const value = control.controls[index].get('full_address').value;
    const is_valid = control.controls[index].get('full_address').valid;
    if (value) {
      if (is_valid) {
        control.controls[index].get('status').setValue(false);
      } else {
        control.removeAt(index);
      }
    } else {
      control.removeAt(index);
    }
  }

  displayEmptyMessage() {
    const controls = this.addresses.controls.map(x => x.value.status);
    return controls.filter(x => x).length === 0;
  }

  submitContact(contact_form: FormGroup) {
    if (contact_form.valid) {
      const contacto = contact_form.value;
      let success_message: string;
      let error_message: string;

      success_message = `Address saved successfully.`;
      error_message = `Error saving adddress.`;

      this.organizationService.api.post(`iglesias/addresses/`, contacto)
        .subscribe((response: any) => {
          this.organizationService.api.showToast(`${success_message}`, ToastType.success);
          this.contact_form.markAsPristine();
        }, err => {
          console.error(err);
          this.organizationService.api.showToast(`${error_message}`, ToastType.error);
        });
    } else {
      this.organizationService.api.showToast(`Please check all required fields are correct.`, ToastType.error);
    }
  }

  public getAddress(address_control: FormGroup, item: AutocompleteResponseModel) {
    if (item) {
      if (item.address) {
        address_control.get('full_address').setValue(item.address.full_address);
        address_control.patchValue(item.address);
      }
    }
  }

  toggleShowMap() {

  }

  isFirstAvailable(address: FormGroup, index: number) {
    const first_control = this.addresses.controls.find(x => x.value.status);
    const first_active_index = this.addresses.controls.indexOf(first_control);
    return first_active_index === index;
  }

}
