import { DonationFormListComponent } from './donation-form-list/donation-form-list.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/guards/guard';

const routes: Routes = [{
  path: '',
  component: DonationFormListComponent
}];

//Sabes cómo se quita compartir pantalla? :'v
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormsRoutingModule { }
