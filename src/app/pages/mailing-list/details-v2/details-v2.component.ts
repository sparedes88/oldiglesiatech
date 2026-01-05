import { environment as prod } from '../../../../environments/environment.prod';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormBuilder, FormControl } from '@angular/forms';
import { ConvertToUserComponent } from '../convert-to-user/convert-to-user.component';
import { Component, OnInit, ViewChild } from "@angular/core";
import { NgxSmartModalService } from "ngx-smart-modal";
import { UserService } from "src/app/services/user.service";
import { ApiService } from "src/app/services/api.service";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { GroupsService } from "src/app/services/groups.service";
import { GroupEventModel, GroupModel } from "src/app/models/GroupModel";
import { ToastType } from "src/app/login/ToastTypes";
import { environment } from "src/environments/environment";
import { ToastrService } from 'ngx-toastr';
import { FormArray, FormGroup } from '@angular/forms';
import * as moment from 'moment-timezone';
import { RandomService } from 'src/app/services/random.service';
import { ContactInboxService } from 'src/app/services/contact-inbox.service';
import { MailingListParams } from 'src/app/models/MailingListModel';

@Component({
  selector: "app-details-v2",
  templateUrl: "./details-v2.component.html",
  styleUrls: ["./details-v2.component.scss"],
})
export class DetailsV2Component implements OnInit {

  groups: GroupModel[] = [];
  events: GroupEventModel[] = [];
  linkLang: String = 'en'
  api_url = environment.apiUrl;
  selected_contact: any;
  @ViewChild('convert_to_user_form') convert_to_user_form: ConvertToUserComponent;
  loading_groups: boolean = true;
  loading_events: boolean = true;
  is_downloading: boolean = false;

  public selectCatOptions: any = {
    singleSelection: false,
    idField: 'idMailingListContactStatus',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  }

