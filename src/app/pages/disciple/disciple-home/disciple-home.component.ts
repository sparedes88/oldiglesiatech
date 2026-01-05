import { FormControl, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import * as moment from 'moment';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { DisciplerModel } from '../approved-discipler-form/approved-discipler-form.component';
import { ToastType } from 'src/app/login/ToastTypes';
import { environment } from "src/environments/environment";

export class DiscipleDisciplersModel {
  id: number;
  idDisciple: number;
  idDiscipler: number;
  status: boolean;
  full_name: string;
  discipler_full_name: string;
  last_note_date: Date | string;
  last_note_category: string;
  notes_count: number;

  edit_mode?: boolean;
  add_mode?: boolean;
  disciple_picture?: string;
  discipler_picture?: string;
}


@Component({
  selector: 'app-disciple-home',
  templateUrl: './disciple-home.component.html',
  styleUrls: ['./disciple-home.component.scss']
})
export class DiscipleHomeComponent implements OnInit {

  show_approved: boolean = false;
  show_new_disciple: boolean = false;
  show_add_note_form: boolean = false;
  actual_disciple_disciple_id: number;
  approved_disciples: DisciplerModel[] = [];
  disciple_user: DisciplerModel;
  disciples: DiscipleDisciplersModel[] = [];

  currentUser: User;

  search_filters: FormGroup = this.form_builder.group({
    idDiscipler: new FormControl(),
    selected_discipler: new FormControl([]),
    search_input: new FormControl()
  });

  disciples_form: FormGroup = this.form_builder.group({
    disciples: new FormArray([])
  });

  new_disciple_discipler: FormGroup;

  public selectCatOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'full_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  }

  constructor(
    private user_service: UserService,
    private form_builder: FormBuilder,
    private api: ApiService

  ) {
    this.currentUser = this.user_service.getCurrentUser();
  }

  get is_a_form_opened() {
    return (this.show_approved || this.show_new_disciple || this.show_add_note_form)
  }

  get disciples_form_array() {
    return this.disciples_form.get('disciples') as FormArray;
  }

  get filtered_disciples() {
    let search_input: string = this.search_filters.get('search_input').value;
    if (search_input) {
      search_input = search_input.toLowerCase();
      return this.disciples.filter(x => x.full_name.toLowerCase().includes(search_input)
        || x.discipler_full_name.toLowerCase().includes(search_input)
      )
    }
    return this.disciples;
  }

  ngOnInit() {
    this.getUserDisciple()

  }

  async getUserDisciple() {
    const response: any = await this.api.get(`disciples/disciplers/user/${this.currentUser.idUsuario}`, { idIglesia: this.currentUser.idIglesia }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      })
    if (response) {
      this.disciple_user = response.discipler;
      if (this.disciple_user.idDisciplerAccess === 1 || this.currentUser.isSuperUser) {
        this.getApprovedDisciplers();
      }
      this.getDisciples();
    }
  }

  openApprovedForm() {
    this.show_approved = true;
  }

  async getDisciples() {
    let params: {
      idIglesia: number;
      idUsuario: number;
      idDiscipler?: number
    } = {
      idIglesia: this.currentUser.idIglesia,
      idUsuario: this.currentUser.idUsuario
    };
    if (this.disciple_user.idDisciplerAccess === 1 || this.currentUser.isSuperUser) {
      const payload = this.search_filters.value;
      if (payload.selected_discipler.length > 0) {
        params.idDiscipler = payload.selected_discipler[0].id
      }
    }
    const response: any = await this.api.get('disciples',
      params).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });

    if (response) {
      this.disciples = response.disciples;
      this.resetFormArray();
      this.fillFormArray();
    }
  }
  async getApprovedDisciplers() {
    const response: any = await this.api.get('disciples/disciplers',
      {
        idIglesia: this.currentUser.idIglesia
      }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.approved_disciples = response.disciplers;
    }
  }

  resetFormArray() {
    while (this.disciples_form_array.length > 0) {
      this.disciples_form_array.removeAt(0);
    }
  }

  fillFormArray() {
    this.disciples.forEach(x => {
      const group = this.form_builder.group({
        id: new FormControl(x.id),
        idDisciple: new FormControl(x.idDisciple, [Validators.required]),
        idDiscipler: new FormControl(x.idDiscipler, [Validators.required]),
        selected_discipler: new FormControl(this.approved_disciples.filter(d => d.id === x.idDiscipler))
      });
      console.log(group);
      this.disciples_form_array.push(group);
    })
  }

  getDayDiff(disciple: DiscipleDisciplersModel) {
    return moment().diff(disciple.last_note_date, 'day');
  }

  available_users(disciple: DiscipleDisciplersModel, add_item?: boolean) {
    const idDisciple: number = disciple.idDisciple;
    const actual_disciplers = this.disciples.filter(x => x.idDisciple === idDisciple).map(x => x.idDiscipler);
    const array = this.approved_disciples.filter(x => !actual_disciplers.includes(x.id));
    if (add_item) {
      const discipler = new DisciplerModel();
      discipler.id = disciple.idDiscipler;
      discipler.full_name = disciple.discipler_full_name;
      array.unshift(discipler);
    }
    return array;
  }

  addNote(disciple: DiscipleDisciplersModel) {
    this.show_add_note_form = true;
    this.actual_disciple_disciple_id = disciple.id;
  }

  cancelDiscipler(disciple: DiscipleDisciplersModel, form: FormGroup) {
    form.get('idDiscipler').setValue(disciple.idDiscipler);
    form.get('selected_discipler').setValue(this.approved_disciples.filter(d => d.id === disciple.idDiscipler));
    console.log(form);
    disciple.edit_mode = false;
    disciple.add_mode = false;
  }

  async updateDiscipler(disciple: DiscipleDisciplersModel, form: FormGroup) {
    const actual_idDiscipler = disciple.idDiscipler;
    const payload = form.value;
    if (payload.selected_discipler.length === 0) {
      this.api.showToast(`You need to select a discipler.`, ToastType.info);
      return;
    }
    const idDiscipler = payload.selected_discipler[0].id;
    if (idDiscipler === actual_idDiscipler) {
      disciple.edit_mode = false;
      return;
    }
    payload.idDiscipler = idDiscipler;
    console.log(form);
    const response = await this.api.patch(`disciples/${disciple.id}`, payload).toPromise()
      .catch(error => {
        console.error(error);
        form.get('idDiscipler').setValue(disciple.idDiscipler);
        form.get('selected_discipler').setValue(this.approved_disciples.filter(d => d.id === disciple.idDiscipler));
        this.api.showToast(`Error saving info`, ToastType.error);
        return;
      });
    if (response) {
      disciple.edit_mode = false;
      this.api.showToast(`Info saved correctly`, ToastType.success);
      this.getDisciples();
    }

  }
  async addDiscipler(disciple: DiscipleDisciplersModel, form: FormGroup) {
    const actual_idDiscipler = disciple.idDiscipler;
    const payload = form.value;
    if (payload.selected_discipler.length === 0) {
      this.api.showToast(`You need to select a discipler.`, ToastType.info);
      return;
    }
    const idDiscipler = payload.selected_discipler[0].id;
    if (idDiscipler === actual_idDiscipler) {
      disciple.edit_mode = false;
      return;
    }
    payload.idDiscipler = idDiscipler;
    console.log(form);
    const response = await this.api.post(`disciples`, payload).toPromise()
      .catch(error => {
        console.error(error);
        form.get('idDiscipler').setValue(disciple.idDiscipler);
        form.get('selected_discipler').setValue(this.approved_disciples.filter(d => d.id === disciple.idDiscipler));
        this.api.showToast(`Error saving info`, ToastType.error);
        return;
      });
    if (response) {
      disciple.edit_mode = false;
      this.api.showToast(`Info saved correctly`, ToastType.success);
      this.getDisciples();
    }

  }

  addNewDiscipleDiscpler(disciple: DiscipleDisciplersModel) {
    disciple.add_mode = true;
    this.new_disciple_discipler = this.form_builder.group({
      id: new FormControl(),
      idDisciple: new FormControl(disciple.idDisciple, [Validators.required]),
      idDiscipler: new FormControl(undefined, [Validators.required]),
      selected_discipler: new FormControl([]),
      created_by: new FormControl(this.currentUser.idUsuario)
    });
  }

  addNewDiscipler() {
    const discipler = new DisciplerModel();
    discipler.created_by = this.currentUser.idUsuario;
    this.show_new_disciple = true;
  }

  closeNoteForm(data) {
    this.actual_disciple_disciple_id = undefined;
    this.show_add_note_form = false;
    if (data) {
      this.getDisciples();
    }
  }

  async deleteDiscipleDiscipler(disciple: DiscipleDisciplersModel) {
    if (confirm(`Are you sure you want to delete ${disciple.full_name} with ${disciple.discipler_full_name} as discipler`)) {
      const response = await this.api.delete(`disciples/${disciple.id}?deleted_by=${this.currentUser.idUsuario}`).toPromise()
        .catch(error => {
          console.error(error);
          this.api.showToast(`Error deleting the disciple.`, ToastType.error);
          return;
        });
      if (response) {
        this.getDisciples();
      }
    }
  }

  print() {
    const path: string = `${environment.apiUrl}/disciples/pdf?idIglesia=${this.currentUser.idIglesia}&idUsuario=${this.currentUser.idUsuario}`;
    const win = window.open(path, "_blank");
    win.focus();
  }
}
