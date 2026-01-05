import { GroupNoteModel } from './../../../models/GroupModel';
import { ToastType } from './../../../login/ToastTypes';
import { Observable } from 'rxjs';
import { GroupsService } from './../../../services/groups.service';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl, NgForm } from '@angular/forms';
import { GroupModel } from 'src/app/models/GroupModel';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-view-group-notes',
  templateUrl: './view-group-notes.component.html',
  styleUrls: ['./view-group-notes.component.scss']
})
export class ViewGroupNotesComponent implements OnInit {

  // tslint:disable-next-line: no-output-on-prefix
  @Output() onDismiss = new EventEmitter();

  @Input() show_dismiss: boolean = true;

  currentUser: User;
  group: GroupModel;
  show_editable: boolean = false;
  show_loading: boolean = false;
  notes: GroupNoteModel[] = [];

  noteForm: FormGroup;
  noteStatusForm: FormGroup = this.formBuilder.group({
    statuses: new FormArray([])
  });

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private groupService: GroupsService
  ) { }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    console.log(this.currentUser);

  }

  getNotes() {
    this.show_loading = true;
    return new Promise((resolve, reject) => {
      this.groupService.getGroupNotes(this.group)
        .subscribe((response: any) => {
          this.notes = response.notes;
          this.noteStatusForm = this.formBuilder.group({
            statuses: this.formBuilder.array([])
          });
          this.notes.forEach(note => {
            const control = this.noteStatusForm.controls.statuses as FormArray;
            control.push(this.formBuilder.group({
              idGroupNote: new FormControl(note.idGroupNote, [
                Validators.required,
              ]),
              note: new FormControl(note.note, [
                Validators.required,
              ])
            }));
          });

          this.show_loading = false;
          return resolve(this.notes);
        }, error => {
          this.show_loading = false;
          if (error.error.msg.Code === 404) {
            this.notes = [];
            return resolve([]);
          }
          console.error(error);
          this.groupService.api.showToast(`Error getting notes.`, ToastType.error);
          return reject([]);
        });
    });
  }

  get status_on_form(): FormArray {
    return this.noteStatusForm.get('statuses') as FormArray;
  }

  addNote(noteForm: NgForm) {
    this.show_loading = true;
    if (noteForm.valid) {
      const payload = noteForm.value;
      let subscription: Observable<any>;
      let success_message: string;
      let error_message: string;
      if (payload.idGroupEventNote) {
        // update
        subscription = this.groupService.updateGroupNote(payload);
        success_message = `Note updated successfully.`;
        error_message = `Error updating note.`;
      } else {
        // add
        subscription = this.groupService.addGroupNote(payload);
        success_message = `Note added successfully.`;
        error_message = `Error adding note.`;
      }
      subscription
        .subscribe(response => {
          this.getNotes();
          this.deactivateForm();
          this.groupService.api.showToast(`${success_message}`, ToastType.success);
        }, error => {
          console.error(error);
          this.groupService.api.showToast(`${error_message}`, ToastType.error);
          this.show_loading = false;
        });
    } else {
      this.show_loading = false;
      this.groupService.api.showToast(`Some errors in form. Please check.`, ToastType.error);
    }
  }

  updateNote(note: GroupNoteModel) {
    this.activateForm(Object.assign({}, note));
  }

  deleteNote(note: GroupNoteModel) {
    if (confirm(`Delete ${note.note}?`)) {
      note.deleted_by = this.currentUser.idUsuario;
      this.groupService.deleteGroupNote(note)
        .subscribe(data => {
          this.getNotes();
          this.groupService.api.showToast(`Note successfully deleted.`, ToastType.success);
        },
          err => {
            console.error(err);
            this.groupService.api.showToast(`Error deleting note.`, ToastType.error);
          });
    }
  }

  activateForm(note?: GroupNoteModel) {
    // setTimeout(() => {
    this.noteForm = this.formBuilder.group({
      idGroup: [this.group.idGroup, Validators.required],
      submitted_date: [new Date(), [Validators.required]],
      note: ['', [Validators.required]],
      created_by: [this.currentUser.idUsuario]
    });
    if (note) {
      this.noteForm.addControl('idGroupNote', new FormControl(note.idGroupNote,
        [
          Validators.required
        ]));

      this.noteForm.patchValue(note);
      this.noteForm.addControl('updated_by', new FormControl(this.currentUser.idUsuario,
        [
          Validators.required
        ]));
    }

    this.show_editable = true;
  }

  deactivateForm() {
    this.show_editable = false;
    this.noteForm = undefined;
  }

  getPermissions() {
    if (this.group) {
      if (this.currentUser.isSuperUser) {
        return false;
      }
      if (this.currentUser.idUserType === 1) {
        return false;
      }
      return true;
    } else {
      return true;
    }
  }

  dismiss(response?) {
    this.onDismiss.emit(response);
  }

  resetNoteForm(control: FormGroup, note: GroupNoteModel) {
    control.get('note').setValue(note.note);
    control.get('note').markAsPristine();
  }

  updateMemberType(control: FormGroup, note: GroupNoteModel) {
    // Compared as string because the form parse the value as string.
    if (control.value === 'undefined') {
      control.markAsPristine();
      return;
    }
    const note_temp = Object.assign({}, note);
    note_temp.note = control.get('note').value;
    if (note_temp.note === note.note) {
      control.get('note').setValue(note.note);
      control.get('note').markAsPristine();
    } else {
      note_temp.updated_by = this.currentUser.idUsuario;
      this.groupService.updateGroupNote(note_temp)
        .subscribe(response => {
          this.groupService.api.showToast(`Note updated.`, ToastType.info);
          control.get('note').setValue(note_temp.note);
          control.get('note').markAsPristine();
          this.getNotes();
        }, error => {
          console.error(error);
          this.groupService.api.showToast(`Error updating the note. Reversing changes...`, ToastType.error);
          control.get('note').setValue(note.note);
          control.get('note').markAsPristine();
        });
    }

  }

}
