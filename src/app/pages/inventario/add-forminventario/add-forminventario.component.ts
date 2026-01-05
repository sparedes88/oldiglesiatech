import { Component, OnInit, Output , EventEmitter} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'add-forminventario',
  templateUrl: './add-forminventario.component.html',
  styleUrls: ['./add-forminventario.component.scss']
})
export class AddForminventarioComponent implements OnInit {


  @Output() modelRetornarInventario = new EventEmitter ();
  public MostrarQr = 'NO';
  public modelDatos : any ={};
  public miQrCode: string = null;
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

  addInventarioComit(form: FormGroup)
  {

    if(form.invalid)
    {
      return;
    }
    this.modelDatos= {id: 1, categoria: form.value.categoria,
    item: form.value.item, cantidad: form.value.cantidad, description: form.value.description};
    this.modelRetornarInventario.emit(this.modelDatos);
  }
}
