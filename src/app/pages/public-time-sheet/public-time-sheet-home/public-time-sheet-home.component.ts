import { Observable } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TimeSheetService } from './../../../services/time-sheet.service';
import { ToastType } from '../../../login/ToastTypes';
import { OrganizationService } from './../../../services/organization/organization.service';
import { TimeSheetModel } from './../../../models/TimeSheetModel';
import { UserService } from 'src/app/services/user.service';
import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { environment } from '../../../../environments/environment'
import { User } from 'src/app/interfaces/user';
import { PublicTimeSheetFormComponent } from '../public-time-sheet-form/public-time-sheet-form.component';
@Component({
  selector: 'app-public-time-sheet-home',
  templateUrl: './public-time-sheet-home.component.html',
  styleUrls: ['./public-time-sheet-home.component.scss']
})
export class PublicTimeSheetHomeComponent implements OnInit {

  currentUser: User;
  timesheets: TimeSheetModel[];
  summary: TimeSheetModel[];
  summary_by_day: TimeSheetModel[];
  logo: string = ''

  total_workHours: number;

  day: string = '0';
  days = [
    {
      value: 0,
      name: 'All',
    },
    {
      value: 1,
      name: 'Dias_Lunes',
    },
    {
      value: 2,
      name: 'Dias_Martes',
    },
    {
      value: 3,
      name: 'Dias_Miercoles',
    },
    {
      value: 4,
      name: 'Dias_Jueves',
    },
    {
      value: 5,
      name: 'Dias_Viernes',
    },
    {
      value: 6,
      name: 'Dias_Sabado',
    },
    {
      value: 7,
      name: 'Dias_Domingo',
    }
  ];

  filterDates = {
    start: moment().format('YYYY-MM-DD'),
    end: moment().format('YYYY-MM-DD'),
    idIglesia: 0
  };

  users: any[] = [];
  users_2: any[] = [];
  // users: UsuarioModel[] = [];

  serverBusy: boolean = false;
  idUser: number = 0;

  select_options: any = {
    singleSelection: true,
    idField: 'idUsuario',
    textField: 'fullName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  };

  serverUrl: string = environment.apiUrl

  constructor(
    private userService: UserService,
    private organizationService: OrganizationService,
    private timesheetService: TimeSheetService,
    private modal: NgxSmartModalService
  ) {
    this.currentUser = this.userService.getCurrentUser();
    this.filterDates.start = moment().startOf('isoWeek').format('YYYY-MM-DD');
    this.filterDates.end = moment().endOf('isoWeek').format('YYYY-MM-DD');
    this.day = '0';
    this.search();
    if (this.currentUser.idUsuario === 78 || this.currentUser.idUsuario === 152
      || this.currentUser.idUsuario === 235
      || this.currentUser.idUsuario === 275
      || this.currentUser.idUsuario === 10721
      ) {
      this.organizationService.getUsers()
        .subscribe((response: any) => {
          if (response.msg.Code === 200) {
            this.users = response.users;
          } else {
            this.users = [];
          }
          const user = {
            idUserType: 0,
            idUsuarioSistema: 0,
            nombre: '-- Select',
            apellido: ' All --',
            fullName: '-- Select All --'
          };
          this.users.unshift(user);
        }, err => {
          console.error(err);
          this.organizationService.api.showToast('Error getting the users', ToastType.error);
        });
    }
    if (this.currentUser.idUserType === 1 || this.currentUser.isSuperUser) {
      this.getUsersAsPromise().then((response: any) => {
        if (response.msg.Code === 200) {
          this.users_2 = response.users;
        } else {
          this.users_2 = [];
        }
        const user = {
          idUserType: 0,
          idUsuarioSistema: 0,
          nombre: '-- Select',
          apellido: ' All --',
          fullName: '-- Select All --'
        };
        this.users_2.unshift(user);
      });
    }

  }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
  }

