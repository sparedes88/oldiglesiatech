import { AutocompleteResponseModel, GoogleAddressComponent } from '../../../component/google-places/google-places.component';
import { Router } from '@angular/router';
import { DesignRequestImageModel, DesignRequestModel } from '../../../models/DesignRequestModel';
import { OrganizationService } from '../../../services/organization/organization.service';
import { Observable } from 'rxjs';
import { ToastType } from 'src/app/login/ToastTypes';
import { FormGroup, Validators, FormBuilder, FormArray, FormControl, NgForm } from '@angular/forms';
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
  selector: 'app-group-event-setting-form',
  templateUrl: './group-event-setting-form.component.html',
  styleUrls: ['./group-event-setting-form.component.scss']
})
export class GroupEventSettingFormComponent implements OnInit {

  @ViewChild('event_form') event_form: NgForm;
  @ViewChild('multi_select') multi_select: MultiSelectComponent;
  @ViewChild('click_to_glitch') click_to_glitch: ElementRef;
  @ViewChild('address_component') address_component: GoogleAddressComponent;
  @Output() submit = new EventEmitter();

  group_event: GroupEventModel = new GroupEventModel();
  events: CalendarEvent[] = [];

  currentUser: User;

  frequencies: FrequencyModel[] = [];
  selected_frequency: FrequencyModel;
  groups: GroupModel[] = [];

  show_groups_dropdown: boolean = false;
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

  dias: any[] = [];
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
  public eventFormGroup: FormGroup = this.formBuilder.group({
    idGroupEvent: [''],
    idGroup: ['', Validators.required],
    name: ['', Validators.required],
    description: ['', Validators.required],
    idFrequency: new FormControl(0, [
      Validators.required,
      Validators.pattern(/[^0]+/),
      Validators.min(0)
    ]),
    event_as_range: [false],
    event_date: [undefined],
    event_date_start: [undefined],
    event_date_end: new FormControl({ value: 0, disabled: true }, [
      Validators.required,
      Validators.min(this.getMin())
    ]),
    event_time_start: [undefined],
    event_time_end: [undefined],
    repeat_until_date: [undefined],
    event_current_week: [''],
    days: this.formBuilder.array([]),
    created_by: [''],
    is_exact_date: [],
    picture: [null],
    button_text: [null],
    button_color: [null],
    live_event_url: [null],
    capacity: [null],
    help_request: [null],
    ticket_cost: [null],
    location: [null],
    publish_status: ['draft'],
    same_address_as_church: [false],
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
  });
  public wordpressSettings
  public wpConfig: any;
  public wpImages: any[] = []
  get days_on_form(): FormArray {
    return this.eventFormGroup.get('days') as FormArray;
  }

  designRequestForm: FormGroup;

  constructor(
    public groupService: GroupsService,
    public formBuilder: FormBuilder,
    public fus: FileUploadService,
    public userService: UserService,
    public organizationService: OrganizationService,
    public wpService: WordpressService,
    public api: ApiService,
    public ngZone: NgZone,
    public designRequestService: DesignRequestService,
    public router: Router
  ) {
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
    this.getWordpressSettings()
    if (this.group_event.idGroupEvent) {
      this.help_request = this.group_event.help_request
      this.eventFormGroup.patchValue(
        {
          idGroupEvent: this.group_event.idGroupEvent,
          idFrequency: this.group_event.idFrequency,
          idGroup: this.group_event.idGroup,
          event_date: this.group_event.event_date
        }
      );
      this.eventFormGroup.removeControl('days');
      this.eventFormGroup.addControl('days', this.formBuilder.array([]));
      this.dias = [];

      this.onSelectFrequency(true);

      this.eventFormGroup.patchValue(
        {
          event_as_range: this.group_event.event_as_range
        }
      );
      if (this.group_event.is_exact_date) {
        this.printChange(this.group_event.is_exact_date);
      } else {
        if (!this.group_event.event_current_week) {
          this.group_event.event_current_week = moment(this.group_event.start_date).format('YYYY-MM-DD');
        }
      }

      this.eventFormGroup.patchValue(this.group_event);
      if (this.group_event.days) {
        this.group_event.days.forEach(day => {
          this.addDay(day);
        });
      }
      if (this.show_groups_dropdown) {
        this.multi_select.writeValue(this.groups.filter(x => x.idGroup === this.group_event.idGroup));
      }
      if (this.group_event.idFrequency === 7) {
        this.group_event.custom_dates.forEach(date => {
          this.addCustomDate(date);
        })


      }
    } else {
      this.multi_select.selectedItems = [];
    }
    this.help_request = this.group_event.help_request;
    if (this.group_event.help_request) {
      this.initOrResetForm(null);
    }
    setTimeout(() => {
      this.init_map = true;
      this.click_to_glitch.nativeElement.click();
    }, 100);
  }
  update() {
    console.log(this.eventFormGroup)
  }
  loadFrequencies() {
    return new Promise((resolve, reject) => {
      this.groupService.getFrequencies()
        .subscribe((data: any) => {
          this.frequencies = data.frecuencias_v2;
          if (!this.show_groups_dropdown) {
            this.eventFormGroup.patchValue({ idGroup: this.group_event.idGroup });
          }
          return resolve(true);
        }, error => {
          console.error(error);
          return reject(false);
        });
    });
  }

