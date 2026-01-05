import { ToastType } from './../../../login/ToastTypes';
import { PlanFormComponent } from './../plan-form/plan-form.component';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { Router } from '@angular/router';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { UserService } from './../../../services/user.service';
import { ApiService } from './../../../services/api.service';
import { User } from './../../../interfaces/user';
import { Component, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-plan-home',
  templateUrl: './plan-home.component.html',
  styleUrls: ['./plan-home.component.scss']
})
export class PlanHomeComponent implements OnInit {

  currentUser: User; // Interfaces
  iglesias: any[] = [];

  // Use in datatable
  public totalContact: number;
  public plans: any = [];
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
  getPlans(idIglesia: number) {
    this.api.get(`plans/getPlans`, { idIglesia })
      .subscribe(
        (plans: any) => {
          this.restartTable();
          // this.contacts = contacts.usuarios.filter(u => u.estatus === true);
          this.plans = plans.plans;
          this.totalContact = this.plans.length;

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
    this.getPlans(this.currentUser.idIglesia);
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
  }


  editPlan(plan_form: PlanFormComponent, plan) {
    plan_form.plan = plan;
    plan_form.ngOnInit();
    this.show_form = true;
  }

  deletePlan(idCatalogoPlan) {
    if (confirm(`Delete this Plan?`)) {
      this.api.post('plans/deletePlan',
        {
          idCatalogoPlan,
          estatus: false,
        })
        .subscribe((data) => {
          this.api.showToast(`Plan deleted successfully.`, ToastType.success);
          this.getPlans(this.currentUser.idIglesia);
        });
    }
  }

  onModalEditDidDismiss(formAddModal: NgxSmartModalComponent, response) {
    formAddModal.close();
    if (response) {
      this.getPlans(this.currentUser.idIglesia);
      this.router.navigate([`contact/details/${response.idUsuario}`]);
    }
  }

  addPlan(plan_form: PlanFormComponent) {
    this.show_form = true;
    plan_form.plan = undefined;
    plan_form.ngOnInit();
  }

  dismissPlanForm(response) {
    if (response) {
      this.ngOnInit();
    }
    this.show_form = false
  }

}
