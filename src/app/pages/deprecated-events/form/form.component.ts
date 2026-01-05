import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { UserService } from 'src/app/services/user.service';
import { ApiService } from 'src/app/services/api.service';
import { FileUploadService } from 'src/app/services/file-upload.service';
import * as moment from 'moment'

@Component({
  selector: 'event-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  constructor(
    public api: ApiService,
    public formBuilder: FormBuilder,
    public snackbar: MatSnackBar,
    public fileUpload: FileUploadService,
    public userService: UserService) {
    this.user = this.userService.getCurrentUser()
  }

  @Input() event: any
  @Output() onSubmit = new EventEmitter()

  /** DATA */
  public user: any
  public frecuencies: any[] = []
  public accessLevels: any[] = []
  public loading: boolean = false

  public eventFormGroup: FormGroup = this.formBuilder.group({
    idEvento: [''],
    idIglesia: [''],
    foto: [''],
    fotoUrl: [''],
    titulo: ['', Validators.required],
    ciudad: [''],
    calle: [''],
    noExt: [''],
    provincia: [''],
    zip: [''],
    estatus: [''],
    idFrecuencia: [''],
    idNivelAcceso: [''],
    fechaFin: [''],
    descripcion: [''],
    hora: [''],
    dias: ['']
  })

  ngOnInit() {
    this.eventFormGroup.patchValue({
      idIglesia: this.user.idIglesia
    })

    // If An instance is given set update mode
    if (this.event) {
      this.eventFormGroup.patchValue({
        idEvento: this.event.idEvento,
        idIglesia: this.event.idIglesia,
        titulo: this.event.titulo,
        ciudad: this.event.ciudad,
        calle: this.event.calle,
        noExt: this.event.noExt,
        provincia: this.event.provincia,
        zip: this.event.zip,
        estatus: this.event.estatus,
        idFrecuencia: this.event.idFrecuencia,
        idNivelAcceso: this.event.idNivelAcceso,
        fechaFin: this.event.fechaFin,
        descripcion: this.event.descripcion,
        hora: this.event.hora
      })
    }
    // Get levels and frecuencies
    this.getFrecuenciesAccessLevels()
  }

  getFrecuenciesAccessLevels() {
    this.api.get(`getFrecuenciasyNivelesDeAcceso`, { idIglesia: this.user.idIglesia })
      .subscribe(
        (data: any) => {
          this.frecuencies = data.frecuencias
          this.accessLevels = data.nivelesAcceso
        }
      )
  }

  submitForm(form: FormGroup) {
    if (form.invalid) {
      this.snackbar.open(`Please check the form and try again`, 'Ok', { duration: 3000 })
    }

    this.loading = true

    // get dias
    if (form.value.idFrecuencia == 1) {
      form.patchValue({
        dias: [
          {
            hora: moment(form.value.fechaFin).format('ddd MMM DD YYYY HH:mm:ss'),
            tieneHora: true,
            dia: moment(form.value.fechaFin).format('dddd')
          }
        ]
      })
    }
    else {
      form.patchValue({
        dias: [
          {
            hora: moment(form.value.hora, 'HH:mm').format('ddd MMM DD YYYY HH:mm:ss'),
            tieneHora: true,
            dia: moment(form.value.fechaFin).format('dddd')
          }
        ]
      })
    }

    // Uplad file
    if (form.value.foto) {
      this.fileUpload.uploadFile(form.value.foto)
        .subscribe(
          (data: any) => {
            form.patchValue({ fotoUrl: `${data.file_info.src_path}` })
            this.onSubmit.emit(form.value)
            this.loading = false
            console.log(form.value)
          },
          err => {
            console.error(err)
            this.loading = false
          }
        )
    } else {
      this.onSubmit.emit(form.value)
      this.loading = false
      console.log(form.value)
    }
  }

  handleFileInput(files: FileList) {
    const file = files.item(0)
    if (file) {
      this.eventFormGroup.patchValue({ foto: file })
    }
  }

}
