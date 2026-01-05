import { UserService } from '../services/user.service';
import * as moment from 'moment';

export class MailingListContactCategoryModel {
    idMailingListContactStatus: number;
    idOrganization: number;
    name: string;
    description: string;
    status: boolean;
    created_by: number;
    created_at: Date | string;
    deleted_by: number;
    deleted_at: Date | string;

    constructor() {
        const user = UserService.getCurrentUser();
        this.idOrganization = user.idIglesia;
        this.name = '';
        this.description = '';
        this.status = true;
        this.created_by = user.idUsuario;
    }
}