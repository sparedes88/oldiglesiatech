import { FormGroup } from '@angular/forms';
import { ResourceModel } from "./RessourceModel";

export class InventoryPlaceModel {
    idInventoryPlace: number;
    idOrganization: number;
    name: string;
    description: string;
    created_at: string | Date;
    created_by: number;
    status: boolean;
    deleted_at: string | Date;
    deleted_by: number;
    user_created_by: string;

    products: InventoryPlaceProductModel[];
    total_worth: number;
    form?: FormGroup;
    editing?: boolean;

    constructor() {
        this.name = '';
        this.description = '';
        this.products = [];
    }
}

export class OptionalFieldModel {
    id: number;
    idOptionalField: number;
    name: string;
    description: string;
    value: any;
    created_by: number;
    created_at: number;
}

export class InventoryProductModel {
    idInventoryProduct: number;
    idOrganization: number;
    name: string;
    description: string;
    idInventoryProductCategory: number;
    idInventoryProductStatus: number;
    qr_code: string;
    picture: string;
    created_at: string | Date;
    created_by: number;
    status: boolean;
    deleted_at: string | Date;
    deleted_by: number;

    product_status: string;
    product_category: string;
    optional_fields: OptionalFieldModel[];
}

export class InventoryPlaceProductModel {
    idInventoryPlaceProduct: number;
    idInventoryProduct: number;
    idInventoryPlace: number;
    quantity: number;
    assigned_to: number;
    price_bought_at: number;
    qr_code: string;
    total_worth: number;
    vendor: string;

    created_at: string | Date;
    created_by: number;
    status: boolean;
    deleted_at: string | Date;
    deleted_by: number;

    product_name: string;
    picture: string;
    user_assigned_to: string;

    place: InventoryPlaceProductModel;
    product: InventoryPlaceProductModel;
    other_places: InventoryPlaceProductModel[];
    optional_fields: OptionalFieldModel[];
    idResource: number;
    file_info: ResourceModel;
    category_name: string;
    status_name: string;

    print_qr?: boolean;

    constructor() {
        this.product_name = '';
    }
}

export class InventoryProductStatusModel {
    idInventoryProductStatus: number;
    name: string;
    description: string;
    idOrganization: number;
    created_at: string | Date;
    created_by: number;
    status: boolean;
    deleted_at: string | Date;
    deleted_by: number;
}

export class InventoryProductCategoryModel {
    idInventoryProductCategory: number;
    name: string;
    description: string;
    idOrganization: number;
    created_at: string | Date;
    created_by: number;
    status: boolean;
    deleted_at: string | Date;
    deleted_by: number;
}
