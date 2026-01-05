import * as uuid from 'uuid';

export class Item {
    name: string;
    uId: string;
    id: number;
    containers: Item[];
    entries: any[];
    sort_by: number;
    parent_container_id: number;
    picture?: string;
    show_opened?: boolean;
    searchBoxValue?: string;
    type?: 'container' | 'entry' | 'directory';
    is_root_level?: boolean = false;

    constructor(options: {
        name: string,
        containers?: Item[],
        entries?: any[]
    }) {
        this.name = options.name;
        // this.uId = uuid.v4();
        this.containers = options.containers || [];
        this.entries = options.entries || [];
    }
}