export class IglesiaContactoModel {
    idAgendaContactoIglesia: number;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
    posicion: string;
    estatus: boolean;
    idIglesia: number;

    correos: CorreosModel[];
    telefonos: TelefonosModel[];

    emails?: any[];
    phones?: any[];

    constructor() {
        this.idAgendaContactoIglesia = 0;
        this.nombre = '';
        this.apellido = '';
        this.correo = '';
        this.telefono = '';
        this.posicion = '';
        this.estatus = true;
        this.idIglesia = 0;

        this.correos = [];
        this.telefonos = [];
    }
}

export class TelefonosModel {
    idAgendaContactoTelefono: number;
    idAgendaContactoIglesia: number;
    telefono: string;
    estatus: boolean;

    constructor() {
        this.telefono = '';
        this.estatus = true;
        this.idAgendaContactoTelefono = 0;
    }
}

export class CorreosModel {
    idAgendaContactoCorreo: number;
    idAgendaContactoIglesia: number;
    correo: string;
    estatus: boolean;

    constructor() {
        this.correo = '';
        this.estatus = true;
        this.idAgendaContactoCorreo = 0;
    }
}
