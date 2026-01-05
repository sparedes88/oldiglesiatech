import { OportunidadModel } from './OportunidadModel';

export class EstadoClienteVentaModel {

    idEstadoClienteVenta: number;
    nombre: string;
    valorExpectativo: number;
    oportunidades: OportunidadModel[];
    oportunidades_Original: OportunidadModel[];

}
