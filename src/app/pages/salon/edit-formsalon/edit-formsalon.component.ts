import { Component, OnInit, OnChanges , Input, Output , EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'edit-formsalon',
  templateUrl: './edit-formsalon.component.html',
  styleUrls: ['./edit-formsalon.component.scss']
})
export class EditFormsalonComponent implements OnInit,OnChanges{


  @Input('pasarSalon') pasarSalon: string;
  @Input('pasarSpace') pasarSpace: number;
  @Input('pasarDescripcion') pasarDescripcion: string;

  @Output() retornaSalon  = new EventEmitter ();
  @Output() retornaSpace = new EventEmitter();
  @Output() retornaDescripcion = new EventEmitter();


  idAlFormulario: string = null
  constructor(
    public formBuilder: FormBuilder,

  ) { }

  public formSalon: FormGroup = this.formBuilder.group({
    namesalon: ['',Validators.required],
    description: ['', Validators.required],
    space: ['', Validators.required]
  })

  ngOnInit() {

  }

  ngOnChanges()
  {

    this.formSalon.patchValue({
      namesalon: this.pasarSalon,
      description: this.pasarDescripcion,
      space: this.pasarSpace
    })

  }

  editarSalonComit(form: FormGroup) {
    console.log("hola a todos ");
    if(form.invalid)
    {
        console.log(form.invalid);
        return;
    }
    this.retornaSalon.emit(form.value.namesalon);
    this.retornaDescripcion.emit(form.value.description);
    this.retornaSpace.emit(form.value.space);

  }
}
