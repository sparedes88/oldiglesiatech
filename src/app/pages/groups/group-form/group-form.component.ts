import { OrganizationModel } from './../../../models/OrganizationModel';
import { OrganizationService } from './../../../services/organization/organization.service';
import { AddressModel, AutocompleteResponseModel, GoogleAddressComponent } from './../../../component/google-places/google-places.component';
import { ToastType } from "./../../../login/ToastTypes";
import { GroupsService } from "./../../../services/groups.service";
import { GroupModel } from "./../../../models/GroupModel";
import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  NgForm,
  FormControl,
} from "@angular/forms";
import { ApiService } from "src/app/services/api.service";
import { UserService } from "src/app/services/user.service";
import { NgxSmartModalService } from "ngx-smart-modal";
import { FileUploadService } from "src/app/services/file-upload.service";
import { WordpressService } from "src/app/services/wordpress.service";

@Component({
  // tslint:disable-next-line: component-selector
  selector: "group-form",
  templateUrl: "./group-form.component.html",
  styleUrls: ["./group-form.component.scss"],
})
export class GroupFormComponent implements OnInit {

  @ViewChild('address_component') address_component: GoogleAddressComponent;
  // Group Form
  public formGroup: FormGroup = this.formBuilder.group({
    idGroup: [""],
    idIglesia: [""],
    title: ["", Validators.required],
    city: ["", Validators.required],
    street: [""],
    state: [""],
    zip_code: [""],
    country: [""],
    lat: new FormControl(),
    lng: new FormControl(),
    idGroupType: [0, [Validators.required, Validators.min(1)]],
    idLevelAccess: [0, [Validators.required, Validators.min(1)]],
    leaders: ["", Validators.required],
    members: [""],
    categories: [""],
    picture: [""],
    short_description: [""],
    long_description: [""],
    photo: [""],
    dias: this.formBuilder.array([
      this.formBuilder.group({
        tieneHora: [false],
        nombre: ["Lunes"],
        hora: [""],
      }),
      this.formBuilder.group({
        tieneHora: [false],
        nombre: ["Martes"],
        hora: [""],
      }),
      this.formBuilder.group({
        tieneHora: [false],
        nombre: ["Miércoles"],
        hora: [""],
      }),
      this.formBuilder.group({
        tieneHora: [false],
        nombre: ["Jueves"],
        hora: [""],
      }),
      this.formBuilder.group({
        tieneHora: [false],
        nombre: ["Viernes"],
        hora: [""],
      }),
      this.formBuilder.group({
        tieneHora: [false],
        nombre: ["Sábado"],
        hora: [""],
      }),
      this.formBuilder.group({
        tieneHora: [false],
        nombre: ["Domingo"],
        hora: [""],
      }),
    ]),
    idGallery: [undefined],
    idMailingList: [undefined],
    location: [null],
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
    same_as_church: [false],
    is_external: new FormControl(false),
    external_url: new FormControl('')
  });

  // Data
  public currentUser: any;
  public tabIndex: number = 0;
  public previewFile: any;
  public users: any[] = [];
  public categories: any[] = [];
  public group_types: any[] = [];
  public galleries: any[] = [];
  public mailing_lists: any[] = [];
  public access: any[] = [];
  show_detail: boolean = true;
  visiblePixieModal: boolean = false

  // Select opts
  public selectCatOptions: any = {
    singleSelection: false,
    idField: "idGroupCategory",
    textField: "name",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    allowSearchFilter: true,
  };

  public selectLeadersOptions: any = {
    singleSelection: false,
    idField: "idUsuario",
    textField: "full_name",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    allowSearchFilter: true,
  };

  public selectGalleryOptions: any = {
    singleSelection: true,
    idField: "id",
    textField: "name",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    allowSearchFilter: true,
  };

  public wordpressSettings
  public wpConfig: any;
  public wpImages: any[] = []
  constructor(
    public userService: UserService,
    public api: ApiService,
    public formBuilder: FormBuilder,
    public modal: NgxSmartModalService,
    public fileUpload: FileUploadService,
    private groupService: GroupsService,
    private wpService: WordpressService,
    private organizationService: OrganizationService
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  @Output() submit = new EventEmitter();
  @Input() group: GroupModel;
  init_map: boolean = false;

  ngOnInit() {
    this.getUsers();
    this.getCategories();
    this.getFrequencies();
    this.getGalleries();
    this.getContactInbox();
    this.getWordpressSettings()
    // Set Church id
    this.formGroup.patchValue({ idIglesia: this.currentUser.idIglesia });
    // Init the form
    if (this.group) {
      this.show_detail = false;
      this.groupService.getGroupDetail(this.group.idGroup).subscribe(
        async (response: any) => {
          this.group = response.group;
          this.group.location = this.formatFullAddress(this.group);
          if (!this.group.lat && !this.group.lng) {
            const pin_info = await GoogleAddressComponent.convert(this.group.location).catch(error => {
              console.error(error);
              return error;
            });
            if (JSON.stringify(pin_info) !== '{}') {
              const address = pin_info.address;
              address.idGroup = this.group.idGroup;
              this.api
                .post(`groups/updateAddress`, address)
                .subscribe(response => {
                });
            }
          }
          this.formGroup.patchValue(this.group);
          console.log(this.formGroup.value);

          const promises = [];
          promises.push(this.getUsersAsPromise());
          promises.push(this.getCategoriesAsPromise());
          promises.push(this.getGalleriesAsPromise());
          promises.push(this.getContactInboxAsPromise());
          Promise.all(promises)
            .then((responses: any[]) => {
              this.users = responses[0];
              const leaders = this.users.filter((x) => {
                return (
                  this.group.leaders.filter((lead) => {
                    return lead.idUser === x.idUsuario;
                  }).length > 0
                );
              });
              const members = this.users.filter((x) => {
                return (
                  this.group.members.filter((member) => {
                    return member.idUser === x.idUsuario;
                  }).length > 0
                );
              });
              this.categories = responses[1];
              const categories = this.categories.filter((x) => {
                return (
                  this.group.categories.filter((cat) => {
                    return cat.idGroupCategory === x.idGroupCategory;
                  }).length > 0
                );
              });
              const idGallery = this.galleries.filter((x) => {
                return this.group.idGallery === x.id;
              });
              const idMailingList = this.mailing_lists.filter((x) => {
                return this.group.idMailingList === x.id;
              });
              this.formGroup.patchValue({
                leaders,
                members,
                categories,
                idGallery,
                idMailingList
              });
              this.show_detail = true;
            })
            .finally(() => {
              this.show_detail = true;
              setTimeout(() => {
                this.init_map = true;
              });
            });
        },
        (error) => {
          console.error(error);
          this.api.showToast(`Error getting details.`, ToastType.error);
          this.show_detail = true;
        }
      );
      // idGrupo: this.group.idGrupo,
      // calle: this.group.s,
      // ciudad: this.group.ciudad,
      // descripcion: this.group.descripcion,
      // fechaFin: this.group.fechaFin,
      // idFrecuencia: this.group.idFrecuencia,
      // idIglesia: this.group.idIglesia,
      // idNivelAcceso: this.group.idNivelAcceso,
      // nivelAcceso: this.group.nivelAcceso,
      // noExt: this.group.noExt,
      // provincia: this.group.provincia,
      // titulo: this.group.titulo,
      // zip: this.group.zip
    } else {
      setTimeout(() => {
        this.init_map = true;
      }, 350);
    }
  }
  getContactInbox() {
    this.api
      .get(`mailingList/`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          this.mailing_lists = data;
        },
        (error) => {
          console.error(error);
        }
      );
  }

  getContactInboxAsPromise() {
    return new Promise((resolve, reject) => {
      this.api
        .get(`mailingList/`, { idIglesia: this.currentUser.idIglesia })
        .subscribe(
          (data: any) => {
            this.mailing_lists = data;
            return resolve(data);
          },
          (error) => {
            return reject([]);
          }
        );
    });
  }

