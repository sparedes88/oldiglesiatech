import { Component, OnInit, ViewChild } from "@angular/core";
import { UserService } from "src/app/services/user.service";
import { ApiService } from "src/app/services/api.service";
import { MatSnackBar } from "@angular/material";
import { NgxSmartModalService } from "ngx-smart-modal";

@Component({
  selector: "app-process-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.scss"]
})
export class ListComponent implements OnInit {
  constructor(
    public modal: NgxSmartModalService,
    public snackbar: MatSnackBar,
    public userService: UserService,
    public api: ApiService
  ) {
    this.user = this.userService.getCurrentUser();
  }

  // Data
  public user: any;
  public process: any[] = [];
  public loading: boolean = true;
  public selectedProcess: any;
  public totalProcess: number;

  ngOnInit() {
    this.getProcess();
  }

  /**
   * Load process list from API
   */
  getProcess() {
    this.loading = true;
    this.api
      .get(`process/getProcess`, { idIglesia: this.user.idIglesia })
      .subscribe(
        (data: any) => {
          this.process = data.processes.filter(pr => pr.status == true);
          this.totalProcess = this.process.length;
          this.loading = false;
        },
        err => {
          console.error(err);
          this.snackbar.open(`Can't load process list`, null, {
            duration: 3000
          });
        }
      );
  }

  /**
   * Submit a new process
   * @param data
   */
  addProcess(data: any) {
    this.getProcess();
    this.modal.getModal("processFormModal").close();
  }

  openUpdateModal(process: any) {
    this.selectedProcess = process;
    this.modal.getModal("processUpdateModal").open();
  }

  /**
   * Submit an update patch request
   * @param data
   */
  updateProcess(data: any) {
    this.api.post(`process/updateProcess`, data).subscribe(
      () => {
        this.getProcess();
        this.modal.getModal("processUpdateModal").close();
        this.selectedProcess = undefined;
      },
      err => console.error(err)
    );
  }

  deteleProcess(processId: any) {
    if (confirm(`Are you sure you whant to delete this Process?`)) {
      this.api
        .post(`process/deleteProcess`, { idProcess: processId, status: false })
        .subscribe(
          () => {
            this.getProcess();
          },
          err => console.error(err)
        );
    }
  }

  getProcessDetails(process: any) {
    process.levels = undefined;
    this.api.get(`process/getProcess/${process.idProcess}`).subscribe(
      (res: any) => {
        if (res.msg.Code == 200) {
          this.getLevelsForProcess(process, res.process.levels);
        }
      },
      err => console.error(err)
    );
  }

  getLevelsForProcess(process: any, levels: any[]) {
    this.api
      .get(`getNiveles`, { idIglesia: this.user.idIglesia })
      .subscribe((res: any) => {
        process.levels = res.niveles
          .filter(level => levels.includes(level.idNivel))
          .sort((a, b) => a.orden - b.orden);
        console.log(process);
      });
  }
}
