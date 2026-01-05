export class BookingModel {
    idBookingCalendar: number;
    calendar_id: string;
    summary: string;
    description: string;
    idOrganization: number;
    created_at: string | Date;
    created_by: number;
    status: boolean;
    deleted_at: string | Date;
    deleted_by: number;

    user_created_by: string;
    user_deleted_by: string;

    settings: BookingSettingsModel;
    events: GoogleCalendarEvent[];
    preview_url: string;
}

export class BookingSettingsModel {
    idBookingSetting: number;
    idBookingCalendar: number;
    idBookingIncrementDuration: number;
    has_break: boolean;
    break_start: string;
    break_end: string;
    created_at: string | Date;
    created_by: number;
    status: boolean;
    deleted_at: string | Date;
    deleted_by: number;
    name: string;
    duration_minutes: number;
    days: BookingSettingsDaysModel[];
    original_days: BookingSettingsDaysModel[];
}

export class BookingSettingsDaysModel {
    idBookingSettingDay: number;
    idDay: number;
    name: string;
    time_start: string;
    time_end: string;
    is_available: boolean;
}

export class GoogleCalendarEvent {
    created?: string | Date;
    creator?: {
        email: string;
    };
    originalStartTime: {
        dateTime: string | Date;
        timeZone: string;
    };
    end: {
        dateTime: string | Date;
        timeZone: string;
    };
    start: {
        dateTime: string | Date,
        timeZone: string
    };
    etag?: string;
    htmlLink?: string;
    iCalUID?: string;
    id?: string;
    kind?: string;
    organizer?:
        {
            email: string,
            displayName: string,
            self: boolean
        };
    reminders?: { useDefault: boolean };
    sequence?: number;
    status?: string;
    summary: string;
    description: string;
    updated?: string | Date;
    attendees: any[];
    calendarId: string;
}

export class BookingIncrementDurationModel {
    idBookingIncrementDuration: number;
    name: string;
    duration_minutes: number;
    created_at: string | Date;
    created_by: number;
    status: boolean;
    deleted_at: string | Date;
    deleted_by: number;
}

export class BookingSessionModel {
    idBookingSession: number;
    idBookingCalendar: number;
    idBookingSettingDay: number;
    summary: string;
    description: string;
    session_date: string | Date;
    start_time: string;
    end_time: string;
    was_reschedule: boolean;
    original_date: string;
    original_start_time: string;
    original_end_time: string;
    created_at: string | Date;
    created_by: number;
    status: boolean;
    deleted_at: string | Date;
    deleted_by: number;
    start_time_formatted: string;
    end_time_formatted: string;
}


export class GoogleUserInfoModel {
    email: string;
    name: string;
    id: string;
    given_name: string;
    picture: string;
    token?: string;
    created_by?: number;
    expiry_date?: string;
}

export class TokenModel {
    access_token: string;
    scope: string;
    token_type: string;
    expiry_date: string;
    id_token: string;
    refresh_token: string;
}

export class BookingDayModel {
    id: number;
    name: string;
    index_day: number;
    appointments: BookingDayAppointmentModel[];
    date?: string;
    idBookingSettings?: number;
}

export class BookingDayAppointmentModel {
    start_time: string;
    start_time_formatted: string;
    end_time: string;
    available: boolean;
}

export class GoogleCalendarModel {
    id: string;
    summary: string;
    description: string;
    selected: boolean;
    kind: string;
    etag: string;
    timeZone: string;
    accessRole: string;
    backgroundColor: string;
    foregroundColor: string;
    colorId: string;

    user_google_id: string;
    idOrganization: number;
    created_by: number;
}