  getGalleriesAsPromise() {
    return new Promise((resolve, reject) => {
      this.api
        .get("galleries", { idIglesia: this.currentUser.idIglesia })
        .subscribe(
          (data: any) => {
            this.galleries = data;
            return resolve(data);
          },
          (error) => {
            return reject([]);
          }
        );
    });
  }

  getGalleries() {
    this.api
      .get("galleries", { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          this.galleries = data;
        },
        (error) => {
          console.error(error);
        }
      );
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
  getUsers() {
    this.api
      .get("getUsuarios", { idIglesia: this.currentUser.idIglesia })
      .subscribe((data: any) => {
        data.usuarios.map((user) => {
          user.full_name = `${user.nombre} ${user.apellido}`;
        });
        this.users = data.usuarios;
      });
  }

  getUsersAsPromise() {
    return new Promise((resolve, reject) => {
      this.api
        .get("getUsuarios", { idIglesia: this.currentUser.idIglesia })
        .subscribe(
          (data: any) => {
            data.usuarios.map((user) => {
              user.full_name = `${user.nombre} ${user.apellido}`;
            });
            return resolve(data.usuarios);
          },
          (error) => {
            return reject([]);
          }
        );
    });
  }

  getCategories() {
    this.api
      .get("groups/getGroupsCategories", {
        idIglesia: this.currentUser.idIglesia,
      })
      .subscribe((data: any) => {
        this.categories = data.categories;
      });
  }

  getCategoriesAsPromise() {
    return new Promise((resolve, reject) => {
      this.api
        .get("groups/getGroupsCategories", {
          idIglesia: this.currentUser.idIglesia,
        })
        .subscribe(
          (data: any) => {
            this.categories = data.categories;
            return resolve(data.categories);
          },
          (error) => {
            return reject([]);
          }
        );
    });
  }

  getFrequencies() {
    this.api
      .get(`getFrecuenciasyNivelesDeAcceso`, {
        idIglesia: this.currentUser.idIglesia,
      })
      .subscribe(
        (data: any) => {
          this.group_types = data.groups_types;
          this.access = data.nivelesAcceso;
        },
        (err) => console.error(err)
      );
  }

  readURL(): void {
    if (this.formGroup.value.photo) {
      const file = this.formGroup.value.photo;
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => (this.previewFile = reader.result);

        reader.readAsDataURL(file.files[0]);
      }
    }
  }

  setValidatorForExternal() {
    const is_external = this.formGroup.get('is_external').value;
    console.log(is_external);
    if (is_external) {
      this.formGroup.get('external_url').setValidators([Validators.required])
    } else {
      this.formGroup.setControl('external_url', new FormControl(''));
      this.formGroup.get('external_url').setValidators([])
    }
    console.log(this.formGroup);
  }

  submitGroup(form: FormGroup, group_form: NgForm) {
    this.show_detail = false;
    if (form.invalid) {
      return alert(`Please check the form and try again`);
    }
    // remove items
    const payload = Object.assign({}, form.value);
    if (payload.is_external && !payload.external_url) {
      form.get('external_url').markAsTouched();
      this.api.showToast(`You need to add a register link`, ToastType.info);
      return;
    }
    if (form.value.photo) {
      this.fileUpload.uploadFile(form.value.photo).subscribe((res: any) => {
        form.patchValue({ picture: `${res.file_info.src_path}` });
        payload.picture = `${res.file_info.src_path}`;
        this.saveGroup(payload, group_form);
      });
    } else {
      this.saveGroup(payload, group_form);
    }
  }

