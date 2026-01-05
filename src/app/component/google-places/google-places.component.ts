import {
  Component,
  ViewChild,
  EventEmitter,
  Output,
  OnInit,
  AfterViewInit,
  Input,
} from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";

import { MatFormFieldControl } from '@angular/material';

declare const google: any;

export class AddressModel {
  city?: string;
  street?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  full_address?: string;
  lat?: number;
  lng?: number;
  idIglesia?: number;
  url?: string;
  idOrganizationAddress?: number;
  name?: string;
}

export class AutocompleteResponseModel {
  place: google.maps.places.PlaceResult;
  address: AddressModel;
}

@Component({
  selector: "google-address-component",
  templateUrl: `./google-places.component.html`,
  styleUrls: ["./google-places.component.scss"],
  providers: [{ provide: MatFormFieldControl, useExisting: GoogleAddressComponent }]
})
export class GoogleAddressComponent implements OnInit, AfterViewInit {
  @Input() adressType: string;
  @Input() mat_input: boolean;
  @Input() value: string;
  @Input() placeholder: string;
  @Input() readonly: boolean;
  @Output() setAddress: EventEmitter<AutocompleteResponseModel> = new EventEmitter();
  @Output() on_reload: EventEmitter<any> = new EventEmitter();
  @ViewChild("addresstext") addresstext: any;

  autocompleteInput: string;
  queryWait: boolean;

  constructor() { }

  ngOnInit() {
    if (this.value) this.autocompleteInput = this.value;
  }

  ngAfterViewInit() {
    this.getPlaceAutocomplete();
  }

  private getPlaceAutocomplete() {
    try {
      const autocomplete: google.maps.places.Autocomplete = new google.maps.places.Autocomplete(
        this.addresstext.nativeElement,
        {
          // componentRestrictions: { country: "US" },
          types: [this.adressType], // 'establishment' / 'address' / 'geocode'
        }
      );
      google.maps.event.addListener(autocomplete, "place_changed", () => {
        const place = autocomplete.getPlace();
        this.invokeEvent(place);
      });
    } catch (error) {
      console.error(error);
      this.on_reload.emit();
    }
  }

  invokeEvent(place: google.maps.places.PlaceResult) {
    console.log(place);
    const address = this.formatAddress(place);
    address.lat = place.geometry.location.lat();
    address.lng = place.geometry.location.lng();
    this.setAddress.emit({ place, address });
  }

  formatAddress(place: google.maps.places.PlaceResult): AddressModel {
    let address1 = "";
    let postcode = "";
    const address: AddressModel = {}
    for (const component of place.address_components as google.maps.GeocoderAddressComponent[]) {
      const componentType = component.types[0];
      switch (componentType) {
        case "street_number": {
          address1 = `${component.long_name} ${address1}`;
          break;
        }
        case "plus_code": {
          address1 = `${component.long_name} ${address1}`;
          break;
        }

        case "route": {
          address1 += component.long_name;
          break;
        }

        case "neighborhood":
          address1 += `, ${component.long_name}`;
          break;
        case "postal_code": {
          postcode = `${component.long_name}${postcode}`;
          break;
        }

        case "postal_code_suffix": {
          postcode = `${postcode}-${component.long_name}`;
          break;
        }

        case "locality":
          address.city = component.long_name;
          break;
        case "administrative_area_level_2":
          if (!address.city) {
            address.city = component.long_name;
          }
          break;

        case "administrative_area_level_1": {
          address.state = component.short_name;
          break;
        }

        case "country":
          address.country = component.short_name;
          break;
      }
    }
    address.street = address1;
    address.zip_code = postcode;
    address.full_address = this.formatFullAddress(address);
    address.url = place.url;
    return address;
  }

  static formatAddress(place: google.maps.places.PlaceResult | google.maps.GeocoderResult): AddressModel {
    let address1 = "";
    let postcode = "";
    const address: AddressModel = {}
    for (const component of place.address_components as google.maps.GeocoderAddressComponent[]) {
      const componentType = component.types[0];
      switch (componentType) {
        case "street_number": {
          address1 = `${component.long_name} ${address1}`;
          break;
        }

        case "route": {
          address1 += component.long_name;
          break;
        }

        case "postal_code": {
          postcode = `${component.long_name}${postcode}`;
          break;
        }

        case "postal_code_suffix": {
          postcode = `${postcode}-${component.long_name}`;
          break;
        }

        case "locality":
          address.city = component.long_name;
          break;
        case "administrative_area_level_2":
          if (!address.city) {
            address.city = component.long_name;
          }
          break;
        case "administrative_area_level_1": {
          address.state = component.short_name;
          break;
        }

        case "country":
          address.country = component.short_name;
          break;
      }
    }
    address.street = address1;
    address.zip_code = postcode;
    address.full_address = this.formatFullAddress(address);
    return address;
  }

  formatFullAddress(address: AddressModel): string {
    let full_address = ``;
    if (address.street) {
      full_address = `${address.street}`
    }
    if (address.city) {
      full_address = `${full_address}, ${address.city}`
    }
    if (address.state) {
      full_address = `${full_address}, ${address.state}`
    }
    if (address.zip_code) {
      full_address = `${full_address}, ${address.zip_code}`
    }
    if (address.country) {
      full_address = `${full_address}, ${address.country}`
    }
    return full_address;
  }

  static formatFullAddress(address: AddressModel, keys?: string[]): string {
    let full_address = ``;
    if (keys) {
      keys.forEach((key, index) => {
        if (address[key]) {
          if (index === 0) {
            full_address = `${address[key]}`
          } else {
            full_address = `${full_address}, ${address[key]}`
          }
        }
      });
    } else {
      if (address.street) {
        full_address = `${address.street}`
      }
      if (address.city) {
        full_address = `${full_address}, ${address.city}`
      }
      if (address.state) {
        full_address = `${full_address}, ${address.state}`
      }
      if (address.zip_code) {
        full_address = `${full_address}, ${address.zip_code}`
      }
      if (address.country) {
        full_address = `${full_address}, ${address.country}`
      }
    }
    return full_address;
  }

  public static async convert(address: string) {
    const response: any = await this.geocode_address(address);
    return response;
  }

  public static geocode_address(address: string) {
    return new Promise((resolve, reject) => {
      if (address) {
        const geocoder: google.maps.Geocoder = new google.maps.Geocoder();
        const request: google.maps.GeocoderRequest = {
          address
        };
        request.address = address;
        geocoder.geocode(request, (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
          console.log(address);
          console.log(status);
          console.log(results);
          console.log('***********************************');

          if (status === google.maps.GeocoderStatus.OK) {
            if (results.length > 0) {
              const place = results[0];
              const location_point = place.geometry.location;
              const coordinates = {
                lat: location_point.lat(),
                lng: location_point.lng(),
              };
              const address = this.formatAddress(place);
              address.lat = place.geometry.location.lat();
              address.lng = place.geometry.location.lng();
              resolve({ place, coordinates, address });
            } else {
              reject({});
            }
          } else {
            reject({});
          }
        });
      } else {
        reject({});
      }
    });
  }

  public static getDetail(address: AddressModel, map: google.maps.Map) {
    return new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
      const service: google.maps.places.PlacesService = new google.maps.places.PlacesService(map);
      const text_request: google.maps.places.TextSearchRequest = {
        query: address.full_address
      }
      // service.getDetails()
      service.textSearch(text_request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          if (results.length > 0) {
            const place_detail_request: google.maps.places.PlaceDetailsRequest = {
              placeId: results[0].place_id
            }
            service.getDetails(place_detail_request, (
              detail_resp: google.maps.places.PlaceResult,
              status_detail: google.maps.places.PlacesServiceStatus
            ) => {
              if (status_detail === google.maps.places.PlacesServiceStatus.OK) {
                if (detail_resp) {
                  return resolve(detail_resp);
                }
                return reject({});
              } else {
                return reject({});
              }
            });
          } else {
            return reject({});
          }
        } else {
          return reject({});
        }
      });
    });
  }
}
