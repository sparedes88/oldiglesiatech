export class ResourceModel {
    id: number;
    idOrganization: number;
    original_name: string;
    filename: string;
    src_path: string;
    mime_type: string;
    file_extension: string;
    created_by: number;
    created_at: Date | string;
    status: boolean;
}