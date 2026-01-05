import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class WordpressService {
  constructor(private http: HttpClient) {}

  public config = {
    token: String,
    url: String,
  };

  public GET(path: string, params?: any, opts?: any) {
    let reqOpts = {
      params: new HttpParams(),
      headers: this.getHeaders()
    }

    // Append aditional options
    if (opts) {
      reqOpts = { ...reqOpts, ...opts }
    }

    if (params) {
      reqOpts.params = new HttpParams();
      for (const k in params) {
        if (params[k]) {
          reqOpts.params = reqOpts.params.set(k, params[k]);
        }
      }
    }
    return this.http.get(`${this.config.url}${path}`, reqOpts);
  }

  POST(path: String, body: any, reqOpts?: any) {
    return this.http.post(`${this.config.url}${path}`, body, {
      ...reqOpts,
      headers: this.getHeaders(),
    });
  }

  DELETE(path: String, body: any, reqOpts?: any) {
    return this.http.post(`${this.config.url}${path}`, body, {
      ...reqOpts,
      headers: this.getHeaders(),
    });
  }

  PATCH(path: String, body: any, reqOpts?: any) {
    return this.http.post(`${this.config.url}${path}`, body, {
      ...reqOpts,
      headers: this.getHeaders(),
    });
  }

  private getHeaders() {
    let headers: any = {};
    if (this.config.token) {
      headers["Authorization"] = `Basic ${this.config.token}`;
    }
    return headers;
  }
}