  search() {
    this.serverBusy = true;
    // const loading = this.loadingCtrl.create({
    //   enableBackdropDismiss: false,
    //   content: 'Wait until we get the TimeSheets...',
    //   cssClass: 'loading-fix-content-size'
    // });
    // loading.present();
    let idUser = 0;
    if (this.currentUser.idUsuario === 78 || this.currentUser.idUsuario === 152
      || this.currentUser.idUsuario === 235
      || this.currentUser.idUsuario === 275
      || this.currentUser.idUsuario === 10721
      ) {
      idUser = this.idUser;
    } else {
      if (!this.currentUser.isSuperUser) {
        this.filterDates.idIglesia = this.currentUser.idIglesia;
        if (this.currentUser.idUserType === 1) {
          idUser = this.idUser;
        } else {
          idUser = this.currentUser.idUsuario;
        }
      } else {
        idUser = this.currentUser.idUsuario;
      }
    }

    this.timesheetService.getTimesheetByIdUsuario(idUser, this.filterDates)
      .subscribe((response: any) => {
        // loading.dismiss();
        this.timesheets = response.timesheets;
        this.summary = response.summary;
        this.summary_by_day = response.summary_by_day;
        this.total_workHours = response.total_workHours;
        this.serverBusy = false;
      }, err => {
        console.error(err);
        // loading.dismiss();
        this.organizationService.api.showToast('Error getting your Time sheet...', ToastType.error);
        this.serverBusy = false;
      });
  }

  print() {
    let idUser = 0;
    let fullName = ''

    if (this.currentUser.idUsuario === 78 || this.currentUser.idUsuario === 152
      || this.currentUser.idUsuario === 235
      || this.currentUser.idUsuario === 275
      || this.currentUser.idUsuario === 10721
      ) {
      idUser = this.idUser;
    } else {
      fullName = `${this.currentUser.nombre} ${this.currentUser.apellido}`
      if (!this.currentUser.isSuperUser) {
        this.filterDates.idIglesia = this.currentUser.idIglesia;
        if (this.currentUser.idUserType === 1) {
          idUser = this.idUser;
        } else {
          idUser = this.currentUser.idUsuario;
        }
      } else {
        idUser = this.currentUser.idUsuario;
      }
    }

    let path: string = `${
      this.serverUrl}/timesheets/getTimesheetPdf/?idUser=${
      idUser}&start=${
      this.filterDates.start}&end=${
      this.filterDates.end}&full_name=${
      fullName}&logo=${this.logo}&idIglesia=${this.filterDates.idIglesia}`

    const win = window.open(path, '_blank');
    win.focus();
  }

  getLogo() {
    this.timesheetService.getTimesheetDropdown()
      .subscribe(
        (data: any) => {
          if (data.iglesias) {
            let organization = data.iglesias.find(ig => ig.idIglesia == this.currentUser.idIglesia)
            if (organization && organization.Logo) {
              this.logo = organization.Logo.split('https://iglesia-tech-api.e2api.com').pop()
            }
          }
        },
        err => console.error(err)
      )
  }

  getItemsByDay(timesheets: TimeSheetModel[]) {
    if (this.day === '0') {
      return timesheets;
    }
    return timesheets.filter(timesheet => {
      return timesheet.day === Number.parseInt(this.day, 10);
    });
  }

  changeDay(item) {
    this.day = item.value.toString();
  }

  addTimeSheet() {
    this.modal.getModal('formModal_PT').open();
  }

  initTimeSheet(time_sheet_form_1: PublicTimeSheetFormComponent) {
    time_sheet_form_1.timesheet = new TimeSheetModel();
    time_sheet_form_1.ngOnInit();
  }

  onModalDidDismiss(response?: any) {
    this.modal.getModal('formModal_PT').close();
    if (response) {
      this.search();
    }
  }

  isPrimeNumber(num) {
    for (let i = 2, s = Math.sqrt(num); i <= s; i++) {
      if (num % i === 0) {
        return false;
      }
    }
    return num > 1;
  }

  getUsersAsPromise() {
    return new Promise((resolve, reject) => {
      this.organizationService.api.get('getUsuarios', { idIglesia: this.currentUser.idIglesia })
        .subscribe((data: any) => {
          data.usuarios.map(user => {
            user.idUsuarioSistema = user.idUsuario;
            user.fullName = `${user.nombre} ${user.apellido}`;
          });
          data.users = data.usuarios;
          return resolve(data);
        }, error => {
          return reject([]);
        });
    });
  }

}
