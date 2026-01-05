import { Component, OnInit , Output, EventEmitter} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'add-formsalon',
  templateUrl: './add-formsalon.component.html',
  styleUrls: ['./add-formsalon.component.scss']
})
export class AddFormsalonComponent implements OnInit {

  @Output() AddNuevoSalon  = new EventEmitter();
  @Output() AddEspacioSalon  = new EventEmitter();
  @Output() AddDescriptionSalon  = new EventEmitter();


  constructor(
    public formBuilder: FormBuilder
  ) { }

  public formSalon: FormGroup = this.formBuilder.group({
    namesalon: ['',Validators.required],
    description: ['', Validators.required],
    space: ['', Validators.required]
  })

  ngOnInit() {
  }

  addSalonComit(form: FormGroup) {
    console.log("hola a todos ");
    if(form.invalid)
    {
        return;
    }

    this.AddNuevoSalon.emit(form.value.namesalon);
    this.AddEspacioSalon.emit(form.value.space);
    this.AddDescriptionSalon.emit(form.value.description);

  }

}
