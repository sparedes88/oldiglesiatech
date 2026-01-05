import { TimeSheetModel } from './../models/TimeSheetModel';
import { ApiService } from 'src/app/services/api.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeSheetService {

  constructor(public api: ApiService) { }

  getTimesheetDropdown() {
    const resp = this.api.get('timesheets/getTimesheetDropdown/',
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

  getTimesheetByIdUsuario(idUser: any, filterDate?: any) {
    let params = {};
    if (filterDate) {
      params = {
        idUser,
        start: filterDate.start,
        end: filterDate.end,
        idIglesia: filterDate.idIglesia
      };
    } else {
      params = {
        idUser
      };
    }
    const resp = this.api.get('timesheets/getTimesheetByIdUsuario/',
      // Params
      params
      // reqOptions
    );
    return resp;
  }

  addTimeSheet(timesheet: TimeSheetModel) {
    const resp = this.api.post('timesheets/saveTimesheet/',
      // Params
      timesheet
      // reqOptions
    );
    return resp;
  }
}
