import { DesignRequestPlanningComponent } from './admin-design-request-planning/admin-design-request-planning.component';
import { DesignRequestHomeComponent } from './admin-design-request-home/admin-design-request-home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminDesignRequestDetailComponent } from './admin-design-request-detail/admin-design-request-detail.component';
import { SuperUserOnlyGuard } from 'src/app/guards/super-user-only.guard';

const routes: Routes = [
  {
    path: '',
    component: DesignRequestHomeComponent,
    canActivate: [SuperUserOnlyGuard]
  },
  {
    path: 'detail/:id',
    component: AdminDesignRequestDetailComponent,
    canActivate: [SuperUserOnlyGuard]
  },
  {
    path: 'planning',
    component: DesignRequestPlanningComponent,
    canActivate: [SuperUserOnlyGuard]
  },
  {
    path: ':idIglesia/list',
    component: DesignRequestHomeComponent
  },
  {
    path: ':idIglesia/list/detail/:id',
    component: AdminDesignRequestDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DesignRequestRoutingModule { }
