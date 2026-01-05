import { Component, OnInit, ViewChild } from "@angular/core";
import { DataTableDirective } from "angular-datatables";
import { Subject, Observable } from "rxjs";
import { ApiService } from "src/app/services/api.service";
import { UserService } from "src/app/services/user.service";
import { NgForm } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { NgxSmartModalService } from "ngx-smart-modal";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.scss"],
})
export class ListComponent implements OnInit {
  constructor(
    private api: ApiService,
    private userService: UserService,
    private toastr: ToastrService,
    private modal: NgxSmartModalService
  ) {}

  public currentUser: any = this.userService.getCurrentUser();
  public communities: any[] = [];
  public communityForm = {
    id: null,
    name: "",
    description: null,
    category: "",
    idIglesia: undefined,
  };
  saving: boolean = false;
  public categories: any[] = []

  // Data tables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: "Blfrtip",
    lengthMenu: [10, 25, 50, 100, 250, 500],
    buttons: [
      { extend: "copy", className: "btn btn-outline-primary btn-sm" },
      { extend: "print", className: "btn btn-outline-primary btn-sm" },
      { extend: "csv", className: "btn btn-outline-primary btn-sm" },
    ],
  };

  ngOnInit() {
    this.getCommunities();
    this.getCategories()
  }

  getCommunities() {
    this.api
      .get("communityBox", { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          this.communities = data;
          this.restartTable();
        },
        (err) => {
          console.error(err);
        },
        () => {
          this.dtTrigger.next();
        }
      );
  }

  submitCommunity(form: NgForm) {
    if (form.invalid) {
      return alert("Please check the form and try again");
    }

    this.saving = true;
    let request: Observable<any>;
    this.communityForm.idIglesia = this.currentUser.idIglesia;

    if (this.communityForm.id) {
      request = this.api.patch(
        `communityBox/${this.communityForm.id}`,
        this.communityForm
      );
    } else {
      request = this.api.post(`communityBox`, this.communityForm);
    }

    request.subscribe(
      (data: any) => {
        this.getCommunities();
        this.toastr.success("Community saved!", "Success");
        this.modal.getModal("communityFormModal").close();
      },
      (err) => {
        console.error(err);
        this.toastr.error(`Can't save community!`, "Error");
      }
    );
  }

  openEdit(community) {
    this.communityForm = Object.assign({}, community);
    this.modal.getModal("communityFormModal").open();
  }

  deleteCommunity(community) {
    if (
      confirm(
        `Are you sure you want to delete this Community: ${community.name}'\nThis action can't be undone.`
      )
    ) {
      this.api.delete(`communityBox/${community.id}`).subscribe(
        (data: any) => this.getCommunities(),
        (err) => console.log(err)
      );
    }
  }

  getCategories() {
    this.api.get(`communityBox/meta/categories`).subscribe(
      (data: any) => {
        this.categories = data;
      },
      (err) => {
        console.error(err);
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
