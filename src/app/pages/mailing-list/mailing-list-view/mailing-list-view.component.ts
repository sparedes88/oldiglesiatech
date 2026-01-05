import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';
import { MailingListExtraDisplaySettings, MailingListInputOption, MailingListModel, MailingListParams } from 'src/app/models/MailingListModel';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { ContactInboxService } from 'src/app/services/contact-inbox.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-mailing-list-view',
  templateUrl: './mailing-list-view.component.html',
  styleUrls: ['./mailing-list-view.component.scss']
})
export class MailingListViewComponent implements OnInit, OnChanges {

  @Input('is_preview') is_preview: boolean = false;
  @Input('idOrganization') idOrganization: number;
  @Input('idMailingList') idMailingList: number;
  @Input('mailing_list') mailing_list: MailingListModel;
  @Input('language') currentLang: string = 'en';
  @Input('extra_display_settings') extra_display_settings: MailingListExtraDisplaySettings = {
    name: true,
    logo: true
  }

  organization: OrganizationModel;

  current_user: User;
  contact_info: any = {}
  langDB: any;

  submitted: boolean = false;

  form_group: FormGroup = this.form_builder.group({
    idMailingList: new FormControl(undefined, [Validators.required]),
    idOrganization: new FormControl(undefined, [Validators.required]),
    inputs: new FormArray([])
  });

  loading: boolean = false;

  constructor(
    private user_service: UserService,
    private contact_inbox_service: ContactInboxService,
    private form_builder: FormBuilder,
    private activated_route: ActivatedRoute,
    private router: Router
  ) {
    this.current_user = this.user_service.getCurrentUser();
  }


  get lang() {
    if (this.langDB && this.currentLang) {
      return this.langDB.find((l) => l.lang == this.currentLang);
    }
    return {
      keys: {},
    };
  }

  get inputs_array(): FormArray {
    return this.form_group.get('inputs') as FormArray;
  }

  ngOnInit() {
    if (!this.idMailingList) {
      this.idMailingList = this.activated_route.snapshot.params.id;
    }
    if (!this.idOrganization) {
      if (this.current_user) {
        this.idOrganization = this.current_user.idIglesia;
      } else {
        this.idOrganization = this.activated_route.snapshot.queryParams.idOrganization;
      }
    }
    if (this.idOrganization) {
      this.form_group.get('idOrganization').setValue(this.idOrganization);
    } else {
      this.contact_inbox_service.api.showToast(`This form is not available.`, ToastType.error);
      this.router.navigateByUrl('/login');
      return;
    }
    if (this.idMailingList) {
      this.form_group.get('idMailingList').setValue(this.idMailingList);
    }
    this.setLanguages();
    this.getContactInfo();
    if (this.idMailingList && !this.is_preview) {
      this.getDetail();
    }
    if(this.mailing_list){
      if (this.mailing_list.inputs) {
        this.setInputsAsControls();
      }
    }
  }

  async setLanguages() {
    console.log(this.currentLang);

    if (!this.currentLang) {
      const is_locked_or_maintenance = await this.user_service.api
        .get(`iglesias/contact_info/getCountryCode`, { idIglesia: this.idOrganization })
        .toPromise()
        .catch(err => { return { country_code: undefined, country: undefined, code_language: undefined } }) as any;

      console.log(is_locked_or_maintenance);
      if (is_locked_or_maintenance.code_language) {
        // this.currentLang = is_locked_or_maintenance.code_language;
      }
    }

    this.langDB = await this.user_service.api
      .get(`public/langs`).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    console.log(this.langDB);

  }

