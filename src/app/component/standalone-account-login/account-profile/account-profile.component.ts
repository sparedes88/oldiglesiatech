import { FREQUENCIES } from './../../../pages/donations/list/list.component';
import { CheckRequirementsComponent } from './../../check-requirements/check-requirements.component';
import { SeeStepDetailComponent } from './../../../pages/contact/see-step-detail/see-step-detail.component';
import { MatExpansionPanel } from '@angular/material';
import { UserCommitmentsModel } from 'src/app/models/UserLogModel';
import { FormGroup, Validators, FormBuilder, NgForm, FormControl } from '@angular/forms';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { environment } from 'src/environments/environment';
import { environment as environment_prod } from 'src/environments/environment.prod';
import { UserService } from 'src/app/services/user.service';
import { GroupEventAttendanceModel, GroupEventModel, GroupMemberModel, GroupModel } from 'src/app/models/GroupModel';
import { FileUploadService } from 'src/app/services/file-upload.service';
import *  as moment from 'moment';
import { CalendarEvent } from 'angular-calendar';
import { random_color } from 'src/app/models/Utility';
import { ToastType } from 'src/app/login/ToastTypes';
import { COUNTRIES_DB } from '@angular-material-extensions/select-country';
import { AppComponent } from 'src/app/app.component';
import { AutocompleteResponseModel, GoogleAddressComponent } from '../../google-places/google-places.component';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { DiscipleDisciplersModel } from 'src/app/pages/disciple/disciple-home/disciple-home.component';
import { DisciplerModel } from 'src/app/pages/disciple/approved-discipler-form/approved-discipler-form.component';
import { OrganizationModel, OrganizationSetupModel } from 'src/app/models/OrganizationModel';
import { GroupsService } from 'src/app/services/groups.service';
import { TranslateService } from '@ngx-translate/core';
import { DonationFormModel } from 'src/app/pages/donations/forms/donation-form-list/donation-form-list.component';
import { ContactInboxService } from 'src/app/services/contact-inbox.service';
import { MailingListParams } from 'src/app/models/MailingListModel';

@Component({
  selector: 'app-account-profile',
  templateUrl: './account-profile.component.html',
  styleUrls: ['./account-profile.component.scss']
})
export class AccountProfileComponent implements OnInit {

  @Input('idOrganization') idOrganization: number;
  @Input('memberId') memberId: number;
  @Input('handle_logout') handle_logout: boolean;

  @Output('logout') logout: EventEmitter<any> = new EventEmitter<any>();

  public userFormGroup: FormGroup = new FormGroup({});
  public editMode: boolean = false;
  tempPhoto: any;

  events: CalendarEvent[] = [];
  viewDate: Date = new Date();
  viewDateNext: Date = new Date();
  events_original: CalendarEvent[] = [];
  events_clear: any[] = [];
  commitments: UserCommitmentsModel[] = [];
  niveles: any[] = [];

  selectOpts = {
    singleSelection: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
    closeDropDownOnSelection: true,
    idField: 'idIglesia',
    textField: 'Nombre'
  };

  iglesias: any[] = [];
  iglesias_per_user: any[] = [];
  selectedIglesia: any;

  summary: {
    categories: 0,
    processes: 0,
    directories: 0,
    levels: 0,
    donations: 0,
    groups: 0,
    events: 0
  } = {
      categories: 0,
      processes: 0,
      directories: 0,
      levels: 0,
      donations: 0,
      groups: 0,
      events: 0
    };

  loading_summary: boolean = false;
  generated_qr_code: string;

  organization_setup: Partial<OrganizationSetupModel> = {};
  edited_fields: any;
  week_events: any[] = [];
  groups_fa: any[] = [];
  donation_forms: DonationFormModel[] = [];
  contact_forms: any[] = [];
  is_home: boolean = true;

  constructor(
    public api: ApiService,
    public route: ActivatedRoute,
    public modal: NgxSmartModalService,
    public userService: UserService,
    private router: Router,
    private formBuilder: FormBuilder,
    public uploadService: FileUploadService,
    private app: AppComponent,
    private fus: FileUploadService,
    private toastr: ToastrService,
    private group_service: GroupsService,
    private translate_service: TranslateService,
    private contact_inbox_service: ContactInboxService
  ) {
    this.currentUser = this.userService.getCurrentUser();

    this.edited_fields = {};
    const fake_init = new OrganizationSetupModel();
    Object.keys(fake_init).forEach(key => {
      this.edited_fields[key] = false;
    });
    console.log(this.edited_fields);
  }

