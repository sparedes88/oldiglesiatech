import { NgxSmartModalComponent } from 'ngx-smart-modal';
import { Validators } from '@angular/forms';
import { Output } from '@angular/core';
import { UserService } from './../../../services/user.service';
import { FormControl, NgForm } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AccumulationChartComponent } from '@syncfusion/ej2-angular-charts';
import { AccumulationChart, IAccLoadedEventArgs, IAccTooltipRenderEventArgs, IPointEventArgs } from '@syncfusion/ej2-charts';
import { ApiService } from 'src/app/services/api.service';
import { random_color, randon_hex_color } from 'src/app/models/Utility';
import { environment } from 'src/environments/environment';
import { StepLogComponent } from '../step-log/step-log.component';

@Component({
  selector: 'app-pie-chart-graph',
  templateUrl: './pie-chart-graph.component.html',
  styleUrls: ['./pie-chart-graph.component.scss']
})
export class PieChartGraphComponent implements OnInit {

  @Input('processList') processList: any[] = [];
  @Input('idOrganization') idOrganization: number;
  @ViewChildren('pie') pie_charts: QueryList<AccumulationChartComponent | AccumulationChart>;

  @Output('on_add') on_add: EventEmitter<{
    object_type: string,
    item: any
  }> = new EventEmitter<{
    object_type: string,
    item: any
  }>();
  @Output('on_update') on_update: EventEmitter<{
    object_type: string,
    item: any
  }> = new EventEmitter<{
    object_type: string,
    item: any
  }>();
  @Output('on_select_item') on_select_item: EventEmitter<{
    object_type: string,
    item: any
  }> = new EventEmitter<{
    object_type: string,
    item: any
  }>();

  levels: any[] = [];
  steps: any[] = [];

  user_steps: any[] = [];
  user_not_in_process: any[] = [];

  get levels_with_id() {
    return this.levels.filter(x => x.idNivel > 0).length > 0;
  }

  steps_form: FormGroup = this.form_builder.group({
    idProcess: new FormControl(0, []),
    idLevel: new FormControl(0, []),
    idStep: new FormControl(0, []),
    show_zeros: new FormControl(false),
    name: new FormControl(),
    descripcion: new FormControl()
  });

  contactSearchValue: string;
  contactSearchValueStep: string;

  loadingAllUsers: boolean = false;

  public pieData: any[];
  public startAngle: number;
  public endAngle: number;
  public center: Object;
  public explode: boolean;
  public enableAnimation: boolean;
  public title: string;
  public legendSettings: Object;
  datalabel = { visible: true, name: 'text' };
  // public map: Object = 'fill';
  tooltip = { enable: true };


