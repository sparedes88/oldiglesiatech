export class UserLogModel {
    idUserOrganizationLog: number;
    idActivityType: number;
    idUserOrganization: number;
    submitted_date: string | Date;
    note: string;
    createdBy: number;
    createdAt: string | Date;
    updatedBy: number;
    updatedAt: string | Date;
    status: boolean;
    deletedBy: number;
    deletedAt: string | Date;
    attached_file: string;

    user_created_by: string;

    constructor() {

    }
}

export class UserCommitmentsManageModel {
    idUserCommitmentManage: number;
    idUserOrganization: number;
    name: string;
    description: string;
    idFrequency: number;
    start_date: string | Date;
    commitment_date: string | Date;
    repeat_until_date: string | Date;
    status: boolean;
    created_by: number;
    created_at: string | Date;
    deleted_by: number;
    deleted_at: string | Date;

    quantity?: number;
    segment?: string;
}

export class UserCommitmentsModel {
    idUserCommitmentRecord: number;
    idUserCommitmentManage: number;
    name: string;
    accomplished: boolean;
    commitment_date: string | Date;
    status: boolean;
    created_by: number;
    created_at: string | Date;
    deleted_by: number;
    deleted_at: string | Date;
}
