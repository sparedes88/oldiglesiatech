import { OrganizationProfileComponent } from './organization-profile.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'main/:idIglesia/:page',
    component: OrganizationProfileComponent,
  },
  {
    path: 'main/:idIglesia/:page/:slug',
    component: OrganizationProfileComponent,
  },
  {
    path: 'main/:idIglesia/:page/:subpage/:slug',
    component: OrganizationProfileComponent,
  },
  {
    path: 'main/:idIglesia/:page/:subpage/:slug/:id',
    component: OrganizationProfileComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationProfileRoutingModule { }
