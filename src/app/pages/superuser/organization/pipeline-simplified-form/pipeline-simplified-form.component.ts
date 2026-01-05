import { OrganizationFormComponent } from '../organization-form/organization-form.component';
import { ToastType } from 'src/app/login/ToastTypes';
import { EstadoClienteVentaModel } from '../../../../models/PipeLineModel';
import { ApiService } from 'src/app/services/api.service';
import { Observable } from 'rxjs';
import { FormGroup, NgForm, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit, EventEmitter, Output, ViewChild, Input } from '@angular/core';
import { TagModel } from 'src/app/models/TagModel';
import { MultiSelectComponent } from 'ng-multiselect-dropdown';
import { ContactsFormComponent } from '../../contacts/contacts-form/contacts-form.component';
import { OrganizationModel } from 'src/app/models/OrganizationModel';

@Component({
  selector: 'app-pipeline-simplified-form',
  templateUrl: './pipeline-simplified-form.component.html',
  styleUrls: ['./pipeline-simplified-form.component.scss']
})
export class PipelineSimplifiedFormComponent implements OnInit {

  @Input('')
  // @ViewChild('select_contact') select_contact: MultiSelectComponent
  pipeline: any;
  @Output() dismiss_form = new EventEmitter();
  show_detail: boolean = true;

  show_form: boolean = false;
  show_organization_form: boolean = false;
  show_loader = true;

  contactsByIdIglesia: any[] = [];

  @Input('pipeline_form') pipeline_form: FormGroup = new FormGroup({
    nombre: new FormControl('', [Validators.required]),
    idIglesia: new FormControl(undefined),
    idAgendaContactoIglesia: new FormControl(undefined, []),
    tags: new FormControl([]),
    idEstadoClienteVenta: new FormControl(undefined, [Validators.required]),
    valorExpectativo: new FormControl(undefined, [Validators.required, Validators.min(0)]),
    descripcion: new FormControl('')
  });

  dropdowns: {
    iglesias: any[],
    estadosVenta: EstadoClienteVentaModel[],
    tags: TagModel[]
    agendaContactosIglesias: any[]
  } = {
      iglesias: [],
      estadosVenta: [],
      tags: [],
      agendaContactosIglesias: []
    };

  select_iglesias_options: any = {
    singleSelection: true,
    idField: 'idIglesia',
    textField: 'Nombre',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  };

  select_contacts_options: any = {
    singleSelection: true,
    idField: 'idAgendaContactoIglesia',
    textField: 'full_name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
    noDataAvailablePlaceholderText: 'Select an organization'
  };

  select_tags_options: any = {
    singleSelection: false,
    idField: 'idCatalogoTag',
    textField: 'nombre',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  };

  select_status_options: any = {
    singleSelection: true,
    idField: 'idEstadoClienteVenta',
    textField: 'nombre',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  };

  constructor(
    private form_builder: FormBuilder,
    private api: ApiService
  ) { }

  ngOnInit() {
    if (this.pipeline) {
      this.pipeline_form.addControl('idOportunidades', new FormControl(this.pipeline.idOportunidades, [Validators.required]));
    } else {
      this.pipeline_form.removeControl('idOportunidades');
      this.pipeline_form.reset();
    }
    this.loadItems();
  }

  loadItems() {
    this.api.get(`oportunidades/getPipelinesDropdowns/`, true)
      .subscribe((response: any) => {
        this.dropdowns = response;
        this.dropdowns.agendaContactosIglesias.map(x => x.full_name = `${x.nombre} ${x.apellido}`);
        if (this.pipeline) {
          if (this.pipeline.idOportunidades) {
            const pipeline = Object.assign({}, this.pipeline);
            pipeline.idAgendaContactoIglesia = [this.dropdowns.agendaContactosIglesias.find(x => x.idAgendaContactoIglesia === pipeline.idAgendaContactoIglesia)];
            pipeline.idEstadoClienteVenta = [this.dropdowns.estadosVenta.find(x => x.idEstadoClienteVenta === pipeline.idEstadoClienteVenta)];
            pipeline.idIglesia = [this.dropdowns.iglesias.find(x => x.idIglesia === pipeline.iglesia.idIglesia)];

            this.pipeline_form.patchValue(pipeline);
          }
        }
        this.filterContactsByIdIglesia();
      }, err => {
        console.error(err);
        this.close();
        this.api.showToast(`Error getting options...`, ToastType.error);
      });
  }

