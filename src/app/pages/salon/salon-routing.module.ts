import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SalonComponent } from './salon.component';
import { EditFormsalonComponent } from './edit-formsalon/edit-formsalon.component';

const routes: Routes = [
  {
    path: '',
    component: SalonComponent
  },
  {
    path: 'details/:id',
    component: EditFormsalonComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalonRoutingModule { }
