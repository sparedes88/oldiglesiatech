import { DesignRequestModel, DesignRequestNoteModel, DesignRequestStatusModel } from './../models/DesignRequestModel';
import { ApiService } from 'src/app/services/api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DesignRequestService {

  constructor(public api: ApiService) { }

  getDesignRequestDropdown() {
    const resp = this.api.get('designRequests/getDesignRequestDropdown/',
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

  getStatus(params: Partial<{ parent_id: number; is_for_user: boolean, idIglesia: number }>) {
    const resp = this.api.get('designRequests/getStatus/',
      // Params
      params
      // reqOptions
    );
    return resp;
  }


  getDesignRequests(params?: { idDesignRequestParentStatus?: number; idDesignRequestStatus?: number }) {
    let payload: Partial<DesignRequestStatusModel> = {};
    if (params) {
      if (params.idDesignRequestStatus > 0) {
        payload.idDesignRequestStatus = params.idDesignRequestStatus;
      }
      if (params.idDesignRequestParentStatus) {
        payload.idDesignRequestParentStatus = params.idDesignRequestParentStatus;
      }
    }
    const resp = this.api.get('designRequests/getRequests/',
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  getDesignRequestsByIdIglesia(idIglesia: any) {
    const resp = this.api.get('designRequests/getRequestsByIdIglesia/',
      // Params
      { idIglesia }
      // reqOptions
    );
    return resp;
  }

  getDesignRequestsByIdIglesiaForUsers(params: { idDesignRequestParentStatus?: number; idDesignRequestStatus?: number; idIglesia?: number }) {
    let payload: Partial<DesignRequestStatusModel> = {};
    if (params.idDesignRequestStatus > 0) {
      payload.idDesignRequestStatus = params.idDesignRequestStatus;
    }
    if (params.idDesignRequestParentStatus) {
      payload.idDesignRequestParentStatus = params.idDesignRequestParentStatus;
    }
    payload.idIglesia = params.idIglesia;

    const resp = this.api.get('designRequests/getRequestsByIdIglesiaForUsers/',
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  addDesignRequest(designRequest: DesignRequestModel) {
    const resp = this.api.post('designRequests/saveDesignRequest/',
      // Params
      designRequest
      // reqOptions
    );
    return resp;
  }

  updateDesignRequest(designRequest: DesignRequestModel) {
    const resp = this.api.post('designRequests/updateDesignRequest/',
      // Params
      designRequest
      // reqOptions
    );
    return resp;
  }


  getDesignRequestDetail(designRequest: DesignRequestModel) {
    const resp = this.api.get('designRequests/getDesignRequestDetail/',
      // Params
      { idDesignRequest: designRequest.idDesignRequest }
      // reqOptions
    );
    return resp;
  }

  deleteDesignRequest(item: DesignRequestModel) {
    const resp = this.api.post('designRequests/deleteDesignRequest/',
      // Params
      item
      // reqOptions
    );
    return resp;
  }

  getDesignRequestsForUsers(params) {
    const resp = this.api.post('designRequests/getDesignRequestsForUsers/',
      // Params
      params
      // reqOptions
    );
    return resp;
  }

  addDesignRequestNote(designRequestNote: DesignRequestNoteModel): Observable<any> {
    const resp = this.api.post('designRequests/saveDesignRequestNote/',
      // Params
      designRequestNote
      // reqOptions
    );
    return resp;
  }

  updateDesignRequestNote(designRequestNote: DesignRequestNoteModel): Observable<any> {
    const resp = this.api.post('designRequests/updateDesignRequestNote/',
      // Params
      designRequestNote
      // reqOptions
    );
    return resp;
  }

  deleteDesignRequestNote(designRequestNote: DesignRequestNoteModel) {
    const resp = this.api.post('designRequests/deleteDesignRequestNote/',
      // Params
      designRequestNote
      // reqOptions
    );
    return resp;
  }
}
