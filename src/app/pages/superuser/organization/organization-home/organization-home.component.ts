import { GoogleAddressComponent, AutocompleteResponseModel } from './../../../../component/google-places/google-places.component';
import { TrackingFormComponent } from './../../../project-tracking/tracking-form/tracking-form.component';
import { TagModel } from './../../../../models/TagModel';
import { IDropdownSettings, MultiSelectComponent } from 'ng-multiselect-dropdown';
import { OrganizationModel, DatosPagosIglesiaModel, DatosProyectoIglesiaModel } from './../../../../models/OrganizationModel';
import { ToastType } from './../../../../login/ToastTypes';
import { Component, OnInit, ViewChild, NgZone, ElementRef } from '@angular/core';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { OrganizationFormComponent } from '../organization-form/organization-form.component';
import * as moment from 'moment';
import { NotesHomeComponent } from '../../notes/notes-home/notes-home.component';
import { MatSlideToggle } from '@angular/material';
import { ContactsFormComponent } from '../../contacts/contacts-form/contacts-form.component';
import { User } from 'src/app/interfaces/user';
import { OrganizationContactInfoFormComponent } from '../../../../component/contact-info/organization-contact-info-form/organization-contact-info-form.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ChartComponent } from 'src/app/pages/project-tracking/chart/chart.component';
import { HtmlEditorService, ToolbarService, QuickToolbarService, ImageService, LinkService, CountService } from '@syncfusion/ej2-angular-richtexteditor';

@Component({
  selector: 'app-organization-home',
  templateUrl: './organization-home.component.html',
  styleUrls: ['./organization-home.component.scss'],
  providers: [
    HtmlEditorService,
    ToolbarService,
    ImageService,
    LinkService,
    CountService
  ]
})
export class OrganizationHomeComponent implements OnInit {

  @ViewChild(`notes_form`) note_form: NotesHomeComponent;
  @ViewChild('organization_form') orgForm: OrganizationFormComponent
  @ViewChild('inputLogo') private inputLogo;
  @ViewChild(`contact_info`) contact_info: OrganizationContactInfoFormComponent;
  @ViewChild(`project_progress_chart`) project_progress_chart: ChartComponent;
  @ViewChild(`project_tracking_form`) project_tracking_form: TrackingFormComponent;
  currentUser: User;

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  // Datatables
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: 'Blfrtip',
    lengthMenu: [10, 25, 50, 100, 250, 500],
    buttons: [
      { extend: 'copy', className: 'btn btn-outline-citric btn-sm' },
      { extend: 'print', className: 'btn btn-outline-citric btn-sm' },
      { extend: 'csv', className: 'btn btn-outline-citric btn-sm' },
    ]
  };

  currentTabIndex: number = 0

  show_loader = true;
  show_form: boolean = false;
  hide_notes_form: boolean = false;
  iglesias: any[];
  iglesias_original: any[];
  filtered_iglesias: any[] = [];
  canUseLoader: boolean = false;

  serverBusy: boolean = false;
  show_test_or_inactive: boolean = false;

  summary: {
    tipoServicio: string,
    eliminadas: number,
    activas: number,
    precioMesActivas?: number,
    precioMesEliminadas?: number
  }[] = [];

  states: any[] = [];
  pins: { lat: number, lng: number, image?: string, title?: string }[] = [];
  user: any;

  nota: any = {};

  selectTagsOptions: IDropdownSettings = {
    singleSelection: false,
    idField: 'idCatalogoTag',
    textField: 'nombre',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  selectUsersOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idUsuarioSistema',
    textField: 'fullName',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  selectContactsOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idAgendaContactoIglesia',
    textField: 'fullName',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  selectPlanOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idCatalogoPlan',
    textField: 'nombre',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  selectServiceTypeOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idTipoServicio',
    textField: 'nombre',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  selectOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idIglesia',
    textField: 'Nombre',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  selectStateOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'state',
    textField: 'state',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  dropdowns = {
    cupones: [{
      idCupon: 0,
      descripcion: '--Select One--'
    }],
    plans: [],
    payment_types: [],
    users: [],
    languages: [],
    service_types: [],
    tags: [],
    contacts: [],
  };

  filtersForm: FormGroup = this.form_builder.group({
    idOrganization: new FormControl(0),
    idPlanType: new FormControl(0),
    managed_by: new FormControl(0),
    idContacto: new FormControl(0),
    idTipoServicio: new FormControl(0),
    state: new FormControl('')
  });

  /***** TRADUCCIONES ******/
  translatesIglesias: {
    Iglesias_Error_ObtenerIglesias,
    Iglesias_Error_RecargarIglesias,
    Iglesias_Manage,
    Iglesias_Ver,
    Iglesias_Editar,
    Iglesias_Contactos,
    Iglesias_Notas,
    Iglesias_Eliminar,
    Iglesias_Error_Recargar_Iglesias
  };

  constructor(
    private organizationService: OrganizationService,
    private translate: TranslateService,
    private userService: UserService,
    private fus: FileUploadService,
    private router: Router,
    private modal: NgxSmartModalService,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private form_builder: FormBuilder
  ) {
    this.currentUser = this.userService.getCurrentUser();
    this.translate.get([
      'Iglesias_Error_ObtenerIglesias',
      'Iglesias_Error_RecargarIglesias',
      'Iglesias_Manage',
      'Iglesias_Ver',
      'Iglesias_Editar',
      'Iglesias_Contactos',
      'Iglesias_Notas',
      'Iglesias_Eliminar'
    ]).subscribe(values => {
      this.translatesIglesias = values;
      this.getIglesias();
    });
  }

  ngOnInit() {
    this.getDropdowns();
  }

  selectIglesia(iglesia: any) {
    console.log(iglesia);

    this.user = this.userService.getCurrentUser();
    this.user.idIglesia = iglesia.idIglesia;
    this.user.iglesia = iglesia.Nombre;
    this.user.topic = iglesia.topic;
    this.user.idTipoServicio = iglesia.idTipoServicio;
    this.user.service_type_picture = iglesia.service_type_picture;
    if (iglesia.Logo) {
      this.user.logoPic = this.fus.cleanPhotoUrl(iglesia.Logo);
    } else {
      this.user.logoPic = undefined;
    }
    const userStr: string = JSON.stringify(this.user);
    localStorage.setItem('currentUser', userStr);
    this.router.navigate(['dashboard']);

  }

  getIglesias() {
    this.show_loader = true;
    this.organizationService.getIglesiasWithTagsAndContacts(this.show_test_or_inactive)
      .subscribe((data: any) => {
        if (data.iglesias) {
          this.iglesias = data.iglesias;
          this.states = data.states;
          // this.summary = data.summary;
          // this.iglesias_original = this.iglesias;
          // this.canUseLoader = false;
        } else {
          this.organizationService.api.showToast(
            this.translatesIglesias.Iglesias_Error_Recargar_Iglesias ? this.translatesIglesias.Iglesias_Error_Recargar_Iglesias : 'Please update...',
            ToastType.error);
          // this.canUseLoader = true;
        }
        this.show_loader = false;

        // Open tracking form if params given
        this.openTrackingForm()
      }, err => {
        console.error(err);
        this.organizationService.api.showToast(
          this.translatesIglesias.Iglesias_Error_Recargar_Iglesias,
          ToastType.error);
        this.canUseLoader = true;
        // this.show_loader = false;
      }, () => {
        // this.dtTrigger.next();
      });
  }

  goToAddOrganization(organization_form: OrganizationFormComponent) {
    this.show_loader = true;
    // this.modal.getModal('formModal').open();
    this.show_form = true;
    organization_form.getDropdowns().then(resolved => {
      console.log(resolved);

      this.show_loader = false;
      organization_form.init_map = false;
      organization_form.organization = new OrganizationModel();
      if (organization_form.custom_select_country) {
        organization_form.custom_select_country.idOrganization = undefined;
        organization_form.custom_select_country.preselected_country_code = undefined;
        organization_form.custom_select_country.initial_item = undefined;
        organization_form.custom_select_country.ngOnInit();
      }
      // organization_form.isEdit = false;
      organization_form.ngOnInit();
    });
    this.hide_notes_form = true;
  }

  openEditModal(item: OrganizationModel, organization_form: OrganizationFormComponent) {
    this.show_loader = true;
    this.show_form = true;
    this.hide_notes_form = false;
    organization_form.init_map = false;
    this.organizationService.getIglesiaDetail(item)
      .subscribe((response: any) => {
        organization_form.organization = Object.assign({}, response.iglesia);
        if (!organization_form.organization.datosProyectoIglesia) {
          organization_form.organization.datosProyectoIglesia = new DatosProyectoIglesiaModel();
        }
        console.log(organization_form.organization);
        if (organization_form.custom_select_country) {
          organization_form.custom_select_country.idOrganization = organization_form.organization.idIglesia;
          if (organization_form.organization.country_code) {
            organization_form.custom_select_country.preselected_country_code = organization_form.organization.country_code;
            organization_form.custom_select_country.ngOnInit();
          } else {
            organization_form.custom_select_country.preselected_country_code = undefined;
            organization_form.custom_select_country.getCountryForOrganization();
          }
        }
        const start_date = moment(organization_form.organization.datosProyectoIglesia.fechaInicioProyecto).utc().format('YYYY-MM-DD');
        const buy_date = moment(organization_form.organization.datosProyectoIglesia.fechaCompraDominio).utc().format('YYYY-MM-DD');
        organization_form.organization.datosProyectoIglesia.fechaInicioProyecto = start_date;
        organization_form.organization.datosProyectoIglesia.fechaCompraDominio = buy_date;
        if (!organization_form.organization.datosPagosIglesia) {
          organization_form.organization.datosPagosIglesia = new DatosPagosIglesiaModel();
          organization_form.organization.datosPagosIglesia.idCatalogoPlan = response.iglesia.idCatalogoPlan;
        }
        organization_form.isEdit = true;
        var nombre_iglesias = this.filtered_iglesias.filter((value => value.idIglesia != item.idIglesia))
        nombre_iglesias = nombre_iglesias.map((value) => {
          return { Nombre: value.Nombre.toLowerCase().replace(/\s/g, '') }
        })
        organization_form.filtered_iglesias = nombre_iglesias
        //console.log(excluded_iglesias)
        organization_form.getDropdowns().then(resolved => {
          this.show_loader = false;
          organization_form.ngOnInit();
          setTimeout(() => {
            console.log('project_progress_chart', this.project_progress_chart);
            if (this.project_progress_chart) {
              console.log('project_progress_chart', this.project_progress_chart);
              this.project_progress_chart.idIglesia = item.idIglesia;
              this.project_progress_chart.ngOnInit();
            }
            console.log('project_tracking_form', this.project_tracking_form);
            if (this.project_tracking_form) {
              this.project_tracking_form.idIglesia = item.idIglesia;
              this.project_tracking_form.iglesia = item;
              this.project_tracking_form.ngOnInit();
            }
          }, 350);
        });
        if (this.note_form) {
          console.log('notes_form', this.note_form);
          this.note_form.idIglesia = item.idIglesia;
          this.note_form.loadNotes();
        }
        if (this.contact_info) {
          console.log('contact_info', this.contact_info);
          this.contact_info.idIglesia = item.idIglesia;
          this.contact_info.loadNotes();
        }
      }, error => {
        console.error(error);
        this.show_loader = false;
        this.organizationService.api.showToast(`Error getting organization info.`, ToastType.error);
      });
  }

  openTrackingForm() {
    console.log(this.route.snapshot.queryParams);
    const idIglesia = this.route.snapshot.queryParams['idIglesia']
    const iglesia = this.iglesias.find(i => i.idIglesia == idIglesia)
    if (idIglesia) {
      this.openEditModal(iglesia, this.orgForm)
    }
  }

  onModalDidDismiss(response?) {
    // this.modal.getModal('formModal').close();
    if (response) {
      this.searchWithFilters();
    }
    this.show_form = false;
    this.show_loader = false;
    this.hide_notes_form = false;
  }

  resetTable() {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
  }

  toggleAll(event: MatSlideToggle) {
    console.log(this.show_test_or_inactive);
    // this.resetTable();
    this.getIglesias();
    this.show_loader = false;
  }

  goToContacts(iglesia) {
    // this.router.navigate(['/admin/contacts'], {
    //   queryParams: {
    //     idIglesia: iglesia.idIglesia
    //   }
    // });
    const url = this.router.serializeUrl(
      this.router.createUrlTree([`/admin/contacts`], {
        queryParams: {
          idIglesia: iglesia.idIglesia
        }
      })
    );

    window.open(url, '_blank');
  }

  toggleEditableField(iglesia: any, fieldName: string) {
    this.toggleAllEditableFields()
    iglesia._editableField = fieldName;
    if (fieldName === 'nombre') {
      const tipos_servicios = this.dropdowns.service_types.filter(x => iglesia.idTipoServicio === x.idTipoServicio);
      iglesia.tipos_servicios = tipos_servicios;
      console.log(iglesia);

    } else {
      iglesia.project_manager_init = false;
    }
    if (fieldName === 'project_manager') {
      if (!iglesia.project_manager_init) {

        const users = this.dropdowns.users.filter(x => iglesia.idUsuarioSistema === x.idUsuarioSistema);
        iglesia.datosProyectoIglesia = {
          users,
          idUsuarioSistema: iglesia.idUsuarioSistema,
        }
        iglesia.project_manager_init = true;
      }
    } else {
      iglesia.project_manager_init = false;
    }
    if (fieldName === 'plan') {
      if (!iglesia.plan_init) {

        const plans = this.dropdowns.plans.filter(x => iglesia.idCatalogoPlan === x.idCatalogoPlan);
        iglesia.datosPagosIglesia = {
          plans,
          idCatalogoPlan: iglesia.idCatalogoPlan,
        }
        iglesia.plan_init = true;
      }
    } else {
      iglesia.plan_init = false;
    }
  }

  toggleAllEditableFields() {
    if (this.iglesias) {
      this.iglesias.map((act) => (act._editableField = undefined))
    }
  }

  loaded() {
    console.log('Loaded');

  }

  fixTags(iglesia: any, event: MultiSelectComponent) {
    const array = [];
    event.selectedItems.forEach(element => {
      array.push(element.id);
    });
    (iglesia.tags as TagModel).Tags = array;
  }

  getDropdowns() {
    return new Promise((resolve, reject) => {
      this.show_loader = true;

      const promises: Promise<any>[] = [];
      promises.push(this.organizationService.getCoupons().toPromise());
      promises.push(this.organizationService.getPlans().toPromise());
      promises.push(this.organizationService.getPaymentTypes().toPromise());
      promises.push(this.organizationService.getUsers().toPromise());
      promises.push(this.organizationService.getLenguajes().toPromise());
      promises.push(this.organizationService.getServiceTypes().toPromise());
      promises.push(this.organizationService.getTags().toPromise());
      promises.push(this.organizationService.getContacts().toPromise());

      Promise.all(promises).then(data => {
        // 0 - Coupons
        if (data[0].msg.Code === 200) {
          this.dropdowns.cupones = data[0].coupons;
        } else {
          this.dropdowns.cupones = [];
        }
        const cupon = {
          idCupon: 0,
          descripcion: ' -- Select one -- '
        };
        // this.dropdowns.cupones.unshift(cupon);
        // 1 - Plans
        if (data[1].msg.Code === 200) {
          this.dropdowns.plans = data[1].plans;
        } else {
          this.dropdowns.plans = [];
        }
        const plan = {
          idCatalogoPlan: 0,
          nombre: ' -- Select one -- '
        };
        // this.dropdowns.plans.unshift(plan);
        // 2 - Payment Types
        if (data[2].msg.Code === 200) {
          this.dropdowns.payment_types = data[2].payment_types;
        } else {
          this.dropdowns.payment_types = [];
        }
        const payment_type = {
          idTipoDePago: 0,
          descripcion: ' -- Select one -- '
        };
        // this.dropdowns.payment_types.unshift(payment_type);

        // 3 - Users
        if (data[3].msg.Code === 200) {
          this.dropdowns.users = data[3].users;
        } else {
          this.dropdowns.users = [];
        }
        const user = {
          idUserType: 0,
          fullName: '-- Select One --'
        };
        // this.dropdowns.users.unshift(user);

        // 4 - Languages
        if (data[4].msg.Code === 200) {
          this.dropdowns.languages = data[4].lenguajes;
        } else {
          this.dropdowns.languages = [];
        }
        const language = {
          idIdioma: 0,
          Nombre: '-- Select One --'
        };
        this.dropdowns.languages.unshift(language);

        // 5 - Service Types
        if (data[5].msg.Code === 200) {
          this.dropdowns.service_types = data[5].service_types;
        } else {
          this.dropdowns.service_types = [];
        }
        const service_type = {
          idTipoServicio: 0,
          nombre: '-- Select One --'
        };
        // this.dropdowns.service_types.unshift(service_type);

        // 6 - Service Types
        if (data[6].msg.Code === 200) {
          this.dropdowns.tags = data[6].tags;
        } else {
          this.dropdowns.tags = [];
        }
        const tag = {
          idCatalogoTag: 0,
          nombre: '-- Select One --'
        };

        // 6 - Service Types
        if (data[7].msg.Code === 200) {
          this.dropdowns.contacts = data[7].contactos;
          this.dropdowns.contacts.map(x => x.fullName = `${x.nombre} ${x.apellido}`)
        } else {
          this.dropdowns.contacts = [];
        }
        // this.dropdowns.tags.unshift(tag);

        // if (this.isEdit) {
        //   setTimeout(() => {
        //     this.ngZone.run(() => {
        //       const service = this.multi_select_type_of_service._data.filter(x => x.id === this.organization.idTipoServicio);
        //       this.basicInfoForm.get('type_of_service').setValue(service);
        //       this.multi_select_type_of_service.selectedItems = service;
        //       const tags = this.multi_select_tags._data.filter(x => (this.organization.tags as TagModel).Tags.includes((x.id as number)));
        //       this.multi_select_tags.selectedItems = tags;
        //       this.fixTags(this.multi_select_tags);

        //       const plans = this.multi_select_plan._data.filter(x => this.organization.datosPagosIglesia.idCatalogoPlan === x.id);
        //       this.paymentInfoForm.get('idCatalogoPlan').setValue(plans);
        //       this.multi_select_plan.selectedItems = plans;

        //       const payment_types = this.multi_select_payment_type._data.filter(x => this.organization.datosPagosIglesia.IdTipoDePago === x.id);
        //       this.paymentInfoForm.get('idTipoPago').setValue(payment_types);
        //       this.multi_select_payment_type.selectedItems = payment_types;

        //       const coupons = this.multi_select_coupon._data.filter(x => this.organization.cuponesIglesias.idCupon === x.id);
        //       this.multi_select_coupon.selectedItems = coupons;

        //       const users = this.multi_select_users._data.filter(x => this.organization.datosProyectoIglesia.idUsuarioSistema === x.id);
        //       this.projectInfoForm.get('idUsuarioSistema').setValue(users);
        //       this.multi_select_users.selectedItems = users;
        //       if (!this.organization.datosProyectoIglesia) {
        //         this.organization.datosProyectoIglesia = new DatosProyectoIglesiaModel();
        //       }
        //     });
        //     this.show_loader = false;
        //   });
        // }
        this.show_loader = false;
        return resolve(true);
      }, error => {
        console.error(error);
        this.show_loader = false;
        return reject(false);
      });
    });
  }

  addContact(iglesia: any, contact_form: ContactsFormComponent) {
    this.modal.get('contacts_modal').open();
    // this.show_form = true;
    contact_form.contact = undefined;
    contact_form.iglesia = iglesia;
    contact_form.ngOnInit();
  }

  displayNotePopup(note: any) {
    if (note.user_created_by) {
      this.modal.get('note_modal').open();
      // this.show_form = true;
      this.nota = note;
    }
  }

  dismissContactForm(response) {
    this.modal.get('contacts_modal').close();
    if (response) {
      this.resetTable();
      this.searchWithFilters();
    }
    // this.show_form = false;
  }

  dismissNote() {
    this.modal.get('note_modal').close();
    this.nota = {};
  }

  updateLogo(iglesia) {
    this.inputLogo.nativeElement.onchange = (event: {
      target: { files: File[] };
    }) => {
      if (event.target.files.length > 0) {
        const confirmation = confirm(
          `You want to update this organization's logo?`
        );
        if (confirmation) {
          const photo: File = event.target.files[0];
          this.uploadLogo(iglesia, photo);
        }
      }
    };
    (this.inputLogo as ElementRef).nativeElement.click();
  }

  uploadLogo(iglesia, file: File) {
    // this.uploadingLogo = true;

    const iglesia_temp = new OrganizationModel();
    iglesia_temp.idIglesia = iglesia.idIglesia;
    iglesia_temp.topic = iglesia.topic;
    iglesia_temp.Nombre = iglesia.Nombre;
    iglesia_temp.datosPagosIglesia = null;
    iglesia_temp.datosProyectoIglesia = null;
    iglesia_temp.cuponesIglesias = null;
    iglesia_temp.idTipoServicio = iglesia.idTipoServicio;

    const indexPoint = (file.name as string).lastIndexOf('.');
    const extension = (file.name as string).substring(indexPoint);
    const ticks = (
      Number(String(Math.random()).slice(2)) +
      Date.now() +
      Math.round(performance.now())
    ).toString(36);
    const myUniqueFileName = `organization_logo_${iglesia.idIglesia}_${ticks}${extension}`;

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
                this.resetTable();
                this.searchWithFilters();
              });
          });
      });
  }

  updateIglesia(iglesia) {
    let managed_by;
    if (iglesia.datosProyectoIglesia) {
      managed_by = iglesia.datosProyectoIglesia.idUsuarioSistema
    }
    this.show_loader = true;
    const iglesia_temp = new OrganizationModel();
    iglesia_temp.idIglesia = iglesia.idIglesia;
    iglesia_temp.topic = iglesia.topic;
    iglesia_temp.Nombre = iglesia.Nombre;
    iglesia_temp.datosPagosIglesia = null;
    iglesia_temp.datosProyectoIglesia = null;
    iglesia_temp.cuponesIglesias = null;
    iglesia_temp.idTipoServicio = iglesia.idTipoServicio;
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
        organization.Logo = this.fus.cleanPhotoUrl(iglesia.Logo);
        if (iglesia._editableField === 'nombre') {
          organization.Nombre = iglesia.Nombre;
          organization.idTipoServicio = iglesia.tipos_servicios[0].idTipoServicio;
        }
        if (iglesia._editableField === 'project_manager' && managed_by) {
          organization.datosProyectoIglesia.idUsuarioSistema = managed_by;
        }
        if (iglesia._editableField === 'plan') {
          organization.datosPagosIglesia.idCatalogoPlan = iglesia.datosPagosIglesia.idCatalogoPlan;
          organization.idCatalogoPlan = iglesia.datosPagosIglesia.idCatalogoPlan;
        }
        if (iglesia._editableField === 'tags') {
          organization.tags = {
            Tags: iglesia.tags.Tags
          };
        }

        this.organizationService
          .saveIglesia(organization)
          .subscribe((res: any) => {
            // this.resetTable();
            this.searchWithFilters();
          });
      });
  }

  afterLastMonth(fechaCreacion) {
    return moment(fechaCreacion).isBefore(new Date(), 'month');
  }

  searchWithFilters() {
    this.resetTable();
    console.log(this.filtersForm);

    const org_array: any[] = this.filtersForm.get('idOrganization').value;
    let idOrganization = 0;
    if (this.currentUser.isSuperUser) {
      if (org_array.length > 0) {
        idOrganization = Number(JSON.parse(org_array[0].idIglesia));
      }
    } else {
      idOrganization = this.currentUser.idIglesia;
    }
    const org_plan: any[] = this.filtersForm.get('idPlanType').value;
    let idPlan = 0;
    if (this.currentUser.isSuperUser) {
      if (org_plan.length > 0) {
        idPlan = Number(JSON.parse(org_plan[0].idCatalogoPlan));
      }
    } else {
      idPlan = 0;
    }
    const managed_arr: any[] = this.filtersForm.get('managed_by').value;
    let idManagedBy = 0;
    if (this.currentUser.isSuperUser) {
      if (managed_arr.length > 0) {
        idManagedBy = Number(JSON.parse(managed_arr[0].idUsuarioSistema));
      }
    } else {
      idManagedBy = 0;
    }
    const contact_arr: any[] = this.filtersForm.get('idContacto').value;
    let idContact = 0;
    if (this.currentUser.isSuperUser) {
      if (contact_arr.length > 0) {
        idContact = Number(JSON.parse(contact_arr[0].idAgendaContactoIglesia));
      }
    } else {
      idContact = 0;
    }
    const service_arr: any[] = this.filtersForm.get('idTipoServicio').value;
    let idServiceType = 0;
    if (this.currentUser.isSuperUser) {
      if (service_arr.length > 0) {
        idServiceType = Number(JSON.parse(service_arr[0].idTipoServicio));
      }
    } else {
      idServiceType = 0;
    }

    const state_arr: any[] = this.filtersForm.get('state').value;
    let state = '';
    if (this.currentUser.isSuperUser) {
      if (state_arr.length > 0) {
        state = state_arr[0].state;
      }
    } else {
      state = '';
    }

    this.show_loader = true;
    const payload = {
      idOrganization,
      idPlan,
      idManagedBy,
      idContact,
      idServiceType,
      show_test: this.show_test_or_inactive,
      state
    }
    console.log(payload);
    this.organizationService.getIglesiasWithTagsAndContactsWithFilter(payload)
      .subscribe((data: any) => {
        if (data.iglesias) {
          this.filtered_iglesias = data.iglesias;
          this.pins = [];
          this.filtered_iglesias.forEach(async org => {
            org.full_address = GoogleAddressComponent.formatFullAddress(org, ['Calle', 'Ciudad', 'Provincia', 'ZIP', 'country']);
            if (org.idIglesia && (!org.lat || !org.lng)) {
              const pin_info = await GoogleAddressComponent.convert(org.full_address).catch(error => {
                return error;
              });
              if (JSON.stringify(pin_info) !== '{}') {
                const address = pin_info.address;
                address.idIglesia = org.idIglesia;
                org.lat = address.lat;
                org.lng = address.lng;
                org.country = address.country;
                this.pins.push({
                  lat: org.lat,
                  lng: org.lng,
                  title: org.Nombre
                });
                // image: org.Logo,
                this.organizationService.api
                  .post(`iglesias/updateOrganizationAddress`, address)
                  .subscribe(response => {
                  });
              }
            } else {
              console.log(org);
              this.pins.push({
                lat: org.lat,
                lng: org.lng,
                title: org.Nombre
              });
              // image: org.Logo,
            }
          });
          this.summary = data.summary;
          this.iglesias_original = this.filtered_iglesias;
          this.canUseLoader = false;
        } else {
          this.organizationService.api.showToast(
            this.translatesIglesias.Iglesias_Error_Recargar_Iglesias ? this.translatesIglesias.Iglesias_Error_Recargar_Iglesias : 'Please update...',
            ToastType.error);
          this.canUseLoader = true;
        }
        this.show_loader = false;

        // Open tracking form if params given
        this.openTrackingForm()
      }, err => {
        console.error(err);
        this.organizationService.api.showToast(
          this.translatesIglesias.Iglesias_Error_Recargar_Iglesias,
          ToastType.error);
        this.canUseLoader = true;
        this.show_loader = false;
      }, () => {
        this.dtTrigger.next();
      });
  }

  public getAddress(item: AutocompleteResponseModel, iglesia: OrganizationModel) {
    if (item) {
      if (item.address) {
        iglesia.address = item.address;
      }
    }
  }

  saveAddress(iglesia) {
    const address = iglesia.address;
    address.idIglesia = iglesia.idIglesia;
    this.organizationService.api
      .post(`iglesias/updateOrganizationAddress`, address)
      .subscribe(response => {
        iglesia.lat = address.lat;
        iglesia.lng = address.lng;
        iglesia.country = address.country;
        iglesia.address = undefined;
        this.organizationService.api.showToast(`Addrss updated successfully`, ToastType.success);
        this.toggleAllEditableFields();
      });
  }
}

