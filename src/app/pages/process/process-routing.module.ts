import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from './list/list.component';
import { DetailsComponent } from './details/details.component';
import { BuilderComponent } from './builder/builder.component';
import { RegisterViaQRComponent } from './register-via-qr/register-via-qr.component';
import { AdminOnlyGuard } from 'src/app/guards/admin-only.guard';
import { AuthGuard } from 'src/app/guards/guard';

const routes: Routes = [
  {
    path: '',
    component: BuilderComponent,
    canActivate: [AuthGuard, AdminOnlyGuard],
  },
  {
    path: 'list',
    component: ListComponent,
    canActivate: [AuthGuard, AdminOnlyGuard],
  },
  {
    path: 'details/:id',
    component: DetailsComponent,
    canActivate: [AuthGuard, AdminOnlyGuard],
  },
  {
    path: 'register',
    component: RegisterViaQRComponent
  },
  {
    path: 'builder',
    component: BuilderComponent,
    canActivate: [AuthGuard, AdminOnlyGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProcessRoutingModule { }
