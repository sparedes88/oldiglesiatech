import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { upperFirst } from 'lodash';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

export class DisciplerModel {
  id: number;
  full_name: string;
  access_name: string;
  idUser: number;
  created_by: number;
  idDisciplerAccess: number;

  constructor() {

  }
}

@Component({
  selector: 'app-approved-discipler-form',
  templateUrl: './approved-discipler-form.component.html',
  styleUrls: ['./approved-discipler-form.component.scss']
})
export class ApprovedDisciplerFormComponent implements OnInit {

  @Output('close') close: EventEmitter<any> = new EventEmitter<any>();

  records: DisciplerModel[] = [];
  show_form: boolean = false;
  currentUser: User;

  discipler_form: FormGroup = this.form_builder.group({
    id: new FormControl(),
    selected_user: new FormControl([]),
    idUser: new FormControl(),
    idDisciplerAccess: new FormControl(),
    idOrganization: new FormControl(),
    created_by: new FormControl()
  });

  users: any[] = [];
  original_users: any[] = [];
  public selectCatOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idUsuario',
    textField: 'full_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  }
  loading: boolean = false;

  constructor(
    private api: ApiService,
    private form_builder: FormBuilder,
    private user_service: UserService
  ) {
    this.currentUser = this.user_service.getCurrentUser();
    this.discipler_form.get('idOrganization').setValue(this.currentUser.idIglesia);
    this.discipler_form.get('created_by').setValue(this.currentUser.idUsuario);
  }

  ngOnInit() {
    this.getDisciplers();
  }

  async getUsers() {
    const subscription: any = await this.api.get(`getUsuarios`, { idIglesia: this.currentUser.idIglesia })
      .toPromise()
      .catch(error => {
        console.error(error);
        return;
      });

    if (subscription) {
      this.original_users = subscription.usuarios.filter(u => u.estatus);
      const ids = this.records.map(x => x.idUser);
      this.original_users.forEach(element => {
        element.full_name = `${element.nombre} ${element.apellido}`;
      });
      this.users = this.original_users.filter(u => !ids.includes(u.idUsuario));
      console.log(this.original_users);

    }

  }

  async getDisciplers() {
    const response: any = await this.api.get('disciples/disciplers',
      {
        idIglesia: this.currentUser.idIglesia
      }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.records = response.disciplers;
      console.log(response);
      console.log(this.records);
      await this.getUsers();
    }
  }

  openAddForm() {
    this.show_form = true;
    this.discipler_form.reset();
    this.discipler_form.get('idOrganization').setValue(this.currentUser.idIglesia);
    this.discipler_form.get('created_by').setValue(this.currentUser.idUsuario);
    this.discipler_form.get('selected_user').setValue([]);
  }

  openEditForm(item: DisciplerModel) {
    this.discipler_form.patchValue(item);
    const users = this.original_users.filter(x => x.idUsuario === item.idUser);
    this.discipler_form.patchValue({
      selected_user: users
    });
    console.log(item);
    console.log(this.discipler_form);
    this.show_form = true;
  }

  async submitForm() {
    this.loading = true;
    const payload = this.discipler_form.value;
    payload.created_by = this.currentUser.idUsuario;
    if (payload.selected_user.length > 0) {
      payload.idUser = payload.selected_user[0].idUsuario;
    } else {
      this.api.showToast(`Please select a contact`, ToastType.info);
      this.loading = false;
      return;
    }
    let subscription: Observable<any>;
    if (payload.id) {
      subscription = this.api.patch(`disciples/disciplers/${payload.id}`, payload);
    } else {
      subscription = this.api.post(`disciples/disciplers/`, payload);
    }
    const response: any = await subscription.toPromise()
      .catch(error => {
        console.error(error);
        this.api.showToast(`Error saving the info.`, ToastType.error);
        return;
      });
    if (response) {
      this.api.showToast(`Info saved successfully.`, ToastType.success);
      this.show_form = false;
      this.getDisciplers();
    }
    this.loading = false;
  }

  async deleteItem(item) {
    if (confirm('Are you sure you want to delete this discipler')) {
      const response: any = await this.api.delete(`disciples/disciplers/${item.id}?idIglesia=${this.currentUser.idIglesia}&deleted_by=${this.currentUser.idUsuario}`).toPromise()
        .catch(error => {
          console.error(error);
          this.api.showToast(`Error deleting discipler.`, ToastType.error);
          return;
        });
      if (response) {
        this.getDisciplers();
        this.api.showToast(`Discipler deleted successfully.`, ToastType.success);
      }
    }
  }

}
