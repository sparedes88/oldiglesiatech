export class CategoriaArticuloModel {
    idCategoriaArticulo: number;
    nombre: string;
    descripcion: string;
    estatus: boolean;
    restricted_to_users: boolean;
    articles_count?: number;
    idCategoryArticle?: number;
    id?: number;
    sort_by?: number;
    col_size?: number;
    view_as?: 'load_more' | 'carousel';

    text_align?: string;
    active_background_color?: string;
    hover_background_color?: string;
    background_color?: string;
    font_color?: string;
    font_weight?: string;
    font_style?: string;
    font_size?: string;
    is_hover?: boolean;
    sort_type?: 'date_asc' | 'date_desc' | 'alpha_asc' | 'alpha_desc';

    constructor() {
        this.nombre = '';
        this.descripcion = '';
        this.estatus = true;
        this.restricted_to_users = false;
    }
}
