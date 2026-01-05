declare var stripe: any;
declare var elements: any;

declare class ClipboardItem {
    constructor(data: { [mimeType: string]: Blob });
}

interface ClipboardItem {
    readonly types: string[];
    readonly presentationStyle: "unspecified" | "inline" | "attachment";
    getType(): Promise<Blob>;
}

interface ClipboardItemData {
    [mimeType: string]: Blob | string | Promise<Blob | string>;
}

declare var ClipboardItem: {
    prototype: ClipboardItem;
    new(itemData: ClipboardItemData): ClipboardItem;
};