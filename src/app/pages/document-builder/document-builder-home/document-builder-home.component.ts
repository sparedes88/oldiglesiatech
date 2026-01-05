import { ToastType } from './../../../login/ToastTypes';
import { UserService } from './../../../services/user.service';
import { ApiService } from './../../../services/api.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-document-builder-home',
  templateUrl: './document-builder-home.component.html',
  styleUrls: ['./document-builder-home.component.scss']
})
export class DocumentBuilderHomeComponent implements OnInit {

  // Data tables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: "Blfrtip",
    lengthMenu: [10, 25, 50, 100, 250, 500],
    buttons: [
      { extend: "copy", className: "btn btn-outline-primary btn-sm" },
      {
        extend: "print",
        className: "btn btn-outline-primary btn-sm",
      },
      { extend: "csv", className: "btn btn-outline-primary btn-sm" },
    ],
  };

  documents: any[] = [];
  currentUser;

  constructor(
    private api: ApiService,
    private userService: UserService
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  ngOnInit() {
    this.getDocuments();
  }

  getDocuments() {
    this.api.get(`document-builder/getDocuments`, { idIglesia: this.currentUser.idIglesia })
      .subscribe((response: any) => {
        this.documents = response.documents;
        this.restartTable();
        this.dtTrigger.next();
      }, error => {
        console.error(error);
      });
  }

  deleteDocument(document) {
    if (confirm('Are you sure you want to delete this document?')) {
      this.api.delete(`document-builder/delete/${document.idDocument}`)
        .subscribe(response => {
          this.getDocuments();
          this.api.showToast(`Document deleted`, ToastType.success);
        }, error => {
          console.error(error);
          this.api.showToast(`Error deleting document`, ToastType.error);
        });
    }
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
  }

}
