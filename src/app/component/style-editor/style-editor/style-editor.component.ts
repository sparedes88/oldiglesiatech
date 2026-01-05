import { Component, Input, OnDestroy, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';

export const STYLE_EDITOR_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => StyleEditorComponent),
  multi: true,
};

@Component({
  selector: 'style-editor',
  templateUrl: './style-editor.component.html',
  styleUrls: ['./style-editor.component.scss'],
  providers: [STYLE_EDITOR_CONTROL_VALUE_ACCESSOR]
})
export class StyleEditorComponent implements OnInit, ControlValueAccessor {

  @Input('extended') extended: boolean = false;
  @Input('type') type: 'general' | 'groups' | 'events' | 'articles' = 'general';
  @Input('idOrganization') idOrganization: number;

  view_options = {
    menu_option: 'view'
  }

  // categories_to_display: ['[]', [Validators.required]],
  general_style_form: FormGroup = this.form_builder.group({
    button_border_radius: [0, [Validators.required, Validators.min(0)]],
    button_spacing: [0, [Validators.required, Validators.min(0)]],
    shadow_color: ['#000000', Validators.required],
    shadow_spread: [0, [Validators.required, Validators.min(0)]],
    shadow_blur: [0, [Validators.required, Validators.min(0)]],
    title_text_bold: ['bolder', [Validators.required]],
    title_text_color: ['#000000', [Validators.required]],
    title_text_align: ['left', [Validators.required]],
    display_description: [false, Validators.required],
    description_text_color: ['#666666', [Validators.required]],
    display_more_button: [false, Validators.required],
    button_more_color: ['#e65100', [Validators.required]],
    display_article_titles: [true, [Validators.required]],
    created_by: [],
    donation_language: ['es'],
    col_size: 6
  });

  group_style_form: FormGroup = this.form_builder.group({
    idGroupType: new FormControl(),
    name: new FormControl(),
    text_color: new FormControl("#ffffff"),
    degrees: new FormControl(112),
    main_color: new FormControl('#e65100'),
    main_percent: new FormControl(72),
    second_color: new FormControl("#ffb994"),
    second_percent: new FormControl(100),
    show_shadow: new FormControl(true),
    display_header: new FormControl(true),
    items_per_row: new FormControl(6),
    idGroupCategory: new FormControl(''),
    // random_id: new FormControl(RandomService.makeId()),
    idGroupViewMode: new FormControl(1),
    categories: new FormControl([]),
    language: new FormControl('es')
  });

  events_style_form: FormGroup = this.form_builder.group({
    use_own_text: new FormControl(false),
    events_text_header: new FormControl("Events"),
    our_meetings_text: new FormControl("Our meetings"),
    view_more_text: new FormControl("View more"),
  });

  group_types: {
    idGroupType: number;
    name: string;
    categories: any[]
  }[] = [
      {
        idGroupType: 1,
        name: 'Ministries',
        categories: []
      },
      {
        idGroupType: 2,
        name: 'Groups',
        categories: []
      },
      {
        idGroupType: 3,
        name: 'Events',
        categories: []
      },
      {
        idGroupType: 4,
        name: 'Teams',
        categories: []
      }
    ]

  group_categories: {
    idGroupCategory: number;
    name: string;
  }[] = [];

  constructor(
    private form_builder: FormBuilder,
    private api: ApiService
  ) {
  }

  async getGroupCategories() {
    const response: any = await this.api
      .get(`groups/getGroupsCategories?idIglesia=${this.idOrganization}`)
      .toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.group_categories = response.categories;
      const element = this.group_style_form;
      const group_type = this.group_categories.find(x => x.idGroupCategory === element.value.idGroupCategory);
      if (group_type) {
        element.get('name').setValue(group_type.name);
      }
    }
  }

  //Placeholders for the callbacks which are later provided
  //by the Control Value Accessor
  // ControlValueAccessor Implementation
  onChange: any = () => { };
  onTouched: any = () => { };

  //From ControlValueAccessor interface
  writeValue(value: any) {

    if (value) {
      if ((typeof value) == 'string') {
      }
    }
  }

  //From ControlValueAccessor interface
  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  ngOnInit() {
    let form_group: FormGroup;
    if (this.type === 'general' || this.type === 'articles') {
      if(this.type === 'articles'){
        this.general_style_form.addControl('load_all', new FormControl(false));
      }
      form_group = this.general_style_form;
    } else if (this.type === 'groups') {
      form_group = this.group_style_form;
    } else if(this.type === 'events'){
      form_group = this.events_style_form;
    }
    console.log(form_group);
    if (this.extended) {
      this.group_style_form.addControl('title_text', new FormControl(''))
    }

    form_group.valueChanges.subscribe(changes => {
      this.emit();
    });
    if (this.type === 'groups') {
      this.getGroupCategories();
    }
  }

  get show_display_more_button() {
    if (this.type == 'general' || this.type == 'articles') {
      if (this.general_style_form) {
        return this.general_style_form.get('display_more_button').value;
      }
    }
  }

  get show_articles_title() {
    if (this.type == 'general' || this.type == 'articles') {
      if (this.general_style_form) {
        return this.general_style_form.get('display_article_titles').value;
      }
    }
  }

  get show_display_description() {
    if (this.type == 'general' || this.type == 'articles') {
      if (this.general_style_form) {
        return this.general_style_form.get('display_description').value;
      }
    }
  }

  toggleAcceptace(form_group: FormGroup, field: string) {
    const actual_value = form_group.get(field).value;
    form_group.get(field).setValue(!actual_value);
    this.emit();
  }

  emit() {
    let value;
    if (this.type === 'general' || this.type === 'articles') {
      value = this.general_style_form.value;
    } else if (this.type === 'groups') {
      value = this.group_style_form.value;
    } else if (this.type === 'events') {
      value = this.events_style_form.value;
    }
    this.onTouched(value);
    this.onChange(value);
  }


  async checkActualViewSetting(form: FormGroup) {
    const value = form.value;
    const idGroupViewMode = Number(value.idGroupViewMode);
    let call_categories = false;
    if (idGroupViewMode === 1) {
      form.get('idGroupCategory').setValue(undefined);
    } else if (idGroupViewMode === 2) {
      form.get('idGroupType').setValue(undefined);
    } else if (idGroupViewMode === 3) {
      call_categories = true;
    }
    this.emit();
  }

  async checkNewGroupTypeValue(form: FormGroup, event) {
    const idGroupType = Number(form.get('idGroupType').value);
    if (idGroupType) {
      if (form.get('idGroupViewMode').value == 3) {
        form.get('idGroupCategory').setValue('');
        const id = this.idOrganization;

        const response_categories: any = await this.api.get(`groups/categories/filter?idIglesia=${id}&group_type=${idGroupType}`).toPromise();
        const categories = response_categories.categories;
        if (!form.get('categories')) {
          form.addControl('categories', new FormControl(categories));
        } else {
          form.get('categories').setValue(categories);
        }
      }
      this.emit();
    }
  }

  get_available_categories() {
    if (Number(this.group_style_form.get('idGroupViewMode').value) === 3) {
      return this.group_style_form.get('categories').value;
    } else {
      return this.group_categories;
    }
  }
}
