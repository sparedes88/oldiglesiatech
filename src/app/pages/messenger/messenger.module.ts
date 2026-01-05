import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MessengerRoutingModule } from "./messenger-routing.module";
import { SenderComponent } from "./sender/sender.component";
import { ChatModule } from "src/app/component/chat/chat.module";
import { ChatsComponent } from "./chats/chats.component";
import { MatExpansionModule, MatIconModule, MatSnackBarModule } from "@angular/material";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxSmartModalModule } from "ngx-smart-modal";
import { MessageFormComponent } from './message-form/message-form.component';
import { LogComponent } from './log/log.component';
import { NgSelectModule } from "@ng-select/ng-select";
import { ChatLogDetailComponent } from './chat-log-detail/chat-log-detail.component';
import { ChatLogDashboardComponent } from './chat-log-dashboard/chat-log-dashboard.component';
import { InvoicesTableModule } from 'src/app/component/invoices-table/invoices-table.module';

@NgModule({
  declarations: [SenderComponent, ChatsComponent, MessageFormComponent, LogComponent, ChatLogDetailComponent, ChatLogDashboardComponent],
  imports: [
    CommonModule,
    MessengerRoutingModule,
    ChatModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    NgxSmartModalModule.forChild(),
    NgSelectModule,
    NgMultiSelectDropDownModule,
    InvoicesTableModule,
    MatExpansionModule
  ],
  bootstrap: [SenderComponent, ChatsComponent, MessageFormComponent, LogComponent, ChatLogDetailComponent, ChatLogDashboardComponent]
})
export class MessengerModule {}
