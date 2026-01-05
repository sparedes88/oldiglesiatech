import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrganizationCategoriesHomeComponent } from './organization-categories-home/organization-categories-home.component';

const routes: Routes = [
  {
    path: '',
    component: OrganizationCategoriesHomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationCategoriesRoutingModule { }
