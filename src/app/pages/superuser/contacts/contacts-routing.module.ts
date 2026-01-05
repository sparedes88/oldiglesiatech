import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContactsHomeComponent } from './contacts-home/contacts-home.component';

const routes: Routes = [
  {
    path: '',
    component: ContactsHomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactsRoutingModule { }
