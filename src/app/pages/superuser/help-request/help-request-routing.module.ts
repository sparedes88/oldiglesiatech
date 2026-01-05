import { HelpRequestComponent } from './help-request.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SuperUserOnlyGuard } from 'src/app/guards/super-user-only.guard';

const routes: Routes = [{
  path: '',
  component: HelpRequestComponent,
  canActivate: [SuperUserOnlyGuard]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HelpRequestRoutingModule { }
