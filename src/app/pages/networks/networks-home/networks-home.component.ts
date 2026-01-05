import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { User } from './../../../interfaces/user';
import { EventEmitter, Output, ViewChild } from '@angular/core';
import { UserService } from './../../../services/user.service';
import { ApiService } from './../../../services/api.service';
import { ToastType } from './../../../login/ToastTypes';
import { NetworksFormComponent } from './../networks-form/networks-form.component';
import { Component, Input, OnInit } from '@angular/core';
import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { NetworkModel } from '../NetworkModel';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-networks-home',
  templateUrl: './networks-home.component.html',
  styleUrls: ['./networks-home.component.scss']
})
export class NetworksHomeComponent implements OnInit {

  currentUser: User; // Interfaces

  @Input('idOrganization') idOrganization: number;
  @Input('display_as_modal') display_as_modal: boolean = false;
  @Output('make_refresh') make_refresh: EventEmitter<any> = new EventEmitter<any>();

  // Use in datatable
  public networks: NetworkModel[] = [];
  public selectedContact: any
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
  getNetworks(idIglesia: number) {
    this.api.get(
      `networks`,
      {
        idIglesia
      }
    ).subscribe((data: any) => {
      this.restartTable()
      if (this.currentUser) {
        if (this.currentUser.isSuperUser) {
          this.networks = data.networks;
        } else {
          this.networks = data.networks.filter(x => x.idOrganization && x.idOrganization === this.idOrganization);
        }
      } else {
        this.networks = data.networks.filter(x => x.idOrganization && x.idOrganization === this.idOrganization);
      }

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
    this.getNetworks(this.idOrganization);
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      })
    }
  }

  addNetwork(form_add_modal: NgxSmartModalComponent, network_add_form: NetworksFormComponent) {
    form_add_modal.open();
    network_add_form.ngOnInit();
  }

  openEditModal(network: NetworkModel) {
    this.selectedContact = network
    this.modal.getModal('editModal').open()
  }

  deleteNetwork(idNetwork) {
    if (confirm(`Delete this network?`)) {
      let params = `?idIglesia=${this.idOrganization}`;
      if (this.currentUser) {
        params = `${params}&deleted_by=${this.currentUser.idUsuario}`
      }
      this.api.delete(`networks/${idNetwork}${params}`)
        .subscribe(data => {
          this.getNetworks(this.idOrganization);
          if (this.display_as_modal) {
            this.make_refresh.emit();
          }
          this.api.showToast(`Network deleted successfully.`, ToastType.success);
        }, error => {
          this.api.showToast(`Error deleting network.`, ToastType.error);
        })
    }
  }

  updateNetwork(network, form_add_modal: NgxSmartModalComponent, network_form: NetworksFormComponent) {
    network_form.ngOnInit();
    network_form.setNetwork(network);
    form_add_modal.open();
  }

  onModalAddDidDismiss(form_add_modal: NgxSmartModalComponent, response) {
    form_add_modal.close();
    if (response) {
      this.getNetworks(this.idOrganization);
      if (this.display_as_modal) {
        this.make_refresh.emit();
      }
    }
  }
  onModalEditDidDismiss(form_edit_modal: NgxSmartModalComponent, response) {
    form_edit_modal.close();
    if (response) {
      this.getNetworks(this.idOrganization);
      if (this.display_as_modal) {
        this.make_refresh.emit();
      }
    }
  }

  fixUrl(image: string) {
    if (image) {
      if (image.includes('https://')) {
        return `${image}`;
      }
      return `${environment.serverURL}${image}`;
    }
    // if (this.iglesia_full_data) {
    //   if (this.iglesia_full_data.portadaArticulos) {
    //     const path = this.fixUrl(this.iglesia_full_data.portadaArticulos);
    //     return path;
    //   }
    // }
    return 'assets/img/default-image.jpg';
  }

}
