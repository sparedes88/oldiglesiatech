import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';


@Component({
  selector: 'edit-forminventario',
  templateUrl: './edit-forminventario.component.html',
  styleUrls: ['./edit-forminventario.component.scss']
})
export class EditForminventarioComponent implements OnInit, OnChanges {

  @Input('modelEditarInventario') modelEditarInventario: any = {};
  @Output() modelRetornarInventario = new EventEmitter ();
  public modelDatos : any = {}

  constructor(
    public formBuilder: FormBuilder
  ) { }

  public formInventario: FormGroup = this.formBuilder.group({
    categoria: ['', Validators.required],
    item: ['',Validators.required],
    description: ['', Validators.required],
    cantidad: ['', Validators.required]
  })

  ngOnInit() {

  }

  ngOnChanges()
  {
    console.log(this.modelEditarInventario);

    this.formInventario.patchValue({
      categoria: this.modelEditarInventario.categoria,
      item: this.modelEditarInventario.item ,
      description: this.modelEditarInventario.description,
      cantidad: this.modelEditarInventario.cantidad
    })

  }

  editarInventarioComit(form: FormGroup)
  {
    if(form.invalid)
    {
      return;
    }
     this.modelDatos= {id: this.modelEditarInventario.id, categoria: form.value.categoria,
      item: form.value.item, cantidad: form.value.cantidad, description: form.value.description};

    this.modelRetornarInventario.emit(this.modelDatos);
    console.log( this.modelDatos);
  }
}
