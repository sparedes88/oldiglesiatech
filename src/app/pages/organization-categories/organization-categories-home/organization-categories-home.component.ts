import { ToastType } from '../../../login/ToastTypes';
import { OrganizationCategoryFormComponent } from '../organization-category-form/organization-category-form.component';
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
  selector: 'app-organization-categories-home',
  templateUrl: './organization-categories-home.component.html',
  styleUrls: ['./organization-categories-home.component.scss']
})
export class OrganizationCategoriesHomeComponent implements OnInit {

  currentUser: User; // Interfaces
  iglesias: any[] = [];

  // Use in datatable
  public totalContact: number;
  public categories: any = [];
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
  getOrganizationCategories() {
    this.api.get(`organization_categories`, {})
      .subscribe(
        (response: any) => {
          this.restartTable();
          // this.contacts = contacts.usuarios.filter(u => u.estatus === true);
          this.categories = response;

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
    this.getOrganizationCategories();
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
  }


  editCategory(organization_category_form: OrganizationCategoryFormComponent, category) {
    organization_category_form.category = category;
    organization_category_form.ngOnInit();
    this.show_form = true;
  }

  deleteCategory(id) {
    if (confirm(`Delete this Category?`)) {
      this.api.delete(`organization_categories/${id}`,
        {
          id,
          deleted_by: this.currentUser.idUsuario
        })
        .subscribe((data) => {
          this.api.showToast(`Category deleted successfully.`, ToastType.success);
          this.getOrganizationCategories();
        });
    }
  }

  onModalEditDidDismiss(formAddModal: NgxSmartModalComponent, response) {
    formAddModal.close();
    if (response) {
      this.getOrganizationCategories();
      this.router.navigate([`contact/details/${response.idUsuario}`]);
    }
  }

  addCategory(organization_caregory_form: OrganizationCategoryFormComponent) {
    this.show_form = true;
    organization_caregory_form.category = undefined;
    organization_caregory_form.ngOnInit();
  }

  dismissCategoryForm(response) {
    if (response) {
      this.ngOnInit();
    }
    this.show_form = false
  }

}
