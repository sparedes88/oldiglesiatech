export class MailingListModel {
  id: number;
  idMailingList: number;
  name: string;
  description: string;
  idIglesia: number;
  status: boolean;
  contact_language?: 'es' | 'en';

  text_align?: string;
  active_background_color?: string;
  hover_background_color?: string;
  background_color?: string;
  font_color?: string;
  font_weight?: string;
  font_style?: string;
  font_size?: string;
  is_hover?: boolean;
  items: any[];

  organization?: any;
  inputs?: MailingListInputSetup[];
  setup?: any;
  is_v2?: boolean;
}

export class MailingListContactNoteModel {
  idMailingListContactNote: number;
  idMailingListContact: number;
  content: string;
  is_private: boolean;
  hasBeenSanitized: boolean;
  original_content: boolean;

  status: boolean;
  created_by: number;
  created_at: Date | string;
  created_at_format?: string;
  deleted_by: number;
  deleted_at: Date | string;
  summary: string;
  userCreatedBy: string;

  constructor() {
    this.idMailingListContactNote = 0;
    this.content = '';
    this.is_private = true;
    this.hasBeenSanitized = false;
    this.status = true;
  }
}

export class MailingListInputType {
  id: number;
  name: number;
  input_type: 'text' | 'textarea' | 'number' | 'checkbox' | 'radio' | 'select' | 'groups' | 'events';
  accepted_display_formats: number[];
  need_options: boolean;
  created_by: number;
  status: boolean;
}
export class MailingListInput {
  id: number;
  idOrganization: number;
  idMailingListInputType: number;
  label: string;
  placeholder: string;
  should_be_required: boolean;
  show_hint: boolean;
  hint: string;
  created_by: number;
  status: boolean;
  custom_label: string;
  custom_placeholder: string;
  custom_hint: string;

  options?: MailingListInputOption[];
}

export class MailingListInputSetup extends MailingListInput {
  id: number;
  idMailingList: number;
  idMailingListInput: number;
  is_required: boolean;
  sort_by: number;
  created_by: number;
  status: boolean;
}

export class MailingListParams {
  idOrganization: number;
  extended: boolean;
  all: boolean;
  version: string;
}

export class MailingListInputOption {
  name: string;
  value: string;
  checked: boolean;
}

export class MailingListExtraDisplaySettings {
  logo: boolean;
  name: boolean;
}
