import { OrganizationModel } from './OrganizationModel';
import { DesignRequestModel } from './DesignRequestModel';
import * as moment from 'moment';

export class TimeSheetModel {
    idTimesheet: number;
    idProject: number;
    idUser: number;
    idDepartment: number;
    idWorkType: number;
    notes: string;
    workHours: number;
    workDate: Date | string;
    status: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;

    workType?: string;
    project?: string;
    department?: string;

    iglesias?: OrganizationModel[];
    departamentos?: DepartamentoModel[];
    workTypes?: WorkTypeModel[];
    day?: number;
    idDia?: number;
    name?: string;
    fullName?: string;

    designRequest?: DesignRequestModel;
    requests?: DesignRequestModel[];
    associatedDesignRequest: number;

    constructor() {
        this.idProject = 0;
        this.idUser = 0;
        this.idDepartment = 0;
        this.idWorkType = 0;
        this.notes = '';
        // this.workHours = 0;
        this.status = true;

        this.workDate = moment().format('YYYY-MM-DD');

        this.iglesias = [];
        this.workTypes = [];
        this.departamentos = [];
        this.requests = [];
    }
}

export class WorkTypeModel {
    idWorkType: number;
    name: string;
    description: string;
    status: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export class DepartamentoModel {
    idDepartamento: number;
    nombre: string;
    fachaCreacion: Date | string;
    estatus: boolean;
}
