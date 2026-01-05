import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventFormV2Component } from './event-form-v2/event-form-v2.component';


const routes: Routes = [
  // {
  //   path: '',
  //   component: ListComponent
  // },
  {
    path: 'form',
    component: EventFormV2Component
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventsRoutingModule { }
