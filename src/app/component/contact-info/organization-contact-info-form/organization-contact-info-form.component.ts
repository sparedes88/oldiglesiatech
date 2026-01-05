import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Validators, NgForm, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { UserService } from 'src/app/services/user.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { IglesiaContactoModel } from 'src/app/models/IglesiaContactoModel';

@Component({
  selector: 'app-organization-contact-info-form',
  templateUrl: './organization-contact-info-form.component.html',
  styleUrls: ['./organization-contact-info-form.component.scss']
})
export class OrganizationContactInfoFormComponent implements OnInit {

  @Input('idIglesia') idIglesia: number;
  @Input('iglesia') iglesia: any;
  @Input('view_mode') view_mode: string = 'edition';
  @Input('contact_type') contact_type: any;
  @Input('name') name: string;
  @Input('description') description: string;
  @Input('show_header') show_header: boolean = true;
  @Input('show_as_minimal') show_as_minimal: boolean = false;
  @Input('inputs_to_show') inputs_to_show: string[] = ['phones', 'emails'];


  contact: IglesiaContactoModel;

  contact_form: FormGroup = new FormGroup({
    idIglesia: new FormControl('', [Validators.required]),
    phones: new FormArray([]),
    emails: new FormArray([])
  });

  show_detail: boolean = true;

  currentUser;

  constructor(
    private organizationService: OrganizationService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    if (!this.idIglesia) {
      if (this.currentUser) {
        this.idIglesia = this.currentUser.idIglesia;
      }
    }
    if (this.idIglesia) {
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
    if (this.idIglesia) {
      this.organizationService.getContactInfo(this.idIglesia, this.contact_type)
        .subscribe((data: any) => {
          console.log(data);
          this.clearFormArray(this.phones);
          this.clearFormArray(this.emails);
          this.contact = data.contact;
          if (this.contact) {
            this.contact.phones.forEach(phone => {
              this.phones.push(
                new FormGroup({
                  name: new FormControl(phone.name, [Validators.required]),
                  phone: new FormControl(phone.phone, [Validators.required]),
                  idIglesia: new FormControl(phone.idOrganization, Validators.required),
                  idContactInfoPhone: new FormControl(phone.idContactInfoPhone, Validators.required),
                  status: new FormControl(true),
                  item_type: new FormControl(this.contact_type ? this.contact_type : 1),
                  country_code: new FormControl(phone.country_code)
                })
              );
            });
            this.contact.emails.forEach(email => {
              this.emails.push(
                new FormGroup({
                  name: new FormControl(email.name, [Validators.required]),
                  email: new FormControl(email.email, [Validators.required, Validators.email]),
                  idIglesia: new FormControl(email.idOrganization, Validators.required),
                  idContactInfoEmail: new FormControl(email.idContactInfoEmail, Validators.required),
                  status: new FormControl(true),
                  item_type: new FormControl(this.contact_type ? this.contact_type : 1)
                })
              );
            });
          }
          let idIglesia;
          if (this.idIglesia) {
            idIglesia = this.idIglesia;
          } else if (this.iglesia) {
            idIglesia = this.iglesia.idIglesia;
          } else if (this.currentUser) {
            idIglesia = this.currentUser.idIglesia;
          } else {
            this.route.queryParamMap.subscribe(params => {
              const code = params.get('idIglesia');
              if (code) {
                idIglesia = Number(code);
              }
            });
          }
          this.contact_form.get('idIglesia').setValue(idIglesia);
          console.log(this.contact_form);

        }, error => {
          console.error(error);
          this.organizationService.api.showToast(`Error getting contact info.`, ToastType.error);
        });
    }
  }

  get phones() {
    return this.contact_form.get('phones') as FormArray;
  }

  get active_phones() {
    return this.phones.controls.filter(x => x.value.status);
  }

  get emails() {
    return this.contact_form.get('emails') as FormArray;
  }


  addItem(key: string) {
    const control = (this.contact_form.get(key) as FormArray);
    const key_value_name = key === 'phones' ? 'phone' : 'email';
    const key_value_id = key === 'phones' ? 'Phone' : 'Email';
    const form_group = new FormGroup({
      name: new FormControl('', [Validators.required]),
      [key_value_name]: new FormControl('', [Validators.required]),
      idIglesia: new FormControl(this.currentUser.idIglesia, Validators.required),
      [`idContactInfo${key_value_id}`]: new FormControl(0, Validators.required),
      status: new FormControl(true),
      item_type: new FormControl(this.contact_type ? this.contact_type : 1)
    });
    if (key === 'phones') {
      form_group.addControl('country_code', new FormControl('', [Validators.required]));
    }
    control.push(form_group);
  }

  removeItem(key: string, index: number) {
    const control = (this.contact_form.get(key) as FormArray);
    const key_name = key === 'phones' ? 'phone' : 'email';
    const value = control.controls[index].get(key_name).value;
    const is_valid = control.controls[index].get(key_name).valid;
    console.log(key_name);
    console.log(value);

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

  displayEmptyMessage(key: string) {
    const control = (this.contact_form.get(key) as FormArray);
    const controls = control.controls.map(x => x.value.status);
    return controls.filter(x => x).length === 0;
  }

  submitContact(contact_form: FormGroup, group_form: NgForm) {
    if (contact_form.valid) {
      const contacto = contact_form.value;
      let success_message: string;
      let error_message: string;
      if (this.contact) {
        success_message = `Contact updated successfully.`;
        error_message = `Error updating contact.`;
      } else {
        success_message = `Contact updating successfully.`;
        error_message = `Error adding contact.`;
      }
      this.organizationService.api.post(`iglesias/contact_info/`, contacto)
        .subscribe((response: any) => {
          this.organizationService.api.showToast(`${success_message}`, ToastType.success);
          this.contact_form.markAsPristine();
        }, err => {
          console.error(err);
          this.organizationService.api.showToast(`${error_message}`, ToastType.error);
        });
    } else {
      console.log(contact_form);
      this.organizationService.api.showToast(`Please check all required fields are correct.`, ToastType.error);
    }
  }

  getSize(key) {
    const included = this.inputs_to_show.includes(key);
    let size = this.inputs_to_show.filter(x => x !== key).length;
    if (included) {
      if (size > 0) {
        return `col-xs-12 col-md-6`;
      } else {
        return `col-12`;
      }
    }
  }

}
