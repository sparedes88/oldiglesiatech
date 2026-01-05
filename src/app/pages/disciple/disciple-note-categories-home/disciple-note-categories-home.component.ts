import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { Subject } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';
import { GroupCategoryModel } from 'src/app/models/GroupModel';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { DiscipleNoteCategoryFormComponent } from '../disciple-note-category-form/disciple-note-category-form.component';

@Component({
  selector: 'app-disciple-note-categories-home',
  templateUrl: './disciple-note-categories-home.component.html',
  styleUrls: ['./disciple-note-categories-home.component.scss']
})
export class DiscipleNoteCategoriesHomeComponent implements OnInit {

  currentUser: User; // Interfaces

  // Use in datatable
  public group_categories: any = [];
  public selectedCategory: any
  public fotoEstado: string;

  constructor(
    private api: ApiService,
    private userService: UserService,
    public modal: NgxSmartModalService,
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
    this.api.get('disciples/categories', { idIglesia }).subscribe(
      (response: any) => {
        this.restartTable()
        console.log(response);

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

  addCategory(form_add_modal: NgxSmartModalComponent, group_category_add_form: DiscipleNoteCategoryFormComponent) {
    form_add_modal.open();
    group_category_add_form.setCategory(new GroupCategoryModel());
    group_category_add_form.ngOnInit();
  }

  openEditModal(category: any) {
    this.selectedCategory = category
    this.modal.getModal('editModal').open()
  }

  deleteCategory(id) {
    if (confirm(`Delete this category?`)) {
      const group_category = new GroupCategoryModel();
      group_category.deleted_by = this.currentUser.idUsuario;
      group_category.id = id;
      this.api.delete(`disciples/categories/${id}?idIglesia=${this.currentUser.idIglesia}&deleted_by=${this.currentUser.idUsuario}`)
        .subscribe(data => {
          this.getGroupCategories(this.currentUser.idIglesia);
          this.api.showToast(`Category deleted successfully.`, ToastType.success);
        }, error => {
          this.api.showToast(`Error deleting category.`, ToastType.error);
        })
    }
  }

  updateCategory(contact_category, form_add_modal: NgxSmartModalComponent, category_form: DiscipleNoteCategoryFormComponent) {
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
