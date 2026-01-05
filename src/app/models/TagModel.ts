export class TagModel {
    idCatalogoTag: number;
    nombre: string;
    fechaCreacion: string | Date;
    estatus: boolean;
    descripcion: string;
    color: string;
    Tags: number[];

    constructor() {
        this.idCatalogoTag = 0;
        this.nombre = '';
        this.fechaCreacion = '';
        this.estatus = true;
        this.descripcion = '';
        this.color = '';
        this.Tags = [];
    }
}
