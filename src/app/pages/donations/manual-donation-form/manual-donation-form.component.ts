import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import * as moment from 'moment';
@Component({
  selector: 'app-manual-donation-form',
  templateUrl: './manual-donation-form.component.html',
  styleUrls: ['./manual-donation-form.component.scss']
})
export class ManualDonationFormComponent implements OnInit {

  @Output('on_refresh') on_refresh: EventEmitter<any> = new EventEmitter<any>();

  @Input('donation') donation: any;

  current_user: User;
  categories: any[] = [];
  contacts: any[] = [];

  selectOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'email',
    textField: 'full_name',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true
  };

  form_group: FormGroup = this.form_builder.group({
    is_manual: new FormControl(true),
    idOrganization: new FormControl(undefined, [Validators.required]),
    is_recurrent: new FormControl(false),
    amount: new FormControl(0, [Validators.required, Validators.min(1.00), Validators.max(100000.00)]),
    idDonationCategory: new FormControl(''),
    created_by: new FormControl(undefined, [Validators.required]),
    idUser: new FormControl(undefined),
    email: new FormControl(undefined, [Validators.required]),
    first_name: new FormControl(undefined, [Validators.required]),
    last_name: new FormControl(undefined, [Validators.required]),
    selected_user: new FormControl(undefined,),
    date: new FormControl(moment().format('YYYY-MM-DD'))
  });

  constructor(
    private api: ApiService,
    private user_service: UserService,
    private form_builder: FormBuilder
  ) {
    this.current_user = this.user_service.getCurrentUser();
    this.form_group.get('idOrganization').setValue(this.current_user.idIglesia);
    this.form_group.get('created_by').setValue(this.current_user.idUsuario);
  }

  ngOnInit() {
    this.getCategories(this.current_user.idIglesia);
    this.getContacts(this.current_user.idIglesia);
  }

  setDonation(donation: any) {
    console.log(donation);
    this.donation = donation;
    this.form_group.patchValue(donation);
    console.log(this.form_group);
    console.log(this.contacts);
    const date_format = moment(donation.date, 'MMM. DD, YYYY').format('YYYY-MM-DD');
    this.form_group.get('date').setValue(date_format);
    const user = this.contacts.find(x => x.email === donation.email);
    if (user) {
      this.form_group.get('first_name').setValue(user.nombre);
      this.form_group.get('last_name').setValue(user.apellido);
      this.form_group.get('idUser').setValue(user.idUsuario);
      this.form_group.get('email').setValue(user.email);
      this.form_group.get('selected_user').setValue([user]);
    }
  }

  getCategories(idIglesia: number) {
    this.api.get(
      `donations/categories`,
      {
        idIglesia
      }
    ).subscribe(
      (data: any) => {
        this.categories = data.categories;
      },
      err => console.error(err)
    );
  }

  getContacts(idIglesia: number) {
    this.api.get(`getUsuarios`, { idIglesia })
      .subscribe(
        (contacts: any) => {
          this.contacts = contacts.usuarios.filter(u => u.estatus === true);
          let categories = [];
          this.contacts.forEach(element => {
            element.full_name = `${element.nombre} ${element.apellido} (${element.email})`;
          });
          console.log(this.donation);
          console.log(this.contacts);

          if (this.donation) {
            const user = this.contacts.find(x => x.email === this.donation.email);
            console.log(user);
            if (user) {
              this.form_group.get('first_name').setValue(user.nombre);
              this.form_group.get('last_name').setValue(user.apellido);
              this.form_group.get('idUser').setValue(user.idUsuario);
              this.form_group.get('email').setValue(user.email);
              this.form_group.get('selected_user').setValue([user]);
            }
          }
        }, err => {
          console.error(err)
        });
  }

  dismiss(response?: any) {
    this.on_refresh.emit(response);
  }

  setEmail(selection) {
    console.log(selection);
    const user = this.contacts.find(x => x.email == selection.email);
    console.log(user);
    console.log(this.form_group);
    this.form_group.get('first_name').setValue(user.nombre);
    this.form_group.get('last_name').setValue(user.apellido);
    this.form_group.get('idUser').setValue(user.idUsuario);
    this.form_group.get('email').setValue(user.email);
  }

  async submit() {
    console.log(this.form_group);
    if (this.form_group.invalid) {
      this.api.showToast(`Please fill all the forms`, ToastType.error);
      return;
    }
    const payload = this.form_group.value;
    console.log(payload);
    payload.manual_date = moment(payload.date).format('MMM. DD, YYYY');
    let call;
    if (this.donation) {
      call = this.api.patch(`donations_v2/manual/${this.donation.id}`, payload);
    } else {
      call = this.api.post(`donations_v2/manual/`, payload);
    }
    const response: any = await call.toPromise()
      .catch(error => {
        this.api.showToast(`Error saving your donation`, ToastType.error);
        return;
      });
    if (response) {
      this.dismiss(response);
    }
  }

}
