import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ToastType } from 'src/app/login/ToastTypes';
import { User } from 'src/app/interfaces/user';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { EntryGroupModel } from '../EntryGroupModel';
import { EntryGroupFormComponent } from '../entry-group-form/entry-group-form.component';

@Component({
  selector: 'app-entry-groups',
  templateUrl: './entry-groups.component.html',
  styleUrls: ['./entry-groups.component.scss']
})
export class EntryGroupsComponent implements OnInit {

  @Input('display_as_modal') display_as_modal: boolean = false;
  @Input('idOrganization') idOrganization: number;
  @Output('reload_groups') reload_groups: EventEmitter<boolean> = new EventEmitter<boolean>();

  currentUser: User; // Interfaces

  // Use in datatable
  public entry_groups: any = [];
  public selectedEntryGroup: any
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
  getGroupCategories(idIglesia: number) {
    this.api.get(`communityBox/meta/groups`, { idIglesia }).subscribe(
      (response: any) => {
        this.restartTable()
        this.entry_groups = response;
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

  addEntryGroup(form_add_modal: NgxSmartModalComponent, entry_group_add_form: EntryGroupFormComponent) {
    form_add_modal.open();
    entry_group_add_form.ngOnInit();
  }

  openEditModal(entry_group: any) {
    this.selectedEntryGroup = entry_group
    this.modal.getModal('editModal').open()
  }

  deleteEntryGroup(idEntryGroup) {
    if (confirm(`Delete this entry group?`)) {
      const entry_group = new EntryGroupModel();
      entry_group.deleted_by = this.currentUser.idUsuario;
      entry_group.idEntryGroup = idEntryGroup;
      this.api.delete(`communityBox/meta/groups/${entry_group.idEntryGroup}`, {deleted_by : this.currentUser.idUsuario})
        .subscribe(data => {
          this.getGroupCategories(this.currentUser.idIglesia);
          this.reload_groups.emit(true);
          this.api.showToast(`Entry group deleted successfully.`, ToastType.success);
        }, error => {
          this.api.showToast(`Error deleting entry group.`, ToastType.error);
        })
    }
  }

  updateEntryGroup(entry_group, form_add_modal: NgxSmartModalComponent, entry_group_form: EntryGroupFormComponent) {
    entry_group_form.ngOnInit();
    entry_group_form.setEntryGroup(entry_group);
    form_add_modal.open();
  }

  onModalAddDidDismiss(form_add_modal: NgxSmartModalComponent, response) {
    form_add_modal.close();
    if (response) {
      this.getGroupCategories(this.currentUser.idIglesia);
      this.reload_groups.emit(true);
    }
  }
  onModalEditDidDismiss(form_edit_modal: NgxSmartModalComponent, response) {
    form_edit_modal.close();
    if (response) {
      this.getGroupCategories(this.currentUser.idIglesia);
      this.reload_groups.emit(true);
    }
  }

}
