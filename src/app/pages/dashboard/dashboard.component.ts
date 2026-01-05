import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { FormBuilder, Validators } from '@angular/forms';
import { ToDoModel, ToDoTypeModel } from './../../models/ToDoModel';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from '../../../environments/environment.prod';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { OrganizationModel, DatosProyectoIglesiaModel, DatosPagosIglesiaModel } from 'src/app/models/OrganizationModel';
import { ConfigurationTabModel } from 'src/app/models/ConfigurationTabModel';
import { ToastType } from '../contact/toastTypes';
import { User } from 'src/app/interfaces/user';
import { PushNotificationComponent } from './push-notification/push-notification.component';
import { SelectEventsComponent } from '../groups/select-events/select-events.component';
import { Router } from '@angular/router';
import * as moment from 'moment';
import * as moment_tz from 'moment-timezone';
import { NgxQRCodeComponent } from 'ngx-qrcode2';
import { TodoFormComponent } from './todo-form/todo-form.component';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { OrganizationDisclaimerComponent } from 'src/app/component/organization-disclaimer/organization-disclaimer.component';
import { OrganizationDisclaimerSettingsComponent } from 'src/app/component/organization-disclaimer/organization-disclaimer-settings/organization-disclaimer-settings.component';
import { ResizeEvent } from 'angular-resizable-element';
import { HeaderMenuSettingModel } from '../organization-profile/organization-profile.component';
import { FinanceDashboardComponent } from '../donations/finance-dashboard/finance-dashboard.component';
import { DudaService } from 'src/app/services/duda.service';
import { SyncService } from 'src/app/services/sync.service';
/// <reference path="../../../typings.d.ts" />

interface Scripts {
  name: string;
  src: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  show_todo_loading: boolean = true;
  loaded_scripts: boolean = false;
  site_has_duda_settings: boolean = false;

  duda_site_settings_form: FormGroup = this.form_builder.group({
    idOrganization: new FormControl(undefined, [Validators.required]),
    site_id: new FormControl(undefined, [Validators.required]),
    created_by: new FormControl(undefined, [Validators.required])
  });

  wait_click_duda: boolean = false;
  show_setting_component: boolean = false;

  constructor(
    private userService: UserService,
    private api: ApiService,
    private modal: NgxSmartModalService,
    private organizationService: OrganizationService,
    private fus: FileUploadService,
    private router: Router,
    private app: AppComponent,
    private translate_service: TranslateService,
    private sync_service: SyncService,
    private form_builder: FormBuilder
  ) {
    try {
      this.assignedIglesias = JSON.parse(localStorage.getItem('companies'));
    } catch (error) {
    }
  }

  @ViewChild('input_file') private input_file;
  @ViewChild('inputLogo') private inputLogo;
  @ViewChild('input_to_do') private input_to_do;
  @ViewChild('organization_disclaimer') organization_disclaimer: OrganizationDisclaimerComponent;
  @ViewChild('organization_disclaimer_settings') organization_disclaimer_settings: OrganizationDisclaimerSettingsComponent;
  @ViewChild('finance_dashboard') finance_dashboard: FinanceDashboardComponent;
  photo: File;
  tabToShow: ConfigurationTabModel;
  isChat: boolean = false
  todos_form_group = new FormGroup({
    todos: new FormArray([])
  });

  get todos_array() {
    return this.todos_form_group.get('todos') as FormArray;
  }

  // DATA
  public assignedIglesias: any[] = [];
  public serverURL: string = environment.serverURL;
  public user: User;
  public iglesia: any = {};
  public iglesias: any[] = [];
  public selectedIglesia: any[] = [];
  public hideSidebar: boolean = false;
  public uploadingCover: boolean = false;
  public uploadingLogo: boolean = false;

  public dashboard: {
    users: number,
    processes: number,
    groups: number,
    events: number,
    teams: number,
    donations: number
  } = {
      users: 0,
      processes: 0,
      groups: 0,
      events: 0,
      teams: 0,
      donations: 0
    };

  selectOpts = {
    singleSelection: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
    closeDropDownOnSelection: false,
    idField: 'idIglesia',
    textField: 'Nombre'
  };

  header_menu_settings: HeaderMenuSettingModel = new HeaderMenuSettingModel();

  private scripts_resource: Scripts[] = [
    {
      name: 'VueJSScript',
      src: `https://cdn.jsdelivr.net/npm/vue@2.5.16/dist/vue.js`
    },
    {
      name: 'AxiosScript',
      src: `https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js`
    },
    {
      name: 'MomentScript',
      src: `https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment-with-locales.min.js`
    },
    {
      name: 'PlaylistScript',
      src: `https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/playlists/scripts`
    }
  ];
  private scripts: any = {};

  show_todo_form: boolean = false;
  show_loading: boolean = true;
  @ViewChild('todo_form') todo_form: TodoFormComponent;
  todo_types: ToDoTypeModel[] = [];
  todos: ToDoModel[] = [];

  ngOnInit() {
    this.user = this.userService.getCurrentUser();
    if (this.user) {
      this.duda_site_settings_form.get('created_by').setValue(this.user.idUsuario);
    }
    this.getIglesia(true);
    this.getIglesias();
    this.loadTabs();
    this.getTodos();
    this.getTodoTypes();
    this.generateNewEvents();
  }

  generateNewEvents() {
    if (this.user) {
      if (this.user.isSuperUser) {
        this.api.post(`groups/events/generate/events`, {
          timezone: moment_tz.tz.guess()
        })
          .subscribe(data => {
            console.log('Data migrated');
          })
      }
    }
  }

  getTodos() {
    this.show_todo_loading = true;
    this.organizationService.getTodos()
      .subscribe((response: any) => {
        this.todos = response.todos;
        this.createGroupForm();
        this.show_todo_loading = false;
      }, error => {
        this.show_todo_loading = false;
        this.organizationService.api.showToast(`Error getting the to do's`, ToastType.error);
      });
  }

  createGroupForm() {
    this.cleanTodosArray();
    this.todos.forEach(todo => {
      const control = new FormGroup({
        idToDo: new FormControl(todo.idToDo),
        value: new FormControl(todo.value, [Validators.required]),
        accomplished_by: new FormControl(this.user.idUsuario, [Validators.required])
      });
      this.todos_array.push(control);
    })
  }

  cleanTodosArray() {
    while (this.todos_array.length !== 0) {
      this.todos_array.removeAt(0);
    }
  }

  updateTodos() {
    this.show_todo_form = false;
    this.getTodos();
  }

  getTodoTypes() {
    this.organizationService.getTodoTypes()
      .subscribe((response: any) => {
        this.todo_types = response.types;
      });
  }

  load(...scripts: string[]) {
    const promises: any[] = [];
    scripts.forEach((script) => promises.push(this.loadScript(script)));
    return Promise.all(promises);
  }

  loadScript(name: string) {
    return new Promise((resolve, reject) => {
      // resolve if already loaded
      if (this.scripts[name].loaded) {
        resolve({ script: name, loaded: true, status: 'Already Loaded' });
      } else {
        // load script
        const script = document.createElement('script') as any;
        script.type = 'text/javascript';
        script.src = this.scripts[name].src;
        if (script.readyState) {  // IE
          script.onreadystatechange = () => {
            if (script.readyState === 'loaded' || script.readyState === 'complete') {
              script.onreadystatechange = null;
              this.scripts[name].loaded = true;
              resolve({ script: name, loaded: true, status: 'Loaded' });
            }
          };
        } else {  // Others
          script.onload = () => {
            this.scripts[name].loaded = true;
            resolve({ script: name, loaded: true, status: 'Loaded' });
          };
        }
        script.onerror = (error: any) => resolve({ script: name, loaded: false, status: 'Loaded' });
        document.getElementsByTagName('head')[0].appendChild(script);
      }
    });
  }

  getAssignedIglesias() {
    this.api.get(`users/getOrganizationsForUser`, { idUser: this.user.idUsuario })
      .subscribe((data: any) => {
        const assignedIglesias = data.users;
        let companies: any[];
        if (assignedIglesias) {
          companies = assignedIglesias.map(user => user.idIglesia);
        } else {
          companies = [];
        }
        localStorage.setItem('companies', JSON.stringify(companies));
        this.assignedIglesias = JSON.parse(localStorage.getItem('companies'));
      });
  }

