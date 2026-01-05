import { MatSnackBar } from '@angular/material';
import { NgxSmartModalComponent } from 'ngx-smart-modal';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ToastType } from './../../../login/ToastTypes';
import { BookingModel, GoogleUserInfoModel, TokenModel, GoogleCalendarModel } from './../../../models/BookingModel';
import { Observable } from 'rxjs';
import { Validators, FormGroup, FormBuilder, NgForm } from '@angular/forms';
import { BookingService } from './../../../services/booking.service';
import { Component, OnInit, NgZone } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';
import { environment } from 'src/environments/environment';
/// <reference path="../../node_modules/@types/gapi/index.d.ts" />
/// <reference types="gapi" />
declare var gapi: any;

@Component({
  selector: 'app-booking-home',
  templateUrl: './booking-home.component.html',
  styleUrls: ['./booking-home.component.scss']
})
export class BookingHomeComponent implements OnInit {

  constructor(
    private userService: UserService,
    private bookingService: BookingService,
    private formBuilder: FormBuilder,
    private zone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar
  ) {
    this.currentUser = this.userService.getCurrentUser();
    this.token = JSON.parse(localStorage.getItem('token_google_auth'));
    if (!this.token) {
      this.token = {
        refresh_token: '1//06H33H32GWlHpCgYIARAAGAYSNgF-L9IrJ03X8RHYl2fRFDEt0AFjihqslkNt-nCSd_xSbvqTWRQdKnISTF7GUj7UdZNhQRwQAg',
        scope: 'openid https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        id_token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImZiOGNhNWI3ZDhkOWE1YzZjNjc4ODA3MWU4NjZjNmM0MGYzZmMxZjkiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3MjcxNTkzMjI1NjMtZGZqZGpjdHVlNmVnYTJkcTIycXZyMThrb2NkM3BvcjYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3MjcxNTkzMjI1NjMtZGZqZGpjdHVlNmVnYTJkcTIycXZyMThrb2NkM3BvcjYuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTcxNzU0NTU0NzYyMjIzNzIyOTQiLCJlbWFpbCI6InByb3RvcGVuZ3VpbnByb2RAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJEQk9JWVJTWXd4b1lzT094VHlNZkRBIiwibmFtZSI6IlByb3RvIFBlbmd1aW4gUHJvZCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQU9oMTRHaEpXb3hwM3FCSVphYl9oTkM2YkpBSThpLW1wYzN2VUNPdEx0VT1zOTYtYyIsImdpdmVuX25hbWUiOiJQcm90byBQZW5ndWluIFByb2QiLCJmYW1pbHlfbmFtZSI6Ii4iLCJsb2NhbGUiOiJlcy00MTkiLCJpYXQiOjE1OTA4NTQ3MDMsImV4cCI6MTU5MDg1ODMwM30.uyUecbNodxccBEWSUdr_sUy0ltMO-xE6CI1eDuMSmRq3XNNiV_PosQyUvuCbFE6s9TuGAWK00dsi2uatItvrtvHItb4QxTYpp9KPFVzKLmA_mMEvdC7_ix8CuF0QkmbQ9tEWESAP4AFNgvXkyLYVEHCIgMabT_f-oYmC5mQuMz1dkQujJGEQE6N0j-BdIff_9yEby5QoE3XN91C9OEYoZCaJeH8Svo5ThfyFdPKPSWAVnpbHXvsLbeP-C4gYSzFE1qqsJJDOPOKh1rDREPxRTifw3aomQtEgfpnER4BS8YuquzjxUkf1cJSwKs5DjnG8ETfvhvXNRLJvZzF2tL7TzQ',
        access_token: 'ya29.a0AfH6SMAYNe8YAdLJwgJEDGl9wUSUB9vNtJ225J_KEa4sCDWkSypi3pXzc9JIfH6X6qhMYSvnjmZg_-1t2Z7CliN91WullJWT0iTihUhuG7dF8v3haaSERe4-He7X7re1AxP0Xrkx3x34g4I72OemhyuhS1VDlKkHkuU',
        expiry_date: '1590858302861',
        token_type: 'Bearer',
      };
      localStorage.setItem('token_google_auth', JSON.stringify(this.token));
    }

  }

  currentUser: User;
  show_editable: boolean = false;

