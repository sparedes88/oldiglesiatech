import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { DisciplerModel } from '../approved-discipler-form/approved-discipler-form.component';
import { ApiService } from 'src/app/services/api.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { ContactInboxService } from 'src/app/services/contact-inbox.service';

@Component({
  selector: 'app-disciple-form',
  templateUrl: './disciple-form.component.html',
  styleUrls: ['./disciple-form.component.scss']
})
export class DiscipleFormComponent implements OnInit {

  contacts: any[] = [];
  mailing_list_contacts: any[] = [];
  @Input('disciplers') disciplers: DisciplerModel[] = [];

  @Output('close') close: EventEmitter<any> = new EventEmitter<any>();

  currentUser: User;

  new_disciple_discipler = this.form_builder.group({
    id: new FormControl(),
    idUser: new FormControl(undefined, []),
    selected_user: new FormControl([]),
    idDisciplers: new FormControl(undefined, [Validators.required]),
    created_by: new FormControl(undefined, [Validators.required]),
    idIglesia: new FormControl(undefined, [Validators.required]),
    selected_mailing_list: new FormControl([]),
    idMailingListContact: new FormControl(undefined, []),
    table_reference: new FormControl('', []),
  });

  public selectCatOptions: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'full_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  }

  public selectUserOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idUsuario',
    textField: 'full_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  }
  public selectContactInboxUserOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  }

  getting_elements: boolean = false;

  constructor(
    private form_builder: FormBuilder,
    private user_service: UserService,
    private api: ApiService,
    private contact_inbox_service: ContactInboxService
  ) {
    this.currentUser = this.user_service.getCurrentUser();
  }

  ngOnInit() {
    this.new_disciple_discipler.get('created_by').setValue(this.currentUser.idUsuario);
    this.new_disciple_discipler.get('idIglesia').setValue(this.currentUser.idIglesia);
    // this.getContacts();
  }

  async getElementsByType() {
    this.getting_elements = true;
    const table_reference: string = this.new_disciple_discipler.get('table_reference').value;

    if (table_reference == 'users') {
      await this.getContacts();
    } else {
      await this.getMailingListContacts();
    }
    this.getting_elements = false;
  }

  async getContacts() {
    const response: any = await this.api.get('users', {
      idIglesia: this.currentUser.idIglesia,
      minimal: true
    }).toPromise()
      .catch(error => {
        console.error(error);
        this.api.showToast(`Error getting contacts.`, ToastType.error);
        return;
      });
    if (response) {
      this.contacts = response.users
    }
  }

  async getMailingListContacts() {
    const response: any = await this.contact_inbox_service.getAllContacts(this.currentUser.idIglesia)
      .toPromise()
      .catch(error => {
        console.error(error);
        this.api.showToast(`Error getting contacts.`, ToastType.error);
        return;
      });
    if (response) {
      this.mailing_list_contacts = response
    }
  }

  async saveNewDisciple() {
    console.log(this.new_disciple_discipler);

    const payload = this.new_disciple_discipler.value;
    if (payload.table_reference == 'users') {
      if (payload.selected_user.length > 0) {
        this.new_disciple_discipler.get('idUser').setValue(payload.selected_user[0].idUsuario);
        payload.idUser = payload.selected_user[0].idUsuario;
      } else {
        this.new_disciple_discipler.get('idUser').setValue(undefined);
      }
    } else if (payload.table_reference == 'mailing_list') {
      if (payload.selected_mailing_list.length > 0) {
        this.new_disciple_discipler.get('idMailingListContact').setValue(payload.selected_mailing_list[0].id);
        payload.idMailingListContact = payload.selected_mailing_list[0].id;
      } else {
        this.new_disciple_discipler.get('idMailingListContact').setValue(undefined);
      }
    }
    if (this.new_disciple_discipler.invalid) {
      this.api.showToast(`Some info is required, please fill all the info`, ToastType.info);
      return;
    }
    payload.selected_user = undefined;
    payload.selected_mailing_list = undefined;
    payload.idDisciplers = payload.idDisciplers.map(x => x.id);
    const response: any = await this.api.post(`disciples/new`, payload).toPromise()
      .catch(error => {
        console.error(error);
        this.api.showToast(`Error creating new disciple.`, ToastType.error);
        return;
      });
    if (response) {
      this.api.showToast(`Disciple created successfully.`, ToastType.success);
      this.close.emit();
    }
  }

}
