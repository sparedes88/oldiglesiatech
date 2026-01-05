import { ApiService } from '../../services/api.service';
import { Component, OnInit } from '@angular/core';
import { MatDialog} from '@angular/material';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { DataTableDirective } from 'angular-datatables';

import { User } from '../../interfaces/user';

@Component({
  selector: 'app-salon',
  templateUrl: './salon.component.html',
  styleUrls: ['./salon.component.scss']
})
export class SalonComponent implements OnInit {

  currentUser: User;
  public contacts: any = [];
  public pasarId: number;
  public pasarSalon: string;
  public pasarSpace: number;
  public pasarDescripcion: string;
  public recuperSalon: string;
  public recuperId: string;
  public recuperDescrip: string;
  public recuperEspacio: number;
  public recuperModal: boolean = true;
  public addDescrip: string;
  public addSpace: number;
  public addNewSalon: string;
  public model: any = {};
  constructor(
    private api: ApiService,
    public modal: NgxSmartModalService
  ) {   }

  salones = [
    { id: 1, salon: 'Uso multiple', espacio: 10, description : 'Lugar muy amplio'},
    { id: 2, salon: 'Castillo', espacio: 25, description : 'Esta en condiciones aceptables'},
    { id: 3, salon: 'Anfitiatro', espacio: 30, description : 'El lugar esta por caerse a pedasos'}
  ]

  ngOnInit() {
  }

  addSalon()
  {
    this.modal.getModal('formModal').open();
  }
  // Borro un valor
  deleteSalon(i): void
  {
     var answer = confirm('Are you sure you want to delete?');
     if(answer)
     {
       this.salones.splice(i,1)
     }
  }
  //Tomo los valores para pasarlo
  editSalon(i)
  {
    this.pasarId = this.salones[i].id;
    this.pasarSalon = this.salones[i].salon;
    this.pasarSpace = this.salones[i].espacio;
    this.pasarDescripcion = this.salones[i].description;
    this.modal.getModal('editModal').open();
  }


  addNombreSalon(eNombre)
  {
    this.addNewSalon = eNombre;
    console.log(this.addNewSalon);
  }
  addSpaceSalon(eSpace)
  {
    this.addSpace = eSpace;
    console.log( this.addSpace);
  }
  addDescripSalon(eDescripcion)
  {
    this.addDescrip = eDescripcion;
    console.log(this.addDescrip);
    this.model = {salon: this.addNewSalon,  espacio: this.addSpace, description: this.addDescrip };
    this.salones.push(this.model);
    this.modal.closeLatestModal();

  }


  recuperarNombreSalon(e)
  {
    this.recuperSalon = e;
    this.recorrerSalones();
  }
  recuperarDescripSalon(e)
  {

    this.recuperDescrip = e;
    this.modal.closeLatestModal();
    this.recorrerSalones();

  }
  recuperarSpaceSalon(e)
  {
    this.recuperEspacio = e;
    this.recorrerSalones();
  }
  recorrerSalones()
  {
    for(let entry in this.salones)
    {
       if(this.salones[entry].salon == this.recuperSalon)
       {
            this.salones[entry].espacio = this.recuperEspacio;
            this.salones[entry].description = this.recuperDescrip;
       }
    }
  }
  recuperarModalSalon(e)
  {
    this.recuperModal = e;

  }

}
