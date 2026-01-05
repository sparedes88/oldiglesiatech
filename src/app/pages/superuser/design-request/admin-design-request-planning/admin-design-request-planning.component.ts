import { Router } from '@angular/router';
import { DesignRequestModel, DesignRequestStatusModel, DesignRequestTypesModel } from '../../../../models/DesignRequestModel';
import { ToastType } from '../../../../login/ToastTypes';
import { OrganizationService } from '../../../../services/organization/organization.service';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { DesignRequestService } from 'src/app/services/design-request.service';
import { DesignRequestFormComponent } from '../admin-design-request-form/admin-design-request-form.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AdminDesignRequestDetailComponent } from '../admin-design-request-detail/admin-design-request-detail.component';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-admin-design-request-planning',
  templateUrl: './admin-design-request-planning.component.html',
  styleUrls: ['./admin-design-request-planning.component.scss']
})
export class DesignRequestPlanningComponent implements OnInit {

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screen_width = event.target.innerWidth;
  }
  @ViewChild('design_detail') design_detail: AdminDesignRequestDetailComponent;

  idUser: any[] = [];
  idStatus: any[] = [];
  idPriorities: any[] = [];
  users: any[] = [];
  contacts: any[] = [];

  max = 0;

  dropdowns: {
    statuses: DesignRequestStatusModel[],
    priorities: DesignRequestTypesModel[],
  } = {
      statuses: [],
      priorities: [],
    };

  public selectOptions: any = {
    singleSelection: false,
    idField: 'idUsuarioSistema',
    textField: 'fullName',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
    clearSearchFilter: true
  };

  public selectStatusOptions: any = {
    singleSelection: false,
    idField: 'idDesignRequestStatus',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
    clearSearchFilter: true
  };

  public selectPriorityOptions: any = {
    singleSelection: false,
    idField: 'idDesignRequestPriority',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
    clearSearchFilter: true
  };

  selected_design_request: any;
  screen_width: number;
  search_form = new FormGroup({
    deadline: new FormControl(undefined)
  })

  constructor(
    private organizationService: OrganizationService,
    private designRequestService: DesignRequestService,
    private router: Router,
    private modal: NgxSmartModalService
  ) { }

  ngOnInit() {
    this.screen_width = window.innerWidth;
    this.getStatuses();
    this.organizationService.getUsers()
      .subscribe((response: any) => {
        if (response.msg.Code === 200) {
          this.users = response.users;
        } else {
          this.users = [];
        }
        // const user = {
        //   idUserType: 0,
        //   idUsuarioSistema: 0,
        //   nombre: '-- Select',
        //   apellido: ' All --',
        //   fullName: '-- Select All --'
        // };
        // this.users.unshift(user);
      }, err => {
        console.error(err);
        this.organizationService.api.showToast('Error getting the users', ToastType.error);
      });
  }

  async getStatuses() {
    const response = await this.designRequestService.getDesignRequestDropdown().toPromise<any>();
    this.dropdowns.statuses = response.statuses.filter(x => x.idDesignRequestStatus != 4 && x.idDesignRequestStatus != 5);
    this.dropdowns.priorities = response.priorities;
  }

  displayWarningOnClose(event) {
    if (this.idUser.length >= 5 && this.idUser) {
      this.organizationService.api.showToast(`If you select 5 or more users, the call could take few minutes.`, ToastType.warning);
    }
  }

  displayWarning() {
    this.organizationService.api.showToast(`If you select all the users, the call could take few minutes.`, ToastType.warning);
  }

  createPlanningTable() {
    const array_users = this.idUser.map(({ idUsuarioSistema }) => idUsuarioSistema);
    const array_statuses = this.idStatus.map(({ idDesignRequestStatus }) => idDesignRequestStatus);
    const array_priorities = this.idPriorities.map(({ idDesignRequestPriority }) => idDesignRequestPriority);

    const search_value = this.search_form.value;

    const params: Partial<{ users: number[]; statuses: number[]; priorities: number[]; deadline: string }> = {
      users: array_users,
      statuses: array_statuses,
      priorities: array_priorities
    };

    if (search_value.deadline) {
      params.deadline = search_value.deadline;
    }

    if (array_users.length > 0) {
      this.designRequestService.getDesignRequestsForUsers(params)
        .subscribe((response: any) => {
          this.contacts = response.requests;
          if (this.contacts.length > 0) {
            this.max = this.contacts[0].total;
          } else {
            // No hay nada :(
          }
        }, error => {
          // Please try again.
        });
    } else {
      this.organizationService.api.showToast(`You must select at least 1 user`, ToastType.info, 'Select an user');
    }
  }

  fixedSize(designRequests: DesignRequestModel[]) {
    return new Array(this.max - designRequests.length);
  }

  goToDetail(contact: DesignRequestModel) {
    this.router.navigate([`/admin/design-request/detail/${contact.idDesignRequest}`], {
      queryParams: {
        origin: 'planning'
      }
    });
  }

  addDesignRequest(design_request_form: DesignRequestFormComponent, contact) {
    this.modal.getModal('design_request_form_modal_2').open();
    design_request_form.designRequest = new DesignRequestModel();
    design_request_form.designRequest.assignedTo = contact.idUser;
    design_request_form.isEdit = false;
    design_request_form.ngOnInit();
  }

  onModalDidDismiss(response?: any) {
    this.modal.getModal('design_request_form_modal_2').close();
    if (response) {
      this.createPlanningTable();
    }
  }

  setPreview(e, item) {
    this.selected_design_request = item;
    if (this.screen_width > 767) {
      e.preventDefault();
      setTimeout(() => {
        this.design_detail.show_detail = false;
        this.design_detail.designRequest.idDesignRequest = item.idDesignRequest;
        this.design_detail.loadInfo();
      }, 100);
    }
  }

}
