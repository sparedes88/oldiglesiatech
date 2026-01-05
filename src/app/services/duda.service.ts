import { Injectable } from '@angular/core';

import { ApiService } from './api.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class DudaService {

  constructor(
    public api: ApiService,
    private user_service: UserService) {

  }

  checkOrganizationSettings(params: Partial<any>) {
    return this.api.get(`duda/settings`, params);
  }

  saveOrganizationSettings(params: Partial<any>) {
    return this.api.post(`duda/settings`, params);
  }


}
