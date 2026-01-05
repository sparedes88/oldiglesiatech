import { EventEmitter, Injectable } from "@angular/core";
import * as Twilio from "twilio-chat";
import Client from "twilio-chat";
import { Channel } from "twilio-chat/lib/channel";
import { UserService } from "./user.service";
import { v4 as uuidv4 } from "uuid";
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { mergeMapTo } from 'rxjs/operators';
import { take } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs'
import { GroupsService } from "../../app/services/groups.service";
import { GroupModel, GroupCategoryModel } from "../../app/models/GroupModel";
import { ToastType } from "../../app/login/ToastTypes";
import { ApiService } from "src/app/services/api.service";
import {
  desktopNotification,
  requestNotificationPermission,
} from "../component/chat/desktop-notifications";
@Injectable({
  providedIn: "root",
})
export class ChatService {
  currentMessage = new BehaviorSubject(null);
  constructor(private currentUser: UserService, private angularFireDB: AngularFireDatabase,
    private angularFireAuth: AngularFireAuth,
    private angularFireMessaging: AngularFireMessaging,
    public groupService: GroupsService,
    private api: ApiService,
  ) {
    this.angularFireMessaging.messaging.subscribe(
      (_messaging) => {
        _messaging.onMessage(payload => {
          //console.log('Message received. ', payload);
        })
        _messaging.onMessage = _messaging.onMessage.bind(_messaging);
        _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
      }
    )
  }
  getGroups() {
    this.groupService.getGroups().subscribe(
      (data: any) => {
        this.groups = data.groups;
        this.totalGroups = this.groups.length;
        this.groups.forEach((value) => {
          this.getChannelByUniqueName('ChatGroup-' + value.idGroup + '-' + value.picture).then((channel: Channel) => {
          }).catch((reason) => {
            this.getGroup(value.idGroup)
          })
        })
      },
      (error) => {
        console.error(error);
        if (error.error.msg.Code === 404) {
          /*this.groupService.api.showToast(
            `There aren't groups yet.`,
            ToastType.info,
            `Nothing found.`
          );*/
        } else {
          /*this.groupService.api.showToast(
            `Something happened while trying to get organization's groups.`,
            ToastType.error
          );*/
        }
      }
    );
  }
  async getGroup(groupId: number) {
    await this.groupService.getGroupDetail(groupId)
      .subscribe((data: any) => {
        console.log(data.group)
        const detailedGroup: GroupModel = data.group
        var leaders: Array<any> = detailedGroup.leaders
        Array.prototype.push.apply(leaders, detailedGroup.members);
        this.createChannel('ChatGroup - ' + detailedGroup.title, false, 'ChatGroup-' + detailedGroup.idGroup + '-' + detailedGroup.picture)
          .then((channel: Channel) => {
            leaders.forEach((value) => {
              const identity = `${value.name} ${value.lastName} <${value.email}>`
              this.add_person(identity, channel).finally(() => {
                console.log("todos añadidos")
              })
            })
          }).catch((reason) => {
            this.getChannelByUniqueName('ChatGroup-' + detailedGroup.idGroup + '-' +
              detailedGroup.picture).then((channel2: Channel) => {
                channel2.join().then((value2)=>{
                  leaders.forEach((value) => {
                    const identity = `${value.name} ${value.lastName} <${value.email}>`
                    this.add_person(identity, channel2).finally(() => {
                      console.log("todos añadidos")
                    })
                  })
                }).catch((reason)=>{
                  console.log(reason)
                })
              }).catch((reason)=>{
                console.log(reason)
              })
            //console.log(reason)
          })
      }, error => {
        console.log(error)
      });
  }
  async add_person(identity, channel?: Channel, data?: any) {
    if (channel && identity) {
      channel.add(identity).then((response: any) => {
      }).catch((reason: any) => {
        if (reason.message != 'Member already exists' && reason.message != 'User unauthorized for command') {
          console.log("bucle")
          this.api
            .post(`chat`, {
              identity: identity,
              deviceId: "web",
            })
            .subscribe(
              (data: any) => {
                this.connectByEmail(data.token);
                this.add_person(identity, channel)
              },
              (err) => {
                console.error(err);
              }
            )
        }
        console.log(reason.message)
      })
    }
  }
  sendNotification(body) {
    const opts: NotificationOptions = {
      body: body,
      icon: "/assets/img/iglesiatechlogoblanco.png",
    };

    if (!document.hasFocus()) desktopNotification(`IglesiaTech`, opts);
  }
  // Chat data
  updateToken(userId, token) {
    // we can change this function to request our backend service
    this.angularFireAuth.authState.pipe(take(1)).subscribe(
      () => {
        const data = {};
        data[userId] = token
        this.angularFireDB.object('fcmTokens/').update(data)
      })
  }
  requestPermission(userId) {
    if (window != window.top) {
    } else {
      this.angularFireMessaging.requestToken.subscribe(
        (token) => {
          //console.log(token);
          this.fcm_token = token
          this.updateToken(userId, token);
        },
        (err) => {
          console.error('Unable to get permission to notify.');
        }
      );
    }
  }
  receiveMessage() {
    if (window != window.top) {
    } else {
      this.angularFireMessaging.messages.subscribe(
        (payload: any) => {
          //console.log("new message received. ", payload);
          this.currentMessage.next(payload);
          console.log(payload)
          this.sendNotification((String(payload.data.author).split(' <')[0] ? String(payload.data.author).split(' <')[0] : '')
            + (String(payload.data.channel_title).includes('- Group -') ||
              String(payload.data.channel_title).includes('ChatGroup -') ? '@' + payload.data.channel_title : '') + ': ' + payload.data.twi_body)
          this.chatClient.handlePushNotification(payload).then((value) => {
            //console.log(value)
          }).catch((reason) => {
            //console.log(reason)
          }).finally(() => {
            //console.log("finallu")
          });
        }, (error: any) => {
          //console.log(error)
        })
    }
  }
  public chatClient: Client;
  public currentChannel: Channel;
  public chatConnectedEmitter: EventEmitter<any> = new EventEmitter<any>();
  public chatDisconnectedEmitter: EventEmitter<any> = new EventEmitter<any>();
  public fcm_token
  public groups: GroupModel[] = [];
  public totalGroups: number;
  
