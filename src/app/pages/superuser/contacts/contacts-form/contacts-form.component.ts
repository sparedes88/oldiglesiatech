import { ActivatedRoute } from '@angular/router';
import { UserService } from './../../../../services/user.service';
import { User } from './../../../../interfaces/user';
import { ApiService } from './../../../../services/api.service';
import { ToastType } from './../../../../login/ToastTypes';
import { FormGroup, FormControl, Validators, FormArray, NgForm } from '@angular/forms';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { IglesiaContactoModel } from 'src/app/models/IglesiaContactoModel';

@Component({
  selector: 'app-contacts-form',
  templateUrl: './contacts-form.component.html',
  styleUrls: ['./contacts-form.component.scss']
})
export class ContactsFormComponent implements OnInit {

  @Output() dismiss_form = new EventEmitter();
  @Input('iglesia') iglesia: any;
  @Input('handle_local') handle_local: boolean;

  currentUser: User; // Interfaces
  contact: IglesiaContactoModel;
  contact_form: FormGroup = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    idAgendaContactoIglesia: new FormControl(0, [Validators.required]),
    apellido: new FormControl('', [Validators.required]),
    estatus: new FormControl(true),
    idIglesia: new FormControl('', [Validators.required]),
    posicion: new FormControl('', [Validators.required]),
    telefonos: new FormArray([]),
    correos: new FormArray([])
  });

  show_detail: boolean = true;

  constructor(
    private userService: UserService,
    private api: ApiService,
    private route: ActivatedRoute
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  ngOnInit() {
    this.clearFormArray(this.phones);
    this.clearFormArray(this.emails);

    if (this.contact) {
      this.contact_form.get('idAgendaContactoIglesia').setValue(this.contact.idAgendaContactoIglesia);

      if (this.contact.idAgendaContactoIglesia) {
        this.contact.telefonos.forEach(telefono => {
          this.phones.push(
            new FormGroup({
              telefono: new FormControl(telefono.telefono, [Validators.required]),
              idAgendaContactoIglesia: new FormControl(telefono.idAgendaContactoIglesia, Validators.required),
              idAgendaContactoTelefono: new FormControl(telefono.idAgendaContactoTelefono, Validators.required),
              estatus: new FormControl(true)
            })
          );
        });
        this.contact.correos.forEach(correo => {
          this.emails.push(
            new FormGroup({
              correo: new FormControl(correo.correo, [Validators.required, Validators.email]),
              idAgendaContactoIglesia: new FormControl(correo.idAgendaContactoIglesia, Validators.required),
              idAgendaContactoCorreo: new FormControl(correo.idAgendaContactoCorreo, Validators.required),
              estatus: new FormControl(true)
            })
          );
        });
        this.contact_form.patchValue(this.contact);
      }
    } else {
      // this.contact_form.removeControl('idAgendaContactoIglesia');
      this.contact_form.get('telefonos').setValue([]);
      this.contact_form.get('correos').setValue([]);
      this.contact_form.reset();
      this.contact_form.get('idAgendaContactoIglesia').setValue(0);
    }
    let idIglesia;
    if (this.iglesia) {
      idIglesia = this.iglesia.idIglesia;
    } else {
      idIglesia = this.currentUser.idIglesia;
      this.route.queryParamMap.subscribe(params => {
        const code = params.get('idIglesia');
        if (code) {
          idIglesia = Number(code);
        }
      });
    }
    this.contact_form.get('idIglesia').setValue(idIglesia);
    this.contact_form.get('estatus').setValue(true);
  }

  get phones() {
    return this.contact_form.get('telefonos') as FormArray;
  }

  get emails() {
    return this.contact_form.get('correos') as FormArray;
  }

  submitContact(contact_form: FormGroup, group_form: NgForm) {
    if (contact_form.valid) {
      const contacto = contact_form.value;
      if (this.handle_local) {
        this.dismiss_form.emit(contacto);
      } else {
        let success_message: string;
        let error_message: string;
        if (this.contact) {
          success_message = `Contact updated successfully.`;
          error_message = `Error updating contact.`;
        } else {
          success_message = `Contact updating successfully.`;
          error_message = `Error adding contact.`;
        }
        this.api.post(`insertUpdateIglesiaContacto`, contacto)
          .subscribe((response: any) => {
            if (response.idAgendaContactoIglesia) {
              contacto.idAgendaContactoIglesia = response.idAgendaContactoIglesia;
              this.api.showToast(`${success_message}`, ToastType.success);
              this.close(true);
            }
          }, err => {
            console.error(err);
            this.api.showToast(`${error_message}`, ToastType.error);
          });
      }
    } else {
      this.api.showToast(`Please check all required fields are correct.`, ToastType.error);
    }
  }

  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  addItem(key: string) {
    const control = (this.contact_form.get(key) as FormArray);
    const key_value_name = key === 'telefonos' ? 'telefono' : 'correo';
    const key_value_id = key === 'telefonos' ? 'Telefono' : 'Correo';
    control.push(
      new FormGroup({
        [key_value_name]: new FormControl('', [Validators.required]),
        idAgendaContactoIglesia: new FormControl(this.contact ? this.contact.idAgendaContactoIglesia : 0, Validators.required),
        [`idAgendaContacto${key_value_id}`]: new FormControl(0, Validators.required),
        estatus: new FormControl(true)
      })
    );
  }

  removeItem(key: string, index: number) {
    const control = (this.contact_form.get(key) as FormArray);
    const key_name = key === 'telefonos' ? 'telefono' : 'correo';
    const value = control.controls[index].get(key_name).value;
    const is_valid = control.controls[index].get(key_name).valid;
    console.log(key_name);
    console.log(value);

    if (value) {
      if (is_valid) {
        control.controls[index].get('estatus').setValue(false);
      } else {
        control.removeAt(index);
      }
    } else {
      control.removeAt(index);
    }
  }

  close(response?: boolean) {
    this.dismiss_form.emit(response);
  }
}
