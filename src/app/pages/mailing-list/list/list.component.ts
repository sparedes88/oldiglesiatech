import { ToastType } from './../../contact/toastTypes';
import { FormControl, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Component, OnInit, ViewChild } from "@angular/core";
import { NgxSmartModalService } from "ngx-smart-modal";
import { UserService } from "src/app/services/user.service";
import { DataTableDirective } from "angular-datatables";
import { Subject, Observable } from "rxjs";
import { FileUploadService } from 'src/app/services/file-upload.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ToastrService } from 'ngx-toastr';
import { MailingListFormV2Component } from '../mailing-list-form-v2/mailing-list-form-v2.component';
import { environment } from 'src/environments/environment';
import { ContactInboxService } from 'src/app/services/contact-inbox.service';
import { MailingListParams } from 'src/app/models/MailingListModel';
import { Router } from '@angular/router';

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.scss"],
})
export class ListComponent implements OnInit {

  @ViewChild('mailing_list_form_v2') mailing_list_form_v2: MailingListFormV2Component;
  is_v2: boolean;

  constructor(
    public modal: NgxSmartModalService,
    public userService: UserService,
    private fus: FileUploadService,
    private toastr: ToastrService,
    private contact_inbox_service: ContactInboxService,
    private router: Router
  ) {
    // Load current user
    this.currentUser = this.userService.getCurrentUser();
  }

  get iframeCode() {
    return {
      direct_link: `${environment.site_url}/contact-forms/v2/${this.mailing_list_id}/view?idOrganization=${this.currentUser.idIglesia}`
    };
  }

  public showSettings = false;
  mailing_list_id: number;
  public settings = { lang: 'en', notification_type: 3, all_admins: true, admins: [] }
  public currentUser: any = {};
  mailignListFormData: FormGroup = new FormGroup({
    name: new FormControl("", [Validators.required]),
    idIglesia: new FormControl(null, [Validators.required]),
    setup: new FormGroup({
      display_groups: new FormControl(true, [Validators.required]),
      display_events: new FormControl(true, [Validators.required]),
      display_e_team_question: new FormControl(true, [Validators.required]),
      display_e_group_question: new FormControl(true, [Validators.required]),
      question_1_text: new FormControl('', [Validators.maxLength(1000)]),
      question_1_answer_1: new FormControl('', [Validators.maxLength(1000)]),
      question_1_answer_2: new FormControl('', [Validators.maxLength(1000)]),
      question_2_text: new FormControl('', [Validators.maxLength(1000)]),
      question_2_answer_1: new FormControl('', [Validators.maxLength(1000)]),
      question_2_answer_2: new FormControl('', [Validators.maxLength(1000)]),
      header_text: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      message_text: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      picture: new FormControl('', [Validators.maxLength(1500)]),
      icon_color: new FormControl('#ff7f50', [Validators.maxLength(10)]),
      sunday_service: new FormControl('', [Validators.maxLength(8000)]),
      display_contact_info: new FormControl(false, [Validators.required]),
      hide_picture: new FormControl(true, [Validators.required]),
      hide_address: new FormControl(true, [Validators.required]),
      hide_phones: new FormControl(true, [Validators.required]),
      hide_emails: new FormControl(true, [Validators.required]),
      hide_sunday_service: new FormControl(true, [Validators.required]),
      show_picture: new FormControl(false, [Validators.required]),
      show_address: new FormControl(false, [Validators.required]),
      show_phones: new FormControl(false, [Validators.required]),
      show_emails: new FormControl(false, [Validators.required]),
      show_sunday_service: new FormControl(false, [Validators.required]),
      hide_message_input: new FormControl(false, [Validators.required]),
      show_message_input: new FormControl(true, [Validators.required]),
      hide_email_input: new FormControl(false, [Validators.required]),
      show_email_input: new FormControl(true, [Validators.required]),
      email_required_input: new FormControl(true, [Validators.required]),
      phone_required_input: new FormControl(true, [Validators.required]),
      first_name_required_input: new FormControl(true, [Validators.required]),
      last_name_required_input: new FormControl(true, [Validators.required]),
      message_required_input: new FormControl(true, [Validators.required]),
      hide_custom_input: new FormControl(false, [Validators.required]),
      show_custom_input: new FormControl(true, [Validators.required]),
      custom_required_input: new FormControl(true, [Validators.required]),
      inline: new FormControl(true, [Validators.required]),
      row_size: new FormControl(5, [Validators.min(1), Validators.max(15)]),
      custom_type: new FormControl('number', []),
      custom_text: new FormControl('Custom label', [Validators.maxLength(1000)]),
      custom_placeholder: new FormControl('Placeholder', [Validators.maxLength(1000)]),
      question_1_as_check: new FormControl(false, [Validators.required]),
      question_2_as_check: new FormControl(false, [Validators.required]),
      order_array: new FormControl(),
      button_settings: new FormGroup({
        button_color: new FormControl('#e65100', [Validators.required]),
        text_color: new FormControl('#ffffff', [Validators.required]),
        text: new FormControl('Subscribe', [Validators.required]),
        width: new FormControl(40, [Validators.required]),
        align: new FormControl('center', [Validators.required]),
        border_radius: new FormControl(4, [Validators.required, Validators.max(20), Validators.min(1)])
      }),
      thank_you_message: new FormControl('Thanks for subscribing to our mailing list!', [Validators.required, Validators.maxLength(1000)])
    })
  });

  questions = [
    {
      id: 'first_name',
      name: 'First name',
      order: 1
    },
    {
      id: 'last_name',
      name: 'Last name',
      order: 2
    },
    {
      id: 'email',
      name: 'Email',
      order: 3
    },
    {
      id: 'phone',
      name: 'Phone',
      order: 4
    },
    {
      id: 'message',
      name: 'Message',
      order: 5
    },
    {
      id: 'custom',
      name: 'Custom',
      order: 6
    }
  ]

  // Data
  public mailingLists: any[] = [];
  public saving: boolean = false;
  public show_form: boolean = false;
  public selectedAdmins = []
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

  ngOnInit() {
    this.is_v2 = this.router.url.endsWith('v2');

    this.getMailingLists();
  }

  getMailingLists() {
    console.log(this.router.url);
    const version = this.router.url.endsWith('v1') ? 'v1' : 'v2';
    const params: Partial<MailingListParams> = {
      idOrganization: this.currentUser.idIglesia,
      version
    }
    this.contact_inbox_service.getContactInboxes(params)
      // api.get(`mailingList/`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          this.mailingLists = data;
          this.restartTable();
        },
        (error) => console.error(error),
        () => this.dtTrigger.next()
      );
    this.getSettings()
  }
  getSettings() {
    const params: Partial<MailingListParams> = {
      idOrganization: this.currentUser.idIglesia
    }
    this.contact_inbox_service.getSettings(params)
      .subscribe(
        (data: any) => {
          this.settings = data
          this.settings.admins.unshift({
            full_name: "All",
            id: 0,
            idUser: 0,
            lastName: "Lord",
            name: "All",
          })
          this.settings.all_admins == true ? this.selectedAdmins = [0] : this.selectedAdmins = data.currentAdmins.map(function (obj) {
            return obj.idUserOrganization;
          });
        },
        (error) => console.error(error),
      );
  }
  click(event: Array<any>) {
    if (event[event.length - 1].id == 0) {
      this.selectedAdmins = [0]
      this.settings.all_admins = true
    } else {
      this.selectedAdmins = (this.selectedAdmins.filter(item => item !== 0))
      this.settings.all_admins = false
    }
  }

  saveSettings() {
    const payload = {
      lang: this.settings.lang,
      idIglesia: this.currentUser.idIglesia,
      notification_type: this.settings.notification_type,
      all_admins: this.settings.all_admins,
      admins: this.selectedAdmins,
      idOrganization: this.currentUser.idIglesia
    }
    this.contact_inbox_service.saveSettings(payload)
      // .post(``, payload)
      .subscribe(
        (data: any) => {
          this.getSettings()
          this.contact_inbox_service.api.showToast('Success', ToastType.success)
        },
        (error) => { console.error(error); this.contact_inbox_service.api.showToast('Error', ToastType.error) },
      );
  }

  async openEditForm(mailingList) {
    const data: any = await this.contact_inbox_service.getContactInboxDetail(mailingList.id, {
      extended: true,
      idOrganization: this.currentUser.idIglesia
    }).toPromise()
      .catch(error => {
        console.error(error)
        return;
      });
    if (data) {
      if (this.is_v2) {
        console.log(data);
        this.show_form = true;
        setTimeout(() => {
          if (this.mailing_list_form_v2) {
            this.mailing_list_form_v2.setContactInbox(data);
          }
        }, 100);
      } else {

        this.mailignListFormData.addControl('id', new FormControl('', [Validators.required]));

        this.mailignListFormData.reset();
        if (JSON.stringify(data.setup) === "{}") {
          data.setup = {
            display_e_group_question: true,
            display_e_team_question: true,
            display_events: true,
            display_groups: true,
            icon_color: '#ff7f50',
            display_contact_info: true,
            question_1_answer_1: '',
            question_1_answer_2: '',
            question_2_answer_1: '',
            question_2_answer_2: '',
            message_text: '',
            hide_picture: true,
            hide_address: true,
            hide_phones: true,
            hide_emails: true,
            hide_sunday_service: true,
            show_picture: false,
            show_address: false,
            show_phones: false,
            show_emails: false,
            show_sunday_service: false,
            hide_message_input: false,
            show_message_input: true,
            hide_email_input: false,
            show_email_input: true,
            email_required_input: true,
            phone_required_input: true,
            first_name_required_input: true,
            last_name_required_input: true,
            message_required_input: true,
            hide_custom_input: false,
            show_custom_input: true,
            custom_required_input: true,
            inline: true,
            row_size: 5,
            custom_type: 'number',
            custom_text: 'Custom label',
            custom_placeholder: 'Placeholder',
            question_1_as_check: false,
            question_2_as_check: false,
            button_settings: {
              button_color: '#e65100',
              text_color: '#ffffff',
              text: 'Subscribe',
              width: 40,
              align: 'center',
              border_radius: 4
            },
            thank_you_message: 'Thanks for subscribing to our mailing list!'
          };
        } else {
          data.setup.show_picture = !data.setup.hide_picture;
          data.setup.show_address = !data.setup.hide_address;
          data.setup.show_phones = !data.setup.hide_phones;
          data.setup.show_emails = !data.setup.hide_emails;
          data.setup.show_sunday_service = !data.setup.hide_sunday_service;
          data.setup.show_message_input = !data.setup.hide_message_input;
          data.setup.show_custom_input = !data.setup.hide_custom_input;
          data.setup.show_email_input = !data.setup.hide_email_input;
        }
        if (JSON.stringify(data.setup.button_settings) === '{}') {
          data.setup.button_settings = {
            button_color: '#e65100',
            text_color: '#ffffff',
            text: 'Subscribe',
            width: 40,
            align: 'center',
            border_radius: 4
          }
        }
        if (data.setup.display_contact_info === undefined) {
          data.setup.display_contact_info = false;
        }

        if (!data.setup.display_e_group_question) {
          this.mailignListFormData.get('setup').get('question_1_answer_1').setValue('');
          this.mailignListFormData.get('setup').get('question_1_answer_2').setValue('');
          this.mailignListFormData.get('setup').get('question_1_answer_1').setValidators([]);
          this.mailignListFormData.get('setup').get('question_1_answer_2').setValidators([]);
          this.mailignListFormData.get('setup').get('question_1_text').setValue('');
          this.mailignListFormData.get('setup').get('question_1_text').setValidators([]);
        } else {
          this.mailignListFormData.get('setup').get('question_1_answer_1').setValue('');
          this.mailignListFormData.get('setup').get('question_1_answer_2').setValue('');
          this.mailignListFormData.get('setup').get('question_1_answer_1').setValidators([Validators.required, Validators.maxLength(1000)]);
          this.mailignListFormData.get('setup').get('question_1_answer_2').setValidators([Validators.required, Validators.maxLength(1000)]);
          this.mailignListFormData.get('setup').get('question_1_answer_1').markAsDirty();
          this.mailignListFormData.get('setup').get('question_1_answer_2').markAsDirty();
          this.mailignListFormData.get('setup').get('question_1_text').setValue('');
          this.mailignListFormData.get('setup').get('question_1_text').setValidators([Validators.required, Validators.maxLength(1000)]);
          this.mailignListFormData.get('setup').get('question_1_text').markAsDirty();
        }
        this.mailignListFormData.get('setup').get('question_1_text').updateValueAndValidity()
        this.mailignListFormData.get('setup').get('question_1_answer_1').updateValueAndValidity()
        this.mailignListFormData.get('setup').get('question_1_answer_2').updateValueAndValidity()

        if (!data.setup.display_e_team_question) {
          this.mailignListFormData.get('setup').get('question_2_answer_1').setValue('');
          this.mailignListFormData.get('setup').get('question_2_answer_2').setValue('');
          this.mailignListFormData.get('setup').get('question_2_answer_1').setValidators([]);
          this.mailignListFormData.get('setup').get('question_2_answer_2').setValidators([]);
          this.mailignListFormData.get('setup').get('question_2_text').setValue('');
          this.mailignListFormData.get('setup').get('question_2_text').setValidators([]);
        } else {
          this.mailignListFormData.get('setup').get('question_2_answer_1').setValue('');
          this.mailignListFormData.get('setup').get('question_2_answer_2').setValue('');
          this.mailignListFormData.get('setup').get('question_2_answer_1').setValidators([Validators.required, Validators.maxLength(1000)]);
          this.mailignListFormData.get('setup').get('question_2_answer_2').setValidators([Validators.required, Validators.maxLength(1000)]);
          this.mailignListFormData.get('setup').get('question_2_answer_1').markAsDirty();
          this.mailignListFormData.get('setup').get('question_2_answer_2').markAsDirty();
          this.mailignListFormData.get('setup').get('question_2_text').setValue('');
          this.mailignListFormData.get('setup').get('question_2_text').setValidators([Validators.required, Validators.maxLength(1000)]);
          this.mailignListFormData.get('setup').get('question_2_text').markAsDirty();
        }
        this.mailignListFormData.get('setup').get('question_2_text').updateValueAndValidity()
        this.mailignListFormData.get('setup').get('question_2_answer_1').updateValueAndValidity()
        this.mailignListFormData.get('setup').get('question_2_answer_2').updateValueAndValidity()
        this.mailignListFormData.patchValue(
          data
        );
        if (data.setup.order_array.length !== this.questions.length) {
          this.initQuestions();
          this.questions.forEach((x, index) => {
            const found = (data.setup.order_array as any[]).find(or => or.id === x.id);
            if (found) {
              const new_index = (data.setup.order_array as any[]).indexOf(found);
              moveItemInArray(this.questions, index, new_index);
            }
          });
        } else {
          this.questions = data.setup.order_array;
        }

        this.modal.getModal("mailingListModal").open();
      }
    }
  }

  initQuestions() {
    this.questions = [
      {
        id: 'first_name',
        name: 'First name',
        order: 1
      },
      {
        id: 'last_name',
        name: 'Last name',
        order: 2
      },
      {
        id: 'email',
        name: 'Email',
        order: 3
      },
      {
        id: 'phone',
        name: 'Phone',
        order: 4
      },
      {
        id: 'message',
        name: 'Message',
        order: 5
      },
      {
        id: 'custom',
        name: 'Custom',
        order: 6
      }
    ];
  }

  createNewForm() {
    if (!this.is_v2) {
      this.mailignListFormData.removeControl('id');
      this.mailignListFormData.reset();

      this.mailignListFormData.get('idIglesia').setValue(this.currentUser.idIglesia);
      this.mailignListFormData.get('setup').patchValue({
        display_e_group_question: true,
        display_e_team_question: true,
        display_events: true,
        display_groups: true,
        icon_color: '#ff7f50',
        sunday_service: '',
        display_contact_info: false,
        hide_picture: true,
        hide_address: true,
        hide_phones: true,
        hide_emails: true,
        hide_sunday_service: true,
        show_picture: false,
        show_address: false,
        show_phones: false,
        show_emails: false,
        show_sunday_service: false,
        hide_message_input: false,
        show_message_input: true,
        hide_email_input: false,
        show_email_input: true,
        email_required_input: true,
        phone_required_input: true,
        first_name_required_input: true,
        last_name_required_input: true,
        message_required_input: true,
        header_text: '',
        message_text: '',
        picture: '',
        hide_custom_input: false,
        show_custom_input: true,
        custom_required_input: true,
        inline: true,
        row_size: 5,
        custom_type: 'number',
        custom_text: 'Custom label',
        custom_placeholder: 'Custom placeholder',
        question_1_as_check: false,
        question_2_as_check: false,
        button_settings: {
          button_color: '#e65100',
          text_color: '#ffffff',
          text: 'Subscribe',
          width: 40,
          align: 'center',
          border_radius: 4
        },
        thank_you_message: 'Thanks for subscribing to our mailing list!'
      });

      this.mailignListFormData.get('setup').get('question_1_answer_1').setValue('');
      this.mailignListFormData.get('setup').get('question_1_answer_2').setValue('');
      this.mailignListFormData.get('setup').get('question_1_answer_1').setValidators([Validators.required, Validators.maxLength(1000)]);
      this.mailignListFormData.get('setup').get('question_1_answer_2').setValidators([Validators.required, Validators.maxLength(1000)]);
      this.mailignListFormData.get('setup').get('question_1_answer_1').markAsDirty();
      this.mailignListFormData.get('setup').get('question_1_answer_2').markAsDirty();
      this.mailignListFormData.get('setup').get('question_1_answer_1').updateValueAndValidity()
      this.mailignListFormData.get('setup').get('question_1_answer_2').updateValueAndValidity()
      this.mailignListFormData.get('setup').get('question_1_text').setValue('');
      this.mailignListFormData.get('setup').get('question_1_text').setValidators([Validators.required, Validators.maxLength(1000)]);
      this.mailignListFormData.get('setup').get('question_1_text').markAsDirty();
      this.mailignListFormData.get('setup').get('question_1_text').updateValueAndValidity()

      this.mailignListFormData.get('setup').get('question_2_answer_1').setValue('');
      this.mailignListFormData.get('setup').get('question_2_answer_2').setValue('');
      this.mailignListFormData.get('setup').get('question_2_answer_1').setValidators([Validators.required, Validators.maxLength(1000)]);
      this.mailignListFormData.get('setup').get('question_2_answer_2').setValidators([Validators.required, Validators.maxLength(1000)]);
      this.mailignListFormData.get('setup').get('question_2_answer_1').markAsDirty();
      this.mailignListFormData.get('setup').get('question_2_answer_2').markAsDirty();
      this.mailignListFormData.get('setup').get('question_2_answer_1').updateValueAndValidity()
      this.mailignListFormData.get('setup').get('question_2_answer_2').updateValueAndValidity()
      this.mailignListFormData.get('setup').get('question_2_text').setValue('');
      this.mailignListFormData.get('setup').get('question_2_text').setValidators([Validators.required, Validators.maxLength(1000)]);
      this.mailignListFormData.get('setup').get('question_2_text').markAsDirty();
      this.mailignListFormData.get('setup').get('question_2_text').updateValueAndValidity()

      this.initQuestions();

      this.modal.get('mailingListModal').open();
    } else {
      this.show_form = true;
    }
  }

  submitMailingList() {
    this.saving = true;
    const payload = this.mailignListFormData.value;

    // this.mailignListFormData.idIglesia = this.currentUser.idIglesia;
    payload.setup.order_array = JSON.stringify(this.questions);
    payload.setup.button_settings = JSON.stringify(payload.setup.button_settings);
    let request: Observable<any>;
    payload.created_by = this.currentUser.idUsuario;

    if (payload.id) {
      request = this.contact_inbox_service.updateContactInbox(payload);
    } else {
      request = this.contact_inbox_service.saveContactInbox(payload);
    }

    request.subscribe(
      () => {
        this.getMailingLists();
        this.modal.getModal("mailingListModal").close();
        this.mailignListFormData.reset();
        //  = {
        //   id: null,
        //   name: "",
        //   idIglesia: null,
        // };
        this.saving = false;
      },
      (err) => {
        console.error(err);
        this.saving = false;
      }
    );
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
  }

  toggleAcceptace(form_group: FormGroup | AbstractControl, field: string) {
    let actual_value = form_group.get(field).value;
    const handle_items = ['show_picture', 'show_phones', 'show_address', 'show_emails', 'show_sunday_service', 'show_custom_input', 'show_message_input', 'show_email_input'];
    if (handle_items.includes(field)) {
      const main_field = field.replace('show_', '');
      const new_field = `hide_${main_field}`;
      form_group.get(new_field).setValue(actual_value);
    }
    form_group.get(field).setValue(!actual_value);
    actual_value = form_group.get(field).value;
    if (field === 'display_contact_info') {
      form_group.get('hide_picture').setValue(false);
      form_group.get('hide_address').setValue(false);
      form_group.get('hide_phones').setValue(false);
      form_group.get('hide_emails').setValue(false);
      form_group.get('hide_sunday_service').setValue(false);
    }
    if (field === 'display_e_group_question') {
      if (!actual_value) {
        form_group.get('question_1_answer_1').setValue('');
        form_group.get('question_1_answer_2').setValue('');
        form_group.get('question_1_answer_1').setValidators([]);
        form_group.get('question_1_answer_2').setValidators([]);
        form_group.get('question_1_text').setValue('');
        form_group.get('question_1_text').setValidators([]);
      } else {
        form_group.get('question_1_answer_1').setValue('');
        form_group.get('question_1_answer_2').setValue('');
        form_group.get('question_1_answer_1').setValidators([Validators.required, Validators.maxLength(1000)]);
        form_group.get('question_1_answer_2').setValidators([Validators.required, Validators.maxLength(1000)]);
        form_group.get('question_1_text').setValue('');
        form_group.get('question_1_text').setValidators([Validators.required, Validators.maxLength(1000)]);
      }
      form_group.get('question_1_text').updateValueAndValidity();
      form_group.get('question_1_answer_1').updateValueAndValidity();
      form_group.get('question_1_answer_2').updateValueAndValidity();
    }
    if (field === 'display_e_team_question') {
      if (!actual_value) {
        form_group.get('question_2_answer_1').setValue('');
        form_group.get('question_2_answer_2').setValue('');
        form_group.get('question_2_answer_1').setValidators([]);
        form_group.get('question_2_answer_2').setValidators([]);
        form_group.get('question_2_text').setValue('');
        form_group.get('question_2_text').setValidators([]);
      } else {
        form_group.get('question_2_answer_1').setValue('');
        form_group.get('question_2_answer_2').setValue('');
        form_group.get('question_2_answer_1').setValidators([Validators.required, Validators.maxLength(1000)]);
        form_group.get('question_2_answer_2').setValidators([Validators.required, Validators.maxLength(1000)]);
        form_group.get('question_2_text').setValue('');
        form_group.get('question_2_text').setValidators([Validators.required, Validators.maxLength(1000)]);
      }
      form_group.get('question_2_text').updateValueAndValidity();
      form_group.get('question_2_answer_1').updateValueAndValidity();
      form_group.get('question_2_answer_2').updateValueAndValidity();
    }
    if (field === 'show_message_input') {
      if (actual_value) {
        form_group.get('message_required_input').setValue(false);
      }
    }
    if (field === 'show_email_input') {
      if (actual_value) {
        form_group.get('email_required_input').setValue(false);
      }
    }
    if (field === 'show_custom_input') {
      if (actual_value) {
        form_group.get('custom_required_input').setValue(false);
        // custom_required_input: new FormControl(true, [Validators.required]),
        // inline: new FormControl(true, [Validators.required]),
        // row_size: new FormControl(5, [Validators.min(1), Validators.max(15)]),
        // custom_type: new FormControl('number', []),
        // custom_text: new FormControl('Custom label', [Validators.maxLength(1000)]),
        // custom_placeholder: new FormControl(true, [Validators.maxLength(1000)]),
      }
    }

  }

  uploadPicture(input_file) {
    input_file.onchange = (event: { target: { files: File[] } }) => {
      if (event.target.files.length > 0) {
        this.uploadImage(event.target.files[0]);
      }
    };
    input_file.click();
  }

  uploadImage(photo) {
    this.fus.uploadFile(photo, true, 'mailing_list')
      .subscribe((response: any) => {
        this.mailignListFormData.get('setup').get('picture').setValue(this.fus.cleanPhotoUrl(response.response));
        // const group = Object.assign({}, this.group);
        // this.fixMembers(group);
        // this.videoService.updateVideo(group)
        //   .subscribe(response_updated => {
        //     this.videoService.api.showToast(`Slider updated successfully`, ToastType.success);
        //   }, error => {
        //     console.error(error);
        //     this.videoService.api.showToast(`Something happened trying to save the slider.`, ToastType.error);
        //   });
      });
  }

  dropLevel(event: CdkDragDrop<any>) {

    moveItemInArray(
      this.questions,
      event.previousIndex,
      event.currentIndex
    );
    this.questions.forEach((x, index) => x.order = index + 1);
  }

  deleteContactInbox(contact_inbox) {
    if (confirm('Are you sure you want to delete this contact inbox? If you embed this contact inbox, it will stop working.')) {
      contact_inbox.deleted_by = this.currentUser.idUsuario;
      // this.api.delete(`mailingList/${contact_inbox.id}`)
      this.contact_inbox_service.deleteContactInbox(contact_inbox)
        .subscribe(response => {
          this.toastr.success(`Contact form deleted successfully.`);
          this.getMailingLists();
        }, error => {
          console.error(error);
          this.toastr.error(`Something goes wrong trying to delete the contact form.`);
        });
    }

  }

  handleAdd(event?: any) {
    this.show_form = false;
    if (event) {
      this.getMailingLists();
    }
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
      this.contact_inbox_service.api.showToast('QR copied to clipboard', ToastType.success);
    } catch (err) {
      console.error(err.name, err.message);
    }

  }
}
