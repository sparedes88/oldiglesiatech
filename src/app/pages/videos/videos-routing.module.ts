import { AuthGuard } from './../../guards/guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VideosListComponent } from './videos-list/videos-list.component';
import { ManageVideosHomeComponent } from './manage-videos-home/manage-videos-home.component';
import { AdminOnlyGuard } from 'src/app/guards/admin-only.guard';
import { PlaylistStandaloneComponent } from './playlist-standalone/playlist-standalone.component';

const routes: Routes = [
  {
    path: '',
    component: ManageVideosHomeComponent,
    canActivate: [AuthGuard, AdminOnlyGuard],
  },
  {
    path: ':idOrganization/view/:idPlaylist',
    component: PlaylistStandaloneComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VideosRoutingModule { }
