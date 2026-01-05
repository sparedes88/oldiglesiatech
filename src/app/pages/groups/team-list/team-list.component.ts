import { Component, OnInit, ViewChild } from '@angular/core';
import { GroupsService } from 'src/app/services/groups.service';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { UserService } from 'src/app/services/user.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { GroupModel, GroupCategoryModel } from 'src/app/models/GroupModel';
import { ToastType } from 'src/app/login/ToastTypes';
import { GroupFormComponent } from '../group-form/group-form.component';
import { environment } from 'src/environments/environment';
import { GroupCategoryFormComponent } from '../group-category-form/group-category-form.component';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit {

  constructor(
    public groupService: GroupsService,
    public modal: NgxSmartModalService,
    public userService: UserService) {
    // Load current user
    this.currentUser = this.userService.getCurrentUser();
  }

  // Data tables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: 'Blfrtip',
    lengthMenu: [10, 25, 50, 100, 250, 500],
    buttons: [
      { extend: 'copy', className: 'btn btn-outline-primary btn-sm' },
      { extend: 'print', className: 'btn btn-outline-primary btn-sm', action: this.print.bind(this) },
      { extend: 'csv', className: 'btn btn-outline-primary btn-sm' },
    ]
  };

  // data
  public currentUser: any;
  public groups: GroupModel[] = [];
  public totalGroups: number;
  public selectedGroup: any;

  ngOnInit() {
    this.getGroups();
  }

  /**
   * Retrieve groups list from API
   */
  getGroups() {
    this.groupService.getTeamGroups()
      .subscribe(
        (data: any) => {
          this.groups = data.groups;
          this.restartTable();
          this.totalGroups = this.groups.length;
        },
        error => {
          console.error(error);
          if (error.error.msg.Code === 404) {
            // this.groupService.api.showToast(`There aren't groups yet.`, ToastType.info, `Nothing found.`);
          } else {
            this.groupService.api.showToast(`Something happened while trying to get organization's groups.`, ToastType.error);
          }
        },
        () => this.dtTrigger.next()
      );
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
  }

  addGroup(groupFormModal: NgxSmartModalComponent, group_form: GroupFormComponent) {
    group_form.ngOnInit();
    groupFormModal.open();
    group_form.setTeamType();
  }

  updateGroup() {
    this.modal.getModal('editFormModal').close();
    setTimeout(() => {
      this.getGroups();
    }, 300);
  }

  fixUrl(url: string) {
    if (url) {
      if (url.includes('https')) {
        return url;
      } else {
        if (url.startsWith('/')) {
          return `${environment.serverURL}${url}`;
        }
        return `${environment.serverURL}/${url}`;
      }
    } else {
      return 'assets/img/default-image.jpg';
    }
  }

  deleteGroup(group: GroupModel) {
    if (confirm(`Delete ${group.title}?`)) {
      this.groupService.deleteGroup(group)
        .subscribe(data => {
          this.getGroups();
          this.groupService.api.showToast(`Group successfully deleted.`, ToastType.success);
        },
          err => {
            console.error(err);
            this.groupService.api.showToast(`Error deleting group.`, ToastType.error);
          });
    }
  }

  addCategory(categoryFormModal: NgxSmartModalComponent, group_category_form: GroupCategoryFormComponent) {
    categoryFormModal.open();
    const group_category = new GroupCategoryModel();
    group_category_form.group_category = group_category;
  }

  onModalDidDismiss(categoryFormModal: NgxSmartModalComponent, response?: any) {
    categoryFormModal.close();
  }

  print() {
    const path: string = `${environment.apiUrl}/groups/teams/pdf?idIglesia=${this.currentUser.idIglesia}`;
    const win = window.open(path, '_blank');
    win.focus();
  }
}