  dismiss(response?) {
    this.submit.emit(response);
    this.event_form.resetForm();
  }

  onSelectFrequency(prevent_add_date?: boolean) {
    const id_temp = +this.eventFormGroup.get('idFrequency').value;
    if (id_temp === 0) {
      if (this.dias.length > 0) {
        const confirmation = confirm(`You add some days and these will be loose. Are you sure to continue?`);
        if (!confirmation) {
          this.eventFormGroup.get('idFrequency').setValue(this.selected_frequency.id);
          return;
        }
        this.dias = [];
        this.eventFormGroup.get('idFrequency').setValue(id_temp);
        this.days_on_form.controls.forEach(control => {
          const index = this.days_on_form.controls.indexOf(control);
          this.days_on_form.removeAt(index);
        });
      } else {
        this.selected_frequency = undefined;
      }
      return;
    }
    const freq_temp = this.frequencies.find(x => x.id === id_temp);
    if (freq_temp.is_exact_date && this.dias.length > 0) {
      const confirmation = confirm(`You add some days and these will be loose. Are you sure to continue?`);
      if (!confirmation) {
        this.eventFormGroup.get('idFrequency').setValue(this.selected_frequency.id);
        return;
      }
    }
    console.log(freq_temp);
    if (freq_temp.id === 7) {
      this.dias = [];
      this.days_on_form.controls.forEach(control => {
        const index = this.days_on_form.controls.indexOf(control);
        this.days_on_form.removeAt(index);
      });
      this.eventFormGroup.addControl('custom_dates', new FormArray([]));
      this.eventFormGroup.addControl('each_date', new FormControl(false));
      if (!prevent_add_date) {
        this.addCustomDate();
      }
    } else {
      this.eventFormGroup.removeControl('custom_dates');
      this.eventFormGroup.removeControl('each_date');
    }
    const idFrequency = +this.eventFormGroup.get('idFrequency').value;
    this.selected_frequency = this.frequencies.find(x => x.id === idFrequency);

    if (this.selected_frequency.is_exact_date) {
      this.days_on_form.controls.forEach(control => {
        const index = this.days_on_form.controls.indexOf(control);
        this.days_on_form.removeAt(index);
      });
      this.dias = [];
      this.eventFormGroup.removeControl('event_current_week');
      this.eventFormGroup.get('repeat_until_date').setValue(undefined);
      const is_range = this.eventFormGroup.get('event_as_range').value;
      this.eventFormGroup.addControl('event_time_start', new FormControl('', Validators.required));
      this.eventFormGroup.addControl('event_time_end', new FormControl('', Validators.required));
      this.eventFormGroup.addControl('event_time_end', new FormControl('', Validators.required));
      if (is_range) {
        // Clear event_date
        this.eventFormGroup.removeControl('event_date');

        this.eventFormGroup.addControl('event_date_start', new FormControl('', Validators.required));
        this.eventFormGroup.addControl('event_date_end', new FormControl('', Validators.required));

      } else {
        // Clear event_start_date and end
        this.eventFormGroup.addControl('event_date', new FormControl('', Validators.required));

        this.eventFormGroup.removeControl('event_date_start');
        this.eventFormGroup.removeControl('event_date_end');
      }
    } else {
      if (freq_temp.id === 7) {
        if (this.eventFormGroup.get('event_current_week')) {
          this.eventFormGroup.removeControl('event_current_week');
        }
      } else {
        this.eventFormGroup.addControl('event_current_week', new FormControl('', Validators.required));
      }

      this.eventFormGroup.removeControl('event_date');
      this.eventFormGroup.removeControl('event_date_start');
      this.eventFormGroup.removeControl('event_date_end');
      if (freq_temp.id != 7) {
        this.eventFormGroup.removeControl('event_time_start');
        this.eventFormGroup.removeControl('event_time_end');
      } else {
        if (!this.eventFormGroup.get('event_time_start')) {
          this.eventFormGroup.addControl('event_time_start', new FormControl('', [Validators.required]));
          this.eventFormGroup.addControl('event_time_end', new FormControl('', [Validators.required]));
        }
      }
    }
  }

  addDay(exist_day?: GroupEventDayModel) {
    let day;
    if (exist_day) {
      day = {
        idDay: exist_day.idDay,
        event_time_start: exist_day.event_time_start,
        event_time_end: exist_day.event_time_end,
      };
    } else {
      day = {
        idDay: 0,
        event_time_start: undefined,
        event_time_end: undefined,
      };

    }

    const control = this.days_on_form;

    control.push(this.formBuilder.group({
      idDia: new FormControl(day.idDay, [
        Validators.required,
        Validators.pattern(/[^0]+/),
        Validators.min(0)
      ]),
      event_time_start: new FormControl(day.event_time_start, [
        Validators.required
      ]),
      event_time_end: new FormControl(day.event_time_end, [
        Validators.required
      ])
    }
    ));
    this.dias.push(day);
  }

  removeDay(dia) {
    const index = this.dias.indexOf(dia);
    if (index !== -1) {
      this.days_on_form.removeAt(index);
      this.dias.splice(index, 1);
    }
  }

  checkClick() {
    console.log('Triggered');
  }

  printChange(event) {
    const is_range: boolean = this.eventFormGroup.get('event_as_range').value;
    if (is_range) {
      this.eventFormGroup.addControl('event_date_start', new FormControl(['', Validators.required]));
      this.eventFormGroup.addControl('event_date_end', new FormControl(['', Validators.required]));
      this.eventFormGroup.removeControl('event_date');
      this.eventFormGroup.get('event_date_start').setValue(undefined);
      this.eventFormGroup.get('event_date_end').setValue(undefined);
      this.eventFormGroup.get('event_date_end').disable();
    } else {
      // this.eventFormGroup.get('event_date_start').setValue(undefined);
      // this.eventFormGroup.get('event_date_end').setValue(undefined);
      // this.eventFormGroup.get('event_date_end').disable();
      this.eventFormGroup.addControl('event_date', new FormControl(['', Validators.required]));
      this.eventFormGroup.removeControl('event_date_start');
      this.eventFormGroup.removeControl('event_date_end');
      this.eventFormGroup.get('event_date').setValue(undefined);
    }
  }

  getMin() {
    if (this.eventFormGroup) {
      return this.eventFormGroup.get('event_date_start').value;
    } else {
      return undefined;
    }
  }

  checkKey(event) {
    return event.code === 'Tab';
  }

