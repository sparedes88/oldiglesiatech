import { FormControl, NgForm } from '@angular/forms';
import { AutocompleteResponseModel, GoogleAddressComponent } from './../../../component/google-places/google-places.component';
import { CalendarEvent } from 'angular-calendar';
import { GroupEventModel } from './../../../models/GroupModel';
import { ToastType } from './../../../login/ToastTypes';
import { UserLogFormComponent } from './../user-log-form/user-log-form.component';
import { UserLogModel, UserCommitmentsModel, UserCommitmentsManageModel } from './../../../models/UserLogModel';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import * as moment from 'moment';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { UserService } from 'src/app/services/user.service';
import { GroupModel, GroupMemberModel } from 'src/app/models/GroupModel';
import { MatExpansionPanel } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { CheckRequirementsComponent } from 'src/app/component/check-requirements/check-requirements.component';
import { MultiSelectComponent, IDropdownSettings } from 'ng-multiselect-dropdown';
import { SeeStepDetailComponent } from '../see-step-detail/see-step-detail.component';
import { UserCommitmentFormComponent } from '../user-commitment-form/user-commitment-form.component';
import { random_color } from 'src/app/models/Utility';
import { borderTopRightRadius } from 'html2canvas/dist/types/css/property-descriptors/border-radius';
import { COUNTRIES_DB } from '@angular-material-extensions/select-country';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import * as crypto from 'crypto-js';

@Component({
  selector: 'app-member-profile',
  templateUrl: './member-profile.component.html',
  styleUrls: ['./member-profile.component.css']
})
export class MemberProfileComponent implements OnInit {

  @ViewChild('multi_user_type_select') multi_user_type_select: MultiSelectComponent;

  translatesProfile: {
    'Miembro_Loading_UploadPicture',
    'Miembros_Alert_PasswordsNoCoinciden',
    'Miembros_Alert_CamposVacios',
    'Miembro_Error_ActualizarMiembro_Callback',
    'Miembros_Alert_MiembroActualizado',
    'Miembros_Camera_SeleccionarFoto_Title',
    'Miembros_Camera_SeleccionarFoto_Subtitle',
    'Miembros_Camera_UsarEstaFoto',
    'Miembros_Camera_TomarOtraFoto',
    'Iglesias_Cambiar_Confirmacion_Button_Cancelar',
    'Miembro_Error_CopiarFoto_Callback',
    'Requisito_Error_SinRequisitos',
    'Requisito_Error_ObtenerDetalles_Callback'
  };
  logs: UserLogModel[] = [];
  commitments: UserCommitmentsModel[] = [];

  public currentUser: any = this.userService.getCurrentUser();;

  community_info = {
    directories: [],
    entries: []
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
  public uploading: Boolean = false;
  donation_filter_form: FormGroup = this.form_builder.group({
    from: new FormControl(moment().startOf('month').format('YYYY-MM-DD')),
    to: new FormControl(moment().endOf('month').format('YYYY-MM-DD')),
    category: new FormControl(''),
    search: new FormControl()
  });
  donation_categories: any[] = [];
  generated_qr_code: string;

  constructor(
    public api: ApiService,
    public route: ActivatedRoute,
    public modal: NgxSmartModalService,
    public form_builder: FormBuilder,
    public userService: UserService,
    public fus: FileUploadService,
    private router: Router,
    private translate: TranslateService,
    private toastr: ToastrService
  ) {
    this.memberId = this.route.snapshot.params.id;
    this.telefono = this.route.snapshot.queryParams.telefono;
    this.translate.get([
      'Miembro_Loading_UploadPicture',
      'Miembros_Alert_PasswordsNoCoinciden',
      'Miembros_Alert_CamposVacios',
      'Miembro_Error_ActualizarMiembro_Callback',
      'Miembros_Alert_MiembroActualizado',
      'Miembros_Camera_SeleccionarFoto_Title',
      'Miembros_Camera_SeleccionarFoto_Subtitle',
      'Miembros_Camera_UsarEstaFoto',
      'Miembros_Camera_TomarOtraFoto',
      'Iglesias_Cambiar_Confirmacion_Button_Cancelar',
      'Miembro_Error_CopiarFoto_Callback',
      'Requisito_Error_SinRequisitos',
      'Requisito_Error_ObtenerDetalles_Callback'
    ]).subscribe(values => {
      this.translatesProfile = values;
    });
  }

  public serverUrl: string = environment.serverURL;

  telefono: any;
  selectableCategories: any[] = [];
  selectableLevels: any[] = [];
  user_types = [{
    idUserType: 1,
    name: 'Organization admin'
  }, {
    idUserType: 2,
    name: 'Member'
  }];

  // member data
  public memberId: any;
  public member: any = {};
  public categories: any[] = [];
  public levels: any[] = [];
  public ministries: any[] = [];
  public groups: any[] = [];
  public processes: any[] = [];
  public tempPhoto: any;
  niveles: any[] = [];

  // UI
  public loadingMember: boolean = true;
  public loadingMinistries: boolean = true;
  public loadingGroups: boolean = true;
  public loadingEvents: boolean = true;

  // Form Group
  public userFormGroup: FormGroup = new FormGroup({
    password: new FormControl('', [Validators.minLength(6)]),
  });
  public editMode: boolean = false;

  events: CalendarEvent[] = [];
  viewDate: Date = new Date();
  viewDateNext: Date = new Date();
  events_original: CalendarEvent[] = [];
  events_clear: any[] = [];
  public donations: any[] = [];
  // Options
  // Select opts
  public selectCatOptions: any = {
    singleSelection: false,
    idField: 'idCategoriaMiembro',
    textField: 'descripcion',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  };

  public selectLevelOptions: any = {
    singleSelection: false,
    idField: 'idProcess',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  };

  selectUserTypeOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idUserType',
    textField: 'name',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };
  init_map: boolean = false;


  @ViewChild('process_multiselect') process_multiselect: MultiSelectComponent;

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

  ngOnInit() {
    this.init_map = false;
    this.viewDate = moment().startOf('month').toDate();
    this.viewDateNext = moment(this.viewDate).add(1, 'M').toDate();
    this.getProfileSummary();
    this.getMemberProfile();
    // this.getCategoryAndLevels()
    this.getLevels();
    this.getCategories();
    setTimeout(() => {
      this.init_map = true;
    }, 100);
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
        this.getDonationCategories();
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

  async getDonationCategories() {
    const response: any = await this.api.get(
      `donations/categories`,
      {
        idIglesia: this.currentUser.idIglesia
      }
    ).toPromise()
      .catch(error => {
        console.error(error);
        return;
      })
    if (response) {
      this.donation_categories = response.categories;
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
    this.userFormGroup = this.form_builder.group({
      idIglesia: this.member.idIglesia,
      idUsuario: this.member.idUsuario,
      nombre: [this.member.nombre, Validators.required],
      apellido: [this.member.apellido, Validators.required],
      sexo: [this.member.sexo],
      telefono: [this.member.telefono, Validators.required],
      country_code: [this.member.country_code, Validators.required],
      email: [this.member.email, Validators.required],
      ciudad: [this.member.ciudad],
      calle: [this.member.calle],
      provincia: [this.member.provincia, Validators.required],
      zip: this.member.zip,
      location: this.member.location,
      country: this.member.country,
      estadoCivil: this.member.estadoCivil,
      fechaNacimiento: this.member.fechaNacimiento.split('T')[0],
      fechaMembresia: this.member.fechaMembresia.split('T')[0],
      fotoUrl: this.member.fotoUrl,
      idUserType: this.member.idUserType,
      photo: [''],
      categorias: [''],
      niveles: [''],
      processes: [''],
      password: new FormControl('', [Validators.minLength(6)]),
      lat: this.member.lat,
      lng: this.member.lng,
    });
  }

  get photoUrl() {
    if (this.member.foto && this.member.foto !== 'null') {
      return `${this.serverUrl}${this.member.foto}`;
    }

    if (this.currentUser.logoPic) {
      return `${this.serverUrl}${this.currentUser.logoPic}`;
    }
    if (this.member.sexo) {
      if (this.member.sexo.substring(0, 2) === 'Ma') {
        return '/assets/img/img_avatar.png';
      } else {
        return '/assets/img/img_avatar_female.png';
      }
    }
    return '/assets/img/img_avatar.png';
  }
  getDonations() {
    console.log(this.currentUser)
    const search_payload: Partial<{
      from: string;
      to: string;
      category: number;
      search: string;
      idUser: number;
      idIglesia: number;
    }> = {};
    const payload = this.donation_filter_form.value;
    console.log(search_payload)
    search_payload.idUser = this.memberId;
    search_payload.idIglesia = this.currentUser.idIglesia;
    Object.keys(payload).forEach(x => {
      if (payload[x]) {
        search_payload[x] = payload[x];
      }
    });
    this.api
      .get(`donations_v2/search`, search_payload)
      .subscribe((data: any) => {
        console.log(data)
        if (data) {
          this.donations = data
          this.donations.forEach(iglesia => {
            iglesia.donations.forEach(element => {
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
  getMemberProfile() {
    this.loadingMember = true;
    this.api.get(`users/getUser/${this.memberId}`,
      {
        idIglesia: this.currentUser.idIglesia
      })
      .subscribe(async (data: any) => {
        if (data.msg.Code === 200) {
          this.member = data.user;
          const obj = {
            idUser: this.member.idUsuario,
            idOrganization: this.member.idIglesia,
            email: this.member.email
          };
          this.generated_qr_code = this.userService.encryptUserQR(obj);

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
          this.member.location = this.formatFullAddress(this.member);
          this.member.fechaNacimiento = this.fixBirdthDate(this.member.fechaNacimiento);
          this.member.telefono = data.user.telefono;
          if (!this.member.lat || !this.member.lat) {
            const pin_info = await GoogleAddressComponent.convert(this.member.location).catch(error => {
              console.error(error);
              return error;
            });
            if (JSON.stringify(pin_info) !== '{}') {
              const address = pin_info.address;
              address.idUser = this.member.idUsuario;
              this.api
                .post(`users/updateAddress`, address)
                .subscribe(response => {
                });
            }
          }
          this.initForm();
        } else {
          this.member = {};
        }
        // Load ministries when user is ready
        // // this.getMinistries()
        // this.getGroups();
        // // this.getEvents()
        // this.getCategoryAndLevels();
        // this.getDirectoriesAndEntries();
      },
        error => {
          console.error(error);
          this.loadingMember = false;
        },
        () => this.loadingMember = false
      );
  }

  fixBirdthDate(date: string) {
    return moment(date).add(12, 'hours').toISOString();
  }

  getCategoryAndLevels() {
    const promises: Promise<any>[] = [];
    promises.push(this.api.get('getCategoriasAndNivelesByIdUsuario',
      {
        idUsuario: this.memberId, idIglesia: this.currentUser.idIglesia
      }).toPromise());
    promises.push(this.api.get('processes/getProcessForUser',
      {
        idUsuario: this.memberId,
        idIglesia: this.currentUser.idIglesia
      }
    ).toPromise());
    if (this.currentUser.idUserType === 1 || this.currentUser.isSuperUser) {
      promises.push(this.getLogs());
      promises.push(this.getCommitments());
    }
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

  getLogs(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.api.get('users/logs/getLogs',
        {
          idUser: this.memberId,
          idIglesia: this.currentUser.idIglesia,
          idUserOrganization: this.member.idUserOrganization
        }).subscribe((response: any) => {
          this.logs = response.logs;
          return resolve(this.logs);
        }, error => {
          this.logs = [];
          return resolve(this.logs);
        });
    });
  }

  getCommitments(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.userService.getCommitmentsByUser(this.memberId, this.currentUser.idIglesia)
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

  getGroups() {
    console.log(this.member);

    this.loadingGroups = true;
    this.api.get('groups/getGroupsByIdUsuario', {
      idUser: this.memberId,
      idIglesia: this.currentUser.idIglesia
    })
      .subscribe(
        (data: any) => {
          this.groups = data.groups;
        },
        err => {
          console.error(err);
          this.loadingGroups = false;
          this.loadingMinistries = false;
          this.loadingEvents = false;
        },
        () => {
          this.loadingGroups = false;
          this.loadingMinistries = false;
          this.loadingEvents = false;
        }
      );
  }

  // getEvents() {
  //   this.loadingEvents = true
  //   this.api.get('getEventosByIdUsuario', { idUsuario: this.memberId, idIglesia: this.member.idIglesia })
  //     .subscribe(
  //       (data: any) => {
  //         this.events = data.eventos
  //       },
  //       err => {
  //         console.error(err)
  //         this.loadingEvents = false
  //       },
  //       () => this.loadingEvents = false
  //     )
  // }

  getCategories() {
    this.api.get('getCategoriasMiembros', { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          this.selectableCategories = data.categoriasMiembros;
        },
        err => console.error(err)
      );
  }

  getLevels() {
    this.api.get('getNiveles', { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          this.selectableLevels = data.niveles;
        },
        err => {
          console.error(err);
        }
      );
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    this.tempPhoto = undefined;
    // Patch form
    // const processes = this.member.processes.filter((v, i, a) => a.findIndex(t => (t.idProcess === v.idProcess)) === i)
    this.userFormGroup.patchValue({
      processes: this.member.fixed_proccesses,
      niveles: this.levels,
      categorias: this.categories,
      telefono: this.member.telefono,
      country_code: this.member.country_code,
    });
    if (this.editMode) {
      setTimeout(() => {
        const user_type = this.user_types.filter(x => x.idUserType === this.member.idUserType);
        console.log(user_type);
        this.multi_user_type_select.writeValue(user_type);
      });
    } else {
      this.multi_user_type_select.selectedItems = [];
    }
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

  submitUpdate(form: FormGroup) {
    if (form.invalid) {
      const object_keys = Object.keys(form.controls);
      object_keys.forEach(key => {
        const control = form.get(key);
        if (control.invalid) {
          const error_keys = Object.keys(control.errors);
          if (error_keys.length > 0) {
            if (error_keys[0] === 'required') {
              this.userService.api.showToast(`Some required info is missing`, ToastType.info);
              return;
            }
          }
        }
      })
      return;
    }

    const payload = this.removeEmptyParams(form.value);
    if (Array.isArray(payload.idUserType)) {
      if (payload.idUserType.length > 0) {
        payload.idUserType = payload.idUserType[0].idUserType;
      } else {
        this.api.showToast(`Please select a valid role.`, ToastType.info);
        // this.serverBusy = false;
        return;
      }
    } else if (payload.idUserType == null) {
      this.api.showToast(`Please select a valid role.`, ToastType.info);
      // this.serverBusy = false;
      return;
    }
    if (payload.idUserType === 0) {
      this.api.showToast(`Please select a valid role.`, ToastType.info);
      // this.serverBusy = false;
      return;
    }
    console.log(form.value);

    if (form.value.photo) {
      this.fus.uploadFile(form.value.photo, true)
        .subscribe(
          (res: any) => {
            const clean_url = this.fus.cleanPhotoUrl(`${res.file_info.src_path}`);
            form.patchValue({ fotoUrl: clean_url, foto: clean_url });
            // Clean payload
            // const payload = this.removeEmptyParams(form.value);
            payload.fotoUrl = clean_url;
            payload.foto = clean_url;
            this.updateUser(payload);
          },
          err => {
            alert(`Can't upload photo!`);
          }
        );
    } else {
      if (form.value.fotoUrl) {
        form.patchValue({ fotoUrl: this.fus.cleanPhotoUrl(form.value.fotoUrl) });
        form.patchValue({ foto: this.fus.cleanPhotoUrl(form.value.fotoUrl) });
        // clean payload
        // const payload = this.removeEmptyParams(form.value);
        this.updateUser(payload);
      } else {
        // const payload = this.removeEmptyParams(form.value);
        this.updateUser(payload);
      }
    }
  }

  updateUser(data: any) {
    data.idIglesia = this.currentUser.idIglesia;
    // Insert data on categories
    if (data.categorias && data.categorias.length) {
      data.categorias.map(cat => {
        cat.idUsuario = data.idUsuario;
      });
    }

    const process = [...data.processes];
    data.processes = [];
    process.forEach(process_in_array => {
      data.processes.push(process_in_array.idProcess);
    });
    if (data.password) {
      data.pass = UserService.encryptPass(data.password);
      data.password = undefined;
    }
    // Check phone
    this.api.post(`updateUsuario`, data)
      .subscribe(
        (res: any) => {
          if (res.phone_warning) {
            this.api.showToast(`The phone provided is already in use and will not be updated`, ToastType.info);
          }
          this.telefono = data.telefono;
          this.getMemberProfile();
          this.toggleEditMode();
          // Update values
          // this.getCategoryAndLevels()
          this.getLevels();
          this.getCategories();
          this.telefono = data.telefono;
        },
        err => {
          alert(`Can't Update profile`);
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

  goToGroupDetail(group: GroupMemberModel) {
    if (group.status) {
      this.router.navigateByUrl(`/group/detail/${group.idGroup}`);
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

  verRequisitosAsUser(nivel, accordion: MatExpansionPanel) {
    if (nivel.requisitos.length === 0) {
      accordion.expanded = false;
      return;
    }

    if (!accordion.expanded) {
      // Closed
      return;
    }

    // const loading = this.loadingCtrl.create({
    //   enableBackdropDismiss: false
    // });
    // loading.present();
    const requisitosPrevios = [...nivel.requisitos];
    this.api.get('getRequisitosByIdNivel',
      { idNivel: nivel.idNivel }
    )
      .subscribe((response: any) => {
        nivel.requisitos = response.requisitos;
        if (nivel.requisitos) {

          nivel.requisitos = nivel.requisitos.filter(item => {
            return item.estatus;
          });

          nivel.requisitos.map(requisito => {
            requisitosPrevios.map(requisitoPrevio => {
              if (requisitoPrevio.idRequisito === requisito.idRequisito) {
                requisito.cumplido = requisitoPrevio.cumplido;
              }
            });
          });
          // loading.dismiss();
        } else {
          this.api.showToast(this.translatesProfile.Requisito_Error_SinRequisitos, ToastType.error);
          // loading.dismiss();
        }
      }, err => {
        console.error(err);
        this.api.showToast(this.translatesProfile.Requisito_Error_ObtenerDetalles_Callback, ToastType.error);
        // loading.dismiss();
      });
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
        usuario.foto = this.fus.cleanPhotoUrl(usuario.foto);
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

  getNivelesForProcess(event) {
    const processes_ids = [];
    this.process_multiselect.selectedItems.forEach(process => {
      processes_ids.push(process.id);
    });

    // this.serverBusy = true;
    this.api.post(`processes/getLevelsForProcesses`,
      {
        idOrganization: this.currentUser.idIglesia,
        processes: processes_ids
      })
      .subscribe((response: any) => {
        // this.serverBusy = false;
        const new_levels_available = response.levels;
        if (this.niveles) {
          this.niveles.map(nivel => {
            if (nivel.requisitos) {
              nivel.requisitosCumplidos = nivel.requisitos.filter(item => {
                return item.cumplido;
              });
            } else {
              nivel.requisitos = [];
            }
            new_levels_available.map(level => {
              const index = new_levels_available.indexOf(level);

              const level_to_assign = this.niveles.find(x => level.idNivel === x.idNivel);
              if (level_to_assign) {
                new_levels_available[index] = level_to_assign;
              }
            });
          });
          const unique = [...new_levels_available];

          this.niveles = unique
            .map(e => e.idNivel)
            // store the keys of the unique objects
            .map((e, i, final) => final.indexOf(e) === i && i)
            // eliminate the dead keys & store unique objects
            .filter(e => unique[e]).map(e => unique[e]);

        } else {
          this.niveles = response.levels;
        }
        this.member.niveles = this.niveles;
        this.userFormGroup.patchValue({
          niveles: this.niveles
        });
      }, error => {
        console.error(error);
        // this.serverBusy = false;
        this.api.showToast('Error getting the levels...', ToastType.error);
      });
  }

  onModalEditDidDismiss(user_log_modal: NgxSmartModalComponent, response) {
    user_log_modal.close();
    if (response) {
      this.getMemberProfile();
    }
  }

  openUserLogModal(user_log_modal: NgxSmartModalComponent, user_log_form: UserLogFormComponent) {
    user_log_modal.open();
    user_log_form.ngOnInit();
  }

  openUserCommitmentModal(user_commitment_modal: NgxSmartModalComponent, user_commitment_form: UserCommitmentFormComponent) {
    user_commitment_form.loadFrequencies()
      .then(success => {
        user_commitment_modal.open();
        user_commitment_form.ngOnInit();
      });
  }

  updateLog(
    user_log_modal: NgxSmartModalComponent,
    user_log_form: UserLogFormComponent,
    log: UserLogModel) {
    user_log_modal.open();
    user_log_form.log = Object.assign({}, log);
    user_log_form.ngOnInit();
  }

  deleteLog(log: UserLogModel) {
    const confirmation = confirm(`Are you sure you want to delete this note?`);
    if (confirmation) {
      log.deletedBy = this.currentUser.idUsuario;
      this.userService.deleteUserOrganizationLog(log)
        .subscribe(response => {
          this.userService.api.showToast(`Log deleted successfully.`, ToastType.success);
          this.getMemberProfile();
        }, error => {
          console.error(error);
          this.userService.api.showToast(`Error deleting the log.`, ToastType.error);
        });
    }
  }

  updateCommitment(
    user_commitment_modal: NgxSmartModalComponent,
    user_commitment_form: UserCommitmentFormComponent,
    commitment: UserCommitmentsModel) {
    user_commitment_form.loadFrequencies()
      .then(success => {
        this.userService.getCommitmentsManage(commitment)
          .subscribe((response: any) => {
            user_commitment_modal.open();

            user_commitment_form.commitment = Object.assign({}, response.commitment_manage);
            user_commitment_form.ngOnInit();
          }, error => {
            console.error(error);
            this.api.showToast(`Something went wrong while trying to get commitment manage.`, ToastType.error);
          });
      });

  }

  deleteCommitment(commitment: UserCommitmentsModel) {
    const confirmation = confirm(`Are you sure you want to delete this commitment manage? This will delete all the future commitments associated.`);
    if (confirmation) {
      commitment.deleted_by = this.currentUser.idUsuario;
      this.userService.getCommitmentsManage(commitment)
        .subscribe((response: any) => {
          this.userService.deleteUserCommitment(response.commitment_manage)
            .subscribe(response_delete => {
              this.userService.api.showToast(`Commitment deleted successfully.`, ToastType.success);
              this.getMemberProfile();
            }, error => {
              console.error(error);
              this.userService.api.showToast(`Error deleting the commitment.`, ToastType.error);
            });
        }, error => {
          console.error(error);
          this.api.showToast(`Something went wrong while trying to get commitment manage.`, ToastType.error);
        });
    }
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

  toggleCommitment(commitment: UserCommitmentsModel) {
    commitment.accomplished = !commitment.accomplished;
    commitment.created_by = this.currentUser.idUsuario;
    this.userService.setAsAccomplished(commitment)
      .subscribe(response => {
        this.userService.api.showToast(`Accomplished updated successfully.`, ToastType.success);
        // this.getMemberProfile();
      }, error => {
        console.error(error);
        this.userService.api.showToast(`Error updating accomplished.`, ToastType.error);
      });

  }

  goToGroupEventDetail(group_event: GroupEventModel) {
    this.router.navigateByUrl(`group/events/detail/${group_event.idGroupEvent}`);
  }

  checkDate(start, end) {
    return moment(end).isAfter(moment(start), 'day');
  }

  getEvents() {
    this.loadingEvents = true;
    this.userService.getNextEvents(this.memberId, this.currentUser.idIglesia)
      .subscribe((response: any) => {
        // this.printEvents(response.events);
        this.events = response.events_v2.standalone.concat(response.events_v2.periodic);
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

  formatFullAddress(user: any): string {
    let full_address = ``;
    if (user.calle) {
      full_address = `${user.calle}`
    }
    if (user.ciudad) {
      full_address = `${full_address}, ${user.ciudad}`
    }
    if (user.provincia) {
      full_address = `${full_address}, ${user.provincia}`
    }
    if (user.country) {
      full_address = `${full_address}, ${user.country}`
    }
    if (user.zip_code) {
      full_address = `${full_address}, ${user.zip_code}`
    }
    if (user.zip) {
      full_address = `${full_address}, ${user.zip}`
    }
    if (user.zipCode) {
      full_address = `${full_address}, ${user.zipCode}`
    }
    return full_address;
  }

  public getAddress(item: AutocompleteResponseModel) {
    if (item) {
      if (item.address) {
        const element = {
          calle: item.address.street,
          ciudad: item.address.city,
          provincia: item.address.state,
          zip: item.address.zip_code,
          location: item.address.full_address,
          country: item.address.country,
          lat: item.address.lat,
          lng: item.address.lng,
        }
        this.userFormGroup.get('location').setValue(item.address.full_address);
        this.userFormGroup.patchValue(element);

        if (this.member) {
          this.member.location = item.address.full_address;
        }
      }
    }
  }

  openEditModalEntry(entry) {
    this.photo_input.nativeElement.value = null;
    this.entryForm = Object.assign({}, entry);
    // this.entryForm.assigned_users = this.available_users.filter(x => entry.assign_users_ids.includes(x.idUsuario));
    console.log(this.entryForm);

    this.modal.getModal('entryFormModal').open();
  }

  goToCommunityBox(community_box: any) {
    this.router.navigateByUrl(`community-box/details/${community_box.idCommunityBox}`);
  }

  async getDirectoriesAndEntries() {
    const response: any = await this.api.post(`communityBox/get/users/assigned`, {
      idUser: this.memberId,
      idOrganization: this.currentUser.idIglesia
    }).toPromise()
      .catch(error => {
        console.log(error);
        if (error.error.status === 403) {
          this.api.showToast(`You don't have permission to see this community box.`, ToastType.error);
          this.router.navigate([`/contact/details/${this.memberId}`]);
        } else {
          this.api.showToast(`Couldn't verify your user`, ToastType.error);
        }
      });
    if (response) {
      console.log(response);

      this.community_info = response;
    }
  }

  addPhoto(file: File) {
    if (file) {
      this.uploading = true;
      this.fus.uploadFile(file, true, 'community').subscribe(
        (data: any) => {
          console.log(data);
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

  public getAddressEntry(address: AutocompleteResponseModel) {
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

  updatePassword() {
    console.log(this.userFormGroup);

    if (this.userFormGroup.get('password').touched && this.userFormGroup.get('password').invalid) {
      this.api.showToast(`Please be sure your password has at least 6 characters length.`, ToastType.error);
      return;
    }
    const payload = this.removeEmptyParams(this.userFormGroup.value);
    if (payload.password) {
      payload.pass = UserService.encryptPass(payload.password);
      payload.password = undefined;
    }
    payload.idUser = this.memberId;
    this.api
      .post(`users/updatePassword`, payload)
      .subscribe(response => {
        this.api.showToast(`Password updated`, ToastType.success);
        this.userFormGroup.get('password').setValue('');
        this.userFormGroup.get('password').markAsPristine();
        ($('#v-pills-home-tab') as any).tab('show');
      });
  }

}
