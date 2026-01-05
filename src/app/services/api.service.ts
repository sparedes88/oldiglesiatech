import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { IndividualConfig, ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  baseUrl: string = 'https://iglesia-tech-api.e2api.com';

  constructor(public http: HttpClient,
    private toastr: ToastrService) { }

  get(endpoint: string, params?: any, reqOpts?: any) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }

    if (params) {
      reqOpts.params = new HttpParams();
      for (const k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
      return this.http.get(`${environment.apiUrl}/${endpoint}`, reqOpts);
    } else {
      return this.http.get(`${environment.apiUrl}/${endpoint}`, reqOpts)
    }
  }

  post(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(`${environment.apiUrl}/${endpoint}`, body, reqOpts);
  }

  patch(endpoint: string, body: any, reqOpts?: any) {
    return this.http.patch(`${environment.apiUrl}/${endpoint}`, body, reqOpts);
  }

  delete(endpoint: string, params?, reqOpts?: any) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }

    if (params) {
      reqOpts.params = new HttpParams();
      for (const k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
      return this.http.delete(`${environment.apiUrl}/${endpoint}`, reqOpts);
    } else {
      return this.http.delete(`${environment.apiUrl}/${endpoint}`, reqOpts);
    }
  }

  getAbsolute(endpoint, reqOpts?: any) {
    return this.http.get(this.baseUrl + endpoint, reqOpts)
  }

  get_old(endpoint: string, params?: any, reqOpts?: any) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }

    if (params) {
      reqOpts.params = new HttpParams();
      for (const k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
      return this.http.get(`${environment.serverURL}/api/${endpoint}`, reqOpts);
    } else {
      return this.http.get(`${environment.serverURL}/api/${endpoint}`, reqOpts)
    }
  }

  post_old(endpoint: string, body: any, reqOpts?: any) {
    return this.http.post(`${environment.serverURL}/api/${endpoint}`, body, reqOpts);
  }

  showToast(message: string, message_type: number, title?: string, other_configs?: Partial<IndividualConfig>) {
    if (message_type === 2) {
      this.toastr.error(message, 'Error!');
    } else if (message_type === 1) {
      this.toastr.success(message, 'Success', other_configs ? other_configs : undefined);
    } else if (message_type === 3) {
      this.toastr.info(message, title ? title : '');
    } else {
      // warning
      this.toastr.warning(message, 'Warning!');
    }
  }

  _regExpForRemove(specialCharactersForRemove) {
    return new RegExp(specialCharactersForRemove.map((item) => `\\${item}`).join('|'), 'gi');
  }

  remove_mask(value,) {
    const specialCharactersForRemove = ['$', ',', '(', ')', ' ', '-']
    return value
      ? value.replace(this._regExpForRemove(specialCharactersForRemove), '')
      : value;
  }
}