  public selectAdminOptions: any = {
    singleSelection: true,
    idField: 'assigned_to',
    textField: 'full_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  }

  statuses: any[] = [];
  admins: any[] = [];

  loading: boolean = false;
  view_columns: boolean = false;

  contacts_form: FormGroup = new FormGroup({
    contacts: new FormArray([])
  });

  contact_filters_form: FormGroup = this.form_builder.group({
    status: new FormControl([]),
    dates: new FormControl([]),
    assigned: new FormControl([]),
    name: new FormControl(''),
    hide_assigned: new FormControl(true),
    show: new FormControl('all'),
    show_notes: false,
    is_v2: true
  });

  mailing_filters = {
    statuses: [],
    dates: [],
    assigned_to: []
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

  constructor(
    public modal: NgxSmartModalService,
    public userService: UserService,
    private route: ActivatedRoute,
    private group_service: GroupsService,
    private toastr: ToastrService,
    private form_builder: FormBuilder,
    private contact_inbox_service: ContactInboxService
  ) {
    // Load current user
    this.currentUser = this.userService.getCurrentUser();
    this.mailingListId = this.route.snapshot.params["id"];
  }

  public mailingListId: any;
  public currentUser: any = {};
  public mailignListFormData = {
    id: null,
    name: "",
    idIglesia: null,
  };

  // Data
  public mailingList: any = {};
  public contacts: any[] = [];
  public saving: boolean = false;

  // Data tables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: "Blfrtip",
    lengthMenu: [10, 25, 50, 100, 250, 500],
    buttons: [
      { extend: "copy", className: "btn btn-outline-primary btn-sm" },
      {
        extend: "print",
        className: "btn btn-outline-primary btn-sm",
      },
      { extend: "csv", className: "btn btn-outline-primary btn-sm" },
    ],
  };

  test_times = [];
  test_times_prod = [];
  timezone: string;

  ngOnInit() {
    this.getMailingList();
    const timezone = moment.tz.guess();
    // const timezone = 'America/Mexico_City';
    this.timezone = timezone;
    console.log(timezone);
    console.log(moment.tz(timezone).format('z'));
    console.log(moment.tz(timezone).format('Z'));
    console.log(moment.tz(timezone).format('ZZ'));
    console.log(moment.tz(timezone).zoneAbbr());
    console.log(moment.tz(timezone).zoneName());
    console.log(moment.tz(timezone).parseZone());
    this.timezone = moment.tz(timezone).zoneAbbr();
    this.getTimes();
  }

  async getTimes() {
    const response: any = await this.contact_inbox_service.api.get('test_timezone', {}).toPromise();
    if (response) {
      this.test_times = response;
    }
    const response_prod: any = await this.contact_inbox_service.api.http.get(`${prod.apiUrl}/test_timezone`, {}).toPromise();
    if (response_prod) {
      this.test_times_prod = response_prod;
    }
  }

  getMailingList() {
    this.loading = true;
    this.contact_inbox_service.getContactInboxDetail(this.mailingListId, { idOrganization: this.currentUser.idIglesia, extended: true })
      .subscribe(
        (data: any) => {
          this.mailingList = data;
          this.getContacts();
        },
        (error) => console.error(error)
      );
  }

  getEvents() {
    this.loading_events = true;
    this.group_service.getGroupsEventsByIdIglesia().subscribe(
      (data: any) => {
        this.events = data.events;
        this.contacts.forEach(c => {
          if (c.created_at) {
            // c.created_at_format = moment(c.created_at).utc().format("MMM. DD YYYY hh:mm A");
            c.created_at_format = moment(c.new_created_at).format("MMM. DD YYYY hh:mm A");
          } else {
            c.created_at_format = ``;
          }
          c.selected_events = this.events.filter(g => c.events.includes(g.idGroupEvent));
        });
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
        this.contacts.forEach(c => {
          c.selected_groups = this.groups.filter(g => c.groups.includes(g.idGroup));
        });
        this.loading_groups = false;
      }, error => {
        console.error(error);
        this.loading_groups = false;
      });
  }

  getContacts() {
    this.contact_inbox_service.getContacts(this.mailingListId).subscribe(
      (data: any) => {
        this.contacts = data;
        const form_array = this.contacts_form.get('contacts') as FormArray;
        while (form_array.length > 0) {
          form_array.removeAt(0);
        }

        const statuses = [];
        const assigned_to_users = [];
        const dates = [];



        this.contacts.forEach((c, index, arr) => {
          c.full_name = `${c.first_name} ${c.last_name}`;
          c.group = 'All';
          c.index = index;
          c.categories.forEach(element => {
            statuses.push(element)
          });
          if (c.assigned_to_user && c.assigned_to_user != ' ') {
            assigned_to_users.push(c.assigned_to_user);
          }
          if (c.created_at) {
            c.fixed_date = moment(c.created_at).format('MMM-DD. YYYY');
            dates.push(c.fixed_date);
          }

          const form_group = new FormGroup({
            id: new FormControl(c.id),
            first_name: new FormControl(c.first_name),
            last_name: new FormControl(c.last_name),
            created_at: new FormControl(c.created_at),
            assigned_to: new FormControl(c.assigned_to)
          });
          form_array.push(form_group);
        })

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
            const size = this.contacts.filter(mc => moment(mc.created_at).format('MMM-DD. YYYY') === date_name);
            date_name = `${date_name} (${size.length})`
            return date_name
          });

        dates_clear.sort((a, b) => {
          const a_date = moment(a.substring(0, 12), 'MMM-DD. YYYY');
          return a_date.isAfter(moment(b.substring(0, 12), 'MMM-DD. YYYY')) ? -1 : 1;
        })

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

        this.restartTable();
        this.getGroups();
        this.getEvents();
        this.getAdmins();
        this.getCategories();
        this.loading = false;
      },
      (error) => console.error(error),
      () => {
        // this.dtTrigger.next()
      }
    );
  }
  getAdmins() {
    this.contact_inbox_service.api.get(`getUsuarios`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (contacts: any) => {
          this.admins = contacts.usuarios.filter(u => {
            u.assigned_to = u.idUsuario;
            u.full_name = `${u.nombre} ${u.apellido}`;
            return u.estatus && u.idUserType === 1
          });

          this.contacts.forEach(c => {
            c.assigned_user = this.admins.filter(x => x.idUsuario == c.assigned_to);
          });
        }, err => console.error(err))
  }

  getCategories() {
    // this.loading_groups = true;
    const params: Partial<MailingListParams> = {
      idOrganization: this.currentUser.idIglesia
    };
    this.contact_inbox_service.getCategoriesForContactInbox(this.mailingListId, params)
      .subscribe(
        (data: any) => {
          this.statuses = data.categories;
          this.contacts.forEach((c, index, arr) => {
            c.category = this.statuses.filter(x => c.idMailingListContactStatuses.includes(x.idMailingListContactStatus));
            const form_group = this.contacts_form_array.at(index) as FormGroup;
            c.checked_count = 0;
            this.statuses.forEach(x => {
              const category_status = c.categories.find(cat => cat.idMailingListContactStatus === x.idMailingListContactStatus);
              const is_checked = category_status ? true : false;
              if (is_checked) {
                c.checked_count++;
              }
              c[`status_${x.idMailingListContactStatus}`] = is_checked;
              form_group.addControl(`status_${x.idMailingListContactStatus}`, new FormControl(is_checked));
            });
            c.checked_percent = c.checked_count * 100 / this.statuses.length
          });
          // this.loading_groups = false;
        }, error => {
          console.error(error);
          // this.loading_groups = false;
        });
  }

  get contacts_form_array() {
    return this.contacts_form.get('contacts') as FormArray;
  }

  get hide_assigned(): boolean {
    return this.contact_filters_form.get('hide_assigned').value;
  }

  get selected_statuses(): any[] {
    const filter_value = this.contact_filters_form.value;
    if (filter_value.status.length > 0) {
      const selected_ids = filter_value.status.map(x => x.idMailingListContactStatus);
      return this.statuses.filter(x => selected_ids.includes(x.idMailingListContactStatus));
    }
    return this.statuses;
  }

  get mailing_contacts_filtered() {
    const filters = this.contact_filters_form.value;
    let mailing = [...this.contacts];
    if (filters.assigned.length > 0) {
      mailing = mailing.filter(x => filters.assigned.includes(x.assigned_to_user));
    }
    if (filters.dates.length > 0) {
      const dates = filters.dates.map(x => x.substring(0, 12));
      mailing = mailing.filter(x => x.fixed_date && dates.includes(x.fixed_date));
    }
    if (filters.status.length > 0) {
      const ids = filters.status.map(x => x.idMailingListContactStatus);
      if (ids.length == 1) {
        if (filters.show == 'complete') {
          mailing = mailing.filter(x => x.idMailingListContactStatuses.filter(y => ids.includes(y)).length > 0);
        } else if (filters.show == 'incomplete') {
          mailing = mailing.filter(x => x.idMailingListContactStatuses.filter(y => ids.includes(y)).length == 0);
        }
      } else {
        if (filters.show == 'complete') {
          mailing = mailing.filter(x => x.idMailingListContactStatuses.filter(y => ids.includes(y)).length == ids.length);
        } else if (filters.show == 'incomplete') {
          mailing = mailing.filter(x => x.idMailingListContactStatuses.filter(y => ids.includes(y)).length == ids.length - 1);
        }
      }
    } else {
      if (filters.show == 'complete') {
        mailing = mailing.filter(x => x.checked_percent == 100);
      } else if (filters.show == 'incomplete') {
        mailing = mailing.filter(x => x.checked_percent < 100);
      }
    }
    if (filters.name.length != '') {
      mailing = mailing.filter(x => x.full_name.toLowerCase().includes(filters.name.toLowerCase()));
    }
    return mailing;
  }

  restartTable(): void {
    // if (this.dtElement.dtInstance) {
    //   this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //     dtInstance.destroy();
    //   });
    // }
  }

  get embedCode() {
    return {
      entry_point: `<div id="mailingListApp"></div>`,
      scripts: `<script>
var IDMAILINGLIST = ${this.mailingListId}
var LANG = '${this.linkLang}'
</script>
<script src="https://cdn.jsdelivr.net/npm/vue@2.5.16/dist/vue.js"></script>
<script src="https://cdn.jsdelivr.net/npm/v-mask/dist/v-mask.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment-with-locales.min.js"></script>
<script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/vueCountryCode"></script>
<script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/mailingList/scripts"></script>
<script src="https://kit.fontawesome.com/a617da3919.js" crossorigin="anonymous"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flexboxgrid/6.3.1/flexboxgrid.min.css">
<link rel="stylesheet" href="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/form_style">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.8.1/css/bulma.min.css">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-eOJMYsd53ii+scO/bJGFsiCZc+5NDVN2yr8+0RDqr0Ql0h+rP48ckxlpbzKgwra6" crossorigin="anonymous">
`,
      link_without_lang: `${this.api_url}/public/contact_inbox/${this.mailingListId}`,
      direct_link: `${this.api_url}/public/contact_inbox/${this.mailingListId}?lang=${this.linkLang}`
    };
  }

  showAnswer(answer) {
    if (answer === undefined) {
      return;
    } else {
      if (answer) {
        return 'Yes';
      } else {
        return 'No';
      }
    }
  }

  openConvertToContact(contact) {
    const supported_first_name = ['firstname', 'name', 'fullname', 'yourname'];
    // let has_first_name = contact.answers.find(x => (supported_first_name.includes(x.label.toLowerCase().replace(/ /g, '').trim()) || x.idMailingListInputType === 1));
    let has_first_name = contact.answers.find(x => (supported_first_name.some(value=> x.label.toLowerCase().replace(/ /g, '').trim().includes(value))) || x.idMailingListInputType === 1);
    if (has_first_name) {
      contact.name = has_first_name.value;
    }
    const supported_last_name = ['lastname', 'secondname', 'apellido', 'yourlastname'];
    // let has_last_name = contact.answers.find(x => (supported_last_name.includes(x.label.toLowerCase().replace(/ /g, '').trim() || x.idMailingListInputType === 2)));
    let has_last_name = contact.answers.find(x => (supported_last_name.some(value=> x.label.toLowerCase().replace(/ /g, '').trim().includes(value))) || x.idMailingListInputType === 2);
    if (has_last_name) {
      contact.last_name = has_last_name.value;
    }
    let has_email = contact.answers.find(x => x.idMailingListInputType === 10);
    if (has_email) {
      contact.email = has_email.value;
    }
    let has_phone = contact.answers.find(x => x.idMailingListInputType === 9);
    if (has_phone) {
      contact.phone = has_phone.value;
    }

    this.selected_contact = Object.assign({}, contact);
    this.modal.get('convert_to_user').open();
    setTimeout(() => {
      this.convert_to_user_form.ngOnInit();
    }, 200);
  }

  updateUser(event) {
    this.selected_contact = undefined;
    this.modal.get('convert_to_user').close();
    this.contact_inbox_service.api.patch(`mailingList/${this.mailingListId}/contacts/${event.contact.id}/accept`, {}).subscribe(
      (data: any) => {
        this.restartTable();
        this.ngOnInit();
      },
      (error) => console.error(error),
      () => {
        // this.dtTrigger.next()
      }
    );
  }

  updateStatus(contact) {
    // this.loading = true;
    contact.created_by = this.currentUser.idUsuario;
    this.contact_inbox_service.api.patch(`mailingList/${this.mailingListId}/contacts/${contact.id}/status/`, contact)
      .subscribe(
        (data: any) => {
          this.toastr.success('Contact updated successfully!', 'Success');
          this.restartTable();
          this.ngOnInit();
        },
        (error) => console.error(error),
        () => {
          // this.dtTrigger.next()
        }
      );
  }

  updateUserField(event, contact, key_field: string) {
    // this.loading = true;
    contact[key_field] = event[key_field];
    this.contact_inbox_service.api.patch(`mailingList/${this.mailingListId}/contacts/${contact.id}/update/${key_field}`, contact)
      .subscribe(
        (data: any) => {
          this.toastr.success('Contact updated successfully!', 'Success');
          this.restartTable();
          // this.ngOnInit();
          if (key_field === 'assigned_to') {
            contact.assigned_user = this.admins.filter(x => x.idUsuario == contact[key_field]);
            contact.assigned_to_user = event.full_name;
          }
          contact._editable = false;
        },
        (error) => console.error(error),
        () => {
          // this.dtTrigger.next()
        }
      );
  }

  deleteContact(contact_inbox) {
    if (confirm(`Are you sure you want to delete this contact? \n This action can't be undone`)) {
      this.contact_inbox_service.api.delete(`mailingList/${contact_inbox.idMailingList}/contacts/${contact_inbox.id}?deleted_by=${this.currentUser.idUsuario}`)
        .subscribe(response => {
          this.toastr.success(`Contact deleted successfully`);
          // this.restartTable();
          this.ngOnInit();
        }, error => {
          console.error(error);
          this.toastr.error(`Something goes wrong trying to delete the contact.`);
        });
    }
  }

  setStatus(contact, i: number, status) {
    const form_group = this.contacts_form_array.at(contact.index);
    // this.loading = true;
    contact.created_by = this.currentUser.idUsuario;
    const payload = {
      created_by: this.currentUser.idUsuario,
      idMailingListContactStatus: status.idMailingListContactStatus,
      checked: form_group.value[`status_${status.idMailingListContactStatus}`]
    };
    if (payload.checked) {
      contact.idMailingListContactStatuses.push(status.idMailingListContactStatus);
    } else {
      contact.idMailingListContactStatuses = contact.idMailingListContactStatuses.filter(x => x !== status.idMailingListContactStatus);
    }
    const statuses = Object.keys(form_group.value).filter(x => x.startsWith('status_'));
    contact.checked_count = 0;
    statuses.forEach(x => {
      const is_checked = form_group.value[x] ? true : false;
      contact[x] = is_checked;
      if (is_checked) {
        contact.checked_count++;
      }
    });
    contact.checked_percent = contact.checked_count * 100 / this.statuses.length
    this.contact_inbox_service.api.patch(`mailingList/${this.mailingListId}/contacts/${contact.id}/status/`, payload)
      .subscribe(
        (data: any) => {
          this.toastr.success('Contact updated successfully!', 'Success');
          this.restartTable();
          // this.ngOnInit();
        },
        (error) => console.error(error),
        () => {
          // this.dtTrigger.next()
        }
      );
  }

  get percent(): number {
    const total = this.mailing_contacts_filtered.length;
    if (total > 0) {
      let percents = 0;
      this.mailing_contacts_filtered.forEach(x => percents += x.checked_percent);
      return percents / total;
    } else {
      return 0;
    }
  }

  get get_width(): string {
    let columns_count = 4;

    columns_count += this.statuses.length;
    if (this.view_columns) {
      columns_count += 8;
    } else {
      if (this.mailingList) {
        if (this.mailingList.setup) {
          this.mailingList.setup.hide_emails ? null : columns_count++;
          this.mailingList.setup.hide_phones ? null : columns_count++;
          this.mailingList.setup.hide_message_input ? null : columns_count++;
          this.mailingList.setup.display_events ? columns_count++ : null;
          this.mailingList.setup.display_groups ? columns_count++ : null;
          this.mailingList.setup.display_e_group_question ? columns_count++ : null;
          this.mailingList.setup.display_e_team_question ? columns_count++ : null;
          this.mailingList.setup.hide_custom_input ? null : columns_count++;
        }
      }
    }
    const width = (columns_count * 200) + 150;
    return `${width}px`;
  }

  getStatusPercent(status) {
    const total = this.mailing_contacts_filtered.length;
    if (total > 0) {
      const total_by_status = this.mailing_contacts_filtered.filter(x => x[`status_${status.idMailingListContactStatus}`]).length;
      return total_by_status * 100 / total;
    } else {
      return 0;
    }
  }

  openLinkInBrowser(language: 'en' | 'es') {
    const win = window.open(`${environment.site_url}/contact-forms/v2/${this.mailingListId}/view?idOrganization=${this.mailingList.idIglesia}`, '_blank');
    win.focus();
  }

  async printReport() {
    this.is_downloading = true;
    const payload = this.contact_filters_form.value;
    const settings: {
      dates?: string[];
      statuses?: number[];
      contacts?: number[];
      idIglesia: number;
      show?: string;
      show_notes: boolean;
      is_v2: boolean;
    } = {
      dates: payload.dates,
      statuses: payload.status.map(x => x.idMailingListContactStatus),
      contacts: [],
      idIglesia: this.currentUser.idIglesia,
      show: payload.show,
      show_notes: payload.show_notes,
      is_v2: payload.is_v2
    };
    const response = await this.contact_inbox_service.api.post(`mailingList/${this.mailingListId}/filter/contacts/pdf`, settings, {
      responseType: 'arraybuffer'
    }).toPromise()
      .catch(error => {
        console.error(error);
        this.contact_inbox_service.api.showToast(`Error downloading the report`, ToastType.error);
        this.is_downloading = false;
        return;
      });
    if (response) {
      const fileBlob = new Blob([response], { type: 'application/pdf' })
      const fileData = window.URL.createObjectURL(fileBlob)
      // Generate virtual link
      let link = document.createElement('a')
      link.href = fileData
      link.download = `contact_inbox_name${`_${moment().format('MM-DD-YYYY_hh-mm-A')}`}_${RandomService.makeId(5)}`
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      this.is_downloading = false;
      link.addEventListener(('cancel'), () => {
        this.is_downloading = false;
      });
      setTimeout(() => {
        // For Firefox it is necessary to delay revoking the ObjectURL
        this.is_downloading = false;
        window.URL.revokeObjectURL(fileData);
        link.remove();
      }, 100);
    }
  }

  getValue(contact, input) {
    const input_v = contact.answers.find(x => x.id == input.id);
    if (input_v) {
      return input_v.value;
    }
    return '';
  }
}