  async getDetail() {
    this.loading = true;
    const parmas: Partial<MailingListParams> = {
      idOrganization: this.idOrganization
    };
    const response: any = await this.contact_inbox_service.getContactInboxDetail(this.idMailingList, parmas).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.mailing_list = response;
      if (this.mailing_list.inputs) {
        while (this.inputs_array.length > 0) {
          this.inputs_array.removeAt(0);
        }
        this.setInputsAsControls();
      }
    }
    this.loading = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.mailing_list) {
      this.mailing_list.organization = this.organization;
      if (this.is_preview) {
        while (this.inputs_array.length > 0) {
          this.inputs_array.removeAt(0);
        }
        this.setInputsAsControls();
      }
    }
  }
  setInputsAsControls() {
    this.mailing_list.inputs.forEach(x => {
      const group = this.form_builder.group({
        idMailingListInput: new FormControl(x.idMailingListInput),
        idMailingListInputType: new FormControl(x.idMailingListInputType),
        label: new FormControl(x.label),
        placeholder: new FormControl(x.placeholder),
        show_hint: new FormControl(x.show_hint),
        hint: new FormControl(x.hint),
        options: new FormControl(x.options),
        custom_label: new FormControl(x.custom_label),
        custom_placeholder: new FormControl(x.custom_placeholder),
        custom_hint: new FormControl(x.custom_hint),
      });
      if (!this.is_preview) {
        group.addControl('id', new FormControl(x.id, [Validators.required]));
      }
      let control: FormControl;
      let validators: ValidatorFn[] = [];
      if (x.is_required) {
        validators.push(Validators.required);
      }
      if (x.idMailingListInputType == 10) {
        validators.push(Validators.email);
      }
      if (x.idMailingListInputType == 11) {
        const url_pattern: RegExp = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
        const url_validator = (control: FormControl) => {
          const url = control.value;
          if (!url || Validators.required(control)) {
            // Return null if the control value is empty or required validation fails
            return null;
          }

          // Perform the URL validation using the pattern
          return url_pattern.test(url) ? null : { invalidUrl: true };
        };
        validators.push(url_validator);
      }
      control = this.form_builder.control(undefined, validators);
      group.addControl('value', control);
      this.inputs_array.push(group);
    })
  }

  getLangs() {
    this.contact_inbox_service.api
      .get("public/langs")
      .subscribe((response: any) => {
        this.langDB = response;
      }, (error) => {
        console.error(error);
        console.error(error.response);
      });
  }

  async getContactInfo() {
    const response: any = await this.contact_inbox_service.api
      .get(
        `iglesias/contact_info/?idIglesia=${this.idOrganization}`
      ).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.contact_info = response.contact;
      if (this.mailing_list) {
        this.organization = response.organization;
        this.mailing_list.organization = response.organization;
      }
      // this.mailing_list = {
      //   organization: res.organization
      // };
    }
  }

  setCheckedValues(input: FormGroup, option: MailingListInputOption, event) {
    option.checked = event.target.checked;
    input.get('value').markAsTouched();
    input.get('value').setValue('');
    const options: MailingListInputOption[] = input.value.options;
    const value = options.filter(x => x.checked).map(x => x.value).join(', ');
    input.get('value').setValue(value);
  }

  async submit() {
    if (this.is_preview) {
      this.submitted = true;
    } else {
      this.loading = true;
      if (this.form_group.invalid) {
        this.loading = false;
        const array = this.form_group.get('inputs') as FormArray;
        array.controls.forEach((c: FormGroup) => {
          const option_control_names = Object.keys(c.controls);
          option_control_names.forEach(option_name => {
            c.get(option_name).markAsDirty();
          })
        });
        this.contact_inbox_service.api.showToast(`Please fill the form`, ToastType.info);
        return;
      }
      const payload = this.form_group.value;
      const timezone = moment.tz.guess();
      const moment_info = moment.tz(timezone);
      payload.tz_abbr = moment_info.zoneAbbr();
      payload.utc_offset = moment_info.format('Z');
      payload.v2 = true;

      const response: any = await this.contact_inbox_service.saveContactResponse(payload).toPromise()
        .catch(error => {
          console.error(error);
          this.contact_inbox_service.api.showToast('Error saving your response', ToastType.error);
          return;
        });
      if (response) {
        this.submitted = true;
      }
      this.loading = false;
    }

  }

  getPicture() {
    if (this.mailing_list) {
      if (this.mailing_list.organization) {
        return `${environment.serverURL}${this.mailing_list.organization.logo}`;
      }
    }
  }

}
