import { UserService } from "src/app/services/user.service";

export class EntryGroupModel {
    idEntryGroup: number;
    idOrganization: number;
    name: string;
    description: string;
    status: boolean;
    created_by: number;
    created_at: Date | string;
    deleted_by: number;
    deleted_at: Date | string;
    entries: any[];

    constructor() {
        const user = UserService.getCurrentUser();
        this.idOrganization = user.idIglesia;
        this.name = '';
        this.description = '';
        this.status = true;
        this.entries = [];
        this.created_by = user.idUsuario;
    }
}