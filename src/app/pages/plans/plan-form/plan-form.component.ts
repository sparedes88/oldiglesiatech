import { ApiService } from './../../../services/api.service';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, FormControl, Validators, NgForm } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ToastType } from 'src/app/login/ToastTypes';

@Component({
  selector: 'app-plan-form',
  templateUrl: './plan-form.component.html',
  styleUrls: ['./plan-form.component.scss']
})
export class PlanFormComponent implements OnInit {

  plan: any;
  @Output() dismiss_form = new EventEmitter();
  show_detail: boolean = true;

  plan_form: FormGroup = this.form_builder.group({
    nombre: new FormControl('', [Validators.required]),
    descripcion: new FormControl(''),
    precioMes: new FormControl(undefined, [Validators.required, Validators.min(0)]),
    cuotaInicial: new FormControl(undefined, [Validators.required, Validators.min(0)])
  });

  constructor(
    private form_builder: FormBuilder,
    private api: ApiService
  ) { }

  ngOnInit() {
    if (this.plan) {
      console.log(this.plan);
      this.plan_form.addControl('idCatalogoPlan', new FormControl(this.plan.idCatalogoPlan, [Validators.required]));
      this.plan_form.patchValue(this.plan);
    } else {
      console.log(this.plan);
      this.plan_form.removeControl('idCatalogoPlan');
      this.plan_form.reset();
    }
  }

  submitPlan(plan_form: FormGroup, group_form: NgForm) {
    console.log(plan_form.value);
    this.show_detail = false;
    if (plan_form.valid) {
      const plan = plan_form.value;
      let subscription: Observable<any>;
      let success_message: string;
      let error_message: string;
      if (plan.idCatalogoPlan) {
        // update
        subscription = this.api.post(`plans/updatePlan`, plan);
        success_message = `Plan updated successfully.`;
        error_message = `Error updating Plan.`;
      } else {
        // add
        subscription = this.api.post(`plans/savePlan`, plan);
        success_message = `Plan added successfully.`;
        error_message = `Error adding Plan.`;
      }
      subscription
        .subscribe(response => {
          this.api.showToast(`${success_message}`, ToastType.success);
          console.log(response);
          this.show_detail = true;
          this.close(true);
        }, error => {
          this.api.showToast(`${error_message}`, ToastType.error);
          console.error(error);
          this.show_detail = true;
        });
    } else {
      setTimeout(() => {
        this.show_detail = true;
      }, 6000);
      this.api.showToast(`Please check the info provided. Some fields are required.`, ToastType.error);
    }

  }

  close(response?: boolean) {
    this.dismiss_form.emit(response);
  }

}