  async saveGroup(payload: GroupModel, group_form: NgForm) {
    let request: any;
    const id_leader_array = [];
    if (payload.leaders) {
      payload.leaders.map((x) => {
        x.is_leader = true;
        id_leader_array.push(x.idUsuario);
      });
    } else {
      payload.leaders = [];
    }

    let members_clear = [];
    if (payload.members) {
      members_clear = payload.members.filter((user) => {
        return !id_leader_array.includes(user.idUsuario);
      });
    }
    payload.members = payload.leaders.concat(members_clear);
    payload.created_by = this.currentUser.idUsuario;

    if (this.formGroup.get("idGroupType").disabled) {
      payload.idGroupType = this.formGroup.get("idGroupType").value;
    }
    if (Array.isArray(payload.idMailingList)) {
      if (payload.idMailingList.length > 0) {
        payload.idMailingList = payload.idMailingList[0].id;
      } else {
        payload.idMailingList = null;
      }
    }
    if (Array.isArray(payload.idGallery)) {
      if (payload.idGallery.length > 0) {
        payload.idGallery = payload.idGallery[0].id;
      } else {
        payload.idGallery = null;
      }
    }

    if (payload.idGroup) {
      request = this.groupService.updateGroup(payload);
    } else {
      request = this.groupService.saveGroup(payload);
    }
    await request.subscribe(
      (data: any) => {
        if (data.msg.Code === 200) {
          group_form.resetForm();
        } else {
          alert(`The group can't be created, please check the form`);
        }
        this.show_detail = true;
      },
      (err) => {
        console.error(err)
        this.show_detail = true;
      },
      () => {
        this.submit.emit()
      }
    );
  }

  handleFileInput(files: FileList) {
    const file = files.item(0);
    if (file) {
      this.formGroup.patchValue({ photo: file });
    }
  }

  get dias(): FormArray {
    return this.formGroup.get("dias") as FormArray;
  }

  setTeamType() {
    this.formGroup.controls.idGroupType.setValue(4);
    this.formGroup.controls.idGroupType.disable({
      onlySelf: false,
    });
  }

  handlePixieExport(file: any) {
    this.visiblePixieModal = false
    this.formGroup.patchValue({ photo: file });
  }

  public getAddress(item: AutocompleteResponseModel) {
    console.log(item);

    if (item) {
      if (item.address) {
        this.formGroup.get('location').setValue(item.address.full_address);
        this.formGroup.patchValue(item.address);
        if (this.group) {
          this.group.location = item.address.full_address;
        }
        this.formGroup.get('detail_address_info').patchValue(item.address);
        console.log(this.formGroup);

      }
    }
  }

  formatFullAddress(group: GroupModel): string {
    let full_address = ``;
    if (group.street) {
      full_address = `${group.street}`
    }
    if (group.city) {
      full_address = `${full_address}, ${group.city}`
    }
    if (group.state) {
      full_address = `${full_address}, ${group.state}`
    }
    if (group.country) {
      full_address = `${full_address}, ${group.country}`
    }
    if (group.zip_code) {
      full_address = `${full_address}, ${group.zip_code}`
    }
    return full_address;
  }

  setAddressAsOrganization() {
    // if (payload.same_as_church) {
    //   if (this.group.location) {
    //     const address: AddressModel = {
    //       street: payload.street,
    //       city: payload.city,
    //       state: payload.state,
    //       country: payload.country,
    //       zip_code: payload.zip_code,
    //       lat: payload.lat,
    //       lng: payload.lng,
    //       idIglesia: payload.idIglesia
    //     }
    //     this.api
    //       .post(`iglesias/updateOrganizationAddress`, address)
    //       .subscribe(response => {
    //       });
    //   }
    // }
    if (this.formGroup.get('same_as_church').value) {
      const item = new OrganizationModel();
      item.idIglesia = this.currentUser.idIglesia;
      const subscription = this.organizationService.getIglesiaDetail(item)
        .subscribe(async (response: any) => {
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
            this.formGroup.get('location').setValue(item.address.full_address);
            if (this.address_component) {
              this.address_component.value = item.address.full_address;
              this.address_component.autocompleteInput = item.address.full_address;
            }
            this.getAddress(item);
          }
          subscription.unsubscribe();
        }, error => {
          console.error(error);
          subscription.unsubscribe();
        })
    }
  }
}
