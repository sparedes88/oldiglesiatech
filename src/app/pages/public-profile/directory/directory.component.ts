import { Component, OnInit, ViewChild } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { OrganizationService } from "src/app/services/organization/organization.service";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";

@Component({
  selector: "app-directory",
  templateUrl: "./directory.component.html",
  styleUrls: ["./directory.component.scss"],
})
export class DirectoryComponent implements OnInit {
  constructor(
    private api: ApiService,
    private organizationService: OrganizationService
  ) {}

  // Data
  public loading: boolean = true;
  public iglesias: Array<any> = [];

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: "lfrtip",
    lengthMenu: [10, 25, 50, 100, 250, 500],
    order: [[1, "asc"]],
  };

  ngOnInit() {
    this.getIglesias();
  }

  getIglesias() {
    this.loading = true;
    this.organizationService.getOrganizations().subscribe(
      (data: any) => {
        this.restartTable()
        this.iglesias = data.iglesias;
        this.loading = false;
      },
      (err) => {
        console.error(err);
        this.loading = false;
      },
      () => {
        this.dtTrigger.next();
      }
    );
  }

  /** Destroy table instance */
  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
  }
}
