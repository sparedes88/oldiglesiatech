import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormArray, FormBuilder, FormControl, ValidatorFn } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastType } from 'src/app/login/ToastTypes';
import { GroupEventModel, GroupModel } from 'src/app/models/GroupModel';
import { ApiService } from 'src/app/services/api.service';
import { GroupsService } from 'src/app/services/groups.service';
import { UserService } from 'src/app/services/user.service';
import * as moment from 'moment';
import { MailingListInputOption } from 'src/app/models/MailingListModel';

@Component({
  selector: 'app-contact-edit',
  templateUrl: './contact-edit.component.html',
  styleUrls: ['./contact-edit.component.scss']
})
export class ContactEditComponent implements OnInit {

  groups: GroupModel[] = [];
  events: GroupEventModel[] = [];

  currentUser: any;
  mailing_list_id: number;
  contact_id: number;

  contact: any = {};
  mailingList: any = {};
  loading_groups: boolean = true;
  loading_events: boolean = true;

  contact_form: FormGroup = this.form_builder.group({
    first_name: ['', [Validators.required, Validators.maxLength(100)]],
    last_name: ['', [Validators.required, Validators.maxLength(100)]],
    phone: new FormControl('', []),
    email: ['', [Validators.email, Validators.maxLength(100)]],
    country_code: ['', []],
    question_1_answer: new FormControl(''),
    question_2_answer: new FormControl(''),
    custom_answer: new FormControl(''),
    created_at: new FormControl(),
    created_at_date: new FormControl(),
    created_at_time: new FormControl(),
    message: new FormControl(''),
    groups: new FormControl(),
    groups_array: new FormControl(),
    events: new FormControl(),
    events_array: new FormControl()
  });

