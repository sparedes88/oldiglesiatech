import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PublicTimeSheetHomeComponent } from './public-time-sheet-home/public-time-sheet-home.component';

const routes: Routes = [{
  path: '',
  component: PublicTimeSheetHomeComponent
},
{
  path: ':idIglesia/list',
  component: PublicTimeSheetHomeComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicTimeSheetRoutingModule { }
