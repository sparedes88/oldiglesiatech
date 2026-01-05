import { ServiceTypeFormComponent } from './../service-type-form/service-type-form.component';
import { UserService } from 'src/app/services/user.service';
import { ApiService } from 'src/app/services/api.service';
import { User } from 'src/app/interfaces/user';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ToastType } from 'src/app/login/ToastTypes';
import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-service-types-home',
  templateUrl: './service-types-home.component.html',
  styleUrls: ['./service-types-home.component.scss']
})
export class ServiceTypesHomeComponent implements OnInit {

  currentUser: User; // Interfaces

  // Use in datatable
  public service_types: any = [];
  public selectedServiceType: any
  public fotoEstado: string;

  constructor(
    private api: ApiService,
    private userService: UserService,
    public modal: NgxSmartModalService
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
  getServiceTypes(idIglesia: number) {
    this.api.get(
      `service-types/getServiceTypes`,
      {
        idIglesia
      }
    ).subscribe((data: any) => {
      this.restartTable()
      this.service_types = data.service_types;
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
    this.getServiceTypes(this.currentUser.idIglesia);
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      })
    }
  }

  addServiceType(form_add_modal: NgxSmartModalComponent, service_type_add_form: ServiceTypeFormComponent) {
    form_add_modal.open();
    service_type_add_form.ngOnInit();
  }

  openEditModal(service_type: any) {
    this.selectedServiceType = service_type
    this.modal.getModal('editModal').open()
  }

  deleteServiceType(idTipoServicio) {
    if (confirm(`Delete this service type? You will not be able to use it anymore, but the organizations and summary info will still.`)) {
      this.api.delete(`service-types/${idTipoServicio}`, { idTipoServicio })
        .subscribe(data => {
          this.getServiceTypes(this.currentUser.idIglesia);
          this.api.showToast(`Service type deleted successfully.`, ToastType.success);
        }, error => {
          this.api.showToast(`Error deleting service type.`, ToastType.error);
        })
    }
  }

  updateServiceType(service_type, form_add_modal: NgxSmartModalComponent, service_type_form: ServiceTypeFormComponent) {
    service_type_form.ngOnInit();
    service_type_form.setServiceType(service_type);
    form_add_modal.open();
  }

  onModalAddDidDismiss(form_add_modal: NgxSmartModalComponent, response) {
    form_add_modal.close();
    if (response) {
      this.getServiceTypes(this.currentUser.idIglesia);
    }
  }
  onModalEditDidDismiss(form_edit_modal: NgxSmartModalComponent, response) {
    form_edit_modal.close();
    if (response) {
      this.getServiceTypes(this.currentUser.idIglesia);
    }
  }

}
