import { Subject } from 'rxjs';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { DataTableDirective } from 'angular-datatables';
import { DonationCategoryFormComponent } from '../donation-category-form/donation-category-form.component';
import { ToastType } from 'src/app/login/ToastTypes';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-donation-category',
  templateUrl: './donation-category.component.html',
  styleUrls: ['./donation-category.component.scss']
})
export class DonationCategoryComponent implements OnInit {

  @Input('is_embed') is_embed: boolean;

  @Output('on_close') on_close: EventEmitter<any> = new EventEmitter<any>();

  currentUser: User; // Interfaces

  modal_open: boolean = false;

  // Use in datatable
  public categories: any = [];
  public selectedDonation: any
  public fotoEstado: string;

  params: any;

  constructor(
    private api: ApiService,
    private userService: UserService,
    public modal: NgxSmartModalService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.currentUser = this.userService.getCurrentUser();
    if(JSON.stringify(this.route.snapshot.queryParams) != '{}'){
      this.params = this.route.snapshot.queryParams;
    }
  }

  get back_url(){
    if(this.params){
      if(this.params.origin){
        return `/${this.params.origin}`;
      }
    }
    return '/donations/list';
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

  // TODO future add this method in donation service

  // Method for make request to api
  getCategories(idIglesia: number) {
    this.api.get(
      `donations/categories`,
      {
        idIglesia
      }
    ).subscribe(
      (data: any) => {
        this.restartTable()
        this.categories = data.categories;
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
    this.getCategories(this.currentUser.idIglesia);
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      })
    }
  }

  addCategory(form_add_modal: NgxSmartModalComponent, category_add_form: DonationCategoryFormComponent) {
    this.modal_open = true;
    form_add_modal.open();
    category_add_form.ngOnInit();
  }

  openEditModal(donation: any) {
    this.selectedDonation = donation
    this.modal.getModal('editModal').open()
  }

  deleteCategory(idDonationCategory) {
    if (confirm(`Delete this category?`)) {
      this.api.delete(`donations/categories/${idDonationCategory}`,
        {
          idIglesia: this.currentUser.idIglesia,
          deleted_by: this.currentUser.idUsuario
        })
        .subscribe(data => {
          this.getCategories(this.currentUser.idIglesia);
          this.api.showToast(`Category deleted successfully.`, ToastType.success);
        }, error => {
          this.api.showToast(`Error deleting category.`, ToastType.error);
        })
    }
  }

  updateCategory(donation_category, form_add_modal: NgxSmartModalComponent, category_form: DonationCategoryFormComponent) {
    this.modal_open = true;
    category_form.ngOnInit();
    category_form.setCategory(donation_category);
    form_add_modal.open();
  }

  onModalAddDidDismiss(form_add_modal: NgxSmartModalComponent, response) {
    this.modal_open = false;
    form_add_modal.close();
    if (response) {
      this.getCategories(this.currentUser.idIglesia);
    }
  }
  onModalEditDidDismiss(form_edit_modal: NgxSmartModalComponent, response) {
    this.modal_open = false;
    form_edit_modal.close();
    if (response) {
      this.getCategories(this.currentUser.idIglesia);
    }
  }

  goBack(){
    if(this.is_embed){
      this.on_close.emit();
    } else {
      this.router.navigate([this.back_url])
    }
  }

}
