export class ConfigurationTabModel {

    idConfiguracionTab: number;
    idIglesia: number;
    idTab: number;
    slider: string | any;
    tabTitle: string;
    sliderWeb: string;
    estatus: boolean;
    // template?: ConfiguracionTabTemplateModel
    // articulos?: ArticuloModel[]
    template?: any
    articulos?: any[]
    temp_articulos?: any[]
    background_picture: string;
    uId?: string;

    trigger: boolean = false;

    constructor(){

    }
}
