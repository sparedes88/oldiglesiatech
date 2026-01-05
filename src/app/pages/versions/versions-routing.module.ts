import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VersionPanelManagerComponent } from './version-panel-manager/version-panel-manager.component';
import { VersionsHomeComponent } from './versions-home/versions-home.component';

const routes: Routes = [
  {
    path: '',
    component: VersionsHomeComponent
  },
  {
    path: ':idIdentifier',
    component: VersionPanelManagerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VersionsRoutingModule { }