  getIglesias() {
    let params: Partial<{ is_minimal: boolean; show_test: boolean }> = {
      is_minimal: true
    };
    let endpoint = `iglesias/getIglesias/`;
    if (this.user.idUsuario !== 78) {
      if (this.user.isSuperUser) {
        params.show_test = false;
      }
    } else {
      if (this.user.isSuperUser) {
        params.show_test = true;
      }
    }
    this.api
      .get(`${endpoint}`, params)
      .subscribe((data: any) => {
        if (data.iglesias) {
          if (this.user.isSuperUser) {
            this.iglesias = data.iglesias;
          } else {
            this.iglesias = data.iglesias.filter(ig =>
              this.assignedIglesias.includes(ig.idIglesia)
            );
          }
        }
        // if (this.user.idIglesia) {
        //   this.selectIglesia(this.user);
        // }
      });
  }

  getDashboardInfo() {
    this.api
      .get(`iglesias/dashboard/`, { idIglesia: this.user.idIglesia })
      .subscribe((data: any) => {
        this.dashboard = data.dashboard;
        // this.dashboard.users = data.dashboard.user_count;
        // this.dashboard.groups = data.dashboard.group_count;
        // this.dashboard.processes = data.dashboard.process_count;
        // this.dashboard.events = data.dashboard.events_count;
        // this.dashboard.donations = data.dashboard.donations_count;
        // this.dashboard.teams = data.dashboard.team_count;
        // if (data.usuarios) {
        //   this.dashboard.contacts = data.usuarios;
        // }
      });
  }

  getDonations() {
    // this.api
    //   .get(`donations/getIglesiaDonations`, { idIglesia: this.user.idIglesia })
    //   .subscribe((data: any) => {
    //     if (data.donations) {
    //       this.dashboard.donations = data.donations;
    //       console.log(this.dashboard.donations)
    //     }
    //   });
  }

  getTotalGroups() {
    // this.api
    //   .get(`groups/getGroups/`, { idIglesia: this.user.idIglesia })
    //   .subscribe((data: any) => {
    //     if (data.groups) {
    //       this.dashboard.groups = data.groups;
    //     }
    //   });
  }

  getTotalProcesses() {
    // this.api
    //   .get(`process/getProcess/`, { idIglesia: this.user.idIglesia })
    //   .subscribe((data: any) => {
    //     if (data.processes) {
    //       this.dashboard.processes = data.processes;
    //     }
    //   });
  }

  getIglesia(show_disclaimer?: boolean) {
    this.show_loading = true;
    const params = {
      idIglesia: this.user.idIglesia,
      minimal: true
    }
    // this.api.get('iglesias/full', params)
    //   .subscribe(data => {
    //     console.log(data);
    //   })
    this.api
      // .get(`getIglesiaFullData/`, { idIglesia: this.user.idIglesia })
      .get('iglesias/full', params)
      .subscribe(
        (data: any) => {
          this.iglesia = data.iglesia;
          console.log(data);

          console.log(this.iglesia)
          // Set selected Iglesia dropdown
          localStorage.setItem("lang", this.iglesia.language_code);

          this.selectedIglesia = [
            {
              idIglesia: data.iglesia.idIglesia,
              Nombre: data.iglesia.Nombre
            }
          ];
          this.translate_service.use(this.iglesia.language_code);
          if (show_disclaimer && this.is_possible_client) {
            // open Modal
            // // this.modal.get('clientDisclaimerModal').open();
            // // this.organization_disclaimer.idOrganization = this.iglesia.idIglesia;
            // // this.organization_disclaimer.ngOnInit();
          }
          this.show_loading = false;
        },
        (err: any) => {
          console.error(err);
          this.show_loading = false;
        },
        () => {
          this.getHeaderSettings();
          // Load contacts
          this.getDashboardInfo();
          // Get total groups
          this.getTotalGroups();
          // Get total process
          this.getTotalProcesses();
          // Get total events
          this.getTotalEvents();
          // Get total teams
          this.getTotalTeams();
          //Get donations
          this.getDonations();

          this.checkDudaSettings();
          // Stop loading
          this.uploadingCover = false;
          this.uploadingLogo = false;
        }
      );
  }

  async getHeaderSettings() {
    let params: Partial<{
      idOrganization: number;
      formatted: boolean;
      extended: boolean
    }> = {
      idOrganization: this.user.idIglesia,
      formatted: true,
      extended: true
    }
    const response: any = await this.organizationService.getHeaderStyle(params).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    console.log(response);

    if (response) {
      this.header_menu_settings = response.header_menu_settings;
    }
  }
  getTotalTeams() {
    // this.api
    //   .get(`groups/getTeamGroups/`, { idIglesia: this.user.idIglesia })
    //   .subscribe((data: any) => {
    //     if (data.groups) {
    //       this.dashboard.teams = data.groups;
    //     }
    //   });
  }

