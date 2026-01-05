import { RegisterInGroupComponent } from './register-in-group/register-in-group.component';
import { RegisterInOrganizationFormComponent } from './register-in-organization-form/register-in-organization-form.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { DisclaimerComponent } from './disclaimer/disclaimer.component';

const routes: Routes = [
  {
    path: '',
    component: RegisterComponent
  },
  {
    path: ':id/disclaimer',
    component: DisclaimerComponent
  },
  {
    path: 'organization/:id',
    component: RegisterInOrganizationFormComponent
  },
  {
    path: 'groups/details/:id',
    component: RegisterInGroupComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegisterRoutingModule { }
