import { FormGroup } from "@angular/forms";

export class SyncDudaModel {
  id: number;
  site_id: string;
  idOrganization: number;
  is_synched: boolean;
  site?: any;
}

export class DudaModules {
  id: string;
  name: string;
  options: DudaModuleOption[]
  support_full_width?: boolean;
}

export class DudaModuleOption {
  value: string;
  name: string;
  percent: number;
  has_form?: boolean;
  need_call?: boolean;
  function?: Function;
  instructions: DudaModuleInstruction[]
}

interface CustomData {
  [key: string]: any;
}


export class DudaModuleInstruction {
  type: 'explanation' | 'code' | 'image' | 'selectable';
  text: string;
  method?: (obj: CustomData) => void;
  params?: CustomData;
  classes?: string;
  can_copy?: boolean;
  validation?: () => boolean;
  elements?:() => any[];
  field_id?: string;
  field_name?: string;
  option_form?: FormGroup;
  value?: (obj: CustomData) => any;
  value_params?: CustomData;
}
