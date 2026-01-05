export class NoteModel {
    descripcion: string;
    original_descripcion: string;
    estatus: boolean;
    fechaCreacion: string | Date;
    idIglesia: number;
    idNotaIglesia: number;
    summary: string;
    hasBeenSanitized: boolean;
    createdBy: number;
    user_created_by?: string;
    nombreIglesia?: string;
    idNoteTrack?: number;

    constructor() {
        this.descripcion = '';
        this.estatus = true;
        this.fechaCreacion = new Date();
        this.idIglesia = 0;
        this.idNotaIglesia = 0;
    }
}
