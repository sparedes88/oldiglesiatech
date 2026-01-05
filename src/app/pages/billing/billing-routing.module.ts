import { BillingAuthGuard } from './../../guards/billing.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BillingComponent } from './billing.component';
import { SuperUserOnlyGuard } from 'src/app/guards/super-user-only.guard';

const routes: Routes = [
  {
    path: '',
    component: BillingComponent,
    canActivate: [BillingAuthGuard]
  },
  {
    path: ':idOrganization/payment_methods',
    component: BillingComponent,
    canActivate: [SuperUserOnlyGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillingRoutingModule { }
