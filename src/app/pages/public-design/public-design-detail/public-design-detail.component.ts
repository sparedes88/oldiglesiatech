import { UserService } from './../../../services/user.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastType } from 'src/app/login/ToastTypes';

import { DesignRequestImageModel, DesignRequestModel, DesignRequestNoteModel } from './../../../models/DesignRequestModel';
import { DesignRequestService } from './../../../services/design-request.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { environment } from '../../../../environments/environment';
import { PublicDesignNoteDetailComponent } from '../public-design-note-detail/public-design-note-detail.component';
import { PublicDesignFormComponent } from '../public-design-form/public-design-form.component';
import { PublicDesignNoteFormComponent } from '../public-design-note-form/public-design-note-form.component';

@Component({
  selector: 'app-public-design-detail',
  templateUrl: './public-design-detail.component.html',
  styleUrls: ['./public-design-detail.component.scss']
})
export class PublicDesignDetailComponent implements OnInit {

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

  designRequest: DesignRequestModel = new DesignRequestModel();
  show_detail = false;
  currentUser: any;
  serverUrl: string = environment.apiUrl;
  logo: string = '';

  show_as_user: boolean = false;

  constructor(
    private designRequestService: DesignRequestService,
    private router: Router,
    private route: ActivatedRoute,
    private modal: NgxSmartModalService,
    private userService: UserService
  ) {
    this.designRequest.idDesignRequest = this.route.snapshot.params.id;
    this.currentUser = this.userService.getCurrentUser();
    if (this.router.url.includes(`list`)) {
      this.show_as_user = true;
      if (this.currentUser.idUserType === 1) {
        if (this.currentUser.idIglesia !== Number(this.route.snapshot.params.idIglesia)) {
          this.router.navigate([`/design-request/${this.currentUser.idIglesia}/list/detail/${this.designRequest.idDesignRequest}`]);
        }
      } else {
        if(!this.currentUser.isSuperUser){
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
    if (this.show_as_user) {
      this.router.navigate([`/design-request/${this.currentUser.idIglesia}/list`]);
    } else {
      if (this.route.snapshot.queryParams.origin) {
        if (this.route.snapshot.queryParams.origin === 'planning') {
          this.router.navigate([`/admin/design-request/planning`]);
        } else if (this.route.snapshot.queryParams.origin === 'timesheet') {
          this.router.navigate([`/admin/timesheet`]);
        } else {
          this.router.navigate([`/admin/design-request`]);
        }
      } else {
        this.router.navigate([`/admin/design-request`]);
      }
    }
  }

  addNote(testing_note_form_4: PublicDesignNoteFormComponent) {
    this.modal.getModal('testing_formModal_1').open();
    testing_note_form_4.designRequestNote = new DesignRequestNoteModel();
    testing_note_form_4.designRequestNote.idDesignRequest = this.designRequest.idDesignRequest;
    testing_note_form_4.designRequestNote.createdBy = this.currentUser.idUsuario;
    testing_note_form_4.iglesia = {
      idIglesia: this.designRequest.idIglesia,
      topic: this.designRequest.topic
    };
    testing_note_form_4.ngOnInit();
  }

  updateNote(item: DesignRequestNoteModel, testing_note_form_5: PublicDesignNoteFormComponent) {
    this.modal.getModal('testing_formModal_1').open();
    testing_note_form_5.designRequestNote = Object.assign({}, item);
    testing_note_form_5.designRequestNote.createdBy = this.currentUser.idUsuario;
    testing_note_form_5.iglesia = {
      idIglesia: this.designRequest.idIglesia,
      topic: this.designRequest.topic
    };
    testing_note_form_5.ngOnInit();
  }

  viewNote(item: DesignRequestNoteModel, testing_note_detail_5: PublicDesignNoteDetailComponent) {
    this.modal.getModal('testing_note_detail_5_modal').open();
    testing_note_detail_5.design_request_note = Object.assign({}, item);
    testing_note_detail_5.ngOnInit();
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
    this.modal.getModal('testing_formModal_1').close();
    if (response) {
      this.resetTable();
      this.loadDetail();
    }
  }

  onModalEditDidDismiss(response) {
    this.modal.getModal('testing_form_edit_modal').close();
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
    const path: string = `${this.serverUrl}/designRequests/getDesignRequestPDF/?idDesignRequest=${
      this.designRequest.idDesignRequest}&logo=${this.logo}`;

    const win = window.open(path, '_blank');
    win.focus();
  }

  openEditModal(item: DesignRequestModel, testing_form_6: PublicDesignFormComponent) {
    testing_form_6.isEdit = true;
    testing_form_6.ngOnInit();
    item.deadline = item.deadline ? item.deadline.toString().substring(0, 10) : null;
    testing_form_6.designRequest = Object.assign({}, item);
    this.modal.getModal('testing_form_edit_modal').open();
  }

  openFileOrImage(image) {
    const win = window.open(image.url, '_blank');
    win.focus();
  }


}