  bookingForm: FormGroup;
  bookings: BookingModel[] = [];
  calendars: GoogleCalendarModel[] = [];

  // auth: gapi.auth2.GoogleAuth;
  auth: any;

  user_google: GoogleUserInfoModel;

  token: TokenModel;

  finish_google = false;
  iframeCode: string;

  shareForm: FormGroup = this.formBuilder.group({
    emails: ['', [Validators.required, Validators.email]],
  });

  ngOnInit() {
    this.zone.run(() => {
      gapi.load('auth2', () => {
        this.initClient();
      });
    });
  }

  getPermissions() {

    if (this.currentUser.isSuperUser) {
      return false;
    }
    if (this.currentUser.idUserType === 1) {
      return false;
    }
    return true;
  }

  initClient() {
    this.zone.run(() => {
      // client_id: '727159322563-dfjdjctue6ega2dq22qvr18kocd3por6.apps.googleusercontent.com',
      gapi.auth2.init({
        client_id: '727159322563-dfjdjctue6ega2dq22qvr18kocd3por6.apps.googleusercontent.com',
        scope: 'profile email https://www.googleapis.com/auth/calendar'
      })

        .then(auth => {
          this.auth = auth;
          this.auth.isSignedIn.listen(is_signed => {
            if (is_signed) {
              this.getBasicProfile();
            } else {
              this.bookings = [];
            }
          });

          this.route.queryParamMap.subscribe(params => {
            const code = params.get('code');
            if (code) {
              this.zone.run(() => {
                this.bookingService.redeemCodeToken(code)
                  .subscribe((redeem_token: any) => {
                    this.token = {
                      access_token: redeem_token.access_token,
                      scope: redeem_token.scope,
                      token_type: redeem_token.token_type,
                      expiry_date: redeem_token.expiry_date,
                      id_token: redeem_token.id_token,
                      refresh_token: redeem_token.refresh_token
                    };
                    localStorage.setItem('token_google_auth', JSON.stringify(redeem_token));
                    gapi.auth2.getAuthInstance().signIn({
                      login_hint: redeem_token.profile.email,
                      ux_mode: 'redirect',
                      redirect_uri: `${environment.server_calendar}/booking`
                    });
                  }, error => {
                    this.bookingService.api.showToast(`Error creating access token.`, ToastType.error);
                    this.router.navigate(['/booking']);
                  });
              });
            } else {
              if (params.keys.length === 0) {
                // Auth
                if (auth.isSignedIn.get()) {
                  this.getBasicProfile();
                } else {
                  this.bookingService.api.showToast(`You need a google account to connect with.`, ToastType.info);
                }
                this.finish_google = true;
              }
            }

          });
        });
    });
  }

  getBasicProfile() {
    this.zone.run(() => {
      const google_user = this.auth.currentUser.get().getBasicProfile();
      this.user_google = {
        email: google_user.getEmail(),
        name: google_user.getName(),
        id: google_user.getId(),
        given_name: google_user.getGivenName(),
        picture: google_user.getImageUrl(),
        token: this.token.refresh_token,
        expiry_date: this.token.expiry_date
      };
      this.bookingService.registerGoogleUser(this.user_google)
        .subscribe(success => {
          localStorage.setItem('google_user_info', JSON.stringify(this.user_google));
          this.getBookings();
        }, error => {
          console.error(error);
          this.bookingService.api.showToast(`Error saving some google info.`, ToastType.error);
        });
    });
  }

  signIn() {
    this.zone.run(() => {
      this.bookingService.getAuthUrl()
        .subscribe((response: any) => {
          window.open(response.auth_url, '_self');
        });
      // this.auth.grantOfflineAccess({
      //   scope: 'https://www.googleapis.com/auth/calendar',
      //   prompt: 'select_account',

      // }).then(signed => {
      //   const code = signed.code;
      //   this.bookingService.redeemCodeToken(code)
      //     .subscribe((token_exchange: any) => {
      //       this.token = {
      //         access_token: token_exchange.access_token,
      //         scope: token_exchange.scope,
      //         token_type: token_exchange.token_type,
      //         expiry_date: token_exchange.expiry_date
      //       };
      //       localStorage.setItem('token_google_auth', JSON.stringify(token_exchange));
      //     });
      // })
      //   .catch(error => {
      //     console.error(error);
      //   });
    });
  }

