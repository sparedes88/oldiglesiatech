import { Component, OnInit, ViewChild } from "@angular/core";
import { ChatService } from "src/app/services/chat.service";
import { ApiService } from "src/app/services/api.service";
import { Channel } from "twilio-chat/lib/channel";
import { Message } from "twilio-chat/lib/message";
import { UserService } from "src/app/services/user.service";
import { fromEvent } from "rxjs";
import {
  desktopNotification,
  requestNotificationPermission,
} from "./desktop-notifications";
import { NgAudioRecorderService, OutputFormat } from 'ng-audio-recorder';
import { Member } from "twilio-chat/lib/member";
import { Paginator } from "twilio-chat/lib/interfaces/paginator";
@Component({
  selector: 'chat',
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"],
})
export class ChatComponent implements OnInit {
  constructor(
    private api: ApiService,
    private chatService: ChatService,
    private userService: UserService,
    private audioRecorderService: NgAudioRecorderService
  ) {
    // this.chatToken = localStorage.getItem("chatToken");
    requestNotificationPermission();
  }

  // Current user
  public currentUser: any = this.userService.getCurrentUser();

  // Data
  public chatToken: string;
  public isConnected: boolean = false;
  public isConnecting: boolean = false;
  public isGettingChannels: boolean = false;
  public channels: any[] = [];
  public channelObj: any;
  public chatMessage: string;
  public currentChannel: Channel;
  public typeObservable: any;
  public messages: Message[] = [];
  public currentUsername: string = `${this.currentUser.nombre} ${this.currentUser.apellido} <${this.currentUser.email}>`;
  public isMemberOfCurrentChannel: boolean = false;
  public membersTyping: any = [];
  public msg_media = []
  public photo: any;
  public file: File
  private conSub: any;
  private disconSub: any;
  public lastMessages = []
  public toggled: boolean = false;
  public timeout: any;
  public recording = false
  public recordingCounter = 0
  public recordingInterval
  public lastMessageConsumed = false
  public updateConsumption
  public membersSeen = ''
  public displayedMsg: any = [];
  public members = ''
  public toggleMembers = false
  public msgIndexShowed = -1
  public groupName = ''
  public contacts: any[] = [];
  public contactsInOrganization: any[] = [];
  public selectedContacts: any[] = [];
  public gettingMsg = false
  public lastMsgLoaded = 0
  public deletedChannelIndex = -1
  public checkingInterval
  public countingInterval = 0
  public are_sorted
  public identities = []
  public identityPics = []
  @ViewChild("chatElement") chatElement: any;
  @ViewChild("chatDisplay") chatDisplay: any;
  @ViewChild('chatBoxMain') filterDivRef: any;
  @ViewChild('container') cont: any;
  @ViewChild('boxes') boxes: any;
  public maxHeight = 0
  public count = 0
  ngOnInit() {
    this.isConnecting = true;
    this.getChatToken();
    this.chatService
    this.conSub = this.chatService.chatConnectedEmitter.subscribe(() => {
      this.count++
      this.isConnected = true;
      this.isConnecting = false;
      if (this.count == 1) {
        this.getChannels(86).finally(() => {
          this.updatePics()
          this.chatService.chatClient.on("channelAdded", (channel: Channel) => {
            //this.getChannels(89)
            var finded = false
            if (!this.isGettingChannels && this.channels.length != 0) {
              finded = this.channels.some((element) => {
                return element.sid != channel.sid
              })
              //console.log("Hay")
              //console.log(finded)
            }
            //console.log(channel)
            //console.log(finded)
            if (finded && !this.isGettingChannels) {
              //console.log(channel)
              this.getChannels(89).finally(() => {
                //console.log("terminadod")
                //console.log(this.channels)
                //const condition = (element) => element.sid == channel.sid;
                //this.channels[this.channels.findIndex(condition)]['descriptor'].unread_messages_count = 1
                //console.log(this.channels[this.channels.findIndex(condition)]['descriptor'].unread_messages_count)
                /*channel.updateLastConsumedMessageIndex(channel.lastMessage.index - 1 <= 0 ? 0 : channel.lastMessage.index - 1).then((value) => {
                  console.log(channel.lastMessage.index)
                  console.log("Actualizado")
                  console.log(value)
                })*/
                /*const channel1 = this.channels.find(
                  (c) => c.sid == channel.sid
                )
                if (channel1 == undefined) {
                  if (!this.currentChannel) {
                    this.getChannels(97)
                  }
                }*/
                this.updatePics()
                this.getMessageConsumption()
              });
              /*channel.getMessages().then((value) => {
                console.log(value)
                channel.updateLastConsumedMessageIndex(value.items[value.items.length - 2 <= 0 ? 0 : value.items.length - 2].index).then((msg) => {
                  console.log(msg)
                })
              })*/
            } else {
              //console.log("no")
            }
          });
          this.chatService.chatClient.on("channelUpdated", (channel: any) => {
            //console.log(channel)
            if (channel.updateReasons[0] = 'lastMessage') {
              const finded_channel = this.channels.find((chan) => chan.sid == channel.channel.sid)
              if (finded_channel) {
                if (!this.isGettingChannels && finded_channel.messagesCount != (channel.channel.state.lastMessage.index + 1)) {
                  //console.log(finded_channel.messagesCount)
                  //console.log((channel.channel.state.lastMessage.index + 1))
                  this.getChannels(104)
                  //this.encauseLoad()
                  this.getMessageConsumption()
                  if (this.currentChannel) {
                    if (this.currentChannel.sid == channel.channel.sid) {
                      this.currentChannel.setAllMessagesConsumed().finally(() => { })
                    }
                  }
                }
              }
            }
          });
          //this.chatService.chatClient.on("channelInfoUpdated", () => {});
          this.chatService.chatClient.on("channelRemoved", (channel: Channel) => {
            //console.log("canal removido")
            const condition = (element) => element.sid == channel.sid;
            //console.log(this.channels.findIndex(condition))
            //console.log(this.lastMessages.findIndex(condition))
            this.channels.splice(this.channels.findIndex(condition), 1)
            this.lastMessages.splice(this.lastMessages.findIndex(condition), 1)
            if (this.currentChannel && channel) {
              if (channel.sid == this.currentChannel.sid) {
                this.currentChannel = null
              }
            }
            //this.encauseLoad()
            //this.getChannels(142)
            //this.getMessageConsumption()
          });
          this.chatService.chatClient.on('channelInvited', (channel: Channel) => {
            console.log("invitado a nuevo canal")
            console.log(channel)

            /*channel.setNoMessagesConsumed().then((value)=>{
              console.log("todos los mensajes marcados como no leídos")
              console.log(value)
            })
            channel.advanceLastConsumedMessageIndex(0).then((value)=>{
              console.log("todos los mensajes marcados como no leídos")
              console.log(value)
            })*/
            this.getMessageConsumption()
            this.getChannels(131)
          })
          this.chatService.chatClient.on("tokenExpired", () => {
            // Clean previous token
            localStorage.removeItem("chatToken");
            this.chatToken = undefined;
            this.getChatToken();
          });
          /*this.chatService.chatClient.on("messageAdded", (msg: Message) => {
            if(this.currentChannel){
              if(msg.channel.sid == this.currentChannel.sid){
                console.log("verd")
                this.currentChannel.setAllMessagesConsumed().finally(()=>{console.log("final")})
              }
            }
          });*/
        })
      }
      this.getContacts()
    });

    this.disconSub = this.chatService.chatDisconnectedEmitter.subscribe(() => {
      this.isConnecting = false;
      this.isConnected = false;
    });
  }
  ngAfterViewInit(): void {
    if (this.cont) {
      //console.log(this.cont.nativeElement.offsetHeight);
      this.maxHeight = this.cont.nativeElement.offsetHeight
    }
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
  checkAct() {
    this.checkingInterval = setInterval(() => {
      if (this.lastMessages.length != this.channels.length && this.deletedChannelIndex >= 0) {
        this.lastMessages.splice(this.deletedChannelIndex, 1)
        this.countingInterval++
      } else {
        this.countingInterval = 0
      }
      if (this.countingInterval >= 5) {
        this.countingInterval = 0
        this.updateChannels(182)
      }
    }, 200)
  }
  updateChannels(reason?) {
    console.log(reason ? reason : '?')
    if (this.chatService.chatClient != undefined) {
      this.chatService.getUserChannels().then((channels: any) => {
        this.channelObj = channels
        this.channels = this.channelObj.items
        this.isGettingChannels = false
        this.getMessageConsumption()
        //this.encauseLoad()
      }).catch((err: any) => {
      })
    }
  }
  changeGroupName() {
    if (this.currentChannel) {
      this.currentChannel.updateUniqueName(this.currentChannel.uniqueName.substring(0, this.currentChannel.uniqueName.indexOf("- Group -"))
        + "- Group -" + this.groupName).then((channel: Channel) => {
          this.currentChannel.updateFriendlyName(this.currentChannel.uniqueName.substring(0, this.currentChannel.uniqueName.indexOf("- Group -"))
            + "- Group -" + this.groupName).then((channel1: Channel) => {
              this.enterChannel(channel.sid)
            }).finally(() => {
              this.getChannels(212)
            })
        })
    }
  }
  getMessageConsumption() {
    var lastMessage = this.messages[this.messages.length - 1]
    if (lastMessage && this.currentChannel) {
      if (this.currentChannel.lastConsumedMessageIndex == lastMessage['state'].index) {
        this.currentChannel.getMembers().then((members: any[]) => {
          var count = 0
          if (lastMessage && members.length > 1) {
            members.forEach((member, index) => {
              if (member.state.lastConsumedMessageIndex) {
                if (member.state.lastConsumedMessageIndex == lastMessage['state'].index) {
                  count++
                }
              }
            })
          }
          if (count >= members.length) {

            this.lastMessageConsumed = true
          } else {
            this.lastMessageConsumed = false
          }
        })
      }
    }

  }
  async getMessageConsumptionById(id: number) {
    var lastMessage = this.messages[id]
    var membersSeen = []
    var consumed = false
    if (lastMessage && this.currentChannel) {
      this.currentChannel.getMembers().then((members: any[]) => {
        var count = 0
        if (lastMessage) {
          members.forEach((member, index) => {
            if (member.state.lastConsumedMessageIndex >= lastMessage['state'].index) {
              count++
              membersSeen.push(String(member.state.identity).substring(0, String(member.state.identity).indexOf('<')))
            }
          })
        }
        if (count >= members.length - 1) {
          consumed = true
        } else {
          consumed = false
        }
      }).finally(() => {
        this.membersSeen = membersSeen.join(', ')
        /**this.showSeenAlert()**/
      })
    }
  }
  async getMessageConsumptionByIdToggle(id: number) {
    var lastMessage = this.messages[id]
    this.displayedMsg[id] = !this.displayedMsg[id]
    var membersSeen = []
    var consumed = false
    if (lastMessage && this.currentChannel) {
      this.currentChannel.getMembers().then((members: any[]) => {
        var count = 0
        if (lastMessage) {
          members.forEach((member, index) => {
            if (member.state.lastConsumedMessageIndex >= lastMessage['state'].index) {
              count++
              membersSeen.push(String(member.state.identity).substring(0, String(member.state.identity).indexOf('<')))
            }
          })
        }
        if (count >= members.length - 1) {
          consumed = true
        } else {
          consumed = false
        }
      }).finally(() => {
        this.membersSeen = membersSeen.join(', ')
        /**this.showSeenAlert()**/
      })
    }
  }
  updateParticipants() {
    if (this.currentChannel) {
      this.currentChannel.getMembers().then((response: Array<any>) => {
        var identities = response.map(function (item) {
          return String(item['state']['identity']).substring(0, String(item['state']['identity']).indexOf(' <'));
        });
        this.members = identities.join(', ')
      })
    }
  }
  capitalize() {
    if (this.chatMessage.length == 1) {
      this.chatMessage = this.chatMessage.charAt(0).toUpperCase() + this.chatMessage.slice(1)
    }
  }
  toogleStyle(flag): object {
    return {
      "max-height": (flag ? "250px" : "150px"),
      "position": "absolute",
      "z-index": 1,
      "width": "96%",
      "pointer-events": "fill"
    }
  }
  toogleStyle1(): object {
    return {
      "max-height": "100px",
      "position": "absolute",
      "z-index": 1,
      "width": "96%",
      "pointer-events": "fill"
    }
  }

  async getChannels(meta?) {
    if (meta) {
      console.log(meta)
    }
    this.isGettingChannels = true;
    await this.chatService.getUserChannels().then((channels: any) => {
      this.channelObj = channels;
      this.channels = [...this.channelObj.items];
      //console.log(this.channels)
      this.chatService.getPublicChannels().then((local_channels: Channel[]) => {
        /*local_channels[0].getMessages(1).then((value: Paginator<Message>) => {
          console.log(value.items)
        })*/
        var sortOrder = local_channels.map((m) => { return m.sid })
        this.channels = this.channels.sort(function (a, b) {
          return sortOrder.indexOf(a.sid) - sortOrder.indexOf(b.sid);
        });
      }).finally(() => {
        this.encauseLoad().finally(() => { });
        this.isGettingChannels = false;
      })
    });
  }
  clicTog() {
    $('.action_menu').toggle();
  }
  updatePics() {
    //Se puede usar para actualizar el arreglo de identityPics cuando se entra a un grupo
    const result = this.channels.filter(value => !String(value.uniqueName).includes('ChatGroup-') &&
      !String(value.uniqueName).includes('- Group -') &&
      !String(value.uniqueName).includes('group-') && String(value.uniqueName).split('-').length == 3
    )
    var names = result.map((value) => {
      var temp = String(value.uniqueName).split('-')
      var temp1 = [temp[1], temp[2]]
      var idx = temp1.findIndex(p => p != this.currentUser.email);
      var temp3 = temp1.splice(idx, 1);
      return temp3[0]
    })
    var def = names.filter(value => value != 'undefined').sort()

    if (!this.arraysEqual(def, this.identities)) {
      this.identities = def
      this.api.get(`users/getUsersPicByList`,
        {
          list: def
        })
        .subscribe(
          (data: any) => {
            this.identityPics = data.users
          },
          error => {
            console.log(error)
          },
          () => { }
        );
    }
  }
  arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.

    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  addPersonsToGroup() {
    if (this.currentChannel) {
      this.selectedContacts.forEach((id) => {
        const filtered = this.contacts.find(value => value.idUsuario == id)
        this.add_person(`${filtered.name} <${filtered.email}>`, this.currentChannel).finally(() => {
        })
      })
      this.selectedContacts = []
      this.updateParticipants()
      this.getAvailableContacts()
    }
  }
  async add_person(identity, channel?: Channel, data?: any) {
    if (channel && identity) {
      channel.add(identity).then((response: any) => {
      }).catch((err: any) => {
        this.api
          .post(`chat`, {
            identity: identity,
            deviceId: "web",
          })
          .subscribe(
            (data: any) => {
              this.chatService.connectByEmail(data.token);
              this.add_person(identity, channel)
            },
            (err) => {
              console.error(err);
            }
          );
      })
    }
  }
  getContacts() {
    this.api
      .get(`getUsuarios`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (contacts: any) => {
          contacts.usuarios.map((u) => {
            u.group = "All";
            u.name = `${u.nombre} ${u.apellido}`;
            u.identity = `${u.nombre} ${u.apellido} <${u.email}>`;
          });
          this.contactsInOrganization = contacts.usuarios;
        },
        (err) => console.error(err)
      );
  }
  getAuthorInfo(identity: string) {
    var res_user = this.contactsInOrganization.find((u) => u.identity == identity)
    var photo_url = undefined
    if (res_user) {
      photo_url = res_user.foto ? res_user.foto : null
    }
    return { photo_url }
  }
  loadData(index) {
    this.gettingMsg = true
    if (this.messages[0].index != 0 && this.currentChannel) {
      let msgCount = (this.messages[0].index - 100) >= 0 ? 100 : this.messages[0].index - 1
      let msgIndex = (this.messages[0].index - 100) >= 0 ? this.messages[0].index - 100 : 0
      this.currentChannel.getMessages(msgCount, msgIndex, 'forward').then((messages: any) => {
        var nextMessages = []
        nextMessages = messages.items
        for (var i = nextMessages.length - 1; i >= 0; i--) {
          this.messages.unshift(nextMessages[i])
        }

      }).finally(() => {
        let yOffset = document.getElementById('msg' + index).offsetTop;
        this.scroll(document.getElementById('msg' + index))
        this.lastMsgLoaded = yOffset
      })
    }
  }
  scroll(el: HTMLElement) {
    el.scrollIntoView();
  }
  getAvailableContacts() {
    this.api
      .get(`getUsuarios`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (contacts: any) => {
          contacts.usuarios.map((u) => {
            u.group = "All";
            u.name = `${u.nombre} ${u.apellido}`;
          });
          var identities = []
          var filteredContacts = []
          this.currentChannel.getMembers().then((response: Array<Member>) => {
            identities = response.map(function (item) {
              return String(item['state']['identity']);
            });
            this.contacts = contacts.usuarios;
            this.contacts.forEach((value) => {
              if (!identities.includes(`${value.name} <${value.email}>`)) {
                filteredContacts.push(value)
              }
            })
            this.contacts = filteredContacts
          })
        },
        (err) => console.error(err)
      );
  }
  leaveChannel() {
    if (this.typeObservable) {
      this.typeObservable.unsubscribe();
    }
    if (this.currentChannel) {
      this.messages = []
      this.chatMessage = this.currentUsername + " has left the chat"
      this.sendMessage()
      this.chatMessage = ""
      //this.currentChannel.sendMessage(this.user.first_name + " " + this.user.last_name + " leave the chat").then((message: Number) => {
      return this.currentChannel.leave().then((channel: Channel) => {
        this.channels = this.channels.filter((value) => {
          value['sid'] != channel.sid
        })
        channel.removeAllListeners('messageAdded')
        channel.removeAllListeners('typingStarted')
        channel.removeAllListeners('typingEnded')
        this.getChannels(472)
      })
      //})
    } else {
      return Promise.resolve()
    }
  }

  enterChannel(sid: string) {
    this.messages = [];
    this.membersTyping = [];

    // Clean subcribers
    if (this.currentChannel) {
      this.currentChannel.removeAllListeners("messageAdded");
      this.currentChannel.removeAllListeners("typingStarted");
      this.currentChannel.removeAllListeners("typingEnded");
    }

    if (this.boxes) {
      //console.log(this.boxes);
    }
    this.chatService.getChannel(sid).then((channel) => {
      this.currentChannel = channel;
      this.currentChannel
        .join()
        .then((r) => {
          this.initChannel();
        })
        .catch((e) => {
          if (e.message.indexOf("already exists") > 0) {
            this.initChannel();
          }
        });
    });
  }
  deleteChannel() {
    if (this.typeObservable) {
      this.typeObservable.unsubscribe()
    }
    if (this.currentChannel) {
      this.messages = []
      const condition = (element) => element.sid == this.currentChannel.sid;
      const index = this.channels.findIndex(condition)
      this.deletedChannelIndex = index
      this.currentChannel.delete().then((channel: Channel) => {
        channel.removeAllListeners('messageAdded')
        channel.removeAllListeners('typingStarted')
        channel.removeAllListeners('typingEnded')
        this.currentChannel = undefined
        if (index > -1) {
          this.lastMessages.splice(index, 1);
        }
      }).catch((reason) => {
      })
    }
  }
  getChannelName(friendlyName: String, uniqueName?) {
    if (friendlyName.includes('- Group -')) {
      const str = (friendlyName.split('- Group -')[1])
      return ('Group - ' + str.substring((/[a-z]/i.exec(str).index))).trim()
    } else if (friendlyName.includes('ChatGroup -')) {
      const str = (friendlyName.split('ChatGroup -')[1])
      return str
    } else {
      var str = friendlyName.replace(this.currentUser.iglesia, '').replace(this.currentUser.nombre + ' ' + this.currentUser.apellido, '')
      str = str.substring((/[a-z]/i.exec(str).index))
      str = str.includes('-') ? str.substring(0, str.lastIndexOf('-')).trim() : str.trim()
      return str.includes('-') ? str.substring(str.indexOf('-') + 1).trim() : str.trim()
    }
  }
  getChannelPhotoURL(friendlyName: String, uniqueName?: String) {
    if (friendlyName.includes('- Group -')) {
      return 'assets/img/Logo-BusinessTech-01.jpg'
    } else if (friendlyName.includes('ChatGroup-')) {
      var subs = friendlyName.substring(friendlyName.indexOf('ChatGroup-') + 1)
      subs = subs.substring(subs.lastIndexOf('-') + 1)
      return this.fixUrl(subs)
    } else {
      var str = friendlyName.replace(this.currentUser.iglesia, '').replace(this.currentUser.email, '')
      str = str.substring((/[a-z]/i.exec(str).index))
      str = str.substring(0, str.lastIndexOf('-') == -1 ? str.length : str.lastIndexOf('-')).trim()
      const contact = this.identityPics.find(element => element.email == str)
      var url = ''
      if (contact) {
        if (contact.foto) {
          url = this.fixUrl(contact.foto)
        } else {
          url = 'assets/img/img_avatar.png'
        }
      } else {
        url = 'assets/img/img_avatar.png'
      }
      return url
    }
  }
  loadMessages() {
    this.currentChannel.getMessages().then((messages: any) => {
      this.messages = messages.items;

      const el = this.chatDisplay.nativeElement;
      this.messages.forEach((value, index) => {
        if (value.type === 'media') {
          var temp = value.media.getContentUrl().then(function (url) {
            return url
          });
          temp.then((url) => {
            this.msg_media[index] = {
              value: url,
              name: (value.media.filename),
              type: value.media.contentType,
              size: (((value.media.size) / 1024) / 1024).toString().substring(0, 4)
            }
          })
        } else {
          this.msg_media[index] = {
            value: value['state']['body'],
            name: value['state']['body'],
            type: "text",
            size: 0
          }
        }
      })
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
        this.setMessagesAsRead();
      });
    });
  }
  public async loadMessagesBySid(sid: string, index: number) {
    this.chatService.getChannel(sid).then((channel: Channel) => {
      channel.getMessages(1).then((messages: any) => {
        var subcadena = ''
        var timestamp = channel.dateCreated
        var author = ''
        if (messages.items[messages.items.length - 1]) {
          timestamp = messages.items[messages.items.length - 1].state.timestamp
          author = ((String(messages.items[messages.items.length - 1].state.author) == this.currentUsername) ? ('You: ') : '')
          if (messages.items[messages.items.length - 1].state.media) {
            subcadena = String(messages.items[messages.items.length - 1].state.media.state.filename)
          } else {
            subcadena = String(messages.items[messages.items.length - 1].state.body)
          }
        }
        this.lastMessages[index] = {
          cadena: subcadena,
          author: author,
          sid: sid,
          timestamp: timestamp,
          is_today: this.isToday(timestamp)
        }
        /*this.channels[index].cadena = subcadena
        this.channels[index].author = author
        this.channels[index].timestamp = timestamp
        this.channels[index].is_today = this.isToday(timestamp)*/
        /*if (this.lastMessages.length == this.channels.length || !this.are_sorted) {
          this.lastMessages = this.lastMessages.sort(function (x, y) {
            return y.timestamp- x.timestamp;
          })
          var sortOrder = this.lastMessages.map((m)=>{
            return m.sid
          });
          this.channels = this.channels.sort(function (a, b) {
            return sortOrder.indexOf(a.sid) - sortOrder.indexOf(b.sid);
          });
          this.are_sorted = true
          console.log("están listos")
        }*/
      })
    })
  }
  isToday(timestamp) {
    var ts = timestamp
    var today = new Date().setHours(0, 0, 0, 0);
    var thatDay = new Date(ts).setHours(0, 0, 0, 0);
    if (today === thatDay) {
      return true
    } else {
      return false
    }
  }
  fixUrl(url: string) {
    if (url) {
      if (url.includes('https')) {
        return url;
      } else {
        // return `${environment.serverURL}/${url}`;
        return `https://iglesia-tech-api.e2api.com${url}`;
      }
    } else {
      return 'assets/img/default-image.jpg';
    }
  }
  sendLike() {
    var unicodeToStr = '👍'
    this.currentChannel.sendMessage(unicodeToStr).then((val) => {
      this.setMessagesAsRead(parseInt(val + ''))
    })
  }
  minutes(seconds) {
    return parseInt(seconds / 60 + "") + ":" + String(parseInt(seconds % 60 + "")).padStart(2, "0")
  }
  startRecording() {
    this.recording = true
    this.audioRecorderService.startRecording();
    this.recordingInterval = setInterval(() => {
      this.recordingCounter++
    }, 1000);
  }
  stopRecording() {
    this.audioRecorderService.stopRecording(OutputFormat.WEBM_BLOB).then((output: Blob) => {
      this.file = new File([output], "audio-record-" + this.makeid(6) + ".webm", { type: "audio/webm" });
      this.recording = false
      this.recordingCounter = 0
      clearInterval(this.recordingInterval)
    }).catch(errrorCase => {
    });
  }
  public makeid(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  async encauseLoad() {
    for (var i = 0; i < this.channels.length; i++) {
      this.loadMessagesBySid(this.channels[i]['descriptor']['channel_sid'], i)
      if (this.lastMessages.includes(null)) {
        i--
      }
    }
  }
  public filter_messages(index: number) {
    if (this.lastMessages.length != 0) {
      var authorName = String(this.lastMessages[index].author) == this.currentUser.email ? ('You: ') : ''
      return { cadena: String(this.lastMessages[index].cadena), author: authorName }
    } {
      return { cadena: ("Charging"), author: ("Charging") }
    }
  }
  consolelog(pasteEvent) {
    var item = pasteEvent.clipboardData.items[0];
    if (item.type.indexOf("image") === 0) {
      var blob = item.getAsFile()
      if (((blob.size) / 1024) / 1024 <= 10) {
        this.file = blob
      } else {
        this.api.showToast(("The file size must not exceed 10MB"), 4000)
      }
    } else {
      if (item.type.indexOf("text") === 0) {

      } else {
        this.api.showToast(("The file must be an image"), 4000)
      }
    }
  }
  loadImageFromDevice(event) {
    const file = event.target.files[0];
    if (((file.size) / 1024) / 1024 <= 10) {
      this.file = file
    } else {
      this.api.showToast(("The file size must not exceed 10MB"), 4000)
    }
  };
  removeFile() {
    this.file = null
  }
  initChannel() {
    this.typeObservable = fromEvent(
      this.chatElement.nativeElement,
      "keyup"
    ).subscribe(() => {
      this.typing();
    });
    this.updateParticipants()
    this.getAvailableContacts()
    this.groupName = this.currentChannel.uniqueName.split("- Group -")[1]
    this.currentChannel.on("messageAdded", (m) => {
      if (m.type === 'media') {
        var temp = m.media.getContentTemporaryUrl().then(function (url) {
          return url
        });
        temp.then((url) => {
          this.msg_media.push({
            value: url,
            name: (m.media.filename),
            type: m.media.contentType,
            size: (((m.media.size) / 1024) / 1024).toString().substring(0, 4)
          })
        })
      } else {
        this.msg_media.push({
          value: m['state']['body'],
          name: m['state']['body'],
          type: "text",
          size: 0
        })
      }
      this.setMessagesAsRead()
      !this.messages.includes(m) ? this.messages.push(m) : null
      this.displayedMsg.push(false)
      const el = this.chatDisplay.nativeElement;
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      });
    });
    this.currentChannel.on("typingStarted", (m) => {
      this.membersTyping.push(m);
    });
    this.currentChannel.on("typingEnded", (m) => {
      const mIdx = this.membersTyping.findIndex(
        (mem) => mem.identity === m.identity
      );
      this.membersTyping = this.membersTyping.splice(mIdx, 0);
    });
    this.currentChannel.on('memberUpdated', (m) => {
      this.lastMessageConsumed = false
      this.getMessageConsumption()
      this.updatePics()
    })
    this.currentChannel.on('memberLeft', (m) => {
      this.updateParticipants()
      this.getAvailableContacts()
    })
    this.currentChannel.on('memberAdded', (m) => {
      this.updateParticipants()
      this.getAvailableContacts()
      this.updatePics()
    })
    // load messages
    this.loadMessages();

    // Clean message counter
    const targetChannel = this.channels.find(
      (c) => c.sid == this.currentChannel.sid
    );
    targetChannel["descriptor"]["unread_messages_count"] = null;
    let yOffset = document.getElementById('boxes').offsetHeight;
    //console.log(yOffset)
  }

  typing() {
    this.currentChannel.typing();
  }

  whosTyping() {
    return this.membersTyping
      .map((m) => {
        if (m.identity !== this.currentUsername) {
          return m.identity;
        }
      })
      .join(", ");
  }

  sendMessage(msg?) {
    this.chatMessage.startsWith('\n') ? this.chatMessage = this.chatMessage.replace('\n', '') : null
    this.chatMessage.endsWith('\n') ? this.chatMessage = this.chatMessage.replace('\n', '') : null
    if (this.chatMessage.length > 0 || this.file) {
      if (this.chatMessage.length > 0) {
        this.currentChannel.sendMessage(this.chatMessage).then((idx) => {
          this.setMessagesAsRead(parseInt(idx + ''));
        });
      }
      if (this.file != undefined) {
        this.sendFile()
      }
      this.chatMessage = ''
      this.setMessagesAsRead()
    }
  }
  sendFile() {
    if (this.file) {
      if (((this.file.size) / 1024) / 1024 <= 10) {
        const formData = new FormData();
        formData.append('file', this.file);
        this.currentChannel.sendMessage(formData).then((val) => {
          this.setMessagesAsRead(parseInt(val + ''))
        }).finally(() => {
          this.loadMessages()
          this.file = null
        }).catch((err) => {
        });

      } else {
        this.api.showToast(("The file size must not exceed 10MB"), 4000)
      }
    }
  }
  createChannel() {
    this.chatService.createChannel(
      `Channel ${this.channels.length + 1}`,
      false
    );
    return false;
  }

  ngOnDestroy() {
    this.conSub.unsubscribe();
    this.disconSub.unsubscribe();
  }

  playNotificationSound() {
    if (!document.hasFocus()) {
      const audio = new Audio("/assets/beyond-doubt.ogg");
      audio.play();
    }
  }
  isValidHttpUrl(string) {
    let url;

    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  }
  handleSelection(event) {
    this.chatMessage = (this.chatMessage ? this.chatMessage : '') + event.char;
  }
  stringify(value: any, msg_index: number) {
    var url_img = ''
    value.getContentTemporaryUrl().then(function (url) {
      // log media temporary URL
      url_img = url
      this.msg_media[msg_index] = url
    });
  }
  sendNotification(message: Message) {
    const opts: NotificationOptions = {
      body: `${message.author}: ${message.body}`,
      icon: "/assets/img/iglesiatechlogoblanco.png",
    };

    if (!document.hasFocus()) desktopNotification(`SAMSON`, opts);
  }

  handleIncomingMessage(message: Message) {
    const targetChannel = this.channels.find(
      (c) => c.sid == message.channel.sid
    );
    if (targetChannel && !this.currentChannel) {
      if (
        targetChannel.descriptor &&
        targetChannel.descriptor.unread_messages_count
      ) {
        targetChannel["descriptor"]["unread_messages_count"] += 1;
      } else {
        targetChannel["descriptor"]["unread_messages_count"] = 1;
      }

      // If window is unfocused play sound
      this.playNotificationSound();
      this.sendNotification(message);
      this.getChannels(924)
    }
  }

  async setMessagesAsRead(index?: number) {
    // Set Messages as read
    await this.currentChannel.updateLastConsumedMessageIndex(
      index || (this.messages.slice(-1)[0] ? this.messages.slice(-1)[0].index : 0)
    )
    const condition = (element) => element.sid == this.currentChannel.sid;
    const c_index = this.channels.findIndex(condition)
    this.channels[c_index]['descriptor'].unread_messages_count = 0
    const el = this.chatDisplay.nativeElement;
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 500);
  }
  async getUnreadMessagesPromise(sid) {
    let count: number = 0;
    let channel: Channel
    try {
      channel = await this.chatService.getChannel(sid)
      const tempCount = await channel.getUnconsumedMessagesCount()
      count = tempCount == null ? await channel.getMessagesCount() : tempCount
      return count
    } catch (e) {
      count = 1
      return count
    }
  }
  getUnreadMessages(channel: any) {
    let count: number = 0;
    count = channel["descriptor"].unread_messages_count == null ? channel.messagesCount : channel["descriptor"].unread_messages_count;

    if (count) return count;
  }
}
