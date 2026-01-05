import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { ResourceModel } from './RessourceModel';
export class VersionModel {
    id: number;
    major: number;
    minor: number;
    patch: number;
    is_mandatory: boolean;
    version?: string;
    change_log?: string;
    ready_for_android?: boolean;
    ready_for_apple?: boolean;
}
export class PackageModel {
    idIdentificador: number;
    idIdentifier: number;
    app_package: string;
    estatus: boolean;
    android_id: string;
    apple_id: string;
    sequencer: number;
    package_segment_domain: string;
    package_segment_sequence: string;
    created_by?: number;
    organizations?: any[];
    idIglesia?: number;
    idIdentificadorIglesia?: number;
}

export class AppConfigurationModel {
    hideChangeIglesia?: boolean
    app_package: string
    isLocked?: boolean
    idIdentificador?: number
    isCancelled?: boolean
    isMaintained?: boolean
    statuses: EstatusIdentificador[] = []
    iglesia?: OrganizationModel;
    messages?: {
        show_relogin_feature: boolean
    }
    show_test: boolean;
    major: number;
    minor: number;
    patch: string;
    version: string;
}

export class EstatusIdentificador {
    idEstatusIdentificador: number
    idIdentificadorEstatusIdentificador: number
    traduccionKey: string
    estatus_identificador: string
    value: boolean
    canClose: boolean
    isPersistent: boolean
}

export interface PackageVersionModel extends VersionModel, PackageModel {
    organization_name: string;
    idOrganization: number;
    idCatalogoPlan: number;
    plan_name: string;
    last_version_ready_for_android: string;
    last_version_ready_for_apple: string;
    idVersion?: number;
    versions: VersionModel[];
    is_cancelled: boolean;
    is_maintained: boolean;
    organization?: {
        name: string;
        picture: string;
        idOrganization: number;
    }
    is_ready?: boolean;
    partial_ready?: boolean;
    branch?:string;
    topic?:string;
    icon_name?:string;

    configuration: AppConfigurationModel;
    resources: {
        id: number;
        file_info_icon: ResourceModel;
        file_info_splash: ResourceModel;
        file_info_icon512: ResourceModel;
        file_info_icon112: ResourceModel;
        file_info_android_graph: ResourceModel;
        is_ready?: boolean;
        partial_ready?: boolean;
    }
}
