import { Component, OnInit, Input, SimpleChanges } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-contact-process",
  templateUrl: "./contact-process.component.html",
  styleUrls: ["./contact-process.component.scss"]
})
export class ContactProcessComponent implements OnInit {
  constructor(private api: ApiService, private userService: UserService) {}

  @Input() process: any;

  // Data
  public userProcess: any[] = [];
  public completedUsersProcess: any[] = [];
  public pendingUserProcess: any[] = [];
  public loading: boolean = false;

  public contactSearchValue: string;

  ngOnChanges(changes: SimpleChanges): void {
    this.ngOnInit();
  }

  ngOnInit() {
    this.getUserProcess();
  }

  getUserProcess() {
    this.loading = true;
    this.api
      .get(`reportModules/userProcess`, {
        idIglesia: this.process.idOrganization,
        idProcess: this.process.idProcess
      })
      .subscribe(
        (data: any) => {
          this.userProcess = data;
        },
        err => console.error(err)
      );

    this.api
      .get(`reportModules/completedUsersProcess`, {
        idIglesia: this.process.idOrganization,
        idProcess: this.process.idProcess
      })
      .subscribe(
        (data: any) => {
          data = data.filter(proc => proc.assigned == 1);

          this.completedUsersProcess = data.filter(
            p => p.total_cumplidos == p.total
          );
          this.pendingUserProcess = data.filter(
            p => p.total_cumplidos != p.total
          );
        },
        err => console.error(err),
        () => {
          this.loading = false;
        }
      );
  }

  toggleAssignStatus(idUser, status) {
    // if contact is assigned toggle to unassigned status
    console.log(idUser, status);

    if (!status) {
      this.api
        .post(`reportModules/unassignUserProcess`, {
          idUser: idUser,
          idProcess: this.process.idProcess
        })
        .subscribe(
          (data: any) => {
            this.getUserProcess();
          },
          err => console.error(err)
        );
    } else {
      this.api
        .post(`reportModules/assignUserProcess`, {
          idUser: idUser,
          idProcess: this.process.idProcess,
          idCreateUser: this.userService.getCurrentUser().idUser
        })
        .subscribe(
          (data: any) => {
            this.getUserProcess();
          },
          err => console.error(err)
        );
    }
  }

  get filteredUserProcess() {
    if (this.contactSearchValue) {
      return this.userProcess.filter(contact =>
        contact.name
          .toLowerCase()
          .includes(this.contactSearchValue.toLowerCase())
      );
    }
    return this.userProcess;
  }
}
