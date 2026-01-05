import { AddressModel } from './../component/google-places/google-places.component';
import { TagModel } from './TagModel';
import * as moment from 'moment';

export class DatosPagosIglesiaModel {
  idCatalogoPlan: number;
  IdTipoDePago: number;
  servicioActivo: boolean;

  constructor() {
    this.idCatalogoPlan = 0;
    this.IdTipoDePago = 0;
    this.servicioActivo = false;
  }
}

export class DatosProyectoIglesiaModel {
  idUsuarioSistema: number;
  fechaInicioProyecto: Date | string;
  fechaCompraDominio: Date | string;
  enlaceProveedorDominio: string;
  usuarioProveedorDominio: string;
  passProveedorDominio: string;

  constructor() {
    this.idUsuarioSistema = 0;
    this.fechaInicioProyecto = moment().format('YYYY-MM-DD');
    this.fechaCompraDominio = moment().format('YYYY-MM-DD');
    this.enlaceProveedorDominio = 'https://';
    this.usuarioProveedorDominio = '';
    this.passProveedorDominio = '';
  }
}

export class OrganizationModel {
  idIglesia: number;
  Nombre: string;
  topic: string;

  Calle?: string;
  Ciudad?: string;
  Estatus?: boolean;
  Logo?: string;
  NoExt?: string;
  OtrosDatos?: string;
  Provincia?: string;
  ZIP?: string;

  idCatalogoPlan?: number;
  idTipoServicio?: number;
  plan?: string;
  tipoServicio?: string;
  agendaContactos?: any[];
  // agendaContactos?: IglesiaContactoModel[];
  notas?: any[];
  // notas?: NotasModel[];
  // tags?: any[] | any;
  tags?: TagModel[] | TagModel;

  idIdioma?: number;

  datosPagosIglesia?: DatosPagosIglesiaModel;
  datosProyectoIglesia?: DatosProyectoIglesiaModel;
  cuponesIglesias?: any;
  idUsuario: number;
  donateUrl: string;
  is_featured?: boolean;

  profile?: any;
  country?: string;
  lat?: number;
  lng?: number;
  full_address?: string;
  address?: AddressModel;
  country_code: string;
  timezone?: string;
  portadaArticulos?: string;
  site_v2?: boolean;
  site_v2_url?: string;
  organization_categories: any[];
  denominations: any[];
  created_by?: number;
  categories_ids: number[];
  denomination_ids: number[];

  constructor() {
    this.idCatalogoPlan = 0;
    this.idIdioma = 0;
    this.idTipoServicio = 0;
    this.datosPagosIglesia = new DatosPagosIglesiaModel();
    this.datosProyectoIglesia = new DatosProyectoIglesiaModel();
    this.cuponesIglesias = {
      idCupon: 0
    };
    this.tags = new TagModel();
    this.is_featured = false;
  }
}

export class UserOrganizationBudgetModel {
  idUserOrganizationBudget: number;
  idOrganization: number;
  budget: number;
  status: boolean;
  created_by: number;
  created_at: Date | string;

  constructor() {
    this.budget = 0;
  }
}

export class OrganizationSetupModel {
  id: number;
  idOrganization: number;
  profile_confirm_your_assistance: string;
  profile_donation_text: string;
  profile_progress_text: string;
  profile_contact_text: string;


  constructor() {
    this.profile_confirm_your_assistance = '';
    this.profile_donation_text = '';
    this.profile_progress_text = '';
    this.profile_contact_text = '';
  }
}
