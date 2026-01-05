import { ApiService } from './../../../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-log-detail',
  templateUrl: './chat-log-detail.component.html',
  styleUrls: ['./chat-log-detail.component.scss']
})
export class ChatLogDetailComponent implements OnInit {

  idChatLog: number;
  chat_log: any;

  constructor(
    private activated_route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) {
    this.idChatLog = this.activated_route.snapshot.params.idChatLog;
  }

  ngOnInit() {
    this.getDetail();
  }

  async getDetail() {
    const response: any = await this.api.get(`chat/log/${this.idChatLog}`, {}).toPromise();
    if (response) {
      this.chat_log = response;
    }
  }

  dismiss() {
    this.router.navigateByUrl('/messenger/log');
  }

}
