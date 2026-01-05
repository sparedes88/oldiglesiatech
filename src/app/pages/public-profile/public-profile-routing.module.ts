import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DirectoryComponent } from './directory/directory.component';
import { ProfileComponent } from './profile/profile.component';
import { BuilderComponent } from './builder/builder.component';
import { AuthGuard } from 'src/app/guards/guard';

const routes: Routes = [
  {
    path: '',
    component: DirectoryComponent,
  },
  {
    path: 'profile/:id',
    component: ProfileComponent,
    data: { hideNavigation: true }
  },
  {
    path: 'profile/:id/:slug',
    component: ProfileComponent,
    data: { hideNavigation: true }
  },
  {
    path: 'profile/:id/:slug/:sub_page',
    component: ProfileComponent,
    data: { hideNavigation: true }
  },
  {
    path: 'builder/:id',
    component: BuilderComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicProfileRoutingModule { }
