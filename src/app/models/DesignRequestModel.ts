import { TimeSheetModel } from './TimeSheetModel';
import * as moment from 'moment';

export class DesignRequestModel {
    idDesignRequest: number;
    idDesignRequestStatus: number;
    idIglesia: number;
    idDesignRequestType: number;
    idDesignRequestPriority: number;
    other: string;
    description: string;
    designerCriteria: boolean;
    specifiedColors: string;
    quantity: number;
    deadline: Date | string;
    idUser: number;
    status: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;

    useImages: DesignRequestImageModel[];
    referenceImages: DesignRequestImageModel[];
    images: DesignRequestImageModel[];

    iglesia?: string;
    designRequestStatus?: string;
    designRequestType?: string;
    designRequestPriority?: string;
    user?: string;
    assignedTo: number;
    userAssignedTo: string;
    estimatedTime: number;
    completedTime: number;
    timesheets: TimeSheetModel[];
    topic: string;
    notes: DesignRequestNoteModel[];
    title: string;
    phone?: string;
    email?: string;
    isSuperUser?: boolean;
    color?: string;
    show_trim?: boolean;
    priority?: number;
    is_ready?: boolean;
    platform?: string;
    idDesignRequestModule?: number;
    idDesignRequestParentStatus: number;
    designRequestModule?: string;

    idGroupEvent?: number;
    is_help_request?: boolean;

    constructor() {
        this.idDesignRequestStatus = 0;
        this.idIglesia = 0;
        this.idDesignRequestType = 0;
        this.other = '';
        this.description = '';
        this.designerCriteria = true;
        this.specifiedColors = '';
        this.quantity = 1;
        this.deadline = moment().add(3, 'day').format('YYYY-MM-DD');
        this.idUser = 0;
        this.status = true;

        this.useImages = [];
        this.referenceImages = [];
        this.assignedTo = 0;
        this.estimatedTime = 0;
        this.notes = [];
        this.title = '';
        this.is_ready = false;
        this.platform = '';
        this.idDesignRequestPriority = 0;
        this.idDesignRequestModule = 0;
    }
}

export class DesignRequestStatusModel {
    idDesignRequestStatus: number;
    name: string;
    description: string;
    status: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
    summary: number;
    color?: string;
    idDesignRequestParentStatus: number;
    idIglesia?: number;

    constructor() {
        this.idDesignRequestStatus = 0;
        this.name = '';
        this.description = '';
        this.status = true;
    }
}

export class DesignRequestTypesModel {
    id?: number;
    idDesignRequestType: number;
    idDesignRequestPriority?: number;
    name: string;
    description: string;
    status: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;

    constructor() {
        this.idDesignRequestType = 0;
        this.name = '';
        this.description = '';
        this.status = true;
    }
}

export class DesignRequestImageModel {
    idDesignRequestImage: number;
    idDesignRequest: number;
    idDesignRequestImageType: number;
    url: string;
    idUser: number;
    status: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
    originalUrl: string;
    type: string;
    blob: any;
    file: File;

    constructor() {
        this.idDesignRequest = 0;
        this.idDesignRequestImageType = 0;
        this.url = '';
        this.idUser = 0;
        this.status = true;
    }
}

export class DesignRequestNoteModel {
    idDesignRequestNote: number;
    idDesignRequest: number;
    content: string;
    is_private: boolean;
    hasBeenSanitized: boolean;
    original_content: boolean;

    status: boolean;
    createdBy: number;
    createdAt: Date | string;
    uploadedAt: Date | string;
    deletedBy: number;
    deletedAt: Date | string;
    summary: string;
    userCreatedBy: string;

    constructor() {
        this.idDesignRequestNote = 0;
        this.content = '';
        this.is_private = true;
        this.hasBeenSanitized = false;
        this.status = true;
    }
}


export class DesignRequestNoteStatusModel {
}
