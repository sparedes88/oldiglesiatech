import { FormArray, FormControl } from '@angular/forms';
import { GalleryModel } from './../../../models/GalleryModel';
import { ArticuloTemplateModel } from './../../../models/TemplateModel';
import { BookingModel } from './../../../models/BookingModel';
import { IDropdownSettings, MultiSelectComponent } from 'ng-multiselect-dropdown';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TemplateModel, ConfigurationTabTemplateModel } from 'src/app/models/TemplateModel';
import { OrganizationModel } from './../../../models/OrganizationModel';
import { TranslateService } from '@ngx-translate/core';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Observable, Subject, Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

import { ArticleComponent } from '../../article/article/article.component';
import { ArticleGradientHeaderModel, ArticleHeaderStyle, ArticuloMediaModel, ArticuloModel, GradientColorModel, PaddingModel, TitleHeaderSettings } from './../../../models/ArticuloModel';
import { CategoriaArticuloModel } from './../../../models/CategoriaArticuloModel';
import { OrganizationService } from './../../../services/organization/organization.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { GroupsService } from 'src/app/services/groups.service';
import { VideosService } from 'src/app/services/videos.service';
import { GroupCategoryModel } from 'src/app/models/GroupModel';
import { MediaAudioModel, MediaDocumentModel, PlaylistModel } from 'src/app/models/VideoModel';
import { CommunityBoxModel } from 'src/app/models/CommunityBoxModel';
import { BookingService } from 'src/app/services/booking.service';
import { environment } from 'src/environments/environment';
import { MailingListModel } from 'src/app/models/MailingListModel';
import { TextEditorComponent } from 'src/app/component/text-editor/text-editor.component';
import { ApiService } from 'src/app/services/api.service';
import { WordpressService } from 'src/app/services/wordpress.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'article-form',
  templateUrl: './article-form.component.html',
  styleUrls: ['./article-form.component.scss']
})
export class ArticleFormComponent implements OnInit {
  @Output() submit = new EventEmitter<any>();
  @Input() article: ArticuloModel;
  @Input() template: ArticuloTemplateModel;
  @Input() came_from_profile: boolean = false;
  @Input('style_settings') style_settings: any;
  @ViewChild('page_articulo') page_articulo: ArticleComponent;
  @ViewChild('input_file') input_file: any;
  @ViewChild('input_articulo_cover_file') input_articulo_cover_file: any;
  @ViewChild('multi_select_subcategories') multi_select_subcategories: MultiSelectComponent;

  templates: TemplateModel[] = [];
  template_selected: TemplateModel;
  categories: GroupCategoryModel[] = [];
  bookings: BookingModel[] = [];
  playlists: PlaylistModel[] = [];
  communityBoxes: CommunityBoxModel[] = [];
  mailingLists: MailingListModel[] = [];
  galleries: GalleryModel[] = [];
  header_submodules: any[] = [];
  items: any[] = [];
  subcategories_headers: any[] = [];

  detail_item_properties: {
    id_key: string,
    name_key: string
  } = {
      id_key: '',
      name_key: ''
    }

  public user: any = this.userService.getCurrentUser();

  @ViewChild('editor') editor: TextEditorComponent;

  serverRegex = new RegExp(this.organizationService.api.baseUrl, 'g');

  categorias: CategoriaArticuloModel[] = [{
    idCategoriaArticulo: 18,
    nombre: 'CategoriaArticulo_Default',
    descripcion: '',
    estatus: true,
    restricted_to_users: false
  }];

  media_types: ArticuloMediaModel[] = [];
  existing_images_to_delete: {
    url: string
  }[] = [];

  iglesia;
  loading: boolean = false;

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  @ViewChild('multi_select') multi_select: MultiSelectComponent;
  @ViewChild('multi_select_bookings') multi_select_bookings: MultiSelectComponent;
  @ViewChild('multi_select_community_boxes') multi_select_community_boxes: MultiSelectComponent;
  @ViewChild('multi_select_playlists') multi_select_playlists: MultiSelectComponent;
  @ViewChild('multi_select_galleries') multi_select_galleries: MultiSelectComponent;
  @ViewChild('multi_select_mailing_list_boxes') multi_select_mailing_list_boxes: MultiSelectComponent;