  public connect(token) {
    // Twilio.Client.create(token)
    //   .then((client: Client) => {
    //     this.chatClient = client;
    //     this.fcm_token ? this.chatClient.setPushRegistrationId('fcm', this.fcm_token).then(() => {
    //     }).catch((reason) => {
    //     }) : this.requestPermission('user001')
    //     this.chatConnectedEmitter.emit(true);
    //     this.getGroups()
    //     this.getUserChannels().then((value) => {
    //     })
    //   })
    //   .catch((err: any) => {
    //     this.chatDisconnectedEmitter.emit(true);
    //     if (err.message.indexOf("token is expired")) {
    //       localStorage.removeItem("chatToken");
    //     }
    //   });
  }
  public connectByEmail(token) {
    Twilio.Client.create(token)
      .then((client: Client) => {
      })
      .catch((err: any) => {
      });
  }
  public getPublicChannels() {
    return this.chatClient.getLocalChannels({ criteria: 'lastMessage', order: 'descending' });
  }

  public getUserChannels() {
    return this.chatClient.getUserChannelDescriptors();
  }

  public getChannel(sid: string): Promise<Channel> {
    return this.chatClient.getChannelBySid(sid);
  }

  public getChannelByUniqueName(name: string): Promise<Channel> {
    console.log(name);
    console.log(this.chatClient);
    
    return this.chatClient.getChannelByUniqueName(name)
  }

  public createChannel(
    friendlyName: string,
    isPrivate: boolean = true,
    uniqueName = uuidv4()
  ) {
    return this.chatClient.createChannel({
      friendlyName: friendlyName,
      isPrivate: isPrivate,
      uniqueName: uniqueName,
    });
  }
}
