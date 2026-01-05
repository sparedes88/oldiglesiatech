import { EventEmitter, Output } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { MeetingModel } from './MeetingModel';
import { ToastType } from '../../../login/ToastTypes';
import { UserService } from '../../../services/user.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { Router, ActivatedRoute } from '@angular/router';
import { log } from 'console';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { NetworkOrganizationModel } from 'src/app/pages/networks/NetworkModel';

@Component({
  selector: 'app-meetings-manager',
  templateUrl: './meetings-manager.component.html',
  styleUrls: ['./meetings-manager.component.scss']
})
export class MeetingsManagerComponent implements OnInit {

  @Input() idOrganization: number;
  @Input('view_mode') view_mode: string = 'edition';
  @Input('show_as_minimal') show_as_minimal: boolean = false;
  @Output('refresh_meetings') refresh_meetings: EventEmitter<any> = new EventEmitter<any>();

  show_detail: boolean = true;

  currentUser;

  contact_form: FormGroup = new FormGroup({
    idIglesia: new FormControl('', [Validators.required]),
    meetings: new FormArray([]),
  });

  meeting_items: MeetingModel[] = [];
  networks: NetworkOrganizationModel[] = [];

  days_array = [
    {
      id: 1,
      name: 'dia_lunes'
    },
    {
      id: 2,
      name: 'dia_martes'
    },
    {
      id: 3,
      name: 'dia_miercoles'
    },
    {
      id: 4,
      name: 'dia_jueves'
    },
    {
      id: 5,
      name: 'dia_viernes'
    },
    {
      id: 6,
      name: 'dia_sabado'
    },
    {
      id: 7,
      name: 'dia_domingo'
    }
  ];

  category_select_options: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'custom_name',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  }

  days_select_options: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  }

  constructor(
    private organizationService: OrganizationService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService
  ) {
  }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    this.days_array.forEach(x => x.name = this.translateService.instant(x.name));
    if (!this.idOrganization) {
      if (this.currentUser) {
        this.idOrganization = this.currentUser.idIglesia;
      } else {
        this.route.queryParamMap.subscribe(params => {
          const code = params.get('idIglesia');
          if (code) {
            this.idOrganization = Number(code);
          }
        });
      }
    }
    if (this.idOrganization) {
      this.loadNotes();
    } else {
      setTimeout(() => {
        this.organizationService.api.showToast(`You need to select an organization, first. Please go to settings > Organizations and select one organization`, ToastType.info);
      });
      this.router.navigate([`/user-profile/details/${this.currentUser.idUsuario}`]);
    }
  }

  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  getNetworks() {
    // this.loading = true;
    return new Promise((resolve, reject) => {
      this.organizationService.api.get(`networks/organization`,
        {
          idIglesia: this.idOrganization
        })
        .subscribe((response: any) => {
          this.networks = response.networks;
          // this.loading = false;
          return resolve([]);
        }, error => {
          this.networks = [];
          return resolve([]);
          // this.loading = false;
        });
    });
  }

  loadNotes() {
    if (this.idOrganization) {

      this.organizationService.getMeetings(this.idOrganization)
        .subscribe(async (data: any) => {
          this.meeting_items = data.meetings;
          await this.getNetworks();
          this.clearFormArray(this.meetings);
          this.meeting_items.forEach(meeting => {
            const form_group = new FormGroup({
              idOrganizationMeeting: new FormControl('', [Validators.required]),
              name: new FormControl('', [Validators.required]),
              meeting_start: new FormControl(),
              meeting_start_parsed: new FormControl(),
              meeting_end: new FormControl(),
              meeting_end_parsed: new FormControl(),
              is_this_live: new FormControl(false),
              networks_on_live: new FormControl(),
              networks_on_live_temp: new FormControl(),
              days_on_live: new FormControl(),
              days_on_live_temp: new FormControl(),
              status: new FormControl(true),
              created_by: new FormControl(),
              days_name: new FormControl()
            });
            meeting.meeting_start_parsed = moment(meeting.meeting_start, 'HH:mm').format('hh:mm A');
            meeting.meeting_end_parsed = moment(meeting.meeting_end, 'HH:mm').format('hh:mm A');
            const networks_on_live = meeting.networks_on_live as number[];
            meeting.networks_on_live_temp = this.networks.filter(x => networks_on_live.includes(x.id));
            const days_on_live = meeting.days_on_live as number[];
            const days_on_live_temp = this.days_array.filter(x => days_on_live.includes(x.id));
            meeting.days_name = days_on_live_temp.map(x => x.name).join(', ');
            meeting.days_on_live_temp = days_on_live_temp;
            form_group.patchValue(meeting);
            this.meetings.push(form_group);
          });
          this.contact_form.get('idIglesia').setValue(this.idOrganization);
        }, error => {
          console.error(error);
          this.organizationService.api.showToast(`Error getting contact info.`, ToastType.error);
        });
    }
  }

  get meetings() {
    return this.contact_form.get('meetings') as FormArray;
  }

  get active_meetings() {
    return this.meetings.controls.filter(x => x.value.status);
  }

  get first_item() {
    if (this.meetings.length > 0) {
      const controls = this.meetings.controls.filter(x => x.value.status);
      if (controls.length > 0) {
        return controls[0];
      }
    }
  }

  addItem() {
    const control = this.meetings;
    const form_group = new FormGroup({
      idOrganizationMeeting: new FormControl(0, [Validators.required]),
      name: new FormControl('', [Validators.required]),
      meeting_start: new FormControl(),
      meeting_start_parsed: new FormControl(),
      meeting_end: new FormControl(),
      meeting_end_parsed: new FormControl(),
      is_this_live: new FormControl(false),
      networks_on_live: new FormControl([]),
      networks_on_live_temp: new FormControl(),
      days_on_live: new FormControl([]),
      days_on_live_temp: new FormControl(),
      status: new FormControl(true),
      created_by: new FormControl(this.currentUser.idUsuario),
      days_name: new FormControl()
    });
    control.push(form_group)
  }

  removeItem(index: number) {
    const control = this.meetings;
    const value = control.controls[index].get('name').value;
    const is_valid = control.controls[index].get('name').valid;
    if (value) {
      if (is_valid) {
        control.controls[index].get('status').setValue(false);
      } else {
        control.removeAt(index);
      }
    } else {
      control.removeAt(index);
    }
  }

  displayEmptyMessage() {
    const controls = this.meetings.controls.map(x => x.value.status);
    return controls.filter(x => x).length === 0;
  }

  submitContact(contact_form: FormGroup) {
    if (contact_form.valid) {
      const contacto = contact_form.value;
      let success_message: string;
      let error_message: string;

      success_message = `Meeting saved successfully.`;
      error_message = `Error saving meeting.`;

      this.organizationService.api.post(`iglesias/meetings/`, contacto)
        .subscribe((response: any) => {
          this.organizationService.api.showToast(`${success_message}`, ToastType.success);
          this.refresh_meetings.emit();
          this.contact_form.markAsPristine();
        }, err => {
          console.error(err);
          this.organizationService.api.showToast(`${error_message}`, ToastType.error);
        });
    } else {
      this.organizationService.api.showToast(`Please check all required fields are correct.`, ToastType.error);
    }
  }

  toggleShowMap(meeting: FormControl) {
    if (meeting.get('is_this_live').value) {
      // const meeting_start = moment(meeting.get('meeting_start_parsed').value, 'hh:mm A').format('HH:mm');
      // meeting.get(`meeting_start`).setValue(meeting_start);
      // const meeting_end = moment(meeting.get('meeting_end_parsed').value, 'hh:mm A').format('HH:mm');
      // meeting.get(`meeting_end`).setValue(meeting_end);
      const categories_ids = meeting.get('networks_on_live_temp').value.map(x => x.id);
      meeting.get('networks_on_live').setValue(categories_ids);

    } else {
      // meeting.get(`meeting_start`).setValue(undefined);
      // meeting.get(`meeting_end`).setValue(undefined);
      meeting.get(`networks_on_live`).setValue([]);
    }

  }

  isFirstAvailable(meeting: FormGroup, index: number) {
    const first_control = this.meetings.controls.find(x => x.value.status);
    const first_active_index = this.meetings.controls.indexOf(first_control);
    return first_active_index === index;
  }

  addAnHourOnEnd(value: string, key: string, meeting: FormControl) {
    const moment_value = moment(value, 'HH:mm');
    const parsed_value = moment_value.format('hh:mm A');
    if (key === 'meeting_start') {
      if (!meeting.get('meeting_end').value) {
        const an_hour_after_value = moment_value.add(1, 'hour');
        meeting.get(`meeting_end`).setValue(an_hour_after_value.format('HH:mm'));
        meeting.get(`meeting_end_parsed`).setValue(an_hour_after_value.format('hh:mm A'));
      }
    }
    meeting.get(`${key}_parsed`).setValue(parsed_value);
  }

  updateCategories(event, meeting: FormControl) {
    setTimeout(() => {
      const categories_ids = meeting.get('networks_on_live_temp').value.map(x => x.id);
      meeting.get('networks_on_live').setValue(categories_ids);
    }, 100);
  }

  updateDays(event, meeting: FormControl) {
    setTimeout(() => {
      const categories_ids = meeting.get('days_on_live_temp').value.map(x => x.id);
      meeting.get('days_on_live').setValue(categories_ids);

      const days_on_live = meeting.get('days_on_live').value as number[];
      const days_on_live_temp = this.days_array.filter(x => days_on_live.includes(x.id));
      const days = days_on_live_temp.map(x => x.name).join(', ');
      meeting.get('days_name').setValue(days);
    }, 100);
  }

}
