import { AutocompleteResponseModel, GoogleAddressComponent } from './../../../../component/google-places/google-places.component';
import { ApiService } from 'src/app/services/api.service';
import { Observable, observable } from 'rxjs';
import { ToastType } from './../../../../login/ToastTypes';
import { TagModel } from './../../../../models/TagModel';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit, Output, EventEmitter, ViewChild, NgZone, Input } from '@angular/core';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { IDropdownSettings, MultiSelectComponent } from 'ng-multiselect-dropdown';
import { OrganizationModel, DatosProyectoIglesiaModel } from 'src/app/models/OrganizationModel';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { MatHorizontalStepper } from '@angular/material';
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { SelectCountryComponent } from 'src/app/component/custom-select-country/custom-select-country.component';
@Component({
  selector: 'app-organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss']
})
export class OrganizationFormComponent implements OnInit {

  // tslint:disable-next-line: no-output-on-prefix
  @Output() onDismiss = new EventEmitter();
  @ViewChild('stepper') stepper: MatHorizontalStepper;
  @ViewChild('multi_select_type_of_service') multi_select_type_of_service: MultiSelectComponent;
  @ViewChild('multi_select_tags') multi_select_tags: MultiSelectComponent;
  @ViewChild('multi_select_plan') multi_select_plan: MultiSelectComponent;
  @ViewChild('multi_select_payment_type') multi_select_payment_type: MultiSelectComponent;
  @ViewChild('multi_select_coupon') multi_select_coupon: MultiSelectComponent;
  @ViewChild('multi_select_users') multi_select_users: MultiSelectComponent;
  @ViewChild('custom_select_country') custom_select_country: SelectCountryComponent;
  @Input('show_pipeline') show_pipeline: boolean = true;

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
    organization_categories: [],
    denominations: []
  };

  organization: OrganizationModel = new OrganizationModel();
  isEdit: boolean = false;
  serverBusy: boolean = false;
  show_loader: boolean = false;
  filtered_iglesias: any[] = [];
  searched_iglesias: any[] = []
  stripe: Stripe;
  stripe_info = {
    public_key: "",
    secret_key: "",
    valid_public_key: 0,
    valid_secret_key: 0
  }
  basicInfoForm: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    city: ['', Validators.required],
    location: ['', Validators.required],
    type_of_service: new FormControl('', [
      Validators.required,
      Validators.pattern(/[^0]+/),
      Validators.min(0)
    ]),
    add_pipeline: [false],
    pipeline_form: new FormGroup({
      nombre: new FormControl('',),
      idIglesia: new FormControl(undefined),
      idAgendaContactoIglesia: new FormControl(undefined),
      tags: new FormControl([]),
      idEstadoClienteVenta: new FormControl(undefined, []),
      valorExpectativo: new FormControl(undefined, []),
      descripcion: new FormControl('')
    }),
    country_code: new FormControl('', [Validators.required]),
    is_featured: [false],
    site_v2: new FormControl(false),
    site_v2_url: new FormControl(''),
    denominations: new FormControl([]),
    categories: new FormControl([])
  });

  // Step 2
  paymentInfoForm: FormGroup = this.formBuilder.group({
    idCatalogoPlan: new FormControl('', [
      Validators.required,
      Validators.pattern(/[^0]+/),
      Validators.min(0)
    ]),
    idTipoPago: new FormControl('', [
      Validators.required,
      Validators.pattern(/[^0]+/),
      Validators.min(0)
    ]),
  });

  // Step 3
  projectInfoForm: FormGroup = this.formBuilder.group({
    idUsuarioSistema: new FormControl('', [
      Validators.required,
      Validators.pattern(/[^0]+/),
      Validators.min(0)
    ]),
  });


  stripeInfoForm: FormGroup = this.formBuilder.group({
    idUsuarioSistema: new FormControl('', [
      Validators.required,
      Validators.pattern(/[^0]+/),
      Validators.min(0)
    ]),
  });

  // Options
  selectServiceTypeOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idTipoServicio',
    textField: 'nombre',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  selectTagsOptions: IDropdownSettings = {
    singleSelection: false,
    idField: 'idCatalogoTag',
    textField: 'nombre',
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

  selectPaymentOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idTipoDePago',
    textField: 'descripcion',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };

  selectCouponOptions: IDropdownSettings = {
    singleSelection: true,
    idField: 'idCupon',
    textField: 'descripcion',
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

  selectGeneralOptions: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  };


  currentUser: User;
  providedTokens = {
    hasPublicKey: false,
    hasSecretKey: false
  };

  init_map: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private organizationService: OrganizationService,
    private userService: UserService,
    private ngZone: NgZone,
    private api: ApiService
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  async ngOnInit() {
    // this.getDropdowns();
    await this.getCategories();
    await this.getDenominations();
    setTimeout(() => {
      this.stepper.selectedIndex = 0;
    });
    this.organization.full_address = this.formatFullAddress(this.organization);
    this.basicInfoForm.get('city').setValue(this.organization.Ciudad);
    this.basicInfoForm.get('location').setValue(this.organization.full_address);
    this.basicInfoForm.get('country_code').setValue(this.organization.country_code);
    this.basicInfoForm.get('site_v2').setValue(this.organization.site_v2);
    if (this.dropdowns.organization_categories.length > 0) {
      if(this.organization.categories_ids){
        this.basicInfoForm.get('categories').setValue(this.dropdowns.organization_categories.filter(c => this.organization.categories_ids.includes(c.id)));
      }
    }
    if (this.dropdowns.denominations.length > 0) {
      if(this.organization.denomination_ids){
        this.basicInfoForm.get('denominations').setValue(this.dropdowns.denominations.filter(c => this.organization.denomination_ids.includes(c.id)));
      }
    }
    if (this.organization.site_v2) {
      const control = new FormControl(this.organization.site_v2_url, [Validators.required])
      this.basicInfoForm.setControl('site_v2_url', control);
    } else {
      const control = new FormControl('', [])
      this.basicInfoForm.setControl('site_v2_url', control);
    }
    if (this.organization.idIglesia && (!this.organization.lat || !this.organization.lng)) {
      const pin_info = await GoogleAddressComponent.convert(this.organization.full_address).catch(error => {
        console.error(error);
        return error;
      });
      if (JSON.stringify(pin_info) !== '{}') {
        const address = pin_info.address;
        address.idIglesia = this.organization.idIglesia;
        this.api
          .post(`iglesias/updateOrganizationAddress`, address)
          .subscribe(response => {
          });
      }
    }
    this.basicInfoForm.get('is_featured').setValue(this.organization.is_featured);
    if (this.organization.idIglesia && this.organization.idIglesia != 0) {
      this.api.get('iglesias/getIglesiasProvidedTokens', { idIglesia: this.organization.idIglesia })
        .subscribe(
          (data: any) => {
            if (data.iglesia.hasPublicKey == 0) {
              this.providedTokens.hasPublicKey = undefined
            } else {
              this.providedTokens.hasPublicKey = true
            }
            if (data.iglesia.hasSecretKey == 0) {
              this.providedTokens.hasSecretKey = undefined
            } else {
              this.providedTokens.hasSecretKey = true
            }
          },
          (err) => {
            console.error(err);
          }
        );
    }
    setTimeout(() => {
      this.init_map = true;
    }, 100);
  }
  async getCategories() {
    const response: any = await this.api.get(`organization_categories`, {}).toPromise().catch(error => {
      console.error(error);
      return;
    });
    console.log(response);

    if (response) {
      this.dropdowns.organization_categories = response;
    }
  }
  async getDenominations() {
    const response: any = await this.api.get(`denominations`, {}).toPromise().catch(error => {
      console.error(error);
      return;
    });
    console.log(response);
    if (response) {
      this.dropdowns.denominations = response;
    }
  }
  searchInterest() {
    if (this.organization.Nombre) {
      const nombre = this.transformName(this.organization.Nombre)
      if (nombre.length != 0) {
        setTimeout(() => {
          this.searched_iglesias = this.transformSearch(this.filtered_iglesias, { Nombre: nombre })
        }, 2000);
      } else {
        this.searched_iglesias = []
      }
    }
  }
  transformName(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }
  transformSearch(items: any, filter: any, defaultFilter?: boolean): any {
    if (!filter) {
      return items;
    }

    if (!Array.isArray(items)) {
      return items;
    }

    if (filter && Array.isArray(items)) {
      let filterKeys = Object.keys(filter);

      if (defaultFilter) {
        return items.filter(item =>
          filterKeys.reduce((x, keyName) =>
            (x && new RegExp(filter[keyName], 'gi').test(item[keyName])) || filter[keyName] == "", true));
      }
      else {
        return items.filter(item => {
          return filterKeys.some((keyName) => {
            return new RegExp(filter[keyName], 'gi').test(item[keyName]) || filter[keyName] == "";
          });
        });
      }
    }
  }
  async initializeStripe() {
    if (this.stripe_info.public_key.startsWith("pk_live_")) {
      this.stripe =
        await loadStripe(this.stripe_info.public_key)
      setTimeout(() => {
        this.stripe.createToken('pii', { personal_id_number: 'test' })
          .then(result => {
            if (result.token) {
              this.stripe_info.valid_public_key = 1
              this.api.showToast('Valid public API Key', ToastType.success);
            }
            // public key is valid :o)
            else {
              console.error("error")
              this.stripe_info.valid_public_key = 2
              this.api.showToast(`Invalid public API Key`, ToastType.error)
            }
            // nope !
          })
      }, 300)
    }
  }
  async checkSecretKey() {
    if (this.stripe_info.secret_key.startsWith("sk_live_")) {
      this.api
        .post(`chat/check_stripe_secret_key`, { key: this.stripe_info.secret_key })
        .subscribe(
          (data: any) => {
            this.stripe_info.valid_secret_key = 1
            this.api.showToast('Valid secret API Key', ToastType.success);
          },
          (err) => {
            console.error(err)
            this.stripe_info.valid_secret_key = 2
            this.api.showToast(`Invalid secret API Key`, ToastType.error)
          }
        );
    }
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

        if (this.isEdit) {
          setTimeout(() => {
            this.ngZone.run(() => {
              const service = this.multi_select_type_of_service._data.filter(x => x.id === this.organization.idTipoServicio);
              this.basicInfoForm.get('type_of_service').setValue(service);
              this.multi_select_type_of_service.selectedItems = service;
              const tags = this.multi_select_tags._data.filter(x => (this.organization.tags as TagModel).Tags.includes((x.id as number)));
              this.multi_select_tags.selectedItems = tags;
              this.fixTags(this.multi_select_tags);

              const plans = this.multi_select_plan._data.filter(x => this.organization.datosPagosIglesia.idCatalogoPlan === x.id);
              this.paymentInfoForm.get('idCatalogoPlan').setValue(plans);
              this.multi_select_plan.selectedItems = plans;

              const payment_types = this.multi_select_payment_type._data.filter(x => this.organization.datosPagosIglesia.IdTipoDePago === x.id);
              this.paymentInfoForm.get('idTipoPago').setValue(payment_types);
              this.multi_select_payment_type.selectedItems = payment_types;

              const coupons = this.multi_select_coupon._data.filter(x => this.organization.cuponesIglesias.idCupon === x.id);
              this.multi_select_coupon.selectedItems = coupons;

              const users = this.multi_select_users._data.filter(x => this.organization.datosProyectoIglesia.idUsuarioSistema === x.id);
              this.projectInfoForm.get('idUsuarioSistema').setValue(users);
              this.multi_select_users.selectedItems = users;
              if (!this.organization.datosProyectoIglesia) {
                this.organization.datosProyectoIglesia = new DatosProyectoIglesiaModel();
              }
            });
            this.show_loader = false;
          });
        }
        this.show_loader = false;
        return resolve(true);
      }, error => {
        console.error(error);
        this.show_loader = false;
        return reject(false);
      });
    });
  }

  fixId(field_name, event) {
    this.organization[field_name] = event[field_name];
    if (field_name === 'idTipoServicio' && event[field_name] === 0) {
      this.basicInfoForm.get('type_of_service').setValue(0);
    }

  }

  fixPlanId(event) {
    this.organization.datosPagosIglesia.idCatalogoPlan = event.idCatalogoPlan;
  }

  fixTags(event: MultiSelectComponent) {
    const array = [];
    event.selectedItems.forEach(element => {
      array.push(element.id);
    });
    (this.organization.tags as TagModel).Tags = array;
  }

  submit() {
    this.serverBusy = true;
    this.organization.idUsuario = this.currentUser.idUsuario;

    let subscription: Observable<any>;
    let message_success = '';
    let message_error = '';
    let message_warning = '';

    this.organization.cuponesIglesias.fechaAdquicicion = new Date();
    this.organization.idCatalogoPlan = this.organization.datosPagosIglesia.idCatalogoPlan;

    this.organization.is_featured = this.basicInfoForm.get('is_featured').value;
    this.organization.country_code = this.basicInfoForm.get('country_code').value;
    this.organization.site_v2 = this.basicInfoForm.get('site_v2').value;
    if (this.organization.site_v2) {
      const urlRegex = /^(https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/;
      const is_valid = urlRegex.test(this.basicInfoForm.get('site_v2_url').value);
      if (is_valid) {
        this.organization.site_v2_url = this.basicInfoForm.get('site_v2_url').value;
      } else {
        this.api.showToast(`The site v2 url is invalid`, ToastType.error);
        this.serverBusy = false;
        return;
      }

    } else {
      this.organization.site_v2_url = null
    }
    if (this.isEdit) {
      subscription = this.organizationService.saveIglesia(this.organization);
      message_success = 'Organization updated successfully.';
      message_error = 'Something was wrong while trying the update the organization. Please try again.';
      message_warning = 'The organization was updated with some issues.';
    } else {
      subscription = this.organizationService.saveIglesia(this.organization);
      message_success = 'Organization added successfully.';
      message_error = 'Something was wrong while trying the save the organization. Please try again.';
      message_warning = 'The organization was created with some issues.';
    }
    subscription
      .subscribe((response: any) => {
        if (response.msg.Code === 200) {
          this.organizationService.api.showToast(message_success, ToastType.success);
        } else {
          this.organizationService.api.showToast(message_warning, ToastType.warning);
        }
        this.organization.idIglesia = response.idIglesia;

        const add_pipeline = this.basicInfoForm.get('add_pipeline').value;
        if (add_pipeline) {
          this.savePipeline();
        }
        this.serverBusy = false;
        this.dismiss(this.organization);
        if (this.stripe_info.public_key.length > 0 && this.stripe_info.valid_public_key == 1 &&
          this.stripe_info.secret_key.length > 0 && this.stripe_info.valid_secret_key == 1) {
          this.initializeStripe().then((value) => {
            if (this.stripe_info.valid_public_key == 1) {
              this.checkSecretKey().then((value1) => {
                if (this.stripe_info.valid_secret_key == 1) {
                  this.api
                    .post(`iglesias/saveStripeKeys`, {
                      idIglesia: this.organization.idIglesia, publicKey: this.stripe_info.public_key,
                      secretKey: this.stripe_info.secret_key
                    })
                    .subscribe(
                      (data: any) => {
                        this.api.showToast('API Key successfully saved.', ToastType.success);
                      },
                      (err) => {
                        console.error(err)
                        this.api.showToast(`Error processing the request.`, ToastType.error)
                      }
                    );
                }
              }).catch((reason1) => {
                console.error(reason1)
                this.api.showToast(`API Keys haven't been saved.`, ToastType.warning)
              })
            }
          }).catch((reason) => {
            console.error(reason)
            this.api.showToast(`API Keys haven't been saved.`, ToastType.warning)
          })
        }
      }, error => {
        console.error(error);
        this.organizationService.api.showToast('Something was wrong while trying the save the organization. Please try again.', ToastType.error);
        this.serverBusy = false;
      });
  }
  savePipeline() {
    const pipeline = this.basicInfoForm.get('pipeline_form').value;
    // pipeline.idAgendaContactoIglesia = pipeline.idAgendaContactoIglesia[0].idAgendaContactoIglesia;
    pipeline.idEstadoClienteVenta = pipeline.idEstadoClienteVenta[0].idEstadoClienteVenta;
    pipeline.iglesia = {
      idIglesia: this.organization.idIglesia
    };
    let subscription_pipeline = this.api.post(`oportunidades/saveOportunidad/`, pipeline);
    let success_message = `Pipeline added successfully.`;
    let error_message = `Error adding Pipeline.`;
    subscription_pipeline
      .subscribe(response => {
        // this.api.showToast(`${success_message}`, ToastType.success);
      }, error => {
        // this.api.showToast(`${error_message}`, ToastType.error);
        console.error(error);
      });
  }

  dismiss(responseData?) {
    this.onDismiss.emit(responseData);
  }

  togglePipeline() {
    const add_pipeline = this.basicInfoForm.get('add_pipeline').value;
    if (add_pipeline) {
      this.basicInfoForm.setControl('pipeline_form', new FormGroup({
        nombre: new FormControl('', [Validators.required]),
        idIglesia: new FormControl(undefined),
        idAgendaContactoIglesia: new FormControl(undefined, []),
        tags: new FormControl([]),
        idEstadoClienteVenta: new FormControl(undefined, [Validators.required]),
        valorExpectativo: new FormControl(undefined, [Validators.required, Validators.min(0)]),
        descripcion: new FormControl('')
      }, [Validators.required]));
    } else {
      this.basicInfoForm.setControl('pipeline_form', new FormGroup({
        nombre: new FormControl('', []),
        idIglesia: new FormControl(undefined),
        idAgendaContactoIglesia: new FormControl(undefined, []),
        tags: new FormControl([]),
        idEstadoClienteVenta: new FormControl(undefined, []),
        valorExpectativo: new FormControl(undefined, []),
        descripcion: new FormControl('')
      }));
    }
  }

  dismissPipeline() {
    this.basicInfoForm.get('add_pipeline').setValue(false);
    this.togglePipeline();
  }

  toggleFeatured() {
    const actual_value = this.basicInfoForm.get('is_featured').value;
    this.basicInfoForm.get('is_featured').setValue(!actual_value);
  }

  toggleV2() {
    const actual_value = this.basicInfoForm.get('site_v2').value;
    this.basicInfoForm.get('site_v2').setValue(!actual_value);
    console.log(!actual_value);

    if (!actual_value) {
      const control = new FormControl('', [Validators.required]);
      this.basicInfoForm.setControl('site_v2_url', control);
    } else {
      console.log('Is false');
      const control = new FormControl('', []);
      this.basicInfoForm.setControl('site_v2_url', control);
    }
    console.log(this.basicInfoForm);
  }

  public getAddress(item: AutocompleteResponseModel) {
    if (item) {
      if (item.address) {
        this.organization.Ciudad = item.address.city;
        this.organization.Calle = item.address.street;
        this.organization.Provincia = item.address.state;
        this.organization.ZIP = item.address.zip_code;
        this.organization.country = item.address.country;
        this.organization.lat = item.address.lat;
        this.organization.lng = item.address.lng;
        this.organization.full_address = item.address.full_address;
        this.basicInfoForm.get('city').setValue(item.address.city);
        this.basicInfoForm.get('location').setValue(item.address.full_address);
      }
    }
  }

  formatFullAddress(iglesia: any): string {
    let full_address = ``;
    if (iglesia.Calle) {
      full_address = `${iglesia.Calle}`
    }
    if (iglesia.Ciudad) {
      full_address = `${full_address}, ${iglesia.Ciudad}`
    }
    if (iglesia.Provincia) {
      full_address = `${full_address}, ${iglesia.Provincia}`
    }
    if (iglesia.country) {
      full_address = `${full_address}, ${iglesia.country}`
    }
    if (iglesia.ZIP) {
      full_address = `${full_address}, ${iglesia.ZIP}`
    }
    return full_address;
  }

  saveBasicInfoForm() {
    console.log(this.basicInfoForm.value)
    let subscription: Observable<any>;
    let message_success = '';
    let message_error = '';
    let message_warning = '';

    this.organization.cuponesIglesias.fechaAdquicicion = new Date();
    this.organization.idCatalogoPlan = this.organization.datosPagosIglesia.idCatalogoPlan;

    this.organization.is_featured = this.basicInfoForm.get('is_featured').value;
    this.organization.country_code = this.basicInfoForm.get('country_code').value;
    this.organization.site_v2 = this.basicInfoForm.get('site_v2').value;
    this.organization.organization_categories = this.basicInfoForm.get('categories').value;
    this.organization.denominations = this.basicInfoForm.get('denominations').value;
    this.organization.created_by = this.currentUser.idUsuario;
    if (this.organization.site_v2) {
      const urlRegex = /^(https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/;
      const is_valid = urlRegex.test(this.basicInfoForm.get('site_v2_url').value);
      if (is_valid) {
        this.organization.site_v2_url = this.basicInfoForm.get('site_v2_url').value;
      } else {
        this.api.showToast(`The site v2 url is invalid`, ToastType.error);
        this.serverBusy = false;
        return;
      }

    } else {
      this.organization.site_v2_url = null
    }
    subscription = this.organizationService.saveIglesia(this.organization);
    subscription
      .subscribe((response: any) => {
        if (response.msg.Code === 200) {
          this.organizationService.api.showToast(message_success, ToastType.success);
        } else {
          this.organizationService.api.showToast(message_warning, ToastType.warning);
        }
        this.organization.idIglesia = response.idIglesia;
      }, error => {
        console.error(error);
      });
  }
}