  getTotalEvents() {
    // this.api
    //   .post(`groups/getGroupsEventsByIdIglesia/`,
    //     {
    //       idIglesia: this.userService.getCurrentUser().idIglesia,
    //       idUsuario: this.userService.getCurrentUser().idUsuario
    //     })
    //   .subscribe((data: any) => {
    //     if (data.events) {
    //       this.dashboard.events = data.events;
    //     }
    //   });
  }

  showPushNotificationsModal(push_notification_form: PushNotificationComponent) {
    push_notification_form.getLastNotifications()
      .then(data => {
        this.modal.getModal('makePushModal').open();
      });
  }

  dismissPushModal(message) {
    if (message) {
      const currentUser = this.userService.getCurrentUser();
      const notification = {
        title: message.title,
        body: message.body,
        idIglesia: currentUser.idIglesia,
        topic: currentUser.topic,
        created_by: currentUser.idUsuario
      };
      this.organizationService.sendNotification(notification).subscribe(
        response => {
          this.organizationService.api.showToast(
            'Notification sent successfully',
            1
          );
          this.modal.getModal('makePushModal').close();
        },
        error => {
          console.error(error);
          this.organizationService.api.showToast(
            'Error sending the notification.',
            2
          );
        }
      );
    } else {
      this.modal.getModal('makePushModal').close();
    }
  }

  getCover() {
    if (this.iglesia && this.iglesia.portadaArticulos_v2) {
      if (this.iglesia.portadaArticulos_v2.startsWith('https')) {
        return `url(${this.iglesia.portadaArticulos})`;
      } else {
        return `url('${environment.serverURL}${this.iglesia.portadaArticulos_v2}')`
      }
    } else {
      return 'url(/assets/img/default-cover-image.jpg)';
    }
  }

  async selectIglesia(selectedIglesia: any) {
    let iglesia = this.iglesias.find(
      ig => ig.idIglesia === selectedIglesia.idIglesia
    );
    if (!this.user.isSuperUser) {
      const response: any = await this.api.get(`users/getAllOrganizationsForUser`, { idUser: this.user.idUsuario }).toPromise();
      if (response) {
        iglesia = response.users.find(u => u.idIglesia === selectedIglesia.idIglesia);
        if (iglesia.idUserType === 2) {
          setTimeout(() => {
            this.app.footer.currentUser = this.user;
            this.app.menu.currentUser = this.user;
          });
          this.api.showToast(`You will be redirected to your profile, since you are a member in this organization.`, ToastType.info);
          this.setIglesia(iglesia);
          this.router.navigate([`/user-profile/details/${this.user.idUsuario}`]);
          return;
        }
      }
    }
    this.setIglesia(iglesia);
    this.loadTabs();
    this.getIglesia();
  }

  setIglesia(iglesia: any) {
    this.user = this.userService.getCurrentUser();
    this.user.idIglesia = iglesia.idIglesia;
    this.user.iglesia = iglesia.Nombre;
    this.user.topic = iglesia.topic;
    this.user.idTipoServicio = iglesia.idTipoServicio;
    this.user.service_type_picture = iglesia.service_type_picture;
    if (iglesia.idUserType) {
      this.user.idUserType = iglesia.idUserType;
    }
    if (iglesia.Logo) {
      this.user.logoPic = this.fus.cleanPhotoUrl(iglesia.Logo);
    } else {
      this.user.logoPic = undefined;
    }
    const userStr: string = JSON.stringify(this.user);
    localStorage.setItem('currentUser', userStr);
  }

  /**
   * Change cover
   */
  addCover() {
    this.input_file.nativeElement.onchange = (event: {
      target: { files: File[] };
    }) => {
      if (event.target.files.length > 0) {
        const confirmation = confirm(
          `You want to update this organization's cover? This will update all the tabs cover.`
        );
        if (confirmation) {
          this.photo = event.target.files[0];
          this.uploadTabImage();
        }
      }
    };
    (this.input_file as ElementRef).nativeElement.click();
  }

