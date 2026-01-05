import * as uuid from 'uuid';

export class ArticleItem {
    name: string;
    uId: string;
    idArticulo: number;
    articulos: ArticleItem[];
    sort_by: number;
    group_article_id: number;
    picture?: string;
    show_opened?: boolean;
    searchBoxValue?: string;
    type?: 'container' | 'entry' | 'directory';

    constructor(options: {
        name: string,
        articulos?: ArticleItem[],
    }) {
        this.name = options.name;
        // this.uId = uuid.v4();
        this.articulos = options.articulos || [];
    }
}