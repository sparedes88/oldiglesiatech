import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { User } from './../../../../interfaces/user';
import { ToastType } from './../../../../login/ToastTypes';
import { UserService } from './../../../../services/user.service';
import { ApiService } from './../../../../services/api.service';
import { Component, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { IglesiaContactoModel } from 'src/app/models/IglesiaContactoModel';
import { ContactsFormComponent } from '../contacts-form/contacts-form.component';

@Component({
  selector: 'app-contacts-home',
  templateUrl: './contacts-home.component.html',
  styleUrls: ['./contacts-home.component.scss']
})
export class ContactsHomeComponent implements OnInit {

  @Input('iglesia') iglesia;
  @Input('display_close_button') display_close_button = false;
  @Output('trigger_close_button') trigger_close_button = new EventEmitter();
  // @Input('origin') origin;
  currentUser: User; // Interfaces
  iglesiaContactos: IglesiaContactoModel[];
  iglesiaContactosOriginal: IglesiaContactoModel[];
  public totalContact: number;
  public pipelines: any = [];
  public selectedContact: any;
  show_form: boolean = false;

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  // Datatables
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: 'Blfrtip',
    lengthMenu: [10, 25, 50, 100, 250, 500],
    buttons: [
      { extend: 'copy', className: 'btn btn-outline-citric btn-sm' },
      { extend: 'print', className: 'btn btn-outline-citric btn-sm' },
      { extend: 'csv', className: 'btn btn-outline-citric btn-sm' },
    ]
  };

  constructor(
    private userService: UserService,
    private api: ApiService,
    private route: ActivatedRoute
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  ngOnInit() {
    this.getContactos();
  }

  getContactos() {
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
    this.api.get('getAgendaByIdIglesia',
      // Params
      { idIglesia }
    )
      .subscribe((data: any) => {
        if (data.contactos) {
          this.iglesiaContactos = data.contactos;
        } else {
        }
      }, err => {
        console.error(err);
        this.api.showToast(`Error getting contacts...`, ToastType.error);
      });
  }

  addContact(contact_form: ContactsFormComponent) {
    this.show_form = true;
    contact_form.contact = undefined;
    contact_form.ngOnInit();
  }

  dismissContactForm(response) {
    if (response) {
      this.ngOnInit();
    }
    this.show_form = false;
  }

  close() {
    this.trigger_close_button.emit();
  }

  editContact(contact_form: ContactsFormComponent, contacto) {
    contact_form.contact = contacto;
    contact_form.ngOnInit();
    this.show_form = true;
  }

  deleteContact(contact: IglesiaContactoModel) {
    if (confirm(`Delete this Contact?`)) {
      contact.estatus = false;
      this.api.post('insertUpdateIglesiaContacto', contact)
        .subscribe((data) => {
          this.api.showToast(`Contact deleted successfully.`, ToastType.success);
          this.getContactos();
        });
    }
  }

}
