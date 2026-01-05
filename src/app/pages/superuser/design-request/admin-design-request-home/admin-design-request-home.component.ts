import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subject } from 'rxjs';

import { ToastType } from '../../../../login/ToastTypes';
import { DesignRequestFormComponent } from '../admin-design-request-form/admin-design-request-form.component';
import { DesignRequestModel, DesignRequestStatusModel } from '../../../../models/DesignRequestModel';
import { DesignRequestService } from '../../../../services/design-request.service';
import { UserService } from '../../../../services/user.service';
import { User } from 'src/app/interfaces/user';
import * as moment from 'moment';
@Component({
  selector: 'app-admin-design-request-home',
  templateUrl: './admin-design-request-home.component.html',
  styleUrls: ['./admin-design-request-home.component.scss']
})
export class DesignRequestHomeComponent implements OnInit {

  // @ViewChild(DataTableDirective)
  // dtElement: DataTableDirective;

  // dtTrigger: Subject<any> = new Subject();
  // dtOptions: any = {
  //   dom: 'Blfrtip',
  //   lengthMenu: [10, 25, 50, 100, 250, 500],
  //   buttons: [
  //     { extend: 'copy', className: 'btn btn-outline-citric btn-sm' },
  //     { extend: 'print', className: 'btn btn-outline-citric btn-sm' },
  //     { extend: 'csv', className: 'btn btn-outline-citric btn-sm' },
  //   ],
  //   order: [[0, 'desc']],
  //   columns: [
  //     null, null, null, null, null, null, null, null, null,
  //     {
  //       title: 'Date',
  //       data: (row, type, val) => {
  //         if (type === 'set') {
  //           row.createdAt = val; return;
  //         }
  //         if (type === 'sort') {
  //           const moment_date = moment(row.createdAt, 'MMM DD YYYY').format('YYYY-MM-DD')
  //           return moment_date;
  //         }
  //         return row.createdAt;
  //       }
  //     }, null, null, null, null
  //   ]
  // };


  // designRequests: DesignRequestModel[] = [];
  // designRequests_original: DesignRequestModel[] = [];
  // statuses: DesignRequestStatusModel[] = [];
  // selected_status: DesignRequestStatusModel;

  // samsonMode: boolean = false
  // show_as_user: boolean = false;
  // is_loading: boolean = true;

  // currentUser: User;
  // parent_id: number = 1;

  constructor(
    private designRequestService: DesignRequestService,
    private modal: NgxSmartModalService,
    private userService: UserService,
    private activated_route: ActivatedRoute,
    private router: Router
  ) {
    // // this.currentUser = this.userService.getCurrentUser();
    // // if (this.router.url.includes(`list`)) {
    // //   this.show_as_user = true;
    // //   if (this.currentUser.idUserType === 1) {
    // //     if (this.currentUser.idIglesia !== Number(this.activated_route.snapshot.params.idIglesia)) {
    // //       this.router.navigate([`/design-request/${this.currentUser.idIglesia}/list`]);
    // //     }
    // //   } else {
    // //     if (!this.currentUser.isSuperUser) {
    // //       this.designRequestService.api.showToast(`You don't have permission to see this page.`, ToastType.info);
    // //       this.router.navigate([`/user-profile/details/${this.currentUser.idUsuario}`]);
    // //       return;
    // //     }
    // //   }
    // // }
  }

  get query_params() {
    const query_params = this.activated_route.snapshot.queryParams;
    return query_params;
  }

  ngOnInit() {
    // // const query_params = this.activated_route.snapshot.queryParams;;
    // // if (query_params.category) {
    // //   this.parent_id = Number(query_params.category);
    // //   if (isNaN(this.parent_id)) {
    // //     this.parent_id = 1;
    // //   }
    // // }
    // // this.router.navigate(
    // //   [],
    // //   {
    // //     relativeTo: this.activated_route,
    // //     queryParams: { category: this.parent_id },
    // //     queryParamsHandling: 'merge'
    // //   });
    // // this.load();
  }

  load() {
    // // const promises: Promise<any>[] = [];
    // // promises.push(this.getStatuses());
    // // Promise.all(promises).then((response: any) => {
    // //   if (response[0].msg.Code === 200) {
    // //     this.statuses = response[0].statuses;
    // //   } else {
    // //     this.statuses = [];
    // //   }
    // //   const new_status = new DesignRequestStatusModel();
    // //   new_status.name = 'All';
    // //   new_status.summary = this.statuses.filter(x => x.summary).map(x => x.summary).reduce((partialSum, a) => partialSum + a, 0);
    // //   new_status.idDesignRequestParentStatus = this.parent_id;
    // //   this.statuses.unshift(new_status)
    // //   const query_params = this.activated_route.snapshot.queryParams;
    // //   if (query_params.status) {
    // //     const idStatus = Number(query_params.status);
    // //     const min_status_summary = this.statuses.find(x => x.idDesignRequestStatus === idStatus);
    // //     if (min_status_summary) {
    // //       this.selected_status = min_status_summary;
    // //       this.getRequestByStatus(min_status_summary);
    // //     }
    // //   } else {
    // //     const status_id = this.statuses.filter(x => x.summary > 0).map(x => x.summary);
    // //     const min = Math.min(...status_id);
    // //     const min_status_summary = this.statuses.find(x => x.summary === min);
    // //     this.selected_status = min_status_summary;
    // //     // this.statuses.forEach(status => {
    // //     //   status.summary = this.designRequests.filter(x => x.idDesignRequestStatus === status.idDesignRequestStatus).length;
    // //     // });
    // //     // this.designRequests.map(x => x.show_trim = true);

    // //     // this.resetTable()

    // //     // setTimeout(() => {

    // //     // }, 600);

    // //     // loading.dismiss();
    // //     this.getRequestByStatus(min_status_summary);
    // //   }
    // // })
    // //   .catch(err => {
    // //     console.error(err);
    // //     // loading.dismiss();
    // //     this.designRequestService.api.showToast('Error getting the requests', ToastType.error);
    // //   }).then(() => {
    // //     // // this.dtTrigger.next();
    // //   });
  }
  async getRequestByStatus(status: DesignRequestStatusModel) {
    // // this.is_loading = true;
    // // let query_params = {
    // //   category: this.parent_id,
    // //   status: status.idDesignRequestStatus
    // // }
    // // if (status.idDesignRequestStatus == 0) {
    // //   query_params.status = undefined
    // // }
    // // this.router.navigate(
    // //   [],
    // //   {
    // //     relativeTo: this.activated_route,
    // //     queryParams: query_params,
    // //     queryParamsHandling: 'merge'
    // //   });
    // // let promise: Promise<any>;
    // // if (this.show_as_user) {
    // //   let payload = {
    // //     idDesignRequestStatus: status.idDesignRequestStatus,
    // //     idDesignRequestParentStatus: this.parent_id,
    // //     idIglesia: this.currentUser.idIglesia
    // //   }
    // //   promise = this.designRequestService.getDesignRequestsByIdIglesiaForUsers(payload).toPromise();
    // // } else {
    // //   let payload = {
    // //     idDesignRequestStatus: status.idDesignRequestStatus,
    // //     idDesignRequestParentStatus: this.parent_id
    // //   }
    // //   promise = this.designRequestService.getDesignRequests(payload).toPromise();
    // // }
    // // const response = await promise
    // //   .catch(err => {
    // //     console.error(err);
    // //     // loading.dismiss();
    // //     this.designRequestService.api.showToast('Error getting the requests', ToastType.error);
    // //     return;
    // //   });
    // // if (response.msg.Code === 200) {
    // //   this.designRequests = response.requests;
    // //   this.designRequests_original = response.requests;
    // // } else {
    // //   this.designRequests = [];
    // //   this.designRequests_original = [];
    // // }
    // // this.is_loading = false;
  }

  initDesignRequest(design_request_form: DesignRequestFormComponent) {
    // // if (!design_request_form.isEdit) {
    // //   design_request_form.designRequest = new DesignRequestModel();
    // //   design_request_form.ngOnInit();
    // // }
  }

  async getStatuses() {
    // // return this.designRequestService.getStatus({parent_id: this.parent_id}).toPromise()
  }

  onModalDidDismiss(response?: any) {
    // // this.modal.getModal('design_request_form_modal_3').close();
    // // if (response) {
    // //   this.resetTable();
    // //   this.load();
    // // }
  }

  resetTable() {
    // // if (this.dtElement.dtInstance) {
    // //   this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
    // //     dtInstance.destroy();
    // //   });
    // // }
  }

  addDesignRequest(design_request_form: DesignRequestFormComponent) {
    // // this.modal.getModal('design_request_form_modal_3').open();
    // // design_request_form.designRequest = new DesignRequestModel();
    // // design_request_form.isEdit = false;
    // // design_request_form.ngOnInit();
  }

  openEditModal(item: DesignRequestModel, design_request_form: DesignRequestFormComponent) {
    // // design_request_form.isEdit = true;
    // // design_request_form.ngOnInit();
    // // if (item.deadline) {
    // //   item.deadline = item.deadline.toString().substring(0, 10);
    // // } else {
    // //   item.deadline = '';
    // // }
    // // design_request_form.designRequest = Object.assign({}, item);
    // // this.modal.getModal('design_request_form_modal_3').open();
  }

  deleteRequest(item: DesignRequestModel) {
    // // const confirmation = confirm(`Are you sure you want to delete this item?`);
    // // if (confirmation) {
    // //   item.status = false;
    // //   this.designRequestService.deleteDesignRequest(item)
    // //     .subscribe(response => {
    // //       this.resetTable();
    // //       this.load();
    // //       this.designRequestService.api.showToast(`Record deleted successfully.`, ToastType.success);
    // //     }, err => {
    // //       this.designRequestService.api.showToast('Error deleting record.', ToastType.error);
    // //     });
    // // }
  }

  getSamsonDesignRequests() {
    // // if (this.samsonMode) {
    // //   this.samsonMode = !this.samsonMode
    // //   return this.load()
    // // }

    // // this.samsonMode = !this.samsonMode

    // // const samsonId: any = 2155
    // // const filtered: any[] = this.designRequests.filter(dr => dr.idIglesia == samsonId)
    // // this.designRequests = filtered
    // // this.resetTable()
    // // setTimeout(() => {
    // //   this.dtTrigger.next()
    // // }, 300);
  }

  showTrim(description: string, item: DesignRequestModel) {
    // // if (item.show_trim) {
    // //   return `${description.substring(0, 60)}...`;
    // // } else {
    // //   return description;
    // // }
  }

  async filterByStatus(item: DesignRequestStatusModel) {
    // // if (!this.selected_status) {
    // //   this.restartTable();
    // //   await this.getRequestByStatus(item);
    // //   this.selected_status = item;
    // //   this.dtTrigger.next();
    // // } else {
    // //   if (this.selected_status.idDesignRequestStatus !== item.idDesignRequestStatus) {
    // //     this.restartTable();
    // //     await this.getRequestByStatus(item);
    // //     this.selected_status = item;
    // //     this.dtTrigger.next();
    // //   }
    // // }
  }

  restartTable(): void {
    // // if (this.dtElement.dtInstance) {
    // //   this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
    // //     dtInstance.destroy();
    // //   });
    // // }
  }

  async getStatusByParent(idParent) {
    // // this.is_loading = true;
    // // this.parent_id = idParent;
    // // const response: any = await this.getStatuses();
    // // if (response.msg.Code === 200) {
    // //   this.statuses = response.statuses;
    // // } else {
    // //   this.statuses = [];
    // // }
    // // const new_status = new DesignRequestStatusModel();
    // // new_status.name = 'All';
    // // new_status.summary = this.statuses.filter(x => x.summary).map(x => x.summary).reduce((partialSum, a) => partialSum + a, 0);
    // // new_status.idDesignRequestParentStatus = this.parent_id;
    // // this.statuses.unshift(new_status)
    // // const status_id = this.statuses.filter(x => x.summary > 0).map(x => x.summary);
    // // const min = Math.min(...status_id);
    // // const min_status_summary = this.statuses.find(x => x.summary === min);
    // // this.selected_status = min_status_summary;
    // // this.restartTable();
    // // this.router.navigate(
    // //   [],
    // //   {
    // //     relativeTo: this.activated_route,
    // //     queryParams: { category: idParent },
    // //     queryParamsHandling: 'merge'
    // //   });
    // // await this.getRequestByStatus(min_status_summary);
    // // this.dtTrigger.next();
  }

  copyUrl(item) {
    // // const parsedUrl = new URL(window.location.href);
    // // const baseUrl = parsedUrl.origin;

    // // let full_url = this.router.url;
    // // let params: string = '';
    // // if (full_url.includes('?')) {
    // //   params = full_url.substring(full_url.indexOf('?'));
    // //   full_url = full_url.substring(0, full_url.indexOf('?'))
    // // }
    // // const url_to_copy = `${baseUrl}${full_url}/detail/${item.idDesignRequest}${params}`;
    // // let anyNavigator: any;
    // // anyNavigator = window.navigator;
    // // anyNavigator['clipboard'].writeText(url_to_copy);
    // // anyNavigator['clipboard'].writeText(url_to_copy);
    // // /* Alert the copied text */
    // // this.designRequestService.api.showToast(`Link copied to clipboard.`, ToastType.info);
  }

}
