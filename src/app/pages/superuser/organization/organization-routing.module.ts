import { OrganizationHomeComponent } from './organization-home/organization-home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SuperUserOnlyGuard } from 'src/app/guards/super-user-only.guard';

const routes: Routes = [
  {
    path: '',
    component: OrganizationHomeComponent
  },
  {
    path: 'service_types',
    loadChildren: './service-types/service-types.module#ServiceTypesModule',
    canActivate: [SuperUserOnlyGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule { }
