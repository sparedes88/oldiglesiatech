import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subject } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';
import { NoteService } from 'src/app/services/note.service';
import { UserService } from 'src/app/services/user.service';
import { NoteFormComponent } from '../note-form/note-form.component';
import { NoteModel } from './../../../../models/NoteModel';
import * as moment from 'moment'

@Component({
  selector: 'app-notes-home',
  templateUrl: './notes-home.component.html',
  styleUrls: ['./notes-home.component.scss']
})
export class NotesHomeComponent implements OnInit {

  @Input() idIglesia: number;
  @Input() idProjectTracking: number;
  @Input() idProjectTrackingStep: number;
  @Input() notes: Array<any>;
  @Input() adminsInit: Array<any>;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  steps = {
    1: 'Reunión Inicial',
    2: 'Logo Creación',
    3: 'Contenido - Web',
    4: 'Proceso - Web',
    5: 'Entregadas - Web',
    6: 'Stripe',
    7: 'Dominio migración',
    8: 'Google Business',
    9: 'App Móvil',
    10: 'Panel Iglesia Tech',
    11: 'Soporte',
    null: ''
  }

  selectable_steps =
    [
      {
        id: 1,
        label: 'Reunión Inicial'
      },
      {
        id: 2,
        label: 'Logo Creación'
      },
      {
        id: 3,
        label: 'Contenido - Web'
      },
      {
        id: 4,
        label: 'Proceso - Web'
      },
      {
        id: 5,
        label: 'Entregadas - Web'
      },
      {
        id: 6,
        label: 'Stripe'
      },
      {
        id: 7,
        label: 'Dominio migración'
      },
      {
        id: 8,
        label: 'Google Business'
      },
      {
        id: 9,
        label: 'App Móvil'
      },
      {
        id: 10,
        label: 'Panel Iglesia Tech'
      },
      {
        id: 11,
        label: 'Soporte'
      },
      {
        id: null,
        label: 'None'
      },
    ]


  admins = []
  options = [
    { label: "Completed", id: true },
    { label: "Incomplete", id: false }
  ]
  selected_option = [false, undefined]
  selected_admin = [[],[]]
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: 'Blfrtip',
    lengthMenu: [10, 25, 50, 100, 250, 500],
    buttons: [
      { extend: 'copy', className: 'btn btn-outline-citric btn-sm' },
      { extend: 'print', className: 'btn btn-outline-citric btn-sm' },
      { extend: 'csv', className: 'btn btn-outline-citric btn-sm' },
    ],
    order: [[0, 'desc']]
  };

  currentUser: User;
  showAllNotes: Boolean = true
  allNotes: Array<any> = []
  allNotesInit: Array<any> = []
  searchValue: string = undefined
  notas: NoteModel[] = [];

  constructor(
    private userService: UserService,
    private noteService: NoteService,
    private modal: NgxSmartModalService,
    private router: Router
  ) { }

  ngOnInit() {
    console.log(this.notas)
    this.currentUser = this.userService.getCurrentUser();
    //console.log(this.idIglesia)
    /*console.log(this.idProjectTracking)
    console.log(this.idProjectTrackingStep)*/
    //console.log(this.currentUser)
    //console.log(this.selected_admin)
    if (this.idProjectTrackingStep) {
      this.showAllNotes = false
      this.resetTable().finally(() => {
        this.notas = this.notes ? this.notes : []
        this.dtTrigger.next();
      });
    } else {
      if (this.currentUser.idIglesia && this.currentUser.idIglesia !== 0) {
        this.loadNotes();
      } else {
        setTimeout(() => {
          this.noteService.api.showToast(`You need to select an organization, first. Please go to settings > Organizations and select one organization`, ToastType.info);
        });
        this.router.navigate([`/user-profile/details/${this.currentUser.idUsuario}`]);
      }
      this.getAdminsInitiated()
      this.selected_admin[1].push(this.currentUser.idUsuario)
      this.selected_option[1] = false
      this.getAllNotes()
    }
  }

  addNoteToProjectTracking(note) {
    /*console.log({
      projectTracking: this.projectTrackingId,
      projectTrackStep: step,
      noteList: this.selected_notes[step]
    })*/
    this.noteService.addNoteToTracking(null, note.step, [note.idNotaIglesia], note.idIglesia).subscribe((data: any) => {
      console.log(data)
    }, (error) => {

    }, () => {
      if(this.showAllNotes){
        this.getAllNotes()
      } else {
        this.loadNotes()
      }
    });
  }
  async getAdminsInitiated() {
    await this.userService.getAllAdmins()
      .subscribe((data: any) => {
        console.log(data.users)
        this.adminsInit = data.users
      }, (error) => {
        console.log(error)
      }, () => {
      });
  }
  getProjectTrackingData() {
    this.noteService.getProjectTrackingNotes(this.idProjectTracking, this.idProjectTrackingStep,
      this.idIglesia ? this.idIglesia : this.currentUser.idIglesia).subscribe(data => {
        //console.log(data)
        this.resetTable().finally(() => {
          if (data) {
            this.notas = data;
            this.notes = data;
          } else {
            this.notas = [];
            this.notes = [];
          }
          this.dtTrigger.next();
        });
      }, error => {
        console.error(error);
        this.noteService.api.showToast(`Error getting notes.`, ToastType.error);
      }, () => {

      });
  }

  toogleAll() {
    this.resetTable().finally(() => {
      this.showAllNotes = !this.showAllNotes
      this.dtTrigger.next();
    })
  }

  search() {
    if (!this.showAllNotes) {
      this.notas = this.notes

      console.log(this.selected_admin[2])
      if (this.selected_admin[2].length != 0 || this.selected_option[2] != undefined) {
        this.resetTable().finally(() => {
          this.notas = this.selected_option[2] != undefined ? this.notas.filter(element => element['is_completed'] == this.selected_option[2])
          : this.notas
          this.notas = this.selected_admin.length[2] != 0 ?
            this.notas.filter(element => element['assigned_user_ids'].some(ai => this.selected_admin[2].includes(ai))) : this.notas
          this.dtTrigger.next();
        })
        console.log(this.allNotes)
      } else {
        this.resetTable().finally(() => {
          this.notas = this.notes
          this.dtTrigger.next();
        })
      }
    } else {
      this.getAllNotes()
    }
  }

  removeNoteFromTracking(idNoteTrack) {
    this.noteService.removeProjectTrackingNote(idNoteTrack).subscribe(data => {
      //console.log(data)
    }, error => {
      console.error(error);
      this.noteService.api.showToast(`Error getting notes.`, ToastType.error);
    }, () => {
      setTimeout(() => {
        this.getProjectTrackingData()
      }, 200);
    });
  }
  async resetTable() {
    if (this.dtElement.dtInstance) {
      await this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
  }

  loadNotes() {
    this.noteService.getNotes(this.idIglesia).subscribe(data => {
      this.resetTable().finally(() => {
        console.log(data)
        if (data) {
          this.notas = data.notas;
          this.notes = data.notas;
        } else {
          this.notas = [];
          this.notes = [];
        }
        this.dtTrigger.next();
      });
      //console.log(data.notas)
    }, error => {
      console.error(error);
      this.noteService.api.showToast(`Error getting notes.`, ToastType.error);
    }, () => {
      //this.dtTrigger.next();
    });
  }

  onModalDidDismiss(response) {
    this.modal.getModal((this.idProjectTrackingStep) ? 'formModal' +
      this.idProjectTrackingStep : 'formModal').close();
    if (response) {
      // this.resetTable();
      if (this.idProjectTrackingStep) {
        setTimeout(() => {
          this.getProjectTrackingData()
        }, 200);
      } else {
        if (this.currentUser.idIglesia && this.currentUser.idIglesia !== 0) {
          this.loadNotes();
        } else {
          setTimeout(() => {
            this.noteService.api.showToast(`You need to select an organization, first. Please go to settings > Organizations and select one organization`, ToastType.info);
          });
          this.router.navigate([`/user-profile/details/${this.currentUser.idUsuario}`]);
        }
        this.getAdminsInitiated()
        this.getAllNotes()
      }
    }
  }

  addObject(note_form: NoteFormComponent) {
    this.modal.getModal((this.idProjectTrackingStep) ?
      'formModal' + this.idProjectTrackingStep : 'formModal').open();
    note_form.note = new NoteModel();
    if (this.idIglesia) {
      note_form.note.idIglesia = this.idIglesia;
    } else {
      note_form.note.idIglesia = this.currentUser.idIglesia;
    }
    note_form.note.createdBy = this.currentUser.idUsuario;
    note_form.iglesia = {
      idIglesia: this.idIglesia ? this.idIglesia : this.currentUser.idIglesia,
      topic: this.currentUser.topic
    };
    if (this.idProjectTrackingStep) {
      note_form.idProjectTracking = this.idProjectTracking
      note_form.idProjectTrackingStep = this.idProjectTrackingStep
    }
    note_form.ngOnInit();
  }

  editObject(item: NoteModel, note_form: NoteFormComponent) {
    this.modal.getModal((this.idProjectTrackingStep) ? 'formModal'
      + this.idProjectTrackingStep : 'formModal').open();
    note_form.note = Object.assign({}, item);
    note_form.note.createdBy = this.currentUser.idUsuario;
    note_form.iglesia = {
      idIglesia: this.idIglesia ? this.idIglesia : this.currentUser.idIglesia,
      topic: this.currentUser.topic
    };
    note_form.ngOnInit();
  }

  updateTrackingNote(idProjectTrackingNote, is_completed, users_assigned, note?) {
    console.log("thiene")

    if (idProjectTrackingNote) {
      console.log("thiene")
      this.noteService.updateProjectTrackingNote(idProjectTrackingNote, is_completed, users_assigned).subscribe(data => {
        this.noteService.api.showToast(`Success.`, ToastType.success);
        if (this.showAllNotes) {
          this.allNotes[this.allNotes.findIndex(x => x.idNoteTrack === idProjectTrackingNote)]['changed'] = false
        } else {
          this.notas[this.notas.findIndex(x => x.idNoteTrack === idProjectTrackingNote)]['changed'] = false
        }
        //console.log(data)
      }, error => {
        console.error(error);
        this.noteService.api.showToast(`Error updating the note.`, ToastType.error);
      }, () => {
        /*setTimeout(() => {
          this.getProjectTrackingData()
        }, 200);*/
      });
    } else {
      if (note) {
        console.log("no thiene")
        this.addNoteToProjectTracking(note)
      }
    }
  }

  async getAllNotes() {
    await this.noteService.getAllNotes(this.selected_admin[1].join(','), this.selected_option[1])
      .subscribe((data: any) => {
        console.log(data)
        this.allNotes = data
        this.allNotesInit = data
      },
        err => {
          console.error(err);

        })
  }

  getFirstChar(text = "") {
    if (text) return text.charAt(0)
  }

  timeAgo(dateTime) {
    if (dateTime) {
      return moment(dateTime).fromNow()
    }
  }

  get allNotesFiltered(): Array<any> {
    if (this.searchValue) {
      return this.allNotes.filter(note => {
        const nombreIglesia: String = note.nombreIglesia.toLowerCase()
        const descripcion: String = note.descripcion.toLowerCase()
        return descripcion.includes(this.searchValue.toLocaleLowerCase())
          ||
          nombreIglesia.includes(this.searchValue.toLowerCase())
      })
    } else {
      return this.allNotes
    }
  }
}
