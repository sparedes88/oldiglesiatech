import { MailingListModel } from './MailingListModel';
import { GalleryModel } from './GalleryModel';
import { CommunityBoxModel } from './CommunityBoxModel';
import { BookingModel } from './BookingModel';
import { PlaylistModel } from './VideoModel';
import { GroupModel } from './GroupModel';

export class TemplateModel {
    idTemplate: number;
    nombre: string;
    description: string;
    nombreTemplate: string;
    sampleImage: string;
    dateCreated: string;
    dateEdited: string | Date;
    sampleImageWeb: string;
    sampleImageTablet: string;
    require_extra_info: boolean;

    constructor() {

    }
}

export class ConfigurationTabTemplateModel {
    idConfiguracionTabsTemplates: number;
    idConfiguracionTab: number;
    idTemplate: number;
    nombreTemplate: string;
    nombre: string;
    idGroupCategories: number | number[];
    created_by: number;
    giving_info: ConfigurationTabTemplateGivingModel;
    booking_info: BookingModel;
    playlist_info: PlaylistModel;
    group_info: GroupModel;
    community_box_info: CommunityBoxModel;
    mailing_list_info: MailingListModel;
    gallery_info: GalleryModel;
    grid_info: any;
    link_page: string;
    open_external: boolean;
    events_info: ConfigurationTabTemplateEventModel
    detail_info: any;
    header_items: { id: number }[];

    constructor() {
        this.idConfiguracionTabsTemplates = 0;
        this.idConfiguracionTab = 0;
        this.idTemplate = 1;
    }
}

export class ArticuloTemplateModel extends ConfigurationTabTemplateModel {
    idArticuloTemplate: number;
    idArticulo: number;

    constructor() {
        super();
        this.idArticulo = 0;
        this.idArticuloTemplate = 0;
    }
}

export class ConfigurationTabTemplateGivingModel {
    id: number;
    idConfiguracionTabTemplate: number;
    header_text: string;
    subheader_text: string;
    button_text: string;
    donation_url: string;
    background_picture: string;
    status: boolean;
    created_by: number;
    created_at: string | Date;
    deleted_by: number;
    deleted_at: string | Date;
    giving_buttons: ConfigurationTabTemplateGivingButtonModel[];
}

export class ConfigurationTabTemplateEventModel {
    id: number;
    idConfiguracionTabTemplate: number;
    display_register_button: string;
    status: boolean;
    created_by: number;
    created_at: string | Date;
    deleted_by: number;
    deleted_at: string | Date;
}

export class ConfigurationTabTemplateGivingButtonModel {
    id: number;
    idGivingTemplate: number;
    button_text: string;
    donation_url: string;
    button_color: string;
    status: boolean;
    created_by: number;
    created_at: string | Date;
    deleted_by: number;
    deleted_at: string | Date;
}
