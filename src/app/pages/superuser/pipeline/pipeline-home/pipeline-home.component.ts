import { ToastType } from 'src/app/login/ToastTypes';
import { User } from 'src/app/interfaces/user';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PipelineFormComponent } from '../pipeline-form/pipeline-form.component';

@Component({
  selector: 'app-pipeline-home',
  templateUrl: './pipeline-home.component.html',
  styleUrls: ['./pipeline-home.component.scss']
})
export class PipelineHomeComponent implements OnInit {

  currentUser: User; // Interfaces
  iglesias: any[] = [];
  tabSelected: string;


  // Use in datatable
  public totalContact: number;
  public pipelines: any = [];
  public selectedContact: any;
  show_form: boolean = false;

  constructor(
    private api: ApiService,
    private userService: UserService,
    public modal: NgxSmartModalService,
    private router: Router
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  // Datatables
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: 'Blfrtip',
    lengthMenu: [10, 25, 50, 100, 250, 500],
    buttons: [
      { extend: 'copy', className: 'btn btn-outline-citric btn-sm' },
      { extend: 'print', className: 'btn btn-outline-citric btn-sm' },
      { extend: 'csv', className: 'btn btn-outline-citric btn-sm' },
    ]
  };

  // TODO future add this method in contact service

  // Method for make request to api
  getPipelines(idIglesia: number) {
    this.api.get(`oportunidades/getPipelineDashboard/`, { idIglesia })
      .subscribe(
        (pipelines: any) => {
          this.restartTable();
          // this.contacts = contacts.usuarios.filter(u => u.estatus === true);
          this.pipelines = pipelines.totales;
          this.totalContact = this.pipelines.length;
          if (this.pipelines.length > 0) {
            if (!this.tabSelected) {
              this.tabSelected = this.pipelines[0].nombre;
            }
          }

        }, err => console.error(err),
        () => {
          this.dtTrigger.next();
        });
  }

  ngOnDestroy() {
    // Use in Datatable
    this.dtTrigger.unsubscribe();
  }

  // load data the pages
  ngOnInit() {
    // Obtain the idIglesia from currentUser of user.service
    // this.getIglesias().then(response => {
    //   this.getContacts(this.currentUser.idIglesia);
    // });
    this.getPipelines(this.currentUser.idIglesia);
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
  }


  editPipeline(pipeline_form: PipelineFormComponent, pipeline) {
    pipeline_form.pipeline = pipeline;
    pipeline_form.ngOnInit();
    this.show_form = true;
  }

  deletePipeline(oportunidad) {
    if (confirm(`Delete this Pipeline?`)) {
      oportunidad.estatus = false;
      this.api.post('oportunidades/deleteOportunidad', oportunidad)
        .subscribe((data) => {
          this.api.showToast(`Pipeline deleted successfully.`, ToastType.success);
          this.getPipelines(this.currentUser.idIglesia);
        });
    }
  }

  addPipeline(pipeline_form: PipelineFormComponent) {
    this.show_form = true;
    pipeline_form.pipeline = undefined;
    pipeline_form.ngOnInit();
  }

  dismissPipelineForm(response) {
    if (response) {
      this.ngOnInit();
    }
    this.show_form = false;
  }

  get get_oportunidades() {
    const pipeline = this.pipelines.find(x => x.nombre === this.tabSelected);
    if (pipeline) {
      return pipeline.oportunidades;
    }
    return [];
  }

  manageClick(estadoCliente) {
    this.tabSelected = estadoCliente.nombre;
    this.restartTable();
    this.dtTrigger.next();
  }
}