  async submitForm(form: FormGroup) {
    if (this.selected_frequency) {
      if (!this.selected_frequency.is_exact_date && this.selected_frequency.id != 7) {
        // not exact date
        form.value.event_date = undefined;
        form.value.event_date_start = undefined;
        form.value.event_date_end = undefined;
        form.value.event_time_start = undefined;
        form.value.event_time_end = undefined;
        if (this.dias.length === 0) {
          this.groupService.api.showToast(`With this frequency you need to add at least one day.`, ToastType.info);
          return;
        }
      } else {
        if (this.selected_frequency.id == 7) {
          if (this.custom_dates_array.length === 0) {
            this.groupService.api.showToast(`With this frequency you need to add at least one date.`, ToastType.info);
            return;
          }
        }
      }
    } else {
      this.groupService.api.showToast(`You should select a frequency.`, ToastType.info);
      return;
    }

    if (form.invalid) {
      this.groupService.api.showToast(`Please check the form and try again`, ToastType.warning);
    }
    this.group_event = form.value;
    if (this.show_groups_dropdown) {
      const group_array: any[] = this.eventFormGroup.get('idGroup').value;
      let idGroup: number;
      if (group_array.length > 0) {
        idGroup = Number(JSON.parse(group_array[0].idGroup));
      }
      // form.patchValue({ idGroup });
      this.group_event.idGroup = idGroup;
    } else {
      this.group_event.idGroup = this.group_event.idGroup;
      // form.get('idGroup').setValue();
    }

    this.group_event.is_exact_date = this.selected_frequency.is_exact_date;
    let subscription: Observable<any>;
    let message_error: string;
    let message_success: string;
    this.group_event.help_request = this.help_request
    if (this.help_request) {
      if (this.designRequestForm.invalid) {
        this.api.showToast(`Ups! Some info about your design is required.`, ToastType.info);
        return;
      } else {
        const value = this.designRequestForm.value;
        if (value.size_guide) {
          if (!value.size_guide.includes('x')) {
            this.api.showToast(`Ups! The size guide should follow the format height x width.`, ToastType.info);
            return;
          } else {
            const size_guide = (value.size_guide as string).split('x');
            if (size_guide.length > 1) {
              const height = size_guide[0];
              const width = size_guide[1];
              if (height === '') {
                this.api.showToast(`Ups! The height is required.`, ToastType.info);
                return;
              } else if (width === '') {
                this.api.showToast(`Ups! The width is required.`, ToastType.info);
                return;
              } else {
                if (Number.isNaN(Number(height)) || Number.isNaN(Number(width))) {
                  this.api.showToast(`Ups! The height or width should be numbers.`, ToastType.info);
                  return;
                }
              }
            } else {
              this.api.showToast(`Ups! The size guide should follow the format height x width.`, ToastType.info);
              return;
            }
          }
        }
      }
    }
    const payload = this.eventFormGroup.value;
    console.log(payload);
    // if (payload.same_address_as_church) {
    //   if (this.group_event.location) {
    //     const pin_info = await GoogleAddressComponent.convert(this.group_event.location).catch(error => {
    //       console.error(error);
    //       return error;
    //     });
    //     if (JSON.stringify(pin_info) !== '{}') {
    //       const address = pin_info.address;
    //       address.idIglesia = this.currentUser.idIglesia;
    //       this.api
    //         .post(`iglesias/updateOrganizationAddress`, address)
    //         .subscribe(response => {
    //         });
    //     }
    //   }
    // }
    // console.log(form)
    this.group_event.timezone = moment_timezone.tz.guess();
    if (this.group_event.idGroupEvent) {
      subscription = this.groupService.updateSettingEvent(this.group_event);
      message_error = `Error updating the event.`;
      message_success = `Event updated successfully.`;
    } else {
      subscription = this.groupService.addSettingEvent(this.group_event);
      message_error = `Error adding the event.`;
      message_success = `Event added successfully.`;
    }
    subscription.subscribe(response => {
      if (this.help_request) {
        this.designRequestForm.get('idGroupEvent').setValue(response.idGroupEvent);
        this.submitDesign();
      } else {
        this.groupService.api.showToast(message_success, ToastType.success);
        this.submit.emit(true);
        this.updateRequestCount()
      }
    }, error => {
      console.error(error);
      if (error.error.msg.Code === 422) {
        this.groupService.api.showToast(`${error.error.msg.Message}`, ToastType.info);
      } else {
        this.groupService.api.showToast(message_error, ToastType.error);
        this.submit.emit();
      }
    });
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
        this.group_event.picture = this.fus.cleanPhotoUrl(response.response);
        // const group = Object.assign({}, this.group_event);
        //   this.groupsService.updateGroup(group)
        //     .subscribe(response_updated => {
        //       this.groupsService.api.showToast(`Slider updated successfully`, ToastType.success);
        //     }, error => {
        //       console.error(error);
        //       this.groupsService.api.showToast(`Something happened trying to save the slider.`, ToastType.error);
        //     });
        // });
        this.eventFormGroup.patchValue({ picture: this.group_event.picture });
      });
  }

  showGroupDropdown() {
    this.show_groups_dropdown = true;
    this.groupService.getGroups()
      .subscribe((data: any) => {
        this.groups = data.groups;
      }, error => {
        console.error(error);
      });
  }

  initOrResetForm(event) {
    if (this.help_request) {
      this.designRequestForm = new FormGroup({
        idDesignRequestType: new FormControl(1),
        idDesignRequestStatus: new FormControl(1),
        idIglesia: new FormControl(this.currentUser.idIglesia),
        idUser: new FormControl(this.currentUser.idUsuario),
        special_text: new FormControl(),
        speaker: new FormControl(),
        specifiedColors: new FormControl('', [Validators.maxLength(1000)]),
        size_guide: new FormControl('', []),
        images: new FormArray([]),
        assignedTo: new FormControl(0),
        deadline: new FormControl(moment().add(3, 'day').format('YYYY-MM-DD')),
        description: new FormControl(),
        designerCriteria: new FormControl(false),
        estimatedTime: new FormControl(0),
        other: new FormControl(""),
        quantity: new FormControl(1),
        status: new FormControl(true),
        title: new FormControl(),
        idGroupEvent: new FormControl()
      });
    } else {

    }
  }

  showActionSheet(idDesignRequestImageType: number, input_file) {
    const a = new DesignRequestImageModel();
    a.idDesignRequestImageType = idDesignRequestImageType;

    this.ngZone.run(() => {
      if (input_file) {
        input_file.onchange = (event: { target: { files: FileList } }) => {

          Array.from(event.target.files).forEach(file => {
            a.file = file;
            a.idUser = this.currentUser.idUsuario;
            if (file.type.includes('image')) {
              a.type = 'image';
            } else {
              a.type = 'file';
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
              a.blob = reader.result as any;
              const array = this.designRequestForm.get('images') as FormArray;
              const form_image = new FormGroup({
                idDesignRequestImageType: new FormControl(),
                file: new FormControl(),
                idUser: new FormControl(),
                type: new FormControl(),
                blob: new FormControl()
              });
              form_image.patchValue(a);
              if (idDesignRequestImageType === 1) {
                array.push(form_image);
                // designRequest.useImages.push(a);
              } else {
                array.push(form_image);
                // designRequest.referenceImages.push(a);
              }
            };
          });
        };
      }
      input_file.click();
    });
  }

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
    const designRequest: DesignRequestModel = this.designRequestForm.value;
    const description = `
Description:
${this.getValue(this.eventFormGroup, 'description')}

Event name:
${this.getValue(this.eventFormGroup, 'name')}

Special Phrase or Bible quote:
${this.getValue(this.designRequestForm, 'special_text')}

Date:
${this.formatDate()}

Event time:
${this.formatTime()}

Ministry/group associated:
${this.getGroupName()}

Location:
${this.getValue(this.eventFormGroup, 'location')}

Special Guest:
${this.getValue(this.designRequestForm, 'speaker')}

Color guide:
${this.getValue(this.designRequestForm, 'specifiedColors')}

Size guide:
${this.getValue(this.designRequestForm, 'size_guide')}
`;
    designRequest.description = description;
    designRequest.title = `Design Request For: ${this.eventFormGroup.get('name').value}`;
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
        }).catch(errors => {
          console.error(JSON.stringify(errors));
          this.serverBusy = false;
        });
    } else {
      this.serverBusy = false;
      this.api.showToast(validate.message, ToastType.info, 'Ups!');
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
    return this.groups.find(x => x.idGroup === this.group_event.idGroup).title;
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
    console.log(item);

    if (item) {
      if (item.address) {
        this.eventFormGroup.get('location').setValue(item.address.full_address);
        this.group_event.location = item.address.full_address;
        this.eventFormGroup.get('detail_address_info').patchValue(item.address);
        this.eventFormGroup.patchValue(item.address);
      }
    }
  }

  formatEvents() {
    console.log(this.selected_frequency);
    console.log(this.days_on_form.value);
    const events_final = [];

    const events = [];
    if (this.selected_frequency) {
      if (this.selected_frequency.is_exact_date) {
        const event_for_value = this.eventFormGroup.value;
        let actual_event;
        if (event_for_value.event_as_range) {
          actual_event = moment(event_for_value.event_date_start);
        } else {
          actual_event = moment(event_for_value.event_date);
        }
        const event_date = moment(`${actual_event.format('YYYY-MM-DD')} ${event_for_value.event_time_start}`, 'YYYY-MM-DD HH:mm');
        events.push({
          name: this.eventFormGroup.value.name,
          is_exact_date: true,
          event_date_: event_date.toDate(),
          segment: this.selected_frequency.segment,
          quantity: this.selected_frequency.quantity,
          event_time_end: event_for_value.event_time_end,
          event_as_range: event_for_value.event_as_range,
          event_date_end: actual_event
        });
      } else {
        const days: any[] = this.days_on_form.value;
        const event_current_week = this.eventFormGroup.value.event_current_week;
        console.log(event_current_week);
        const actual_date = event_current_week;
        console.log(moment(actual_date).get('weekday'));
        const week_start = moment(actual_date).add(-moment(actual_date).get('weekday'), 'day');
        console.log(week_start.format('YYYY-MM-DD'));
        // const week_start = (select DATEADD(DAY, 1-DATEPART(WEEKDAY, @actual_date), @actual_date));
        // declare @week_end date = (select DATEADD(wk, 1, DATEADD(DAY, 0-DATEPART(WEEKDAY, @actual_date), DATEDIFF(dd, 0, @actual_date))));
        if (days.length > 0) {
          days.forEach(day => {
            const index_day = Number(day.idDia) - 1;
            // const event_date = moment(week_start).add(moment('1900-01-01').diff(actual_date, 'day') , 'day')
            const event_date = moment(`${week_start.format('YYYY-MM-DD')} ${day.event_time_start}`, 'YYYY-MM-DD HH:mm').add(index_day + 1, 'day');
            console.log(event_date.format('YYYY-MM-DD'));
            console.log(event_date.toDate());
            // DATEADD(DAY, (DATEDIFF(DAY, index_day + 1, week_start) / 7) * 7 + 7, index_day)
            events.push({
              name: this.eventFormGroup.value.name,
              index_day,
              event_date_: event_date.toDate(),
              segment: this.selected_frequency.segment,
              quantity: this.selected_frequency.quantity,
              event_time_end: day.event_time_end
            });
          });
          // DATEADD(DAY, (DATEDIFF(DAY, tda.index_day + 1, start_date) / 7) * 7 + 7, tda.index_day)
        }
      }
    }
    let viewDate;
    let viewDateNext;
    viewDate = new Date();
    viewDateNext = moment(viewDate).add(2, "M").toDate();

    console.log(viewDate);
    console.log(viewDateNext);
    const events_clear = events
      .map((e) => e.idGroupEvent)
      .map((e, index, final) => final.indexOf(e) === index && index)
      .filter((e) => events[e])
      .map((e) => events[e]);

    let i = 0;
    // iterate clean array to filter raw events and use the same color for each event.
    events_clear.forEach((event_clear) => {
      const color = { primary: this.random_color(), secondary: this.random_color() };
      event_clear.color = color;
      events
        .filter((event) => event.idGroupEvent === event_clear.idGroupEvent)
        // iterate filtered arrays
        .forEach((event) => {
          let event_end;
          if (event.event_as_range) {
            // is range
            if (event.event_date_end) {
              event_end =
                moment(event.event_date_end)
                  .utc()
                  .format("YYYY-MM-DD")
                  .substring(0, 10) + " ";
              event_end += event.event_time_end;
              event_end = moment(event_end).toDate();
            }
          } else {
            if (event.is_exact_date) {
              event_end =
                moment(event.event_date_)
                  .utc()
                  .format("YYYY-MM-DD")
                  .substring(0, 10) + " ";
              event_end += event.event_time_end;
              event_end = moment(event_end).toDate();
            }
          }
          let event_actual_date = moment(event.event_date_).toDate();
          let last_day_of_end;
          if (event.repeat_until_date) {
            last_day_of_end = moment(event.repeat_until_date)
              .endOf("month")
              .toDate();
          } else {
            if (event.is_exact_date) {
              if (event.event_as_range) {
                last_day_of_end = moment(event.event_date_end)
                  .endOf("month")
                  .toDate();
              } else {
                last_day_of_end = moment(event.end_date).endOf("month").toDate();
              }
            } else {
              last_day_of_end = moment(viewDateNext).endOf("month")
                .toDate();;
            }
          }
          // const last_day_of_end = lastDayOfMonth(viewDateNext);
          do {
            let event_end_to_others;
            if (!event_end) {
              // Fix event_end for events without range and not exact date.
              console.log(event_actual_date);

              event_end_to_others =
                moment(event_actual_date)
                  .format("YYYY-MM-DD HH:mm")
                  .substring(0, 10) + " ";
              event_end_to_others += event.event_time_end;
              console.log(event_end_to_others);

              event_end_to_others = moment(event_end_to_others).toDate();
            }
            let title;
            if (event.is_exact_date) {
              title = event.name;
            } else {
              title = `${event.name} (${moment(event_actual_date)
                .utc()
                .format("MMM. DD, YYYY")})`;
            }
            const event_fixed = {
              id: i++,
              color,
              title,
              start: moment(event_actual_date).toDate(),
              end: event_end
                ? event_end
                : event_end_to_others
                  ? event_end_to_others
                  : undefined,
              allDay: false,
              resizable: {
                beforeStart: false,
                afterEnd: false,
              },
              draggable: false,
              event,
            };
            event_end_to_others = undefined;
            if (
              // Check that month and year is same.
              (event_actual_date.getMonth() === viewDate.getMonth() &&
                event_actual_date.getFullYear() === viewDate.getFullYear()) ||
              (event_actual_date.getMonth() === last_day_of_end.getMonth() &&
                event_actual_date.getFullYear() ===
                last_day_of_end.getFullYear()) ||
              (moment(event_actual_date).isSameOrAfter(viewDate, "minute") &&
                moment(event_actual_date).isSameOrBefore(
                  last_day_of_end,
                  "minute"
                ))
            ) {
              if (event.repeat_until_date) {
                // Has until_date field
                if (
                  moment(event.repeat_until_date).isSameOrAfter(
                    event_actual_date,
                    "day"
                  )
                ) {
                  // Validate that repeat until is same of after to add it to calendar.
                  events_final.push(event_fixed);
                }
              } else {
                // Added to calendar cause there isn't limit.
                events_final.push(event_fixed);
              }
            }
            event_actual_date = moment(event_actual_date)
              .add(event.quantity, this.parseSegment(event.segment))
              .toDate();
          } while (event_actual_date < last_day_of_end && event.quantity > 0);
        });
    });
    // Sort array for start date
    events_final.sort((a, b) => {
      return a.start > b.start ? 1 : -1;
    });

    // Fix id's to use it ascending
    let j = 0;
    events_final.forEach((x) => {
      x.id = j++;
    });

    // Create copy temp to filter.
    let events_final_original = [...events_final];

    // Get only colors to clean.
    const colors_clear = events_final_original
      .map((e) => e.color.primary)
      // store the keys of the unique objects
      .map((e, index, final) => final.indexOf(e) === index && index)
      // eliminate the dead keys & store unique objects
      .filter((e) => events_final_original[e])
      .map((e) => events_final_original[e]);

    // Copy to events
    const events_final_clear = [...colors_clear];
    this.events = events_final;
    return events_final;
  }

  random_color() {
    const color = `rgb(${Math.floor(Math.random() * 255)},${Math.floor(
      Math.random() * 255
    )},${Math.floor(Math.random() * 255)})`;
    return color;
  }

  parseSegment(segment) {
    switch (segment) {
      case "day":
        return "day";
      case "month":
        return "month";
      case "year":
        return "year";
      default:
        return "day";
    }
  }

  checkDate(start, end) {
    return moment(end).isAfter(moment(start), 'day');
  }

  async setOrganizationAddress() {
    if (this.eventFormGroup.value.same_address_as_church) {
      const item = new OrganizationModel();
      item.idIglesia = this.currentUser.idIglesia;
      const response: any = await this.organizationService.getIglesiaDetail(item).toPromise();
      if (response) {

        const organization = response.iglesia;
        organization.full_address = GoogleAddressComponent.formatFullAddress(organization, ['Calle', 'Ciudad', 'Provincia', 'ZIP', 'country']);
        console.log(organization);
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
          this.eventFormGroup.get('location').setValue(item.address.full_address);
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
    if (this.eventFormGroup.get('custom_dates')) {
      return this.eventFormGroup.get('custom_dates') as FormArray;
    }
    return new FormArray([]);
  }

  addCustomDate(value?: any) {
    console.log(this.eventFormGroup)
    const form_array: FormArray = this.eventFormGroup.get('custom_dates') as FormArray;
    const group: FormGroup = this.formBuilder.group({
      date: new FormControl(moment().format('YYYY-MM-DD')),
      start_time: new FormControl('13:00'),
      end_time: new FormControl('14:00'),
    });
    if (value) {
      group.patchValue(value);
    }
    form_array.push(group);
  }

  removeCustomDate(index: number) {
    this.custom_dates_array.removeAt(index);
  }

}
