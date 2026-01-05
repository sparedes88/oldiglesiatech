import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { MailingListParams } from '../models/MailingListModel';

@Injectable({
  providedIn: 'root'
})
export class ContactInboxService {

  constructor(
    public api: ApiService
  ) { }

  getContactInboxes(params: Partial<MailingListParams>) {
    return this.api.get('contact_inboxes/forms', params);
  }

  getContactInboxDetail(id: number, params: Partial<MailingListParams>) {
    return this.api.get(`contact_inboxes/forms/${id}`, params);
  }

  saveContactInbox(payload: any) {
    return this.api.post(`contact_inboxes/forms/`, payload);
  }

  updateContactInbox(payload: any) {
    return this.api.patch(`contact_inboxes/forms/${payload.id}`, payload);
  }

  deleteContactInbox(payload: any) {
    return this.api.delete(`contact_inboxes/forms/${payload.id}`, { deleted_by: payload.deleted_by });
  }

  getCategoriesForContactInbox(id: number, params: Partial<MailingListParams>) {
    return this.api.get(`contact_inboxes/forms/${id}/categories`, params);
  }

  getSettings(params: Partial<MailingListParams>) {
    return this.api.get(`contact_inboxes/forms/${params.idOrganization}/settings/`);
  }

  saveSettings(payload: any) {
    return this.api.post(`contact_inboxes/forms/${payload.idOrganization}/settings/`, payload);
  }

  getInputTypes() {
    return this.api.get('contact_inboxes/input_types');
  }

  getOrganizationInput(params: Partial<MailingListParams>) {
    return this.api.get('contact_inboxes/inputs', params);
  }
  saveOrganizationInput(payload: any) {
    return this.api.post('contact_inboxes/inputs', payload);
  }

  saveContactResponse(payload: any) {
    return this.api.post(`contact_inboxes/forms/${payload.idMailingList}/contacts`, payload);
  }

  getContacts(id: any) {
    return this.api.get(`mailingList/${id}/contacts`);
  }

  getAllContacts(idOrganization: any) {
    return this.api.post(`contact_inboxes/all_contacts`, { idOrganization });
  }
}