  charts: {
    id: string,
    title: string,
    data: { x: string, y: number, text: string, item: any }[],
    palettes: string[],
    show_graph: boolean,
    item?: any,
    subtitle?: string,
    form?: {
      label: string,
      validation: any,
      control_name: string,
      method: any,
      array: any[],
      key_id: string,
      key_name: string,
      show_default_option?: boolean,
      show_update_button: any,
      placeholder: string,
      ng_model_field: string
    },
    add_form: FormGroup
  }[] = [
      {
        id: 'process_chart_container',
        title: 'Users in Process',
        data: [],
        show_graph: false,
        palettes: [],
        form: {
          label: 'Process *',
          validation: () => {
            return true;
          },
          control_name: 'idProcess',
          method: (value) => {
            this.loadProcessChart(value);
          },
          array: this.processList,
          key_id: 'idProcess',
          key_name: 'name',
          show_update_button: () => {
            return this.processList.length > 0 && this.steps_form.get('idProcess').value > 0
          },
          // show_default_option: true,
          placeholder: 'Process Name',
          ng_model_field: 'name'
        },
        add_form: new FormGroup({
          name: new FormControl('', [Validators.required])
        })
      },
      {
        id: 'levels_chart_container',
        title: 'Users in Level',
        data: [],
        show_graph: false,
        palettes: [],
        form: {
          label: 'Level *',
          validation: () => {
            return this.steps_form.get('idProcess').value > 0
          },
          control_name: 'idLevel',
          method: (value) => {
            this.loadLevelChart(value);
          },
          array: this.levels,
          key_id: 'idNivel',
          key_name: 'name',
          show_update_button: () => {
            const control = this.steps_form.get('idLevel');
            if (control) {
              return this.levels.filter(x => x.idNivel > 0).length > 0 && control.value > 0
            }
            return this.levels.filter(x => x.idNivel > 0).length > 0
          },
          placeholder: 'Level Name',
          ng_model_field: 'name'
        },
        add_form: new FormGroup({
          name: new FormControl('', [Validators.required])
        })
      },
      {
        id: 'steps_chart_container',
        title: 'Users in Step',
        data: [],
        show_graph: false,
        palettes: [],
        form: {
          label: 'Step *',
          validation: () => {
            if (this.selected_process) {
              return this.steps_form.get('idProcess').value > 0 && this.steps_form.get('idLevel').value > 0 && this.selected_process.assigned_to > 0
            } else {
              return this.steps_form.get('idProcess').value > 0 && this.steps_form.get('idLevel').value > 0
            }
          },
          control_name: 'idStep',
          method: (value) => {
            this.loadStepChart(value);
          },
          array: this.steps,
          key_id: 'idRequisito',
          key_name: 'name',
          show_update_button: () => {
            return false
          },
          show_default_option: true,
          placeholder: 'Step description',
          ng_model_field: 'descripcion'
        },
        add_form: new FormGroup({
          descripcion: new FormControl('', [Validators.required])
        })
      }
    ]

  currentUser: any;
  users_organization_count: number = 0;

  constructor(
    private form_builder: FormBuilder,
    private api: ApiService,
    private user_service: UserService
  ) {
    this.currentUser = this.user_service.getCurrentUser();
  }

  async ngOnInit() {
    this.initChart();
    await this.getOrganizationUsers();
    this.processList.unshift({
      idProcess: 0,
      name: 'All'
    });
    if (this.processList.length > 0) {
      this.steps_form.get('idProcess').setValue(this.processList[0].idProcess);
      // this.loadProcessChart(this.processList[0].idProcess);
      this.loadProcessChart(0);
    }
    this.charts[0].form.array = this.processList;
  }

  getOrganizationUsers() {
    return new Promise((resolve, reject) => {
      this.api.get(`iglesias/dashboard`, { idIglesia: this.idOrganization })
        .subscribe((data: any) => {
          console.log(data);
          this.users_organization_count = data.dashboard.users;
          return resolve({});
        }, err => {
          console.error(err);
          return resolve(err);
        })
    })
  }

  initChart() {
    this.legendSettings = {
      visible: true,
      position: 'Bottom',
      alignment: 'Center'
    };

    this.center = { x: '50%', y: '60%' };
    this.startAngle = 0;
    this.endAngle = 360;
    this.explode = true;
    this.enableAnimation = false;
    this.title = 'this.process.name';
    this.pieData = [];
    for (let index = 0; index < 5; index++) {
      this.pieData.push({
        x: `Index ${index + 1}`,
        y: index + 1,
        text: `Index ${index + 1}`
      });
    }
  }

  public tooltipRender(args: IAccTooltipRenderEventArgs, chart: any): void {
    let value = args.point.y / args.series.sumOfPoints * 100;
    const item_to_render = chart.data[args.point.index].item;
    let label_text = args.point.x + ' : ' + Math.round((value + Number.EPSILON) * 100) / 100 + '' + '%';
    if (item_to_render) {
      const ac_percent = (item_to_render.accomplished_by / item_to_render.assigned_to * 100);
      const ac_percent_fixed = Math.round((ac_percent + Number.EPSILON) * 100) / 100;
      const uc_percent = (item_to_render.unaccomplished_by / item_to_render.assigned_to * 100);
      const uc_percent_fixed = Math.round((uc_percent + Number.EPSILON) * 100) / 100;
      label_text = `${label_text} <br>`;
      let completed_text = `Uncompleted by`
      if (item_to_render.idNivel) {
        // is Level
        completed_text = `Actually in level`
        label_text = `${label_text} <br>
Total users who took the level: ${item_to_render.assigned_to} (100%)`
      }
      if (!item_to_render.idProcess) {
        label_text = `${label_text} <br>
  Completed by: ${item_to_render.accomplished_by} (${ac_percent_fixed}%) <br>
  ${completed_text}: ${item_to_render.unaccomplished_by} (${uc_percent_fixed} %) <br>
  `
      }
    }
    args["text"] = label_text;
  };

