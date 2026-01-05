import { PieChartGraphComponent } from './../pie-chart-graph/pie-chart-graph.component';
import { Component, OnInit, ViewChild } from "@angular/core";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { ApiService } from "src/app/services/api.service";
import { UserService } from "src/app/services/user.service";
import { FormBuilder, FormGroup, NgForm, Validators } from "@angular/forms";
import { NgxSmartModalComponent, NgxSmartModalService } from "ngx-smart-modal";

@Component({
  selector: "app-builder",
  templateUrl: "./builder.component.html",
  styleUrls: ["./builder.component.scss"]
})
export class BuilderComponent implements OnInit {

  @ViewChild('pie_chart') pie_chart: PieChartGraphComponent;

  constructor(
    private api: ApiService,
    public userService: UserService,
    private modal: NgxSmartModalService,
    private form_builder: FormBuilder
  ) {
    this.user = this.userService.getCurrentUser();
  }

  loading: boolean = false;
  loadingLevels: boolean = false;
  loadingGroups: boolean = false;
  updatingLevel: boolean = false;
  updatingSteep: boolean = false;

  levels: any[] = [];
  groups: any[] = [];

  public processList: any[] = [];
  public selectedProcess: any = {};
  public selectedLevel: any;
  public selectedStep: any;
  public user: any = {};

  public builderSelected: string;

  public allLevels: any[] = [];

  public selectedLevelSteps: any[];

  // Process Form
  public processForm: any = {
    name: ""
  };

  ngOnInit() {
    this.getProcess();
    this.getLevels();
  }

  getProcess() {
    this.loading = true;
    this.api
      .get(`process/getProcess`, { idIglesia: this.user.idIglesia })
      .subscribe(
        (data: any) => {
          this.processList = data.processes.filter(pr => pr.status == true);
          this.loading = false;
        },
        err => {
          console.error(err);
        }
      );
  }

  setSelectedProcess(process) {
    this.builderSelected = "process";
    this.selectedLevel = undefined;
    this.selectedProcess = process;
    this.getProcessDetails(process).then(x => { });
    setTimeout(() => {
      // this.pie_chart.idProcessForm.get('idProcess').setValue(process.idProcess);
      // this.pie_chart.process = process;
      // this.pie_chart.ngOnInit();
    }, 10);

  }

  openProcessModal(process, event?) {
    if (event) {
      event.stopPropagation();
    }
    this.builderSelected = "process";
    this.selectedLevel = undefined;
    this.selectedProcess = process;
    this.getProcessDetails(process).then(x => {
      this.modal.get('processUpdateFormModal').open();
    });
  }

  setSelectedLevelSteps(level) {
    level.requisitos = level.requisitos.filter(req => req.estatus);
    this.selectedLevel = level;
    this.builderSelected = "levels";

    if (this.selectedLevel) {
      this.selectedLevelSteps = Object.assign(
        [],
        this.selectedLevel.requisitos.filter(req => req.estatus)
      );
    } else {
      this.selectedLevelSteps = undefined;
    }
    // if (this.pie_chart) {
    //   this.pie_chart.idProcessForm.get('idLevel').setValue(this.selectedLevel.idNivel);
    //   this.pie_chart.onChangeLevel({
    //     target: {
    //       value: this.selectedLevel.idNivel
    //     }
    //   })
    // }
  }

  setSelectedStep(step) {
    this.builderSelected = "steps";
    this.selectedStep = step;
  }

  getProcessDetails(process: any, loading = true) {
    return new Promise((resolve, reject) => {
      this.loadingLevels = loading;
      this.loadingGroups = loading;
      process.levels = undefined;
      this.selectedLevelSteps = undefined;
      this.api.get(`process/getProcess/${process.idProcess}`).subscribe(
        (res: any) => {

          if (res.msg.Code == 200) {
            const promises = [];
            promises.push(this.getLevelsForProcess(process, res.process.levels));
            promises.push(this.getGroupsForProcess(process, res.process.groups));
            Promise.all(promises)
              .then(x => {
                return resolve(x);
              })
              .catch(errors => {
                console.error(errors);
                return resolve(errors);
              });
          } else {
            return reject({});
          }
        },
        err => {
          console.error(err);
          return reject(err);
        });
    })
  }

