import { Component, OnInit } from "@angular/core";
import { Channel } from "twilio-chat/lib/channel";
import { ChatService } from "src/app/services/chat.service";
import { ApiService } from "src/app/services/api.service";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { Message } from "twilio-chat/lib/message";
import {
  requestNotificationPermission,
  desktopNotification,
} from "../desktop-notifications";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "messages-counter",
  templateUrl: "./messages-counter.component.html",
  styleUrls: ["./messages-counter.component.scss"],
})
export class MessagesCounterComponent implements OnInit {
  constructor(
    private chatService: ChatService,
    private userService: UserService,
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    requestNotificationPermission();
  }

  currentUrl: string;

  public currentUser: any = this.userService.getCurrentUser();
  public chatToken: string;
  public isConnected: boolean = false;
  public isConnecting: boolean = false;
  public isGettingChannels: boolean = false;
  public channels: any[] = [];
  public channelObj: any;
  public totalUnread: number = 0;
  public currentUsername: string = `${this.currentUser.nombre} ${this.currentUser.apellido} <${this.currentUser.email}>`;

  private conSub: any;
  private disconSub: any;
  public count =0
  ngOnInit() {
    this.isConnecting = true;
    this.getChatToken();

    this.conSub = this.chatService.chatConnectedEmitter.subscribe(() => {
      this.count++
      this.isConnected = true;
      this.isConnecting = false;
      this.getChannels().finally(()=>{
        if (this.count==1) {
          this.chatService.chatClient.on("channelAdded", () => {
            this.getChannels();
          });
          this.chatService.chatClient.on("channelRemoved", () => {
            this.getChannels();
          });
          this.chatService.chatClient.on("channelUpdated", () => {
            this.getChannels();
          });
          this.chatService.chatClient.on("tokenExpired", () => {
            // Clean previous token
            localStorage.removeItem("chatToken");
            this.chatToken = undefined;
            this.getChatToken();
          });
          this.chatService.chatClient.on("messageAdded", (msg: Message) => {
            this.handleIncomingMessage(msg);
            this.getChannels()
          });
        }
      })
    });

    this.disconSub = this.chatService.chatDisconnectedEmitter.subscribe(() => {
      this.isConnecting = false;
      this.isConnected = false;
    });
  }

  getChatToken() {
    if (this.chatToken) {
      this.chatService.connect(this.chatToken);
    }

    this.api
      .post(`chat`, {
        identity: this.currentUsername,
        deviceId: "web",
      })
      .subscribe(
        (data: any) => {
          localStorage.setItem("chatToken", data.token);
          this.chatToken = data.token;
          this.chatService.connect(this.chatToken);
        },
        (err) => {
          console.error(err);
        }
      );
  }
  async getChannels() {
    this.isGettingChannels = true;
    if (this.currentUser) {
      await this.chatService.getUserChannels().then((channels: any) => {
        this.channelObj = channels;
        this.channels = this.channelObj.items;
        this.isGettingChannels = false;

        let total: number = 0;
        this.channels.map((chan) => {

          if (chan.descriptor.unread_messages_count) {
            total += chan.descriptor.unread_messages_count;
          }
        });
        this.totalUnread = total;
      }).catch(error => {
      });
    } else {
      this.isGettingChannels = false;
    }
  }

  handleIncomingMessage(message: Message) {

    if (
      message.author !== this.currentUser.username &&
      this.currentUrl !== "/messenger/chats"
    ) {
      this.playNotificationSound();
    }
  }

  ngOnDestroy() {
    this.disconnectChat();
  }

  playNotificationSound() {
    const audio = new Audio("/assets/beyond-doubt.ogg");
    audio.play();
  }

  sendNotification(message: Message) {
    const opts: NotificationOptions = {
      body: `${message.author}: ${message.body}`,
      icon: "/assets/icons/android-icon-48x48.png",
    };
    //desktopNotification(`SAMSON`, opts);
  }

  disconnectChat() {
    try {
      this.conSub.unsubscribe();
      this.disconSub.unsubscribe();
      this.chatService.chatClient.shutdown();
      this.chatService.chatClient.removeAllListeners();
      this.totalUnread = null;
    } catch { }
  }
}