  getPercent(step, quantity) {
    const uc_percent = (quantity / step.assigned_to * 100);
    const uc_percent_fixed = Math.round((uc_percent + Number.EPSILON) * 100) / 100;
    return `${uc_percent_fixed}`;
  }

  pointClick(event: IPointEventArgs) {
    console.log(event);
    // const index = event.pointIndex;
    // const pie_piece = this.pieData[index];
    // console.log(pie_piece);
    // this.level = pie_piece;
    // const idNivel = pie_piece.idNivel;
    // console.log(idNivel);
    // this.steps = [];
    // this.step = undefined;
    // if (idNivel != 0) {
    //   this.idProcessForm.get('idLevel').setValue(idNivel);
    //   this.getUserLevels(idNivel);
    // }
    // http://localhost:9999/api/iglesiaTechApp/reportModules/completedUserLevels?idNivel=190&idProcess=3115&idIglesia=2098
  }

  loadProcessChart(idProcess: number) {
    this.charts[0].show_graph = true;
    this.charts[1].show_graph = false;
    this.charts[2].show_graph = false;
    console.log(idProcess);

    if (idProcess) {
      const process = this.processList.find(proc => proc.idProcess === Number(idProcess));
      this.charts[1].subtitle = process.name;
      console.log(process);

      if (process) {
        if (process.idProcess != 0) {

          this.on_select_item.emit({
            object_type: 'process',
            item: process
          });
          this.getUserProcess();
          setTimeout(() => {
            this.charts[0].item = process;
            this.charts[0].data = [];
            if (process.assigned_to > 0) {
              this.charts[0].data.push({
                x: `Assigned`,
                y: process.assigned_to,
                text: `${process.assigned_to}/${this.users_organization_count}`,
                item: process
              });
            }
            if (process.not_assigned_users > 0) {
              this.charts[0].data.push({
                x: `Unassigned`,
                y: process.not_assigned_users,
                text: `${process.not_assigned_users}/${this.users_organization_count}`,
                item: process
              });
            }
            this.getLevelsForProcess(process.idProcess);
          }, 1);
        } else {
          const data = [];
          const zeros_allowed = this.steps_form.get('show_zeros').value;
          this.processList.forEach(process => {
            let can_push = zeros_allowed || process.assigned_to > 0;
            if (process.idProcess) {
              if (can_push) {
                data.push({
                  x: process.name,
                  y: process.assigned_to,
                  text: `${process.assigned_to}/${this.users_organization_count}`,
                  item: process
                });
              }
            }
          })
          console.log(data);

          setTimeout(() => {
            this.charts[0].data = data;;
            this.charts[0].subtitle = undefined;
            this.charts[0].item = {
              idProcess: 0,
              name: 'All'
            };
            // this.getLevelsForProcess(process.idProcess);
          })
        }
      }
    } else {
      const data = [];
      const zeros_allowed = this.steps_form.get('show_zeros').value;
      this.processList.forEach(process => {
        let can_push = zeros_allowed || process.assigned_to > 0;
        if (process.idProcess) {
          if (can_push) {
            data.push({
              x: process.name,
              y: process.assigned_to,
              text: `${process.assigned_to}/${this.users_organization_count}`,
              item: process
            });
          }
        }
      })
      console.log(data);

      setTimeout(() => {
        this.charts[0].data = data;;
        this.charts[0].subtitle = undefined;
        this.charts[0].item = {
          idProcess: 0,
          name: 'All'
        };
      })
    }
  }

  getLevelsForProcess(idProcess: number) {
    this.api
      .get("reportModules/getLevelsInProcess", {
        idProcess,
        idIglesia: this.idOrganization
      }).subscribe((response: any) => {
        this.levels = response;
        this.levels.unshift({
          idNivel: 0,
          name: 'None'
        })
        this.charts[1].form.array = this.levels;
        this.charts[1].data = [];
        this.charts[1].palettes = [];
        const zeros_allowed = this.steps_form.get('show_zeros').value;
        this.levels.forEach(lev => {
          let can_push = zeros_allowed || lev.total_users > 0 || lev.accomplished_by > 0;
          if (can_push) {
            if (lev.idNivel) {
              this.charts[1].palettes.push(randon_hex_color());
              let graph_info;
              if (lev.accomplished_by > 0 && lev.total_users === 0) {
                graph_info = {
                  x: `${lev.name} (Completed)`,
                  y: lev.accomplished_by,
                  text: `${lev.accomplished_by}/${this.users_organization_count}`
                }
              } else {
                graph_info = {
                  x: lev.name,
                  y: lev.total_users,
                  text: `${lev.total_users}/${this.users_organization_count}`
                }
              }
              this.charts[1].data.push({
                x: graph_info.x,
                y: graph_info.y,
                text: graph_info.text,
                item: lev
              });
            }
          }
        });
        if (this.levels.length > 0) {
          let nivel;
          if (zeros_allowed) {
            nivel = this.levels[0];
          } else {
            nivel = this.levels.find(level => level.total_users > 0);
            if (!nivel) {
              nivel = this.levels[0];
            }
          }
          this.steps_form.get('idLevel').setValue(0);
          this.loadLevelChart(0);
        }
      });
  }

  loadLevelChart(idNivel: number) {
    this.charts[1].show_graph = this.levels.filter(x => x.idNivel !== 0).length > 0;
    if (!this.charts[1].show_graph) {
      // this.pie_charts.first.refresh();
      this.pie_charts.first.refreshChart();
    }
    this.charts[2].show_graph = false;
    const nivel = this.levels.find(lev => lev.idNivel === Number(idNivel));
    if (nivel) {
      if (nivel.idNivel != 0) {
        this.on_select_item.emit({
          object_type: 'level',
          item: nivel
        });
        setTimeout(() => {
          this.charts[1].item = nivel;
          if (idNivel > 0) {
            setTimeout(() => {
              this.charts[1].data = [];
              this.charts[1].data.push({
                x: `Accomplished by`,
                y: nivel.accomplished_by,
                text: `${nivel.accomplished_by}/${nivel.assigned_to}`,
                item: nivel
              });
              this.charts[1].data.push({
                x: `Unaccomplished by`,
                y: nivel.unaccomplished_by,
                text: `${nivel.unaccomplished_by}/${nivel.assigned_to}`,
                item: nivel
              });
            });
            this.getStepsForLevel(idNivel, 0);
          } else {
            this.user_steps = [];
          }
        }, 1);
      } else {
        const data = [];
        const zeros_allowed = this.steps_form.get('show_zeros').value;
        this.levels.forEach(level => {
          let can_push = zeros_allowed || level.assigned_to > 0;
          if (level.idNivel) {
            if (can_push) {
              data.push({
                x: level.name,
                y: level.assigned_to,
                text: `${level.assigned_to}/${this.users_organization_count}`,
                item: level
              });
            }
          }
        })

        setTimeout(() => {
          this.charts[1].data = data;;
          this.charts[1].subtitle = undefined;
          this.charts[1].item = {
            idNivel: 0,
            name: 'All'
          };
          // this.getLevelsForProcess(process.idProcess);
        })
      }
    }
  }

