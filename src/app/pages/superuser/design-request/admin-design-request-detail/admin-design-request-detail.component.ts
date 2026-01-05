import { DesignRequestFormComponent } from '../admin-design-request-form/admin-design-request-form.component';
import { DesignRequestNoteDetailComponent } from '../admin-design-request-note-detail/admin-design-request-note-detail.component';
import { UserService } from '../../../../services/user.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastType } from 'src/app/login/ToastTypes';

import { DesignRequestImageModel, DesignRequestModel, DesignRequestNoteModel } from '../../../../models/DesignRequestModel';
import { DesignRequestService } from '../../../../services/design-request.service';
import { DesignRequestNoteFormComponent } from '../admin-design-request-note-form/admin-design-request-note-form.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-design-request-detail',
  templateUrl: './admin-design-request-detail.component.html',
  styleUrls: ['./admin-design-request-detail.component.scss']
})
export class AdminDesignRequestDetailComponent implements OnInit {

  @ViewChild(DataTableDirective) dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: 'Blfrtip',
    lengthMenu: [10, 25, 50, 100, 250, 500],
    buttons: [
      { extend: 'copy', className: 'btn btn-outline-citric btn-sm' },
      { extend: 'print', className: 'btn btn-outline-citric btn-sm' },
      { extend: 'csv', className: 'btn btn-outline-citric btn-sm' },
    ]
  };

  @Input('idDesignRequest') idDesignRequest: number;
  @Input('is_embed') is_embed: boolean;

  @Output('close') close: EventEmitter<any> = new EventEmitter<any>();

  designRequest: DesignRequestModel = new DesignRequestModel();
  show_detail = false;
  currentUser: any;
  serverUrl: string = environment.apiUrl;
  logo: string = '';

  show_as_user: boolean = false;

  constructor(
    private designRequestService: DesignRequestService,
    private router: Router,
    private activated_route: ActivatedRoute,
    private modal: NgxSmartModalService,
    private userService: UserService
  ) {
  }

  loadInfo() {
    this.currentUser = this.userService.getCurrentUser();
    if (this.router.url.includes(`list`)) {
      this.show_as_user = true;
      if (this.currentUser.idUserType === 1) {
        if (this.currentUser.idIglesia !== Number(this.activated_route.snapshot.params.idIglesia)) {
          this.router.navigate([`/design-request/${this.currentUser.idIglesia}/list/detail/${this.designRequest.idDesignRequest}`]);
        }
      } else {
        if (!this.currentUser.isSuperUser) {
          this.designRequestService.api.showToast(`You don't have permission to see this page.`, ToastType.info);
          this.router.navigate([`/user-profile/details/${this.currentUser.idUsuario}`]);
          return;
        }
      }
    }
    this.loadDetail();
  }

  ngOnInit() {
    this.getLogo();
    if (!this.idDesignRequest) {
      this.designRequest.idDesignRequest = this.activated_route.snapshot.params.id;
    } else {
      this.designRequest.idDesignRequest = this.idDesignRequest;
    }
    this.loadInfo();
  }

  loadDetail() {
    this.designRequestService.getDesignRequestDetail(this.designRequest)
      .subscribe((response: any) => {
        if (response.msg.Code === 200) {
          this.designRequest = response.request;
          if (this.show_as_user) {
            if (this.designRequest.idIglesia !== this.currentUser.idIglesia) {
              this.designRequestService.api.showToast('Something went wrong, there is not detail for this request.', ToastType.info);
              setTimeout(() => {
                this.router.navigate([`/design-request/${this.currentUser.idIglesia}/list`]);
              }, 1200);
              return;
            } else if (response.request.isSuperUser && !this.currentUser.isSuperUser) {
              this.designRequestService.api.showToast('Something went wrong, there is not detail for this request.', ToastType.info);
              setTimeout(() => {
                this.router.navigate([`/design-request/${this.currentUser.idIglesia}/list`]);
              }, 1200);
              return;
            }
            if (this.designRequest.notes) {
              if (!this.currentUser.isSuperUser && this.currentUser.idUserType !== 1) {
                this.designRequest.notes = this.designRequest.notes.filter(x => !x.is_private);
              }
            }

          }

          this.show_detail = true;
        } else {
          this.designRequestService.api.showToast('Something went wrong, there is not detail for this request.', ToastType.info);
          setTimeout(() => {
            if (this.show_as_user) {
              this.router.navigate([`/design-request/${this.currentUser.idIglesia}/list`]);
            } else {
              this.router.navigate([`admin/design-request`]);
            }
          }, 1200);
        }
      }, err => {
        console.error(err);
        this.designRequestService.api.showToast('Error getting the details... Try again in a few seconds', ToastType.error);
        setTimeout(() => {
          if (this.show_as_user) {
            this.router.navigate([`/design-request/${this.currentUser.idIglesia}/list`]);
          } else {
            this.router.navigate([`admin/design-request`]);
          }
        }, 1200);
      }, () => {
        setTimeout(() => {
          this.dtTrigger.next();
          Array.prototype.forEach.call(document.getElementsByClassName('content-container'), element => {
            Array.prototype.forEach.call(element.getElementsByTagName('img'), img => {
              img.style = 'max-width: 100%';
            });
          });
        });
      });
  }

  fixUrl(image: DesignRequestImageModel) {
    if (image.type === 'image') {
      return image.url;
    } else if (image.type === 'file') {
      return '/assets/img/file-image.png';
    } else {
      return 'assets/img/default-image.jpg';
    }
  }

  goBack() {
    if (this.is_embed) {
      this.close.emit();
    } else {
      const query_params = this.activated_route.snapshot.queryParams;
      if (this.show_as_user) {
        this.router.navigate([`/design-request/${this.currentUser.idIglesia}/list`]);
      } else {
        if (this.activated_route.snapshot.queryParams.origin) {
          if (this.activated_route.snapshot.queryParams.origin === 'planning') {
            this.router.navigate([`/admin/design-request/planning`]);
          } else if (this.activated_route.snapshot.queryParams.origin === 'timesheet') {
            this.router.navigate([`/admin/timesheet`]);
          } else {
            this.router.navigate([`/admin/design-request`], {
              queryParams: query_params
            });
          }
        } else {
          this.router.navigate([`/admin/design-request`], {
            queryParams: query_params
          });
        }
      }
    }
  }

  addNote(design_request_note_form: DesignRequestNoteFormComponent) {
    this.modal.getModal('design_request_formModal_1').open();
    design_request_note_form.designRequestNote = new DesignRequestNoteModel();
    design_request_note_form.designRequestNote.idDesignRequest = this.designRequest.idDesignRequest;
    design_request_note_form.designRequestNote.createdBy = this.currentUser.idUsuario;
    design_request_note_form.iglesia = {
      idIglesia: this.designRequest.idIglesia,
      topic: this.designRequest.topic
    };
    design_request_note_form.ngOnInit();
  }

  updateNote(item: DesignRequestNoteModel, design_request_note_form: DesignRequestNoteFormComponent) {
    this.modal.getModal('design_request_formModal_1').open();
    design_request_note_form.designRequestNote = Object.assign({}, item);
    design_request_note_form.designRequestNote.createdBy = this.currentUser.idUsuario;
    design_request_note_form.iglesia = {
      idIglesia: this.designRequest.idIglesia,
      topic: this.designRequest.topic
    };
    design_request_note_form.ngOnInit();
  }

  viewNote(item: DesignRequestNoteModel, design_request_note_detail: DesignRequestNoteDetailComponent) {
    this.modal.getModal('design_request_form_detail_modal').open();
    design_request_note_detail.design_request_note = Object.assign({}, item);
    design_request_note_detail.ngOnInit();
  }

  deleteNote(item: DesignRequestNoteModel) {
    const confirmation = confirm(`Are you sure to delete this note?`);
    if (confirmation) {
      item.status = false;
      item.deletedBy = this.currentUser.idUsuario;
      this.designRequestService.deleteDesignRequestNote(item)
        .subscribe(response => {
          this.resetTable();
          this.loadDetail();
          this.designRequestService.api.showToast(`Record deleted successfully.`, ToastType.success);
        }, err => {
          this.designRequestService.api.showToast('Error deleting record.', ToastType.error);
        });
    }
  }

  onModalDidDismiss(response) {
    this.modal.getModal('design_request_formModal_1').close();
    if (response) {
      this.resetTable();
      this.loadDetail();
    }
  }

  onModalEditDidDismiss(response) {
    this.modal.getModal('design_request_form_edit_modal').close();
    if (response) {
      this.resetTable();
      this.loadDetail();
    }
  }

  resetTable() {
    if (this.designRequest.timesheets.length > 0) {
      if (this.dtElement.dtInstance) {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      }
    }
  }

  addClass(content: string) {
    return `<div class="content-container">${content}</div>`;
  }

  getLogo() {
    this.designRequestService.getDesignRequestDropdown()
      .subscribe(
        (data: any) => {
          if (data.iglesias) {
            const organization = data.iglesias.find(ig => ig.idIglesia === this.currentUser.idIglesia);
            if (organization && organization.Logo) {
              this.logo = organization.Logo.split('https://iglesia-tech-api.e2api.com').pop();
            }
          }
        },
        err => console.error(err)
      );
  }

  print() {
    const path: string = `${this.serverUrl}/designRequests/getDesignRequestPDF/?idDesignRequest=${this.designRequest.idDesignRequest}&logo=${this.logo}`;

    const win = window.open(path, '_blank');
    win.focus();
  }

  openEditModal(item: DesignRequestModel, design_request_form: DesignRequestFormComponent) {
    design_request_form.isEdit = true;
    design_request_form.ngOnInit();
    item.deadline = item.deadline ? item.deadline.toString().substring(0, 10) : null;
    design_request_form.designRequest = Object.assign({}, item);
    this.modal.getModal('design_request_form_edit_modal').open();
  }

  openFileOrImage(image) {
    const win = window.open(image.url, '_blank');
    win.focus();
  }

  fixName(iglesia: string) {
    const clean_spaces = iglesia
      .replace(/\s/g, '')
      .replace(/ñ/g, 'n')
      .replace(/Á/g, 'A')
      .replace(/É/g, 'E')
      .replace(/Í/g, 'I')
      .replace(/Ó/g, 'O')
      .replace(/Ú/g, 'U')
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/í/g, 'i')
      .replace(/ó/g, 'o')
      .replace(/ú/g, 'u');
    return clean_spaces;
  }

  copyLink() {
    let url_to_copy = window.location.href;
    if (this.router.url.includes(`planning`)) {
      const parsedUrl = new URL(window.location.href);
      const baseUrl = parsedUrl.origin;
      url_to_copy = `${baseUrl}${this.router.url.replace('/planning', '')}/detail/${this.designRequest.idDesignRequest}`;
    }
    let anyNavigator: any;
    anyNavigator = window.navigator;
    anyNavigator['clipboard'].writeText(url_to_copy);
    anyNavigator['clipboard'].writeText(url_to_copy);
    /* Alert the copied text */
    this.designRequestService.api.showToast(`Link copied to clipboard.`, ToastType.info);
  }

}
