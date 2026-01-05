import { ResourceModel } from "./RessourceModel";

export class VideoModel {
    idVideo: number;
    title: string;
    speaker: string;
    publish_date: string | Date;
    publish_date_fixed?: string | Date;
    embed_frame: string;
    description: string;
    idOrganization: number;
    created_by: number;
    created_at: string | Date;
    status: boolean;
    deleted_by: number;
    deleted_at: string | Date;
    categories: any[];
    playlists: PlaylistModel[];
    has_been_sanitize?: boolean = false;
    featured?: boolean;
    sermon_notes: string;
    url?: string;
    thumbnail?: string;
    idResourceThumbnail?: number;
    idMediaType: number;
    idResource: string;
    file_info: ResourceModel;
    thumbnail_file_info: ResourceModel;

    constructor() {

    }
}
export class MediaAudioModel extends VideoModel {
    idMediaType: 2;
    duration: string;
    organization_logo: string;
}
export class MediaDocumentModel extends VideoModel {
    idMediaType: 3;
    is_embed: boolean;
}

export class PlaylistModel {
    id: number;
    idPlaylist: number;
    name: string;
    description: string;
    idOrganization: number;
    created_by: number;
    created_at: string | Date;
    status: boolean;
    deleted_by: number;
    deleted_at: string | Date;
    picture: string;

    videos: VideoModel[];
    audios: MediaAudioModel[];
    documents: MediaDocumentModel[];
    featured_videos: VideoModel[];

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
    sort_type?: 'date_asc' | 'date_desc' | 'alpha_asc' | 'alpha_desc';

    constructor() {
        this.audios = [];
        this.documents = [];
        this.videos = [];
        this.featured_videos = [];
    }
}

export class PlaylistVideoModel {
    idPlayListVideo: number;
    idPlaylist: number;
    idVideo: number;
    created_by: number;
    created_at: string | Date;
    status: boolean;
    deleted_by: number;
    deleted_at: string | Date;
}