  getStepsForLevel(idNivel: number, idRequisito) {
    const idProcess = this.steps_form.get('idProcess').value;
    this.api
      .get(`reportModules/completedUserSteps`, {
        idNivel,
        idRequisito,
        idProcess,
        idIglesia: this.idOrganization
      })
      .subscribe(
        (data: any) => {
          this.steps = data;
          this.charts[2].form.array = this.steps;
          this.charts[2].data = [];
          const nivel = this.levels.find(x => x.idNivel == idNivel);
          this.charts[2].subtitle = nivel.name;
          this.charts[2].palettes = [];
          const zeros_allowed = this.steps_form.get('show_zeros').value;
          this.steps.forEach(step => {
            let can_push = zeros_allowed || step.users.length > 0;
            if (can_push) {
              this.charts[2].palettes.push(randon_hex_color());
              this.charts[2].data.push({
                x: step.name,
                y: step.users.length,
                text: `${step.users.length}/${this.users_organization_count}`,
                item: step
              });
            }
          });
          this.charts[2].show_graph = this.steps.length > 0;
          this.loadStepChart(0);
        });
  }

  loadStepChart(idRequisito: number) {
    const step = this.steps.find(lev => lev.idRequisito === Number(idRequisito));

    if (step) {
      this.on_select_item.emit({
        object_type: 'step',
        item: step
      });
      setTimeout(() => {
        this.charts[2].subtitle = undefined;
        this.charts[2].item = step;
        this.getUsersForStep(idRequisito);

      }, 1);
    } else {
      const idNivel = this.steps_form.get('idLevel').value;
      const nivel = this.levels.find(x => x.idNivel === Number(idNivel));
      this.charts[2].subtitle = nivel ? nivel.name : undefined;
      this.charts[2].item = {
        idRequisito: 0,
        name: 'All'
      };
      this.getUsersForStep(0);
    }
  }

  getUsersForStep(idRequisito: number) {
    const idNivel = this.steps_form.get('idLevel').value;
    const idProcess = this.steps_form.get('idProcess').value;
    this.api
      .get(`reportModules/completedUserSteps`, {
        idRequisito,
        idNivel,
        idProcess,
        idIglesia: this.idOrganization
      })
      .subscribe(
        (data: any) => {
          this.user_steps = data;
          this.charts[2].palettes = [];
          this.charts[2].data = [];
          const zeros_allowed = this.steps_form.get('show_zeros').value;
          if (!idRequisito) {
            this.user_steps.forEach(step => {
              let can_push = zeros_allowed || step.users.length > 0;
              if (can_push) {
                this.charts[2].palettes.push(randon_hex_color());
                this.charts[2].data.push({
                  x: step.name,
                  y: step.users.length,
                  text: `${step.users.length}/${this.users_organization_count}`,
                  item: step
                });
              }
            });
          } else {
            this.user_steps.forEach(step => {
              let can_push = zeros_allowed || step.accomplished_by > 0;
              if (can_push) {
                this.charts[2].palettes.push(randon_hex_color());
                this.charts[2].data.push({
                  x: `Complete`,
                  y: step.accomplished_by,
                  text: `${step.accomplished_by}/${this.users_organization_count}`,
                  item: step
                });
              }
              can_push = zeros_allowed || step.unaccomplished_by > 0;
              if (can_push) {
                this.charts[2].palettes.push(randon_hex_color());
                this.charts[2].data.push({
                  x: `Incomplete`,
                  y: step.unaccomplished_by,
                  text: `${step.unaccomplished_by}/${this.users_organization_count}`,
                  item: step
                });
              }
            });
          }
        },
        err => {
          console.error(err);
        }
      );
  }

  get filteredUserProcess() {
    if (this.contactSearchValue) {
      return this.user_not_in_process.filter(contact =>
        contact.name
          .toLowerCase()
          .includes(this.contactSearchValue.toLowerCase())
      );
    }
    return this.user_not_in_process;
  }

  toggleAssignUserToProcess(idUser, status) {
    // if contact is assigned toggle to unassigned status
    const idProcess = this.steps_form.get('idProcess').value;
    if (!status) {
      this.api
        .post(`reportModules/unassignUserProcess`, {
          idProcess,
          idUser,
        })
        .subscribe(
          (data: any) => {
            // this.getUserProcess();
          },
          err => console.error(err)
        );
    } else {
      this.api
        .post(`reportModules/assignUserProcess`, {
          idProcess,
          idUser,
          idCreateUser: this.currentUser.idUser
        })
        .subscribe(
          (data: any) => {
            this.getUserProcess();
          },
          err => console.error(err)
        );
    }
  }

