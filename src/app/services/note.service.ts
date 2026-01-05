import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { NoteModel } from '../models/NoteModel';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor(
    public api: ApiService,
    private userService: UserService) { }

  assignedCount = 0
  getNotes(idIglesia?: number): any {
    const resp = this.api.get('notas/getNotasSelectByIdIglesia',
      // Params
      { idIglesia: idIglesia ? idIglesia : this.userService.getCurrentUser().idIglesia }
      // reqOptions
    );
    return resp;
  }
  getAssignedCount(idUser?: number): any {
    const resp = this.api.get('notas/getAssignedCount',
      // Params
      { idUser: idUser ? idUser : this.userService.getCurrentUser().idUsuario }
      // reqOptions
    );
    return resp;
  }

  getProjectTrackingNotes(idProjectTracking: number, idProjectTrackingStep: number, idIglesia?: number): any {
    const resp = this.api
      .get(`projectTracking/notes`, { projectTracking: idProjectTracking, projectTrackStep: idProjectTrackingStep, idIglesia: idIglesia })
    return resp;
  }

  removeProjectTrackingNote(idNoteTrack: number): any {
    const resp = this.api
      .post(`projectTracking/removeTrackingNote`, {
        idNoteTrack: idNoteTrack
      })
    return resp;
  }

  updateProjectTrackingNote(idProjectTrackingNote: number, is_completed: boolean, users_assigned: Array<number>): any {
    const resp = this.api
      .post(`projectTracking/updateTrackingNote`, {
        idProjectTrackingNote: idProjectTrackingNote,
        is_completed: is_completed,
        users_assigned: users_assigned
      })
    return resp;
  }

  addNotesToTracking(idProjectTracking: number, idProjectTrackingStep: number, noteList: Array<number>): any {
    const resp = this.api
      .post(`projectTracking/addNotesToTracking`, {
        projectTracking: idProjectTracking,
        projectTrackStep: idProjectTrackingStep,
        noteList: noteList
      })
    return resp;
  }

  addNoteToTracking(idProjectTracking: number, idProjectTrackingStep: number, noteList: Array<number>, idIglesia: number): any {
    const resp = this.api
      .post(`projectTracking/addNoteToTracking`, {
        projectTracking: idProjectTracking,
        projectTrackStep: idProjectTrackingStep,
        noteList: noteList,
        idIglesia: idIglesia
      })
    return resp;
  }

  getAllNotes(users: string, is_completed): any {
    const resp = this.api.get('notas/allNotes', { users: users, is_completed: is_completed })
    return resp
  }

  addNote(nota: NoteModel) {
    const resp = this.api.post('notas/insertNota',
      // Params
      nota
      // reqOptions
    );
    return resp;
  }

  updateNote(nota: NoteModel) {
    const resp = this.api.post('notas/editNota',
      // Params
      nota
      // reqOptions
    );
    return resp;
  }
}
