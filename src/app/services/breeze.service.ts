import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { UserService } from './user.service';
import { User } from '../interfaces/user';
import { BreezeSetupModel } from '../models/BreezeModel';

@Injectable({
  providedIn: 'root'
})
export class BreezeService {

  constructor(
    public api: ApiService,
    private user_service: UserService
  ) { }

  async getSetup(): Promise<any> {
    const user: User = this.user_service.getCurrentUser();
    const obj = {
      idUser: user.idUsuario,
      idOrganization: user.idIglesia,
    };
    const access_key = this.user_service.encryptUserQR(obj);
    const params = {
      access_key
    }
    return await this.api.post(`breeze/setup`, params).toPromise();
  }

  async saveSetup(payload: BreezeSetupModel): Promise<any> {
    const user: User = this.user_service.getCurrentUser();
    const obj = {
      idUser: user.idUsuario,
      idOrganization: user.idIglesia,
    };
    const access_key = this.user_service.encryptUserQR(obj);
    payload.access_key = access_key
    return await this.api.patch(`breeze/setup`, payload).toPromise();
  }

  async getPeople(): Promise<any> {
    const user: User = this.user_service.getCurrentUser();
    const obj = {
      idUser: user.idUsuario,
      idOrganization: user.idIglesia,
    };
    const access_key = this.user_service.encryptUserQR(obj);
    const params = {
      access_key
    }
    return await this.api.post(`breeze/list`, params).toPromise();
  }
}