  toggleAccomplishedStepStatus(idUser, status, idRequisito) {
    // this.loading = true;
    this.api
      .post("reportModules/completeStep", {
        idRequisito: idRequisito,
        idUsuario: idUser,
        cumplido: status,
        created_by: this.currentUser.idUsuario,
        origin_id: 1
      })
      .subscribe(
        (data: any) => {
          // // const idProcess = this.process.idProcess;
          // // const idNivel = this.level.idNivel;
          // // const idRequisito = this.step.idRequisito;
          // // const item = { idNivel: this.level.idNivel, name: this.level.name };
          // // this.setProcess(true);
          // // this.levels = [item];
          // // this.idProcessForm.get('idLevel').setValue(idNivel);
          // // this.onChangeLevel({
          // //   target: {
          // //     value: idNivel
          // //   }
          // // });

          // // this.loadUserForStep({
          // //   target: {
          // //     value: idRequisito ? idRequisito : 'null'
          // //   }
          // // });
        },
        err => {
          console.error(err);
        }
      );
  }

  getUserProcess() {
    // this.loading = true;
    const idProcess = this.steps_form.get('idProcess').value;
    this.api
      .get(`reportModules/userProcess`, {
        idProcess,
        idIglesia: this.idOrganization,
      })
      .subscribe((data: any) => {
        this.users_organization_count = data.length;
        this.user_not_in_process = data.filter(x => !x.assigned);
        this.loadingAllUsers = false;
      },
        err => console.error(err)
      );
  }

  filteredUserPerStep(step) {
    if (this.contactSearchValueStep) {
      return step.users.filter(contact =>
        contact.name
          .toLowerCase()
          .includes(this.contactSearchValueStep.toLowerCase())
      );
    }
    return step.users;
  }

  get selected_process() {
    return this.processList.find(x => x.idProcess === Number(this.steps_form.get('idProcess').value))
  }
  get selected_level() {
    return this.levels.find(x => x.idNivel === Number(this.steps_form.get('idLevel').value))
  }

  addItem(item_type: string, item: FormGroup) {
    console.log(item_type);
    console.log(item);
    let object_type: string;
    if (item_type === 'idProcess') {
      object_type = 'process';
      this.addProcess(item);

    } else if (item_type === 'idLevel') {
      object_type = 'level';
      this.addLevels(item)
    } else if (item_type === 'idStep') {
      this.addSteep(item);
    }


  }

  updateItem(item_type: string) {
    let item;
    let object_type: string;
    if (item_type === 'idProcess') {
      item = this.selected_process;
      object_type = 'process';
    } else if (item_type === 'idLevel') {
      item = this.selected_process;
      object_type = 'level';
    }
    this.on_update.emit({
      object_type,
      item
    });
  }

  addProcess(form: FormGroup) {
    let payload: any = form.value;
    payload.createdBy = this.currentUser.idUsuario;
    payload.idOrganization = this.currentUser.idIglesia;
    payload.description = "";
    payload.groups = [];
    payload.levels = [];
    payload.status = true;
    this.api.post(`process/addProcess`, form.value)
      .subscribe((response: any) => {
        console.log(response);
        // const idProcess = this.steps_form.get('idProcess').value;
        // this.loadProcessChart(idProcess);
        let idProcess = response.idProcess;
        const confirmation = confirm(`Do you want to view the new process info?`);
        if (confirmation) {
          this.getProcesses(idProcess);
        } else {
          this.getProcesses();
        }
      },
        err => console.error(err),
        () => {
          if (form) {
            form.reset();
          }
        }
      );
  }