  uploadTabImage() {
    this.uploadingCover = true;

    const indexPoint = (this.photo.name as string).lastIndexOf('.');
    const extension = (this.photo.name as string).substring(indexPoint);
    const ticks = (
      Number(String(Math.random()).slice(2)) +
      Date.now() +
      Math.round(performance.now())
    ).toString(36);
    const myUniqueFileName = `tab_cover_${this.iglesia.idIglesia}_${ticks}${extension}`;
    const iglesia_temp = new OrganizationModel();
    iglesia_temp.idIglesia = this.user.idIglesia;
    iglesia_temp.topic = this.user.topic;

    this.organizationService
      .uploadFile(this.photo, iglesia_temp, myUniqueFileName, 'articulo')
      .then((response: any) => {
        // Update additional data
        if (!this.tabToShow) {
          this.tabToShow = new ConfigurationTabModel();
          this.tabToShow.idIglesia = this.user.idIglesia;
        }
        this.tabToShow.slider = this.fus.cleanPhotoUrl(response.response);

        const tab = Object.assign({}, this.tabToShow);
        this.organizationService.updateArticlesCover(tab).subscribe(
          response_updated => {
            // Reload Cover
            this.getIglesia();
          },
          error => {
            console.error(error);
            this.organizationService.api.showToast(
              `Something happened trying to save the slider.`,
              ToastType.error
            );
          }
        );
      });
  }