  signOut() {
    this.auth.signOut();
    this.user_google = undefined;
    this.bookings = [];
  }

  getBookings() {
    this.bookingService.getBookings(this.user_google.id)
      .subscribe((data: any) => {
        if (this.auth.isSignedIn.get()) {
          this.bookings = data.bookings;
        } else {
          this.bookings = [];
        }
      }, error => {
        console.error(error);
      });
  }

  activateForm(activity?: any) {
    this.bookingForm = this.formBuilder.group({
      idOrganization: [this.currentUser.idIglesia, Validators.required],
      summary: [activity ? activity.summary : '', Validators.required],
      description: [activity ? activity.description : ''],
      created_by: [this.currentUser.idUsuario, Validators.required],
    });
    this.show_editable = true;
  }

  deactivateForm() {
    this.show_editable = false;
    this.bookingForm = undefined;
  }

  addBooking(activityForm: NgForm) {
    if (activityForm.valid) {
      this.finish_google = false;
      const payload = activityForm.value;
      let subscription: Observable<any>;
      if (payload.idBookingCalendar) {
        // update
        subscription = this.bookingService.updateBooking(payload);
      } else {
        // add
        subscription = this.bookingService.addBooking(payload);
      }
      subscription
        .subscribe(response => {
          this.finish_google = true;
          this.bookingService.api.showToast(`Booking created successfully.`, ToastType.success);
          this.getBookings();
          this.deactivateForm();
        }, error => {
          console.error(error);
          this.finish_google = true;
          this.bookingService.api.showToast(`Error creating the booking`, ToastType.error);
        });
    }
  }

  addBookingWithExistingCalendar(calendar: GoogleCalendarModel, selectCalendarToSync: NgxSmartModalComponent) {
    console.log(calendar);
    selectCalendarToSync.close();

    this.finish_google = false;
    calendar.idOrganization = this.currentUser.idIglesia;
    this.bookingService.addBookingWithExistingCalendar(calendar)
      .subscribe((response: any) => {
        this.finish_google = true;
        this.bookingService.api.showToast(`Booking created successfully.`, ToastType.success);
        this.getBookings();
        this.deactivateForm();
      }, error => {
        this.bookingService.api.showToast(`Error creating the booking`, ToastType.error);
        this.finish_google = true;
      });

  }

  encodeID(calendar_id: string) {
    return btoa(calendar_id);
  }

  openShareEmbed(iframeCodeModal: NgxSmartModalComponent, booking: BookingModel) {
    this.iframeCode = `<iframe
    src="${environment.server_calendar}/preview/${booking.idBookingCalendar}/${this.encodeID(booking.calendar_id)}"
    frameborder="0"
    width="100%"
    height="100%"
    style="min-height: 90vh">
  </iframe>`;
    iframeCodeModal.open();
  }

  shareCalendar(shareReportModal: NgxSmartModalComponent, booking: BookingModel) {
    shareReportModal.open();
    shareReportModal.setData(booking);
  }

  async sendEmail(form: FormGroup, shareReportModal: NgxSmartModalComponent) {
    const email = form.value.emails;
    const booking = shareReportModal.getData();
    this.bookingService.shareBookingCalendar(booking, email)
      .subscribe(success => {
        this.snackbar.open(`${email} will received an email to share your calendar.
          If ${email} is not in your organization, please add it. Thank you.`, 'OK', {
          duration: 4000
        });
        shareReportModal.close();
      }, error => {
        console.error(error);
        if (error.status === 403) {
          this.bookingService.api.showToast(`You have access to this Calendar, but since it doesn't own you, you can't share this booking`, ToastType.warning);
        } else {
          this.bookingService.api.showToast(`Error sharing this booking. Please try again.`, ToastType.error);
        }
      });
  }

  getCalendars(selectCalendarToSync: NgxSmartModalComponent) {
    this.finish_google = false;
    this.bookingService.getGoogleCalendars()
      .subscribe((response: any) => {
        this.deactivateForm();
        this.calendars = response.calendars;
        selectCalendarToSync.open();
        this.finish_google = true;
      }, error => {
        console.error(error);
        this.bookingService.api.showToast(`Error getting your calendars.`, ToastType.error);
        this.finish_google = true;
      });
  }

}
