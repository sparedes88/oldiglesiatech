
export class UsTabSettingsModel {
    id: number;
    idIglesiaProfile: number;
    idProfileTab: number;
    categories: UsTabSettingsCategoryModel[];
}

export class UsTabSettingsCategoryModel {
    id: number;
    idIglesiaProfile: number;
    idProfileTab: number;
    idCategoryArticle: number;
    idDonationForm?: number;
    idGallery?: number;
    idPlaylist?: number;
    idMailingList?: number;
    col_size: number;
    created_by?: number;
    created_at?: Date | string;
    status: boolean;
    deleted_by?: number;
    deleted_at?: Date | string;
    sort_by: number;
    text_align?: string;
    background_color?: string;
    active_background_color?: string;
    hover_background_color?: string;
    font_color?: string;
    font_weight?: string;
    font_style?: string;
    font_size?: string;

    contact_language?: string;
    idCommunityBox?: number;
    display_new_style?: boolean;

    idGroupType?: number;
    idGroupCategory?: number;
    text_color?: string;
    degrees?: number;
    main_color?: string;
    main_percent?: number;
    second_color?: string;
    second_percent?: number;
    show_shadow?: boolean;
    display_header?: boolean;
    items_per_row?: number;
    idGroupViewMode?: number;
    sort_type?: 'date_asc' | 'date_desc' | 'alpha_asc' | 'alpha_desc';
    idGalleryViewMode?: number;
    idGalleryAlbum?: number;
}
