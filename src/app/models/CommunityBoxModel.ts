export class CommunityBoxModel {
    id: number;
    idCommunityBox: number;
    name: string;
    description: string;
    style_settings: string;
    community_settings: string;
    design: string;
    idIglesia: number;
    status: boolean;
    category: string;
    display_new_style?: boolean;

    text_align?: string;
    active_background_color?: string;
    hover_background_color?: string;
    background_color?: string;
    font_color?: string;
    font_weight?: string;
    font_style?: string;
    font_size?: string;
    is_hover?: boolean;

    items?: any[];
}
