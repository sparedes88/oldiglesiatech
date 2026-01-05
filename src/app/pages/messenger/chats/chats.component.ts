import { ChatComponent } from './../../../component/chat/chat.component';
import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-chats-2',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent implements OnInit {

  constructor() { }
  chatDisplay: ChatComponent
  ngOnInit() {
  }

}