  // member data
  public currentUser: any = {};
  public actualUserId: any;
  public member: any = {};
  public categories: any[] = [];
  public levels: any[] = [];
  public ministries: any[] = [];
  public groups: any[] = [];
  public donations: any[] = [];
  processes: any[] = [];

  // UI
  public loadingMember: boolean = true;
  public loadingMinistries: boolean = true;
  public loadingGroups: boolean = true;
  public loadingEvents: boolean = true;
  public uploading: Boolean = false;

  ngOnInit() {
    if (!this.memberId) {
      this.memberId = Number(this.route.snapshot.params.id);
    }
    if (!this.idOrganization) {
      if (this.route.snapshot.paramMap.get('idIglesia')) {
        this.idOrganization = Number(this.route.snapshot.paramMap.get('idIglesia'));
      } else {
        this.idOrganization = this.currentUser.idIglesia;
      }
    }
    this.viewDate = moment().startOf('month').toDate();
    this.viewDateNext = moment(this.viewDate).add(1, 'M').toDate();
    this.getDonations()
    if (this.memberId !== this.currentUser.idUsuario) {
      setTimeout(() => {
        this.router.navigate([`/user-profile/details/${this.currentUser.idUsuario}`]);
        this.memberId = this.currentUser.idUsuario;
        this.ngOnInit();
      }, 1200);
      return;
    } else {
      this.getProfileSummary();
      this.getMemberProfile();
    }
    this.getIglesias();
    this.getOrganizationSettins();
    this.getWeekEvents();
    this.getDonationForms();
    this.getContactInboxes();
    $('a[data-toggle="pill"]').on('show.bs.tab', (e) => {
      const id = e.currentTarget.id;
      this.is_home = id === 'v-pills-home-tab';
    });
    $('a[data-toggle="pill"]').on('hide.bs.tab', (e) => {
      const id = e.currentTarget.id;
      this.is_home = !(id == 'v-pills-home-tab');
    });
  }
  getContactInboxes() {
    const params: Partial<MailingListParams> = {
      idOrganization: this.currentUser.idIglesia,
      version: 'v2'
    }
    this.contact_inbox_service.getContactInboxes(params)
      // api.get(`mailingList/`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          this.contact_forms = data;
        },
        (error) => console.error(error),
      );
  }

  async getDonationForms() {
    const response: any = await this.api.get('donations_v2/forms',
      {
        idIglesia: this.currentUser.idIglesia
      }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.donation_forms = response;
    }

  }

  async getOrganizationSettins() {
    const response: any = await this.api.get(`iglesias/dashboard/general_setup`, { idOrganization: this.idOrganization }).toPromise();
    if (response) {
      this.organization_setup = response;
      Object.keys(this.organization_setup).map(x => this.organization_setup[`original_${x}`] = this.organization_setup[x])
    }
  }

  async getIglesias() {
    const response: any = await this.api.get(`users/getAllOrganizationsForUser`, { idUser: this.currentUser.idUsuario }).toPromise();
    if (response) {
      this.iglesias_per_user = response.users;
      this.iglesias = response.users.map(x => { return { Nombre: x.iglesia, idIglesia: x.idIglesia } });
      const actual_iglesia = this.iglesias.find(x => x.idIglesia === this.idOrganization);
      if (actual_iglesia) {
        this.selectedIglesia = [
          {
            idIglesia: actual_iglesia.idIglesia,
            Nombre: actual_iglesia.Nombre
          }
        ];
      }
    }
  }

  async getWeekEvents() {
    const from = moment().startOf('week').format('YYYY-MM-DD');
    const to = moment().endOf('week').format('YYYY-MM-DD');
    const response: any = await this.api
      .post(`groups/settings/v2/filter`, {
        idOrganization: this.currentUser.idIglesia,
        publish_status: 'publish',
        from,
        to,
        idUser: this.currentUser.idUsuario
      }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.week_events = response;
    }
  }

  selectIglesia(selectedIglesia: any) {
    const iglesia = this.iglesias_per_user.find(x => x.idIglesia === selectedIglesia.idIglesia);
    this.currentUser.idUserType = iglesia.idUserType;
    setTimeout(() => {
      this.app.footer.currentUser = this.currentUser;
      this.app.menu.currentUser = this.currentUser;
    });
    this.setIglesia(iglesia);
    this.getMemberProfile();
  }

  setIglesia(iglesia: any) {
    this.currentUser = this.userService.getCurrentUser();
    this.currentUser.idIglesia = iglesia.idIglesia;
    this.currentUser.iglesia = iglesia.Nombre;
    this.currentUser.topic = iglesia.topic;
    this.currentUser.idTipoServicio = iglesia.idTipoServicio;
    this.currentUser.service_type_picture = iglesia.service_type_picture;
    if (iglesia.idUserType) {
      this.currentUser.idUserType = iglesia.idUserType;
    }
    if (iglesia.Logo) {
      this.currentUser.logoPic = this.fus.cleanPhotoUrl(iglesia.Logo);
    } else {
      this.currentUser.logoPic = undefined;
    }
    const userStr: string = JSON.stringify(this.currentUser);
    localStorage.setItem('currentUser', userStr);
  }

  getDonations() {
    this.api
      .get(`iglesias/getUserDonations`, { idUser: this.currentUser.idUsuario, idIglesia: this.idOrganization })
      .subscribe((data: any) => {
        if (data) {
          this.donations = data
          this.donations.forEach(iglesia => {
            iglesia.donations.forEach(element => {
              element.frequency = FREQUENCIES[element.frequency_key];
              element.covered_fee == 1 ? element.is_covered = 'Yes' : element.is_covered = 'No'
              element.is_manual == 1 ? element.manual = 'Manual' : element.manual = 'Standard'
              element.date = String(element.date).split('T')[0] + ' ' + String(element.date).split('T')[1].split('.')[0]
            })
            iglesia.donations.sort(function (a, b) {
              return (a.date > b.date) ? -1 : ((a.date < b.date) ? 1 : 0);
            });
          });
        }
      });
  }
  get photoUrl() {
    if (this.member.foto && this.member.foto !== 'null') {
      return `${environment.serverURL}${this.member.foto}`
    }

    return '/assets/img/img_avatar.png';
  }

  getMemberProfile() {
    this.loadingMember = true;
    this.api.get(`users/getUser/${this.memberId}`, {
      idIglesia: this.idOrganization
    })
      // this.api.get("getUsergetUserByIdV2/" + this.memberId, {})
      .subscribe(
        (data: any) => {
          this.member = data.user;
          const obj = {
            idUser: this.member.idUsuario,
            idOrganization: this.member.idIglesia,
            email: this.member.email
          };
          this.generated_qr_code = this.userService.encryptUserQR(obj);
          // Check which id to use
          if (data.isNewUser) {
            this.actualUserId = data.idUser;
          } else {
            this.actualUserId = data.idUsuario;
          }
          let country = COUNTRIES_DB.find(x => x.callingCode === this.member.country_code && x.alpha2Code === this.member.country);
          if (country) {
            this.member.flag = `assets/svg-country-flags/svg/${country.alpha2Code.toLowerCase()}.svg`;
          } else {
            country = COUNTRIES_DB.find(x => x.callingCode === this.member.country_code);
            if (country) {
              this.member.flag = `assets/svg-country-flags/svg/${country.alpha2Code.toLowerCase()}.svg`;
            } else {
              this.member.flag = undefined;
            }
          }
          // Load ministries when user is ready
          // this.getMinistries()
          this.getGroups();
          this.getSuggestedGroups();
          this.getEvents();
          this.getCategoryAndLevels();
          this.getCommitmentsByUser();
          this.getDirectoriesAndEntries();
          this.getUserDisciple();
          this.initForm();
        },
        error => {
          console.error(error);
          this.loadingMember = false;
        },
        () => this.loadingMember = false
      );
  }

  async getSuggestedGroups() {
    this.loadingGroups = true;
    const response: any = await this.api.get('groups/suggested', {
      idUser: this.memberId,
      idIglesia: this.idOrganization
    }).toPromise()
      .catch(err => {
        console.error(err);
        this.loadingGroups = false;
        return;
      });
    if (response) {
      this.groups_fa = response;
    }
  }

  async getProfileSummary() {
    this.loading_summary = true;
    const response: any = await this.api.get(`users/getUser/${this.memberId}/summary`, {
      idIglesia: this.currentUser.idIglesia
    }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.summary = response;
      if (this.summary.events > 0) {
        this.getEvents();
      }
      if (this.summary.donations > 0) {
        this.getDonations();
      }
      if (this.summary.groups > 0) {
        this.getGroups();
      }
      if (this.summary.directories > 0) {
        this.getDirectoriesAndEntries();
      }

      // this.getEvents()
      this.getCategoryAndLevels();

    }
    this.loading_summary = false;

  }

  community_info = {
    directories: [],
    entries: []
  }

  disciples: DiscipleDisciplersModel[] = [];
  disciple_user: DisciplerModel;

  async getDirectoriesAndEntries() {
    const response: any = await this.api.post(`communityBox/get/users/assigned`, {
      idUser: this.currentUser.idUsuario,
      idOrganization: this.idOrganization
    }).toPromise()
      .catch(error => {
        console.error(error);
        if (error.error.status === 403) {
          this.api.showToast(`You don't have permission to see this community box.`, ToastType.error);
          this.router.navigate([`/user-profile/details/${this.currentUser.idUsuario}`]);
        } else {
          this.api.showToast(`Couldn't verify your user`, ToastType.error);
        }
      });
    if (response) {
      this.community_info = response;
    }
  }

  async getUserDisciple() {
    const response: any = await this.api.get(`disciples/disciplers/user/${this.currentUser.idUsuario}`, { idIglesia: this.idOrganization }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      })
    if (response) {
      this.disciple_user = response.discipler;
      if (this.disciple_user.id) {
        this.getDisciplers();
      }
    }
  }

  async getDisciplers() {
    let params: {
      idIglesia: number;
      idUsuario: number;
      idDiscipler?: number
    } = {
      idIglesia: this.idOrganization,
      idUsuario: this.currentUser.idUsuario,
      idDiscipler: this.disciple_user.id
    };
    const response: any = await this.api.get('disciples',
      params).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });

    if (response) {
      this.disciples = response.disciples;
    }
  }

  getCommitmentsByUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.userService.getCommitmentsByUser(this.memberId, this.idOrganization)
        .subscribe((response: any) => {
          this.commitments = response.commitments;
          this.commitments.forEach(commitment => {
            commitment.commitment_date = moment(commitment.commitment_date).utc().format('YYYY-MM-DD');
          });
          return resolve(this.commitments);
        }, error => {
          this.commitments = [];
          return resolve(this.commitments);
        });
    });
  }

  getEvents() {
    this.loadingEvents = true;
    this.userService.getNextEvents(this.memberId, this.idOrganization)
      .subscribe((response: any) => {
        this.printEvents(response.events);
        this.loadingEvents = false;
      }, error => {
        this.loadingEvents = false;
      });
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
                idGroup: event.idGroup,
                idGroupEvent: event.idGroupEvent,
                name: event.name,
                description: event.description,
                attendances_count: event.attendances_count,
                attendances_total: event.attendances_total,
                picture: event.picture
              }
            };
            event_end_to_others = undefined;
            if (
              // Check that month and year is same.
              (event_actual_date.getMonth() === this.viewDate.getMonth() &&
                event_actual_date.getFullYear() === this.viewDate.getFullYear()) ||
              (event_actual_date.getMonth() === this.viewDateNext.getMonth() &&
                event_actual_date.getFullYear() === this.viewDateNext.getFullYear()) ||
              (moment(event_actual_date).isSameOrAfter(this.viewDate, 'minute') &&
                moment(event_actual_date).isSameOrBefore(this.viewDateNext, 'minute'))
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

  initForm() {
    if (!this.member.fechaNacimiento) {
      this.member.fechaNacimiento = '';
    }
    if (!this.member.fechaMembresia) {
      this.member.fechaMembresia = '';
    }
    // init form
    // this.userFormGroup = this.formBuilder.group({
    //   idIglesia: this.currentUser.idIglesia,
    //   idUsuario: this.member.idUser,
    //   nombre: [this.member.name, Validators.required],
    //   apellido: [this.member.lastName, Validators.required],
    //   sexo: [this.member.gender, Validators.required],
    //   telefono: [this.member.telefono, Validators.required],
    //   email: [this.member.email, Validators.required],
    //   ciudad: [this.member.city, Validators.required],
    //   calle: [this.member.street, Validators.required],
    //   provincia: [this.member.state, Validators.required],
    //   zip: this.member.zipCode,
    //   estadoCivil: this.member.civilStatus,
    //   fechaNacimiento: this.member.birthday.split('T')[0],
    //   fechaMembresia: this.member.membershipDate? this.member.membershipDate.split('T')[0] : '',
    //   fotoUrl: this.member.picture,
    //   idUserType: this.currentUser.idUserType,
    //   photo: [''],
    //   categorias: [''],
    //   niveles: ['']
    // })
    this.member.full_address = GoogleAddressComponent.formatFullAddress(this.member, ['calle', 'ciudad', 'provincia', 'zip', 'country'])
    this.userFormGroup = this.formBuilder.group({
      idIglesia: this.member.idIglesia,
      idUsuario: this.member.idUsuario,
      nombre: [this.member.nombre, Validators.required],
      apellido: [this.member.apellido, Validators.required],
      sexo: [this.member.sexo, Validators.required],
      telefono: [this.member.telefono, Validators.required],
      country_code: [this.member.country_code, [Validators.required]],
      email: [this.member.email, Validators.required],
      ciudad: [this.member.ciudad, Validators.required],
      calle: [this.member.calle, Validators.required],
      provincia: [this.member.provincia, Validators.required],
      zip: this.member.zip,
      estadoCivil: this.member.estadoCivil,
      fechaNacimiento: this.member.fechaNacimiento.split('T')[0],
      fechaMembresia: this.member.fechaMembresia.split('T')[0],
      fotoUrl: this.member.fotoUrl,
      idUserType: this.member.idUserType,
      photo: [''],
      categorias: [''],
      niveles: [''],
      full_address: this.member.full_address,
      lat: this.member.lat,
      lng: this.member.lng
    });
  }

  getCategoryAndLevels() {
    const promises: Promise<any>[] = [];
    promises.push(this.api.get('getCategoriasAndNivelesByIdUsuario',
      {
        idUsuario: this.memberId, idIglesia: this.idOrganization
      }).toPromise());

    promises.push(this.api.get('processes/getProcessForUser',
      {
        idUsuario: this.memberId,
        idIglesia: this.idOrganization,
        extended: true
      }
    ).toPromise());
    Promise.all(promises)
      .then((responses: any[]) => {
        const data = responses[0];
        this.categories = data.categoriasMiembros;
        // Remove duplicated
        this.levels = data.niveles.filter((v, i, a) => a.findIndex(t => (t.idNivel === v.idNivel)) === i);
        // Remove
        this.processes = responses[1].processes;
        this.member.processes = [];
        this.member.fixed_proccesses = data.process;
        data.process.forEach(process => {
          this.member.processes.push(process.idProcess);
          this.niveles = (this.niveles as any[]).concat(process.levels);
          if (this.niveles) {
            this.niveles.map(nivel => {
              nivel.requisitosCumplidos = nivel.requisitos.filter(item => {
                return item.cumplido;
              });
            });
            const unique = [...this.niveles];

            this.niveles = unique
              .map(e => e.idNivel)
              // store the keys of the unique objects
              .map((e, i, final) => final.indexOf(e) === i && i)
              // eliminate the dead keys & store unique objects
              .filter(e => unique[e]).map(e => unique[e]);
          } else {
            this.niveles = [];
          }
        });
      },
        err => { console.error(err); }
      );
  }

  getGroups() {
    this.loadingGroups = true;
    this.api.get('groups/getGroupsByIdUsuario', {
      idUser: this.memberId,
      idIglesia: this.idOrganization
    })
      .subscribe(
        (data: any) => {
          this.groups = data.groups;
        },
        err => {
          console.error(err);
          this.loadingGroups = false;
          this.loadingMinistries = false;
          // this.loadingEvents = false;
        },
        () => {
          this.loadingGroups = false;
          this.loadingMinistries = false;
          // this.loadingEvents = false;
        }
      );
  }

  goToGroupDetail(group: GroupMemberModel) {
    if (group.status) {
      this.router.navigateByUrl(`/group/detail/${group.idGroup}`);
    }
  }

  goToGroupEventDetail(group_event: GroupEventModel) {
    this.router.navigateByUrl(`group/events/detail/${group_event.idGroupEvent}`);
  }

  goToCommunityBox(community_box: any) {
    this.router.navigateByUrl(`community-box/details/${community_box.idCommunityBox}`);
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    this.tempPhoto = undefined;
    // Patch form
    this.userFormGroup.patchValue({
      niveles: this.levels,
      categorias: this.categories,
      // telefono: this.telefono
    });
  }

  submitUpdate(form: FormGroup) {
    this.uploading = true;

    if (form.value.photo) {
      this.uploadService.uploadFile(form.value.photo, true)
        .subscribe(
          (res: any) => {
            form.patchValue({ fotoUrl: `${res.file_info.src_path}` });
            form.patchValue({ foto: `${res.file_info.src_path}` });
            // Clean payload
            const payload = this.removeEmptyParams(form.value);
            this.updateUser(payload);
          },
          err => {
            alert(`Can't upload photo!`);
          }
        );
    } else {
      if (form.value.fotoUrl) {
        form.patchValue({ fotoUrl: this.uploadService.cleanPhotoUrl(form.value.fotoUrl) });
        form.patchValue({ foto: this.uploadService.cleanPhotoUrl(form.value.fotoUrl) });
        // clean payload
        const payload = this.removeEmptyParams(form.value);
        this.updateUser(payload);
      } else {
        const payload = this.removeEmptyParams(form.value);
        this.updateUser(payload);
      }
    }
  }

  updateUser(data: any) {
    data.idIglesia = this.idOrganization;
    // Insert data on categories
    if (data.categorias && data.categorias.length) {
      data.categorias.map(cat => {
        cat.idUsuario = data.idUsuario;
      });
    }

    this.api.post(`updateUsuario`, data)
      .subscribe(
        (res: any) => {
          if (res.phone_warning) {
            this.api.showToast(`The phone provided is already in use and will not be updated`, ToastType.info);
          }
          // this.telefono = data.telefono
          this.getMemberProfile();
          this.toggleEditMode();
          // Update values
          this.getCategoryAndLevels();
          // this.getLevels()
          // this.getCategories()
          // this.telefono = data.telefono
          this.uploading = false;
        },
        err => {
          alert(`Can't Update profile`);
          this.uploading = false;
        }
      );
  }


  removeEmptyParams(data: any) {
    const payload: any = Object.assign({}, data);

    // Remove empty params
    Object.keys(payload).map(key => {
      if (!payload[key]) {
        delete payload[key];
      }
    });

    return payload;
  }

  handleFileInput(files: FileList) {
    const file = files.item(0);
    if (file) {
      this.userFormGroup.patchValue({ photo: file });
      // Preview file
      const reader = new FileReader();
      reader.readAsDataURL(file);
      // tslint:disable-next-line: variable-name
      reader.onload = (_event) => {
        this.tempPhoto = reader.result;
      };
    }
  }

  logOut() {
    const confirmation = confirm(`Are you sure you want to log out?`);
    if (confirmation) {
      this.userService.logout();
      if (this.handle_logout) {
        this.logout.emit({});
      } else {
        this.router.navigate(['/login']);
        console.log('Logout Bye!');
      }
    }
  }

  checkDate(start, end) {
    return moment(end).isAfter(moment(start), 'day');
  }

  openModalDetail(
    see_step_detail_modal: NgxSmartModalComponent,
    see_step_detail_form: SeeStepDetailComponent,
    step
  ) {
    see_step_detail_form.step = step;
    see_step_detail_form.ngOnInit();
    see_step_detail_modal.open();
  }

  onModalEditDidDismiss(user_log_modal: NgxSmartModalComponent, response) {
    user_log_modal.close();
    if (response) {
      this.getMemberProfile();
    }
  }

  openRequirements(
    form_check_modal: NgxSmartModalComponent,
    check_requirements_form: CheckRequirementsComponent,
    nivel: any,
    index: number
  ) {
    nivel.index = index;
    check_requirements_form.nivel = nivel;
    check_requirements_form.requisitos = nivel.requisitos ? nivel.requisitos : [];
    check_requirements_form.initRequisitos();
    form_check_modal.open();
  }

  onModalCheckDidDismiss(modal: NgxSmartModalComponent, response) {
    modal.close();
    if (response) {
      this.loadingEvents = true;
      this.loadingMember = true;
      this.loadingGroups = true;
      this.loadingMinistries = true;
      const nivel = response.nivel;
      const requisitos = response.requisitos;
      nivel.requisitos = requisitos;
      nivel.requisitosCumplidos = requisitos.filter(item => {
        return item.cumplido;
      });
      const found_level = this.niveles.find(n => {
        return n.idNivel === nivel.idNivel;
      });
      if (found_level) {
        const index = this.niveles.indexOf(found_level);
        this.niveles[index] = nivel;
      }
      const usuario = this.member;
      usuario.categorias = this.categories;
      usuario.niveles = this.niveles;

      if (usuario.foto) {
        usuario.foto = this.uploadService.cleanPhotoUrl(usuario.foto);
      }
      usuario.created_by = this.currentUser.idUsuario;
      const process = [...usuario.fixed_proccesses];
      usuario.processes = [];
      process.forEach(process_in_array => {
        usuario.processes.push(process_in_array.idProcess);
      });
      this.api.post('updateUsuario', usuario)
        .subscribe((response_update: any) => {
          if (response_update.phone_warning) {
            this.api.showToast(`The phone provided is already in use and will not be updated`, ToastType.info);
          }
          this.api.showToast(`Requirements updated successfully.`, ToastType.success);
          this.getMemberProfile();
        }, err => {
          this.api.showToast(`Error updating requirements.`, ToastType.error);
        });
    }
  }

  verRequisitos(nivel, accordion: MatExpansionPanel) {
    if (nivel.requisitos.length === 0) {
      accordion.expanded = false;
      return;
    }

    if (!accordion.expanded) {
      // Closed
      return;
    }
  }

  saving: boolean = false;
  @ViewChild('photo_input') photo_input: ElementRef;
  public entryForm = {
    id: null,
    idCommunityBox: '',
    business_name: '',
    contact_first_name: '',
    contact_last_name: '',
    business_summary: '',
    industry: '',
    phone: '',
    contact_email: '',
    locations: '',
    website: '',
    instagram: '',
    twitter: '',
    facebook: '',
    photo: '',
    featured: false,
    radius: null,
    lat: null,
    lng: null,
    idEntryGroup: null,
    sort_by: 1,
    assign_users: [],
    assign_users_ids: [],
    users: [],
    assigned_users: [],
    created_by: this.currentUser.idUsuario,
    skip_users: true
  };

  addPhoto(file: File) {
    if (file) {
      this.uploading = true;
      this.fus.uploadFile(file, true, 'community').subscribe(
        (data: any) => {
          this.entryForm.photo = `${this.fus.api.baseUrl}${data.file_info.src_path}`;
          this.uploading = false;
        },
        (err) => {
          console.error(err);
          this.uploading = false;
        }
      );
    }
  }

  
  public getUserAddress(address_control: FormGroup, item: AutocompleteResponseModel) {
    if (item) {
      if (item.address) {
        const element = {
          calle: item.address.street,
          ciudad: item.address.city,
          provincia: item.address.state,
          zip: item.address.zip_code,
          full_address: item.address.full_address,
          country: item.address.country,
          lat: item.address.lat,
          lng: item.address.lng,
        }
        address_control.patchValue(element);
        // address_control.get('full_address').setValue(item.address.full_address);
      }
    }
  }
  public getAddress(address: AutocompleteResponseModel) {
    if (address) {
      this.entryForm.lat = address.place.geometry.location.lat();
      this.entryForm.lng = address.place.geometry.location.lng();
      this.entryForm.locations = address.place.formatted_address;
    }
  }

  submitEntry(form: NgForm) {
    if (form.invalid) {
      this.toastr.error(`Please check the form and try again`, 'Error');
    }

    this.saving = true;
    let request: Observable<any>;
    this.entryForm.idCommunityBox = this.entryForm.idCommunityBox;

    this.entryForm.skip_users = true;
    this.entryForm.users = [];
    this.entryForm.created_by = this.currentUser.idUsuario;

    if (this.entryForm.id) {
      request = this.api.patch(
        `communityBox/${this.entryForm.idCommunityBox}/entries/${this.entryForm.id}`,
        this.entryForm
      );
    } else {
      request = this.api.post(
        `communityBox/${this.entryForm.idCommunityBox}/entries`,
        this.entryForm
      );
    }

    request.subscribe(
      (data: any) => {
        this.getDirectoriesAndEntries();
        this.toastr.success('Entry saved!', 'Success');
        this.modal.getModal('entryFormModal').close();
        this.saving = false;
      },
      (err) => {
        console.error(err);
        this.toastr.error(`Can't save entry!`, 'Error');
        this.saving = false;
      }
    );
  }

  openEditModalEntry(entry) {
    this.photo_input.nativeElement.value = null;
    this.entryForm = Object.assign({}, entry);
    // this.entryForm.assigned_users = this.available_users.filter(x => entry.assign_users_ids.includes(x.idUsuario));
    this.modal.getModal('entryFormModal').open();
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
      this.api.showToast('QR copied to clipboard', ToastType.success);
    } catch (err) {
      console.error(err.name, err.message);
    }

  }

  getCover(event: GroupEventModel, force_prod: boolean) {
    if (event) {
      if (event.picture) {
        if (force_prod) {
          return `${environment_prod.serverURL}${event.picture}`;
        } else {
          return `${environment.serverURL}${event.picture}`;
        }
      }
      return '';
    } else {
      return '';
    }
  }

  handleEventCheck(event_event, event: GroupEventModel) {
    let method: Observable<any>;
    if (event.is_member) {
      method = this.group_service.addMemberToEvent(this.currentUser.idUsuario, event.idGroup, event.idGroupEvent, { covid_quest: false, guests: 0 })
    } else {
      const payload: Partial<GroupEventAttendanceModel> = {
        idUser: this.currentUser.idUsuario,
        idGroupEvent: event.idGroupEvent
      }
      method = this.group_service.deleteAttendance(payload as GroupEventAttendanceModel);
    }

    method.subscribe((response: any) => {
      // this.group_event.confirmation_number = response.msg.confirmation_number;
      // this.group_event.guests = response.msg.guests;
      if (response.msg.Code === 409) {
        // const translate = this.translate_service.instant('events.already_member_in_event');
        // this.group_service.api.showToast(translate, ToastType.info);
      } else {
        // const translate = this.translate_service.instant('events.you_were_added');
        // this.group_service.api.showToast(translate, ToastType.success);
      }
    }, error => {
      console.error(error);
      this.group_service.api.showToast('Error trying to add you to this event', ToastType.error);
    });
  }

  fixProcessUrl(process) {
    if (process.file_info) {
      if (process.file_info.src_path) {
        return `${environment.serverURL}${process.file_info.src_path}`;
      }
      return `/assets/img/default-cover-image.jpg`
    } else {
      return `/assets/img/default-cover-image.jpg`
    }
  }
  fixGroupPicture(group: GroupModel) {
    if (group.picture) {
      if (group.picture.startsWith('http')) {
        return group.picture;
      } else {
        return `${environment.serverURL}${group.picture}`;
      }
    } else {
      return `/assets/img/default-cover-image.jpg`
    }
  }

  sendRequestToJoin(group: GroupModel) {
    this.group_service.sendRequestToJoin(this.currentUser.idUsuario, group.idGroup)
      .subscribe((response: any) => {
        const message = this.translate_service.instant(response.response.message);
        this.group_service.api.showToast(message, ToastType.info);
      }, error => {
        console.error(error);
        this.group_service.api.showToast('Error trying to add you to this group', ToastType.error);
      });
  }

  removeFromGroup(member: GroupMemberModel) {
    if (confirm(`Are you sure yo want to left this group?`)) {
      this.group_service.deleteMember(member)
        .subscribe(response => {
          this.group_service.api.showToast(`You left this group.`, ToastType.info);
          this.getSuggestedGroups();
        }, error => {
          console.error(error);
          this.group_service.api.showToast(`Error deleting member.`, ToastType.error);
        });
    }
  }

  toggleEditField(field: string) {
    this.edited_fields[field] = true;
  }

  cancelEditField(field: string) {
    this.organization_setup[field] = this.organization_setup[`original_${field}`];
    this.edited_fields[field] = false;
  }

  async saveOrganizationSetupField(field: string) {
    const payload = {
      idOrganization: this.idOrganization,
      value: this.organization_setup[field],
      field
    };
    const response: any = await this.api.post(`iglesias/dashboard/general_setup`, payload).toPromise();
    if (response) {
      this.organization_setup[`original_${field}`] = this.organization_setup[field];
      console.log(this.organization_setup);

      this.getOrganizationSettins();
      this.cancelEditField(field);
      // this.organization_setup = response;
      // Object.keys(this.organization_setup).map(x => this.organization_setup[`original_${x}`] = this.organization_setup[x])
    }
  }

}