  getLevelsForProcess(process: any, levels: any[]) {
    return new Promise((resolve, reject) => {
      this.api
        .get(`getNiveles`, { idIglesia: this.user.idIglesia })
        .subscribe((res: any) => {
          process.levels = res.niveles
            .filter(
              level => levels.includes(level.idNivel) && level.estatus == true
            )
            .sort((a, b) => a.orden - b.orden);
          this.loadingLevels = false;
          this.levels = res.niveles;
          return resolve(this.loadingLevels);
        }, error => {
          this.loadingLevels = false;
          return resolve(this.loadingLevels);
        });
    });
  }

  getGroupsForProcess(process: any, groups: any[]) {
    return new Promise((resolve, reject) => {
      this.api
        .get(`groups/getGroups`, { idIglesia: this.user.idIglesia })
        .subscribe((res: any) => {
          process.groups = res.groups
            .filter(
              group => groups.includes(group.idGroup)
            )
          this.loadingGroups = false;
          this.groups = res.groups;
          return resolve(this.loadingGroups)
        }, error => {
          this.loadingGroups = false;
          return resolve(this.loadingGroups);
        });
    });
  }

  dropLevel(event: CdkDragDrop<any>) {
    moveItemInArray(
      this.selectedProcess.levels,
      event.previousIndex,
      event.currentIndex
    );

    this.addLevels();
  }

  dropSteep(event: CdkDragDrop<any>) {
    moveItemInArray(
      this.selectedLevel.requisitos,
      event.previousIndex,
      event.currentIndex
    );
    moveItemInArray(
      this.selectedLevelSteps,
      event.previousIndex,
      event.currentIndex
    );
    this.selectedLevel.requisitos.forEach((req, index) => {
      req.orden = index;
    });
    // this.addSteep();
  }

  /**
   * Submit a new process
   * @param data
   */
  addProcess(form: NgForm) {
    let payload: any = form.value;
    payload.createdBy = this.user.idUsuario;
    payload.idOrganization = this.user.idIglesia;
    payload.description = "";
    payload.groups = [];
    payload.levels = [];
    payload.status = true;

    this.api.post(`process/addProcess`, form.value).subscribe(
      () => {
        this.getProcess();
      },
      err => console.error(err),
      () => {
        if (form) {
          form.resetForm();
        }
      }
    );
  }

  getLevels() {
    this.api
      .get(`iglesiaTechApp/getNiveles/`, { idIglesia: this.user.idIglesia })
      .subscribe((data: any) => {
        if (data.niveles) {
          this.allLevels = data.niveles.filter(lvl => lvl.estatus == true);
        }
      });
  }

  addLevels(form?: NgForm | any) {
    const levelIds: any[] = this.selectedProcess.levels.map(l => l.idNivel);
    this.updatingLevel = true;

    this.api
      .post(`insertNivel/`, {
        descripcion: form.value.name,
        idIglesia: this.user.idIglesia,
        requisitos: [],
        idProcess: this.selectedProcess.idProcess,
        createdBy: this.user.idUsuario
      })
      .subscribe((response: any) => {
        if (form && form.value) {
          levelIds.push(response.idNivel);
        }

        this.api
          .post(`process/updateProcess/`, {
            idProcess: this.selectedProcess.idProcess,
            name: this.selectedProcess.name,
            description: this.selectedProcess.description,
            levels: levelIds,
            groups: this.selectedProcess.groups || [],
            status: this.selectedProcess.status,
            createdBy: this.selectedProcess.createdBy,
            idOrganization: this.selectedProcess.idOrganization
          })
          .subscribe(
            () => {
              this.getProcessDetails(this.selectedProcess, false);
              this.updatingLevel = false;
            },
            err => {
              console.error(err);
              this.updatingLevel = false;
            },
            () => {
              if (form) {
                form.resetForm();
              }
            }
          );
      });
  }

  /** Create a new level */
  insertCreatedLevel(data: any) {
    // Set id iglesia
    data.idIglesia = this.user.idIglesia;
    // Send post
    this.api.post("insertNivel", data).subscribe(
      (data: any) => {
        if (data.msg.Code == 200) {
          this.getLevels();
          this.modal.getModal("createLevelModal").close();

          // Build Payload
          let payload = {
            value: {
              idNivel: data.idNivel
            },
            resetForm: () => { }
          };
          this.addLevels(payload);
        } else {
          alert(data.msg.Message);
        }
      },
      err => console.error(err)
    );
  }

