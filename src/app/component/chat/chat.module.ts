import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ChatComponent } from "./chat.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MessagesCounterComponent } from './messages-counter/messages-counter.component';
import { HttpClientModule } from '@angular/common/http';
import { NgxEmojiPickerModule } from 'ngx-emoji-picker';
import {
  NgAudioRecorderModule,
  NgAudioRecorderService
} from 'ng-audio-recorder';
import { NgSelectModule } from "@ng-select/ng-select";

@NgModule({
  declarations: [ChatComponent, MessagesCounterComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgxEmojiPickerModule,
    NgAudioRecorderModule,
    NgSelectModule
  ],
  providers: [NgAudioRecorderService],
  exports: [ChatComponent, MessagesCounterComponent],
  bootstrap: [ChatComponent, MessagesCounterComponent]
})
export class ChatModule { }