  submitPipeline(pipeline_form: FormGroup, group_form: NgForm) {
    this.show_detail = false;
    if (pipeline_form.valid) {
      const pipeline = pipeline_form.value;
      let subscription: Observable<any>;
      let success_message: string;
      let error_message: string;
      pipeline.idAgendaContactoIglesia = pipeline.idAgendaContactoIglesia[0].idAgendaContactoIglesia;
      pipeline.idEstadoClienteVenta = pipeline.idEstadoClienteVenta[0].idEstadoClienteVenta;
      if (pipeline.idIglesia[0]) {
        pipeline.iglesia = {
          idIglesia: pipeline.idIglesia[0].idIglesia
        };
      } else {
        setTimeout(() => {
          this.show_detail = true;
        }, 800);
        this.api.showToast(`You need to select an organization.`, ToastType.error);
        return;
      }
      if (pipeline.idOportunidades) {
        // update
        subscription = this.api.post(`oportunidades/updateOportunidad/`, pipeline);
        success_message = `Pipeline updated successfully.`;
        error_message = `Error updating Pipeline.`;
      } else {
        // add
        subscription = this.api.post(`oportunidades/saveOportunidad/`, pipeline);
        success_message = `Pipeline added successfully.`;
        error_message = `Error adding Pipeline.`;
      }
      subscription
        .subscribe(response => {
          this.api.showToast(`${success_message}`, ToastType.success);
          this.show_detail = true;
          this.close(true);
        }, error => {
          this.api.showToast(`${error_message}`, ToastType.error);
          console.error(error);
          this.show_detail = true;
        });
    } else {
      setTimeout(() => {
        this.show_detail = true;
      }, 800);
      this.api.showToast(`Please check the info provided. Some fields are required.`, ToastType.error);
    }

  }

  close(response?: boolean) {
    this.dismiss_form.emit(response);
  }

  filterContactsByIdIglesia() {
    this.contactsByIdIglesia = this.getContactsByIdIglesia();
  }

  getContactsByIdIglesia() {
    const iglesia = this.pipeline_form.get('idIglesia').value;
    if (iglesia) {
      if (iglesia.length > 0) {
        const idIglesia = iglesia[0].idIglesia;
        const users = this.dropdowns.agendaContactosIglesias.filter(contact => contact.idIglesia === idIglesia);
        if (users.length === 0) {
          this.select_contacts_options.noDataAvailablePlaceholderText = `This organization hasn't contacts`;
          // this.select_contact.settings = this.select_contacts_options;
        }
        return users;
      } else {
        this.select_contacts_options.noDataAvailablePlaceholderText = 'Select an organization';
        // this.select_contact.settings = this.select_contacts_options;
        return [];
      }
    } else {
      this.select_contacts_options.noDataAvailablePlaceholderText = 'Select an organization';
      // this.select_contact.settings = this.select_contacts_options;
      return [];
    }
  }

  addContact(contact_form: ContactsFormComponent) {
    this.show_form = true;
    contact_form.contact = undefined;
    const iglesia = this.pipeline_form.get('idIglesia').value;
    if (iglesia) {
      if (iglesia.length > 0) {
        contact_form.iglesia = iglesia[0];
      } else {
        contact_form.iglesia = undefined;
      }
    } else {
      contact_form.iglesia = undefined;
    }
    contact_form.ngOnInit();
  }



  dismissContactForm(response) {
    console.log(response);
    if (response === true) {
      this.loadItems();
    } else if (response) {
      response.full_name = `${response.nombre} ${response.apellido}`
      this.dropdowns.agendaContactosIglesias.push(response);
    }
    this.show_form = false;
  }

  goToAddOrganization(organization_form: OrganizationFormComponent) {
    this.show_loader = true;
    // this.modal.getModal('formModal').open();
    this.show_organization_form = true;
    organization_form.getDropdowns().then(resolved => {
      this.show_loader = false;
      organization_form.organization = new OrganizationModel();
      // organization_form.isEdit = false;
      organization_form.ngOnInit();
    });
  }

  onModalDidDismiss(response) {
    // this.modal.getModal('formModal').close();
    if (response) {
      this.loadItems();
    }
    this.show_organization_form = false;
    // this.hide_notes_form = false;
  }
}
