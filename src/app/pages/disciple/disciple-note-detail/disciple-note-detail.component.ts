import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { ApiService } from 'src/app/services/api.service';
import { DiscipleDisciplersModel } from '../disciple-home/disciple-home.component';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastType } from 'src/app/login/ToastTypes';

export class DiscipleDisciplerNoteModel {
  id: number;
  idDiscipleNoteCategory: number;
  content: string;
  category_name: string;
  full_name: string;
  disciple_picture: string;
  discipler_picture: string;
  discipler_full_name: string;
  created_at: string | Date;
}

@Component({
  selector: 'app-disciple-note-detail',
  templateUrl: './disciple-note-detail.component.html',
  styleUrls: ['./disciple-note-detail.component.scss']
})
export class DiscipleNoteDetailComponent implements OnInit {

  show_add_note_form: boolean = false;

  currentUser: User;

  disciple: DiscipleDisciplersModel;
  disciple_disciplers_id: number;

  selected_note: DiscipleDisciplerNoteModel;
  notes: DiscipleDisciplerNoteModel[] = [];
  categories: any = [];

  search_filter_form: FormGroup = this.form_builder.group({
    idDiscipleNoteCategory: new FormControl(undefined, [Validators.required]),
    selected_category: new FormControl([], [Validators.required]),
  });

  public selectCatOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  }

  constructor(
    private api: ApiService,
    private user_service: UserService,
    private activated_route: ActivatedRoute,
    private form_builder: FormBuilder
  ) {
    this.currentUser = this.user_service.getCurrentUser();
  }
  ngOnInit() {
    this.disciple_disciplers_id = Number(this.activated_route.snapshot.paramMap.get('idDiscipleDiscipler'));
    this.getDiscipleDetail();
    this.getNotes();
    this.getCategories();
  }

  async getDiscipleDetail() {
    const response: any = await this.api.get(`disciples/disciplers/detail/${this.disciple_disciplers_id}`,
      {
        idIglesia: this.currentUser.idIglesia,
        idUser: this.currentUser.idUsuario
      }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.disciple = response.disciple;
    }
  }

  async getNotes() {
    let params: {
      idIglesia: number;
      idUser: number;
      idDiscipleNoteCategory?: number;
    } = {
      idIglesia: this.currentUser.idIglesia,
      idUser: this.currentUser.idUsuario
    };

    const search_payload = this.search_filter_form.value;
    if (search_payload.selected_category.length > 0) {
      params.idDiscipleNoteCategory = search_payload.selected_category[0].id
    }
    const response: any = await this.api.get(`disciples/disciplers/${this.disciple_disciplers_id}/notes`,
      params).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.notes = response.notes;
    }
  }

  async getCategories() {
    const response: any = await this.api.get('disciples/categories', { idIglesia: this.currentUser.idIglesia }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.categories = response.categories;
    }
  }

  fixUrl(image: string) {
    if (image) {
      if (image.includes('https://')) {
        return `${image}`;
      }
      return `${this.api.baseUrl}${image}`;
    }
    return 'assets/img/default-image.jpg';
  }

  editNote(note: DiscipleDisciplerNoteModel) {
    this.selected_note = note;
    this.show_add_note_form = true;
  }

  async deleteItem(note: DiscipleDisciplerNoteModel) {
    if (confirm('Are you sure you want to delete this note?')) {
      const response: any = await this.api.delete(`disciples/disciplers/${this.disciple_disciplers_id}/notes/${note.id}?idIglesia=${this.currentUser.idIglesia}&deleted_by=${this.currentUser.idUsuario}`).toPromise()
        .catch(error => {
          console.error(error);
          this.api.showToast(`Error deleting the note.`, ToastType.error);
          return;
        });
      if (response) {
        this.getNotes();
        this.api.showToast(`Note deleted successfully.`, ToastType.success);
      }
    }

  }

}
