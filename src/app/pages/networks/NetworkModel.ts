export class NetworkModel {
    idNetwork: number;
    idOrganization: number;
    name: string;
    label_name: string;
    description: string;
    base_url: string;
    help_text: string;
    icon_path: string;
    icon_svg: string;
    is_custom_icon: boolean;
    background_color: string;
    text_color: string;
    action_type: string;
    created_by: number;
    created_at: string | Date;
    status: boolean;
    deleted_by: number;
    deletet_at: string | Date;
}

export class NetworkOrganizationModel extends NetworkModel {
    id: number;
    site_link: string;
    full_site_link?: string;
    custom_name: string;
    extra_params: string;
    sort_by: number;

    is_for_profile: boolean;
    is_for_ezlink: boolean;
    ezlink_category_id: number;
}