  // Datatables
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: 'Blfrtip',
    lengthMenu: [10, 25, 50, 100, 250, 500],
    buttons: [
      { extend: 'copy', className: 'btn btn-outline-primary btn-sm' },
      { extend: 'print', className: 'btn btn-outline-primary btn-sm' },
      { extend: 'csv', className: 'btn btn-outline-primary btn-sm' },
    ]
  };

  selectedMediaType: ArticuloMediaModel;

  isEdit: boolean;
  photo: File;
  message: string;

  selectOptions: IDropdownSettings = {
    singleSelection: false,
    idField: 'idGroupCategory',
    textField: 'name',
    allowSearchFilter: true,
    clearSearchFilter: true,
    selectAllText: 'Select all',
    unSelectAllText: 'Unselect all'
  };

  select_booking_options: IDropdownSettings = {
    singleSelection: true,
    idField: 'idBookingCalendar',
    textField: 'summary',
    allowSearchFilter: true,
    clearSearchFilter: true,
    selectAllText: 'Select all',
    unSelectAllText: 'Unselect all'
  };

  select_playlist_options: IDropdownSettings = {
    singleSelection: true,
    idField: 'idPlaylist',
    textField: 'name',
    allowSearchFilter: true,
    clearSearchFilter: true,
    selectAllText: 'Select all',
    unSelectAllText: 'Unselect all'
  };

  select_community_options: IDropdownSettings = {
    singleSelection: true,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    clearSearchFilter: true,
    selectAllText: 'Select all',
    unSelectAllText: 'Unselect all'
  };

  select_subcategories_options: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    allowSearchFilter: true,
    clearSearchFilter: true,
    selectAllText: 'Select all',
    unSelectAllText: 'Unselect all'
  };

  giving_template_form: FormGroup = this.formBuilder.group({
    header_text: ['', Validators.required],
    subheader_text: ['', Validators.required],
    button_text: ['', Validators.required],
    background_picture: ['assets/imgs/default-portrait.png', Validators.required],
    donation_url: ['', Validators.required],
  });

  booking_template_form: FormGroup = this.formBuilder.group({
    idBookingCalendar: ['', Validators.required],
    preview_url: ['', Validators.required]
  });

  playlist_template_form: FormGroup = this.formBuilder.group({
    idPlaylist: ['', Validators.required],
    button_border_radius: [25, [Validators.required, Validators.min(0)]],
    button_spacing: [10, [Validators.required, Validators.min(0)]],
    shadow_color: ['#000000', Validators.required],
    shadow_spread: [0.5, [Validators.required, Validators.min(0)]],
    shadow_blur: [1.5, [Validators.required, Validators.min(0)]],
    title_text_bold: ['bolder', [Validators.required]],
    title_text_color: ['#000000', [Validators.required]],
    title_text_align: ['left', [Validators.required]],
    display_description: [true, Validators.required],
    description_text_color: ['#666666', [Validators.required]],
    show_tab_searchbar: [true, Validators.required],
    selected_items: new FormControl(),
    items: new FormArray([])
  });

  community_box_template_form: FormGroup = this.formBuilder.group({
    idCommunityBox: ['', Validators.required],
    display_header: [true, [Validators.required]],
    selected_items: new FormControl(),
    items: new FormArray([])
  });

  gallery_template_form: FormGroup = this.formBuilder.group({
    idGallery: ['', Validators.required],
    selected_items: new FormControl(),
    items: new FormArray([])
  });

  grid_template_form: FormGroup = this.formBuilder.group({
    display_header: [false, Validators.required],
    blocks_per_row: [1, [Validators.required, Validators.max(2)]],
    button_border_radius: [25, [Validators.required, Validators.min(0)]],
    button_spacing: [10, [Validators.required, Validators.min(0)]],
    shadow_color: ['#000000', Validators.required],
    shadow_spread: [0.5, [Validators.required, Validators.min(0)]],
    shadow_blur: [1.5, [Validators.required, Validators.min(0)]]
  });

  link_template_form: FormGroup = this.formBuilder.group({
    link_page: ['', Validators.required],
    open_external: [false]
  });

  mailing_list_template_form: FormGroup = this.formBuilder.group({
    idMailingList: ['', Validators.required],
    mailing_language: ['es', Validators.required],
    selected_items: new FormControl(),
    items: new FormArray([])
  });

  detail_template_form: FormGroup = this.formBuilder.group({
    parent_module_id: [2, Validators.required],
    parent_id: [undefined, Validators.required],
    link_module_id: new FormControl(0, [Validators.required, Validators.min(1)]),
    element_id: new FormControl(undefined, [Validators.required, Validators.min(1)]),
  });

  subcategories_template_form: FormGroup = this.formBuilder.group({
    selected_items: new FormControl(),
    headers: new FormArray([])
  });

  media_items: (MediaAudioModel | MediaDocumentModel)[] = [];

  header_design_form: FormGroup = this.formBuilder.group({
    show_title: new FormControl(true),
    title_vertical_position: new FormControl('center'),
    title_settings: new FormGroup({
      text: new FormControl('Sample'),
      font: new FormControl(''),
      color: new FormControl('#121212'),
      position: new FormControl('center'),
      size: new FormControl(20),
      rich_text: new FormControl(`<p class=\"ql-align-center\"><span class=\"ql-font-arial\" style=\"font-size: 28px; color: rgb(0, 0, 0);\">Sample</span></p>`)
    }),
    border_radius: new FormControl(6),
    design_style: new FormControl('graphic'),
    color_hex: new FormControl('#FFFFFF'),
    gradient_options: new FormGroup({
      type: new FormControl('radial'),
      degrees: new FormControl(13),
      colors: new FormArray([])
    }),
    padding: new FormGroup({
      top: new FormControl(10),
      left: new FormControl(10),
      right: new FormControl(10),
      bottom: new FormControl(10)
    }),
    margin: new FormGroup({
      top: new FormControl(10),
      left: new FormControl(10),
      right: new FormControl(10),
      bottom: new FormControl(10)
    }),
    editable_option: new FormControl(''),
    selected_square: new FormControl('padding')
  });

  get editable_option() {
    return this.header_design_form.get('editable_option').value;
  }

  set editable_option(key: string) {
    this.header_design_form.get('editable_option').setValue(key);
    if (key.startsWith('margin')) {
      this.header_design_form.get('selected_square').setValue('margin');
    } else {
      this.header_design_form.get('selected_square').setValue('padding');
    }
  }

  get is_padding() {
    return this.header_design_form.get('selected_square').value === 'padding';
  }

  get gradient_options() {
    return this.header_design_form.get('gradient_options') as FormGroup;
  }

  get is_linear() {
    return this.gradient_options.get('type').value === 'linear';
  }

  get colors() {
    return this.gradient_options.get('colors') as FormArray;
  }

  get padding() {
    return this.header_design_form.get('padding') as FormGroup;
  }

  get margin() {
    return this.header_design_form.get('margin') as FormGroup;
  }

  public wordpressSettings
  public currentUser: any;
  public wpConfig: any;
  public wpImages: any[] = []
  constructor(
    private organizationService: OrganizationService,
    private modal: NgxSmartModalService,
    private userService: UserService,
    private fus: FileUploadService,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private groupProvider: GroupsService,
    private videoService: VideosService,
    private bookingService: BookingService,
    private api: ApiService,
    private wpService: WordpressService
  ) {
    this.currentUser = userService.getCurrentUser();
  }

  ngOnInit() {
    this.groupProvider.api
      .get(`iglesias/getModules`)
      .subscribe((response: any) => {
        this.header_submodules = response.submodules;
        this.header_submodules.unshift({
          id: 0,
          name: ' -- Please select an option --'
        });
      });
    if (this.article.template) {
      this.template = Object.assign({}, this.article.template);
    } else {
      this.template = new ArticuloTemplateModel();
      this.template.idArticulo = this.article.idArticulo;
      this.template.idTemplate = 0;
      this.article.idTemplate = 0;
    }
    this.getCategories();
    this.loadTemplates();
    this.getIglesia();
    if (this.article.idArticulo) {
      this.detail_template_form.get('parent_id').setValue(this.article.idArticulo);
      this.isEdit = true;
    } else {
      this.detail_template_form.get('parent_id').setValue(0);
      this.isEdit = false;
    }
    this.getWordpressSettings()
    if (this.article.header_style) {
      console.log(this.article.header_style);
      if (JSON.stringify(this.article.header_style) == '{}') {
        this.article.header_style = new ArticleHeaderStyle();
        this.article.header_style.design_style = 'graphic';
      }
      this.header_design_form.patchValue(this.article.header_style);
      if (this.article.header_style.gradient_options.colors.length > 0) {
        console.log(this.article.header_style);
        this.article.header_style.gradient_options.colors.forEach(x => {
          console.log(x);
          this.addColor(x);
        });
      }
    } else {
      this.colors.push(
        new FormGroup({
          hex_color: new FormControl('#FFFFFF'),
          r: new FormControl(255),
          g: new FormControl(255),
          b: new FormControl(255),
          alpha: new FormControl(100, [Validators.max(100), Validators.min(0)]),
          degrees: new FormControl(70)
        }));
      this.colors.push(
        new FormGroup({
          hex_color: new FormControl('#000000'),
          r: new FormControl(0),
          g: new FormControl(0),
          b: new FormControl(0),
          alpha: new FormControl(100),
          degrees: new FormControl(100)
        }));
    }
    console.log(this.header_design_form);

    this.header_design_form.valueChanges.subscribe(x => {
      const style = this.header_design_form.value;
      if (this.article) {
        this.article.header_style = style;
      }
    })
  }

  getIglesia() {
    this.api
      .get(`getIglesiaFullData/`, { idIglesia: this.user.idIglesia })
      .subscribe(
        (data: any) => {
          this.iglesia = data.iglesia;
        },
        (err: any) => console.error(err)
      );
  }

  getWordpressSettings() {
    this.api
      .get(`wordpress`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          this.wordpressSettings = data;
          // Setup WP service
          let url = `${data.wordpressUrl}`;
          if (!url.endsWith('/')) {
            url += '/';
          }
          if (url.startsWith('http:')) {
            url = url.replace('http:', 'https:')
          }
          this.wpConfig = {
            url,
            token: data.authentication,
          };
          this.wpService.config = this.wpConfig;
        },
        (err: any) => {
          console.error(err);
        },
        () => {
          this.getImages()
        }
      );
  }
  getImages() {
    //'wp-json/wp/v2/media/?per_page=100'
    this.wpService.GET('wp-json/wp/v2/media/?per_page=100',
    ).subscribe(
      (data: any) => {
        this.wpImages = data
      },
      (err) => {
        console.error(err);
      }
    );
  }
  loadTemplates() {
    this.organizationService.getTemplates({ apply_for_articles: true })
      .subscribe((response: any) => {
        if (response.msg.Code === 200) {
          const template = new TemplateModel();
          template.idTemplate = 0;
          template.nombre = 'None';
          this.templates = response.templates;
          this.templates.unshift(template);
          this.showPic(this.template.idTemplate);
        } else {
          this.templates = [];
          this.organizationService.api.showToast(`We couldn't find any template.`, ToastType.info);
        }
      }, error => {
        console.error(error);
        this.organizationService.api.showToast('Error getting the templates... Please try again', ToastType.error);
      });
  }

  restartTable(): void {
    if (this.dtElement) {
      if (this.dtElement.dtInstance) {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      }
    }
  }

  getCategories() {
    this.organizationService.getCategoriasArticulos()
      .subscribe((response: any) => {
        if (response.msg.Code === 200) {
          this.categorias = response.categorias;
        } else {
          this.organizationService.api.showToast(`Nothing was found, default category will be used...`, ToastType.warning);
        }
        this.translateCategories();
      }, error => {
        console.error();
        this.translateCategories();
        this.organizationService.api.showToast(`Error getting the categories, the default category will be used...`, ToastType.error);
      });
  }

  updateExternalImage() {
    if (this.validateMediaType()) {
      const mediaType = new ArticuloMediaModel();
      mediaType.idArticulo = this.article.idArticulo;
      mediaType.idMediaType = this.selectedMediaType.idMediaType;
      mediaType.mediaType = this.selectedMediaType.mediaType;
      mediaType.titulo = this.selectedMediaType.titulo;
      mediaType.url = this.selectedMediaType.url;
      mediaType.idArticuloMedia = this.selectedMediaType.idArticuloMedia;
      if (this.selectedMediaType.idArticuloMedia || this.selectedMediaType.index >= 0) {
        this.article.segments[this.selectedMediaType.index] = mediaType;
      } else {
        this.article.segments.push(mediaType);
      }
      this.modal.getModal('editModal').close();
    }
  }

  updateVideo() {
    if (this.validateMediaType()) {
      const mediaType = new ArticuloMediaModel();
      mediaType.idArticulo = this.article.idArticulo;
      mediaType.idMediaType = this.selectedMediaType.idMediaType;
      mediaType.mediaType = this.selectedMediaType.mediaType;
      mediaType.titulo = this.selectedMediaType.titulo;
      mediaType.url = this.selectedMediaType.url;
      this.organizationService.getYouTubeInfo(this.selectedMediaType.url)
        .subscribe((video: any) => {
          mediaType.duration = video.videoInfo.duration;
          mediaType.url = video.videoInfo.url;
          mediaType.thumbnail = video.videoInfo.thumbnail;
          mediaType.idArticuloMedia = this.selectedMediaType.idArticuloMedia;

          if (this.selectedMediaType.idArticuloMedia || this.selectedMediaType.index >= 0) {
            this.article.segments[this.selectedMediaType.index] = mediaType;
          } else {
            this.article.segments.push(mediaType);
          }
          this.modal.getModal('editModal').close();
        }, error => {
          console.error(error);
          mediaType.duration = '0:00';
          mediaType.url = error.error.videoInfo.url;
          mediaType.thumbnail = 'https://via.placeholder.com/210x118?text=Not%20Video%20Info';
          mediaType.idArticuloMedia = this.selectedMediaType.idArticuloMedia;
          if (this.selectedMediaType.idArticuloMedia || this.selectedMediaType.index >= 0) {
            this.article.segments[this.selectedMediaType.index] = mediaType;
          } else {
            this.article.segments.push(mediaType);
          }
          this.organizationService.api.showToast(`Error getting youtube video's info. The video will be saved without thumbnail and duration.`, ToastType.error);
          this.modal.getModal('editModal').close();
        });
    }
  }

  updateLink() {
    if (this.validateMediaType()) {
      const mediaType = new ArticuloMediaModel();
      mediaType.idArticulo = this.article.idArticulo;
      mediaType.idMediaType = this.selectedMediaType.idMediaType;
      mediaType.mediaType = this.selectedMediaType.mediaType;
      mediaType.titulo = this.selectedMediaType.titulo;
      mediaType.url = this.selectedMediaType.url;
      if (this.selectedMediaType.idArticuloMedia || this.selectedMediaType.index >= 0) {
        this.article.segments[this.selectedMediaType.index] = mediaType;
      } else {
        this.article.segments.push(mediaType);
      }
      this.modal.getModal('editModal').close();
    }
  }

  async updateMediaItem() {
    const mediaType = new ArticuloMediaModel();
    mediaType.idArticulo = this.article.idArticulo;
    mediaType.idMediaType = this.selectedMediaType.idMediaType;
    mediaType.mediaType = this.selectedMediaType.mediaType;
    const media_item = this.media_items.find(x => x.idVideo == this.selectedMediaType.idMediaItem);
    if (media_item) {
      mediaType.titulo = media_item.title;
    } else {
      mediaType.titulo = this.selectedMediaType.titulo;
    }
    mediaType.idMediaItem = this.selectedMediaType.idMediaItem;
    const response: any = await this.api.get(`videos/detail/${mediaType.idMediaItem}`, { idIglesia: this.article.idIglesia }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      })
    if (response) {
      mediaType.media_item = response.video;
    }
    if (this.selectedMediaType.idArticuloMedia || this.selectedMediaType.index >= 0) {
      this.article.segments[this.selectedMediaType.index] = mediaType;
    } else {
      this.article.segments.push(mediaType);
    }
    this.modal.getModal('selectMediaItemModal').close();
  }

  updateContent() {
    this.selectedMediaType.content = this.editor.quill.container.firstChild.innerHTML;
    this.selectedMediaType.original_content = this.editor.quill.container.firstChild.innerHTML;
    const style_regex = /((<style>)|(<style type=.+))((\s+)|(\S+)|(\r+)|(\n+))(.+)((\s+)|(\S+)|(\r+)|(\n+))(<\/style>)/g;
    let summary_content = this.selectedMediaType.content;
    summary_content = summary_content.replace(style_regex, ``);
    summary_content = summary_content.replace(/&nbsp;/g, ' ');

    this.selectedMediaType.summary = summary_content
      ? String(summary_content)
        .replace(/<(?:.|\n)*?>/gm, '')
        .trim()
      : '';

    this.selectedMediaType.summary = this.selectedMediaType.summary.substring(0, 140);
    if (this.validateMediaType()) {
      if (this.selectedMediaType.idArticuloMedia || this.selectedMediaType.index >= 0) {
        this.article.segments[this.selectedMediaType.index] = this.selectedMediaType;
      } else {
        this.article.segments.push(this.selectedMediaType);
      }
      this.modal.getModal('editContentModal').close();
    }
  }

  loadEditor(container) {

    const toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],

      [{ header: 1 }, { header: 2 }],               // custom button values
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],      // superscript/subscript
      [{ indent: '-1' }, { indent: '+1' }],          // outdent/indent
      [{ direction: 'rtl' }],                         // text direction

      [{ size: ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ header: [1, 2, 3, 4, 5, 6, false] }],

      [{ color: [] }, { background: [] }],          // dropdown with defaults from theme
      [{ font: [] }],
      [{ align: [] }],

      ['clean']                                         // remove formatting button
    ];

    const options = {
      modules: {
        toolbar: {
          container: toolbarOptions,  // Selector for toolbar container
        }
      },
      placeholder: 'Edit your content...',
      theme: 'snow',
    };

    // if (!this.editor) {
    //   this.editor = new Quill(container, options);
    // } else {
    //   this.editor = new Quill(container, options);
    // }
    setTimeout(() => {
      this.editor.quill.deleteText(0, 10000000);
      if (this.selectedMediaType.idArticuloMedia !== 0) {
        if (this.selectedMediaType.hasBeenSanitized) {
          this.editor.quill.clipboard.dangerouslyPasteHTML(0, this.selectedMediaType.original_content);
        } else {
          this.editor.quill.clipboard.dangerouslyPasteHTML(0, this.selectedMediaType.content);
        }
      } else {
        this.editor.quill.clipboard.dangerouslyPasteHTML(0, this.selectedMediaType.original_content);
      }

    }, 100);
  }

  saveArticulo() {
    this.loading = true;
    if (this.article.display_as_wordpress) {
      if (
        !this.article.show_more_text
        || this.article.show_more_text === ''
        || !this.article.wordpress_link
        || this.article.wordpress_link === ''
      ) {
        this.organizationService.api.showToast(`You selected the 'Display as wordpress', but you didn't provide a link.`, ToastType.error);
        this.loading = false;
        return;
      }
    }

    let method: Observable<any>;
    let success_message: string;
    let error_message: string;
    if (this.template.idTemplate === 10) {
      const groups_categories: number[] = [];
      this.multi_select.selectedItems.forEach(cat => {
        groups_categories.push(cat.id as number);
      });
      this.template.idGroupCategories = groups_categories;
    } else {
      this.template.idGroupCategories = [];
    }
    if (this.template.idTemplate === 11) {
      const element_size = this.playlist_template_form.get('items').value.length;
      if (element_size === 0) {
        this.groupProvider.api.showToast(`This template need at least one item selected, please fill all the fields.`, ToastType.info);
        this.loading = false;
        return;
      }
      this.template.playlist_info = this.playlist_template_form.value;
    }
    if (this.template.idTemplate === 13) {
      if (this.giving_template_form.invalid) {
        this.groupProvider.api.showToast(`This template need some extra info, please fill all the fields.`, ToastType.info);
        this.loading = false;
        return;
      }
      this.template.giving_info = this.giving_template_form.value;
    }
    if (this.template.idTemplate === 14) {
      if (this.booking_template_form.invalid) {
        this.groupProvider.api.showToast(`This template need some extra info, please fill all the fields.`, ToastType.info);
        this.loading = false;
        return;
      }
      this.template.booking_info = this.booking_template_form.value;
    }
    if (this.template.idTemplate === 15) {
      const element_size = this.community_box_template_form.get('items').value.length;
      if (element_size === 0) {
        this.groupProvider.api.showToast(`This template need at least one item selected, please fill all the fields.`, ToastType.info);
        this.loading = false;
        return;
      }
      this.template.community_box_info = this.community_box_template_form.value;
    }
    if (this.template.idTemplate === 17) {
      if (this.grid_template_form.invalid) {
        this.groupProvider.api.showToast(`This template need some extra info, please fill all the fields.`, ToastType.info);
        this.loading = false;
        return;
      }
      this.template.grid_info = this.grid_template_form.value;
    }
    if (this.template.idTemplate === 18) {
      if (this.link_template_form.invalid) {
        this.groupProvider.api.showToast(`This template need some extra info, please fill all the fields.`, ToastType.info);
        this.loading = false;
        return;
      }
      this.template.link_page = this.link_template_form.get('link_page').value;
      this.template.open_external = this.link_template_form.get('open_external').value;
    }
    if (this.template.idTemplate === 20) {
      const element_size = this.gallery_template_form.get('items').value.length;
      if (element_size === 0) {
        this.groupProvider.api.showToast(`This template need at least one item selected, please fill all the fields.`, ToastType.info);
        this.loading = false;
        return;
      }
      this.template.gallery_info = this.gallery_template_form.value;
    }
    if (this.template.idTemplate === 21) {
      const element_size = this.mailing_list_template_form.get('items').value.length;
      if (element_size === 0) {
        this.groupProvider.api.showToast(`This template need at least one item selected, please fill all the fields.`, ToastType.info);
        this.loading = false;
        return;
      }
      this.template.mailing_list_info = this.mailing_list_template_form.value;
    } else if (this.template.idTemplate === 25) {
      const element_size = this.subcategories_template_form.get('headers').value.length;
      if (element_size === 0) {
        this.groupProvider.api.showToast(`This template need at least one item selected, please fill all the fields.`, ToastType.info);
        this.loading = false;
        return;
      }
      this.template.header_items = this.subcategories_template_form.get('headers').value;
    } else if (this.template.idTemplate === 26) {
      if (this.detail_template_form.invalid) {
        this.groupProvider.api.showToast(`This template need some extra info, please fill all the fields.`, ToastType.info);
        this.loading = false;
        return;
      }
      this.template.detail_info = this.detail_template_form.value;
    }

    this.article.articulosMedia = [...this.article.segments];
    this.article.header_style = this.header_design_form.value;

    const list_to_delete = this.article.segments.filter(item => {
      return item.idMediaType === 1 && item.idArticuloMedia === 0;
    });

    this.article.articulosMedia.forEach(media => {
      if (media.idMediaType === 1) {
        media.url = (media.url as string).replace(/\/img\/iglesiaTech\//g, '').replace(this.serverRegex, '');
        media.url = `/img/iglesiaTech/${media.url}`;
      }
      if (media.hasBeenSanitized) {
        if (media.idMediaType === 4) {
          media.content = media.original_content;
        }
        if (media.idMediaType === 2) {
          media.url = media.original_url;
        }
      }
    });

    let subscription: Observable<any>;
    if (this.isEdit) {
      subscription = this.organizationService.updateArticulo(this.article);
    } else {
      subscription = this.organizationService.saveArticulo(this.article);
    }
    this.template.created_by = this.user.idUsuario;
    this.article.template = this.template;

    subscription.subscribe(response => {
      this.organizationService.api.showToast(`Article ${(this.isEdit ? 'updated' : 'saved')} successfully!`, ToastType.success);
      this.deletePrevious(this.existing_images_to_delete);

      this.template.idArticulo = response.idArticulo;
      this.detail_template_form.get('parent_id').setValue(response.idArticulo);
      // save Template
      if (this.template.idArticuloTemplate) {
        method = this.organizationService.updateArticleTemplate(this.template);
        success_message = `Configuration updated successfully.`;
        error_message = `Error updating the template selected.`;
      } else {
        success_message = `Configuration saved successfully.`;
        error_message = `Error saving the template selected.`;
        method = this.organizationService.saveArticleTemplate(this.template);
      }
      method.subscribe(response => {
        // this.iglesiaProvider.getIglesiaFullData(this.iglesiaProvider._idIglesia).subscribe(data => {
        //   this.iglesiaProvider.iglesia_selected = data["iglesia"];
        //   this.theme.setTheme(this.iglesiaProvider.iglesia_selected["theme"]);
        //   this.stateProvider.set('theme', "theme");
        // })
        this.submit.emit(true);
        this.organizationService.api.showToast(`${success_message}`, ToastType.success);
        // this.dismiss(response);
        this.loading = false;
      }, error => {
        console.error(error);
        this.organizationService.api.showToast(`${error_message}`, ToastType.error);
        this.loading = false;
      });

    }, error => {
      console.error(error);
      let error_message = `Error ${(this.isEdit ? 'updating' : 'saving')} the article...`;
      let duration = 3000;
      if (error.error.msg.Code === 422) {
        error_message = `${error_message} ${error.error.msg.Message} Please edit or delete the segment.`;
        duration = 5000;
      } else {
        error_message = `${error_message} Please try again.`;
      }
      this.organizationService.api.showToast(error_message, ToastType.error);
      this.loading = false;
    });
  }

  async editMediaType(action: ArticuloMediaModel) {
    const index = this.article.segments.indexOf(action);
    this.selectedMediaType = Object.assign({}, action);
    this.selectedMediaType.index = index;
    switch (action.idMediaType) {
      case 2:
        // Video
        this.selectedMediaType.url = action.hasBeenSanitized ? action.original_url : action.url;
        this.modal.getModal('editModal').open();
        break;
      case 4:
        // Content
        this.modal.getModal('editContentModal').open();
        break;
      case 6:
      case 7:
      case 8:
        // Audio & Document
        let type: string = action.idMediaType == 6 ? 'audio' : action.idMediaType == 7 ? 'document' : 'video';
        let requested_media: string = action.idMediaType == 6 ? 'audios' : action.idMediaType == 7 ? 'documents' : 'videos';
        const response: any = await this.api.get(`videos/getVideos/`, { idIglesia: this.article.idIglesia, type }).toPromise()
          .catch(error => {
            console.error(error);
            return;
          });
        if (response) {
          this.media_items = response.videos;
          this.modal.getModal('selectMediaItemModal').open();
        } else {
          this.media_items = [];
          this.api.showToast(`Error tying to get your ${requested_media}.`, ToastType.error);
        }
        break;
      default:
        // 1, 3, 5
        this.modal.getModal('editModal').open();
        break;
    }
  }

  async dismiss(action: ArticuloMediaModel) {
    const articuloMedia = new ArticuloMediaModel();
    articuloMedia.idMediaType = action.idMediaType;
    articuloMedia.mediaType = action.nombre;
    articuloMedia.idArticulo = this.article.idArticulo;
    this.selectedMediaType = articuloMedia;
    if (action) {
      switch (action.idMediaType) {
        case 4:
          // Content
          this.modal.getModal('editContentModal').open();
          break;
        case 6:
        case 7:
        case 8:
          // Audio & Document
          let type: string = action.idMediaType == 6 ? 'audio' : action.idMediaType == 7 ? 'document' : 'video';
          let requested_media: string = action.idMediaType == 6 ? 'audios' : action.idMediaType == 7 ? 'documents' : 'videos';
          const response: any = await this.api.get(`videos/getVideos/`, { idIglesia: this.article.idIglesia, type }).toPromise()
            .catch(error => {
              console.error(error);
              return;
            });
          if (response) {
            this.media_items = response.videos;
            this.modal.getModal('selectMediaItemModal').open();
          } else {
            this.media_items = [];
            this.api.showToast(`Error tying to get your ${requested_media}.`, ToastType.error);
          }
          break;
        default:
          // 1, 2, 3, 5.
          this.modal.getModal('editModal').open();
          break;
      }
    }
  }

  getPictureFromInput() {
    if (this.input_file) {
      this.input_file.nativeElement.onchange = (event: { target: { files: File[] } }) => {
        if (event.target.files.length > 0) {
          this.photo = event.target.files[0];
        }
      };
    }
  }

  updateInternalImage() {
    if (this.validateMediaType()) {
      const indexPoint = (this.photo.name as string).lastIndexOf('.');
      const extension = (this.photo.name as string).substring(indexPoint);
      const ticks = (Number(String(Math.random()).slice(2)) + Date.now() + Math.round(performance.now())
      ).toString(36);
      let myUniqueFileName = '';
      if (this.isEdit) {
        myUniqueFileName = `articulo_image_${this.article.idArticulo}_${ticks}${extension}`;
      } else {
        myUniqueFileName = `articulo_image_new_${ticks}${extension}`;
      }
      const iglesia_temp: OrganizationModel = new OrganizationModel();
      iglesia_temp.idIglesia = this.user.idIglesia;
      iglesia_temp.topic = this.user.topic;

      this.organizationService.uploadFile(this.photo, iglesia_temp, myUniqueFileName, 'articulo')
        .then((response: any) => {
          const mediaType = new ArticuloMediaModel();
          mediaType.idArticulo = this.article.idArticulo;
          mediaType.idMediaType = this.selectedMediaType.idMediaType;
          mediaType.mediaType = this.selectedMediaType.mediaType;
          mediaType.titulo = this.selectedMediaType.titulo ? this.selectedMediaType.titulo : '';
          mediaType.url = `${response.file_info.src_path}`;

          if (this.selectedMediaType.idArticuloMedia || this.selectedMediaType.index >= 0) {
            this.article.segments[this.selectedMediaType.index] = mediaType;
          } else {
            this.article.segments.push(mediaType);
          }
          this.photo = undefined;
          this.modal.getModal('editModal').close();
        });
    }
  }

  validateMediaType(): boolean {
    if (this.selectedMediaType.idMediaType === 1) {
      if (!this.selectedMediaType.titulo || this.selectedMediaType.titulo === '') {
        this.organizationService.api.showToast(`You need to add a title.`, ToastType.info);
        return false;
      } else if (!this.photo) {
        this.organizationService.api.showToast(`You need to add a photo.`, ToastType.info);
        return false;
      }
    }
    if (this.selectedMediaType.idMediaType === 2
      || this.selectedMediaType.idMediaType === 3
      || this.selectedMediaType.idMediaType === 5) {
      if (!this.selectedMediaType.titulo || this.selectedMediaType.titulo === '') {
        this.organizationService.api.showToast(`You need to add a title.`, ToastType.info);
        return false;
      } else if (!this.selectedMediaType.url || this.selectedMediaType.url === '') {
        this.organizationService.api.showToast(`You need to add an url.`, ToastType.info);
        return false;
      }
    }
    if (this.selectedMediaType.idMediaType === 4) {
      if (!this.selectedMediaType.summary
        || this.selectedMediaType.summary === ''
        || (this.selectedMediaType.summary as string).length < 1) {
        this.organizationService.api.showToast(`You need to add some body to your content.`, ToastType.info);
        return false;
      }
    }
    return true;
  }

  deleteMediaType(item) {
    if (confirm(`Are you sure you want to delete this block?`)) {
      const index = this.article.segments.indexOf(item);
      if (index !== -1) {
        if (item.idMediaType === 1) {
          if (item.idArticuloMedia === 0) {
            const array = [{
              url: (item.url as string).replace(/\/img\/iglesiaTech\//g, '').replace(this.serverRegex, '')
            }];
            this.deletePrevious(array);
          } else {
            this.existing_images_to_delete.push({
              url: (item.url as string).replace(/\/img\/iglesiaTech\//g, '').replace(this.serverRegex, '')
            });
          }
        }
        this.article.segments.splice(index, 1);
        this.organizationService.api.showToast(`Segment deleted successfully!`, ToastType.success);
      }
    }
  }

  deletePrevious(array_to_delete: any[]) {
    this.organizationService.deleteImages(array_to_delete).subscribe(response => {
    }, error => {
      console.error(error);
    });

  }

  addCover() {
    this.input_articulo_cover_file.nativeElement.onchange = (event: { target: { files: File[] } }) => {
      if (event.target.files.length > 0) {

        this.photo = event.target.files[0];
        this.uploadArticuleSlider();

        var reader = new FileReader();
        //Read the contents of Image File.
        reader.readAsDataURL(this.photo);
        reader.onload = (e: any) => {

          //Initiate the JavaScript Image object.
          var image = new Image();

          //Set the Base64 string return from FileReader as source.
          image.src = e.target.result as any;

          //Validate the File Height and Width.
          image.onload = () => {
            var height = image.height;
            var width = image.width;
            const aspect_ratio = height / width;
            if (aspect_ratio > 0.62) {
              this.article.height_zoom = 2;
            } else {
              this.article.height_zoom = 1;
            }
            return true;
            ;
          }
        };
      }
    };
    (this.input_articulo_cover_file as ElementRef).nativeElement.click();
  }

  imageSize(url) {
    const img = document.createElement("img");

    const promise = new Promise((resolve, reject) => {
      img.onload = () => {
        // Natural size is the actual image size regardless of rendering.
        // The 'normal' `width`/`height` are for the **rendered** size.
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        // Resolve promise with the width and height
        resolve({ width, height });
      };

      // Reject promise on error
      img.onerror = reject;
    });

    // Setting the source makes it start downloading and eventually call `onload`
    img.src = url;

    return promise;
  }

  getSize(load_event) {
    console.log(load_event);
    console.log(load_event.height);
    console.log(load_event.width);
  }
  uploadArticuleSlider() {
    const indexPoint = (this.photo.name as string).lastIndexOf('.');
    const extension = (this.photo.name as string).substring(indexPoint);
    const ticks = (Number(String(Math.random()).slice(2)) + Date.now() + Math.round(performance.now())
    ).toString(36);
    let myUniqueFileName = '';
    if (this.isEdit) {
      myUniqueFileName = `articulo_image_${this.article.idArticulo}_cover_${ticks}${extension}`;
    } else {
      myUniqueFileName = `articulo_image_new_cover_${ticks}${extension}`;
    }
    const iglesia_temp: OrganizationModel = new OrganizationModel();
    iglesia_temp.idIglesia = this.user.idIglesia;
    iglesia_temp.topic = this.user.topic;

    this.organizationService.uploadFile(this.photo, iglesia_temp, myUniqueFileName, 'articulo')
      .then((response: any) => {
        this.article.slider = this.fus.cleanPhotoUrl(response.response);
      });
  }

  fixUrl(image: string) {
    if (image) {
      if (image.includes('https://')) {
        return `${image}`;
      }
      return `${environment.serverURL}${image}`;
    }
    if (this.iglesia) {
      if (this.iglesia.portadaArticulos) {
        const path = this.fixUrl(this.iglesia.portadaArticulos);
        this.article.slider = this.fus.cleanPhotoUrl(this.iglesia.portadaArticulos);
        return path;
      }
    }
    return '/assets/img/default-image.jpg';
  }
  changeSource(event, name) { event.target.src = name; }
  translateCategories() {
    const array = [];
    this.categorias.forEach(item => {
      array.push(item.nombre);
    });
    this.translate.get(array).subscribe(response => {
      const keys = Object.keys(response);
      keys.forEach(key => {
        this.categorias.find(x => x.nombre === key).nombre = response[key];
      });
    }, error => {
    });

    const array_2 = [];
    this.items.forEach(item => {
      if (item.nombre) {
        array_2.push(item.nombre);
      }
    });
    this.translate.get(array_2).subscribe(response => {
      const keys = Object.keys(response);
      keys.forEach(key => {
        this.items.find(x => x.nombre === key).nombre = response[key];
      });
    }, error => {
    });
  }


  changeTab(event: any) {
    const idTemplate = Number(event.target.value);
    this.template.idTemplate = idTemplate;
    this.template_selected = this.templates.find(tem => tem.idTemplate === idTemplate);
    this.showPic(this.template.idTemplate);
    if (idTemplate !== 0) {
      this.article.display_as_wordpress = false;
    }
  }

  fixToNumber(event) {
    this.article.idTemplate = Number(this.article.idTemplate);
  }

  showPic(event) {
    this.template_selected = this.templates.find(tem => tem.idTemplate === event);

    if (event === 10) {
      this.groupProvider.getGroupsCategories(this.user.idIglesia)
        .subscribe((data: any) => {
          this.categories = data.categories;

          if (this.template.idTemplate === 10) {
            this.multi_select.writeValue(this.categories.filter(x => (this.template.idGroupCategories as number[]).includes(x.idGroupCategory)));
          }
        }, error => {
          console.error(error);
          this.groupProvider.api.showToast(`Error getting groups categories...`, ToastType.error);
          this.categories = [];
        });
    }
    if (event === 11) {
      this.bookingService.api
        .get('iglesias/headers', { idIglesia: this.currentUser.idIglesia, idModule: 9 })
        .subscribe((data: any) => {
          this.playlists = data.profile_tabs;
          if (!this.template.playlist_info.items) {
            this.template.playlist_info.items = [];
          }
          const selected_items = this.playlists.filter(x => this.template.playlist_info.items.includes(x.id))
          if (this.template.idTemplate === 11) {
            this.multi_select_playlists.writeValue(selected_items);
          }
          // this.playlist_template_form = this.formBuilder.group({
          //   idPlaylist: ['', Validators.required],
          //   button_border_radius: [25, [Validators.required, Validators.min(0)]],
          //   button_spacing: [10, [Validators.required, Validators.min(0)]],
          //   shadow_color: ['#000000', Validators.required],
          //   shadow_spread: [0.5, [Validators.required, Validators.min(0)]],
          //   shadow_blur: [1.5, [Validators.required, Validators.min(0)]],
          //   title_text_bold: ['bolder', [Validators.required]],
          //   title_text_color: ['#000000', [Validators.required]],
          //   title_text_align: ['left', [Validators.required]],
          //   display_description: [true, Validators.required],
          //   description_text_color: ['#666666', [Validators.required]]
          // });
          if (this.template.playlist_info) {
            this.playlist_template_form.patchValue(this.template.playlist_info);
          } else {
            this.playlist_template_form.patchValue({});
          }
          this.playlist_template_form.get('selected_items').patchValue(selected_items);
          this.clearPlaylistForm();
          if (selected_items.length > 0) {
            const array = this.playlist_template_form.get('items') as FormArray;
            selected_items.forEach(x => {
              const group = this.formBuilder.group({
                id: new FormControl('')
              })
              group.patchValue(x);
              array.push(group);
            })
          }
        }, error => {
          console.error(error);
          this.groupProvider.api.showToast(`Error getting playlists...`, ToastType.error);
          this.playlists = [];
        });
    }
    if (event === 13) {
      this.giving_template_form = this.formBuilder.group({
        header_text: ['', Validators.required],
        subheader_text: ['', Validators.required],
        button_text: ['', Validators.required],
        background_picture: ['assets/imgs/default-portrait.png', Validators.required],
        donation_url: ['', Validators.required],
      });
      if (this.template.giving_info) {
        this.giving_template_form.patchValue(this.template.giving_info);
      } else {
        this.giving_template_form.patchValue({});
      }
    }
    if (event === 14) {
      this.bookingService.getBookingsToShare(this.user.idIglesia)
        .subscribe((data: any) => {
          this.bookings = data.bookings;

          if (this.template.idTemplate === 14) {
            this.multi_select_bookings.writeValue(this.bookings.filter(x => this.template.booking_info.idBookingCalendar === x.idBookingCalendar));
          }
          this.booking_template_form = this.formBuilder.group({
            idBookingCalendar: ['', Validators.required],
            preview_url: ['', Validators.required]
          });
          if (this.template.booking_info) {
            this.booking_template_form.patchValue(this.template.booking_info);
          } else {
            this.booking_template_form.patchValue({});
          }
        }, error => {
          console.error(error);
          this.groupProvider.api.showToast(`Error getting bookings...`, ToastType.error);
          this.bookings = [];
        });
    }

    if (event === 15) {
      this.bookingService.api
        .get('iglesias/headers', { idIglesia: this.currentUser.idIglesia, idModule: 8 })
        .subscribe((data: any) => {
          this.communityBoxes = data.profile_tabs;
          if (!this.template.community_box_info.items) {
            this.template.community_box_info.items = [];
          }
          const selected_items = this.communityBoxes.filter(x => this.template.community_box_info.items.includes(x.id));

          if (this.template.idTemplate === 15) {
            this.multi_select_community_boxes.writeValue(selected_items);
          }
          // this.community_box_template_form = this.formBuilder.group({
          //   idCommunityBox: ['', Validators.required]
          // });
          if (this.template.community_box_info) {
            this.community_box_template_form.patchValue(this.template.community_box_info);
          } else {
            this.community_box_template_form.patchValue({});
          }
          this.community_box_template_form.get('selected_items').patchValue(selected_items);
          this.clearCommunityForm();
          if (selected_items.length > 0) {
            const array = this.community_box_template_form.get('items') as FormArray;
            selected_items.forEach(x => {
              const group = this.formBuilder.group({
                id: new FormControl('')
              })
              group.patchValue(x);
              array.push(group);
            })
          }
        }, error => {
          console.error(error);
          this.groupProvider.api.showToast(`Error getting communities...`, ToastType.error);
          this.communityBoxes = [];
        });
    }

    if (event === 17) {
      this.grid_template_form = this.formBuilder.group({
        display_header: [false, Validators.required],
        blocks_per_row: [1, [Validators.required, Validators.max(2)]],
        button_border_radius: [25, [Validators.required, Validators.min(0)]],
        button_spacing: [10, [Validators.required, Validators.min(0)]],
        shadow_color: ['#000000', Validators.required],
        shadow_spread: [0.5, [Validators.required, Validators.min(0)]],
        shadow_blur: [1.5, [Validators.required, Validators.min(0)]]
      });
      if (this.template.grid_info) {
        this.grid_template_form.patchValue(this.template.grid_info);
      } else {
        this.grid_template_form.patchValue({});
      }
    }
    if (event === 18) {

      this.link_template_form = this.formBuilder.group({
        link_page: ['', Validators.required],
        open_external: [false]
      });
      if (this.template.link_page) {
        this.link_template_form.patchValue({ link_page: this.template.link_page, open_external: this.template.open_external });
      } else {
        this.link_template_form.patchValue({});
      }

    }

    if (event === 20) {
      this.bookingService.api
        .get('iglesias/headers', { idIglesia: this.currentUser.idIglesia, idModule: 6 })
        .subscribe((data: any) => {
          this.galleries = data.profile_tabs;

          if (!this.template.gallery_info.items) {
            this.template.gallery_info.items = [];
          }
          const selected_items = this.galleries.filter(x => this.template.gallery_info.items.includes(x.id));
          if (this.template.idTemplate === 25) {
            this.multi_select_galleries.writeValue(selected_items);
          }
          // this.gallery_template_form = this.formBuilder.group({
          //   idGallery: ['', Validators.required]
          // });
          if (this.template.gallery_info) {
            this.gallery_template_form.patchValue(this.template.gallery_info);
          } else {
            this.gallery_template_form.patchValue({});
          }
          this.gallery_template_form.get('selected_items').patchValue(selected_items);
          this.clearGalleryForm();
          if (selected_items.length > 0) {
            const array = this.gallery_template_form.get('items') as FormArray;
            selected_items.forEach(x => {
              const group = this.formBuilder.group({
                id: new FormControl('')
              })
              group.patchValue(x);
              array.push(group);
            })
          }
        }, error => {
          console.error(error);
          this.groupProvider.api.showToast(`Error getting galleries...`, ToastType.error);
          this.galleries = [];
        });
    }

    if (event === 21) {
      this.bookingService.api
        .get('iglesias/headers', { idIglesia: this.currentUser.idIglesia, idModule: 7 })
        .subscribe((data: any) => {
          this.mailingLists = data.profile_tabs;

          if (!this.template.mailing_list_info.items) {
            this.template.mailing_list_info.items = [];
          }
          const selected_items = this.mailingLists.filter(x => this.template.mailing_list_info.items.includes(x.id));
          if (this.template.idTemplate === 21) {
            this.multi_select_mailing_list_boxes.writeValue(selected_items);
          }
          // this.mailing_list_template_form = this.formBuilder.group({
          //   idMailingList: ['', Validators.required],
          //   mailing_language: ['es', Validators.required]
          // });
          if (this.template.mailing_list_info) {
            this.mailing_list_template_form.patchValue(this.template.mailing_list_info);
          } else {
            this.mailing_list_template_form.patchValue({});
          }
          this.mailing_list_template_form.get('selected_items').patchValue(selected_items);
          this.clearMailingForm();
          if (selected_items.length > 0) {
            const array = this.mailing_list_template_form.get('items') as FormArray;
            selected_items.forEach(x => {
              const group = this.formBuilder.group({
                id: new FormControl('')
              })
              group.patchValue(x);
              array.push(group);
            })
          }
        }, error => {
          console.error(error);
          this.groupProvider.api.showToast(`Error getting communities...`, ToastType.error);
          this.mailingLists = [];
        });
    }
    if (event === 25) {
      this.bookingService.api
        .get('iglesias/headers', { idIglesia: this.currentUser.idIglesia, idModule: 2 })
        .subscribe((data: any) => {
          this.subcategories_headers = data.profile_tabs;
          const selected_items = this.subcategories_headers.filter(x => this.template.header_items.includes(x.id));
          if (this.template.idTemplate === 25) {
            this.multi_select_subcategories.writeValue(selected_items);
          }
          // this.subcategories_template_form = this.formBuilder.group({
          //   selected_items: new FormControl(),
          //   headers: new FormArray([])
          // });
          this.subcategories_template_form.get('selected_items').patchValue(selected_items);
          this.clearSubcategoriesForm();
          if (selected_items.length > 0) {
            const array = this.subcategories_template_form.get('headers') as FormArray;
            selected_items.forEach(x => {
              const group = this.formBuilder.group({
                id: new FormControl('')
              })
              group.patchValue(x);
              array.push(group);
            })
          }

        }, error => {
          console.error(error);
          this.groupProvider.api.showToast(`Error getting headers...`, ToastType.error);
          this.subcategories_headers = [];
        });
    }
    if (event === 26) {
      this.groupProvider.api
        .get(`iglesias/getModules`)
        .subscribe((response: any) => {
          this.header_submodules = response.submodules;
          this.header_submodules.unshift({
            id: 0,
            name: ' -- Please select an option --'
          });

          this.detail_template_form = this.formBuilder.group({
            parent_module_id: [2, Validators.required],
            parent_id: [this.article.idArticulo, Validators.required],
            link_module_id: new FormControl(0, [Validators.required, Validators.min(1)]),
            element_id: new FormControl(undefined, [Validators.required, Validators.min(1)]),
          });
          if (this.template.detail_info) {
            this.detail_template_form.patchValue(this.template.detail_info);
            this.resetItemID({
              target: {
                value: this.template.detail_info.link_module_id
              }
            });
          } else {
            this.detail_template_form.patchValue({});
          }
        }, error => {
          console.error(error);
          this.groupProvider.api.showToast(`Error getting modules...`, ToastType.error);
          this.header_submodules = [];
        });
    }
  }

  toggleAcceptace(form_group: FormGroup, field: string) {
    const actual_value = form_group.get(field).value;
    form_group.get(field).setValue(!actual_value);
  }

  fixBooking(event) {
    const booking = this.bookings.find(x => x.idBookingCalendar === event.idBookingCalendar);
    if (booking) {
      const frame_code = `${environment.server_calendar}/preview/${booking.idBookingCalendar}/${btoa(booking.calendar_id)}`;
      this.booking_template_form.get('idBookingCalendar').setValue(event.idBookingCalendar);
      this.booking_template_form.get('preview_url').setValue(frame_code);
    }
  }

  fixPlaylist(event) {
    const selected_items = this.playlist_template_form.value.selected_items;
    this.clearPlaylistForm();
    if (selected_items.length > 0) {
      const array = this.playlist_template_form.get('items') as FormArray;
      selected_items.forEach(x => {
        const group = this.formBuilder.group({
          id: new FormControl('')
        })
        group.patchValue(x);
        array.push(group);
      })
    }
  }

  fixCommunity(event) {
    const selected_items = this.community_box_template_form.value.selected_items;

    this.clearCommunityForm();
    if (selected_items.length > 0) {
      const array = this.community_box_template_form.get('items') as FormArray;
      selected_items.forEach(x => {
        const group = this.formBuilder.group({
          id: new FormControl('')
        })
        group.patchValue(x);
        array.push(group);
      })
    }
  }

  fixMailingList(event) {
    const selected_items = this.mailing_list_template_form.value.selected_items;

    this.clearMailingForm();
    if (selected_items.length > 0) {
      const array = this.mailing_list_template_form.get('items') as FormArray;
      selected_items.forEach(x => {
        const group = this.formBuilder.group({
          id: new FormControl('')
        })
        group.patchValue(x);
        array.push(group);
      })
    }
  }

  fixGallery(event) {
    const selected_items = this.gallery_template_form.value.selected_items;

    this.clearGalleryForm();
    if (selected_items.length > 0) {
      const array = this.gallery_template_form.get('items') as FormArray;
      selected_items.forEach(x => {
        const group = this.formBuilder.group({
          id: new FormControl('')
        })
        group.patchValue(x);
        array.push(group);
      })
    }
  }

  clearBookingForm() {
    this.booking_template_form.patchValue({
      idBookingCalendar: undefined,
      preview_url: undefined
    });
  }

  clearPlaylistForm() {
    const items = this.playlist_template_form.get('items') as FormArray;
    while (items.length > 0) {
      items.removeAt(0);
    }
  }

  clearCommunityForm() {
    this.community_box_template_form.patchValue({
      idCommunityBox: undefined
    });
  }

  clearMailingForm() {
    this.mailing_list_template_form.patchValue({
      // idMailingList: undefined,
      mailing_language: 'es'
    });
    const items = this.mailing_list_template_form.get('items') as FormArray;
    while (items.length > 0) {
      items.removeAt(0);
    }
  }

  clearGalleryForm() {
    const galleries = this.gallery_template_form.get('items') as FormArray;
    while (galleries.length > 0) {
      galleries.removeAt(0);
    }
  }

  addDefaultImage() {
    this.giving_template_form.patchValue({
      background_picture: `assets/imgs/default-portrait.png`
    });
  }

  uploadPicture(input_file) {
    input_file.onchange = (event: { target: { files: File[] } }) => {
      if (event.target.files.length > 0) {
        this.uploadImage(event.target.files[0]);
      }
    };
    input_file.click();
  }

  uploadImage(photo) {
    this.fus.uploadFile(photo, true, 'templates')
      .subscribe((response: any) => {
        const background_picture = this.fus.cleanPhotoUrl(response.response);
        this.giving_template_form.patchValue({
          background_picture
        });
      });
  }

  saveTemplate(template: TemplateModel) {
  }

  get show_display_description_on_playlist() {
    return this.playlist_template_form.get('display_description').value;
  }
  get show_display_more_button_on_playlist() {
    return this.playlist_template_form.get('display_more_button').value;
  }

  async resetItemID(event) {
    this.detail_template_form.get('element_id').reset();
    this.detail_template_form.get('element_id').setValue(0);
    const idSubmodule = Number(event.target.value);
    if (idSubmodule === 0) {
      return;
    }
    this.items = await this.getItemsPerModule(idSubmodule);
    if (idSubmodule === 3) {
      this.detail_item_properties.id_key = 'idGroupEvent';
      this.detail_item_properties.name_key = 'name';
    } else if (idSubmodule === 5) {
      this.detail_item_properties.id_key = 'idGroup';
      this.detail_item_properties.name_key = 'title';
      // this.items = this.iglesia.groups;
    } else if (idSubmodule === 6) {
      this.detail_item_properties.id_key = 'id';
      this.detail_item_properties.name_key = 'name';
      // this.items = this.iglesia.galleries;
    } else if (idSubmodule === 7) {
      this.detail_item_properties.id_key = 'id';
      this.detail_item_properties.name_key = 'name';
      // this.items = this.iglesia.inboxes;
    } else if (idSubmodule === 8) {
      this.detail_item_properties.id_key = 'id';
      this.detail_item_properties.name_key = 'name';
      // this.items = this.iglesia.community_boxes;
    } else if (idSubmodule === 9) {
      this.detail_item_properties.id_key = 'idPlaylist';
      this.detail_item_properties.name_key = 'name';
      // this.items = this.iglesia.playlists;
    } else if (idSubmodule === 2 || idSubmodule === 10) {
      this.detail_item_properties.id_key = 'idCategoriaArticulo';
      this.detail_item_properties.name_key = 'nombre';
      // this.items = [...this.categories];
    }
    this.items.unshift({
      [this.detail_item_properties.id_key]: 0,
      [this.detail_item_properties.name_key]: '-- Select an option --'
    });
  }

  getItemsPerModule(idSubmodule: number): any[] | PromiseLike<any[]> {
    return new Promise((resolve, reject) => {
      let method: Observable<any>;
      let subscription: Subscription;

      if (idSubmodule === 3) {
        method = this.groupProvider.getGroupsEventsByIdIglesia(this.currentUser.idIglesia);
      } else if (idSubmodule === 5) {
        method = this.groupProvider.getGroups();
      } else if (idSubmodule === 6) {
        method = this.bookingService.api.get('galleries', { idIglesia: this.currentUser.idIglesia });
      } else if (idSubmodule === 7) {
        method = this.bookingService.api.get('mailingList', { idIglesia: this.currentUser.idIglesia });
      } else if (idSubmodule === 8) {
        method = this.groupProvider.api.get("communityBox", { idIglesia: this.currentUser.idIglesia });
      } else if (idSubmodule === 9) {
        method = this.videoService.getPlaylists();
      } else if (idSubmodule === 2 || idSubmodule === 10) {
        method = this.groupProvider.api.get(`articulos/getCategoriasArticulosByIdIglesia`, { idIglesia: this.currentUser.idIglesia });
      }

      subscription = method.subscribe(response => {
        if (idSubmodule === 3) {
          this.items = response.events;
        } else if (idSubmodule === 5) {
          this.items = response.groups;
        } else if (idSubmodule === 6 || idSubmodule === 7 || idSubmodule === 8) {
          this.items = response;
        } else if (idSubmodule === 9) {
          this.items = response.playlists;
        } else if (idSubmodule === 10 || idSubmodule === 2) {
          this.items = response.categorias;
          this.translateCategories();
        }
        if (this.template.detail_info) {
          this.detail_template_form.get('element_id').setValue(this.template.detail_info.element_id);
        }
        return resolve(this.items);
      }, error => {
        console.error(error);
      });
    })
  }

  get filtered_media_types() {
    if (this.article) {
      if (this.article.idTemplate == 18) {
        return this.media_types.filter(x => x.idMediaType === 4);
      }
      return this.media_types;
    }
    return this.media_types;
  }

  clearSubcategoriesForm() {

    const headers = this.subcategories_template_form.get('headers') as FormArray;
    while (headers.length > 0) {
      headers.removeAt(0);
    }
  }

  fixSubcategories(event) {
    const selected_items = this.subcategories_template_form.value.selected_items;
    this.clearSubcategoriesForm();
    if (selected_items.length > 0) {
      const array = this.subcategories_template_form.get('headers') as FormArray;
      selected_items.forEach(x => {
        const group = this.formBuilder.group({
          id: new FormControl('')
        })
        group.patchValue(x);
        array.push(group);
      })
    }
  }

  openButtonModal() {
    this.modal.get('generate_button_modal_in_article').open();
  }

  insertButtonV2(button_frame) {
    this.selectedMediaType.content += button_frame;
    this.modal.get('generate_button_modal_in_article').close();
  }

  setEditable(key: string) {
    this.editable_option = key;

  }

  addColor(color?: GradientColorModel) {
    const group = new FormGroup({
      hex_color: new FormControl('#FFFFFF'),
      r: new FormControl(255),
      g: new FormControl(255),
      b: new FormControl(255),
      alpha: new FormControl(100, [Validators.max(100), Validators.min(0)]),
      degrees: new FormControl(100, [Validators.max(100), Validators.min(0)])
    });
    if (color) {
      group.patchValue(color);
    }
    this.colors.push(group);
  }

  deleteColor(index: number) {
    this.colors.removeAt(index);
  }

  verifyHex(color: FormGroup, override?: boolean) {
    const regex = /^#([0-9A-F]{3}){1,2}$/i;
    let hex_color: string = color.get('hex_color').value;
    if (!hex_color.startsWith('#')) {
      hex_color = `#${hex_color}`;
    }
    if (regex.test(hex_color)) {
      const rgb = this.hexToRgb(hex_color);
      color.patchValue(rgb);
    } else {
      if (override) {
        const fake_value = {
          hex_color: '#000000',
          r: 0,
          g: 0,
          b: 0
        }
        color.patchValue(fake_value);
      }
    }
    this.sortArray();
  }

  hexToRgb(hex_color: string) {
    let hex = hex_color.replace("#", "");

    // Convert shorthand hex to full hex
    if (hex.length === 3) {
      hex = hex.replace(/(.)/g, "$1$1");
    }

    // Extract the RGB components
    var r = parseInt(hex.substr(0, 2), 16);
    var g = parseInt(hex.substr(2, 2), 16);
    var b = parseInt(hex.substr(4, 2), 16);

    // Return the RGB values as an object
    return {
      r,
      g,
      b
    };
  }

  rgbToHex({ r, g, b }) {
    // Convert each component to hexadecimal
    var rHex = r.toString(16).padStart(2, '0');
    var gHex = g.toString(16).padStart(2, '0');
    var bHex = b.toString(16).padStart(2, '0');

    // Concatenate the components
    var hexCode = '#' + rHex + gHex + bHex;

    // Return the hexadecimal color code
    return hexCode;
  }

  checkValue(color: FormGroup, key: 'r' | 'g' | 'b') {
    var regex = /^[0-9]*$/;
    let value: string = color.get(key).value;
    if (!regex.test(value)) {
      value = value.replace(/[^0-9]/g, "");
    }
    let number_value = Number(value);
    if (number_value > 255) {
      number_value = 255;
    }
    if (number_value < 0) {
      number_value = 0;
    }
    color.get(key).setValue(number_value);
    const hex = this.rgbToHex(color.value);
    console.log(hex);
    color.get('hex_color').setValue(hex);
  }

  sortArray() {
    const arrayControls = this.colors.controls;
    const arrayValues = arrayControls.map((control) => control.value);

    // Step 4: Sort the array using a custom comparison function
    arrayValues.sort((a, b) => {
      return Number(a.degrees) > Number(b.degrees) ? 1 : -1;
    });

    // Step 5: Clear existing controls from the FormArray
    while (this.colors.length) {
      this.colors.removeAt(0);
    }

    // Step 6: Add the sorted controls back to the FormArray
    arrayValues.forEach((value) => {
      const group = new FormGroup({
        hex_color: new FormControl('#FFFFFF'),
        r: new FormControl(255),
        g: new FormControl(255),
        b: new FormControl(255),
        alpha: new FormControl(100, [Validators.max(100), Validators.min(0)]),
        degrees: new FormControl(100, [Validators.max(100), Validators.min(0)])
      });
      console.log(group);
      console.log(value);
      group.patchValue(value);
      this.colors.push(group);
    });
  }

  preventEvent(event: KeyboardEvent, color: FormGroup, key: string) {
    let value: string = color.get(key).value || '';
    if (value === '') {
      if (event.key === 'Backspace') {
        event.stopPropagation();
        event.preventDefault()
        event.cancelBubble = true;
        return false;
      }
    }
    let allowed = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'ArrowRight', 'ArrowLeft'
    ];
    if (!allowed.includes(event.key) || value.length > 9) {
      if (event.key !== 'Backspace') {
        event.stopPropagation();
        event.preventDefault()
        event.cancelBubble = true;
        return false;
      }
    }
    // return false;
  }

  checkPercent(color) {
    const degrees = Number(color.get('degrees').value);
    if (isNaN(degrees)) {
      color.get('degrees').setValue(100);
    }
    if (degrees > 100) {
      color.get('degrees').setValue(100);
    }
    if (degrees < 0) {
      color.get('degrees').setValue(0);
    }
    this.sortArray();
  }

  setTitle(title_settings: TitleHeaderSettings) {
    console.log(title_settings);
    this.header_design_form.get('title_settings').patchValue(title_settings);
  }
}
