import { ActivatedRoute } from '@angular/router';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { User } from 'src/app/interfaces/user';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { DiscipleDisciplerNoteModel } from '../disciple-note-detail/disciple-note-detail.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-disciple-note-form',
  templateUrl: './disciple-note-form.component.html',
  styleUrls: ['./disciple-note-form.component.scss']
})
export class DiscipleNoteFormComponent implements OnInit {

  @Input('idDiscipleDiscipler') idDiscipleDiscipler: number;
  @Input('note') note: DiscipleDisciplerNoteModel;

  @Output('close') close: EventEmitter<any> = new EventEmitter<any>();

  currentUser: User;
  categories: any = [];
  public quill: any;

  public selectCatOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  }

  note_form: FormGroup = this.form_builder.group({
    // idDiscipleDiscipler: new FormControl(undefined, [Validators.required]),
    idDiscipleNoteCategory: new FormControl(undefined, [Validators.required]),
    selected_category: new FormControl([], [Validators.required]),
    created_by: new FormControl(undefined, [Validators.required]),
    content: new FormControl('', [Validators.required])
  })

  public modules: any = {
    toolbar: {
      container: [
        [{ font: [] }],
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike"],
        [{ header: 1 }, { header: 2 }],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image"],
      ],
    },
    imageResize: true,
  };

  constructor(
    private api: ApiService,
    private user_service: UserService,
    private form_builder: FormBuilder,
    private activated_route: ActivatedRoute
  ) {
    this.currentUser = this.user_service.getCurrentUser();
  }

  ngOnInit() {
    this.note_form.get('created_by').setValue(this.currentUser.idUsuario);
    this.getGroupCategories(this.currentUser.idIglesia);
    if (!this.idDiscipleDiscipler) {
      this.idDiscipleDiscipler = Number(this.activated_route.snapshot.paramMap.get('idDiscipleDiscipler'));
    }
    if (this.note) {
      this.note_form.get('idDiscipleNoteCategory').setValue(this.note.idDiscipleNoteCategory);
      this.note_form.get('content').setValue(this.note.content);
    }
  }

  onEditorCreated(quill) {
    var toolbar = quill.getModule("toolbar");
    toolbar.addHandler("image", this.imageHandler);
    this.quill = quill;
  }

  imageHandler(value) {
    const inputFile: any = document.getElementById("fileUpload");
    inputFile.click();
  }

  getGroupCategories(idIglesia: number) {
    this.api.get('disciples/categories', { idIglesia }).subscribe(
      (response: any) => {
        this.categories = response.categories;
        if (this.note) {
          this.note_form.get('idDiscipleNoteCategory').setValue(this.note.idDiscipleNoteCategory);
          this.note_form.get('selected_category').setValue(this.categories.filter(x => x.id === this.note.idDiscipleNoteCategory));
        }
      },
      err => console.error(err)
    );
  }

  async submit() {
    const payload = this.note_form.value;
    if (payload.selected_category.length === 0) {
      this.api.showToast(`You need to select a category.`, ToastType.info);
      return;
    }
    const idDiscipleNoteCategory = payload.selected_category[0].id;
    payload.idDiscipleNoteCategory = idDiscipleNoteCategory;
    payload.selected_category = undefined;
    console.log(this.note_form);
    let call_action: Observable<any>;
    if (this.note) {
      call_action = this.api.patch(`disciples/disciplers/${this.idDiscipleDiscipler}/notes/${this.note.id}`, payload);
    } else {
      call_action = this.api.post(`disciples/disciplers/${this.idDiscipleDiscipler}/notes/`, payload);
    }
    const response = await call_action.toPromise()
      .catch(error => {
        console.error(error);
        this.api.showToast(`Error saving info`, ToastType.error);
        return;
      });
    if (response) {
      this.api.showToast('Note saved successfully', ToastType.success);
      this.close.emit(true);
    }
  }

}
