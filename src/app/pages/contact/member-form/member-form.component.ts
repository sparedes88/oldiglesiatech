import { AutocompleteResponseModel, GoogleAddressComponent } from './../../../component/google-places/google-places.component';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { ToastType } from 'src/app/login/ToastTypes';

@Component({
  selector: 'member-form',
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.css']
})
export class MemberFormComponent implements OnInit {

  disable_mail: boolean = false;
  original_mail: string;

  init_map: boolean = false;

  constructor(
    public api: ApiService,
    public formBuilder: FormBuilder,
    public userService: UserService,
    public fileUpload: FileUploadService) {
    const user = localStorage.getItem('currentUser')
    // Parse user string object
    if (user) {
      this.user = JSON.parse(user)
    }
  }
  // Select opts
  public selectCatOptions: any = {
    singleSelection: false,
    idField: 'idCategoriaMiembro',
    textField: 'descripcion',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  }

  public selectLevelOptions: any = {
    singleSelection: false,
    idField: 'idNivel',
    textField: 'descripcion',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  }

  // User
  public user: any

  @Input() member: any
  @Output() onSubmit = new EventEmitter()

  // Form Group
  public memberFormGroup: FormGroup = this.formBuilder.group({
    idIglesia: [''],
    idUsuario: [''],
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    sexo: ['', Validators.required],
    telefono: ['', Validators.required],
    country_code: ['', Validators.required],
    email: ['', Validators.required],
    pass: ['', Validators.required],
    ciudad: ['', Validators.required],
    calle: ['', Validators.required],
    provincia: ['', Validators.required],
    zip: [''],
    country: [''],
    estadoCivil: [''],
    fechaNacimiento: [''],
    niveles: [''],
    categorias: [''],
    idNivel: [''],
    idRequisito: [''],
    idFrecuencia: [''],
    fotoUrl: [''],
    photo: [''],
    idUserType: ['', Validators.required],
    full_address: ['']
  })

  // Data
  public iglesia: any
  public passInputType: string = 'password'
  public categories: any[] = []
  public levels: any[] = []
  public loading: boolean = false

  ngOnInit() {
    this.init_map = false;
    this.getIglesia()
    if (this.user) {
      this.getLevels()
      this.getCategories()
    }

    if (this.member) {
      this.member.full_address = GoogleAddressComponent.formatFullAddress(this.member, ['calle', 'ciudad', 'provincia', 'zip', 'country'])
      console.log(this.member);

      this.memberFormGroup.patchValue({
        idIglesia: this.member.idIglesia,
        idUsuario: this.member.idUsuario,
        nombre: this.member.nombre,
        apellido: this.member.apellido,
        sexo: this.member.sexo,
        telefono: this.member.telefono,
        country_code: this.member.country_code,
        email: this.member.email,
        ciudad: this.member.ciudad,
        calle: this.member.calle,
        provincia: this.member.provincia,
        zip: this.member.zip,
        country: this.member.country,
        estadoCivil: this.member.estadoCivil,
        fechaMembresia: this.member.fechaMembresia,
        idNivel: this.member.idNivel,
        idRequisito: this.member.idRequisito,
        idUserType: this.member.idUserType,
        fotoUrl: this.member.fotoUrl,
        full_address: this.member.full_address
      })

      if (this.member.fechaNacimiento) {
        this.memberFormGroup.patchValue({
          fechaNacimiento: this.member.fechaNacimiento.split('T')[0]
        })
      }

      this.memberFormGroup.controls['pass'].setValidators([])
    }
    setTimeout(() => {
      this.init_map = true;
    }, 100);
  }

  getIglesia() {
    this.api.get('getIglesiaFullData', { idIglesia: this.user.idIglesia })
      .subscribe(
        (data: any) => {
          console.log(data);
        },
        err => console.error(err)
      )
  }

  togglePassInput() {
    if (this.passInputType == 'password') {
      this.passInputType = 'text'
    } else {
      this.passInputType = 'password'
    }
  }

  getCategories() {
    this.api.get('getCategoriasMiembros', { idIglesia: this.user.idIglesia })
      .subscribe(
        (data: any) => {
          this.categories = data.categoriasMiembros
        },
        err => console.error(err)
      )
  }

  getCategoriesAsPromise() {
    return new Promise((resolve, reject) => {
      this.api.get('getCategoriasMiembros', { idIglesia: this.user.idIglesia })
        .subscribe(
          (data: any) => {
            this.categories = data.categoriasMiembros
            return resolve(this.categories);
          },
          err => {
            console.error(err);
            return reject([]);
          });
    });
  }

  getLevels() {
    this.api.get('getNiveles', { idIglesia: this.user.idIglesia })
      .subscribe(
        (data: any) => {
          this.levels = data.niveles
        },
        err => {
          console.error(err)
        }
      )
  }

  submitForm(form: FormGroup) {
    if (form.invalid) {
      return alert('Please check the form and try again')
    }

    if (form.value.photo) {
      this.fileUpload.uploadFile(form.value.photo, true)
        .subscribe(
          (res: any) => {
            if (res.msg.Code == 200) {
              form.patchValue({ fotoUrl: `${res.file_info.src_path}` })
              return this.createContact(form)
            }
            else {
              return alert(res.msg.Message)
            }
          },
          err => console.error(err)
        )
    } else {
      if (form.value.fotoUrl) {
        form.patchValue({
          fotoUrl: this.fileUpload.cleanPhotoUrl(form.value.fotoUrl)
        })
      }
      return this.createContact(form)
    }
  }

  createContact(form: FormGroup) {
    this.loading = true

    let payload = Object.assign({}, form.value)
    let request: any

    // Remove empty params
    Object.keys(payload).map(key => {
      if (!payload[key]) {
        delete payload[key]
      }
    })

    if (this.member) {
      request = this.api.post(`updateUsuario`, payload)
    } else {
      payload.idIglesia = this.user.idIglesia
      payload.pass = UserService.encryptPass(payload.pass)
      request = this.api.post('insertUsuario', payload)
    }
    if (this.disable_mail) {
      payload.email = this.original_mail;
    }

    request.subscribe(
      (data: any) => {
        if (data.phone_warning) {
          this.api.showToast(`The phone provided is already in use and will not be updated`, ToastType.info);
        }
        this.onSubmit.emit(data)
        form.reset()
      },
      err => {
        console.error(err)
        this.loading = false
      },
      () => this.loading = false
    )
  }

  handleFileInput(files: FileList) {
    const file = files.item(0)
    if (file) {
      this.memberFormGroup.patchValue({ photo: file })
    }
  }

  patchCategories(categories: any[]) {
    this.getCategoriesAsPromise().then(cat => {
      const cats = this.categories.filter(x => {
        return (categories.filter(lead => {
          return lead.idCategoriaMiembro === x.idCategoriaMiembro;
        })).length > 0;
      });

      this.memberFormGroup.patchValue({
        categorias: cats
      });
      this.disable_mail = true;
      this.original_mail = this.member.email;
    });
  }

  public getAddress(address_control: FormGroup, item: AutocompleteResponseModel) {
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
}
