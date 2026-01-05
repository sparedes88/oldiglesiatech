import { ToastType } from '../../../login/ToastTypes';
import { DenominationFormComponent } from '../denomination-form/denomination-form.component';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { Router } from '@angular/router';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { UserService } from '../../../services/user.service';
import { ApiService } from '../../../services/api.service';
import { User } from '../../../interfaces/user';
import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-denominations-home',
  templateUrl: './denominations-home.component.html',
  styleUrls: ['./denominations-home.component.scss']
})
export class DenominationHomeComponent implements OnInit {

  currentUser: User; // Interfaces
  iglesias: any[] = [];

  // Use in datatable
  public totalContact: number;
  public denominations: any = [];
  public selectedContact: any;
  show_form: boolean = false;

  constructor(
    private api: ApiService,
    private userService: UserService,
    public modal: NgxSmartModalService,
    private router: Router
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  // Datatables
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

  // TODO future add this method in contact service

  // Method for make request to api
  getDenominations() {
    this.api.get(`denominations`, {})
      .subscribe(
        (response: any) => {
          this.restartTable();
          // this.contacts = contacts.usuarios.filter(u => u.estatus === true);
          this.denominations = response;

        }, err => console.error(err),
        () => {
          this.dtTrigger.next();
        });
  }

  ngOnDestroy() {
    // Use in Datatable
    this.dtTrigger.unsubscribe();
  }

  // load data the pages
  ngOnInit() {
    // Obtain the idIglesia from currentUser of user.service
    // this.getIglesias().then(response => {
    //   this.getContacts(this.currentUser.idIglesia);
    // });
    this.getDenominations();
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
  }


  editDenomination(organization_denomination_form: DenominationFormComponent, denomination) {
    organization_denomination_form.denomination = denomination;
    organization_denomination_form.ngOnInit();
    this.show_form = true;
  }

  deleteDenomination(id) {
    if (confirm(`Delete this Denomination?`)) {
      this.api.delete(`denominations/${id}`,
        {
          id,
          deleted_by: this.currentUser.idUsuario
        })
        .subscribe((data) => {
          this.api.showToast(`Denomination deleted successfully.`, ToastType.success);
          this.getDenominations();
        });
    }
  }

  onModalEditDidDismiss(formAddModal: NgxSmartModalComponent, response) {
    formAddModal.close();
    if (response) {
      this.getDenominations();
      this.router.navigate([`contact/details/${response.idUsuario}`]);
    }
  }

  addDenomination(organization_caregory_form: DenominationFormComponent) {
    this.show_form = true;
    organization_caregory_form.denomination = undefined;
    organization_caregory_form.ngOnInit();
  }

  dismissDenominationForm(response) {
    if (response) {
      this.ngOnInit();
    }
    this.show_form = false
  }

}
