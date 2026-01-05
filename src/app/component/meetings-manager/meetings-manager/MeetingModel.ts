import { NetworkOrganizationModel } from "src/app/pages/networks/NetworkModel";


export class MeetingModel {
    idOrganizationMeeting: number;
    idOrganization: number;
    name: string;
    meeting_start: string;
    meeting_start_parsed: string;
    meeting_end: string;
    meeting_end_parsed: string;
    is_this_live: boolean;
    networks_on_live: string | number[];
    networks_on_live_temp: string | NetworkOrganizationModel[];
    days_on_live: string | number[];
    days_on_live_temp: string | any[];
    created_at: string | Date;
    created_by: number;
    status: boolean;
    deleted_by: number
    deleted_at: string | Date;
    days_name: string;
}
