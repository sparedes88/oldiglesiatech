import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {

  constructor(
    public api: ApiService
  ) { }

  checkOrganization(params) {
    return this.api.get(`duda/settings`, params);
  }

  setSiteID(payload: any) {
    return this.api.post(`duda/settings`, payload);
  }

  getSSOLink(payload) {
    return this.api.post(`duda/sso_link`, payload);
  }
}
