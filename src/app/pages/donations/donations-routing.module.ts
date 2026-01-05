import { DonationCategoryComponent } from './donation-category/donation-category.component';
import { DonationsComponent } from './donations.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from './list/list.component'
import { AuthGuard } from 'src/app/guards/guard';
import { DonationsV2Component } from './donations-v2/donations-v2.component';
const routes: Routes = [
  {
    path: 'details/:id',
    component: DonationsComponent
  },
  {
    path: 'list',
    component: ListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'categories',
    component: DonationCategoryComponent
  },
  {
    path: 'v2/:idOrganization',
    component: DonationsV2Component
  },
  {
    path: ':idOrganization/v2/:id',
    component: DonationsV2Component
  },
  {
    path: 'forms',
    loadChildren: './forms/forms.module#DonationFormsModule',
    canActivate: [AuthGuard]
  }
];

//Sabes cómo se quita compartir pantalla? :'v
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DonationsRoutingModule { }
