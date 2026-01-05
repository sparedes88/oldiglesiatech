import { GoogleUserInfoModel } from './../models/BookingModel';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import * as CryptoJS from 'crypto-js';
import { User } from '../interfaces/user';
import { Observable } from 'rxjs';
import { UserCommitmentsManageModel, UserCommitmentsModel, UserLogModel } from '../models/UserLogModel';
import { UserOrganizationBudgetModel } from '../models/OrganizationModel';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(public api: ApiService) {

  }

  public currentUser: Observable<User>;

  // Method for Hash the password PD: need install crypto-js
  public static encryptPass(pass: string): string {
    // const CryptoJS = crypto;
    const apiKey = pass;
    const apiSecret = 'VVhwTmVVNHlVbWhPVjFsNVVrRTlQUT09';

    // var key = Convert.FromBase64String(apiSecret);
    const key = CryptoJS.enc.Base64.parse(apiSecret);
    // console.log('key:' + key);

    // var prehash = Encoding.UTF8.GetBytes(apiKey);
    const prehash = CryptoJS.enc.Utf8.parse(apiKey);
    // console.log('Pre-hash:' + prehash);

    // var provider = new System.Security.Cryptography.HMACSHA256(key);
    // var hash = provider.ComputeHash(prehash);
    const hash = CryptoJS.HmacSHA256(prehash, key);
    // console.log('hash:' + hash);

    // var signature = Convert.ToBase64String(hash);
    const signature = hash.toString(CryptoJS.enc.Base64);
    return encodeURIComponent(signature);
  }

  // Method for get and send currentUser from login.component.ts to guard.ts
  static getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    // console.log(user);
    return user;
  }

  // Method for get and send currentUser from login.component.ts to guard.ts
  getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    // console.log(user);
    return user;
  }

  async getExpiration() {
    return new Promise((resolve, reject) => {
      const user = JSON.parse(localStorage.getItem('currentUser'))
      if (user) {
        if (!user.isSuperUser) {
          this.api
            .get(`iglesias/checkStripeExpiration`, { idIglesia: user.idIglesia })
            .subscribe(
              (data: any) => {
                user.is_valid = data.response[0].is_valid
                const userStr: string = JSON.stringify(user);
                localStorage.setItem('currentUser', userStr)
                return resolve({});
              },
              (err: any) => {
                user.is_valid = false
                const userStr: string = JSON.stringify(user);
                localStorage.setItem('currentUser', userStr)
                return resolve({});
              },
              () => {

              }
            );
        } else {
          user.is_valid = true
          const userStr: string = JSON.stringify(user);
          localStorage.setItem('currentUser', userStr)
          return resolve({});
        }
      }
    })
  }

  getGoogleUser() {
    const user: GoogleUserInfoModel = JSON.parse(localStorage.getItem('google_user_info'));
    // console.log(user);
    return user;
  }

  loginAction(usuario: string, pass: string) {
    const password = UserService.encryptPass(pass);
    console.log(password);

    // Request to api when is normal user
    const request = this.api.get('onLoginTechAppMultiple',
      {
        usuario,
        pass: password
      }, {
      headers: {
        Authorization: 'Token de Authorization'
      }
    });
    return request;
  }

  loginSuperAction(usuario: string, pass: string) {
    const password = UserService.encryptPass(pass);
    console.log(password);

    // Request to api when is super user
    const request = this.api.get(`onLoginSuperUser`, {
      usuario,
      pass: password
    }, {
      headers: {
        Authorization: 'Super Token'
      }
    });
    return request;
  }

  logout(reload?: boolean) {
    // remove user from local storage to log user out
    // localStorage.clear();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('companies');
    localStorage.removeItem('chatToken');
    if (reload) {
      window.location.reload();
    }
  }

  registerAsSuperUser(idUsuario: number, status: boolean) {
    const resp = this.api.post('users/registerAsSuperUser',
      // Params
      { idUsuario, status }
      // reqOptions
    );
    return resp;
  }

  getAllAdmins() {
    const resp = this.api.get(`users/getAdmins`, {})
    return resp;
  }

  reactivateUser(idUsuario: number, status: boolean): any {
    const resp = this.api.post('users/reactivateUser',
      // Params
      { idUsuario, status }
      // reqOptions
    );
    return resp;
  }

  reactivateUserInOrganization(idUsuario: number, idOrganization: number, status: boolean): any {
    const resp = this.api.post('users/reactivateUserInOrganization',
      // Params
      { idUsuario, idOrganization, status }
      // reqOptions
    );
    return resp;
  }

  checkUserAvailable(email: string, idIglesia: number, login_type?) {
    const resp = this.api.post('users/checkUser',
      // Params
      { usuario: email, idIglesia, login_type }
      // reqOptions
    );
    return resp;
  }

  registerUserInOrganization(assigned_by_other: boolean, idUsuario: number, idUser: any, idIglesia: number, idUserType: number) {
    const resp = this.api.post('users/registerUserInOrganization',
      // Params
      assigned_by_other ? { idUser, idIglesia, idUserType, created_by: idUsuario } : { idUserType, idUser, idIglesia }

      // reqOptions
    );
    return resp;
  }

  refreshToken() {

  }

  addUserOrganizationLog(log: UserLogModel) {
    const resp = this.api.post('users/logs/addLog',
      // Params
      log
      // reqOptions
    );
    return resp;
  }

  updateUserOrganizationLog(log: UserLogModel) {
    const resp = this.api.post('users/logs/updateLog',
      // Params
      log
      // reqOptions
    );
    return resp;
  }

  deleteUserOrganizationLog(log: UserLogModel) {
    const resp = this.api.post('users/logs/deleteLog',
      // Params
      log
      // reqOptions
    );
    return resp;
  }

  getNextEvents(idUsuario: any, idIglesia: any) {
    const seq = this.api.get(`users/getEvents/${idUsuario}`, idIglesia ? { idIglesia } : {});
    return seq;
  }

  getCommitmentsByUser(idUsuario: any, idIglesia: any) {
    const seq = this.api.get(`users/getCommitments/${idUsuario}`, idIglesia ? { idIglesia } : {});
    return seq;
  }

  getCommitmentsManage(commitment: UserCommitmentsModel) {
    const seq = this.api.get(`users/getCommitmentsManage/${commitment.idUserCommitmentRecord}`);
    return seq;
  }

  addUserCommitment(commitment: UserCommitmentsManageModel): Observable<any> {
    const resp = this.api.post('users/addCommitment',
      // Params
      commitment
      // reqOptions
    );
    return resp;
  }

  updateUserCommitment(commitment: UserCommitmentsManageModel): Observable<any> {
    const resp = this.api.post('users/updateCommitment',
      // Params
      commitment
      // reqOptions
    );
    return resp;
  }

  deleteUserCommitment(commitment: UserCommitmentsManageModel) {
    const resp = this.api.post('users/deleteCommitment',
      // Params
      commitment
      // reqOptions
    );
    return resp;
  }

  setAsAccomplished(commitment: UserCommitmentsModel) {
    const resp = this.api.post('users/check_or_uncheck',
      // Params
      commitment
      // reqOptions
    );
    return resp;
  }

  getContactsBudget(idIglesia: number) {
    const resp = this.api.get('users/getBudget',
      // Params
      { idIglesia }
      // reqOptions
    );
    return resp;
  }

  addContactsBudget(budget: UserOrganizationBudgetModel) {
    const resp = this.api.post('users/addBudget',
      // Params
      budget
      // reqOptions
    );
    return resp;
  }

  updateContactsBudget(budget: UserOrganizationBudgetModel) {
    const resp = this.api.post('users/updateBudget',
      // Params
      budget
      // reqOptions
    );
    return resp;
  }

  deleteInfoUser(idUsuario: number) {
    const resp = this.api.post('users/remove_account',
      // Params
      {
        idUsuario
      }
      // reqOptions
    );
    return resp;
  }

  encryptUserQR(obj: { idUser: any; idOrganization: any; email?: any; }): string {
    const obj_str = JSON.stringify(obj);
    const encrypted = CryptoJS.AES.encrypt(obj_str, 'none_key');
    return encrypted.toString();
  }

  decryptUserQR(encoded: string): string {
    const decrypted = CryptoJS.AES.decrypt(encoded, 'none_key');
    const dec_srt = decrypted.toString(CryptoJS.enc.Utf8);
    return dec_srt;
  }

}
