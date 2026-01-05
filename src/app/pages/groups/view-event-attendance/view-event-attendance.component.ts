import { Component, OnInit, Output, EventEmitter, ViewChild, Input } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { GroupModel, GroupEventModel, GroupEventAttendanceModel } from 'src/app/models/GroupModel';
import { UserService } from 'src/app/services/user.service';
import { GroupsService } from 'src/app/services/groups.service';
import { FormBuilder, Validators, FormArray, FormGroup, FormControl } from '@angular/forms';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { MatSlideToggle } from '@angular/material';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-event-attendance',
  templateUrl: './view-event-attendance.component.html',
  styleUrls: ['./view-event-attendance.component.scss']
})
export class ViewEventAttendanceComponent implements OnInit {

  // tslint:disable-next-line: no-output-on-prefix
  @Output() onDismiss = new EventEmitter();
  @Output() refresh_totals = new EventEmitter();

  @Input() show_dismiss: boolean = true;

  @ViewChild('mat_all') mat_all: MatSlideToggle;

  group: GroupModel;
  group_event: GroupEventModel;
  attendances: GroupEventAttendanceModel[] = [];
  total_guests: number = 0;

  currentUser: User;
  show_editable: boolean = false;
  show_loading: boolean = false;
  should_check_all: boolean = true;
  was_saved: boolean = false;

  attendanceStatusForm: FormGroup = this.formBuilder.group({
    attendance: this.formBuilder.array([])
  });

  search_form: FormGroup = this.formBuilder.group({
    search_value: new FormControl('')
  });

  constructor(
    private userService: UserService,
    private groupService: GroupsService,
    private formBuilder: FormBuilder,
    private fus: FileUploadService
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }


  ngOnInit() {
  }

  getAttendance() {
    this.show_loading = true;
    return new Promise((resolve, reject) => {
      this.groupService.getEventAttendances(this.group_event)
        .subscribe((response: any) => {
          this.attendances = response.attendances;
          this.attendanceStatusForm = this.formBuilder.group({
            attendance: this.formBuilder.array([])
          });
          if (this.attendances.length === 0) {
            this.should_check_all = false;
          }
          this.total_guests = 0;
          this.attendances.forEach((attendance, index) => {
            attendance.index = index;
            this.total_guests += attendance.guests || 0;
            const control = this.attendanceStatusForm.controls.attendance as FormArray;
            control.push(this.formBuilder.group({
              attended: new FormControl({ value: attendance.attended, disabled: this.getPermissions() },
                [
                  Validators.required
                ]),
              idGroupEvent: new FormControl(this.group_event.idGroupEvent, [
                Validators.required,
              ]),
              index: new FormControl(index, [Validators.required]),
            }));

            if (!attendance.attended) {
              this.should_check_all = false;
            }
          });

          this.show_loading = false;
          return resolve(this.attendances);
        }, error => {
          this.show_loading = false;
          if (error.error.msg.Code === 404) {
            this.attendances = [];
            // const status = new GroupEventAttendanceStatusModel();
            // status.name = 'Error getting status';
            // this.status_list = [status];
            return resolve([]);
          }
          console.error(error);
          this.groupService.api.showToast(`Error getting attendance.`, ToastType.error);
          return reject([]);
        });
    });
  }

  getPermissions() {
    if (this.group) {

      // read only
      if (this.group.is_leader) {
        return false;
      }
      if (this.currentUser.isSuperUser) {
        return false;
      }
      if (this.currentUser.idUserType === 1) {
        return false;
      }
      return true;
    } else {
      return true;
    }
  }

  get attendance_on_form() {
    return this.attendanceStatusForm.get('attendance') as FormArray;
  }

  checkChange(control: FormControl, attendance: GroupEventAttendanceModel) {
    if (Boolean(JSON.parse(control.value)) === attendance.original_attended) {
      control.markAsPristine();
    }
    attendance.attended = Boolean(JSON.parse(control.value));
  }

  dismiss() {
    this.onDismiss.emit(this.was_saved);
  }

  checkIfMassive() {
    if (this.attendances.length > 0) {
      const diff = this.attendances.filter(x => x.attended !== x.original_attended);
      return diff.length > 0;
    }
    return false;
  }

  resetCheckMassive() {
    this.attendances.forEach((attendance, i) => {
      attendance.attended = attendance.original_attended;
      this.attendance_on_form.controls[i].get('attended').setValue(attendance.original_attended);
      this.attendance_on_form.controls[i].get('attended').markAsPristine();
    });
  }

  resetAttendedForm(control: FormGroup, attendance: GroupEventAttendanceModel) {
    control.get('attended').setValue(attendance.original_attended);
    control.get('attended').markAsPristine();
    attendance.attended = attendance.original_attended;
  }

