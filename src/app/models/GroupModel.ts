import { UserService } from '../services/user.service';
import * as moment from 'moment';
import * as moment_timezone from 'moment-timezone';
export class GroupModel {
    idGroup: number;
    idOrganization: number;
    idGroupType: number;
    picture: string;
    title: string;
    state: string;
    city: string;
    street: string;
    zip_code: string;
    short_description: string;
    long_description: string;
    status: boolean;
    idLevelAccess: number;
    created_at: Date | string;
    created_by: number;
    updated_at: Date | string;
    deleted_by: number;
    deleted_at: Date;

    leaders: any[];
    members: any[];
    requests: any[];
    categories: GroupCategoryModel[];

    levelAccess: string;
    level_access: string;
    is_leader: boolean;

    message_count: number;
    idMailingList: number;
    idGallery: number;
    location?: string;
    country?: string;
    lat?: number;
    lng?: number;
    id: number;
    text: string;
    requests_count?: number;
    organization_picture?: string;
    items?: any[];
    is_external?: boolean;
    external_url?: string;

    constructor() {
        this.idOrganization = 0;
        this.idGroupType = 0;
        this.picture = '';
        this.title = '';
        this.state = '';
        this.city = '';
        this.street = '';
        this.zip_code = '';
        this.short_description = '';
        this.long_description = '';
        this.status = true;
        this.idLevelAccess = 0;
    }
}

export class FrequencyModel {
    id: number;
    segment: string;
    quantity: number;
    is_exact_date: boolean;
    name: string;
    created_by: number;
    created_at: Date | string;

}

export class GroupCategoryModel {
    id?: number;
    idGroupCategory: number;
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

export class GroupMemberModel {
    idGroupUser: number;
    name: string;
    lastName: string;
    picture: string;
    email: string;
    is_leader: boolean;
    created_at: Date | string;
    created_by: number;
    deleted_at: Date | string;
    deleted_by: number;
    member_since: Date | string;
    status: boolean;
    idGroup: number;
    internal_status_id?: number;
    internal_status_name?: string;
    wait?: boolean;
    wait_decline?: boolean;
    wait_accept?: boolean;
}

export class GroupEventModel {

    idGroupEvent: number;
    idGroup: number;
    name: string;
    description: string;
    idFrequency: number;
    start_date: Date | string;
    end_date: Date | string;
    event_as_range: boolean;
    event_date: Date | string;
    event_date_start: Date | string;
    event_date_end: Date | string;
    event_time_start: Date | string;
    event_time_end: Date | string;
    repeat_until_date: Date | string;
    idLocation: number;
    status: boolean;
    created_by: number;
    created_at: Date | string;
    deleted_by: number;
    deleted_at: Date | string;

    quantity: number;
    segment: string;

    next_date: Date | string;
    // tslint:disable-next-line: variable-name
    event_date_: Date | string;
    selected_frequency: FrequencyModel;
    is_exact_date: boolean;
    color: { primary: string; secondary: string; };
    days: GroupEventDayModel[];
    attendances_count: number;
    attendances_total: number;
    is_leader: boolean;
    activities: GroupEventActivityModel[];
    picture: string;
    button_text: string;
    button_color: string;
    live_event_url: string;
    capacity: number;
    idOrganization?: number;
    is_member?: boolean;
    organization_logo?: string;
    organization_name?: string;
    attendances_available: boolean;
    confirmation_number: string;
    guests?: number;
    help_request?: boolean;
    location?: string;

    design_request: any;
    full_end_date?: any;
    frequency?: string;
    full_start_date?: any;
    timezone: string;
    start_date_format?: string;
    country?: string;
    state?: string;
    street?: string;
    zip_code?: string;
    city?: string;
    lat?: number;
    lng?: number

    start_time?: string;
    end_time?: string;
    is_same_date?: boolean;
    event_current_week?: string;
    same_address_as_church: boolean;

    custom_dates?: any[];
    is_v2: boolean;
    settings: any;
    title: string;
    ticket_cost: number;
    has_cost: boolean;
    has_capacity: boolean;
    has_live_url: boolean;
    all_day: boolean;
    full_address?: string;

