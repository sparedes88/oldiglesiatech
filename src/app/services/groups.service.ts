import { GroupModel, GroupCategoryModel, GroupMemberModel, GroupEventModel, GroupMessageModel, GroupEventActivityModel, GroupEventReviewModel, GroupEventFinanceModel, GroupEventAttendanceModel, GroupNoteModel, GroupDocumentModel } from './../models/GroupModel';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor(public api: ApiService, private userService: UserService) { }
  helpRequestCount = 0
  getFrequencies() {
    const user = this.userService.getCurrentUser();
    const resp = this.api.get(`getFrecuenciasyNivelesDeAcceso`,
      // Params
      { idIglesia: user.idIglesia }
      // reqOptions
    );
    return resp;
  }
  getRequestCount() {
    const resp = this.api.get('groups/events/getEventHelpRequestCount',
      // Params
      {}
      // reqOptions
    );
    return resp;
  }
  getHelpRequests() {
    const resp = this.api.get('groups/events/getEventHelpRequests',
      // Params
      {}
      // reqOptions
    );
    return resp;
  }
  updateEventPicture(picture: string, idGroupEvent: number) {
    const resp = this.api.post('groups/events/updateEventPicture',
      // Params
      { picture: picture, idGroupEvent: idGroupEvent }
      // reqOptions
    );
    return resp;
  }

  updateEventStatus(publish_status: string, idGroupEvent: number) {
    const resp = this.api.post('groups/events/updateEventStatus',
      // Params
      { publish_status, idGroupEvent }
      // reqOptions
    );
    return resp;
  }
  updateEventHelpRequest(is_active: boolean, idGroupEvent: number) {
    const resp = this.api.post('groups/events/updateHelpRequest',
      // Params
      { is_active: is_active, idGroupEvent: idGroupEvent }
      // reqOptions
    );
    return resp;
  }
  getGroups() {
    const resp = this.api.get('groups/getGroups',
      // Params
      { idIglesia: this.userService.getCurrentUser().idIglesia }
      // reqOptions
    );
    return resp;
  }

  getTeamGroups() {
    const resp = this.api.get('groups/getTeamGroups',
      // Params
      { idIglesia: this.userService.getCurrentUser().idIglesia }
      // reqOptions
    );
    return resp;
  }

  getGroupDetail(groupId: any, idIglesia?) {
    const userInfo = this.userService.getCurrentUser();
    const resp = this.api.post(`groups/detail/${groupId}`,
      // Params
      {
        idIglesia: idIglesia ? idIglesia : userInfo ? userInfo.idIglesia : (idIglesia || undefined),
        idUsuario: userInfo.idUsuario
      }
      // reqOptions
    );
    return resp;
  }

  saveGroup(payload: GroupModel) {
    const resp = this.api.post('groups/saveGroup',
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  updateGroup(payload: GroupModel) {
    const resp = this.api.post('groups/updateGroup',
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  deleteGroup(group: GroupModel) {
    const resp = this.api.post('groups/deleteGroup',
      // Params
      { idGroup: group.idGroup, deleted_by: this.userService.getCurrentUser().idUsuario }
      // reqOptions
    );
    return resp;
  }

  saveGroupCategory(group_category: GroupCategoryModel) {
    const resp = this.api.post('groups/saveCategory',
      // Params
      group_category
      // reqOptions
    );
    return resp;
  }

  updateGroupCategory(group_category: GroupCategoryModel) {
    const resp = this.api.post('groups/updateCategory',
      // Params
      group_category
      // reqOptions
    );
    return resp;
  }

  deleteroupCategory(group_category: GroupCategoryModel) {
    const resp = this.api.post('groups/deleteCategory',
      // Params
      group_category
      // reqOptions
    );
    return resp;
  }

  updateMemberType(member: GroupMemberModel) {
    const resp = this.api.post('groups/updateMemberRole',
      // Params
      member
      // reqOptions
    );
    return resp;
  }

  deleteMember(member: GroupMemberModel) {
    member.deleted_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('groups/deleteMember',
      // Params
      member
      // reqOptions
    );
    return resp;
  }

  getGroupEventDetail(group_event: GroupEventModel) {
    const resp = this.api.get(`groups/events/getEvent/${group_event.idGroupEvent}`,
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

  addEvent(group_event: GroupEventModel) {
    group_event.created_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('groups/events/addEvent',
      // Params
      group_event
      // reqOptions
    );
    return resp;
  }

  updateEvent(group_event: GroupEventModel) {
    group_event.created_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('groups/events/updateEvent',
      // Params
      group_event
      // reqOptions
    );
    return resp;
  }

  deleteEvent(group_event: GroupEventModel) {
    group_event.deleted_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('groups/events/deleteEvent',
      // Params
      group_event
      // reqOptions
    );
    return resp;
  }

  getSettingEventDetail(group_event: GroupEventModel) {
    const resp = this.api.get(`groups/settings/getSetting/${group_event.idGroupEvent}`,
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

  addSettingEvent(group_event: GroupEventModel) {
    group_event.created_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('groups/settings/addSetting',
      // Params
      group_event
      // reqOptions
    );
    return resp;
  }

  updateSettingEvent(group_event: GroupEventModel) {
    group_event.created_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('groups/settings/updateSetting',
      // Params
      group_event
      // reqOptions
    );
    return resp;
  }

  deleteSettingEvent(group_event: GroupEventModel) {
    group_event.deleted_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('groups/settings/deleteSetting',
      // Params
      group_event
      // reqOptions
    );
    return resp;
  }

  getMessages(idOrganization: number, idGroup: number, page: number) {
    const req = this.api.get(`groups/getMessages/${idGroup}`,
      // Params
      {
        idOrganization,
        page
      },
      // reqOptions
      {}
    );
    return req.toPromise();
  }

  sendMessage(message: GroupMessageModel) {
    const req = this.api.post('groups/sendMessage',
      message,
      {}
    );
    return req;
  }

  getEventActivities(group_event: GroupEventModel) {
    const resp = this.api.get(`groups/events/${group_event.idGroupEvent}/activities/`,
      // Params
      { idIglesia: this.userService.getCurrentUser().idIglesia }
      // reqOptions
    );
    return resp;
  }

  getEventReviews(group_event: GroupEventModel) {
    const resp = this.api.get(`groups/events/${group_event.idGroupEvent}/reviews/`,
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

  getEventFinances(group_event: GroupEventModel) {
    const resp = this.api.get(`groups/events/${group_event.idGroupEvent}/finances/`,
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

  addActivityEvent(group_event: GroupEventModel) {
    group_event.created_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('groups/events/activities/addActivity',
      // Params
      group_event
      // reqOptions
    );
    return resp;
  }

  updateActivityEvent(group_event: GroupEventModel) {
    group_event.created_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('groups/events/activities/updateActivity',
      // Params
      group_event
      // reqOptions
    );
    return resp;
  }

  deleteActivityEvent(group_event: GroupEventActivityModel) {
    group_event.deleted_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('groups/events/activities/deleteActivity',
      // Params
      group_event
      // reqOptions
    );
    return resp;
  }

  updateEventActivitiesSort(payload: any[]) {
    const resp = this.api.post('groups/events/activities/updateSort',
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  addReviewEvent(group_event: GroupEventReviewModel) {
    group_event.created_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('groups/events/reviews/addReview',
      // Params
      group_event
      // reqOptions
    );
    return resp;
  }

  updateReviewEvent(group_event: GroupEventReviewModel) {
    group_event.created_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('groups/events/reviews/updateReview',
      // Params
      group_event
      // reqOptions
    );
    return resp;
  }

  deleteActivityReview(group_event: GroupEventReviewModel) {
    group_event.deleted_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('groups/events/reviews/deleteReview',
      // Params
      group_event
      // reqOptions
    );
    return resp;
  }

  addFinanceEvent(group_event: GroupEventFinanceModel) {
    group_event.created_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('groups/events/finances/addFinance',
      // Params
      group_event
      // reqOptions
    );
    return resp;
  }

  updateFinanceEvent(group_event: GroupEventFinanceModel) {
    group_event.created_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('groups/events/finances/updateFinance',
      // Params
      group_event
      // reqOptions
    );
    return resp;
  }

  deleteFinanceEvent(group_event: GroupEventFinanceModel) {
    group_event.deleted_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('groups/events/finances/deleteFinance',
      // Params
      group_event
      // reqOptions
    );
    return resp;
  }

  getFinanceCategories() {
    const resp = this.api.get(`groups/events/finances/categories`,
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

  getEventAttendances(group_event: GroupEventModel) {
    const resp = this.api.get(`groups/events/${group_event.idGroupEvent}/attendances/`,
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

  deleteAttendance(attendance: GroupEventAttendanceModel) {
    const resp = this.api.post(`groups/events/attendances/delete_member`,
      // Params
      attendance
      // reqOptions
    );
    return resp;
  }

  updateAttendanceEvent(group_event: GroupEventAttendanceModel) {
    group_event.created_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('groups/events/attendances/updateAttendance',
      // Params
      group_event
      // reqOptions
    );
    return resp;
  }

  updateEventAttendances(payload: any[]) {
    const resp = this.api.post('groups/events/attendances/updateMassive',
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  getGroupsEventsByIdIglesia(idIglesia?: number) {
    let id;
    if (idIglesia) {
      id = idIglesia
    } else {
      id = this.userService.getCurrentUser().idIglesia;
    }
    const resp = this.api.post('groups/getGroupsEventsByIdIglesia',
      // Params
      {
        idIglesia: id,
        idUsuario: this.userService.getCurrentUser().idUsuario
      }
      // reqOptions
    );
    return resp;
  }

  getGroupsEventsSettingByIdIglesia(idIglesia?: number) {
    let id;
    if (idIglesia) {
      id = idIglesia
    } else {
      id = this.userService.getCurrentUser().idIglesia;
    }
    const resp = this.api.post('groups/settings/getEventSettingsByIdIglesia',
      // Params
      {
        idIglesia: id,
        idUsuario: this.userService.getCurrentUser().idUsuario
      }
      // reqOptions
    );
    return resp;
  }

  getStandaloneGroupsEventsByIdIglesia(idIglesia?: number, start_date?: string, end_date?: string, publish_status?: string) {
    let id;
    let idUsuario;
    if (idIglesia) {
      id = idIglesia
    } else {
      id = this.userService.getCurrentUser().idIglesia;
    }
    if (this.userService.getCurrentUser()) {
      idUsuario = this.userService.getCurrentUser().idUsuario;
    }
    const resp = this.api.post('groups/getEventsStandalone',
      // Params
      {
        idIglesia: id,
        idUsuario,
        start_date, end_date,
        publish_status
      }
      // reqOptions
    );
    return resp;
  }

  getStandaloneGroupsEventsByIdIglesiaV2(idIglesia?: number, start_date?: string, end_date?: string, publish_status?: string) {
    let id;
    let idUsuario;
    if (idIglesia) {
      id = idIglesia
    } else {
      id = this.userService.getCurrentUser().idIglesia;
    }
    if (this.userService.getCurrentUser()) {
      idUsuario = this.userService.getCurrentUser().idUsuario;
    }
    const resp = this.api.post('groups/getEventsStandaloneV2',
      // Params
      {
        idIglesia: id,
        idUsuario,
        start_date, end_date,
        publish_status
      }
      // reqOptions
    );
    return resp;
  }

  getViewType(idIglesia?: number, publish_status?: string) {
    let id;
    let idUsuario;
    if (idIglesia) {
      id = idIglesia
    } else {
      id = this.userService.getCurrentUser().idIglesia;
    }
    if (this.userService.getCurrentUser()) {
      idUsuario = this.userService.getCurrentUser().idUsuario;
    }
    const resp = this.api.post('groups/getCalendarView',
      // Params
      {
        idIglesia: id,
        idUsuario,
        publish_status
      }
      // reqOptions
    );
    return resp;
  }

  getEventsByView(idIglesia: number, publish_status: string, page: number) {
    let id;
    if (idIglesia) {
      id = idIglesia
    } else {
      id = this.userService.getCurrentUser().idIglesia;
    }
    const resp = this.api.post('groups/getEventsByView',
      // Params
      {
        idIglesia: id,
        publish_status,
        page
      }
      // reqOptions
    );
    return resp;
  }

  getGroupsCategories(idIglesia: number) {
    const resp = this.api.get('groups/getGroupsCategories',
      // Params
      { idIglesia }
      // reqOptions
    );
    return resp;
  }

  getGroupNotes(group: GroupModel) {
    const resp = this.api.get('groups/notes/getNotes',
      // Params
      { idGroup: group.idGroup }
      // reqOptions
    );
    return resp;
  }

  addGroupNote(note: GroupNoteModel) {
    const resp = this.api.post('groups/notes/addNote',
      // Params
      note
      // reqOptions
    );
    return resp;
  }

  updateGroupNote(note: GroupNoteModel) {
    const resp = this.api.post('groups/notes/updateNote',
      // Params
      note
      // reqOptions
    );
    return resp;
  }

  deleteGroupNote(note: GroupNoteModel) {
    const resp = this.api.post('groups/notes/deleteNote',
      // Params
      note
      // reqOptions
    );
    return resp;
  }

  getGroupDocuments(group: GroupModel) {
    const resp = this.api.get('groups/documents/getDocuments',
      // Params
      { idGroup: group.idGroup }
      // reqOptions
    );
    return resp;
  }


  saveDocuments(group: {
    idGroup: number; created_by: number; attachments: any[]; // Params
  }) {
    const resp = this.api.post('groups/documents/saveDocuments',
      // Params
      group
      // reqOptions
    );
    return resp;
  }

  updateDocument(document: GroupDocumentModel) {
    const resp = this.api.patch(`groups/documents/updateDocument/${document.idGroupDocument}`,
      // Params
      document
      // reqOptions
    );
    return resp;
  }

  deleteGroupDocument(document: GroupDocumentModel) {
    const resp = this.api.post('groups/documents/deleteDocument',
      // Params
      document
      // reqOptions
    );
    return resp;
  }

  addMember(idUsuario: any, idGroup: any, idGroupEvent: any) {
    const resp = this.api.post('groups/addMember',
      // Params
      { idUsuario, idGroup, idGroupEvent }
      // reqOptions
    );
    return resp;

  }

  checkMemberInEvent(idUsuario: any, idGroupEvent: any) {
    const resp = this.api.post('groups/events/checkMember',
      // Params
      {
        idUsuario,
        idGroupEvent,
      }
      // reqOptions
    );
    return resp;

  }
  checkMemberInGroup(idUsuario: any, idGroup: any) {
    const resp = this.api.post('groups/checkMember',
      // Params
      {
        idUsuario,
        idGroup,
      }
      // reqOptions
    );
    return resp;

  }
  addMemberToEvent(idUsuario: any, idGroup: any, idGroupEvent: any, additional_value: { covid_quest: boolean, guests: number }) {
    const resp = this.api.post('groups/events/addMember',
      // Params
      {
        idUsuario,
        idGroup,
        idGroupEvent,
        covid_quest: additional_value.covid_quest,
        guests: additional_value.guests
      }
      // reqOptions
    );
    return resp;

  }

  sendRequestToJoin(idUsuario: any, idGroup: any) {
    const resp = this.api.post('groups/sendRequestToJoin',
      // Params
      { idUsuario, idGroup }
      // reqOptions
    );
    return resp;

  }

  addSettingV2(payload: any) {
    return this.api.post(`groups/settings/v2`, payload);
  }

  updateSettingV2(payload: any) {
    return this.api.patch(`groups/settings/v2/${payload.id}`, payload);
  }


  getSettingV2(group_event: GroupEventModel) {
    const resp = this.api.get(`groups/settings/v2/${group_event.idGroupEvent}`,
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

}
