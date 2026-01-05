import { FileUploadService } from './../../../services/file-upload.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Component, OnInit, Output, EventEmitter, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { UserService } from "src/app/services/user.service";
import { ApiService } from "src/app/services/api.service";
import { MatSnackBar } from "@angular/material";
import { ChatService } from "src/app/services/chat.service";
import { Channel } from "twilio-chat/lib/channel";
import * as moment from 'moment';

@Component({
  selector: "app-message-form",
  templateUrl: "./message-form.component.html",
  styleUrls: ["./message-form.component.scss"],
})
export class MessageFormComponent implements OnInit {

  @ViewChild('img_tag') img_tag: any;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private api: ApiService,
    private snackbar: MatSnackBar,
    private chatService: ChatService,
    private fileUpload: FileUploadService
  ) {
    this.currentUser = this.userService.getCurrentUser();
    this.currentUsername = `${this.currentUser.nombre} ${this.currentUser.apellido} <${this.currentUser.email}>`;
  }

  @Output() onSubmit = new EventEmitter();
  @Output() on_close = new EventEmitter();

  public contacts: any[] = [];
  public mailing_contacts: any[] = [];

  mailing_filters = {
    dates: [],
    assigned_to: [],
    statuses: []
  }

  selectStatusOption: IDropdownSettings = {
    singleSelection: false,
    idField: 'idMailingListContactStatus',
    textField: 'name',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  selectUserTypeOptions: IDropdownSettings = {
    singleSelection: false,
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  public groups: any[] = [];
  public mailingLists: any[] = [];
  public sending: boolean = false;

  public currentUser: any;
  public currentUsername: string;

  public messageForm: FormGroup = this.formBuilder.group({
    subject: [""],
    message: ["", Validators.required],
    messageType: ["", Validators.required],
    isGroup: [""],
    groupName: [""],
    idUser: [],
    idIglesia: [],
    groups: [],
    mailingLists: [],
    send_to: ["", Validators.required],
    users: [""],
    contact_items: [""],
    nombreIglesia: [],
    media: new FormControl()
  });

  contact_filters_form: FormGroup = this.formBuilder.group({
    status: new FormControl([]),
    dates: new FormControl([]),
    assigned: new FormControl([])
  })

  file: any;

  ngOnInit() {
    this.messageForm.patchValue({
      idUser: this.currentUser.idUsuario,
      idIglesia: this.currentUser.idIglesia,
      nombreIglesia: this.currentUser.iglesia,
      groups: [],
      users: [],
    });

    this.getGroups();
    this.getContacts();
    this.getMailingLists()
  }

  getContacts() {
    this.api
      .get(`getUsuarios`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (contacts: any) => {
          contacts.usuarios.map((u) => {
            u.group = "All";
            u.name = `${u.nombre} ${u.apellido}`;
          });
          this.contacts = contacts.usuarios;
        },
        (err) => console.error(err)
      );
  }

  getGroups() {
    this.api
      .get("groups/getGroups", {
        idIglesia: this.currentUser.idIglesia,
      })
      .subscribe((data: any) => {
        if (data.groups) {
          data.groups.map((g) => (g.group = "All"));
          this.groups = data.groups;
        }
      });
  }

  getMailingLists() {
    this.api
      .get(`mailingList/`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          this.mailingLists = data;
        },
        (error) => console.error(error)
      );
  }

  getGroupMembers() {
    const groups_selected = this.messageForm.value.groups;

    if (groups_selected.includes('All')) {
      this.groups.map(group => {
        let memberIds = [];
        this.api
          .post(`groups/detail/${group.idGroup}`, {
            idIglesia: this.currentUser.idIglesia,
            idUsuario: this.currentUser.idUsuario,
          })
          .subscribe((data: any) => {

            if (this.messageForm.value.users) {
              memberIds.push(...this.messageForm.value.users);
            }

            if (data.group && data.group.members) {
              data.group.members.map((m) => {
                memberIds.push(m.idUser);
              });
            }
            if (data.group && data.group.leaders) {
              data.group.leaders.map((m) => {
                memberIds.push(m.idUser);
              });
            }
            const unique = memberIds.filter((value, index, self) => {
              return self.indexOf(value) === index
            })
            this.messageForm.patchValue({
              users: unique,
            });
          });
      })
    } else {
      groups_selected.map((groupId) => {
        this.api
          .post(`groups/detail/${groupId}`, {
            idIglesia: this.currentUser.idIglesia,
            idUsuario: this.currentUser.idUsuario,
          })
          .subscribe((data: any) => {
            let memberIds = [];

            if (this.messageForm.value.users) {
              memberIds.push(...this.messageForm.value.users);
            }

            if (data.group && data.group.members) {
              data.group.members.map((m) => {
                memberIds.push(m.idUser);
              });
            }
            if (data.group && data.group.leaders) {
              data.group.leaders.map((m) => {
                memberIds.push(m.idUser);
              });
            }
            const unique = memberIds.filter((value, index, self) => {
              return self.indexOf(value) === index
            })
            console.log(unique);

            this.messageForm.patchValue({
              users: unique,
            });
          });
      });
    }

    if (!groups_selected.length) {
      this.messageForm.patchValue({
        users: [],
      });
    }
  }

  async submitForm(form: FormGroup) {
    if (form.invalid) {
      alert(`Please check the form and try again.`);
    }

    this.sending = true;
    const payload = form.value;
    if (payload.users.length > 0) {
      if (payload.users[0] === 'All') {
        let memberIds = [];
        memberIds = this.contacts.map(x => x.idUsuario);
        payload.users = memberIds;
      }
    }

    if (this.file) {
      const response_image: any = await this.fileUpload.uploadFile(this.file, true, 'chat').toPromise();
      const path = this.fileUpload.cleanPhotoUrl(response_image.response);
      const url = `${this.fileUpload.api.baseUrl}${path}`;
      payload.mediaUrl = [url];
    } else {
      payload.mediaUrl = undefined;
    }
    console.log(payload);

    this.api.post(`chat/log`, payload).subscribe(
      (data: any) => {
        this.onSubmit.emit();
        this.snackbar.open(`Your message was sent.`, "OK", { duration: 3000 });
        this.sending = false;
        // Send message to each user
        if (form.value.messageType == "chat" && !form.value.isGroup) {
          data.users.map((user: any) => {
            this.createChannel(user, form.value.message);
          });
        } else {
          console.log(data.users)
          if (form.value.messageType == "chat") {
            this.createChannel('', form.value.message, form.value.groupName, data.users);
            data.users.map((user: any) => {
              console.log(user)
              this.createChannel(user, form.value.message, form.value.groupName);
            });
          } else {
            console.log("no es un chat")
          }
        }
      },
      (err) => {
        console.error(err);
        this.snackbar.open(
          `Please check the form and try again. ${err}`,
          "OK",
          { duration: 3000 }
        );
        this.sending = false;
      }
    );
  }

  resetSelection() {
    this.messageForm.patchValue({
      groups: [],
      users: [],
      contact_items: []
    });
  }

  connectToChatService() {
    this.sending = true;
    this.api
      .post(`chat`, {
        identity: this.currentUsername,
        deviceId: "web",
      })
      .subscribe(
        (data: any) => {
          this.chatService.connect(data.chatToken);
          this.sending = false;
        },
        (err) => {
          console.error(err);
          this.sending = false;
        }
      );
  }
  getChatToken(identity: string) {
    this.api
      .post(`chat`, {
        identity: identity,
        deviceId: "web",
      })
      .subscribe(
        (data: any) => {
          this.chatService.connectByEmail(data.token);
        },
        (err) => {
          console.error(err);
        }
      );
  }
  async add_person(identity, channel?: Channel, data?: any) {
    if (channel && identity) {
      channel.add(identity).then((response: any) => {
        console.log("añadido " + identity)
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
  createChannel(user: any, message: string, name?: string, users?: any[]) {
    const uniqueName = name ? `${this.currentUser.iglesia}- Group -${name}` : `${this.currentUser.iglesia}-${this.currentUser.email}-${user.email}`;
    const invitedUser: string = !name ? `${user.name} ${user.lastName} <${user.email}>` : undefined;

    console.log(invitedUser);

    this.chatService
      .createChannel(
        name ? `${this.currentUser.iglesia} - Group - ${name}` : `${this.currentUser.iglesia} - ${user.name} ${user.lastName}
        - ${this.currentUser.nombre} ${this.currentUser.apellido}`,
        true,
        uniqueName
      )
      .then((channel: Channel) => {
        this.joinToChannel(channel, message);
        if (name && users) {
          users.forEach((value, index) => {
            const invitedUser: string = `${value.name} ${value.lastName} <${value.email}>`;
            this.add_person(invitedUser, channel).finally(() => {
              console.log("todos añadidos")
            })
          })
        } else {
          this.add_person(invitedUser, channel).then((value) => {
          }).catch((reason) => {
          }).finally(() => {
          })
        }
      })
      .catch((err) => {
        this.sendMessageExistingChannel(uniqueName, message, invitedUser);
      });
    return false;
  }

  sendMessageExistingChannel(channelName, message, invitedUser) {
    this.chatService
      .getChannelByUniqueName(channelName)
      .then((channel: Channel) => {
        this.joinToChannel(channel, message);
        channel.add(invitedUser);
      });
  }

  joinToChannel(channel: Channel, message) {
    channel
      .join()
      .then((r) => {
        channel.sendMessage(message);
      })
      .catch((e) => {
        if (e.message.indexOf("already exists") > 0) {
          channel.sendMessage(message);
        }
      });
  }

  getMailingListContacts(event) {
    const ids = this.messageForm.value.contact_items.map(x => x);
    this.mailing_contacts = [];
    event.forEach(x => {
      this.api.get(`mailingList/${x.id}/contacts`).subscribe(
        (data: any) => {
          const contacts = data;

          this.mailing_contacts = this.mailing_contacts.concat(contacts);
          const statuses = [];
          const assigned_to_users = [];
          const dates = [];
          this.mailing_contacts.forEach(x => {
            x.group = 'All';
            x.categories.forEach(element => {
              statuses.push(element)
            });
            if (x.assigned_to_user && x.assigned_to_user != ' ') {
              assigned_to_users.push(x.assigned_to_user);
            }
            if (x.created_at) {
              x.fixed_date = moment(x.created_at).format('MMM-DD. YYYY');
              dates.push(x.fixed_date);
            }
            x.full_name = `${x.first_name} ${x.last_name} (${x.fixed_date})`;
          });
          const statuses_clear = statuses
            .map((e) => e.idMailingListContactStatus)
            .map((e, index, final) => final.indexOf(e) === index && index)
            .filter((e) => statuses[e])
            .map((e) => statuses[e]);
          const dates_clear = dates
            .map((e) => e)
            .map((e, index, final) => final.indexOf(e) === index && index)
            .filter((e) => dates[e])
            .map((e) => {
              let date_name = dates[e];
              const size = this.mailing_contacts.filter(mc => moment(mc.created_at).format('MMM-DD. YYYY') === date_name);
              date_name = `${date_name} (${size.length})`
              return date_name
            });

          const assigned_to_users_clear = assigned_to_users
            .map((e) => e)
            .map((e, index, final) => final.indexOf(e) === index && index)
            .filter((e) => assigned_to_users[e])
            .map((e) => assigned_to_users[e]);
          this.mailing_filters = {
            statuses: statuses_clear,
            dates: dates_clear,
            assigned_to: assigned_to_users_clear
          }
          const actual_ids = this.mailing_contacts.map(x => x.id);
          const existing_ids = ids.filter(x => actual_ids.includes(x));
          this.messageForm.get('contact_items').setValue(existing_ids);
        });
    });
  }

  closeForm() {
    this.messageForm.reset();
    this.on_close.emit();
  }

  get mailing_contacts_filtered() {
    const filters = this.contact_filters_form.value;

    let mailing = [...this.mailing_contacts];
    if (filters.assigned.length > 0) {
      mailing = mailing.filter(x => filters.assigned.includes(x.assigned_to_user));
    }
    if (filters.dates.length > 0) {
      const dates = filters.dates.map(x => x.substring(0, 12));
      mailing = mailing.filter(x => x.fixed_date && dates.includes(x.fixed_date));
    }
    if (filters.status.length > 0) {
      const ids = filters.status.map(x => x.idMailingListContactStatus);
      mailing = mailing.filter(x => x.idMailingListContactStatuses.filter(y => ids.includes(y)).length > 0);
    }
    return mailing;
  }

  getMaxLength() {
    const value = this.messageForm.value;
    if (value.messageType === 'sms') {
      if (value.message.length >= 160) {
        return 300;
      } else {
        return 160;
      }
    } else {
      return 2048;
    }
  }

  addAttachment() {

  }

  addDefaultEntryPhoto(file: File) {
    this.file = file;

    if (this.file) {
      setTimeout(() => {
        this.img_tag.nativeElement.src = URL.createObjectURL(this.file);
      }, 600);
    } else {
      setTimeout(() => {
        this.img_tag.nativeElement.src = '';
      }, 600);
    }
  }
}
