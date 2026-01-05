import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-level-form-2',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  constructor(public api: ApiService, public userService: UserService, public formBuilder: FormBuilder) {
    this.currentUser = this.userService.getCurrentUser()
  }

  @Input() level: any
  @Input() order: any = 0
  @Output() onSubmit = new EventEmitter()

  // Data
  public currentUser: any
  public levelFormGroup: FormGroup = this.formBuilder.group({
    idNivel: [''],
    descripcion: ['', Validators.required],
    requisitos: this.formBuilder.array([]),
    orden: this.order + 1
  })

  ngOnInit() {
    if (this.level) {
      this.levelFormGroup.patchValue({
        idNivel: this.level.idNivel,
        descripcion: this.level.descripcion,
        orden: this.level.orden,
      })
      // Append requirements
      let requirementsArray = this.levelFormGroup.get('requisitos') as FormArray
      if (this.level.requisitos && this.level.requisitos.length) {
        this.level.requisitos.map(req => {
          // Only active requirements
          if (req.estatus == true) {
            // Append form group
            requirementsArray.push(
              this.formBuilder.group({
                idRequisito: req.idRequisito,
                descripcion: req.descripcion,
                estatus: true
              })
            )
          }
        })
      }
    } else {
      let requirementsArray = this.levelFormGroup.get('requisitos') as FormArray
      requirementsArray.push(this.createRequirement())
    }
  }

  createRequirement(): FormGroup {
    return this.formBuilder.group({
      idRequisito: [''],
      descripcion: ['', Validators.required]
    });
  }

  addRequirement(): void {
    let req = this.levelFormGroup.get('requisitos') as FormArray
    req.push(this.createRequirement())
  }

  deleteRequirement(index) {
    let control = <FormArray>this.levelFormGroup.controls.requisitos;
    control.removeAt(index)
  }

  submitForm(form: FormGroup) {
    if (form.invalid) {
      return alert(`Please check the form and try again`)
    }

    this.onSubmit.emit(form.value)
  }

  public clearForm() {
    this.levelFormGroup.reset()
  }

}