  addSteep(form?: NgForm) {
    const steps: any[] = Object.assign([], this.selectedLevelSteps);

    const newStep = {
      idNivel: "",
      descripcion: form.value.description,
      estatus: true
    };

    if (form) {
      steps.push(newStep);
    }

    this.updatingSteep = true;
    if (!this.selectedLevel) {
      const level = this.selectedProcess.levels.find(x => x.idNivel === Number(this.pie_chart.steps_form.get('idLevel').value));
      if (level) {
        this.selectedLevel = level;
        this.setSelectedLevelSteps(level);
      }
    }
    const payload = {
      idNivel: this.selectedLevel.idNivel,
      descripcion: this.selectedLevel.descripcion,
      orden: this.selectedLevel.orden,
      idIglesia: this.selectedLevel.idIglesia,
      requisitos: steps
    };

    this.api.post(`updateNivel`, payload).subscribe(
      (response: any) => {
        this.updatingSteep = false;
        this.selectedLevelSteps.push(newStep);
      },
      err => {
        this.updatingSteep = false;
        console.error(err);
      },
      () => {
        if (form) {
          form.resetForm();
        }
      }
    );
  }

  /** Update selected level */
  updateLevel(data: any) {
    // Set id iglesia
    data.idIglesia = this.user.idIglesia;
    data.created_by = this.user.idUsuario;
    // Send post
    this.api.post("updateNivel", data).subscribe(
      (response: any) => {
        if (response.msg.Code == 200) {
          if (!data.estatus) {
            this.api
              .post(`deleteReactivateNivel`, {
                idNivel: data.idNivel,
                estatus: false
              })
              .subscribe(
                (res: any) => {
                  this.getLevels();
                  this.modal.getModal("updateLevelForm").close();
                  this.selectedLevel = undefined;
                  this.getProcessDetails(this.selectedProcess).then(x => { });;
                },
                err => console.error(err)
              );
          } else {
            if (this.pie_chart) {
              this.pie_chart.loadLevelChart(data.idNivel);
            }
            this.getLevels();
            this.modal.getModal("updateLevelForm").close();
            this.selectedLevel = undefined;
            this.getProcessDetails(this.selectedProcess).then(x => { });;
          }
        } else {
          console.log(response);
          alert(response.msg.Message);
        }
      },
      err => console.error(err)
    );
  }

  openLevelForm(level, updateLevelForm) {
    this.setSelectedLevelSteps(level);
    updateLevelForm.open();
  }

  handleSelection(event) {
    console.log(event);
    if (event.object_type === 'process') {
      console.log(this.processList);

      const process = this.processList.find(x => x.idProcess === event.item.idProcess);
      console.log(process);
      if (process.idProcess > 0) {
        this.setSelectedProcess(process)
      } else {
        // this.loading = false;
      }
    } else if (event.object_type === 'level') {
      console.log(this.selectedProcess.levels);
      if (this.selectedProcess.levels) {
        const level = this.selectedProcess.levels.find(x => x.idNivel === event.item.idNivel);
        console.log(level);
        if (level) {
          this.setSelectedLevelSteps(level);
        } else {
          this.setSelectedProcess(this.selectedProcess);
        }
      }
    } else if (event.object_type === 'step') {
      const step = this.selectedLevelSteps.find(x => x.idRequisito === event.item.idRequisito);
      if (step) {
        this.setSelectedStep(step);
      }
    }
  }

  handleAddAction(event) {
    console.log(event);
    if (event.object_type === 'process') {
      this.addProcess(event.item);
    } else if (event.object_type === 'level') {
      this.addLevels(event.item)
    } else if (event.object_type === 'step') {
      this.addSteep(event.item);
    }
  }
  handleUpdateAction(event) {
    console.log(event);
    if (event.object_type === 'process') {
      const process = this.processList.find(x => x.idProcess === Number(this.pie_chart.steps_form.get('idProcess').value));
      if (process) {
        this.openProcessModal(process);
      }
    } else if (event.object_type === 'level') {
      this.loadingLevels = true;
      this.api
        .get(`getNiveles`, { idIglesia: this.user.idIglesia })
        .subscribe((res: any) => {
          this.loading = false;
          const level = res.niveles.find(x => x.idNivel === Number(this.pie_chart.steps_form.get('idLevel').value));
          if (level) {
            const updateLevelForm: NgxSmartModalComponent = this.modal.get('updateLevelForm');
            this.openLevelForm(level, updateLevelForm)
          }
        }, error => {
          this.loadingLevels = false;
        });
    } else if (event.object_type === 'step') {
      this.addSteep(event.item);
    }
  }
}
