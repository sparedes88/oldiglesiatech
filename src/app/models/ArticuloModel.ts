import { SafeHtml } from "@angular/platform-browser";
import { ArticuloTemplateModel, ConfigurationTabTemplateModel } from "./TemplateModel";
import { MediaAudioModel, MediaDocumentModel } from "./VideoModel";

export class ArticuloModel {
  idArticulo: number;
  idIglesia: number;
  idTab: number;
  slider: string;
  titulo: string;
  contenido: string | any;
  estatus: boolean;
  sliderweb: string;
  segments: ArticuloMediaModel[];
  articulosMedia: ArticuloMediaModel[];
  idCategoriaArticulo: number;
  hasBeenSanitized: boolean;
  author: string;
  summary: string;

  categoria?: string;
  createdDate?: Date | string;
  restricted_to_users?: boolean = false;
  display_as_wordpress: boolean;
  show_category: boolean = true;
  show_author: boolean = false;
  show_publish_date: boolean = false;
  wordpress_link: string;
  show_more_text: string;

  idTemplate?: number;
  template: ArticuloTemplateModel;
  orden: number;

  hide_header?: boolean = false;
  hide_title?: boolean = false;
  hide_picture?: boolean = false;
  height_zoom?: number;
  hide_category?: boolean = false;
  header_style: ArticleHeaderStyle;
  sanitize_description: SafeHtml;
  original_description: string;

  constructor() {
    this.idArticulo = 0;
    this.idIglesia = 0;
    this.idTab = 0;
    this.titulo = '';
    this.contenido = '';
    this.estatus = true;
    this.segments = [];
    this.idCategoriaArticulo = 18;
    this.display_as_wordpress = false;
    this.wordpress_link = '';
    this.show_more_text = '';
    this.height_zoom = 1;
    this.header_style = new ArticleHeaderStyle();
  }
}

export class ArticuloMediaModel {
  idArticuloMedia: number;
  idArticulo: number;
  titulo: string;
  idMediaType: number;
  url: string | any;
  content: string | any;
  ionicons: string;
  duration: string;
  fileType: string;
  fileSize: string;
  thumbnail: string;
  mediaType: string;
  nombre?: string;
  summary: string;
  hasBeenSanitized: boolean;
  original_content: string;
  original_url: string;

  index: number;

  idMediaItem: number;
  media_item?: MediaAudioModel | MediaDocumentModel;

  constructor() {
    this.idArticuloMedia = 0;
    this.idArticulo = 0;
    // this.titulo = null;;
    this.idMediaType = 0;
    // this.url = null;;
    this.content = null;
    this.ionicons = null;
    this.duration = null;
    this.fileType = null;
    this.fileSize = null;
    this.thumbnail = null;
    this.mediaType = '';
  }
}

export class ArticleHeaderStyle {
  show_title: boolean;
  title_vertical_position: 'base' | 'center' | 'end';
  title_settings: Partial<TitleHeaderSettings>;
  border_radius: number;
  design_style: 'graphic' | 'hex' | 'gradient';
  color_hex: string;
  gradient_options: Partial<ArticleGradientHeaderModel>;
  padding: Partial<PaddingModel>;
  margin: Partial<PaddingModel>;

  constructor() {
    this.show_title = true;
    this.title_vertical_position = 'center';
    this.title_settings = new TitleHeaderSettings();
    this.border_radius = 8;
    this.design_style = 'hex';
    this.color_hex = '#FFFFFF';
    this.gradient_options = new ArticleGradientHeaderModel();
    this.padding = new PaddingModel();
    this.margin = new PaddingModel();
  }
}

export enum GradientType {
  'linear' = 'linear-gradient',
  'radial' = 'radial-gradient'
}

export class GradientColorModel {
  hex_color: string;
  r: number;
  g: number;
  b: number;
  alpha: number;
  degrees: number;
}
export class ArticleGradientHeaderModel {
  type: 'linear' | 'radial';
  degrees: number;
  colors: GradientColorModel[];

  constructor() {
    this.type = 'linear';
    this.degrees = 90;
    this.colors = [];
  }
}

export class TitleHeaderSettings {
  text: string;
  font: string;
  color: string;
  position: string;
  size: number;
  rich_text: string;

  constructor() {
    this.text = 'Sample';
    this.font = 'italic';
    this.color = '#121212';
    this.position = 'center';
    this.size = 20;
    this.rich_text = `<p class=\"ql-align-center\"><span class=\"ql-font-arial\" style=\"font-size: 28px; color: rgb(0, 0, 0);\">Sample</span></p>`;
  }
}
export class PaddingModel {
  top: number;
  left: number;
  right: number;
  bottom: number;

  constructor() {
    this.top = 0;
    this.bottom = 0;
    this.right = 0;
    this.left = 0;
  }
}