  loadTabs() {
    this.organizationService.getConfiguracionesTabs().subscribe(
      (data: any) => {
        if (data.msg.Code === 200) {
          const tabs = [...data.tabs];
          this.tabToShow = tabs[0];
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  updateLogo() {
    this.inputLogo.nativeElement.onchange = (event: {
      target: { files: File[] };
    }) => {
      if (event.target.files.length > 0) {
        const confirmation = confirm(
          `You want to update this organization's logo?`
        );
        if (confirmation) {
          const photo: File = event.target.files[0];
          this.uploadLogo(photo);
        }
      }
    };
    (this.inputLogo as ElementRef).nativeElement.click();
  }

  uploadLogo(file: File) {
    this.uploadingLogo = true;
    const iglesia_temp = new OrganizationModel();
    iglesia_temp.idIglesia = this.user.idIglesia;
    iglesia_temp.topic = this.user.topic;
    iglesia_temp.Nombre = this.iglesia.Nombre;
    iglesia_temp.datosPagosIglesia = null;
    iglesia_temp.datosProyectoIglesia = null;
    iglesia_temp.cuponesIglesias = null;
    iglesia_temp.idTipoServicio = this.iglesia.idTipoServicio;

    const indexPoint = (file.name as string).lastIndexOf('.');
    const extension = (file.name as string).substring(indexPoint);
    const ticks = (
      Number(String(Math.random()).slice(2)) +
      Date.now() +
      Math.round(performance.now())
    ).toString(36);
    const myUniqueFileName = `organization_logo_${this.user.idIglesia}_${ticks}${extension}`;

    this.organizationService
      .uploadFile(file, iglesia_temp, myUniqueFileName, 'logo')
      .then((data: any) => {
        iglesia_temp.Logo = this.fus.cleanPhotoUrl(data.response);
        this.organizationService.getIglesiaDetail(iglesia_temp)
          .subscribe((response: any) => {

            const organization = Object.assign({}, response.iglesia);
            if (!organization.datosProyectoIglesia) {
              organization.datosProyectoIglesia = new DatosProyectoIglesiaModel();
            }
            const start_date = moment(organization.datosProyectoIglesia.fechaInicioProyecto).utc().format('YYYY-MM-DD');
            const buy_date = moment(organization.datosProyectoIglesia.fechaCompraDominio).utc().format('YYYY-MM-DD');
            organization.datosProyectoIglesia.fechaInicioProyecto = start_date;
            organization.datosProyectoIglesia.fechaCompraDominio = buy_date;
            if (!organization.datosPagosIglesia) {
              organization.datosPagosIglesia = new DatosPagosIglesiaModel();
              organization.datosPagosIglesia.idCatalogoPlan = response.iglesia.idCatalogoPlan;
            }
            organization.Logo = this.fus.cleanPhotoUrl(data.response);
            this.organizationService
              .saveIglesia(organization)
              .subscribe((res: any) => {
                this.getIglesia();
              });
          });
      });
  }

  getRouterDesign(currentUser: User) {
    if (currentUser.isSuperUser) {
      return `/admin/design-request`;
    } else {
      return `/design-request/${currentUser.idIglesia}/list`;
    }
  }
  getRouterTimesheet(currentUser: User) {
    if (currentUser.isSuperUser) {
      return `/admin/timesheet`;
    } else {
      return `/time-sheet/${currentUser.idIglesia}/list`;
    }
  }

  openEventsSelector(
    select_event_modal: NgxSmartModalComponent,
    select_event_form: SelectEventsComponent,
    id: string) {
    select_event_form.id = id;
    select_event_modal.open();
  }

  selectEvent(select_event_modal: NgxSmartModalComponent, event) {
    if (event) {
      this.router.navigate([event.url], {
        fragment: event.id
      });
    }
    select_event_modal.close();
  }

  async shareQR(qr_code: NgxQRCodeComponent) {
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
      this.organizationService.api.showToast('QR copied to clipboard', ToastType.success);
    } catch (err) {
      console.error(err.name, err.message);
    }

  }

  selectOption(
    select_event_modal: NgxSmartModalComponent,
    select_action_event_modal: NgxSmartModalComponent,
    select_event_form: SelectEventsComponent,
    action: string
  ) {
    select_event_form.id = action;
    select_event_modal.open();
    select_action_event_modal.close();

  }

  changeZoom(e) {
    const zoomVal = e.target.value;

    const b = document.getElementsByClassName('pattern-background-image')[0];
    this.zoomLevel = zoomVal;
    (b as HTMLElement).style.backgroundSize = `${zoomVal}%`;
  }

  mouse_down = {
    x: 0,
    y: 0
  };
  ele_pos: any;
  mouse_pos: any;
  patternBackground: any;
  patternBackgroundWidth: number;
  zoomLevel: number = 70;

  mouseDown(e: MouseEvent) {
    e.preventDefault();
    this.patternBackground = document.getElementsByClassName('pattern-background-image')[0];
    this.patternBackgroundWidth = this.patternBackground.clientWidth;
    // console.log(e);

    // console.log(this.patternBackground);
    // console.log(this.patternBackgroundWidth);

    this.mouse_down = {
      x: e.pageX || e.pageX,
      y: e.pageY || e.pageY
    };

    this.ele_pos = {
      x: ((this.patternBackground as HTMLElement).style.backgroundPosition.split(' ')[0] || '0').replace('%', ''),
      y: ((this.patternBackground as HTMLElement).style.backgroundPosition.split(' ')[1] || '0').replace('%', '')
    };
    // console.log('mouse_down', this.mouse_down);
    // console.log('ele_pos', this.ele_pos);
    this.mouseUp(e);
    return this.mouseMove(e);
  }

  mouseUp(e: MouseEvent) {
    return $(document).unbind('mousemove touchmove');
  }

  mouseMove(e: MouseEvent) {
    // console.log(this.mouse_pos);
    // console.log(this.mouse_down);
    // console.log(e);

    this.mouse_pos = {
      x: e.pageX || this.mouse_down.x,
      y: e.pageY || this.mouse_down.y
    };
    // console.log(this.mouse_pos);
    // console.log(this.mouse_down);
    // console.log(this.mouse_down !== this.mouse_pos);


    if (this.mouse_down !== this.mouse_pos) {
      const movePercentage = {
        x: 100 * (this.mouse_pos.x - this.mouse_down.x) / this.patternBackgroundWidth,
        y: 100 * (this.mouse_pos.y - this.mouse_down.y) / this.patternBackgroundWidth
      };
      // console.log(movePercentage);

      const actualMovePercentage = {
        x: 0.7 / (1 - this.zoomLevel / 100) * movePercentage.x,
        y: 0.7 / (1 - this.zoomLevel / 100) * movePercentage.y
      };
      // console.log(actualMovePercentage);

      (this.patternBackground as HTMLElement).style.backgroundPosition = `${this.ele_pos.x + actualMovePercentage.x}% ${this.ele_pos.y + actualMovePercentage.y}%`;
      // console.log((this.patternBackground as HTMLElement).style.backgroundPosition);

      // this.patternBackground.css({
      //   'background-position': `${this.ele_pos.x + actualMovePercentage.x}% ${this.ele_pos.y + actualMovePercentage.y}%`
      // });

    }

  }

  changedTab(event) {
    if (event.index === 5) {
      if (!this.loaded_scripts) {
        const node = document.createElement('script');
        node.text = `var IDIGLESIA = 2098; var IDPLAYLIST = undefined; var LANG = "en";`;
        node.type = 'text/javascript';
        node.async = true;
        // node.charset = 'utf-8';
        document.getElementsByTagName('head')[0].appendChild(node);

        this.scripts_resource.forEach((script: Scripts) => {
          this.scripts[script.name] = {
            loaded: false,
            src: script.src
          };
        });

        this.load('VueJSScript', 'AxiosScript', 'MomentScript')
          .then(data => {
            this.load('PlaylistScript').then(data_2 => {
              // this.getCommunity();
              // this.mapInitializer();
              this.loaded_scripts = true;
            })
              .catch(error => {
                console.error(error);
              });
          }).catch(error => {
            console.error(error);
          });
      }
    }
    if (event.index === 7) {
      this.isChat = true
      //event.tab.isActive = false;
      //this.router.navigateByUrl(`/messenger/chats`);
    }
  }

  addTodo() {
    this.show_todo_form = true;
    setTimeout(() => {
      this.todo_form.resetForm();
      this.todo_form.todo = undefined;
    });
  }

  cancelForm(event) {
    this.show_todo_form = false;
  }

  accomplishTodo(to_do: FormControl) {
    if (to_do.valid) {
      const todo: ToDoModel = to_do.value;
      this.organizationService.accomplishTodo(todo)
        .subscribe(response => {
          this.userService.api.showToast(`Information updated.`, ToastType.info);
          this.updateTodos();
        }, error => {
          this.userService.api.showToast(`Error updating to do.`, ToastType.error);
          console.error(error);
        });
    }
  }

  reviewTodo(to_do: FormControl) {
    if (to_do.valid) {
      const todo: ToDoModel = to_do.value;
      todo.reviewed_by = this.user.idUsuario;
      this.organizationService.reviewTodo(todo)
        .subscribe(response => {
          this.userService.api.showToast(`ToDo reviewed.`, ToastType.info);
          this.updateTodos();
        }, error => {
          console.error(error);
        });
    }
  }

  uploadToDoResources(to_do: FormControl) {
    this.input_to_do.nativeElement.onchange = (event: {
      target: { files: File[] };
    }) => {
      if (event.target.files.length > 0) {
        const confirmation = confirm(
          `You want to upload this resource?`
        );
        if (confirmation) {
          const photo: File = event.target.files[0];

          this.uploadResource(photo, to_do);
        }
      }
    };
    (this.input_to_do as ElementRef).nativeElement.click();
  }

  uploadResource(file: File, to_do: FormControl) {
    this.uploadingLogo = true;
    const iglesia_temp = new OrganizationModel();
    iglesia_temp.idIglesia = this.user.idIglesia;
    iglesia_temp.topic = this.user.topic;
    iglesia_temp.Nombre = this.iglesia.Nombre;
    iglesia_temp.datosPagosIglesia = null;
    iglesia_temp.datosProyectoIglesia = null;
    iglesia_temp.cuponesIglesias = null;
    iglesia_temp.idTipoServicio = this.iglesia.idTipoServicio;

    const indexPoint = (file.name as string).lastIndexOf('.');
    const extension = (file.name as string).substring(indexPoint);
    const ticks = (
      Number(String(Math.random()).slice(2)) +
      Date.now() +
      Math.round(performance.now())
    ).toString(36);
    const myUniqueFileName = `todo_resource_${this.user.idIglesia}_${ticks}${extension}`;

    this.organizationService
      .uploadFile(file, iglesia_temp, myUniqueFileName, 'todos')
      .then((data: any) => {
        const file_path = this.fus.cleanPhotoUrl(data.response);
        // const to_do_obj = to_do.value;
        // to_do_obj.value = file_path;
        to_do.get('value').setValue(file_path);
        this.accomplishTodo(to_do);
      });
  }

  updateToDo(to_do: ToDoModel) {
    this.show_todo_form = true;
    setTimeout(() => {
      this.todo_form.todo = Object.assign({}, to_do);
      this.todo_form.resetForm();
    });
  }

  deleteToDo(to_do: ToDoModel) {
    const confirmation = confirm(`Are you sure you want to delete this to do?`);
    if (confirmation) {
      to_do.deleted_by = this.user.idUsuario;
      this.organizationService.deleteTodo(to_do)
        .subscribe(response => {
          this.updateTodos();
          this.organizationService.api.showToast(`To Do deleted successfully.`, ToastType.success);
        }, error => {
          this.organizationService.api.showToast(`Error deleting the To Do.`, ToastType.error);
        })
    }
  }

  get is_possible_client() {
    if (this.iglesia) {
      return this.iglesia.idCatalogoPlan == 16;
    }
    return false;
  }

  get is_modal_open() {
    if (this.finance_dashboard) {
      if (this.finance_dashboard.donation_category_view) {
        return this.finance_dashboard.donation_category_view.modal_open;
      }
      return false;
    }
    return false;
  }

  openSettingsModal() {
    this.modal.get('clientDisclaimerSettingsModal').open();
    this.organization_disclaimer_settings.idOrganization = this.iglesia.idIglesia;
    this.organization_disclaimer_settings.ngOnInit();
  }

  get to_do_label() {
    let init_todo = `To Do's`;
    const accomplished = this.todos.filter(todo => todo.accomplished).length;
    if (this.user.isSuperUser) {
      const reviewed = this.todos.filter(todo => todo.reviewed).length;
      if (accomplished > 0 && reviewed !== accomplished) {
        init_todo = `${init_todo} (${reviewed}/${accomplished})`;
      }
    } else if (this.todos.length > 0) {
      if (this.todos.length !== accomplished) {
        init_todo = `${init_todo} (${this.todos.length - accomplished}/${this.todos.length})`;
      }
    }
    return init_todo;
  }

  getActualStatus(todo: ToDoModel) {
    if (!todo.accomplished) {
      return `Wait for being accomplished`;
    } else if (!todo.reviewed) {
      return `Wait for being reviewed`;
    } else {
      return `Complete`;
    }
  }

  getRedirectUrl() {
    const url = encodeURI(`https://iglesia-tech-api.e2api.com/api/redirect/${this.user.idIglesia}`);
    return url;
  }

  saveRedirectionUrl() {
    this.api.post_old(`redirect/${this.iglesia.idIglesia}`, {
      redirect_url: this.iglesia.redirect_url,
      created_by: this.user.idUsuario
    })
      .subscribe(response => {
        console.log(response);
        this.api.showToast(`Redirection url saved successfully.`, ToastType.success);
      }, error => {
        this.api.showToast(`Error saving url.`, ToastType.error);
      });
  }

  async onResizeEnd(event: ResizeEvent) {
    this.header_menu_settings.dashboard_height = event.rectangle.height;
    const response: any = await this.organizationService.saveDashboardHeight({
      idOrganization: this.user.idIglesia,
      dashboard_height: this.header_menu_settings.dashboard_height
    }).toPromise().catch(error => {
      console.error(error);
      return;
    });
    if (response) {
      console.log(response);
    }
    // ('/general/style/dashboard')
    // const actual_width = this.rectangle_sizable.nativeElement.clientWidth;
    // const aspect_ratio = actual_width / this.iglesia.header_menu_settings.height;
    // this.iglesia.header_menu_settings.aspect_ratio = aspect_ratio;
    // this.edit_object.home_info = true
    // this.wasEdited();
  }

  async checkDudaSettings() {
    this.duda_site_settings_form.get('idOrganization').setValue(this.user.idIglesia);
    const params = this.duda_site_settings_form.value;
    const site_info: any = await this.sync_service.checkOrganization(params).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (site_info) {
      this.site_has_duda_settings = site_info.settings.has_site_id;
      if (this.site_has_duda_settings) {
        this.duda_site_settings_form.get('site_id').setValue(site_info.settings.site_id);
      } else {
        this.duda_site_settings_form.get('site_id').setValue(undefined);
      }
    } else {
      this.site_has_duda_settings = false;
      this.duda_site_settings_form.get('site_id').setValue(undefined);
    }
  }

  async handleSiteBuilderClick() {
    this.wait_click_duda = true;
    let url = `https://www.iglesiatechapp.com/`;
    if (this.site_has_duda_settings) {
      const params = this.duda_site_settings_form.value;
      const site_info: any = await this.sync_service.getSSOLink(params).toPromise()
        .catch(error => {
          console.error(error);
          return;
        });
      if (site_info) {
        url = site_info.url;
        window.open(url, '_blank');
      } else {
        this.openSiteIdModal();
      }
    } else {
      this.openSiteIdModal();
    }
    this.wait_click_duda = false;
  }

  openSiteIdModal(event?: PointerEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.show_setting_component = true;
    this.modal.get('site_id_info_modal').open();
  }

  closeSiteIdModal() {
    this.checkDudaSettings();
    this.show_setting_component = false;
    this.modal.get('site_id_info_modal').close();
  }


}
