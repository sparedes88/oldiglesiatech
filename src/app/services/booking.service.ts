import { GoogleCalendarEvent, GoogleUserInfoModel, GoogleCalendarModel } from './../models/BookingModel';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { UserService } from './user.service';
import { User } from '../interfaces/user';
import { BookingModel } from '../models/BookingModel';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor(
    public api: ApiService,
    private userService: UserService
  ) { }

  getBookings(google_user_id: string) {
    const user: User = this.userService.getCurrentUser();

    const resp = this.api.post('booking/getBookings/',
      // Params
      {
        google_user_id,
        idIglesia: user.idIglesia,
      }
      // reqOptions
    );
    return resp;
  }

  getBookingsToShare(idIglesia: number) {
    const resp = this.api.post('booking/getBookingsToShare/',
      // Params
      {
        idIglesia,
      }
      // reqOptions
    );
    return resp;
  }

  addBooking(payload: any) {
    const user_google = this.userService.getGoogleUser();
    const headers: any = {};
    if (user_google) {
      payload.user_google_id = user_google.id;
    }
    const resp = this.api.post('booking/addBooking/',
      // Params
      payload,
      // reqOptions
      {
        headers
      }
    );
    return resp;
  }

  addBookingWithExistingCalendar(calendar: GoogleCalendarModel) {
    const user_google = this.userService.getGoogleUser();
    const headers: any = {};
    if (user_google) {
      calendar.user_google_id = user_google.id;
    }
    calendar.created_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('booking/syncBooking/',
      // Params
      calendar,
      // reqOptions
      {
        headers
      }
    );
    return resp;
  }

  updateBooking(payload: any) {
    const user_google = this.userService.getGoogleUser();
    if (user_google) {
      payload.user_google_id = user_google.id;
    }
    const resp = this.api.post('booking/updateBooking/',
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  getBookingDetail(idBookingCalendar: number, calendar_id: string, is_preview?: boolean) {
    const user_google = this.userService.getGoogleUser();
    let user_google_id;
    if (user_google) {
      user_google_id = user_google.id;
    }
    const resp = this.api.post(`booking/getBookingDetail/${idBookingCalendar}`,
      // Params
      {
        calendar_id,
        user_google_id,
        is_preview: is_preview ? 'yes' : 'no'
      },
      // reqOptions
      {}
    );
    return resp;
  }

  saveSettings(payload: any) {
    const resp = this.api.post(`booking/settings/saveSettings`,
      // Params
      payload,
      // reqOptions
    );
    return resp;
  }

  makeAppointment(calendar: GoogleCalendarEvent, is_preview: boolean) {
    const user_google = this.userService.getGoogleUser();
    let user_google_id;
    if (user_google) {
      user_google_id = user_google.id;
    }
    const resp = this.api.post(`booking/makeAppointment`,
      // Params
      {
        calendar,
        user_google_id,
        calendar_id: calendar.calendarId,
        is_preview: is_preview ? 'yes' : 'no'
      },
      // reqOptions
      {}
    );
    return resp;
  }

  getAuthUrl() {
    const resp = this.api.post(`booking/getAuthUrl`,
      // Params
      {},
      // reqOptions
      {}
    );
    return resp;
  }

  redeemCodeToken(code: string) {
    const resp = this.api.post(`booking/redeemCodeToken`,
      // Params
      { auth_code: code },
      // reqOptions
      {}
    );
    return resp;
  }

  registerGoogleUser(user_google: GoogleUserInfoModel) {
    const user = this.userService.getCurrentUser();
    user_google.created_by = user.idUsuario;
    const resp = this.api.post(`booking/registerGoogleUserInfo`,
      // Params
      user_google,
      // reqOptions
      {}
    );
    return resp;
  }

  shareBookingCalendar(booking: BookingModel, email: string) {
    const user_google = this.userService.getGoogleUser();
    const user = this.userService.getCurrentUser();
    let user_google_id;
    if (user_google) {
      user_google_id = user_google.id;
    }
    const resp = this.api.post(`booking/shareBookingCalendar`,
      // Params
      {
        email,
        user_google_id,
        role: 'writer',
        scope: {
          type: 'user',
          value: email
        },
        calendar_id: booking.calendar_id,
        created_by: user.idUsuario
      },
      // reqOptions
      {}
    );
    return resp;
  }

  getGoogleCalendars() {
    const user_google = this.userService.getGoogleUser();
    let user_google_id;
    if (user_google) {
      user_google_id = user_google.id;
    }
    const resp = this.api.post(`booking/listCalendars`,
      // Params
      {
        user_google_id
      },
      // reqOptions
      {}
    );
    return resp;
  }

}
