import { ArticleCategoryFormComponent } from './../article-category-form/article-category-form.component';
import { UserService } from 'src/app/services/user.service';
import { ApiService } from 'src/app/services/api.service';
import { User } from 'src/app/interfaces/user';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { ToastType } from 'src/app/login/ToastTypes';
import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SortTypesOld } from 'src/app/models/Utility';

@Component({
  selector: 'app-article-categories-home',
  templateUrl: './article-categories-home.component.html',
  styleUrls: ['./article-categories-home.component.scss']
})
export class ArticleCategoriesHomeComponent implements OnInit {

  currentUser: User; // Interfaces

  @Input('display_as_modal') display_as_modal: boolean = false;
  @Input('idOrganization') idOrganization: number;
  @Output('make_refresh') make_refresh: EventEmitter<any> = new EventEmitter<any>();

  // Use in datatable
  public article_categories: any = [];
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
  getArticleCategories(idIglesia: number) {
    this.api.get(
      `articulos/categories/getCategories`,
      {
        idIglesia
      }
    ).subscribe((data: any) => {
      this.restartTable()
      this.article_categories = data.categories;
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
    this.getArticleCategories(this.idOrganization);
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      })
    }
  }

  addCategory(form_add_modal: NgxSmartModalComponent, category_add_form: ArticleCategoryFormComponent) {
    form_add_modal.open();
    category_add_form.ngOnInit();
  }

  openEditModal(article_category: any) {
    this.selectedContact = article_category
    this.modal.getModal('editModal').open()
  }

  deleteCategory(idCategoriaArticulo) {
    if (confirm(`Delete this category?`)) {
      this.api.delete(`articulos/categories/${idCategoriaArticulo}?idIglesia=${this.idOrganization}`, { idCategoriaArticulo })
        .subscribe(data => {
          this.getArticleCategories(this.idOrganization);
          if (this.display_as_modal) {
            this.make_refresh.emit();
          }
          this.api.showToast(`Category deleted successfully.`, ToastType.success);
        }, error => {
          this.api.showToast(`Error deleting category.`, ToastType.error);
        })
    }
  }

  updateCategory(contact_category, form_add_modal: NgxSmartModalComponent, category_form: ArticleCategoryFormComponent) {
    category_form.ngOnInit();
    category_form.setCategory(contact_category);
    form_add_modal.open();
  }

  onModalAddDidDismiss(form_add_modal: NgxSmartModalComponent, response) {
    form_add_modal.close();
    if (response) {
      this.getArticleCategories(this.idOrganization);
      if (this.display_as_modal) {
        this.make_refresh.emit();
      }
    }
  }
  onModalEditDidDismiss(form_edit_modal: NgxSmartModalComponent, response) {
    form_edit_modal.close();
    if (response) {
      this.getArticleCategories(this.idOrganization);
      if (this.display_as_modal) {
        this.make_refresh.emit();
      }
    }
  }

  getName(sort_type: 'date_asc' | 'date_desc' | 'alpha_asc' | 'alpha_desc') {
    return SortTypesOld[sort_type];
  }
}
