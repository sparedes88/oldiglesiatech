import { EzlinkHomeComponent } from './ezlink-home/ezlink-home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        component: EzlinkHomeComponent
    },
    {
        path: ':id_or_unique',
        component: EzlinkHomeComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EzlinkRoutingModule { }
