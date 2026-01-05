import { FontFormComponent } from '../font-form/font-form.component';
import { UserService } from 'src/app/services/user.service';
import { ApiService } from 'src/app/services/api.service';
import { User } from 'src/app/interfaces/user';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ToastType } from 'src/app/login/ToastTypes';
import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DownloadServiceService } from 'src/app/download-service.service';

@Component({
  selector: 'app-fonts-home',
  templateUrl: './fonts-home.component.html',
  styleUrls: ['./fonts-home.component.scss']
})
export class FontsHomeComponent implements OnInit {

  currentUser: User; // Interfaces

  @Input('display_as_modal') display_as_modal: boolean = false;
  @Input('idOrganization') idOrganization: number;
  @Output('make_refresh') make_refresh: EventEmitter<any> = new EventEmitter<any>();

  // Use in datatable
  public fonts: any = [];


  constructor(
    private api: ApiService,
    private userService: UserService,
    public modal: NgxSmartModalService,
    private download_service: DownloadServiceService
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  // Datatables
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: "Blfrtip",
    lengthMenu: [10, 25, 50, 100, 250, 500],
    buttons: [
      { extend: 'copy', className: 'btn btn-outline-citric btn-sm' },
      { extend: 'print', className: 'btn btn-outline-citric btn-sm' },
      { extend: 'csv', className: 'btn btn-outline-citric btn-sm' },
    ]
  }

  // TODO future add this method in contact service

  // Method for make request to api
  getFonts() {
    this.api.get(
      `configuracionesTabs/fonts`, {}
    ).subscribe((data: any) => {
      this.restartTable()
      this.fonts = data;
    }, err => {
      console.error(err);
    },
      () => this.dtTrigger.next()
    );
  }

  ngOnDestroy() {
    // Use in Datatable
    this.dtTrigger.unsubscribe();
  }

  // load data the pages
  ngOnInit() {
    // Obtain the idIglesia from currentUser of user.service
    if (!this.idOrganization) {
      if (this.currentUser) {
        this.idOrganization = this.currentUser.idIglesia;
      }
    }
    this.getFonts();
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      })
    }
  }

  addFont(form_add_modal: NgxSmartModalComponent, font_add_form: FontFormComponent) {
    form_add_modal.open();
    font_add_form.ngOnInit();
  }

  openFont(font) {
    this.download_service.downloadDocumentFromUrl({ name: font.name, url: font.link })
  }

  deleteFont(id) {
    if (confirm(`Delete this font?`)) {
      this.api.delete(`configuracionesTabs/fonts/${id}?deleted_by=${this.currentUser.idUsuario}`)
        .subscribe(data => {
          this.getFonts();
          if (this.display_as_modal) {
            this.make_refresh.emit();
          }
          this.api.showToast(`Font deleted successfully.`, ToastType.success);
        }, error => {
          this.api.showToast(`Error deleting font.`, ToastType.error);
        })
    }
  }

  updateFont(contact_font, form_add_modal: NgxSmartModalComponent, font_form: FontFormComponent) {
    font_form.ngOnInit();
    font_form.setFont(contact_font);
    form_add_modal.open();
  }

  onModalAddDidDismiss(form_add_modal: NgxSmartModalComponent, response) {
    form_add_modal.close();
    if (response) {
      this.getFonts();
      if (this.display_as_modal) {
        this.make_refresh.emit();
      }
    }
  }
  onModalEditDidDismiss(form_edit_modal: NgxSmartModalComponent, response) {
    form_edit_modal.close();
    if (response) {
      this.getFonts();
      if (this.display_as_modal) {
        this.make_refresh.emit();
      }
    }
  }
}
