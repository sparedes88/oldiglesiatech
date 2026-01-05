import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RemoveAccountComponent } from './remove-account.component';

const routes: Routes = [
  {
    path: '',
    component: RemoveAccountComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RemoveAccountRoutingModule { }