    constructor() {
        const user = UserService.getCurrentUser();
        this.name = '';
        this.description = '';
        this.idFrequency = 0;
        this.start_date = moment().format('YYYY-MM-DD');
        this.end_date = moment().format('YYYY-MM-DD');
        this.event_as_range = false;
        this.event_date = moment().format('YYYY-MM-DD');
        this.event_date_start = moment().format('YYYY-MM-DD');
        this.event_date_end = moment().format('YYYY-MM-DD');
        this.event_time_start = moment().format('YYYY-MM-DD');
        this.event_time_end = moment().format('YYYY-MM-DD');
        this.repeat_until_date = moment().format('YYYY-MM-DD');
        this.idLocation = 0;
        this.status = true;
        this.created_by = user ? user.idUsuario : undefined;
        this.timezone = moment_timezone.tz.guess();
        this.same_address_as_church = true;
    }
}

export class GroupEventDayModel {
    idGroupEventDay: number;
    idDay: number;
    idGroupEvent: number;
    event_time_start: string;
    event_time_end: string;
    has_specific_hour: boolean;

    idDia: number;

    constructor() {
        this.idDay = 0;
        this.event_time_start = undefined;
        this.event_time_end = undefined;
    }
}

export class GroupMessageModel {
    idGroupMessage: number;
    idGroup: number;
    message: string;
    date_sent: Date | string;
    idUser: number;
    status: boolean;
    created_at: Date | string;
    created_by: number;
    deleted_at: Date | string;
    deleted_by: number;
    room: string;
    nickname: string;

    has_attachments: boolean;
    attachments: string;

    constructor() {
        this.message = '';
        this.date_sent = new Date();
        this.idUser = UserService.getCurrentUser().idUsuario;
        this.has_attachments = false;
    }
}

export class GroupEventActivityModel {
    idGroupEventActivity: number;
    idGroupEvent: number;
    description: string;
    activity_duration: number;
    idGroupTeam: number;
    resources: string;
    files: any[] | string;
    created_by: number;
    created_at: string | Date;
    status: boolean;
    deleted_by: number;
    deleted_at: string | Date;
    sort: number;
    original_sort: number;
    notes: string;

    group_name: string;
    time_start: string;
    time_end: string;

    members: GroupMemberModel[];
}

export class GroupEventReviewModel {
    idGroupEventReview: number;
    idGroupEvent: number;
    idGroupEventReviewStatus: number;
    description: string;
    idGroupTeam: number;
    created_by: number;
    created_at: string | Date;
    status: boolean;
    deleted_by: number;
    deleted_at: string | Date;

    notes: any[];
    group_name: string;
    review_status: string;
}

export class GroupEventReviewStatusModel {
    idGroupEventReviewStatus: number;
    name: string;
    description: string;
    created_by: number;
    created_at: string | Date;
    status: boolean;
    deleted_by: number;
    deleted_at: string | Date;

    constructor() {
        this.name = '';
        this.description = '';
    }
}

export class GroupEventFinanceModel {
    idGroupEventFinance: number;
    idGroupEvent: string;
    is_spent: boolean;
    description: string;
    notes: string;
    idGroupEventFinanceCategory: number;
    receipt_files: any[] | string;
    budget: number;
    amount: number;
    created_by: number;
    created_at: string | Date;
    status: boolean;
    deleted_by: number;
    deleted_at: string | Date;

    category_name: string;
}

export class GroupEventFinanceCategoryModel {
    idGroupEventFinanceCategory: number;
    name: string;
    description: string;
    created_by: number;
    created_at: string | Date;
    status: boolean;
    deleted_by: number;
    deleted_at: string | Date;
}

export class GroupEventAttendanceModel {
    idGroupEventAttendance: number;
    idUser: number;
    name: string;
    lastName: string;
    idGroupUser: number;
    idGroupEvent: number;
    attended: boolean;
    original_attended: boolean;
    created_by: number;
    created_at: string | Date;
    status: boolean;
    deleted_by: number;
    deleted_at: string | Date;
    already_member?: boolean;

    email?: string;
    phone?: string;
    covid_quest?: boolean;
    guests?: number;
    confirmation_number?: string;
    index?: number;
}

export class GroupNoteModel {
    idGroupNote: number;
    idGroup: number;
    submitted_date: string | Date;
    note: string;
    created_by: number;
    created_at: string | Date;
    updated_by: number;
    updated_at: string | Date;
    status: boolean;
    deleted_by: number;
    deleted_at: string | Date;
    attached_file: string;

    user_created_by: string;
    user_updated_by: string;
    user_deleted_by: string;
}

export class GroupDocumentModel {
    idGroupDocument: number;
    name: string;
    file_url: string;
    created_by: number;
    created_at: string | Date;
    status: boolean;
    deleted_by: number;
    deleted_at: string | Date;

    user_created_by: string;
    user_deleted_by: string;
    updated_by?: number;
    _editable?: boolean;
}
