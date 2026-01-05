import { TagModel } from './TagModel';

export class OportunidadModel {
    idOportunidades: number;
    nombre: string;
    descripcion: string;
    valorExpectativo: number;
    idEstadoClienteVenta: number;
    estatus: boolean;

    idAgendaContactoIglesia: number;
    iglesia?: any;
    tags: TagModel[];

    constructor() {
        this.idOportunidades = 0;
        this.nombre = '';
        this.descripcion = '';
        this.valorExpectativo = 0;
        this.idEstadoClienteVenta = 0;
        this.idAgendaContactoIglesia = 0;
        this.estatus = true;
        this.iglesia = {
            idIglesia: 0,
            Nombre: '',
            topic: ''
        };
        this.tags = [];
    }
}
