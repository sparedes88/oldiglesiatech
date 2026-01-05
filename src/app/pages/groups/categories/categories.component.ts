import { Subject } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { DataTableDirective } from 'angular-datatables';
import { GroupCategoryFormComponent } from '../group-category-form/group-category-form.component';
import { ToastType } from 'src/app/login/ToastTypes';
import { GroupsService } from 'src/app/services/groups.service';
import { GroupCategoryModel } from 'src/app/models/GroupModel';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  currentUser: User; // Interfaces

  // Use in datatable
  public group_categories: any = [];
  public selectedCategory: any
  public fotoEstado: string;

  constructor(
    private api: ApiService,
    private userService: UserService,
    public modal: NgxSmartModalService,
    private groupService: GroupsService
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
  getGroupCategories(idIglesia: number) {
    this.groupService.getGroupsCategories(idIglesia).subscribe(
      (response: any) => {
        this.restartTable()
        this.group_categories = response.categories;
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
    this.getGroupCategories(this.currentUser.idIglesia);
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      })
    }
  }

  addCategory(form_add_modal: NgxSmartModalComponent, group_category_add_form: GroupCategoryFormComponent) {
    form_add_modal.open();
    group_category_add_form.ngOnInit();
  }

  openEditModal(category: any) {
    this.selectedCategory = category
    this.modal.getModal('editModal').open()
  }

  deleteCategory(idGroupCategory) {
    if (confirm(`Delete this category?`)) {
      const group_category = new GroupCategoryModel();
      group_category.deleted_by = this.currentUser.idUsuario;
      group_category.idGroupCategory = idGroupCategory;
      this.groupService.deleteroupCategory(group_category)
        .subscribe(data => {
          this.getGroupCategories(this.currentUser.idIglesia);
          this.api.showToast(`Category deleted successfully.`, ToastType.success);
        }, error => {
          this.api.showToast(`Error deleting category.`, ToastType.error);
        })
    }
  }

  updateCategory(contact_category, form_add_modal: NgxSmartModalComponent, category_form: GroupCategoryFormComponent) {
    category_form.ngOnInit();
    category_form.setCategory(contact_category);
    form_add_modal.open();
  }

  onModalAddDidDismiss(form_add_modal: NgxSmartModalComponent, response) {
    form_add_modal.close();
    if (response) {
      this.getGroupCategories(this.currentUser.idIglesia);
    }
  }
  onModalEditDidDismiss(form_edit_modal: NgxSmartModalComponent, response) {
    form_edit_modal.close();
    if (response) {
      this.getGroupCategories(this.currentUser.idIglesia);
    }
  }

}
