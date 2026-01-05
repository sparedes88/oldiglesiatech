import { AuthGuard } from 'src/app/guards/guard';
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ListComponent } from "./list/list.component";
import { DetailsComponent } from "./details/details.component";
import { CategoriesComponent } from './categories/categories.component';
import { ContactDetailComponent } from './contact-detail/contact-detail.component';
import { ContactEditComponent } from './contact-edit/contact-edit.component';
import { MailingListFormV2Component } from './mailing-list-form-v2/mailing-list-form-v2.component';
import { MailingListViewComponent } from './mailing-list-view/mailing-list-view.component';
import { DetailsV2Component } from './details-v2/details-v2.component';

const routes: Routes = [
  {
    path: "",
    redirectTo: 'v1',
    pathMatch: 'full',
  },
  {
    path: "v1",
    component: ListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "v2",
    component: ListComponent,
    canActivate: [AuthGuard]
  },
  // {
  //   path: "form/v2",
  //   component: MailingListFormV2Component,
  //   canActivate: [AuthGuard]
  // },
  {
    path: "v1/:id",
    component: DetailsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "v2/:id",
    component: DetailsV2Component,
    canActivate: [AuthGuard]
  },
  {
    path: "v2/:id/view",
    component: MailingListViewComponent,
    canActivate: []
  },
  {
    path: ':version/:id/categories',
    component: CategoriesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: ':version/:mailing_list_id/contact/:id/detail',
    component: ContactDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: ':version/:mailing_list_id/contact/:id/edit',
    component: ContactEditComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MailingListRoutingModule { }