  selectGroupOptions: IDropdownSettings = {
    singleSelection: false,
    idField: 'idGroup',
    textField: 'title',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  selectEventOptions: IDropdownSettings = {
    singleSelection: false,
    idField: 'idGroupEvent',
    textField: 'name',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  back_url: string;
  is_v2: boolean;
  loading: boolean = false;

  constructor(
    private api: ApiService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private group_service: GroupsService,
    private form_builder: FormBuilder
  ) {
    this.currentUser = this.userService.getCurrentUser();
    this.mailing_list_id = this.route.snapshot.params["mailing_list_id"];
    this.contact_id = this.route.snapshot.params["id"];
  }

  get inputs_array() {
    if (this.contact_form.get('inputs')) {
      return this.contact_form.get('inputs') as FormArray
    }
    return new FormArray([]);
  }

  ngOnInit() {
    this.is_v2 = this.router.url.includes('/v2/');
    const segments = this.router.url.split('/');
    this.back_url = segments.slice(0, segments.length - 3).join('/');

    this.getMailingList();
    this.api.get(`mailingList/${this.mailing_list_id}/contacts/${this.contact_id}`).subscribe(
      (data: any) => {
        this.contact = data;
        this.contact.messages = [];
        this.contact.notes = [];
        let moment_obj;
        if (this.contact.created_at) {
          moment_obj = moment(this.contact.created_at).utc();
        } else {
          moment_obj = moment();
        }
        this.contact.created_at_date = moment_obj.format('YYYY-MM-DD');
        this.contact.created_at_time = moment_obj.format('HH:mm');
        this.contact_form.patchValue(this.contact);
        console.log(this.contact);
        console.log(this.contact_form);
        if (this.is_v2) {
          this.setV2Controls();
        } else {
          this.contact_form.get('created_at').setValue('2022-03-01 14:05:00');
          this.getGroups();
          this.getEvents();
        }
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
          if (this.is_v2) {
            this.setV2Controls();
          }
        },
        (error) => console.error(error)
      );
  }

  setV2Controls() {
    if (this.contact && this.mailingList) {
      if (this.contact.answers && this.mailingList.inputs) {
        let moment_obj;
        if (this.contact.created_at) {
          moment_obj = moment(this.contact.created_at).utc();
        } else {
          moment_obj = moment();
        }
        this.contact.created_at_date = moment_obj.format('YYYY-MM-DD');
        this.contact.created_at_time = moment_obj.format('HH:mm');

        this.contact_form = this.form_builder.group({
          created_at_date: new FormControl(this.contact.created_at_date),
          created_at_time: new FormControl(this.contact.created_at_time),
          idMailingList: new FormControl(this.mailing_list_id, [Validators.required]),
          idOrganization: new FormControl(this.mailingList.idIglesia, [Validators.required]),
          inputs: new FormArray([])
        });
        if (this.mailingList.inputs) {
          this.mailingList.inputs.forEach(x => {
            const group = this.form_builder.group({
              idMailingListInputSetup: new FormControl(x.id),
              idMailingListInput: new FormControl(x.idMailingListInput),
              idMailingListInputType: new FormControl(x.idMailingListInputType),
              label: new FormControl(x.label),
              placeholder: new FormControl(x.placeholder),
              show_hint: new FormControl(x.show_hint),
              hint: new FormControl(x.hint),
              options: new FormControl(x.options)
            });

            let control: FormControl;
            let validators: ValidatorFn[] = [];
            if (x.is_required) {
              validators.push(Validators.required);
            }
            if (x.idMailingListInputType == 10) {
              validators.push(Validators.email);
            }
            if (x.idMailingListInputType == 11) {
              const url_pattern: RegExp = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
              const url_validator = (control: FormControl) => {
                const url = control.value;
                if (!url || Validators.required(control)) {
                  // Return null if the control value is empty or required validation fails
                  return null;
                }

                // Perform the URL validation using the pattern
                return url_pattern.test(url) ? null : { invalidUrl: true };
              };
              validators.push(url_validator);
            }
            let value: any;
            if (this.contact.answers) {
              const answer = this.contact.answers.find(answer => answer.idMailingListInputSetup === x.id);
              if (answer) {
                value = answer.value;
                group.addControl('id', new FormControl(answer.id, [Validators.required]));
              }
            }
            control = this.form_builder.control(value, validators);
            group.addControl('value', control);
            this.inputs_array.push(group);
          });
        }
      }
    }
  }

  getEvents() {
    this.loading_events = true;
    this.group_service.getGroupsEventsByIdIglesia().subscribe(
      (data: any) => {
        this.events = data.events;
        this.contact.selected_events = this.events.filter(g => this.contact.events.includes(g.idGroupEvent));
        this.contact.selected_events_name = this.events.filter(g => this.contact.events.includes(g.idGroupEvent)).map(g => g.name).join(', ');
        this.contact_form.get('events_array').setValue(this.contact.selected_events);
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
        console.log(data);
        this.groups = data.groups;
        this.contact.selected_groups = this.groups.filter(g => this.contact.groups.includes(g.idGroup));
        this.contact.selected_groups_name = this.groups.filter(g => this.contact.groups.includes(g.idGroup)).map(g => g.title).join(', ');
        this.contact_form.get('groups_array').setValue(this.contact.selected_groups);
        this.loading_groups = false;
      }, error => {
        console.error(error);
        this.loading_groups = false;
      });
  }

  updateUser() {
    this.loading = true;
    const payload = this.contact_form.value;
    if (this.is_v2) {
      payload.events = [];
      payload.groups = [];
      payload.v2 = true;
    } else {
      payload.events = payload.events_array.map(x => x.idGroupEvent);
      payload.groups = payload.groups_array.map(x => x.idGroup);
    }
    payload.events_array = undefined;
    payload.groups_array = undefined;

    this.api.patch(`mailingList/${this.mailing_list_id}/contacts/${this.contact_id}`, payload)
      .subscribe(response => {
        console.log(response);
        this.api.showToast(`Contact updates successfully.`, ToastType.success);
        this.router.navigateByUrl(this.back_url);
        this.loading = false;
      }, error => {
        console.error(error);
        this.api.showToast(`Error updating user.`, ToastType.error);
        this.loading = false;
      })
  }

  setCheckedValues(input: FormGroup, option: MailingListInputOption, event) {
    option.checked = event.target.checked;
    input.get('value').markAsTouched();
    input.get('value').setValue('');
    const options: MailingListInputOption[] = input.value.options;
    const value = options.filter(x => x.checked).map(x => x.value).join(', ');
    input.get('value').setValue(value);
    console.log(input);
    console.log(input.value);
    console.log(event);
  }

}
