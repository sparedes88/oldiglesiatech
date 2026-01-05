import { UserService } from 'src/app/services/user.service';
import { ApiService } from './../../../services/api.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IAccTooltipRenderEventArgs, IPointEventArgs, Thickness } from '@syncfusion/ej2-charts';
import { User } from 'src/app/interfaces/user';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit {

  @Input('process') process: any;
  @Input('processList') processList: any[] = [];
  @Output('on_select_item') on_select_item: EventEmitter<{
    item_type: string,
    item: any
  }> = new EventEmitter();

  idProcessForm: FormGroup = this.form_builder.group({
    idProcess: [undefined, [Validators.required]],
    idLevel: [0],
    idStep: [undefined]
  });

  levels: any[] = [];
  level: any;
  steps: any[] = [];
  step: any;
  users: any[] = [];
  currentUser: User;
  userProcess: any[] = [];

  loading: boolean = false;
  public contactSearchValue: string;

  public pieData: any[];
  public startAngle: number;
  public endAngle: number;
  public center: Object;
  public explode: boolean;
  public enableAnimation: boolean;
  public title: string;
  public legendSettings: Object;
  datalabel = { visible: true, name: 'text' };
  public map: Object = 'fill';
  tooltip = { enable: true };

  constructor(
    private api: ApiService,
    private userService: UserService,
    private form_builder: FormBuilder
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  setProcess(prevent_default?: boolean) {
    this.level = undefined;
    this.levels = [];
    this.step = undefined;
    this.steps = [];
    this.idProcessForm.get('idLevel').setValue(0);
    this.idProcessForm.get('idStep').setValue(null);
    this.on_select_item.emit({
      item_type: 'process',
      item: this.process
    });
    this.api
      .get("reportModules/getLevelsInProcess", {
        idProcess: this.process.idProcess,
        idIglesia: this.currentUser.idIglesia
      }).subscribe((response: any) => {
        console.log(response);
        this.levels = response;
        this.pieData = [];
        this.levels.forEach(lev => {
          this.pieData.push({
            x: lev.name,
            y: lev.total_users,
            text: lev.total_users,
            idNivel: lev.idNivel
          })
        });
        if (!prevent_default) {
          this.onChangeLevel({
            target: {
              value: 0
            }
          })
        }
        // this.level = this.levels.find(x => x.idNivel === 0);
        // this.loadUserForStep({
        //   target: {
        //     value: 'null'
        //   }
        // });

      });
  }

  ngOnInit(): void {

    // this.pieData = [
    //   {
    //     x: 'Paso 1',
    //     y: 1,
    //     text: '1',
    //     idProcess: 11
    //   },
    //   {
    //     x: 'Paso 2',
    //     y: 2,
    //     text: '2',
    //     idProcess: 22
    //   }
    // ];
    this.legendSettings = {
      visible: true
    };
    this.center = { x: '60%', y: '60%' };
    this.startAngle = 0;
    this.endAngle = 360;
    this.explode = true;
    this.enableAnimation = true;
    this.title = this.process.name;
  }

  public tooltipRender(args: IAccTooltipRenderEventArgs): void {
    let value = args.point.y / args.series.sumOfPoints * 100;
    args["text"] = args.point.x + ' : ' + Math.ceil(value) + '' + '%';
  };

  pointClick(event: IPointEventArgs) {
    console.log(event);
    const index = event.pointIndex;
    const pie_piece = this.pieData[index];
    console.log(pie_piece);
    this.level = pie_piece;
    const idNivel = pie_piece.idNivel;
    console.log(idNivel);
    this.steps = [];
    this.step = undefined;
    if (idNivel != 0) {
      this.idProcessForm.get('idLevel').setValue(idNivel);
      this.getUserLevels(idNivel);
    }
    // http://localhost:9999/api/iglesiaTechApp/reportModules/completedUserLevels?idNivel=190&idProcess=3115&idIglesia=2098
  }

  onChangeLevel(event) {
    this.level = this.levels.find(x => x.idNivel === Number(event.target.value))
    console.log(this.level);
    this.getUserLevels(this.level.idNivel);
  }

  getUserLevels(idNivel: number) {
    this.loading = true;
    this.idProcessForm.get('idStep').setValue(null);
    this.step = undefined;
    this.on_select_item.emit({
      item_type: 'level',
      item: this.level
    });
    if (idNivel) {
      this.api
        .get("reportModules/getStepsInLevel", {
          idNivel: idNivel,
          idProcess: this.process.idProcess,
          idIglesia: this.currentUser.idIglesia
        })
        .subscribe(
          (data: any) => {
            data.map(l => (l.completed = l.total == l.total_cumplidos));

            // this.pendingUsers = data.filter(d => d.completed == false);
            // this.completedUsers = data.filter(d => d.completed == true);

            console.log(data);
            this.loading = false;
            this.steps = data;
            this.loadUserForStep({
              target: {
                value: 'null'
              }
            });
          },
          err => {
            console.error(err);
            this.loading = false;
          }
        );
    } else {
      console.log('Here');
      this.getUserProcess();
      this.loading = false;
    }
  }

  getUserProcess() {
    this.loading = true;
    this.api
      .get(`reportModules/userProcess`, {
        idIglesia: this.process.idOrganization,
        idProcess: this.process.idProcess
      })
      .subscribe((data: any) => {
        this.userProcess = data.filter(x => !x.assigned);
      },
        err => console.error(err)
      );
  }

  loadChart(event) {
    console.log(event);
    let process;
    if (event.target) {
      process = this.processList.find(process => process.idProcess === Number(event.target.value));
    } else{
      process = this.processList.find(process => process.idProcess === Number(event));
    }
    if (process) {
      this.process = process;
      this.setProcess();
    }

  }

  loadUserForStep(event) {
    console.log(event);
    if (event.target.value != 'null') {
      this.step = this.steps.find(x => x.idRequisito === Number(event.target.value))
      this.getUsersStep(this.step.idRequisito);
    } else {
      this.step = {
        idRequisito: 0
      };
      this.getUsersStep(0);
    }
    // http://localhost:9999/api/iglesiaTechApp/reportModules/completedUserSteps?idNivel=190&idRequisito=1417&idIglesia=2098
  }

  getUsersStep(idRequisito: number) {
    this.loading = true;
    this.on_select_item.emit({
      item_type: 'step',
      item: this.step
    });
    this.api
      .get(`reportModules/completedUserSteps`, {
        idNivel: this.level.idNivel,
        idRequisito: idRequisito,
        idIglesia: this.currentUser.idIglesia
      })
      .subscribe(
        (data: any) => {
          console.log(data);
          this.users = data;
          // this.completedUsers = data.filter(s => s.cumplido);
          // this.pendingUsers = data.filter(s => !s.cumplido);

          this.loading = false
        },
        err => {
          console.error(err);
        }
      );
  }

  toggleStepStatus(idUser, status, idRequisito) {
    console.log(status);
    this.loading = true;
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
          console.log(data);
          const idProcess = this.process.idProcess;
          const idNivel = this.level.idNivel;
          const idRequisito = this.step.idRequisito;
          const item = { idNivel: this.level.idNivel, name: this.level.name };
          this.setProcess(true);
          this.levels = [item];
          this.idProcessForm.get('idLevel').setValue(idNivel);
          this.onChangeLevel({
            target: {
              value: idNivel
            }
          });
          console.log(this.levels);
          console.log(idNivel);
          console.log(idRequisito);

          this.loadUserForStep({
            target: {
              value: idRequisito ? idRequisito : 'null'
            }
          });
          // this.getUsersStep(this.step.idRequisito)
        },
        err => {
          console.error(err);
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

  makeRefresh(item_type: string) {
    if (item_type === 'process') {
      this.setProcess();
    }
  }

}
