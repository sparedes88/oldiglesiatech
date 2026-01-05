import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from './list/list.component';
import { DetailsComponent } from './details/details.component';
import { CategoriesComponent } from './categories/categories.component';
import { CategoryDetailComponent } from './category-detail/category-detail.component';
import { EventsListComponent } from './events-list/events-list.component';
import { TeamListComponent } from './team-list/team-list.component';
import { EventDetailsComponent } from './event-details/event-details.component';

const routes: Routes = [
  {
    path: '',
    component: ListComponent
  },
  {
    path: 'teams',
    component: TeamListComponent
  },
  {
    path: 'details/:id',
    component: DetailsComponent
  },
  {
    path: 'categories',
    component: CategoriesComponent
  },
  {
    path: 'categories/details/:id',
    component: CategoryDetailComponent
  },
  {
    path: 'events',
    component: EventsListComponent
  },
  {
    path: 'events/v2',
    loadChildren: '../events/events.module#EventsModule'
  },
  {
    path: 'events/detail/:id',
    component: EventDetailsComponent
  },
  {
    path: 'reports',
    // canActivate: [AuthGuard],
    loadChildren: "../groups-report/groups-report.module#GroupsReportModule"
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupsRoutingModule { }
