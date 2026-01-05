import { COUNTRIES_DB, Country, MatSelectCountryComponent } from '@angular-material-extensions/select-country';
import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

export const CUSTOM_SELECT_COUNTRY_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectCountryComponent),
  multi: true,
};
@Component({
  selector: 'app-custom-select-country',
  templateUrl: './custom-select-country.component.html',
  styleUrls: ['./custom-select-country.component.scss'],
  providers: [CUSTOM_SELECT_COUNTRY_CONTROL_VALUE_ACCESSOR]
})
export class SelectCountryComponent implements OnInit, OnChanges, ControlValueAccessor {

  @Input('show_country_code') show_country_code: boolean = true;
  @Input('initial_item') initial_item: Country;
  @Input('label') label: string = '';
  @Input('return_value') return_value: 'all' | 'callingCode' | 'alpha3Code' | 'alpha2Code' = 'all';
  @Input('idOrganization') idOrganization: number;
  @Input('preselected_country_code') preselected_country_code: string;
  @Output('country_selected') country_selected: EventEmitter<Country> = new EventEmitter<Country>();

  @ViewChild('mat_select_country') mat_select_country: MatSelectCountryComponent;

  constructor(
    private api: ApiService
  ) { }

  ngOnInit() {
    if (this.preselected_country_code) {
      const country = COUNTRIES_DB.filter(x=> x.alpha2Code !== 'CA' &&  x.alpha2Code !== 'PR').find(x => x.callingCode === this.preselected_country_code);
      if (country) {
        this.initial_item = country;
        this.onCountrySelected(this.initial_item);
      } else if (this.idOrganization) {
        this.getCountryForOrganization();
      } else {
        if (this.initial_item) {
          this.mat_select_country.value = this.initial_item;
          this.mat_select_country.writeValue(this.initial_item);
        } else {
          this.getCountry()
        }
      }
    } else if (this.idOrganization) {
      this.getCountryForOrganization();
    } else {
      if (this.initial_item) {
        this.mat_select_country.value = this.initial_item;
        this.mat_select_country.writeValue(this.initial_item);
      } else {
        this.getCountry()
      }
    }
  }

  async getCountryForOrganization() {
    const response = await this.api.get(`iglesias/contact_info/getCountryCode`, { idIglesia: this.idOrganization }).toPromise().catch(err => { return { country_code: undefined, country: undefined } }) as any;
    console.log(response.country_code);
    console.log(response);
    if (response.country_code) {
      let country;
      if (response.country) {
        country = this.mat_select_country.countries.find(x => x.callingCode === response.country_code && x.alpha2Code === response.country);
        if (!country) {
          country = this.mat_select_country.countries.find(x => x.callingCode === response.country_code);
        }
      } else {
        country = this.mat_select_country.countries.find(x => x.callingCode === response.country_code);
      }
      if (country) {
        this.initial_item = country;
        this.mat_select_country.value = this.initial_item;
        this.mat_select_country.writeValue(this.initial_item);
        this.onCountrySelected(this.initial_item);
      }
    } else {
      this.getCountry();
    }
  }

  async getCountry() {
    const response = await fetch('https://api.ipregistry.co/?key=tf0krqck6pt0s2h5')
    const info = await response.json();
    const country_code = info.location.country.code;
    const country = COUNTRIES_DB.filter(x=> x.alpha2Code !== 'CA' &&  x.alpha2Code !== 'PR').find(x => x.alpha2Code === country_code);
    this.initial_item = country;
    this.onCountrySelected(this.initial_item);

  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    if (changes.initial_item) {
      if (!changes.initial_item.firstChange) {
        this.initial_item = changes.initial_item.currentValue;
        this.mat_select_country.value = this.initial_item;
        this.mat_select_country.writeValue(this.initial_item);
      }
      // } else if (changes.preselected_country_code) {
      //   if (!changes.preselected_country_code.firstChange) {
      //     const country = COUNTRIES_DB.filter(x=> x.alpha2Code !== 'CA' &&  x.alpha2Code !== 'PR').find(x => x.alpha2Code === changes.preselected_country_code.currentValue);
      //     this.initial_item = country;
      //     this.mat_select_country.value = this.initial_item;
      //     this.mat_select_country.writeValue(this.initial_item);
      //   }
    }
  }

  onCountrySelected(event: Country) {
    // this.country_selected.emit(event);
    // this.icon_control.setValue(icon);
    console.log(event);
    if (this.return_value === 'all') {
      this.onTouched(event);
      this.onChange(event);
    } else {
      this.onTouched(event[this.return_value]);
      this.onChange(event[this.return_value]);
    }
  }

  //Placeholders for the callbacks which are later provided
  //by the Control Value Accessor
  // ControlValueAccessor Implementation
  onChange: any = () => { };
  onTouched: any = () => { };

  //From ControlValueAccessor interface
  writeValue(value: any) {

    if (value) {
      console.log(value);
      console.log(typeof (value));
      if ((typeof value) == 'string') {
        const country = COUNTRIES_DB.filter(x=> x.alpha2Code !== 'CA' &&  x.alpha2Code !== 'PR').find(x => x.callingCode === value);
        console.log(country);
        this.initial_item = country;
        this.mat_select_country.value = this.initial_item;
        this.mat_select_country.writeValue(this.initial_item);
      } else {
        this.mat_select_country.value = value;
        this.mat_select_country.writeValue(value);
      }
    }
  }

  //From ControlValueAccessor interface
  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

}