  addLevels(form?: FormGroup) {
    const levelIds: any[] = this.levels.map(l => l.idNivel);
    // this.updatingLevel = true;

    this.api
      .post(`insertNivel/`, {
        descripcion: form.value.name,
        idIglesia: this.idOrganization,
        requisitos: [],
        idProcess: this.steps_form.get('idProcess').value,
        createdBy: this.currentUser.idUsuario
      })
      .subscribe((response: any) => {
        if (form && form.value) {
          levelIds.push(response.idNivel);
        }
        if (this.selected_process) {
          this.api
            .post(`process/updateProcess/`, {
              idProcess: this.selected_process.idProcess,
              name: this.selected_process.name,
              description: this.selected_process.description,
              levels: levelIds,
              groups: this.selected_process.groups || [],
              status: this.selected_process.status,
              createdBy: this.selected_process.createdBy,
              idOrganization: this.selected_process.idOrganization
            })
            .subscribe(
              () => {
                this.loadProcessChart(this.selected_process.idProcess);
                // this.updatingLevel = false;
              },
              err => {
                console.error(err);
                // this.updatingLevel = false;
              },
              () => {
                if (form) {
                  form.reset();
                }
              }
            );

        }
      });
  }

  addSteep(form?: FormGroup) {
    const newStep = {
      idNivel: this.selected_level.idNivel,
      descripcion: form.value.descripcion,
      estatus: true
    };
    console.log(newStep);

    this.api.post(`process/levels/addStep`, newStep)
      .subscribe(response => {
        console.log(response);
        this.loadLevelChart(this.selected_level.idNivel);
        if (form) {
          form.reset();
        }
      })

  }

  getProcesses(idProcess?: number) {
    // this.loading = true;
    this.api
      .get(`process/getProcess`, { idIglesia: this.idOrganization })
      .subscribe(
        (data: any) => {
          this.processList = data.processes.filter(pr => pr.status == true);
          this.processList.unshift({
            idProcess: 0,
            name: 'All'
          });
          this.charts[0].form.array = this.processList;
          console.log(this.charts[0].form.array);

          // this.loading = false;
          if (idProcess) {
            this.steps_form.get('idProcess').setValue(idProcess);
            this.loadProcessChart(idProcess);
          }
        },
        err => {
          console.error(err);
        }
      );
  }

  toggleAssignAllUserToProcess(event) {
    this.loadingAllUsers = true;
    console.log(event);
    if (event.checked) {
      const idProcess = this.steps_form.get('idProcess').value;
      // if (!status) {
      //   this.api
      //     .post(`reportModules/unassignUserProcess`, {
      //       idProcess,
      //       idUser,
      //     })
      //     .subscribe(
      //       (data: any) => {
      //         // this.getUserProcess();
      //       },
      //       err => console.error(err)
      //     );
      // } else {
      // }
      this.api
        .post(`reportModules/assignUserProcessAll`, {
          idProcess,
          idCreateUser: this.currentUser.idUser
        })
        .subscribe(
          (data: any) => {
            this.getUserProcess();
            this.getProcesses(idProcess);
          },
          err => console.error(err)
        );
    }
  }

  generatedQR(step) {
    const obj = {
      step: {
        id: step.idRequisito,
        name: step.name,
      },
      level: {
        id: this.selected_level.idNivel,
        name: this.selected_level.name,
      },
      process: {
        id: this.selected_process.idProcess,
        name: this.selected_process.name,
      },
      idOrganization: this.selected_process.idOrganization,
      action: 'assign_step'
    };
    const keys = Object.keys(obj);
    let params = ``;
    keys.forEach(key => {
      const field = obj[key];
      if (typeof field === 'object') {
        const field_keys = Object.keys(field);
        field_keys.forEach(key_field => {
          const value = field[key_field];
          params += `${key}_${key_field}=${value}&`
        });
      } else {
        params += `${key}=${field}&`
      }
    });
    params = params.substring(0, params.length - 1);
    params = encodeURI(params);

    const url = `${environment.server_calendar}/process/register?${params}`
    return url;
  }

  openLogModal(step, step_log_modal: NgxSmartModalComponent, step_log_component: StepLogComponent) {
    step_log_modal.open();
    step_log_component.step = step;
    step_log_component.ngOnInit();
  }

}
