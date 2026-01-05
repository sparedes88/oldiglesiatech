import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from './../../../../services/user.service';
import { ToastType } from '../../../../login/ToastTypes';
import { TimeSheetService } from './../../../../services/time-sheet.service';
import { TimeSheetModel, DepartamentoModel, WorkTypeModel } from './../../../../models/TimeSheetModel';
import { Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { IDropdownSettings, MultiSelectComponent } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-time-sheet-form',
  templateUrl: './time-sheet-form.component.html',
  styleUrls: ['./time-sheet-form.component.scss']
})
export class TimeSheetFormComponent implements OnInit {

  timesheet: TimeSheetModel;

  serverBusy = false;
  show_as_user: boolean = false;

  currentUser: any;

  @Output('onDismiss') onDismiss = new EventEmitter();
  @ViewChild('multi_select') multi_select: MultiSelectComponent;

  selectOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idIglesia',
    textField: 'Nombre',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true
  };

  selectDesignOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idDesignRequest',
    textField: 'description',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true
  };

  constructor(
    private timeSheetService: TimeSheetService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.currentUser = this.userService.getCurrentUser();

    this.timesheet = new TimeSheetModel();
    if (this.router.url.includes(`list`)) {
      this.show_as_user = true;
      if (this.currentUser.idUserType === 1) {
        if (this.currentUser.idIglesia !== Number(this.route.snapshot.params.idIglesia)) {
          this.router.navigate([`/time-sheet/${this.currentUser.idIglesia}/list`]);
        }
      } else {
        this.timeSheetService.api.showToast(`You don't have permission to see this page.`, ToastType.info);
        this.router.navigate([`/user-profile/details/${this.currentUser.idUsuario}`]);
        return;
      }
    }
  }

  ngOnInit() {
    this.timeSheetService.getTimesheetDropdown()
      .subscribe((response: any) => {
        const iglesia = {
          idIglesia: 0,
          Nombre: '-- Select --'
        };
        const departamento = new DepartamentoModel();
        departamento.idDepartamento = 0;
        departamento.nombre = '-- Select --';
        const workType = new WorkTypeModel();
        workType.idWorkType = 0;
        workType.name = '-- Select --';
        this.timesheet.iglesias = response.iglesias;
        // this.timesheet.iglesias.unshift(iglesia);
        this.timesheet.departamentos = response.departamentos;
        this.timesheet.departamentos.unshift(departamento);
        this.timesheet.workTypes = response.workTypes;
        this.timesheet.workTypes.unshift(workType);
        this.timesheet.requests = response.requests;
        setTimeout(() => {
          if (!this.currentUser.isSuperUser) {
            this.timesheet.iglesias = this.timesheet.iglesias.filter(x => x.idIglesia === this.currentUser.idIglesia);

            this.multi_select.writeValue(this.timesheet.iglesias.filter(x => x.idIglesia === this.currentUser.idIglesia));
            this.fixIdProject({ idIglesia: this.currentUser.idIglesia });

            this.timesheet.requests = this.timesheet.requests.filter(dr => !dr.isSuperUser && dr.idIglesia === this.currentUser.idIglesia);
          }
        });
      }, err => {
        console.error(err);
        this.timeSheetService.api.showToast('Something failed trying to get the data... Please try again.', ToastType.error);
      });
  }

  dismiss(response?) {
    if (response) {
      this.onDismiss.emit(response);
    } else {
      this.onDismiss.emit();
    }
  }

  submit(timesheet: TimeSheetModel) {
    this.serverBusy = true;
    timesheet.idUser = this.currentUser.idUsuario;

    const validate = this.validateInputs(timesheet);
    if (validate.success) {
      this.timeSheetService.addTimeSheet(timesheet)
        .subscribe(response => {
          this.timeSheetService.api.showToast('Record saved correctly', ToastType.success);
          this.dismiss(response);
          this.serverBusy = false;
        }, err => {
          console.error(err);
          this.serverBusy = false;
          this.timeSheetService.api.showToast('Error saving the timesheet', ToastType.error);
        });
    } else {
      this.serverBusy = false;
      // const alert = this.alertCtrl.create({
      //   title: 'Ups!',
      //   message: validate.message
      // });
      // alert.present();
      this.timeSheetService.api.showToast(validate.message, ToastType.info, 'Ups!');
    }
  }

  validateInputs(timesheet: TimeSheetModel) {
    const validate = {
      success: false,
      message: 'Success'
    };
    if (timesheet.idProject === 0) {
      validate.message = 'You need to select a Project/Organization.';
    } else if (timesheet.idDepartment === 0) {
      validate.message = 'You need to select a Department.';
    } else if (timesheet.idWorkType === 0) {
      validate.message = 'You need to select a type of work.';
    } else if (timesheet.notes === '') {
      validate.message = 'You have to add a note/description of the task.';
    } else if (!timesheet.workHours) {
      validate.message = 'You have to add the hours.';
    } else if (timesheet.workHours <= 0) {
      validate.message = 'The work hours should has to be greater than 0.';
    } else if (!timesheet.idUser && timesheet.idUser !== undefined) {
      validate.message = 'There is something wrong with your user';
    } else {
      validate.success = true;
    }
    return validate;
  }

  fixIdProject(event) {
    this.timesheet.idProject = event.idIglesia;
  }

}