  updateSpentType(control: FormGroup, attendance: GroupEventAttendanceModel) {
    this.was_saved = true;

    const attendance_temp = Object.assign({}, attendance);
    attendance_temp.attended = Boolean(JSON.parse(control.get('attended').value));
    if (attendance_temp.attended === attendance.original_attended) {
      control.get('attended').setValue(attendance.attended);
      control.get('attended').markAsPristine();
    } else {
      attendance_temp.idGroupEvent = this.group_event.idGroupEvent;
      this.groupService.updateAttendanceEvent(attendance_temp)
        .subscribe(response => {
          this.groupService.api.showToast(`Attended updated.`, ToastType.info);
          control.get('attended').setValue(attendance_temp.attended);
          control.get('attended').markAsPristine();
          if (!this.show_dismiss) {
            const available = this.attendances.length;
            const totals = this.group_event.attendances_total;
            const count = this.attendances.filter(x => x.attended).length;
            this.refresh_totals.emit({ totals, count, available });
          }
          this.getAttendance();
        }, error => {
          console.error(error);
          this.groupService.api.showToast(`Error updating the attendance. Reversing changes...`, ToastType.error);
          control.get('attended').setValue(attendance.original_attended);
          control.get('attended').markAsPristine();
        });
    }
  }

  addMemberToEvent(control: FormGroup, attendance: GroupEventAttendanceModel) {
    this.show_loading = true;
    this.was_saved = true;

    const attendance_temp = Object.assign({}, attendance);
    attendance_temp.idGroupEvent = this.group_event.idGroupEvent;
    attendance_temp.attended = false;
    this.groupService.updateAttendanceEvent(attendance_temp)
      .subscribe(response => {
        this.groupService.api.showToast(`Member added.`, ToastType.info);
        control.get('attended').setValue(attendance_temp.attended);
        control.get('attended').markAsPristine();
        if (!this.show_dismiss) {
          const available = this.attendances.length;
          const totals = this.group_event.attendances_total;
          const count = this.attendances.filter(x => x.attended).length;
          this.refresh_totals.emit({ totals, count, available });
        }
        this.getAttendance();
      }, error => {
        this.show_loading = false;
        console.error(error);
        this.groupService.api.showToast(`Error updating the attendance. Reversing changes...`, ToastType.error);
        control.get('attended').setValue(attendance.original_attended);
        control.get('attended').markAsPristine();
      });

  }

  saveAttendanceMassive() {
    this.was_saved = true;

    const payload = [];
    this.show_loading = true;
    this.attendances.forEach(attendance => {
      if (attendance.original_attended !== attendance.attended) {
        payload.push(
          {
            attended: attendance.attended,
            idGroupEventAttendance: attendance.idGroupEventAttendance,
            idGroupUser: attendance.idGroupUser,
            idGroupEvent: this.group_event.idGroupEvent,
            created_by: this.currentUser.idUsuario
          }
        );
      }
    });

    this.groupService.updateEventAttendances(payload)
      .subscribe(response => {
        this.attendances.forEach((attendance, i) => {
          attendance.original_attended = attendance.attended;
          this.attendance_on_form.controls[i].get('attended').setValue(attendance.original_attended);
          this.attendance_on_form.controls[i].get('attended').markAsPristine();
        });
        if (!this.show_dismiss) {
          const available = this.attendances.length;
          const totals = this.group_event.attendances_total;
          const count = this.attendances.filter(x => x.attended).length;
          this.refresh_totals.emit({ totals, count, available });
        }
        this.show_loading = false;
      }, error => {
        console.error(error);
        this.groupService.api.showToast(`Error updating the attendances.`, ToastType.error);
        this.show_loading = false;
      });
  }

  toggleAll(event: MatSlideToggle) {
    this.attendances.forEach((attendance, i) => {
      this.attendance_on_form.controls[i].get('attended').setValue(event.checked);
      attendance.attended = event.checked;
      if (attendance.original_attended !== event.checked) {
        this.attendance_on_form.controls[i].get('attended').markAsDirty();
      } else {
        this.attendance_on_form.controls[i].get('attended').markAsPristine();
      }
    });

  }

  print() {
    const path: string = `${environment.apiUrl}/groups/events/${this.group_event.idGroupEvent}/attendances/pdf/`;

    const win = window.open(path, '_blank');
    win.focus();
  }

  get filtered_attendances() {
    if (this.search_form.valid) {
      const search_value: string = this.search_form.get('search_value').value.toLowerCase();
      return this.attendances.filter(x => JSON.stringify(x).toLowerCase().includes(search_value));
    }
    return this.attendances;
  }

}
