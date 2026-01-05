import { Subject } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { DataTableDirective } from 'angular-datatables';
import { ContactCategoryFormComponent } from '../contact-category-form/contact-category-form.component';
import { ToastType } from 'src/app/login/ToastTypes';

@Component({
  selector: 'app-contact-category',
  templateUrl: './contact-category.component.html',
  styleUrls: ['./contact-category.component.scss']
})
export class ContactCategoryComponent implements OnInit {

  currentUser: User; // Interfaces

  // Use in datatable
  public member_categories: any = [];
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
  getMemberCategories(idIglesia: number) {
    this.api.get(
      `users/categories/getMembersCategories`,
      {
        idIglesia
      }
    ).subscribe(
      (MemberCategories: any) => {
        this.restartTable()
        this.member_categories = MemberCategories.categoriasMiembros.filter(u => u.estatus);
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
    // Obtain the idIglesia from currentUser of user.service
    this.getMemberCategories(this.currentUser.idIglesia);
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      })
    }
  }

  addCategory(form_add_modal: NgxSmartModalComponent, category_add_form: ContactCategoryFormComponent) {
    form_add_modal.open();
    category_add_form.ngOnInit();
  }

  openEditModal(member: any) {
    this.selectedContact = member
    this.modal.getModal('editModal').open()
  }

  deleteCategory(idCategoriaMiembro) {
    if (confirm(`Delete this category?`)) {
      this.api.post('users/categories/deleteMemberCategory',
        {
          idCategoriaMiembro,
          estatus: false,
          idIglesia: this.currentUser.idIglesia
        })
        .subscribe(data => {
          this.getMemberCategories(this.currentUser.idIglesia);
          this.api.showToast(`Category deleted successfully.`, ToastType.success);
        }, error => {
          this.api.showToast(`Error deleting category.`, ToastType.error);
        })
    }
  }

  updateCategory(contact_category, form_add_modal: NgxSmartModalComponent, category_form: ContactCategoryFormComponent) {
    category_form.ngOnInit();
    category_form.setCategory(contact_category);
    form_add_modal.open();
  }

  onModalAddDidDismiss(form_add_modal: NgxSmartModalComponent, response) {
    form_add_modal.close();
    if (response) {
      this.getMemberCategories(this.currentUser.idIglesia);
    }
  }
  onModalEditDidDismiss(form_edit_modal: NgxSmartModalComponent, response) {
    form_edit_modal.close();
    if (response) {
      this.getMemberCategories(this.currentUser.idIglesia);
    }
  }

}
