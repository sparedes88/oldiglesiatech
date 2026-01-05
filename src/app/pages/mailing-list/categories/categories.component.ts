import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { DataTableDirective } from 'angular-datatables';
import { MailingListContactCategoryFormComponent } from '../contact-category-form/contact-category-form.component';
import { ToastType } from 'src/app/login/ToastTypes';
import { MailingListContactCategoryModel } from 'src/app/models/MailingListContactCategoryModel';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  currentUser: User; // Interfaces

  // Use in datatable
  public contact_categories: any = [];
  public selectedCategory: any
  public fotoEstado: string;
  mailingListId: number;
  back_url: string;

  constructor(
    private api: ApiService,
    private userService: UserService,
    public modal: NgxSmartModalService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.currentUser = this.userService.getCurrentUser();
    this.mailingListId = this.route.snapshot.params["id"];
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
  getContactCategories(idIglesia: number) {
    this.api.get(`mailingList/${this.mailingListId}/categories`, {
      idIglesia: this.currentUser.idIglesia,
    })
      .subscribe(
        (response: any) => {
          this.restartTable()
          this.contact_categories = response.categories;
        },
        err => console.error(err),
        () => this.dtTrigger.next()
      );
  }

  ngOnDestroy() {
    // Use in Datatable
    this.dtTrigger.unsubscribe();
  }

  // load data the pages
  ngOnInit() {
    console.log(this.route);
    console.log(this.router);
    const segments = this.router.url.split('/');
    this.back_url = segments.slice(0, segments.length - 1).join('/');
    console.log(this.back_url);
    // Obtain the idIglesia from currentUser of user.service
    this.getContactCategories(this.currentUser.idIglesia);
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      })
    }
  }

  addCategory(form_add_modal: NgxSmartModalComponent, contact_category_add_form: MailingListContactCategoryFormComponent) {
    form_add_modal.open();
    contact_category_add_form.ngOnInit();
  }

  openEditModal(category: any) {
    this.selectedCategory = category
    this.modal.getModal('editModal').open()
  }

  deleteCategory(idMailingListContactStatus) {
    if (confirm(`Delete this category?`)) {
      const contact_category = new MailingListContactCategoryModel();
      contact_category.deleted_by = this.currentUser.idUsuario;
      contact_category.idMailingListContactStatus = idMailingListContactStatus;
      this.api.delete(`mailingList/${this.mailingListId}/categories/${idMailingListContactStatus}?deleted_by=${contact_category.deleted_by}`)
        .subscribe(data => {
          this.getContactCategories(this.currentUser.idIglesia);
          this.api.showToast(`Category deleted successfully.`, ToastType.success);
        }, error => {
          this.api.showToast(`Error deleting category.`, ToastType.error);
        })
    }
  }

  updateCategory(contact_category, form_add_modal: NgxSmartModalComponent, category_form: MailingListContactCategoryFormComponent) {
    category_form.ngOnInit();
    category_form.setCategory(contact_category);
    form_add_modal.open();
  }

  onModalAddDidDismiss(form_add_modal: NgxSmartModalComponent, response) {
    form_add_modal.close();
    if (response) {
      this.getContactCategories(this.currentUser.idIglesia);
    }
  }
  onModalEditDidDismiss(form_edit_modal: NgxSmartModalComponent, response) {
    form_edit_modal.close();
    if (response) {
      this.getContactCategories(this.currentUser.idIglesia);
    }
  }

}
