import { SimpleMemberFormComponent } from './../../contact/simple-member-form/simple-member-form.component';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  CalendarDateFormatter,
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarUtils,
  CalendarView,
} from 'angular-calendar';
import { DataTableDirective } from 'angular-datatables';
import * as moment from 'moment';
import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { Subject, Observable, Subscription } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { random_color } from 'src/app/models/Utility';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';

import { ToastType } from './../../../login/ToastTypes';
import { GroupEventModel, GroupMemberModel, GroupModel, GroupMessageModel } from './../../../models/GroupModel';
import { ApiService } from './../../../services/api.service';
import { FileUploadService } from './../../../services/file-upload.service';
import { GroupsService } from './../../../services/groups.service';
import { AddMembersFormComponent } from './../add-members-form/add-members-form.component';
import { GroupEventFormComponent } from './../group-event-form/group-event-form.component';
import { CustomDateFormatter } from './custom-date-formatter.provider';
import { Socket } from 'ngx-socket-io';
import { Howl } from 'howler';
import { MemberFormComponent } from '../../contact/member-form/member-form.component';
import { ViewEventActivitiesComponent } from '../view-event-activities/view-event-activities.component';
import { ViewEventReviewsComponent } from '../view-event-reviews/view-event-reviews.component';
import { ViewEventFinancesComponent } from '../view-event-finances/view-event-finances.component';
import { ViewEventAttendanceComponent } from '../view-event-attendance/view-event-attendance.component';
import { ViewGroupNotesComponent } from '../view-group-notes/view-group-notes.component';
import { ViewGroupDocumentsComponent } from '../view-group-documents/view-group-documents.component';
import { ChatService } from "src/app/services/chat.service";
import { Channel } from "twilio-chat/lib/channel";
import { Message } from "twilio-chat/lib/message";
import { fromEvent } from "rxjs";
import { NgAudioRecorderService, OutputFormat } from 'ng-audio-recorder';
import { SessionError } from 'twilio-chat/lib/sessionerror';
import { WordpressService } from 'src/app/services/wordpress.service';
@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter
    }
  ]
})
export class DetailsComponent implements OnInit {
  connect_subscription: Subscription;

  /******** End Chat  ********/

  settings_obj = {
    menu_option: 'members',
    submenu_option: 'requests'
  }

  constructor(
    private userService: UserService,
    public route: ActivatedRoute,
    private groupsService: GroupsService,
    private formBuilder: FormBuilder,
    private fus: FileUploadService,
    private api: ApiService,
    protected utils: CalendarUtils,
    private socket: Socket,
    private dp: DatePipe,
    private router: Router,
    private modal: NgxSmartModalService,
    private chatService: ChatService,
    private audioRecorderService: NgAudioRecorderService,
    private wpService: WordpressService
  ) {
    this.currentUser = this.userService.getCurrentUser();
    this.groupId = this.route.snapshot.params.id;
    this.viewDateNext = moment(this.viewDate).add(1, 'M').toDate();
    this.currentUsername = `${this.currentUser.nombre} ${this.currentUser.apellido} <${this.currentUser.email}>`;
    setTimeout(() => {
      this.filter_dates = {
        start_date: moment(new Date()).startOf('M').format('YYYY-MM-DD'),
        end_date: moment(new Date()).add(1, 'M').endOf('M').format('YYYY-MM-DD')
      };
    });
  }

  get members_on_form(): FormArray {
    return this.membertTypeForm.get('members') as FormArray;
  }

  public currentUser: any;
  public groupId: any;
  public group: GroupModel = new GroupModel();
  selectedGroup: GroupModel;
  selectedEvent: GroupEventModel;

  show_detail = false;
  show_detail_loading = false;
  members: GroupMemberModel[] = [];
  requests: GroupMemberModel[] = [];

  public formGroup: FormGroup = this.formBuilder.group({
    idGroup: [''],
    idIglesia: [''],
    title: ['', Validators.required],
    city: ['', Validators.required],
    street: [''],
    state: [''],
    zip_code: [''],
    idGroupType: [1, Validators.required],
    idLevelAccess: [1, Validators.required],
    leaders: ['', Validators.required],
    members: [''],
    categories: [''],
    fotoUrl: [''],
    short_description: [''],
    long_description: [''],
    photo: [''],
    is_external: new FormControl(false),
    external_url: new FormControl()
  });

  public membertTypeForm: FormGroup = this.formBuilder.group({
    members: this.formBuilder.array([])
  });

  @ViewChild('view_group_notes') view_group_notes: ViewGroupNotesComponent;
  @ViewChild('view_group_documents') view_group_documents: ViewGroupDocumentsComponent;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  // Datatables
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: 'Blfrtip',
    lengthMenu: [10, 25, 50, 100, 250, 500],
    buttons: [
      { extend: 'copy', className: 'btn btn-outline-citric btn-sm' },
      { extend: 'print', className: 'btn btn-outline-citric btn-sm' },
      { extend: 'csv', className: 'btn btn-outline-citric btn-sm' },
    ]
  };

  /** Events */
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  viewDateNext: Date = new Date();
  activeDayIsOpen: boolean = true;
  activeSecondDayIsOpen: boolean = false;

  hide_activities: boolean = true;
  hide_reviews: boolean = true;
  hide_finances: boolean = true;
  hide_attendance: boolean = true;
  visiblePixieModal: boolean = false;

  refresh: Subject<any> = new Subject();

  weekDays = this.utils.getWeekViewHeader({
    viewDate: this.viewDate,
    weekStartsOn: 0,
    excluded: [],
    weekendDays: [0, 6]
  });

  filter_dates = {
    start_date: new Date().toISOString(),
    end_date: moment(new Date()).add(1, 'M').toDate().toISOString()
  };

  events: CalendarEvent[] = [];
  events_original: CalendarEvent[] = [];
  raw_events: GroupEventModel[] = [];
  events_clear: any[] = [];

  tag_filtered: CalendarEvent;
  is_filtered: boolean = false;

  /** End Events */

  /******** Chat  ********/

  isMember: boolean = false;
  memberApproved: boolean = false;
  chat_config: {
    nickname: string,
    idUser: number,
    room: string,
    group: GroupModel
  };

  page = 1;
  server_chat_busy = false;
  subscription: Subscription;

  messages_loaded: boolean = false;

  /********** Chat */
  public messages: Message[] = [];

  selectedContact: any;
  public membersTyping: any = [];
  public msg_media = []
  public photo: any;
  public file: File
  public typeObservable: any;
  public currentChannel: Channel;
  public chatMessage: string;
  public membersInChannel = ''
  public lastMessages = []
  public currentUsername: string
  public displayedMsg: any = [];
  public lastMessageConsumed = false
  public recording = false
  public recordingCounter = 0
  public recordingInterval
  public toggled: boolean = false;
  private conSub: any;
  public wordpressSettings
  public wpConfig: any;
  public wpImages: any[] = []
  public interval
  @ViewChild("chatElement") chatElement: any;
  @ViewChild("chatDisplay") chatDisplay: any;
  ngOnInit() {
    this.getGroup();
    $('#v-pills-tab a[href="#v-pills-chat"]').on('click', (e) => {
      e.preventDefault();
      this.page = 2;
      console.log('clicked chat');
      this.enterChannel()
      /*setTimeout(() => {
        $('#chatElement').animate({ scrollTop: $('#chatElement')[0].scrollHeight }, 200);
        // tslint:disable-next-line: deprecation
        $('#chatElement').scroll(() => {
          if ($('#chatElement').scrollTop() <= 2) {
            // window.location.reload();
            if (!this.server_chat_busy) {
              this.server_chat_busy = true;
              this.page++;
              this.enterChannel()
              setTimeout(() => {
                this.server_chat_busy = false;
              }, 2000);
            }
          }
        });
      }, 200);
      // $().tab('show');
      */
    });

    setTimeout(() => {
      $('#v-pills-tab a[href="#v-pills-notes"]').on('click', (e) => {
        e.preventDefault();
        console.log('clicked');
        this.page = 1;
        this.view_group_notes.group = this.group;
        this.view_group_notes.ngOnInit();
        this.view_group_notes.getNotes()
          .then(data => {
            // view_event_activities_modal.open();
            this.show_detail_loading = false;
          })
          .catch(error => {
            this.groupsService.api.showToast(`Error getting the notes for this group.`, ToastType.error);
            this.show_detail_loading = false;
          });

      });
    }, 100);

    setTimeout(() => {
      $('#v-pills-tab a[href="#v-pills-documents"]').on('click', (e) => {
        e.preventDefault();
        this.page = 1
        this.view_group_documents.group = this.group;
        this.view_group_documents.ngOnInit();
        this.view_group_documents.getDocuments()
          .then(data => {
            // view_event_activities_modal.open();
            this.show_detail_loading = false;
          })
          .catch(error => {
            this.groupsService.api.showToast(`Error getting the documents for this group.`, ToastType.error);
            this.show_detail_loading = false;
          });

      });
    }, 100);
    this.socket.connect();
    this.getWordpressSettings()
  }
  getWordpressSettings() {

    this.api
      .get(`wordpress`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          this.wordpressSettings = data;
          // Setup WP service
          let url = `${data.wordpressUrl}`;
          if (!url.endsWith('/')) {
            url += '/';
          }
          if (url.startsWith('http:')) {
            url = url.replace('http:', 'https:')
          }
          this.wpConfig = {
            url,
            token: data.authentication,
          };
          this.wpService.config = this.wpConfig;
        },
        (err: any) => {
          console.error(err);
        },
        () => {
          this.getImages()
        }
      );
  }
  getImages() {
    //'wp-json/wp/v2/media/?per_page=100'
    this.wpService.GET('wp-json/wp/v2/media/?per_page=100&meta_value=true',
    ).subscribe(
      (data: any) => {
        this.wpImages = data
        console.log(this.wpImages)
      },
      (err) => {
        console.error(err);
      }
    );
  }
  enterChannel() {
    this.messages = [];
    this.membersTyping = [];
    // Clean subcribers
    this.chatService.getChannelByUniqueName('ChatGroup-' + this.group.idGroup + '-' + this.group.picture).then((channel) => {
      this.currentChannel = channel;
      this.messages_loaded = true
      this.currentChannel
        .join()
        .then((r) => {
          this.initChannel();
        })
        .catch((e) => {
          console.log(e.message);

          if (e.message.indexOf("already exists") > 0) {
            this.initChannel();
          }
        });
    }).catch((reason) => {
    });
  }
  initChannel() {
    this.typeObservable = fromEvent(
      this.chatElement.nativeElement,
      "keyup"
    ).subscribe(() => {
      this.typing();
    });
    this.updateParticipants()
    this.currentChannel.on("messageAdded", (m) => {
      console.log(m);

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
      this.page == 2 ? this.setMessagesAsRead() : null
      !this.messages.includes(m) ? this.messages.push(m) : null
      this.displayedMsg.push(false)
      const el = this.chatDisplay.nativeElement;
      setTimeout(() => {
        el.scrollTop = el.scrollHeight;
      }, 1000);
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
    this.chatService.chatClient.on("channelRemoved", (channel: Channel) => {
      if (channel.sid == this.currentChannel.sid) {
      }
    });
    this.chatService.chatClient.on('channelUpdated', (reason) => {
      if (reason.updateReasons.includes('friendlyName') || reason.updateReasons.includes('uniqueName')) {
        this.getGroup()
      }
    });
    this.currentChannel.on('memberUpdated', (m) => {
      this.lastMessageConsumed = false
      this.getMessageConsumption()
    })
    this.currentChannel.on('memberLeft', (m) => {
      this.updateParticipants()
      this.getGroup()
    })
    this.currentChannel.on('memberAdded', (m) => {
      this.updateParticipants()
      this.getGroup()
    })
    // load messages
    this.loadMessages();

    // Clean message counter
  }
  getUnreadMessages() {
    let count: number = 0;
    if (this.currentChannel) {
      count = this.currentChannel.lastMessage.index - this.currentChannel.lastConsumedMessageIndex
    }
    if (count) return count
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
  updateParticipants() {
    if (this.currentChannel) {
      this.currentChannel.getMembers().then((response: Array<any>) => {
        var identities = response.map(function (item) {
          return String(item['state']['identity']).substring(0, String(item['state']['identity']).indexOf(' <'));
        });
        this.membersInChannel = identities.join(', ')
      })
    }
  }
  typing() {
    this.currentChannel.typing();
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
        this.page == 2 ? this.setMessagesAsRead() : null
      }, 1000);
    });
  }
  capitalize() {
    if (this.chatMessage) {
      if (this.chatMessage.length == 1) {
        this.chatMessage = this.chatMessage.charAt(0).toUpperCase() + this.chatMessage.slice(1)
      }
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
  removeFile() {
    this.file = null
  }
  startRecording() {
    this.recording = true
    this.audioRecorderService.startRecording();
    this.recordingInterval = setInterval(() => {
      this.recordingCounter++
    }, 1000);
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
  loadImageFromDevice(event) {
    const file = event.target.files[0];
    if (((file.size) / 1024) / 1024 <= 10) {
      this.file = file
    } else {
      this.api.showToast(("The file size must not exceed 10MB"), 4000)
    }
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
  stopRecording() {
    this.audioRecorderService.stopRecording(OutputFormat.WEBM_BLOB).then((output: Blob) => {
      this.file = new File([output], "audio-record-" + this.makeid(6) + ".webm", { type: "audio/webm" });
      this.recording = false
      this.recordingCounter = 0
      clearInterval(this.recordingInterval)
    }).catch(errrorCase => {
    });
  }
  getAuthorInfo(identity: string) {
    var res_user = this.group.members.find((u) => `${u.name} ${u.lastName} <${u.email}>` == identity)
    var res_user_leader = this.group.leaders.find((u) => `${u.name} ${u.lastName} <${u.email}>` == identity)
    var photo_url = undefined
    if (res_user) {
      photo_url = res_user.picture ? res_user.picture : null
    }
    if (res_user_leader) {
      photo_url = res_user_leader.picture ? res_user_leader.picture : null
    }
    if (photo_url) {
      photo_url = this.fixUrl(photo_url)
    }
    return { photo_url }
  }
  public async loadMessagesBySid(sid: string, index: number) {
    this.chatService.getChannel(sid).then((channel: Channel) => {
      channel.getMessages(1).then((messages: any) => {
        var subcadena = ''
        if (messages.items[messages.items.length - 1].state.media) {
          subcadena = String(messages.items[messages.items.length - 1].state.media.state.filename)
        } else {
          subcadena = String(messages.items[messages.items.length - 1].state.body)
        }
        this.lastMessages[index] = {
          cadena: subcadena,
          author: (String(messages.items[messages.items.length - 1].state.author) == this.currentUsername) ? ('You: ') : '',
          sid: sid
        }
      })
    })
  }
  minutes(seconds) {
    return parseInt(seconds / 60 + "") + ":" + String(parseInt(seconds % 60 + "")).padStart(2, "0")
  }
  setMessagesAsRead(index?: number) {
    // Set Messages as read
    this.currentChannel.updateLastConsumedMessageIndex(
      index || (this.messages.slice(-1)[0] ? this.messages.slice(-1)[0].index : 0)
    )
    const el = this.chatDisplay.nativeElement;
    setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 1000);
  }
  handleSelection(event) {
    this.chatMessage = (this.chatMessage ? this.chatMessage : '') + event.char;
  }
  sendLike() {
    var unicodeToStr = '👍'
    this.currentChannel.sendMessage(unicodeToStr).then((val) => {
      this.page == 2 ? this.setMessagesAsRead(val) : null
    })
  }
  async add_person(identity, channel?: Channel, data?: any) {
    if (channel && identity) {
      channel.add(identity).then((response: any) => {
      }).catch((reason: SessionError) => {
        if (reason.message != 'Member already exists' && reason.message != 'User unauthorized for command'
          && reason.message != 'Conflicting member modification' && reason.message !== 'User channel limit exceeded') {
          console.log("bucle")
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
            )
        }
      })
    }
  }
  getGroup() {
    // this.api.get(`getGrupos`, { idIglesia: this.currentUser.idIglesia })
    if (this.subscription) {
      // this.subscription.unsubscribe();
      this.socket.removeAllListeners();
    }
    this.groupsService.getGroupDetail(this.groupId)
      .subscribe((data: any) => {
        this.formGroup.patchValue(data.group);
        this.group = data.group;
        this.members = this.group.leaders.concat(this.group.members);
        this.membertTypeForm = this.formBuilder.group({
          members: this.formBuilder.array([])
        });
        this.requests = this.group.requests;
        this.members.forEach(member => {
          const control = this.membertTypeForm.controls.members as FormArray;
          control.push(this.formBuilder.group({
            is_leader: new FormControl(member.is_leader, [
              Validators.required,
            ])
          }));
        });
        this.raw_events = data.group.events;
        this.printEvents(this.raw_events);

        this.show_detail = true;

        /*this.chat_config = {
          nickname: `${this.currentUser.nombre} ${this.currentUser.apellido}`,
          idUser: this.currentUser.idUsuario,
          room: `organization_${this.group.idOrganization}_group_${this.group.idGroup}`,
          group: this.group
        };*/
        // const nickname = this.chat_config.nickname;
        // const room = this.chat_config.room;
        this.socket.emit('set-nickname', this.chat_config);

        const all_users = this.group.members.concat(this.group.leaders);
        const isMember = (all_users as any[]).find(item => {
          return this.currentUser.idUsuario === item.idUser;
        });

        if (isMember) {
          this.memberApproved = isMember.status;
        } else {
          if (this.group.idLevelAccess === 2) {
            this.memberApproved = false;
            this.groupsService.api.showToast(`You don't have permissions to see this group...`, ToastType.error);
            this.handleRedirect();
            return;
          } else {
            this.memberApproved = false;
          }
        }

        this.isMember = isMember ? true : false;
        if (!this.memberApproved && this.group.idLevelAccess === 2) {
          if (this.isMember) {
            this.groupsService.api.showToast(`You sent a request to belong this chat, but still under process...`, ToastType.info);
          } else {
            this.groupsService.api.showToast(`You don't have permissions to enter to this chat...`, ToastType.error);
            // if (this.tabSelected === 'chat') {
            //   this.tabSelected = 'home';
            // }
          }
          // Redirect to another tab.
          // this.navCtrl.pop();
        }

        /*this.subscription = this.getMessages(this.page).subscribe(message => {

          this.messages.push(message);
          this.group.message_count++;
          if (message.idUser !== this.currentUser.idUsuario) {
            const sound = new Howl({
              src: ['assets/sounds/notification_message.mp3']
            });
            sound.play();
          }
        });*/

        this.getUsers().subscribe((data_users: any) => {
          const user = data_users.user;
          if (data.event === 'left') {
            // this.showToast(`User left: ${user}`);
          } else {
            // this.showToast(`User joined: ${user.nickname}`);
          }
        });

        this.restartTable();
        this.interval = setInterval(() => {
          if (this.chatService.chatClient) {
            this.chatService.getChannelByUniqueName('ChatGroup-' + this.group.idGroup + '-' + this.group.picture)
              .then((channel: Channel) => {
                this.messages_loaded = true
                this.members.forEach((value) => {
                  this.add_person(`${value.name} ${value.lastName} <${value.email}>`, channel).finally(() => {
                  })
                })
              }).catch((reason) => {
              })
            clearInterval(this.interval)
          } else {
            if (this.currentUser) {
              if (!this.connect_subscription) {
                const identity = `${this.currentUser.nombre} ${this.currentUser.apellido} <${this.currentUser.email}>`
                this.connect_subscription = this.api
                  .post(`chat`, {
                    identity,
                    deviceId: "web",
                  })
                  .subscribe((response: any) => {
                    console.log(response);
                    // this.chatService.connect(response.token);
                  }, err => {
                    console.log(err);
                  }, () => {
                    // this.connect_subscription = undefined;
                  });
              }
            }
          }
        }, 100)
        this.conSub = this.chatService.chatConnectedEmitter.subscribe(() => {
          this.messages_loaded = true
          this.enterChannel()
        })
      }, error => {
        console.error(error);
        if (error.status === 404) {
          this.groupsService.api.showToast(`This group was deleted.`, ToastType.error);
        } else {
          this.groupsService.api.showToast(`Something happened while trying to get the group details.`, ToastType.error);
        }
      }, () => {
        this.dtTrigger.next();
      });
  }
  handleRedirect() {
    if (this.currentUser.idUserType === 2) {
      this.router.navigate([`/user-profile/details/${this.currentUser.idUsuario}`]);
    } else {
      this.router.navigate(['dashboard']);
    }
  }

  parseSegment(segment: string): moment.unitOfTime.DurationConstructor {
    switch (segment) {
      case 'day':
        return 'day';
      case 'month':
        return 'month';
      case 'year':
        return 'year';
      default:
        return 'day';
    }
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
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

  goToCategory() {
    // I don't do anything yet.
  }

  openUpdateGroup(modal: NgxSmartModalComponent) {
    modal.open();
    this.selectedGroup = Object.assign({}, this.group);
  }

  updateGroup(modal: NgxSmartModalComponent, response?) {
    modal.close();
    this.show_detail = false;
    setTimeout(() => {
      this.getGroup();
    }, 300);
  }

  resetForm(formGroup: FormGroup, key: string) {
    formGroup.get(key).setValue(this.group[key]);
    formGroup.get(key).markAsPristine();
  }

  updateValue(formGroup: FormGroup, key: string) {
    this.show_detail = false;
    const group = Object.assign({}, this.group);
    group[key] = formGroup.get(key).value;
    this.fixMembers(group);
    const is_external = formGroup.get('is_external').value;
    group.created_by = this.currentUser.idUsuario;
    if (key === 'external_url' && is_external) {
      this.group.is_external = true;
    } else {
      group.is_external = false;
    }
    const payload = formGroup.value;
    if (payload.is_external && !payload.external_url) {
      formGroup.get('external_url').markAsTouched();
      this.api.showToast(`You need to add a register link`, ToastType.info);
      return;
    }
    this.groupsService.updateGroup(group)
      .subscribe(response => {
        this.group[key] = formGroup.get(key).value;
        formGroup.get(key).markAsPristine();
        // Object.keys(formGroup.controls).forEach(element => {
        //   formGroup.controls[element].markAsPristine();
        // });
        // this.getGroup();
        this.show_detail = true;
        if (this.currentChannel) {
          this.currentChannel.updateFriendlyName('ChatGroup - ' + group[key]).then((value: Channel) => {
            console.log("succes")
          }).catch((reason) => {
            console.log("unsucces")
          })
        } else {
          this.enterChannel()
          this.chatService.getChannelByUniqueName('ChatGroup-' + group.idGroup + '-' + group.picture).then((channel: Channel) => {
            channel.updateFriendlyName('ChatGroup - ' + group[key]).then((value: Channel) => {
              console.log("succes")
            }).catch((reason) => {
              console.log("unsucces")
            })
            this.enterChannel()
          })
        }
      }, error => {
        console.error(error);
        this.groupsService.api.showToast(`Error updating the ${key} of the group.`, ToastType.error);
      });
  }

  fixMembers(group: GroupModel) {
    const id_leader_array = [];
    if (group.leaders) {
      group.leaders.map(x => {
        x.is_leader = true;
        id_leader_array.push(x.idUsuario);
      });
    } else {
      group.leaders = [];
    }

    let members_clear = [];
    if (group.members) {
      members_clear = group.members.filter(user => {
        return !id_leader_array.includes(user.idUser);
      });
    }
    group.members = group.leaders.concat(members_clear);
  }

  uploadPicture(input_file) {
    if (!this.getPermissions()) {
      input_file.onchange = (event: { target: { files: File[] } }) => {
        if (event.target.files.length > 0) {
          this.uploadImage(event.target.files[0]);
        }
      };
      input_file.click();
    }
  }

  handlePixieExport(file: any) {
    this.uploadImage(file);
    this.visiblePixieModal = false;
  }

  uploadImage(photo) {
    this.fus.uploadFile(photo, true, 'groups')
      .subscribe((response: any) => {
        const photo_url = this.group.picture
        this.group.picture = this.fus.cleanPhotoUrl(response.response);
        const group = Object.assign({}, this.group);
        this.fixMembers(group);
        this.groupsService.updateGroup(group)
          .subscribe(response_updated => {
            if (this.currentChannel) {
              this.currentChannel.updateUniqueName('ChatGroup-' + group.idGroup + '-' + group.picture).then((value: Channel) => {
                this.groupsService.api.showToast(`Slider updated successfully`, ToastType.success);
              }).catch((reason) => {
              })
            } else {
              this.enterChannel()
              this.chatService.getChannelByUniqueName('ChatGroup-' + group.idGroup + '-' + photo_url).then((channel: Channel) => {
                console.log("succes")
                this.currentChannel = channel
                /*this.currentChannel.updateUniqueName('ChatGroup-' + group.idGroup + '-' + group.picture).then((value: Channel)=>{
                  this.groupsService.api.showToast(`Slider updated successfully`, ToastType.success);
                }).catch((reason)=>{
                })*/
              }).catch(() => {
                console.log("unsucces")
              })
            }
          }, error => {
            console.error(error);
            this.groupsService.api.showToast(`Something happened trying to save the slider.`, ToastType.error);
          });
      });
  }

  getPermissions() {
    // read only
    if (this.group.is_leader) {
      return false;
    }
    if (this.currentUser.isSuperUser) {
      return false;
    }
    if (this.currentUser.idUserType === 1) {
      return false;
    }
    return true;
  }

  openModalAddMembers(add_members_modal: NgxSmartModalComponent, add_members_form: AddMembersFormComponent) {
    this.getUsersAsPromise().then((users: any[]) => {
      add_members_form.users = users;
      add_members_form.group = Object.assign({}, this.group);
      add_members_form.patchUsers();
      add_members_modal.open();
    });
  }

  addMembers(add_members_modal: NgxSmartModalComponent, response_event: any[]) {
    if (Array.isArray(response_event)) {
      this.show_detail = false;
      add_members_modal.close();
      const group = Object.assign({}, this.group);
      group.members = response_event;
      this.groupsService.updateGroup(group)
        .subscribe(response => {
          this.getGroup();
        }, error => {
          console.error(error);
          this.groupsService.api.showToast(`Error updating the members of the group.`, ToastType.error);
        });
    }
  }

  getUsersAsPromise() {
    return new Promise((resolve, reject) => {
      this.api.get('getUsuarios', { idIglesia: this.currentUser.idIglesia })
        .subscribe((data: any) => {
          data.usuarios.map(user => { user.full_name = `${user.nombre} ${user.apellido}`; });
          return resolve(data.usuarios);
        }, error => {
          return reject([]);
        });
    });
  }

  resetMemberForm(control: FormGroup, member: GroupMemberModel) {
    control.get('is_leader').setValue(member.is_leader);
    control.get('is_leader').markAsPristine();
  }

  updateMemberType(control: FormGroup, member: GroupMemberModel) {
    const member_temp = Object.assign({}, member);
    member_temp.is_leader = Boolean(JSON.parse(control.get('is_leader').value));
    if (member_temp.is_leader === member.is_leader) {
      control.get('is_leader').setValue(member.is_leader);
      control.get('is_leader').markAsPristine();
    } else {
      this.groupsService.updateMemberType(member_temp)
        .subscribe(response => {
          this.groupsService.api.showToast(`Role updated.`, ToastType.info);
          control.get('is_leader').setValue(member_temp.is_leader);
          control.get('is_leader').markAsPristine();
        }, error => {
          console.error(error);
          this.groupsService.api.showToast(`Error updating the user's role. Reversing changes...`, ToastType.error);
          control.get('is_leader').setValue(member.is_leader);
          control.get('is_leader').markAsPristine();
        });
    }

  }

  checkChange(control: FormControl, member: GroupMemberModel) {
    if (Boolean(JSON.parse(control.value)) === member.is_leader) {
      control.markAsPristine();
    }
  }

  deleteMember(member: GroupMemberModel) {
    if (confirm(`Are you sure yo want to delete this member?`)) {
      this.groupsService.deleteMember(member)
        .subscribe(response => {
          this.getGroup();
          this.currentChannel.removeMember((`${member.name} ${member.lastName} <${member.email}>`)).then((value) => {
            this.groupsService.api.showToast(`Member deleted.`, ToastType.info);
          }).catch((error) => {
            this.groupsService.api.showToast(`Error deleting member.`, ToastType.error);
          })
        }, error => {
          console.error(error);
          this.groupsService.api.showToast(`Error deleting member.`, ToastType.error);
        });
    }
  }

  /**************************** Events ****************************/
  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay(add: number) {
    this.activeDayIsOpen = false;
    this.activeSecondDayIsOpen = false;

    if (add > 0) {
      this.viewDate = moment(this.viewDate).add(add, 'M').toDate();
      this.viewDateNext = moment(this.viewDate).add(1, 'M').toDate();
    } else {
      this.viewDateNext = moment(this.viewDate).add(1, 'M').toDate();
    }

    this.filter_dates = {
      start_date: moment(this.viewDate).startOf('M').format('YYYY-MM-DD'),
      end_date: moment(this.viewDateNext).endOf('M').format('YYYY-MM-DD')
    };

    this.printEvents(this.raw_events);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    const event_id = document.getElementById(`event_${event.id}`);
    event_id.style.animationName = 'example';
    event_id.style.animationDuration = '2.5s';
    const options: ScrollIntoViewOptions = {
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    };
    event_id.scrollIntoView(options);
    setTimeout(() => {
      event_id.style.animationName = 'unset';
      // event_id.style.animationDuration = 'unset';
    }, 1000);
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }, init?: boolean): void {
    // if (moment(this.viewDate).isSame(date, 'month')) {
    //   if (
    //     (moment(this.viewDate).isSame(date, 'day') && this.activeDayIsOpen === true) ||
    //     events.length === 0
    //   ) {
    //     this.activeDayIsOpen = false;
    //   } else {
    //     this.activeDayIsOpen = true;
    //   }
    //   this.viewDate = date;
    // }
    if (moment(this.viewDate).isSame(date, 'month')) {
      if (
        (moment(this.viewDate).isSame(date, 'day') && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        if (init) {
          if (moment(new Date()).isSame(date, 'day')) {
            this.activeDayIsOpen = true;
          } else {
            this.activeDayIsOpen = false;
          }
        } else {
          this.activeDayIsOpen = true;
        }
      }
      this.viewDate = date;
    }

    if (moment(date).isSame(this.viewDateNext, 'month')) {
      if (
        (moment(this.viewDateNext).isSame(date, 'day') && this.activeSecondDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeSecondDayIsOpen = false;
      } else {
        this.activeSecondDayIsOpen = true;
      }
      this.viewDateNext = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map(iEvent => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  printEvents(raw_events: GroupEventModel[]) {
    this.events = [];

    const events = raw_events.concat([]);

    const events_clear = events
      .map(e => e.idGroupEvent)
      .map((e, index, final) => final.indexOf(e) === index && index)
      .filter(e => events[e]).map(e => events[e]);

    let i = 0;
    // iterate clean array to filter raw events and use the same color for each event.
    events_clear.forEach(event_clear => {
      const color = { primary: random_color(), secondary: random_color() };
      event_clear.color = color;
      events
        .filter(event => event.idGroupEvent === event_clear.idGroupEvent)
        // iterate filtered arrays
        .forEach(event => {
          let event_end;
          if (event.event_as_range) {
            // is range
            if (event.event_date_end) {
              event_end = (event.event_date_end as string).substring(0, 10) + ' ';
              event_end += event.event_time_end;
              event_end = moment(event_end).toDate();
            }
          } else {
            if (event.is_exact_date) {
              event_end = (event.event_date_ as string).substring(0, 10) + ' ';
              event_end += event.event_time_end;
              event_end = moment(event_end).toDate();
            }
          }
          let event_actual_date = moment(event.event_date_).toDate();
          const last_day_of_end = moment(this.viewDateNext).endOf('month').toDate();
          // const last_day_of_end = lastDayOfMonth(this.viewDateNext);
          do {
            let event_end_to_others;
            if (!event_end) {
              // Fix event_end for events without range and not exact date.
              event_end_to_others = moment(event_actual_date).format('YYYY-MM-DD hh:mm').substring(0, 10) + ' ';
              event_end_to_others += event.event_time_end;
              event_end_to_others = moment(event_end_to_others).toDate();
            }
            const event_fixed: CalendarEvent = {
              id: i++,
              color,
              title: event.name,
              start: moment(event_actual_date).toDate(),
              end: event_end ? event_end : event_end_to_others ? event_end_to_others : undefined,
              allDay: false,
              resizable: {
                beforeStart: false,
                afterEnd: false
              },
              draggable: false,
              meta: {
                idGroupEvent: event.idGroupEvent,
                description: event.description,
                attendances_count: event.attendances_count,
                attendances_total: event.attendances_total,
                capacity: event.capacity
              }
            };
            event_end_to_others = undefined;
            if (
              // Check that month and year is same.
              (
                event_actual_date.getMonth() === this.viewDate.getMonth()
                && event_actual_date.getFullYear() === this.viewDate.getFullYear()
              )
              ||
              (
                event_actual_date.getMonth() === this.viewDateNext.getMonth()
                && event_actual_date.getFullYear() === this.viewDateNext.getFullYear()
              )
            ) {
              if (event.repeat_until_date) {
                // Has until_date field
                if (moment(event.repeat_until_date).isSameOrAfter(event_actual_date, 'day')) {
                  // Validate that repeat until is same of after to add it to calendar.
                  this.events.push(event_fixed);
                }
              } else {
                // Added to calendar cause there isn't limit.
                this.events.push(event_fixed);
              }
            }
            event_actual_date = moment(event_actual_date).add(event.quantity, this.parseSegment(event.segment)).toDate();
          } while (event_actual_date < last_day_of_end && event.quantity > 0);
        });
    });
    // Sort array for start date
    this.events.sort((a, b) => {
      return a.start > b.start ? 1 : -1;
    });

    // Fix id's to use it ascending
    let j = 0;
    this.events.forEach(x => {
      x.id = j++;
    });

    // Create copy temp to filter.
    this.events_original = [...this.events];

    // Get only colors to clean.
    const colors_clear = this.events_original
      .map(e => e.color.primary)
      // store the keys of the unique objects
      .map((e, index, final) => final.indexOf(e) === index && index)
      // eliminate the dead keys & store unique objects
      .filter(e => this.events_original[e]).map(e => this.events_original[e]);

    // Copy to events
    this.events_clear = [...colors_clear];
    if (this.events.length > 0) {
      // const first_event: CalendarEvent = this.events_clear[0];
      const event_in_date = this.events.find((x: CalendarEvent) => {
        return moment(x.start).isSame(new Date(), 'day') || moment(new Date()).isBetween(x.start, x.end);
      });
      if (event_in_date) {
        this.dayClicked({ date: new Date(), events: this.events }, true);
      } else {
        this.activeDayIsOpen = false;
        this.activeSecondDayIsOpen = false;
      }
    } else {
      this.activeDayIsOpen = false;
      this.activeSecondDayIsOpen = false;
    }
  }

  openModalAddEvent(group_event_modal: NgxSmartModalComponent, group_event_form: GroupEventFormComponent) {
    group_event_form.group_event = new GroupEventModel();
    group_event_form.group_event.idGroup = this.groupId;
    group_event_form.loadFrequencies().then(success => {
      group_event_modal.open();
      // group_event_form.eventFormGroup.reset();
      group_event_form.selected_frequency = undefined;
    }).catch(error => {
      this.groupsService.api.showToast(`Error getting frequencies. Please, try again later.`, ToastType.error);
    });
  }

  openModalUpdateEvent(
    group_event_modal: NgxSmartModalComponent,
    group_event_form: GroupEventFormComponent,
    group_event: CalendarEvent
  ) {
    const promises = [];
    promises.push(group_event_form.loadFrequencies());
    promises.push(this.groupsService.getGroupEventDetail((group_event.meta as GroupEventModel)).toPromise());
    Promise.all(promises).then(success => {
      const group_event_response = success[1].group;
      group_event_form.group_event = Object.assign({}, group_event_response);
      group_event_form.group_event.idGroup = this.groupId;

      group_event_form.ngOnInit();
      group_event_modal.open();
    }).catch(error => {
      console.error(error);
      this.groupsService.api.showToast(`Error getting event info. Please, try again later.`, ToastType.error);
    });
  }

  deleteEvent(event: CalendarEvent) {
    if (confirm(`Are you sure yo want to delete this event? This will delete any further events associated`)) {
      const group_event = event.meta as GroupEventModel;
      this.groupsService.deleteEvent(group_event)
        .subscribe(response => {
          this.getGroup();
          this.groupsService.api.showToast(`Event deleted.`, ToastType.info);
        }, error => {
          console.error(error);
          this.groupsService.api.showToast(`Error deleting event.`, ToastType.error);
        });
    }
  }

  reloadEvents(group_event_modal: NgxSmartModalComponent, event: any) {
    group_event_modal.close();
    if (event === true) {
      // load events.
      this.getGroup();
    }
  }

  checkDate(start, end) {
    return moment(end).isAfter(moment(start), 'day');
  }

  filterByTagColor(event: CalendarEvent) {
    if (this.is_filtered) {
      // filtered true
      if (this.tag_filtered.color.primary !== event.color.primary) {
        this.events = this.events_original.filter(ev => ev.color.primary === event.color.primary);
        this.tag_filtered = this.events[0];
      } else {
        this.is_filtered = false;
        this.events = [...this.events_original];
        this.tag_filtered = undefined;
      }
    } else {
      this.is_filtered = true;
      this.events = this.events_original.filter(ev => ev.color.primary === event.color.primary);
      this.tag_filtered = this.events[0];
    }
  }

  getMessages(page: number) {
    const idIglesia = this.currentUser.idIglesia;
    this.groupsService.getMessages(idIglesia, this.group.idGroup, page)
      .then((data: any) => {
        if (data.messages) {
          this.messages = data.messages;
        } else {
          this.messages = [];
        }
        this.messages_loaded = true;
      })
      .catch(err => {
        console.error(err);
        this.messages = [];
        this.messages_loaded = true;
      });
    const observable = new Observable<any>(observer => {
      this.socket.on('message', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

  getUsers() {
    const observable = new Observable(observer => {
      this.socket.on('users-changed', (data) => {
        observer.next(data);
      });
    });
    return observable;
  }

  printDateMessage(message) {
    if (moment(message.date_sent).isSame(new Date(), 'day')) {
      return `${this.dp.transform(message.date_sent, 'hh:mm aaa')}, Today`;
    } else {
      return `${this.dp.transform(message.date_sent, 'MMM/dd hh:mm aaa')}`;
    }
  }
  sendFile() {
    if (this.file) {
      if (((this.file.size) / 1024) / 1024 <= 10) {
        const formData = new FormData();
        formData.append('file', this.file);
        this.currentChannel.sendMessage(formData).then((val) => {
          this.page == 2 ? this.setMessagesAsRead(val) : null;
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
  sendMessage(event?) {
    if (event) {
      if (event.keyCode !== 13) {
        return;
      }
    }
    if (this.chatMessage) {
      this.chatMessage.startsWith('\n') ? this.chatMessage = this.chatMessage.replace('\n', '') : null
      this.chatMessage.endsWith('\n') ? this.chatMessage = this.chatMessage.replace('\n', '') : null
    }
    const body = {
      sid: this.currentChannel.sid,
      idGroup: this.group.idGroup,
      message: this.chatMessage,
      title: this.group.title,
      user: this.currentUser
    }
    if (this.chatMessage != undefined || this.file) {
      if (this.chatMessage.length > 0) {
        console.log(this.currentChannel);

        this.currentChannel.sendMessage(this.chatMessage).then(
          async (idx) => {
            await this.api.post(`groups/chat/notify_to_members_group`, body).toPromise();
            this.page == 2 ? this.setMessagesAsRead(idx) : null;
          });
      }
      if (this.file != undefined) {
        this.sendFile()
      }
      this.chatMessage = ''
      this.page == 2 ? this.setMessagesAsRead() : null;
      while (this.chatMessage.includes('\n')) {
        this.chatMessage = this.chatMessage.replace('\n', '')
      }
    }
    /*const message = new GroupMessageModel();
    message.message = this.message.message;
    message.idGroup = this.groupId;
    message.room = this.chat_config.room;
    message.nickname = `${this.currentUser.nombre} ${this.currentUser.apellido}`;
    message.has_attachments = this.message.has_attachments;
    message.attachments = this.message.attachments.toString();
    this.groupsService.sendMessage(message)
      .subscribe(data => {
      }, err => {
        console.error(err);
      });

    this.socket.emit('add-message', {
      room: this.chat_config.room,
      nickname: `${this.currentUser.nombre} ${this.currentUser.apellido}`,
      message: this.message,
      idUser: this.currentUser.idUsuario,
      picture: this.currentUser.picture,
      has_attachments: this.message.has_attachments,
      attachments: this.message.attachments
    });
    $('#chatElement').animate({ scrollTop: $('#chatElement')[0].scrollHeight }, 200);
    this.message = {
      message: '',
      attachments: [],
      has_attachments: false
    };*/
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
  onDragOver(event) {
    event.preventDefault();
  }

  onDrop(event) {
    event.preventDefault();
  }
  // From drag and drop
  onDropSuccess(event) {
  }

  /*private onFileChange(files: FileList) {
    if (files.length && files.length > 0) {
      // this.processing = true;
      console.log(`Processing ${files.length} file(s).`);
      // setTimeout(() => {
      //   // Fake add attachment
      //   // this.processing = false;
      //   this.fus.uploadFile()
      // }, 1000);
      this.message.has_attachments = true;
      Array.from(files).forEach(file => {
        this.fus.uploadFile(file, true, `groups/${this.groupId}/chat`)
          .subscribe((response: any) => {
            this.message.attachments.push(this.fus.cleanPhotoUrl(response.response));
          });
      });
    }
  }*/

  /*deleteAttach(item, i: number) {
    this.message.attachments.splice(i, 1);
    if (this.message.attachments.length === 0) {
      this.message.has_attachments = false;
    }
  }*/

  openFile(item) {
    let path;
    if (item.startsWith('/')) {
      path = `${environment.serverURL}${item}`;
    } else {
      path = `${environment.serverURL}/${item}`;
    }
    const win = window.open(path, '_blank');
    win.focus();
  }

  checkChatPermissions() {
    const user = this.currentUser;
    // if (this.group.idLevelAccess === 1) {
    //   // Public
    //   return false;
    // }
    if (this.group.idLevelAccess === 2) {
      if (!user) {
        // Private without user
        return true;
      } else {
        if (!this.group.members) {
          return true;
        }
        const all_users = this.group.members.concat(this.group.leaders);
        const user_in_group = all_users.find(us => {
          return us.idUser === user.idUsuario;
        });
        if (user_in_group) {
          // is Member
          return false;
        }
        // Is not Member
        return true;
      }
    }
    if (this.messages_loaded) {
      return false;
    }
  }

  openModalCreateMember(form_simple_add: NgxSmartModalComponent, simple_add: SimpleMemberFormComponent) {
    form_simple_add.open();
    simple_add.user = undefined;
    simple_add.ngOnInit();
    simple_add.custom_select_country.ngOnInit();
    simple_add.iglesias = [
      {
        idIglesia: this.currentUser.idIglesia,
        Nombre: this.currentUser.iglesia
      }
    ];
    // simple_add.multi_select.writeValue(simple_add.iglesias[0]);
    simple_add.disableUnusedFields();
  }

  onModalEditDidDismiss(formAddModal: NgxSmartModalComponent, response) {
    formAddModal.close();
    if (response) {
      const group = Object.assign({}, this.group);
      this.fixMembers(group);
      group.members.push({
        idUser: response.idUsuario,
        is_leader: false,
        member_since: new Date(),
        status: true
      });
      this.groupsService.updateGroup(group)
        .subscribe(response_updated => {
          this.getGroup();
        }, error => {
          console.error(error);
          this.groupsService.api.showToast(`Error updating the members of the group.`, ToastType.error);
        });
    }
  }

  editMember(formEditMemberModal: NgxSmartModalComponent, edit_member_form: MemberFormComponent, member) {
    this.api.get(`users/getUser/${member.idUser}`,
      {
        idIglesia: this.currentUser.idIglesia
      })
      .subscribe(
        (data: any) => {
          if (data.msg.Code === 200) {
            formEditMemberModal.open();
            this.selectedContact = data.user;
            // this.member.fechaNacimiento = this.fixBirdthDate(this.member.fechaNacimiento)
            // this.selectedContact.telefono = this.telefono
            setTimeout(() => {
              edit_member_form.ngOnInit();
              edit_member_form.patchCategories(data.user.categories);
              // edit_member_form.memberFormGroup.patchValue({ categorias: data.user.categories })
            });
          } else {
            this.selectedContact = {};
          }
        },
        error => {
          console.error(error);
          this.api.showToast(`Error getting the user info. Please try again later.`, ToastType.error);
        }
      );
  }

  onModalEditMemberDidDismiss(formAddModal: NgxSmartModalComponent, response) {
    formAddModal.close();
    if (response) {
      this.api.showToast(`User updated successfully.`, ToastType.success);
      this.getGroup();
    }
  }

  viewActivities(
    event: CalendarEvent,
    view_event_activities_form: ViewEventActivitiesComponent) {
    this.show_detail_loading = true;
    this.groupsService.getGroupEventDetail(event.meta)
      .subscribe((response: any) => {
        view_event_activities_form.group = this.group;
        view_event_activities_form.group_event = response.group;
        view_event_activities_form.getActivities()
          .then(data => {
            // view_event_activities_modal.open();
            this.selectedEvent = response.group;
            this.show_detail_loading = false;
            this.hide_activities = false;
          })
          .catch(error => {
            this.groupsService.api.showToast(`Error getting the activities for this event.`, ToastType.error);
            this.show_detail_loading = false;
          });
      });
  }

  viewReviews(
    event: CalendarEvent,
    view_event_reviews_form: ViewEventReviewsComponent) {
    this.show_detail_loading = true;
    this.groupsService.getGroupEventDetail(event.meta)
      .subscribe((response: any) => {
        view_event_reviews_form.group = this.group;
        view_event_reviews_form.group_event = response.group;
        view_event_reviews_form.getReviews()
          .then(data => {
            // view_event_activities_modal.open();
            this.selectedEvent = response.group;
            this.show_detail_loading = false;
            this.hide_reviews = false;
          })
          .catch(error => {
            this.groupsService.api.showToast(`Error getting the activities for this event.`, ToastType.error);
            this.show_detail_loading = false;
          });
      });
  }

  viewFinance(
    event: CalendarEvent,
    view_event_finances_form: ViewEventFinancesComponent
  ) {
    this.show_detail_loading = true;
    this.groupsService.getGroupEventDetail(event.meta)
      .subscribe((response: any) => {
        view_event_finances_form.group = this.group;
        view_event_finances_form.group_event = response.group;
        view_event_finances_form.getFinances()
          .then(data => {
            // view_event_activities_modal.open();
            this.selectedEvent = response.group;
            this.show_detail_loading = false;
            this.hide_finances = false;
          })
          .catch(error => {
            this.groupsService.api.showToast(`Error getting the finances for this event.`, ToastType.error);
            this.show_detail_loading = false;
          });
      });
  }

  closeViews(event?: any) {
    if (!this.hide_attendance) {
      if (event) {
        this.getGroup();
      }
    }
    this.hide_activities = true;
    this.hide_reviews = true;
    this.hide_finances = true;
    this.hide_attendance = true;
    this.selectedEvent = undefined;
  }

  displayEventSubmodule() {
    if (this.selectedEvent) {
      if (!this.hide_activities) {
        return 'Activities';
      } else if (!this.hide_reviews) {
        return 'Reviews';
      } else if (!this.hide_finances) {
        return 'Finances';
      } else if (!this.hide_attendance) {
        return 'Attendance';
      }
      return 'Events';
    }
    return 'Events';
  }

  viewAttendance(
    event: CalendarEvent,
    view_event_attendance_form: ViewEventAttendanceComponent
  ) {
    this.show_detail_loading = true;
    this.groupsService.getGroupEventDetail(event.meta)
      .subscribe((response: any) => {
        view_event_attendance_form.was_saved = false;
        view_event_attendance_form.group = this.group;
        view_event_attendance_form.group_event = response.group;
        view_event_attendance_form.getAttendance()
          .then(data => {
            // view_event_activities_modal.open();
            this.selectedEvent = response.group;
            this.show_detail_loading = false;
            this.hide_attendance = false;
          })
          .catch(error => {
            this.groupsService.api.showToast(`Error getting the attendance for this event.`, ToastType.error);
            this.show_detail_loading = false;
          });
      });
  }

  fixDate(event) {
    if (event.target.value) {
      this.filter_dates.end_date = moment(event.target.value).endOf('M').format('YYYY-MM-DD');
    }
  }

  printEventsPdf() {

    const path: string = `${environment.apiUrl}/groups/events/pdf/?idGroup=${this.group.idGroup}&idIglesia=${this.currentUser.idIglesia}&idUsuario=${this.currentUser.idUsuario}
    &start=${this.filter_dates.start_date}&end=${this.filter_dates.end_date}`;
    const win = window.open(path, '_blank');
    win.focus();
  }

  printMembers() {
    const path: string = `${environment.apiUrl}/groups/members/pdf/?idGroup=${this.group.idGroup}&idIglesia=${this.currentUser.idIglesia}&idUsuario=${this.currentUser.idUsuario}`;
    const win = window.open(path, '_blank');
    win.focus();
  }

  getRouterForEvent(group_event: GroupEventModel) {
    if (!this.getPermissions()) {
      return `/groups/events/detail/${group_event.idGroupEvent}`;
    }
    return `/group/events/detail/${group_event.idGroupEvent}`;
  }

  resetEventForm(group_event_form: GroupEventFormComponent) {
    group_event_form = new GroupEventFormComponent(
      group_event_form.groupService,
      group_event_form.formBuilder,
      group_event_form.fus,
      group_event_form.userService,
      group_event_form.organizationService,
      group_event_form.wpService,
      group_event_form.api,
      group_event_form.ngZone,
      group_event_form.designRequestService,
      group_event_form.router
    );
  }

  get iframeCode() {
    return {
      event_link: `${environment.server_calendar}/register/groups/details/${this.groupId}?action=register`
    };
  }

  async shareQR(qr_code) {
    const element = qr_code.qrcElement.nativeElement;
    const img_child = element.firstChild;
    try {
      const imgURL = img_child.src;
      const data = await fetch(imgURL);
      const blob = await data.blob();
      await window.navigator['clipboard'].write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      this.groupsService.api.showToast('QR copied to clipboard', ToastType.success);
    } catch (err) {
      console.error(err.name, err.message);
    }
  }

  async manageRequest(request, accept: boolean) {
    request.wait = true;
    let key: string = accept ? 'accept' : 'decline';
    request[`wait_${key}`] = true;
    const response: any = await this.api.post(`groups/requests/${request.id}/answer`, {
      accept,
      created_by: this.currentUser.idUsuario
    }).toPromise()
      .catch(err => {
        console.error(err);
        request.wait = false;
        request[`wait_${key}`] = false;
        return;
      });
    if (response) {
      this.api.showToast(`Request answered`, ToastType.info);
      this.getGroup();
      request[`wait_${key}`] = false;
      request.wait = false;
    }
  }

  setValidatorForExternal() {
    const is_external = this.formGroup.get('is_external').value;
    if (is_external) {
      this.formGroup.get('external_url').setValidators([Validators.required])
    } else {
      this.formGroup.setControl('external_url', new FormControl(''));
      this.formGroup.get('external_url').setValidators([])
    }
  }

}
