import { FormGroup, FormBuilder, Validators, NgForm, FormControl } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter, AfterViewInit, ViewChild, Input } from '@angular/core';
import { GroupEventModel, GroupModel, GroupEventActivityModel } from 'src/app/models/GroupModel';
import { GroupsService } from 'src/app/services/groups.service';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { environment } from 'src/environments/environment';
import { MatTable } from '@angular/material';

import { CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragHandle } from '@angular/cdk/drag-drop';
import * as moment from 'moment-timezone';
import { Observable } from 'rxjs';
import { MultiSelectComponent, IDropdownSettings } from 'ng-multiselect-dropdown';


@Component({
  selector: 'app-view-event-activities',
  templateUrl: './view-event-activities.component.html',
  styleUrls: ['./view-event-activities.component.scss']
})
export class ViewEventActivitiesComponent implements OnInit {

  @ViewChild('table') table: MatTable<GroupEventActivityModel>;
  @ViewChild('multi_select') multi_select: MultiSelectComponent;
  @ViewChild('multi_select_users') multi_select_users: MultiSelectComponent;
  displayedColumns: string[];

  // tslint:disable-next-line: no-output-on-prefix
  @Output() onDismiss = new EventEmitter();

  @Input() show_dismiss: boolean = true;

  group: GroupModel;
  group_event: GroupEventModel;
  activities: GroupEventActivityModel[] = [];
  groups: GroupModel[] = [];
  attachments: any[] = [];
  users: { idGroupUser: number, name: string }[] = [];

  currentUser: User;
  show_editable: boolean = false;

  activityForm: FormGroup;

  selectTeamOptions: any = {
    singleSelection: true,
    idField: 'idGroup',
    textField: 'title',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  };

  selectUserOptions: IDropdownSettings = {
    singleSelection: false,
    idField: 'idGroupUser',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
    enableCheckAll: false
  };

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

  getActivities() {
    const array = ['activity', 'time', 'notes', 'teams_involved', 'resources', 'files', 'time_start', 'time_end'];
    if (!this.getPermissions()) {
      array.push('actions');
    }

    this.displayedColumns = [...array];

    return new Promise((resolve, reject) => {
      this.groupService.getEventActivities(this.group_event)
        .subscribe((response: any) => {
          this.activities = response.activities;
          this.calculateStartsAndEnds();
          return resolve(this.activities);
        }, error => {
          if (error.error.msg.Code === 404) {
            this.activities = [];
            return resolve([]);
          }
          console.error(error);
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

  addActivity(activityForm: NgForm) {
    if (activityForm.valid) {
      const payload = activityForm.value;
      let subscription: Observable<any>;
      if (payload.idGroupEventActivity) {
        // update
        subscription = this.groupService.updateActivityEvent(payload);
      } else {
        // add
        subscription = this.groupService.addActivityEvent(payload);
      }
      subscription
        .subscribe(response => {
          this.getActivities();
          this.deactivateForm();
        }, error => {
          console.error(error);
        });
    }
  }

  fixIdGroup(event) {
    this.activityForm.patchValue({ idGroupTeam: event.idGroup });

    const group = this.groups.find(x => x.idGroup === event.idGroup);
    this.users = group.members;
  }

  fixUsersValues(event) {
    const idGroupUsers = [];
    this.multi_select_users.selectedItems.forEach(item => {
      idGroupUsers.push(item.id);
    });

    this.activityForm.patchValue({ idUserVolunteers: idGroupUsers });
  }


  updateActivity(event: GroupEventActivityModel) {
    this.activateForm(Object.assign({}, event));
  }

  deleteActivity(event: GroupEventActivityModel) {
    if (confirm(`Delete ${event.description}?`)) {
      this.groupService.deleteActivityEvent(event)
        .subscribe(data => {
          this.getActivities();
          this.groupService.api.showToast(`Activity successfully deleted.`, ToastType.success);
        },
          err => {
            console.error(err);
            this.groupService.api.showToast(`Error deleting activity.`, ToastType.error);
          });
    }
  }

  activateForm(activity?: GroupEventActivityModel) {
    this.groupService.getTeamGroups()
      .subscribe((data: any) => {
        this.groups = data.groups;
        // setTimeout(() => {
        this.activityForm = this.formBuilder.group({
          idGroupEvent: [this.group_event.idGroupEvent, Validators.required],
          description: [activity ? activity.description : '', Validators.required],
          activity_duration: [activity ? activity.activity_duration : '', Validators.required],
          idGroupTeam: [undefined, Validators.required],
          resources: [activity ? activity.resources : ''],
          notes: [activity ? activity.notes : ''],
          files: [''],
          created_by: [this.currentUser.idUsuario, Validators.required],
          sort: [activity ? activity.original_sort : this.activities.length + 1, Validators.required],
          idUserVolunteers: [undefined, Validators.required],
        });
        this.show_editable = true;
        if (activity) {
          this.activityForm.addControl('idGroupEventActivity', new FormControl(activity.idGroupEventActivity, Validators.required));
          this.attachments = activity.files as any[];
          this.activityForm.patchValue(
            {
              files: JSON.stringify(this.attachments)
            }
          );
        }
        // }, 100);
        setTimeout(() => {
          if (activity) {
            const group_array = this.groups.filter(g => g.idGroup === activity.idGroupTeam);
            this.multi_select.writeValue(group_array);

            const idGroupUsers = [];
            activity.members.forEach(user => {
              idGroupUsers.push(user.idGroupUser);
            });

            const group = group_array[0];
            this.fixIdGroup(group);
            this.activityForm.patchValue({ idGroupTeam: activity.idGroupTeam });
            this.activityForm.patchValue({ idUserVolunteers: idGroupUsers });
            this.multi_select_users.writeValue(group.members.filter(member => {
              return idGroupUsers.includes(member.idGroupUser);
            }));
          }
        }, 100);
      }, error => {
        console.error(error);
        if (error.error.msg.Code === 404) {
          // this.groupService.api.showToast(`There aren't team groups. You need at least 1 team group to continue.`, ToastType.info, `Nothing found.`);
        } else {
          this.groupService.api.showToast(`Something happened while trying to get organization's groups.`, ToastType.error);
        }
      });
  }

  deactivateForm() {
    this.show_editable = false;
    this.activityForm = undefined;
  }

  dismiss() {
    this.deactivateForm();
    this.onDismiss.emit();
  }

  private async onFileChange(files: FileList) {
    if (files.length && files.length > 0) {
      // this.processing = true;
      console.log(`Processing ${files.length} file(s).`);
      // setTimeout(() => {
      //   // Fake add attachment
      //   // this.processing = false;
      //   this.fus.uploadFile()
      // }, 1000);
      // this.message.has_attachments = true;
      const array = Array.from(files);
      for (const file of array) {
        const url: any = await this.fus.uploadFile(file, true, `events_files`).toPromise();
        this.attachments.push({ name: file.name, url: this.fus.cleanPhotoUrl(url.response) });
        // .subscribe((response: any) => {

        // });
      }
      this.activityForm.patchValue(
        { files: JSON.stringify(this.attachments) }
      );
    }
  }

  uploadPicture(input_file) {
    if (!this.getPermissions()) {
      input_file.onchange = (event: { target: { files: FileList } }) => {
        if (event.target.files.length > 0) {
          this.onFileChange(event.target.files);
        }
      };
      input_file.click();
    }
  }

  getUrl(url) {
    return `${environment.serverURL}${url}`;
  }

  calculateStartsAndEnds() {
    let next_time_start;
    console.log(this.group_event);

    if (!this.group_event.all_day) {
      next_time_start = moment.tz(this.group_event.full_start_date, this.group_event.timezone).format('hh:mm a');
    } else {
      next_time_start = moment().format('hh:mm a');
    }
    this.activities.forEach((activ) => {
      activ.time_start = next_time_start;
      activ.time_end = moment(next_time_start, 'hh:mm a').add(activ.activity_duration, 'minute').format('hh:mm a');
      next_time_start = activ.time_end;
    });
  }


  dropTable(event: CdkDragDrop<GroupEventActivityModel[]>) {
    const prevIndex = this.activities.findIndex((d) => d === event.item.data);
    moveItemInArray(this.activities, prevIndex, event.currentIndex);
    this.calculateStartsAndEnds();
    this.activities.forEach((activ, i) => {
      activ.sort = i + 1;
    });
    this.table.renderRows();
  }

  checkSort() {
    if (this.activities.length > 0) {
      const diff = this.activities.filter(x => x.sort !== x.original_sort);
      return diff.length > 0;
    }
    return false;
  }

  resetSort() {
    this.activities = [...this.activities].sort((a, b) => {
      return `${a.original_sort}` > `${b.original_sort}` ? 1 : -1;
    });
  }

  saveSort() {
    const payload = [];
    this.activities.forEach(activity => {
      payload.push(
        {
          sort: activity.sort,
          idGroupEventActivity: activity.idGroupEventActivity
        }
      );
    });
    this.groupService.updateEventActivitiesSort(payload)
      .subscribe(response => {
        this.activities.forEach(activity => {
          activity.original_sort = activity.sort;
        });
      }, error => {
        console.error(error);
        this.groupService.api.showToast(`Error updating the order of the activities.`, ToastType.error);
      });
  }

  print() {
    const path: string = `${environment.apiUrl}/groups/events/${this.group_event.idGroupEvent}/activities/pdf/`;

    const win = window.open(path, '_blank');
    win.focus();
  }

}
