import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastType } from 'src/app/login/ToastTypes';
import { GroupModel, GroupEventModel } from 'src/app/models/GroupModel';
import { MailingListContactNoteModel } from 'src/app/models/MailingListModel';
import { ApiService } from 'src/app/services/api.service';
import { GroupsService } from 'src/app/services/groups.service';
import { UserService } from 'src/app/services/user.service';
import { ContactNoteFormComponent } from '../contact-note-form/contact-note-form.component';
import { ConvertToUserComponent } from '../convert-to-user/convert-to-user.component';
import * as moment from 'moment';

@Component({
  selector: 'app-contact-detail',
  templateUrl: './contact-detail.component.html',
  styleUrls: ['./contact-detail.component.scss']
})
export class ContactDetailComponent implements OnInit {

  groups: GroupModel[] = [];
  events: GroupEventModel[] = [];

  currentUser: any;
  mailing_list_id: number;
  contact_id: number;

  contact: any = {
    notes: []
  };
  selected_contact: any;
  mailingList: any = {};

  @ViewChild('convert_to_user_form') convert_to_user_form: ConvertToUserComponent;
  loading_groups: boolean = true;
  loading_events: boolean = true;

  notes: MailingListContactNoteModel[] = [];
  back_url: string;
  is_v2: boolean;

  constructor(
    private api: ApiService,
    private userService: UserService,
    public modal: NgxSmartModalService,
    private route: ActivatedRoute,
    private group_service: GroupsService,
    private router: Router
  ) {
    this.currentUser = this.userService.getCurrentUser();
    this.mailing_list_id = this.route.snapshot.params["mailing_list_id"];
    this.contact_id = this.route.snapshot.params["id"];
  }

  ngOnInit() {
    const segments = this.router.url.split('/');
    this.back_url = segments.slice(0, segments.length - 3).join('/');
    this.is_v2 = this.router.url.includes('/v2/');
    this.getMailingList();
    this.api.get(`mailingList/${this.mailing_list_id}/contacts/${this.contact_id}`).subscribe(
      (data: any) => {
        this.contact = data;
        this.contact.messages = [];
        this.getGroups();
        this.getEvents();
      })
    this.getNotes();
  }

  getNotes() {
    this.api.get(`mailingList/${this.mailing_list_id}/contacts/${this.contact_id}/notes`).subscribe(
      (data: any) => {
        this.notes = data.notes;
        this.notes.forEach(x => {
          x.created_at_format = moment(x.created_at).utc().format("MMM. DD YYYY hh:mm A");
        })
      }, error => {
        this.notes = [];
      })
  }

  getMailingList() {
    // this.loading = true;
    this.api
      .get(`mailingList/${this.mailing_list_id}`, {
        idIglesia: this.currentUser.idIglesia,
      })
      .subscribe(
        (data: any) => {
          this.mailingList = data;
        },
        (error) => console.error(error)
      );
  }

  getEvents() {
    this.loading_events = true;
    this.group_service.getGroupsEventsByIdIglesia().subscribe(
      (data: any) => {
        this.events = data.events;
        this.contact.selected_events = this.events.filter(g => this.contact.events.includes(g.idGroupEvent));
        this.contact.selected_events_name = this.events.filter(g => this.contact.events.includes(g.idGroupEvent)).map(g => g.name).join(', ');
        this.loading_events = false;
      },
      (error) => {
        console.error(error);
        this.events = [];
        if (error.error.msg.Code === 404) {
          // this.group_service.api.showToast(
          //   `There aren't events yet.`,
          //   ToastType.info,
          //   `Nothing found.`
          // );
        } else {
          this.group_service.api.showToast(
            `Something happened while trying to get organization's events.`,
            ToastType.error
          );
        }
        this.loading_events = false;
      }
    );
  }

  getGroups() {
    this.loading_groups = true;
    this.group_service.getGroups()
      .subscribe((data: any) => {
        this.groups = data.groups;
        this.contact.selected_groups = this.groups.filter(g => this.contact.groups.includes(g.idGroup));
        this.contact.selected_groups_name = this.groups.filter(g => this.contact.groups.includes(g.idGroup)).map(g => g.title).join(', ');
        this.loading_groups = false;
      }, error => {
        console.error(error);
        this.loading_groups = false;
      });
  }

  openConvertToContact() {
    if (this.is_v2) {
      const supported_first_name = ['firstname', 'name', 'fullname', 'yourname'];
      let has_first_name = this.contact.answers.find(x => supported_first_name.includes(x.label.toLowerCase().replace(/ /g, '').trim()));
      if (has_first_name) {
        this.contact.name = has_first_name.value;
      }
      const supported_last_name = ['lastname', 'secondname', '', 'yourlastname'];
      let has_last_name = this.contact.answers.find(x => supported_last_name.includes(x.label.toLowerCase().replace(/ /g, '').trim()));
      if (has_last_name) {
        this.contact.last_name = has_last_name.value;
      }
      let has_email = this.contact.answers.find(x => x.idMailingListInputType === 10);
      if (has_email) {
        this.contact.email = has_email.value;
      }
      let has_phone = this.contact.answers.find(x => x.idMailingListInputType === 9);
      if (has_phone) {
        this.contact.phone = has_phone.value;
      }
    }
    this.selected_contact = Object.assign({}, this.contact);
    this.modal.get('convert_to_user_detail').open();
    setTimeout(() => {
      this.convert_to_user_form.ngOnInit();
    }, 200);
  }

  updateUser(event) {
    this.selected_contact = undefined;
    this.modal.get('convert_to_user_detail').close();
    this.api.patch(`mailingList/${this.mailing_list_id}/contacts/${this.contact_id}/accept`, {}).subscribe(
      (data: any) => {
        this.ngOnInit();
      },
      (error) => console.error(error)
    );
  }


  addNote(contact_note_form: ContactNoteFormComponent) {
    this.modal.getModal('contact_note_formModal_1').open();
    contact_note_form.contactNote = new MailingListContactNoteModel();
    contact_note_form.contactNote.idMailingListContact = this.contact.id;
    contact_note_form.contactNote.created_by = this.currentUser.idUsuario;
    contact_note_form.mailingList = this.mailingList;
    contact_note_form.contact = this.contact;
    // contact_note_form.iglesia = {
    //   idIglesia: this.contact.idIglesia,
    //   topic: this.contact.topic
    // };
    contact_note_form.ngOnInit();
  }

  updateNote(item: MailingListContactNoteModel, contact_note_form: ContactNoteFormComponent) {
    console.log(item);

    this.modal.getModal('contact_note_formModal_1').open();
    contact_note_form.contactNote = Object.assign({}, item);
    console.log(contact_note_form.contactNote);
    contact_note_form.contactNote.created_by = this.currentUser.idUsuario;
    contact_note_form.mailingList = this.mailingList;
    contact_note_form.contact = this.contact;
    // contact_note_form.iglesia = {
    //   idIglesia: this.contact.idIglesia,
    //   topic: this.contact.topic
    // };
    contact_note_form.ngOnInit();
  }

  deleteNote(item: MailingListContactNoteModel) {
    const confirmation = confirm(`Are you sure to delete this note?`);
    if (confirmation) {
      item.status = false;
      item.deleted_by = this.currentUser.idUsuario;
      this.api.post(`mailingList/${this.mailing_list_id}/contacts/${this.contact_id}/notes/delete`, item)
        .subscribe(response => {
          // this.resetTable();
          this.getNotes();
          this.api.showToast(`Record deleted successfully.`, ToastType.success);
        }, err => {
          this.api.showToast('Error deleting record.', ToastType.error);
        });
    }
  }


  onModalDidDismiss(response) {
    this.modal.getModal('contact_note_formModal_1').close();
    if (response) {
      // this.resetTable();
      this.getNotes();
    }
  }

  addClass(content: string) {
    return `<div class="content-container">${content}</div>`;
  }

}
