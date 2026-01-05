import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DudaSettingsComponent } from './duda-settings/duda-settings.component';
import { FrameComponent } from './frame/frame.component';
import { FrameSettingsComponent } from './frame-settings/frame-settings.component';

const routes: Routes = [
  {
    path: '',
    component: DudaSettingsComponent
  }, {
    path: 'frame',
    component: FrameComponent
  }, {
    path: 'add',
    component: FrameSettingsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SyncSiteRoutingModule { }
