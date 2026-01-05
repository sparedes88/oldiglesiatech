import { AutocompleteResponseModel, GoogleAddressComponent } from '../../../component/google-places/google-places.component';
import { Router } from '@angular/router';
import { DesignRequestImageModel, DesignRequestModel } from '../../../models/DesignRequestModel';
import { OrganizationService } from '../../../services/organization/organization.service';
import { Observable } from 'rxjs';
import { ToastType } from 'src/app/login/ToastTypes';
import { FormGroup, Validators, FormBuilder, FormArray, FormControl, NgForm, ValidatorFn } from '@angular/forms';
import { Component, OnInit, EventEmitter, Output, ViewChild, NgZone, ElementRef } from '@angular/core';
import { GroupsService } from 'src/app/services/groups.service';

import { GroupEventModel, FrequencyModel, GroupEventDayModel, GroupModel } from '../../../models/GroupModel';
import * as moment from 'moment';
import * as moment_timezone from 'moment-timezone';
import { environment } from 'src/environments/environment';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { IDropdownSettings, MultiSelectComponent } from 'ng-multiselect-dropdown';
import { WordpressService } from 'src/app/services/wordpress.service';
import { ApiService } from 'src/app/services/api.service';
import { DesignRequestService } from 'src/app/services/design-request.service';
import { CalendarEvent } from 'calendar-utils';
@Component({
  selector: 'app-group-event-setting-form-v2',
  templateUrl: './group-event-setting-form-v2.component.html',
  styleUrls: ['./group-event-setting-form-v2.component.scss']
})
export class GroupEventSettingFormV2Component implements OnInit {

  @ViewChild('event_form') event_form: NgForm;
  @ViewChild('multi_select') multi_select: MultiSelectComponent;
  @ViewChild('click_to_glitch') click_to_glitch: ElementRef;
  @ViewChild('address_component') address_component: GoogleAddressComponent;
  @Output() submit = new EventEmitter();
  @Output() on_dismiss = new EventEmitter();

  is_loading: boolean = true;
  form_group_v2: FormGroup;
  days: { index: number; name: string; }[] = [
    { index: 0, name: 'S' },
    { index: 1, name: 'M' },
    { index: 2, name: 'T' },
    { index: 3, name: 'W' },
    { index: 4, name: 'T' },
    { index: 5, name: 'F' },
    { index: 6, name: 'S' },
  ];

  months: { index: number; name: string; }[] = [
    { index: 0, name: 'Jan' },
    { index: 1, name: 'Feb' },
    { index: 2, name: 'Mar' },
    { index: 3, name: 'Apr' },
    { index: 4, name: 'May' },
    { index: 5, name: 'Jun' },
    { index: 6, name: 'Jul' },
    { index: 7, name: 'Aug' },
    { index: 8, name: 'Sep' },
    { index: 9, name: 'Oct' },
    { index: 10, name: 'Nov' },
    { index: 11, name: 'Dec' },
  ];

  design_request_types: any[] = [
    {
      id: 'flyer',
      name: 'Flyer',
    },
    {
      id: 'events_banner',
      name: 'Banner eventos',
    },
    {
      id: 'projection',
      name: 'Proyección',
    },
    {
      id: 'panel_it_banner',
      name: 'Banner IT panel'
    },
    {
      id: 'fb_it_banner',
      name: 'Banner IT para facebook'
    },
    {
      id: 'mockup_buttons',
      name: 'Botones para maqueta'
    }

  ];

  group_event: GroupEventModel = new GroupEventModel();
  events: CalendarEvent[] = [];

  currentUser: User;

  groups: GroupModel[] = [];

  show_groups_dropdown: boolean = true;
  visiblePixieModal: boolean = false

  selectOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idGroup',
    textField: 'title',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };
  serverBusy: boolean = false;
  init_map: boolean = false;

  dias_form = [
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
  help_request = false
  // public eventFormGroup: FormGroup = this.form_builder.group({
  //   idGroupEvent: [''],
  //   idGroup: ['', Validators.required],
  //   name: ['', Validators.required],
  //   description: ['', Validators.required],
  //   idFrequency: new FormControl(0, [
  //     Validators.required,
  //     Validators.pattern(/[^0]+/),
  //     Validators.min(0)
  //   ]),
  //   event_as_range: [false],
  //   event_date: [undefined],
  //   event_date_start: [undefined],
  //   event_date_end: new FormControl({ value: 0, disabled: true }, [
  //     Validators.required,
  //     Validators.min(this.getMin())
  //   ]),
  //   event_time_start: [undefined],
  //   event_time_end: [undefined],
  //   repeat_until_date: [undefined],
  //   event_current_week: [''],
  //   days: this.form_builder.array([]),
  //   created_by: [''],
  //   is_exact_date: [],
  //   picture: [null],
  //   button_text: [null],
  //   button_color: [null],
  //   live_event_url: [null],
  //   capacity: [null],
  //   help_request: [null],
  //   ticket_cost: [null],
  //   location: [null],
  //   publish_status: ['draft'],
  //   same_address_as_church: [false],
  //   detail_address_info: new FormGroup({
  //     city: new FormControl(),
  //     street: new FormControl(),
  //     state: new FormControl(),
  //     zip_code: new FormControl(),
  //     country: new FormControl(),
  //     full_address: new FormControl(),
  //     lat: new FormControl(),
  //     lng: new FormControl()
  //   }),
  //   city: new FormControl(),
  //   street: new FormControl(),
  //   state: new FormControl(),
  //   zip_code: new FormControl(),
  //   country: new FormControl(),
  //   full_address: new FormControl(),
  //   lat: new FormControl(),
  //   lng: new FormControl()
  // });
  public wordpressSettings
  public wpConfig: any;
  public wpImages: any[] = []

  designRequestForm: FormGroup;

  constructor(
    public groupService: GroupsService,
    public form_builder: FormBuilder,
    public fus: FileUploadService,
    public userService: UserService,
    public organizationService: OrganizationService,
    public wpService: WordpressService,
    public api: ApiService,
    public ngZone: NgZone,
    public designRequestService: DesignRequestService,
    public router: Router
  ) {
    this.initForm();
  }

  initForm() {
    this.form_group_v2 = this.form_builder.group({
      title: new FormControl('', [Validators.required]),
      selected_group: new FormControl('', [Validators.required]),
      idGroup: new FormControl(undefined),
      settings: new FormGroup({
        event_date: new FormControl(moment.tz().format('YYYY-MM-DD'), [Validators.required]),
        event_as_range: new FormControl(false),
        all_day: new FormControl(true),
        repeat: new FormControl(false)
      }),
      details: new FormGroup({
        description: new FormControl('', [Validators.required]),
        has_live_url: new FormControl(false),
        live_event_url: new FormControl(),
        has_cost: new FormControl(false),
        ticket_cost: new FormControl(0),
        has_capacity: new FormControl(false),
        capacity: new FormControl(0),
        publish_status: new FormControl('draft'),
        same_address_as_church: new FormControl(false),
        detail_address_info: new FormGroup({
          city: new FormControl(),
          street: new FormControl(),
          state: new FormControl(),
          zip_code: new FormControl(),
          country: new FormControl(),
          full_address: new FormControl(),
          lat: new FormControl(),
          lng: new FormControl()
        }),
        city: new FormControl(),
        street: new FormControl(),
        state: new FormControl(),
        zip_code: new FormControl(),
        country: new FormControl(),
        full_address: new FormControl(),
        lat: new FormControl(),
        lng: new FormControl()
      }),
      style: new FormGroup({
        help_request: new FormControl(false),
        picture: new FormControl(''),
        button_text: new FormControl(''),
        button_color: new FormControl('#000000'),
        idResource: new FormControl(undefined)
      })
    });
  }

  get settings_form(): FormGroup {
    return this.form_group_v2.get('settings') as FormGroup;
  }

  get detail_form(): FormGroup {
    return this.form_group_v2.get('details') as FormGroup;
  }

  get style_form(): FormGroup {
    return this.form_group_v2.get('style') as FormGroup;
  }

  get custom_form(): FormGroup {
    return this.settings_form.get('custom') as FormGroup;
  }

  get granularity_name(): string {
    if (this.custom_form) {
      let granularity;
      const frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' = this.custom_form.get('frequency').value;
      if (frequency == 'daily') {
        granularity = 'day';
      } else if (frequency == 'weekly') {
        granularity = 'week';
      } else if (frequency == 'monthly') {
        granularity = 'month';
      } else if (frequency == 'yearly') {
        granularity = 'year';
      }
      const every = this.custom_form.get('every').value;
      if (every > 1) {
        granularity = `${granularity}s`;
      }
      return granularity
    }
    return '';
  }

  get never_setup(): string {
    let granularity = 'year';
    let years = 5;
    if (this.custom_form) {
      const frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' = this.custom_form.get('frequency').value;
      if (frequency == 'daily') {
        years = 1;
      } else if (frequency == 'weekly') {
        years = 2;
      } else if (frequency == 'monthly') {
        years = 4;
      }
    } else {
      const frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' = this.settings_form.get('frequency').value;
      if (frequency == 'daily') {
        years = 1;
      } else if (frequency == 'weekly') {
        years = 2;
      } else if (frequency == 'monthly') {
        years = 4;
      }
    }
    if (years > 1) {
      granularity = `${granularity}s`;
    }
    return `${years} ${granularity}`;
  }

  validateCostInput(key: 'has_cost' | 'has_capacity' | 'has_live_url', affected_key: 'ticket_cost' | 'capacity' | 'live_event_url') {
    const has_value: boolean = this.detail_form.get(key).value;
    const validators: ValidatorFn[] = [];
    validators.push(Validators.required);
    let control: FormControl;
    if (key === 'has_cost' || key === 'has_capacity') {
      let min_value: number = 1;
      if (affected_key === 'ticket_cost') {
        min_value = 0.01;
      }
      validators.push(Validators.min(min_value));
    }
    if (has_value) {
      control = this.form_builder.control('', validators);
    } else {
      control = this.form_builder.control('');
    }
    this.detail_form.setControl(affected_key, control);
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
      },
      (err) => {
        console.error(err);
      }
    );
  }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    this.showGroupDropdown();
    this.getWordpressSettings()
    this.is_loading = false;
    this.help_request = this.group_event.help_request;
    if (this.group_event.help_request) {
      this.initOrResetForm(null);
    }
    setTimeout(() => {
      this.init_map = true;
      this.click_to_glitch.nativeElement.click();
    }, 100);
  }

  async setGroupEvent(group_event: GroupEventModel) {
    this.is_loading = true;
    this.initForm();
    console.log(group_event);

    group_event.has_cost = group_event.ticket_cost > 0;
    group_event.has_capacity = group_event.capacity > 0;
    group_event.has_live_url = group_event.live_event_url ? true : false;
    this.form_group_v2.addControl('id', new FormControl(group_event.idGroupEvent, [Validators.required]));
    await this.showGroupDropdown();
    this.help_request = group_event.help_request;
    this.group_event.design_request = group_event.design_request;
    group_event.title = group_event.name;
    this.form_group_v2.patchValue(group_event);
    const selected_group = this.groups.filter(x => x.idGroup === group_event.idGroup);
    this.form_group_v2.get('selected_group').setValue(selected_group);
    this.detail_form.patchValue(group_event);
    this.style_form.patchValue(group_event);
    if (!group_event.settings.all_day) {
      this.handleAllDay();
      this.settings_form.patchValue(group_event.settings);
    }
    if (group_event.settings.event_as_range) {
      this.handleMultiDay();
      this.settings_form.patchValue(group_event.settings);
    }
    if (group_event.settings.repeat) {
      this.handleRepeat();
      this.settings_form.patchValue(group_event.settings);
      if (group_event.settings.ends_on != 'never') {
        this.setEnding();
      }
      this.settings_form.patchValue(group_event.settings);
      if (group_event.settings.frequency == 'custom') {
        this.handleFrequency();
        this.settings_form.patchValue(group_event.settings);
        this.handleCustomFrequency();
        this.settings_form.patchValue(group_event.settings);
        if (['monthly', 'yearly'].includes(group_event.settings.custom.frequency)) {
          this.handleCustomEvery();
          this.settings_form.patchValue(group_event.settings);
        }
      }
    }
    this.is_loading = false;

    const item: AutocompleteResponseModel = {
      address: {
        street: group_event.street,
        city: group_event.city,
        state: group_event.state,
        zip_code: group_event.zip_code,
        country: group_event.country,
        lat: group_event.lat,
        lng: group_event.lng,
        full_address: group_event.location
      },
      place: {
        name: ''
      }
    }
    this.detail_form.get('full_address').setValue(item.address.full_address);
    this.group_event.location = item.address.full_address;
    if (this.address_component) {
      this.address_component.value = item.address.full_address;
      this.address_component.autocompleteInput = item.address.full_address;
    }
    this.getAddress(item);
  }

  dismiss(response?) {
    this.submit.emit(response);
    this.initForm();
  }

  checkClick() {
    console.log('Triggered');
  }

  checkKey(event) {
    return event.code === 'Tab';
  }

  async submitV2() {
    this.serverBusy = true;
    this.is_loading = true;
    if (this.form_group_v2.invalid) {
      const invalid_controls = [];
      Object.keys(this.form_group_v2.controls).forEach(key => {
        const has_controls = (this.form_group_v2.get(key) as any).controls ? true : false;
        if (!has_controls) {
          if (this.form_group_v2.get(key).invalid) {
            invalid_controls.push(this.form_group_v2.get(key));
          }
        } else {
          // has controls
          const form_group = this.form_group_v2.get(key) as FormGroup;
          Object.keys(form_group.controls).forEach(key_in_form => {
            if (form_group.get(key_in_form).invalid) {
              invalid_controls.push(form_group.get(key_in_form));
            }
          })
        }
      });
      invalid_controls.forEach(control => {
        control.markAsTouched();
      });
      this.serverBusy = false; this.is_loading = false;
      this.groupService.api.showToast(`Please fill all the required fields`, ToastType.error);
      return;
    }
    let message_error: string;
    let message_success: string;
    this.group_event.help_request = this.help_request;
    const payload = this.form_group_v2.value;
    payload.idOrganization = this.currentUser.idIglesia;
    payload.created_by = this.currentUser.idUsuario;
    payload.timezone = moment_timezone.tz.guess();
    payload.style.help_request = this.help_request;
    if (this.show_groups_dropdown) {
      const group_array: any[] = payload.selected_group;
      let idGroup: number;
      if (group_array.length > 0) {
        idGroup = Number(JSON.parse(group_array[0].idGroup));
      }
      // form.patchValue({ idGroup });
      payload.idGroup = idGroup;
    }
    this.form_group_v2.get('idGroup').setValue(payload.idGroup);
    // if (this.help_request) {
    //   if (this.designRequestForm.invalid) {
    //     this.api.showToast(`Ups! Some info about your design is required.`, ToastType.info);
    //     this.serverBusy = false; this.is_loading = false;
    //     return;
    //   } else {
    //     const value = this.designRequestForm.value;
    //     if (value.size_guide) {
    //       if (!value.size_guide.includes('x')) {
    //         this.api.showToast(`Ups! The size guide should follow the format height x width.`, ToastType.info);
    //         this.serverBusy = false; this.is_loading = false;
    //         return;
    //       } else {
    //         const size_guide = (value.size_guide as string).split('x');
    //         if (size_guide.length > 1) {
    //           const height = size_guide[0];
    //           const width = size_guide[1];
    //           if (height === '') {
    //             this.api.showToast(`Ups! The height is required.`, ToastType.info);
    //             this.serverBusy = false; this.is_loading = false;
    //             return;
    //           } else if (width === '') {
    //             this.api.showToast(`Ups! The width is required.`, ToastType.info);
    //             this.serverBusy = false; this.is_loading = false;
    //             return;
    //           } else {
    //             if (Number.isNaN(Number(height)) || Number.isNaN(Number(width))) {
    //               this.api.showToast(`Ups! The height or width should be numbers.`, ToastType.info);
    //               this.serverBusy = false; this.is_loading = false;
    //               return;
    //             }
    //           }
    //         } else {
    //           this.api.showToast(`Ups! The size guide should follow the format height x width.`, ToastType.info);
    //           this.serverBusy = false; this.is_loading = false;
    //           return;
    //         }
    //       }
    //     }
    //   }
    // }
    let method: Observable<any>;
    if (payload.id) {
      message_error = `Error updating the event.`;
      message_success = `Event updated successfully.`;
      method = this.groupService.updateSettingV2(payload);
    } else {
      method = this.groupService.addSettingV2(payload);
      message_error = `Error adding the event.`;
      message_success = `Event added successfully.`;
    }
    const response: any = await method.toPromise()
      .catch(error => {
        console.error(error);
        this.groupService.api.showToast(message_error, ToastType.error);
        return;
      });
    if (response) {
      if (this.help_request) {
        // this.designRequestForm.get('idGroupEvent').setValue(response.idGroupEvent);
        console.log(response);
        await this.submitDesignV2(response.id);
      } else {
        this.groupService.api.showToast(message_success, ToastType.success);
        this.submit.emit(true);
        this.updateRequestCount()
      }
    }
    this.serverBusy = false; this.is_loading = false;
  }

  updateRequestCount() {
    let subscription: Observable<any>;

    subscription = this.groupService.getRequestCount();
    subscription.subscribe(response => {
      this.groupService.helpRequestCount = response.count
    }, error => {
      console.error(error);
    });
  }

  fixUrl(url: string) {
    if (url) {
      if (url.includes('https')) {
        return url;
      } else {
        // return `${environment.serverURL}/${url}`;
        return `${environment.serverURL}${url}`;
      }
    } else {
      return 'assets/img/default-cover-image.jpg';
    }
  }

  fixUrlDesign(image: DesignRequestImageModel) {
    if (image.type === 'image') {
      if (image.blob) {
        return image.blob;
      } else {
        return image.url;
      }
    } else {
      return '/assets/img/file-image.png';
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

  handlePixieExport(file: any) {
    this.uploadImage(file)
    this.visiblePixieModal = false
  }

  uploadImage(photo) {
    const indexPoint = (photo.name as string).lastIndexOf('.');
    const extension = (photo.name as string).substring(indexPoint);
    const ticks = (
      Number(String(Math.random()).slice(2)) +
      Date.now() +
      Math.round(performance.now())
    ).toString(36);

    let myUniqueFileName: string;
    if (this.group_event.idGroupEvent) {
      myUniqueFileName = `group_event_picture_${this.group_event.idGroup}_${this.group_event.idGroupEvent}_${ticks}${extension}`;
    } else {
      myUniqueFileName = `group_event_picture_${this.group_event.idGroup}_new_${ticks}${extension}`;
    }

    const iglesia_temp = new OrganizationModel();
    iglesia_temp.idIglesia = this.currentUser.idIglesia;
    iglesia_temp.topic = this.currentUser.topic;

    this.organizationService
      .uploadFile(photo, iglesia_temp, myUniqueFileName, `events_pictures`)
      .then((response: any) => {
        // this.group_event.picture = this.fus.cleanPhotoUrl(response.response);
        // const group = Object.assign({}, this.group_event);
        //   this.groupsService.updateGroup(group)
        //     .subscribe(response_updated => {
        //       this.groupsService.api.showToast(`Slider updated successfully`, ToastType.success);
        //     }, error => {
        //       console.error(error);
        //       this.groupsService.api.showToast(`Something happened trying to save the slider.`, ToastType.error);
        //     });
        // });
        this.style_form.get('picture').setValue(response.file_info.src_path);
        this.style_form.get('idResource').setValue(response.file_info.id);
      });
  }

  async showGroupDropdown() {
    this.show_groups_dropdown = true;
    const response: any = await this.groupService.getGroups().toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.groups = response.groups;
    }
  }

  initOrResetForm(event) {
    if (this.help_request) {
      this.style_form.addControl('types', new FormControl([]));
      // this.designRequestForm = new FormGroup({
      //   idDesignRequestType: new FormControl(1),
      //   idDesignRequestStatus: new FormControl(1),
      //   idIglesia: new FormControl(this.currentUser.idIglesia),
      //   idUser: new FormControl(this.currentUser.idUsuario),
      //   special_text: new FormControl(),
      //   speaker: new FormControl(),
      //   specifiedColors: new FormControl('', [Validators.maxLength(1000)]),
      //   size_guide: new FormControl('', []),
      //   images: new FormArray([]),
      //   assignedTo: new FormControl(0),
      //   deadline: new FormControl(moment().add(3, 'day').format('YYYY-MM-DD')),
      //   description: new FormControl(),
      //   designerCriteria: new FormControl(false),
      //   estimatedTime: new FormControl(0),
      //   other: new FormControl(""),
      //   quantity: new FormControl(1),
      //   status: new FormControl(true),
      //   title: new FormControl(),
      //   idGroupEvent: new FormControl()
      // });
    } else {
      this.style_form.removeControl('types');
    }
    this.style_form.get('help_request').setValue(this.help_request);
  }

  // showActionSheet(idDesignRequestImageType: number, input_file) {
  //   const a = new DesignRequestImageModel();
  //   a.idDesignRequestImageType = idDesignRequestImageType;

  //   this.ngZone.run(() => {
  //     if (input_file) {
  //       input_file.onchange = (event: { target: { files: FileList } }) => {

  //         Array.from(event.target.files).forEach(file => {
  //           a.file = file;
  //           a.idUser = this.currentUser.idUsuario;
  //           if (file.type.includes('image')) {
  //             a.type = 'image';
  //           } else {
  //             a.type = 'file';
  //           }
  //           const reader = new FileReader();
  //           reader.readAsDataURL(file);
  //           reader.onload = (event) => {
  //             a.blob = reader.result as any;
  //             const array = this.designRequestForm.get('images') as FormArray;
  //             const form_image = new FormGroup({
  //               idDesignRequestImageType: new FormControl(),
  //               file: new FormControl(),
  //               idUser: new FormControl(),
  //               type: new FormControl(),
  //               blob: new FormControl()
  //             });
  //             form_image.patchValue(a);
  //             if (idDesignRequestImageType === 1) {
  //               array.push(form_image);
  //               // designRequest.useImages.push(a);
  //             } else {
  //               array.push(form_image);
  //               // designRequest.referenceImages.push(a);
  //             }
  //           };
  //         });
  //       };
  //     }
  //     input_file.click();
  //   });
  // }

  get referenceImages() {
    if (this.designRequestForm) {
      return this.designRequestForm.get('images') as FormArray;
    } else {
      return new FormArray([]);
    }
  }

  removeImage(imageArray: FormArray, index: number) {
    imageArray.removeAt(index);
  }

  async submitDesign() {
    this.serverBusy = true;
    // this.is_loading = true;
    const designRequest: DesignRequestModel = this.designRequestForm.value;
    const description = `
Description:
${this.getValue(this.detail_form, 'description')}

Event name:
${this.getValue(this.form_group_v2, 'title')}

Special Phrase or Bible quote:
${this.getValue(this.designRequestForm, 'special_text')}

Date:
${this.formatDate()}

Event time:
${this.formatTime()}

Ministry/group associated:
${this.getGroupName()}

Location:
${this.getValue(this.detail_form, 'full_address')}

Special Guest:
${this.getValue(this.designRequestForm, 'speaker')}

Color guide:
${this.getValue(this.designRequestForm, 'specifiedColors')}

Size guide:
${this.getValue(this.designRequestForm, 'size_guide')}
`;
    designRequest.description = description;
    designRequest.title = `Design Request For: ${this.form_group_v2.get('title').value}`;
    designRequest.idUser = this.currentUser.idUsuario;
    const validate = this.validateInputs(designRequest);
    if (validate.success) {
      const promises = [];
      // designRequest.images = [];
      const iglesia_temp = new OrganizationModel();
      iglesia_temp.idIglesia = this.currentUser.idIglesia;
      iglesia_temp.topic = this.currentUser.topic;
      for await (const image of designRequest.images) {
        promises.push(new Promise((resolve, reject) => {
          const indexPoint = (image.file.name as string).lastIndexOf('.');
          const extension = (image.file.name as string).substring(indexPoint);
          const ticks = (Number(String(Math.random()).slice(2)) + Date.now() + Math.round(performance.now())
          ).toString(36);
          const myUniqueFileName = ticks + extension;

          return resolve(this.organizationService.uploadFile(image.file, iglesia_temp, myUniqueFileName, 'designRequest'));
        }));

      }
      await Promise.all(promises)
        .then(responses => {
          for (let index = 0; index < responses.length; index++) {
            designRequest.images[index].url = `${responses[index].file_info.src_path}`;
            designRequest.images[index].blob = undefined;
          }
          this.designRequestService.addDesignRequest(designRequest)
            .subscribe(response => {
              this.api.showToast('Record saved correctly', ToastType.success);
              this.dismiss(response);
              this.serverBusy = false;
              // this.is_loading = false;
            }, err => {
              console.error(JSON.stringify(err));
              this.api.showToast('Error saving the designRequest', ToastType.error);
              /** CLEANING IMAGES */
              const images = [];
              responses.forEach(imgResponse => {
                const img = {
                  url: imgResponse.response
                };
                images.push(img);
              });
              this.organizationService.deleteImages(images)
                .subscribe(respnseDel => { });
            });
          this.serverBusy = false;
          // this.is_loading = false;
        }).catch(errors => {
          console.error(JSON.stringify(errors));
          this.serverBusy = false;
          // this.is_loading = false;
        });
    } else {
      this.serverBusy = false;
      // this.is_loading = false;
      this.api.showToast(validate.message, ToastType.info, 'Ups!');
    }
  }

  async submitDesignV2(idGroupEvent: number) {
    console.log(idGroupEvent);

    this.serverBusy = true;
    const description = `
Description:
${this.getValue(this.detail_form, 'description')}

Event name:
${this.getValue(this.form_group_v2, 'title')}

Date:
${this.formatDate()}

Event time:
${this.formatTime()}

Ministry/group associated:
${this.getGroupName()}

Location:
${this.getValue(this.detail_form, 'full_address')}

`;
    let other = this.style_form.get('types').value.join(', ');
    const payload: Partial<DesignRequestModel> = {
      idGroupEvent,
      idDesignRequestStatus: 6,
      idIglesia: this.currentUser.idIglesia,
      idDesignRequestType: 7,
      other,
      description: description,
      designerCriteria: true,
      specifiedColors: "",
      quantity: 1,
      deadline: moment().add(3, 'day').format('YYYY-MM-DD'),
      idUser: this.currentUser.idUsuario,
      status: true,
      useImages: [],
      referenceImages: [],
      assignedTo: 25271, //rudy reyes
      estimatedTime: 3,
      notes: [],
      title: this.form_group_v2.get('title').value,
      is_ready: false,
      platform: "",
      idDesignRequestPriority: 1, //urgent
      idDesignRequestModule: 0,
      images: [],
      is_help_request: true
    }
    const response: any = await this.designRequestService.addDesignRequest(payload as DesignRequestModel).toPromise()
      .catch(err => {
        console.error(err);
        this.api.showToast('Error saving the designRequest', ToastType.error);
        return;
      });
    if (response) {
      if (this.currentUser.isSuperUser) {
        this.group_event.design_request = {}
        this.group_event.design_request.idDesignRequest = response.idDesignRequest;
        this.goToDesignRequest();
      } else {
        this.dismiss(true);
        this.serverBusy = false;
      }
    }
  }

  formatDate() {
    if (this.group_event.is_exact_date) {
      if (this.group_event.event_as_range) {
        return `From ${moment(this.group_event.event_date_start).format('MMMM DD, YYYY')} To ${moment(this.group_event.event_date_end).format('MMMM DD, YYYY')}`
      } else {
        return moment(this.group_event.event_date).format('MMMM DD, YYYY');
      }
    } else {
      return `Not date provided`;
    }
  }

  formatTime() {
    return `From ${this.group_event.event_time_start} To ${this.group_event.event_time_end}`
  }

  getGroupName() {
    const group = this.groups.find(x => x.idGroup === this.form_group_v2.get('idGroup').value);
    if (group) {
      return group.title;
    }
    return '';
  }

  getValue(form: FormGroup, key: string) {
    const value = form.get(key).value
    return value ? value : `${key} not provided.`;
  }

  validateInputs(designRequest: DesignRequestModel) {
    const validate = {
      success: false,
      message: 'Success'
    };

    if (designRequest.title === '') {
      validate.message = 'You have to add a title of the design.';
    } else if (designRequest.idIglesia === 0) {
      validate.message = 'You need to select a Church/Organization.';
    } else if (designRequest.idDesignRequestStatus === 0) {
      validate.message = 'You need to select a Status.';
    } else if (designRequest.idDesignRequestType === 0) {
      validate.message = 'You need to select a type of request.';
    } else if (designRequest.description === '') {
      validate.message = 'You have to add a note/description of the design.';
    } else if (designRequest.quantity <= 0) {
      validate.message = 'The requests quantity should has to be greater than 0.';
    } else if (!designRequest.idUser && designRequest.idUser !== undefined) {
      validate.message = 'There is something wrong with your user';
    } else {
      if (!designRequest.designerCriteria) {
        if (designRequest.specifiedColors === '') {
          validate.message = `You have to write the specified colores when you don't select the 'Designer Criteria' option.`;
          return validate;
        }
      }
      if (designRequest.idDesignRequestType === 7) {
        if (designRequest.other === '') {
          validate.message = 'You have to write the other type.';
          return validate;
        }
      }
      validate.success = true;
    }
    return validate;
  }

  goToDesignRequest() {
    if (this.currentUser.isSuperUser) {
      this.router.navigate([`/admin/design-request/detail/${this.group_event.design_request.idDesignRequest}`]);
    }
  }

  public getAddress(item: AutocompleteResponseModel) {
    if (item) {
      if (item.address) {
        this.detail_form.get('full_address').setValue(item.address.full_address);
        this.group_event.location = item.address.full_address;
        this.detail_form.get('detail_address_info').patchValue(item.address);
        this.detail_form.patchValue(item.address);
      }
    }
  }

  checkDate(start, end) {
    return moment(end).isAfter(moment(start), 'day');
  }

  async setOrganizationAddress() {
    if (this.detail_form.value.same_address_as_church) {
      const item = new OrganizationModel();
      item.idIglesia = this.currentUser.idIglesia;
      const response: any = await this.organizationService.getIglesiaDetail(item).toPromise();
      if (response) {
        const organization = response.iglesia;
        organization.full_address = GoogleAddressComponent.formatFullAddress(organization, ['Calle', 'Ciudad', 'Provincia', 'ZIP', 'country']);
        if (organization.idIglesia && (!organization.lat || !organization.lng)) {
          const pin_info = await GoogleAddressComponent.convert(organization.full_address).catch(error => {
            console.error(error);
            return error;
          });
          if (JSON.stringify(pin_info) !== '{}') {
            const address = pin_info.address;
            address.idIglesia = organization.idIglesia;
            this.getAddress(address)
            this.api
              .post(`iglesias/updateOrganizationAddress`, address)
              .subscribe(response => {
              });
          }
        } else {
          const item: AutocompleteResponseModel = {
            address: {
              street: organization.Calle,
              city: organization.Ciudad,
              state: organization.Provincia,
              zip_code: organization.ZIP,
              country: organization.country,
              lat: organization.lat,
              lng: organization.lng,
              full_address: organization.full_address
            },
            place: {
              name: ''
            }
          }
          this.detail_form.get('full_address').setValue(item.address.full_address);
          this.group_event.location = item.address.full_address;
          if (this.address_component) {
            this.address_component.value = item.address.full_address;
            this.address_component.autocompleteInput = item.address.full_address;
          }
          this.getAddress(item);
        }
      }
    }
  }

  get custom_dates_array(): FormArray {
    if (this.custom_form.get('custom_dates')) {
      return this.custom_form.get('custom_dates') as FormArray;
    }
    return new FormArray([]);
  }

  addCustomDate() {
    const form_array: FormArray = this.custom_dates_array;
    const group: FormGroup = this.form_builder.group({
      date: new FormControl(moment().format('YYYY-MM-DD')),
      start_time: new FormControl('13:00'),
      end_time: new FormControl('14:00'),
    });
    form_array.push(group);
  }

  removeCustomDate(index: number) {
    this.custom_dates_array.removeAt(index);
  }

  reloadMap() {
    this.init_map = false;
    setTimeout(() => {
      this.init_map = true;
    }, 250);
  }

  handleMultiDay() {
    const is_range: boolean = this.settings_form.get('event_as_range').value;
    if (is_range) {
      const min_value = this.settings_form.get('event_date').value;
      this.settings_form.addControl('date_end', new FormControl(min_value, [Validators.required, Validators.min(min_value)]))
    } else {
      this.settings_form.removeControl('date_end');
    }
  }

  handleAllDay() {
    const is_all_day: boolean = this.settings_form.get('all_day').value;
    if (is_all_day) {
      this.settings_form.removeControl('start_time');
      this.settings_form.removeControl('end_time');
    } else {
      this.settings_form.addControl('start_time', new FormControl('13:00'))
      this.settings_form.addControl('end_time', new FormControl('14:00'))
    }
  }

  handleFrequency() {
    const frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' = this.settings_form.get('frequency').value;
    if (frequency !== 'custom') {
      this.settings_form.removeControl('custom');
    } else {
      const custom_settings = this.form_builder.group({
        frequency: new FormControl('weekly'),
        // repeat_count: new FormControl(1, [Validators.required, Validators.min(1), Validators.max(100)])
      })
      this.settings_form.addControl('custom', custom_settings);
      this.handleCustomFrequency();
    }
  }

  handleCustomFrequency() {
    const frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' = this.custom_form.get('frequency').value;
    let every_control: FormControl;
    const validators: ValidatorFn[] = [];
    if (frequency !== 'custom') {
      validators.push(Validators.required);
      validators.push(Validators.min(1));
      if (frequency === 'daily') {
        validators.push(Validators.max(60));
      } else if (frequency === 'weekly') {
        validators.push(Validators.max(52));
        const get_actual_day = this.settings_form.get('event_date').value;
        let day: number;
        if (get_actual_day) {
          day = moment(get_actual_day).day();
        } else {
          day = moment().day();
        }
        const values = [];
        values.push(day);
        this.custom_form.addControl('active_days', new FormControl(values));
      } else if (frequency === 'monthly') {
        validators.push(Validators.max(36));
        if (this.custom_form.get('custom_every')) {
          this.custom_form.get('custom_every').setValue('each');
        } else {
          this.custom_form.addControl('custom_every', new FormControl('each'));
        }
      } else {
        // yearly
        validators.push(Validators.max(1));
        const get_actual_day = this.settings_form.get('event_date').value;
        let day: number;
        if (get_actual_day) {
          day = moment(get_actual_day).month();
        } else {
          day = moment().month();
        }
        const values = [];
        values.push(day);
        this.custom_form.addControl('active_months', new FormControl(values));
        if (this.custom_form.get('custom_every')) {
          this.custom_form.get('custom_every').setValue('each');
        } else {
          this.custom_form.addControl('custom_every', new FormControl('each'));
        }
      }
      if (frequency != 'weekly') {
        this.custom_form.removeControl('active_days');
      }
      if (frequency != 'monthly') {
        this.custom_form.removeControl('position');
        this.custom_form.removeControl('granularity');
      }
      if (frequency != 'yearly') {
        this.custom_form.removeControl('active_months');
      }
      if (frequency != 'monthly' && frequency != 'yearly') {
        this.custom_form.removeControl('custom_every');
      }
      every_control = new FormControl(1, validators);
      if (this.custom_form.get('every')) {
        this.custom_form.get('every').setValidators(validators);
        if (frequency === 'yearly') {
          this.custom_form.get('every').setValue(1);
        }
      } else {
        this.custom_form.addControl('every', every_control);
      }
      this.custom_form.removeControl('custom_dates');
      this.custom_form.removeControl('each_date_has_time');
    } else {
      this.custom_form.addControl('custom_dates', new FormArray([]));
      this.addCustomDate();
      this.custom_form.addControl('each_date_has_time', new FormControl(false))
      this.custom_form.removeControl('every');
      this.custom_form.removeControl('active_days');
      this.custom_form.removeControl('custom_every');
      this.custom_form.removeControl('position');
      this.custom_form.removeControl('granularity');
      this.custom_form.removeControl('active_months');
    }
    // // if (frequency !== 'custom') {
    // //   this.settings_form.removeControl('custom');
    // // } else {
    // //   const custom_settings = this.form_builder.group({
    // //     frequency: new FormControl('weekly'),
    // //     repeat_count: new FormControl(1, [Validators.required, Validators.min(1), Validators.max(100)])
    // //   })
    // //   this.settings_form.addControl('custom', custom_settings);
    // // }
  }

  handleRepeat() {
    const should_repeat: boolean = this.settings_form.get('repeat').value;
    if (should_repeat) {
      this.settings_form.addControl('frequency', new FormControl('weekly'))
      this.settings_form.addControl('ends_on', new FormControl('never'))
    } else {
      this.settings_form.removeControl('frequency');
      this.settings_form.removeControl('ends_on');
      this.settings_form.removeControl('repeat_until');
      this.settings_form.removeControl('repeat_count');
      this.settings_form.removeControl('custom');
    }
  }

  setEnding() {
    const ends_on: 'never' | 'after' | 'on_date' = this.settings_form.get('ends_on').value;
    if (ends_on != 'never') {
      if (ends_on === 'after') {
        this.settings_form.addControl('repeat_count', new FormControl(1, [Validators.required, Validators.min(1), Validators.max(100)]));
        this.settings_form.removeControl('repeat_until');
      } else {
        this.settings_form.addControl('repeat_until', new FormControl(moment.tz().format('YYYY-MM-DD'), [Validators.required]));
        this.settings_form.removeControl('repeat_count');
      }
    } else {
      this.settings_form.removeControl('repeat_until');
      this.settings_form.removeControl('repeat_count');
    }
  }

  verifyStartDate() {
    const start_date = this.settings_form.get('event_date').value;
    if (this.settings_form.get('repeat_until')) {
      const ends_on = this.settings_form.get('repeat_until').value;
      const ends_before = moment(ends_on).isBefore(start_date, 'day');
      if (ends_before) {
        this.settings_form.get('repeat_until').setValue(start_date);
        // this.settings_form.setControl('repeat_until', new FormControl(moment.tz().format('YYYY-MM-DD'), [Validators.required]));
      }
    }
    if (this.settings_form.get('date_end')) {
      const ends_on = this.settings_form.get('date_end').value;
      const ends_before = moment(ends_on).isBefore(start_date, 'day');
      if (ends_before) {
        this.settings_form.get('date_end').setValue(start_date);
      }
    }
  }

  toggleItem(index_day: number, control_name: 'active_days' | 'active_months' | 'types') {
    const form_group = control_name === 'types' ? this.style_form.get(control_name) : this.custom_form.get(control_name);
    if (form_group) {
      const active_item: number[] = form_group.value;
      if (active_item.includes(index_day)) {
        const index_of = active_item.indexOf(index_day);
        active_item.splice(index_of, 1);
        form_group.setValue(active_item);
      } else {
        active_item.push(index_day);
      }
    }
  }
  isActiveItem(search_value: number, control_name: 'active_days' | 'active_months' | 'types') {
    const form_group = control_name === 'types' ? this.style_form.get(control_name) : this.custom_form.get(control_name);
    if (form_group) {
      const active_day: number[] = form_group.value;
      return active_day.includes(search_value);
    }
    return false;
  }

  getDayForDate(): number {
    const event_date = this.settings_form.get('event_date').value;
    if (event_date) {
      return moment(event_date).date();
    }
    return null
  }

  handleCustomEvery() {
    const every: 'each' | 'on_date' = this.custom_form.get('custom_every').value;
    if (every != 'each') {
      this.custom_form.addControl('position', new FormControl('first'));
      this.custom_form.addControl('granularity', new FormControl('day'));
      if (this.custom_form.get('frequency').value === 'yearly') {
        this.custom_form.get('position').setValue(every);
      }
    } else {
      this.custom_form.removeControl('position');
      this.custom_form.removeControl('granularity');
    }
  }

  getDateName() {
    const date = this.getDayForDate();
    if (date) {
      if (date == 1) {
        return `1st`;
      } else if (date == 2) {
        return `2nd`;
      } else if (date == 3) {
        return `3rd`;
      } else {
        return `${date}th`;
      }
    }
    return '';
  }

  toggleType(index_day: number, control_name: 'active_days' | 'active_months') {
    if (this.custom_form.get(control_name)) {
      const active_item: number[] = this.custom_form.get(control_name).value;
      if (active_item.includes(index_day)) {
        const index_of = active_item.indexOf(index_day);
        active_item.splice(index_of, 1);
        this.custom_form.get(control_name).setValue(active_item);
      } else {
        active_item.push(index_day);
      }
    }
  }

}
