export class GalleryModel {
  id: number;
  idGallery: number;
  idIglesia: number;
  name: string;
  description: string;
  photos: any[];

  text_align?: string;
  active_background_color?: string;
  hover_background_color?: string;
  background_color?: string;
  font_color?: string;
  font_weight?: string;
  font_style?: string;
  font_size?: string;
  is_hover?: boolean;
  ids: any[];
  items: any[];
  idGalleryAlbum?: number;
  idGalleryViewMode?: number;

  constructor() {

  }
}

export class GalleryPictureModel {
  id: number;
  idOrganization: number;
  idGallery: number;
  idResource: number;
  y_position: 'center' | 'top' | 'bottom';
  x_position: 'center' | 'left' | 'right';
  zoom: number;
  src_path?: string;
  temp_src?: any;
}

export class GalleryAlbumModel {
  id: number;
  name: string;
  description: string;
  idOrganization: number;
  album_galleries?: GalleryModel[];
  deleted_by: number;
  status: boolean;
  is_automatic: boolean;
  created_by: number;
  idSortType: number;
}

export class GalleryAlbumGalleryModel {
  id: number;
  idGallery: number;
  idGalleryAlbum: number;
  idOrganization: number;
  idIglesia: number;
}
export enum GalleryViewModes {
  '_1' = 'gallery',
  '_2' = 'album'
}
