import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SuperUserOnlyGuard } from 'src/app/guards/super-user-only.guard';
import { ChatLogDashboardComponent } from './chat-log-dashboard/chat-log-dashboard.component';
import { ChatLogDetailComponent } from './chat-log-detail/chat-log-detail.component';
import { ChatsComponent } from './chats/chats.component';
import { LogComponent } from './log/log.component';

const routes: Routes = [
  {
    path: 'chats',
    redirectTo: 'log'
    // component: ChatsComponent
  },
  {
    path: 'log',
    component: LogComponent
  },
  {
    path: 'log/:idChatLog',
    component: ChatLogDetailComponent
  }, {
    path: 'dashboard',
    canActivate: [SuperUserOnlyGuard],
    component: ChatLogDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessengerRoutingModule { }
