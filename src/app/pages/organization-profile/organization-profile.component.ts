import { ProfileGroupsDisplayComponent } from './../../component/profile-groups-display/profile-groups-display.component';
import { ProfileTextContainerModel } from '../../component/text-container/profile-text-container/profile-text-container.component';
import { ProfileItemsDisplayComponent } from './../../component/profile-items-display/profile-items-display.component';
import { DonationFormModel } from './../donations/forms/donation-form-list/donation-form-list.component';
import { ResizeEvent } from 'angular-resizable-element/public-api';
import { Observable } from 'rxjs';
import { ProfileCommunityBoxesDisplayComponent } from './../../component/profile-community-boxes-display/profile-community-boxes-display.component';
import { ProfilePlaylistsDisplayComponent } from './../../component/profile-playlists-display/profile-playlists-display.component';
import { ProfileContactInboxDisplayComponent } from './../../component/profile-contact-inbox-display/profile-contact-inbox-display.component';
import { UsTabSettingsCategoryModel, UsTabSettingsModel } from './ProfileModel';
import { AppComponent } from 'src/app/app.component';
import { PlaylistModel } from './../../models/VideoModel';
import { CommunityBoxModel } from 'src/app/models/CommunityBoxModel';
import { DetailCustomComponentComponent } from './detail-custom-component/detail-custom-component.component';
import { GroupsService } from './../../services/groups.service';
import { NavigationEnd } from '@angular/router';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { GalleryModel } from './../../models/GalleryModel';
import { NgxSmartModalComponent } from 'ngx-smart-modal';
import { GroupEventModel } from './../../models/GroupModel';
import { ArticuloModel } from './../../models/ArticuloModel';
import { ArticleFormComponent } from './../content/article-form/article-form.component';
import { CategoriaArticuloModel } from './../../models/CategoriaArticuloModel';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { AutocompleteResponseModel } from './../../component/google-places/google-places.component';
import { StyleSettingModel } from './../../component/groups-embed/groups-embed.component';
import { ToastType } from 'src/app/login/ToastTypes';
import { Component, OnInit, ViewChild, ElementRef, AfterContentChecked, ChangeDetectorRef, AfterViewChecked, HostListener, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { User } from 'src/app/interfaces/user';
import { ApiService } from 'src/app/services/api.service';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment'; import * as QuillNamespace from "quill";
let Quill: any = QuillNamespace;
import ImageResize from "quill-image-resize-module";
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { DatosPagosIglesiaModel, OrganizationModel, DatosProyectoIglesiaModel } from 'src/app/models/OrganizationModel';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { MailingListModel } from 'src/app/models/MailingListModel';
import { ProfileArticlesDisplayComponent } from 'src/app/component/profile-articles-display/profile-articles-display.component';
import { IconPickerDirective } from 'ngx-icon-picker';
import { NetworksProfileFormComponent } from '../networks/networks-profile-form/networks-profile-form.component';
import { EventTemplateSettingsModel } from 'src/app/component/event-calendar/event-calendar.component';
import { ProfileGalleriesDisplayComponent } from 'src/app/component/profile-galleries-display/profile-galleries-display.component';
import { TextEditorComponent } from 'src/app/component/text-editor/text-editor.component';
import { RandomService } from 'src/app/services/random.service';
import { GalleryService } from 'src/app/services/gallery.service';

export class HeaderMenuSettingModel {
  text_color: string;
  active_text_color
  background_color: string;
  active_color: string;
  show_icon: boolean;
  border_width: number;
  border_color: string;
  second_border_color: string;
  // second_percent: number;
  // display_header: boolean;
  // items_per_row: number;
  // col_size: string;
  is_full_width: boolean;
  aspect_ratio: number;
  height: number;
  width: number;
  idFooterStyle: number;
  dashboard_height: number;

  constructor() {
    this.text_color = "#b4b4b4";
    this.active_text_color = "#ffffff";
    this.background_color = '#343a40';
    this.active_color = "#d3d3d3";
    this.show_icon = true;
    this.border_width = 10;
    this.border_color = "#d3d3d3";
    this.second_border_color = '#ffffff';
    this.is_full_width = false;
    this.aspect_ratio = 3.3;
    this.height = 350;
    this.width = 1155;
    this.idFooterStyle = 1;
    this.dashboard_height = 350;
  }
}

@Component({
  selector: 'app-organization-profile',
  templateUrl: './organization-profile.component.html',
  styleUrls: ['./organization-profile.component.scss']
})
export class OrganizationProfileComponent implements OnInit, AfterViewChecked {

  @ViewChild('inputLogo') private inputLogo;
  @ViewChild('article_form_profile') article_form_profile: ArticleFormComponent;
  @ViewChild('sub_articles_display') sub_articles_display: ProfileArticlesDisplayComponent;
  @ViewChild('galleries_display') galleries_display: ProfileGalleriesDisplayComponent;
  @ViewChild('donations_display') donations_display: ProfileItemsDisplayComponent;
  @ViewChild('groups_display') groups_display: ProfileGroupsDisplayComponent;
  @ViewChild('contact_display') contact_display: ProfileContactInboxDisplayComponent;
  @ViewChild('community_display') community_display: ProfileCommunityBoxesDisplayComponent;
  @ViewChild('playlist_display') playlist_display: ProfilePlaylistsDisplayComponent;
  @ViewChild('detail_custom_component') detail_custom_component: DetailCustomComponentComponent;
  @ViewChild('networks_profile') networks_profile: NetworksProfileFormComponent;
  @ViewChild('first_column') first_column: any;
  @ViewChild('news_column') news_column: any;
  @ViewChild('img_tag') img_tag: any;
  @ViewChild('col_img_banner_container') col_img_banner_container: any;
  @ViewChild('img_banner_container') img_banner_container: any;
  @ViewChild('rectangle_sizable') rectangle_sizable: ElementRef;
  @ViewChild('input_button') input_button: ElementRef;
  @ViewChildren(TextEditorComponent) editors: QueryList<TextEditorComponent>;
  @ViewChildren(ProfileArticlesDisplayComponent) articles_displays: QueryList<ProfileArticlesDisplayComponent>;
  @ViewChildren(ProfilePlaylistsDisplayComponent) playlist_display_components: QueryList<ProfilePlaylistsDisplayComponent>;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.screen_width = event.target.innerWidth;
    this.setIconSize(this.screen_width);
    setTimeout(() => {
      const rectangle_width = this.rectangle_sizable.nativeElement.clientWidth;
      const last_width = this.iglesia.header_menu_settings.width;
      const percent_between_rectangles = rectangle_width / last_width;
      this.iglesia.header_menu_settings.height = last_width * percent_between_rectangles / this.iglesia.header_menu_settings.aspect_ratio;
      this.iglesia.header_menu_settings.width = rectangle_width;
    }, 50);
  }

  currentUser: User;
  public selectedIglesia: any[] = [];
  public iglesia: any = {
    group_style_settings: {},
    events: [],
    groups: [],
    galleries_to_display: [],
    playlists_to_display: [],
    contact_inboxes_to_display: [],
    community_boxes_to_display: [],
    header_items: [],
    header_menu_settings: new HeaderMenuSettingModel(),
    display_other: true
  };
  iglesia_full_data: any;
  public iglesiaId: number
  public iglesiaOrig: any = {};
  public loadingIglesia = true
  public serverUrl: string = environment.serverURL;
  public tempPhoto: any = [];
  public tempPhotoService: any = [];
  public addingService: any = [false, false];
  public editMode: boolean = false;
  public quill: any;
  public is_production = false
  public actualPage = 1
  actual_page_obj = {
    actualPage: 1,
    id: ''
  }
  public pageIndexes = {
    'inicio': 1,
    'donaciones': 2,
    'contacto': 3,
    'nosotros': 4,
    'ministerios': 5,
    'galerias': 6,
    'events': 7,
  }
  public colorIndexes = {
    null: 'navbar-dark bg-dark',
    0: 'navbar-dark bg-dark',
    1: 'navbar-dark bg-primary',
    2: 'navbar-dark bg-secondary',
    3: 'navbar-dark bg-success',
    4: 'navbar-dark bg-info',
    5: 'navbar-light bg-warning',
    6: 'navbar-dark bg-danger',
    7: 'navbar-light bg-light',
    8: 'navbar-light bg-white',
  }
  public colorIndexesGen = {
    null: 'text-light bg-dark',
    0: 'text-light bg-dark',
    1: 'text-light bg-primary',
    2: 'text-light bg-secondary',
    3: 'text-light bg-success',
    4: 'text-light bg-info',
    5: 'text-dark bg-warning',
    6: 'text-light bg-danger',
    7: 'text-dark bg-light',
    8: 'text-dark bg-white',
  }
  public donationSafeUrl
  public contactSafeUrl
  public groupSafeUrl
  public inboxChanged = false
  public groupIndexes = {
    null: 'Ministerios',
    1: 'Ministerios',
    2: 'Grupos',
    3: 'Eventos',
    4: 'Equipos'
  }

  group_style_settings: StyleSettingModel = new StyleSettingModel();

  category_select_options: IDropdownSettings = {
    singleSelection: false,
    idField: 'idCategoriaArticulo',
    textField: 'nombre',
    allowSearchFilter: true,
    clearSearchFilter: true,
    closeDropDownOnSelection: true,
  }

  categories: CategoriaArticuloModel[] = [];
  categories_to_display: CategoriaArticuloModel[] = [];
  selected_categories: CategoriaArticuloModel[] = [];
  selected_category_on_main: CategoriaArticuloModel[] = [];
  selected_galleries: GalleryModel[] = [];
  galleries_to_display: GalleryModel[] = [];
  selected_donations: DonationFormModel[] = [];
  donations_to_display: DonationFormModel[] = [];
  selected_playlists: PlaylistModel[] = [];
  playlists_to_display: PlaylistModel[] = [];
  selected_contact_inboxes: MailingListModel[] = [];
  contact_inboxes_to_display: MailingListModel[] = [];
  selected_community_boxes: CommunityBoxModel[] = [];
  community_boxes_to_display: CommunityBoxModel[] = [];
  grid_template_form: FormGroup = this.formBuilder.group({
    button_border_radius: [0, [Validators.required, Validators.min(0)]],
    main_col_size: [12, [Validators.required, Validators.max(12)]],
    col_size: [4, [Validators.required, Validators.max(12)]],
    categories_to_display: ['[]', [Validators.required]],
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
    categories_to_display_form: this.formBuilder.array([]),
    galleries_to_display_form: this.formBuilder.array([]),
    playlists_to_display_form: this.formBuilder.array([]),
    community_boxes_to_display_form: this.formBuilder.array([]),
    contact_inboxes_to_display_form: this.formBuilder.array([]),
    donations_to_display_form: this.formBuilder.array([]),
    header_items: this.formBuilder.array([]),
    display_horizontal_on_main: [false],
    donation_language: ['es'],
    home_title_text_bold: ['bolder', [Validators.required]],
    home_title_text_color: ['#000000', [Validators.required]],
    home_title_text_align: ['left', [Validators.required]],
    apply_to_all: [false],
    idGroupViewMode: new FormControl(1),
    idGalleryViewMode: new FormControl(1)
  });

  banner_form: FormGroup = this.formBuilder.group({
    show_banner: new FormControl(false),
    width: new FormControl(100),
    width_value: new FormControl('%'),
    height: new FormControl(40),
    height_value: new FormControl('px'),
    border_radius: new FormControl(10),
    object_position_x: new FormControl('center'),
    object_position_y: new FormControl('center'),
    object_fit: new FormControl('cover'),
    cover: new FormControl(),
    img_file: new FormControl(),
    temp_src: new FormControl()
  });

  container: {
    width: number;
    height: number
  } = {
      width: 200,
      height: 130
    };

  actual_slug: string;

  header_modules: any[] = [];
  header_submodules: any[] = [];
  donation_forms: DonationFormModel[] = [];

  items: any[] = [];
  detail_item_properties: {
    id_key: string,
    name_key: string
  } = {
      id_key: '',
      name_key: ''
    }

  show_as_preview: boolean = false;
  width_size: number = 170;
  height_size: number = 56;
  screen_width: number = window.screen.width;

  containers: any[] = [];

  edit_object: {
    header_tab: boolean;
    event_at_home: boolean;
    categories_at_home: boolean;
    col_5_home: boolean;
    col_1_home: boolean;
    col_2_home: boolean;
    col_4_home: boolean;
    col_welcome_home: boolean;
    col_vision_home: boolean;
    col_mision_home: boolean;
    col_believe_home: boolean;
    col_history_home: boolean;
    home_info: boolean;
    home_banner: boolean;
  } = {
      header_tab: false,
      event_at_home: false,
      categories_at_home: false,
      col_5_home: false,
      col_1_home: false,
      col_2_home: false,
      col_4_home: false,
      col_welcome_home: false,
      col_vision_home: false,
      col_mision_home: false,
      col_believe_home: false,
      col_history_home: false,
      home_info: false,
      home_banner: false,
    };

  get categories_to_display_form() {
    return this.grid_template_form.get('categories_to_display_form') as FormArray;
  }
  get galleries_to_display_form() {
    return this.grid_template_form.get('galleries_to_display_form') as FormArray;
  }
  get donations_to_display_form() {
    return this.grid_template_form.get('donations_to_display_form') as FormArray;
  }
  get playlists_to_display_form() {
    return this.grid_template_form.get('playlists_to_display_form') as FormArray;
  }
  get community_boxes_to_display_form() {
    return this.grid_template_form.get('community_boxes_to_display_form') as FormArray;
  }
  get contact_inboxes_to_display_form() {
    return this.grid_template_form.get('contact_inboxes_to_display_form') as FormArray;
  }

  get header_items_form() {
    return this.grid_template_form.get('header_items') as FormArray;
  }

  get settings_form() {
    return this.actual_tab_control.get('settings') as FormGroup;
  }

  get settings_categories_form() {
    if (this.settings_form) {
      return this.settings_form.get('categories') as FormArray;
    } else {
      return new FormArray([]);
    }
  }

  get slides_array() {
    if (this.actual_tab_control) {
      if (this.actual_tab_control.get('slides')) {
        return this.actual_tab_control.get('slides') as FormArray;
      }
      return new FormArray([]);
    }
    return new FormArray([]);
  }

  get slides_array_banner() {
    if (this.actual_tab_control) {
      if (this.actual_tab_control.get('slides')) {
        if (this.actual_tab_control.value.idModule != 1) {
          if (this.actual_tab_control.value.slides.length === 0 || (this.actual_tab_control.value.slides.length === 1) && !this.actual_tab_control.value.slides[0].picture) {
            const index = this.iglesia.header_items.findIndex(x => x.idModule === 1);
            if (index >= 0) {
              return this.header_items_form.at(index).get('slides') as FormArray;
            }
          }
        }
        return this.actual_tab_control.get('slides') as FormArray;
      }
      return new FormArray([]);
    }
    return new FormArray([]);
  }

  get home_route() {
    let route: string;
    const item = this.iglesia.header_items.find(x => x.idModule === 1);
    let idOrganization = this.iglesiaId;
    if (!idOrganization) {
      if (this.currentUser) {
        idOrganization = this.currentUser.idIglesia;
      }
    }
    if (item) {
      route = `/organization-profile/main/${idOrganization}/${item.fixed_id}/${item.slug}/view`;
    } else {
      route = `/organization-profile/main/${idOrganization}/inicio`;
    }
    return [route];
  }

  get display_left_section() {
    if (this.iglesia) {
      return this.iglesia.display_left_section
        &&
        (this.iglesia.home_profile_sections.first_text_section.is_active
          || this.iglesia.home_profile_sections.organization_info.is_active
          || this.iglesia.home_profile_sections.networks.is_active
          || this.iglesia.home_profile_sections.second_text_section.is_active
          || this.can_edit
        )
    }
    return false;
  }

  get display_other() {
    if (this.iglesia) {
      if (this.iglesia.free_version) {
        // if (this.currentUser.isSuperUser) {
        //   return true;
        // }
        return false;
      } else {
        return this.iglesia.display_other
          && this.iglesia.home_profile_sections ? (
          this.iglesia.home_profile_sections.articles.is_active
          || (this.iglesia.home_profile_sections.events.is_active && this.iglesia.events.length > 0)
          || this.can_edit
        ) : true;
      }
    }
  }

  get pages_us_names() {
    let names = '';
    if (this.iglesia) {
      if (this.iglesia.header_items) {
        const us_tabs = this.iglesia.header_items.filter(x => x.idModule === 2);
        names = us_tabs.map(x => x.name).join(', ');
      }
    }
    return names;
  }

  get is_complete_full_width() {
    return this.iglesia.header_menu_settings.is_full_width && !this.iglesia.display_left_section;
  }

  settings_obj = {
    menu_option: 'view',
    submenu_option: 'view',
    title_size_unit: 'px',
    title_size_size: 16,
    text_size_unit: 'px',
    text_size_size: 14,
    cover_date_size_unit: 'px',
    cover_date_size_size: 12,
    cover_name_size_unit: 'px',
    cover_name_size_size: 80,
    cover_description_size_unit: 'px',
    cover_description_size_size: 12,
  }
  idArticle;
  mailing_list;
  langDB: any;

  uploadingLogo: boolean = false;
  public selectedArticle: ArticuloModel;
  selectedEvent: GroupEventModel;
  // filter_dates = {
  //   start_date: new Date().toISOString(),
  //   end_date: moment(new Date()).add(1, 'M').toDate().toISOString()
  // };

  show_categories: boolean = true;
  actual_article_display: ProfileArticlesDisplayComponent;
  is_loading: boolean = true;

  query_params: any;
  estatus_identificador: any;

  constructor(public api: ApiService,
    public route: ActivatedRoute,
    public modal: NgxSmartModalService,
    public formBuilder: FormBuilder,
    public sanitizer: DomSanitizer,
    public userService: UserService,
    public uploadService: FileUploadService,
    private router: Router,
    private translate: TranslateService,
    private organizationService: OrganizationService,
    private groupsService: GroupsService,
    private cdRef: ChangeDetectorRef,
    private app: AppComponent,
    private elRef: ElementRef,
    private gallery_service: GalleryService
  ) {
    this.currentUser = this.userService.getCurrentUser();
    router.events.subscribe((val) => {
      // this.is_loading = true;
      this.actualPage = this.pageIndexes[this.route.snapshot.params.page ? this.route.snapshot.params.page : 1];
      this.actual_page_obj.actualPage = this.actualPage;
      this.actual_page_obj.id = this.route.snapshot.params.page;

      if (this.iglesiaId != this.route.snapshot.params.idIglesia) {
        this.ngOnInit()
      }
      if (val instanceof NavigationEnd) {
        let page = this.route.snapshot.paramMap.get('page');
        // if (page === 'inicio') {
        //   // this.actualPage = 1;
        //   // this.actual_page_obj.actualPage = this.actualPage;
        //   // this.actual_page_obj.id = this.route.snapshot.params.page;
        //   if (this.iglesia.header_items.length > 0) {
        //     const item = this.iglesia.header_items[0];
        //     this.manageRedirection(item);
        //     this.ngOnInit();
        //   }
        // }
        const item = this.iglesia.header_items.find(x => x.idModule === this.actual_page_obj.actualPage && x.fixed_id === this.actual_page_obj.id);
        if (item) {

          if (item.idModule === 2
            || item.idModule === 1
            || item.idModule === 10
            || item.idModule === 4
            || item.idModule === 5
            || item.idModule === 6
            || item.idModule === 7
            || item.idModule === 8
            || item.idModule === 9
          ) {
            let subpage = this.route.snapshot.paramMap.get('subpage');
            const slug = this.route.snapshot.paramMap.get('slug');
            if (subpage === 'article') {
              this.idArticle = Number(slug);
              this.mailing_list = undefined;
            } else if (subpage === 'contact') {
              this.mailing_list = {
                id: Number(slug),
                idCategoryArticle: this.route.snapshot.queryParams.idCategoryArticle
              }

              this.idArticle = undefined;
            } else {
              this.idArticle = undefined;
              this.mailing_list = undefined;
              const id = Number(slug);
              if (item.idModule === 2) {
                this.setSelectedCategories();

                const category = this.settings_form.value.categories.find(x => x.idCategoryArticle === id);

                if (category) {
                  this.settings_form.get('grid_info').get('col_size').setValue(category.col_size);
                  if (this.sub_articles_display) {
                    category.idCategoriaArticulo = category.idCategoryArticle;
                    this.sub_articles_display.selected_category = category;
                  }
                }
              } else if (item.idModule === 4) {
                this.setDonations();
                const donation_form = this.settings_form.value.categories.find(x => x.idDonationForm === id);
                if (donation_form) {
                  if (this.donations_display) {
                    donation_form.id = donation_form.idDonationForm;
                    this.donations_display.selected_item = donation_form;
                    this.donations_display.setItem(donation_form);
                  }
                }
              } else if (item.idModule === 5) {
                const group_type = this.settings_form.value.categories.find(x => x.id === id);
                if (group_type) {
                  if (this.groups_display) {
                    this.groups_display.selected_group_type = group_type;
                    this.groups_display.setGroupType(group_type);
                  }
                }
              } else if (item.idModule === 6) {

                this.setGalleries();
                const gallery = this.settings_form.value.categories.find(x => x.id === id);

                if (gallery) {
                  if (this.galleries_display) {
                    // gallery.id = gallery.idGallery;
                    this.galleries_display.selected_gallery = gallery;
                    this.galleries_display.setGallery(gallery);
                  }
                }
              } else if (item.idModule === 7) {
                this.setContactInboxes();
                const contact: MailingListModel = this.settings_form.value.categories.find(x => x.idMailingList === id);

                if (contact) {
                  if (this.contact_display) {

                    contact.id = contact.idMailingList;
                    this.contact_display.selected_contact_inbox = contact;
                    this.contact_display.setContactInbox(contact);
                  }
                }
              } else if (item.idModule === 8) {
                this.setCommunity_boxes();
                const community: CommunityBoxModel = this.settings_form.value.categories.find(x => x.idCommunityBox === id);

                if (community) {
                  if (this.community_display) {

                    community.id = community.idCommunityBox;
                    this.community_display.selected_community_box = community;
                    this.community_display.setCommunityBox(community);
                  }
                }
              } else if (item.idModule === 9) {
                this.setPlaylists();
                const playlist: PlaylistModel = this.settings_form.value.categories.find(x => x.idPlaylist === id);

                if (playlist) {
                  if (this.playlist_display) {

                    playlist.idPlaylist = playlist.idPlaylist;
                    this.playlist_display.selected_playlist = playlist;
                    this.playlist_display.setPlaylist(playlist);
                  }
                }
              }
            }

          } else if (item.idModule === 11) {
            if (this.detail_custom_component) {
              this.setSubmoduleInfo();
              this.detail_custom_component.idSubmodule = item.idSubmodule;
              this.detail_custom_component.item_id = item.item_id;
              this.detail_custom_component.ngOnInit();
            }
          } else {
            this.mailing_list = undefined;
            this.idArticle = undefined;
          }
        }
        this.actual_slug = this.route.snapshot.paramMap.get('slug');
        setTimeout(() => {
          this.fixFrameStyle();
        }, 250);
      }
      // this.is_loading = false;
    });

    // this.grid_template_form.get('idGroupViewMode').valueChanges.subscribe(value => {
    //   const idGroupViewMode = this.grid_template_form.value.idGroupViewMode;
    //   if (this.settings_categories_form.length > 0) {
    //     const first_value = this.settings_categories_form.at(0).value;
    //     if (first_value.idGroup || first_value.idGroupCategory) {
    //       if (confirm('Are you sure you want to change the view mode? This will delete your previous info.')) {
    //         while (this.settings_categories_form.length > 0) {
    //           this.settings_categories_form.removeAt(0);
    //         }
    //         this.addGroupType();
    //       } else {
    //         this.grid_template_form.get('idGroupViewMode').setValue(idGroupViewMode, { emitEvent: false });
    //       }
    //     }
    //   }
    // })
  }
  public modules: any = {
    toolbar: {
      container: [
        [{ font: [] }],
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike"],
        [{ header: 1 }, { header: 2 }],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image"],
      ],
    },
    imageResize: true,
  };
  onEditorCreated(quill) {
    var toolbar = quill.getModule("toolbar");
    toolbar.addHandler("image", this.imageHandler);
    this.quill = quill;
  }
  imageHandler(value) {
    const inputFile: any = document.getElementById("fileUpload");
    inputFile.click();
  }
  getEvents() {
    return new Promise((resolve, reject) => {
      this.api
        .post(`groups/getGroupsEventsByIdIglesia`, {
          idIglesia: this.iglesiaId ? this.iglesiaId : this.currentUser.idIglesia,
          publish_status: 'publish',
        })
        .subscribe(
          (data: any) => {
            data.events.map(function (event) {
              event.order = moment(event.event_date || event.start_date)
                .toDate()
                .getTime();
            });

            this.iglesia.main_events = data.events
              .filter(function (event) {
                const time = moment(event.order);
                const today = moment();
                return time > today;
              })
              .sort(function (a, b) {
                return a.order - b.order;
              });
            this.iglesiaOrig = Object.assign({}, this.iglesia)
            return resolve({})
          },
          (err: any) => {
            this.iglesia.main_events = [];
            return resolve({})
          },
          () => {
            return resolve({})
            //this.loadingIglesia = false
          }
        );

    })
  }
  getGroups() {
    return new Promise((resolve, reject) => {
      const id = this.iglesiaId ? this.iglesiaId : this.currentUser.idIglesia
      this.api
        .get(`groups/getGroups?idIglesia=${id}&type=public`)
        .subscribe(
          (data: any) => {
            this.iglesia.groups = data.groups
            this.iglesiaOrig = Object.assign({}, this.iglesia)
            this.setSubmoduleInfo();
            return resolve({});
          },
          (err: any) => {
            return resolve({});
          },
          () => {
            return resolve({});
          }
        );
    })
  }

  async getGroupCategories() {
    const id = this.iglesiaId ? this.iglesiaId : this.currentUser.idIglesia
    for (let index = 0; index < this.group_types.length; index++) {
      const gt = this.group_types[index];
      const response_categories: any = await this.api.get(`groups/categories/filter?idIglesia=${id}&group_type=${gt.idGroupType}`).toPromise();
      gt.categories = response_categories.categories;
    }
    return new Promise((resolve, reject) => {
      this.api
        .get(`groups/getGroupsCategories?idIglesia=${id}`)
        .subscribe(
          (data: any) => {
            this.group_categories = data.categories;

            if (this.actualPage == 5) {
              for (let index = 0; index < this.settings_categories_form.length; index++) {
                const element = this.settings_categories_form.at(index);
                const group_type = this.group_categories.find(x => x.idGroupCategory === element.value.idGroupCategory);
                if (group_type) {
                  element.get('name').setValue(group_type.name);
                }
              }
            }

            return resolve({});
          },
          (err: any) => {
            return resolve({});
          },
          () => {
            return resolve({});
          }
        );
    })
  }

  async getGalleryAlbums() {
    const id = this.iglesiaId ? this.iglesiaId : this.currentUser.idIglesia
    return new Promise((resolve, reject) => {
      const params = {
        idOrganization: id
      }
      this.gallery_service.getAlbums(params)
        .subscribe(
          (data: any) => {
            this.gallery_albums = data;

            if (this.actualPage == 6) {
              for (let index = 0; index < this.settings_categories_form.length; index++) {
                const element = this.settings_categories_form.at(index);
                const group_type = this.gallery_albums.find(x => x.id === element.value.idGalleryAlbum);
                if (group_type) {
                  element.get('name').setValue(group_type.name);
                }
              }
            }

            return resolve({});
          },
          (err: any) => {
            return resolve({});
          },
          () => {
            return resolve({});
          }
        );
    })
  }

  ngOnInit() {
    // var img = new Image();

    // img.onload = function () {
    //   var height = img.height;
    //   var width = img.width;
    //   console.log(height);
    //   console.log(width);

    //   // code here to use the dimensions
    // }

    // img.src = 'https://iglesia-tech-api.e2api.com/img/iglesiaTech/IglesiaTech_2098/designRequest/wRZDutkoDHTA8Ipi_2pt3ws4lgyw.jpg';

    this.query_params = this.route.snapshot.queryParams;
    const screen_width = window.innerWidth;
    this.setIconSize(screen_width);
    this.iglesiaId = this.route.snapshot.params.idIglesia
    let url = `https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/donations/organization/${this.route.snapshot.params.idIglesia}?lang=${this.grid_template_form.value.donation_language}`
    const style = this.grid_template_form.value
    if (style) {
      if (style.home_title_text_align) {
        url = `${url}&align=${style.home_title_text_align}`;
      }
      if (style.home_title_text_bold) {
        url = `${url}&weight=${style.home_title_text_bold}`;
      }
      if (style.home_title_text_color) {
        url = `${url}&color=${style.home_title_text_color.replace('#', '')}`;
      }
    }
    this.donationSafeUrl = this.safe(url);
    if (String(window.location.href).startsWith('https://iglesiatech.app')) {
      this.is_production = true
    }
    this.getIglesia(158)
    // setTimeout(() => {
    //   this.filter_dates = {
    //     start_date: moment(new Date()).startOf('M').format('YYYY-MM-DD'),
    //     end_date: moment(new Date()).add(1, 'M').endOf('M').format('YYYY-MM-DD')
    //   };
    // });
    this.setPreview();
  }

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  getArticleCategories(idIglesia: number) {
    return new Promise((resolve, reject) => {
      this.api.get(
        `articulos/getCategoriasArticulosByIdIglesia`,
        {
          idIglesia
        }
      ).subscribe((data: any) => {
        this.categories = data.categorias;
        this.translateCategories();

        if (this.settings_form && this.settings_categories_form) {
          this.setSelectedCategories();
          // if (this.iglesia.grid_info_settings.categories_to_display) {
          //   this.selected_categories = this.categories.filter(x => this.iglesia.grid_info_settings.categories_to_display.includes(x.idCategoriaArticulo));
          // }
        }

        this.selected_category_on_main = this.get_selected_category_on_main();
        // this.categories_to_display = this.get_categories_to_display();
        this.setSubmoduleInfo();
        return resolve({});
      }, err => {
        console.error(err);
        this.translateCategories();
        return resolve({});
      });
    })
  }

  getLangs() {
    this.api
      .get(`public/langs`)
      .subscribe((response) => {
        this.langDB = response;
      }, (error) => {
        console.error(error);
      });
  }

  setSelectedCategories() {
    const categories_on_control = this.settings_form.value.categories;
    const categories_to_display = categories_on_control.map(category => category.idCategoryArticle).filter(x => !!x);
    this.selected_categories = this.categories.filter(x => categories_to_display.includes(x.idCategoriaArticulo));

    this.categories_to_display = this.get_categories_to_display();

    const slug = this.route.snapshot.paramMap.get('slug');
    const id = Number(slug);
    const category = this.settings_form.value.categories.find(x => x.idCategoryArticle === id);
    if (category) {
      this.settings_form.get('grid_info').get('col_size').setValue(category.col_size);
    }
  }

  translateCategories() {
    const array = [];
    this.categories.forEach(item => {
      array.push(item.nombre);
    });
    this.translate.get(array).subscribe(response => {
      const keys = Object.keys(response);
      keys.forEach(key => {
        this.categories.find(x => x.nombre === key).nombre = response[key];
      });
    }, error => {
    });
  }



  changeContactUrl() {
    this.contactSafeUrl = this.safe('https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/contact_inbox/' +
      this.iglesia.inboxId + '?lang=es')
    this.editMode = true
  }
  changeGroupUrl() {
    this.groupSafeUrl = this.safe('https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/groups/organization/' +
      this.route.snapshot.params.idIglesia + '?lang=es&group_type_id=' + this.iglesia.group_type)
    this.editMode = true
  }
  toggleEditMode() {
    this.editMode = !this.editMode;
    this.iglesia = Object.assign({}, this.iglesiaOrig)
    this.grid_template_form.patchValue(this.iglesia.grid_info_settings, { emitEvent: false });
    this.grid_template_form.get('main_col_size').markAsPristine();
    this.grid_template_form.get('donation_language').markAsPristine();
    this.tempPhoto = undefined;
    this.setCategories();
    this.setDonations();
    this.setGalleries();
    this.setPlaylists();
    this.setCommunity_boxes();
    this.setContactInboxes();
    this.setHeaderItems();
    this.setSubmoduleInfo();
    setTimeout(() => {
      this.fixFrameStyle();
    });
  }

  setCategories() {
    this.selected_category_on_main = this.get_selected_category_on_main();
    this.categories_to_display = this.get_categories_to_display();
    this.iglesia.full_address = this.formatFullAddress(this.iglesia);
    this.cleanCategoriesMain();

    this.iglesia.categories_to_display.forEach(element => {
      const group = this.formBuilder.group({
        idCategoryArticle: element.idCategoryArticle,
        id: element.id,
        sort_by: element.sort_by,
        col_size: element.col_size,
        articles_count: element.articles_count,
        view_as: element.view_as || 'load_more',
        rows: 0,
        display_view_as: true
      });
      this.setViewType(group);
      this.categories_to_display_form.push(group);
    });
    if (this.can_edit) {
      if (this.iglesia.categories_to_display.length === 0) {
        this.addCategoryToMain();
      }
    }
  }

  setDonations() {
    if (this.settings_form) {
      const categories_on_control = this.settings_form.value.categories;
      if (!categories_on_control) {
        return;
      }
      const categories_to_display = categories_on_control.map(category => category.idDonationForm).filter(x => !!x);
      this.selected_donations = this.donation_forms.filter(x => categories_to_display.includes(x.id));

      this.donations_to_display = this.get_selected_donations();

      this.selected_donations = this.get_selected_donations();
      this.cleanDonations();
      if (this.can_edit) {
        if (this.settings_categories_form.length === 0) {
          this.addNewItem('id', 'idDonationForm', this.settings_categories_form);
        }
      }
    }
  }

  setGalleries() {
    if (this.settings_form) {
      const categories_on_control = this.settings_form.value.categories;
      if (!categories_on_control) {
        return;
      }
      const categories_to_display = categories_on_control.map(category => category.idGallery).filter(x => !!x);
      this.selected_galleries = this.iglesia.galleries.filter(x => categories_to_display.includes(x.id));

      this.galleries_to_display = this.get_selected_galleries();

      this.selected_galleries = this.get_selected_galleries();
      this.cleanGalleries();
      if (this.can_edit) {
        if (this.settings_categories_form.length === 0) {
          this.addGallery();
        }
      }
    }
  }
  setPlaylists() {
    if (this.settings_form) {
      const categories_on_control = this.settings_form.value.categories;
      if (!categories_on_control) {
        return;
      }

      const categories_to_display = categories_on_control.map(category => category.idPlaylist).filter(x => !!x);
      this.selected_playlists = this.iglesia.playlists.filter(x => categories_to_display.includes(x.idPlaylist));
      this.playlists_to_display = this.get_selected_playlists();
      this.cleanPlaylists();

      // this.iglesia.playlists_to_display.forEach(element => {
      //   const group = this.formBuilder.group({
      //     idPlaylist: element.idPlaylist,
      //     idProfileTab: element.idProfileTab,
      //     id: element.id,
      //     sort_by: element.sort_by,
      //     font_size: new FormControl(element.font_size),
      //     font_style: new FormControl(element.font_style),
      //     font_weight: new FormControl(element.font_weight),
      //     font_color: new FormControl(element.font_color),
      //     background_color: new FormControl(element.background_color),
      //     active_background_color: new FormControl(element.active_background_color),
      //     hover_background_color: new FormControl(element.hover_background_color),
      //     text_align: new FormControl(element.text_align),
      //     is_hover: new FormControl(false),
      //     is_active: new FormControl(false),
      //     id_key: new FormControl('id'),
      //     table_id_key: new FormControl('idPlaylist')
      //   });
      //   this.playlists_to_display_form.push(group);
      // });
      if (this.can_edit) {
        if (this.settings_categories_form.length === 0) {
          this.addPlaylist();
        }
      }
    }
  }
  setCommunity_boxes() {
    if (this.settings_form) {
      const categories_on_control = this.settings_form.value.categories;
      if (!categories_on_control) {
        return;
      }
      const categories_to_display = categories_on_control.map(category => category.idCommunityBox).filter(x => !!x);
      this.selected_community_boxes = this.iglesia.community_boxes.filter(x => categories_to_display.includes(x.id));

      this.community_boxes_to_display = this.get_selected_community_boxes();
      // this.cleanCommunity_boxes();

      // this.iglesia.community_boxes_to_display.forEach(element => {
      //   const group = this.formBuilder.group({
      //     idCommunityBox: element.idCommunityBox,
      //     id: element.id,
      //     sort_by: element.sort_by,
      //     display_new_style: element.display_new_style,
      //     font_size: new FormControl(element.font_size),
      //     font_style: new FormControl(element.font_style),
      //     font_weight: new FormControl(element.font_weight),
      //     font_color: new FormControl(element.font_color),
      //     background_color: new FormControl(element.background_color),
      //     active_background_color: new FormControl(element.active_background_color),
      //     hover_background_color: new FormControl(element.hover_background_color),
      //     text_align: new FormControl(element.text_align),
      //     is_hover: new FormControl(false),
      //     is_active: new FormControl(false),
      //     id_key: new FormControl('id'),
      //     table_id_key: new FormControl('idCommunityBox')
      //   });
      //   this.community_boxes_to_display_form.push(group);
      // });
      if (this.can_edit) {
        if (this.settings_categories_form.length === 0) {
          this.addCommunityBox();
        }
      }
    }
  }
  setContactInboxes() {
    if (this.settings_form) {
      const categories_on_control = this.settings_form.value.categories;
      if (!categories_on_control) {
        return;
      }
      const categories_to_display = categories_on_control.map(category => category.idMailingList).filter(x => !!x);

      this.selected_contact_inboxes = this.iglesia.inboxes.filter(x => categories_to_display.includes(x.id));
      this.contact_inboxes_to_display = this.get_selected_contact_inboxes();
      this.cleanContactInboxes();

      // this.iglesia.contact_inboxes_to_display.forEach(element => {
      //   const group = this.formBuilder.group({
      //     idMailingList: element.idMailingList,
      //     idProfileTab: element.idProfileTab,
      //     id: element.id,
      //     sort_by: element.sort_by,
      //     contact_language: element.contact_language,
      //     font_size: new FormControl(element.font_size),
      //     font_style: new FormControl(element.font_style),
      //     font_weight: new FormControl(element.font_weight),
      //     font_color: new FormControl(element.font_color),
      //     background_color: new FormControl(element.background_color),
      //     active_background_color: new FormControl(element.active_background_color),
      //     hover_background_color: new FormControl(element.hover_background_color),
      //     text_align: new FormControl(element.text_align),
      //     is_hover: new FormControl(false),
      //     is_active: new FormControl(false),
      //     id_key: new FormControl('id'),
      //     table_id_key: new FormControl('idMailingList')
      //   });
      //   this.contact_inboxes_to_display_form.push(group);
      // });
      // if (this.can_edit) {
      // }
      if (this.settings_categories_form.length === 0) {
        this.addContactInbox();
      }
    }
  }

  safe(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  reload() {
    window.location.reload()
  }
  checkFields() {
    /*if ((this.iglesia.mision).toString().length!=0 && (this.iglesia.vision).toString().length!=0
      && (this.iglesia.bienvenida).toString().length!=0 && (this.iglesia.ZIP.toString()).length==5
      && (this.iglesia.historia).toString().length!=0 && (this.iglesia.que_creemos).toString().length!=0 &&
      this.ValidateEmail(this.iglesia.email) && this.isValidHttpUrl(this.iglesia.google)
      && this.isValidHttpUrl(this.iglesia.website)&& this.isValidHttpUrl(this.iglesia.facebook)
      && this.isValidHttpUrl(this.iglesia.twitter) && this.isValidHttpUrl(this.iglesia.instagram)
      && this.isValidHttpUrl(this.iglesia.whatsapp) && this.isValidHttpUrl(this.iglesia.youtube)) {
      return true
    } else {
      return false
    }*/
    return true
  }

  checkIf(field) {
    if (!this.can_edit && !field) {
      return false
    }
    if (!this.can_edit && field) {
      return true
    }
    if (this.can_edit) {
      return true
    }
  }
  checkRedes() {
    if (this.iglesia.android_url || this.iglesia.ios_url || this.iglesia.facebook || this.iglesia.google || this.iglesia.email
      || this.iglesia.instagram || this.iglesia.youtube || this.iglesia.twitter || this.iglesia.whatsapp || this.iglesia.website) {
      return true
    } else {
      return false
    }
  }
  checkDireccion() {
    if (this.iglesia.Calle || this.iglesia.Ciudad || this.iglesia.Provincia || this.iglesia.ZIP || this.iglesia.telefono) {
      return true
    } else {
      return false
    }
  }
  copyMessage(val: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.iglesiaOrig.email;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.api.showToast('Email copied', ToastType.success)
  }
  ValidateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
      return (true)
    }
    return (false)
  }

  get photoUrl() {
    if (this.iglesia.Logo && this.iglesia.Logo !== 'null') {
      return `${this.serverUrl}${this.iglesia.Logo}`;
    }
    return '/assets/img/img_avatar.png';
  }

  get lang() {
    if (this.langDB) {
      return this.langDB.find((l) => l.lang == 'es');
    }
    return {
      keys: {},
    };

  }

  get page_title() {
    if (this.group_types) {
      if (this.actual_style_settings) {
        const group_type_name = this.group_types.find(
          (x) => x.idGroupType === Number(this.actual_style_settings.value.idGroupType)
        );
        if (group_type_name) {
          return this.lang.keys[group_type_name.name]
        }
        return this.lang.keys["groups"];
      }
      return this.lang.keys["groups"];
    } else {
      return this.lang.keys["groups"];
    }
  }

  capitalizeFirstLetter(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  parseDate(date, options = null) {
    const data = moment(date, options);
    return data.utc();
  }
  fixUrl(image: string) {
    if (image) {
      if (image.includes('https://')) {
        return `${image}`;
      }
      return `${this.api.baseUrl}${image}`;
    }
    if (this.iglesia_full_data) {
      if (this.iglesia_full_data.portadaArticulos) {
        const path = this.fixUrl(this.iglesia_full_data.portadaArticulos);
        return path;
      }
    }
    return ``;
    // return 'assets/img/default-image.jpg';
  }

  async getIglesia(i?) {
    this.is_loading = true;

    const is_locked_or_maintenance = await this.api.post('checkIdentificadorStatusById', { idIglesia: this.iglesiaId }).toPromise();

    if (is_locked_or_maintenance) {
      const app_config: any = is_locked_or_maintenance['app_configuration'];
      if (app_config.statuses.length !== 0) {
        for (let i = 0; i < app_config.statuses.length; i++) {
          const estatus_identificador = app_config.statuses[i];
          if (estatus_identificador.isPersistent) {
            if (estatus_identificador.value) {
              this.is_loading = false;
              this.estatus_identificador = estatus_identificador;
              if (this.currentUser && this.currentUser.isSuperUser) {
                setTimeout(() => {
                  this.app.hide_toolbars = false;
                });
              }
              return;
            }
          }
        }
      }
    }

    this.api
      .get(`iglesias/getIglesiaProfileDetail`, { idIglesia: this.iglesiaId ? this.iglesiaId : this.currentUser.idIglesia })
      .subscribe((data: any) => {
        this.api
          .get(`iglesias/getModules`)
          .subscribe((response: any) => {
            this.header_modules = response.modules;
            this.header_submodules = response.submodules;
          });
        const idIglesia = this.iglesiaId ? this.iglesiaId : this.currentUser.idIglesia
        this.api
          .get(`donations_v2/forms`, { idIglesia: this.iglesiaId ? this.iglesiaId : this.currentUser.idIglesia })
          .subscribe((response: any) => {
            this.donation_forms = response;
            this.setDonations();
          });
        // this.api
        //   .get(`iglesias/forms`, { idIglesia: this.iglesiaId ? this.iglesiaId : this.currentUser.idIglesia })
        //   .subscribe((response: any) => {
        //     this.donation_forms = response;
        //     this.setDonations();
        //   });
        this.checkStripeInfo();
        this.iglesia = data.iglesia;
        this.setRouterLink();
        this.iglesia.containers = [];
        this.getArticleCategories(idIglesia);
        if (JSON.stringify(this.iglesia.banner_settings) === '{}') {
          this.iglesia.banner_settings = this.banner_form.value;
        }
        this.banner_form.patchValue(this.iglesia.banner_settings);
        const fixed_id = `my`;
        if (this.iglesia.free_version) {
          this.iglesia.header_items = this.iglesia.header_items.filter(x => x.idModule === 1);
        }
        this.iglesia.header_items.push({
          can_be_deleted: false,
          can_be_hide: true,
          external_url: "",
          has_sub_menu: false,
          idModule: `account`,
          is_visible: true,
          name: this.currentUser ? 'My profile' : 'Login',
          open_as_external: false,
          parent_tab: null,
          sort_by: this.iglesia.header_items.length + 1,
          slug: 'profile',
          id: fixed_id,
          fixed_id,
          profile_tab_settings: {}
        });
        const page = this.route.snapshot.paramMap.get('page');

        if (page && (page === 'us' || page === 'home' || page.endsWith('_2') || page.endsWith('_1'))) {
          const subpage = this.route.snapshot.paramMap.get('subpage');
          if (subpage === 'article') {
            const slug = this.route.snapshot.paramMap.get('slug');
            this.idArticle = Number(slug);
          } else if (subpage === 'contact') {

            const slug = this.route.snapshot.paramMap.get('slug');
            this.mailing_list = {
              id: Number(slug),
              idCategoryArticle: this.route.snapshot.queryParams.idCategoryArticle
            };
          }
        }
        const items = this.iglesia.header_items.map(x => {
          x.fixed_id = `${x.id}_${x.idModule}`;
          return { [x.fixed_id]: x.idModule }
        });

        const header_obj: any = {};
        items.forEach(x => {
          Object.keys(x).forEach(key => {
            header_obj[key] = x[key];
          })
          // header_obj[x]
        })

        setTimeout(() => {
          // const class_name = document.getElementsByClassName('header-item-menu');
          const class_name = document.getElementsByClassName('header-nav-menu');
          let height;
          for (let index = 0; index < class_name.length; index++) {
            const element = class_name[index];
            if (!height) {
              height = element.clientHeight;
            }
            if (height > element.clientHeight) {
              height = element.clientHeight;
            }
          }
          this.height_size = height;
        }, 100);
        this.pageIndexes = header_obj;
        this.actualPage = this.pageIndexes[this.route.snapshot.params.page ? this.route.snapshot.params.page : 1]
        this.actual_page_obj.actualPage = this.actualPage;
        this.actual_page_obj.id = this.route.snapshot.params.page;
        this.getGroupCategories()
        this.getGalleryAlbums()
        this.setHeaderItems();
        this.setSubmoduleInfo();
        this.selected_category_on_main = this.get_selected_category_on_main();
        this.selected_donations = this.get_selected_donations();
        this.selected_galleries = this.get_selected_galleries();
        this.selected_playlists = this.get_selected_playlists();
        this.selected_contact_inboxes = this.get_selected_contact_inboxes();
        this.selected_community_boxes = this.get_selected_community_boxes();
        this.categories_to_display = this.get_categories_to_display();
        this.iglesia.full_address = this.formatFullAddress(this.iglesia);
        this.setCategories();
        this.setDonations();
        this.setGalleries();
        this.setPlaylists();
        this.setCommunity_boxes();
        this.setContactInboxes();

        if (this.iglesia.inboxId) {
          this.contactSafeUrl = this.safe('https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/contact_inbox/' +
            this.iglesia.inboxId + '?lang=es')
        }
        const group_style = this.iglesia.group_style_settings;
        if (JSON.stringify(group_style) === '{}') {
          this.iglesia.group_style_settings = new StyleSettingModel();
        }
        const header_settings = this.iglesia.header_menu_settings;

        if (JSON.stringify(header_settings) === '{}') {
          this.iglesia.header_menu_settings = new HeaderMenuSettingModel();
        }
        setTimeout(() => {
          if (this.rectangle_sizable) {
            const rectangle_width = this.rectangle_sizable.nativeElement.clientWidth;

            const last_width = this.iglesia.header_menu_settings.width;
            const percent_between_rectangles = rectangle_width / last_width;
            this.iglesia.header_menu_settings.height = last_width * percent_between_rectangles / this.iglesia.header_menu_settings.aspect_ratio;
            this.iglesia.header_menu_settings.width = rectangle_width;
          }
          const displays = this.articles_displays.filter(x => x.need_refresh)
          displays.forEach(x => {
            const new_category = x.categories_tab.find(cat => cat.idCategoryArticle === x.selected_category.idCategoriaArticulo)
            if (new_category.sort_type != x.selected_category.sort_type) {
              x.selected_category.sort_type = new_category.sort_type;
            }
            x.need_refresh = false;
            x.refreshArticles(x.selected_category);
          });
          const playlist_display_components = this.playlist_display_components.filter(x => x.need_refresh);
          console.log(playlist_display_components);
          playlist_display_components.forEach(x => {
            const new_category = x.playlists_tab.find(cat => cat.idPlaylist === x.selected_playlist.idPlaylist)
            if (new_category.sort_type != x.selected_playlist.sort_type) {
              x.selected_playlist.sort_type = new_category.sort_type;
            }
            x.need_refresh = false;
            x.setPlaylist(x.selected_playlist);
          });
        }, 100);
        if (this.iglesia.col7_grid) {
          const size = Number(this.iglesia.col7_grid);
          this.iglesia.group_style_settings.items_per_row = 12 / size;
          this.iglesia.group_style_settings.col_size = `col-sm-${size}`;
        }
        this.groupSafeUrl = this.safe('https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/groups/organization/' +
          this.route.snapshot.params.idIglesia + '?lang=es&group_type_id=' + this.iglesia.group_type)
        this.iglesiaOrig = Object.assign({}, data.iglesia)
        // Set selected Iglesia dropdown
        this.selectedIglesia = [
          {
            idIglesia: data.iglesia.idIglesia,
            Nombre: data.iglesia.Nombre
          }
        ];

        this.grid_template_form.patchValue(this.iglesia.grid_info_settings, { emitEvent: false });
        this.grid_template_form.get('main_col_size').markAsPristine();
        this.grid_template_form.get('donation_language').markAsPristine();
        let url = `https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/donations/organization/${this.route.snapshot.params.idIglesia}?lang=${this.grid_template_form.value.donation_language}`
        const style = this.grid_template_form.value
        if (style) {
          if (style.home_title_text_align) {
            url = `${url}&align=${style.home_title_text_align}`;
          }
          if (style.home_title_text_bold) {
            url = `${url}&weight=${style.home_title_text_bold}`;
          }
          if (style.home_title_text_color) {
            url = `${url}&color=${style.home_title_text_color.replace('#', '')}`;
          }
        }
        this.donationSafeUrl = this.safe(url);
        this.getEvents()
        this.getEventsForCalendar()
        this.getGroups()
        if (page === 'inicio') {
          // this.actualPage = 1;
          // this.actual_page_obj.actualPage = this.actualPage;
          // this.actual_page_obj.id = this.route.snapshot.params.page;
          if (this.iglesia.header_items.length > 0) {
            this.manageRedirection(this.iglesia.header_items[0]);
          }
        }
      },
        (err: any) => {
          this.is_loading = false;
        },
        () => {
          this.loadingIglesia = false
          this.is_loading = false;
        }
      );
  }
  setRouterLink() {
    // throw new Error('Method not implemented.');
    // src-custom-button-as-internal
    // this.elRef.nativeElement.qu
    setTimeout(() => {
      const buttons = this.elRef.nativeElement.querySelectorAll('.src-custom-button-as-internal');
      console.log(buttons);
    }, 500);
  }

  checkStripeInfo() {
    return new Promise((resolve, reject) => {
      this.api.get('iglesias/getIglesiasProvidedTokens', { idIglesia: this.iglesiaId ? this.iglesiaId : this.currentUser.idIglesia })
        .subscribe((data: any) => {
          const keys_info = data.iglesia;
          this.iglesia.stripe_info = {
            hasPublicKey: keys_info.hasPublicKey,
            hasSecretKey: keys_info.hasSecretKey
          }
          return resolve({});
        },
          (err) => {
            console.error(err);
            return resolve({});
          }
        );
    })
  }

  setSubmoduleInfo() {
    if (this.actual_tab_control) {
      const actual_tab_value = this.actual_tab_control.value;
      const idModule = Number(actual_tab_value.idModule);
      if (idModule === 11) {
        const idSubmodule = Number(actual_tab_value.idSubmodule);
        this.resetItemID({ target: { value: idSubmodule } });
        this.actual_tab_control.get('item_id').setValue(actual_tab_value.item_id);
      }
    }
  }
  setHeaderItems() {
    return new Promise((resolve, reject) => {
      while (this.header_items_form.length > 0) {
        this.header_items_form.removeAt(0);
      }
      if (this.iglesia.free_version) {
        const home_tab = this.iglesia.header_items.find(x => x.idModule === 1);
        const home_group = this.formBuilder.group({
          id: home_tab.id,
          idModule: new FormControl(home_tab.idModule, [Validators.required]),
          name: new FormControl(home_tab.name, [Validators.required]),
          is_visible: new FormControl({ value: home_tab.is_visible, disabled: !home_tab.can_be_hide }),
          open_as_external: home_tab.open_as_external,
          has_sub_menu: home_tab.has_sub_menu,
          parent_tab: home_tab.parent_tab,
          can_be_deleted: home_tab.can_be_deleted,
          sort_by: home_tab.sort_by,
          can_be_hide: home_tab.can_be_hide,
          external_url: home_tab.external_url,
          item_id: home_tab.item_id,
          idSubmodule: home_tab.idSubmodule,
          is_new_tab: home_tab.fixed_id.includes('_-1'),
          fixed_id: home_tab.fixed_id,
        });
        const profile_tab = this.iglesia.header_items.find(x => x.idModule == 'account');

        const slides_array = new FormArray([]);
        if (!home_tab.slides) {
          home_tab.slides = [];
        }
        if (home_tab.slides) {
          if (home_tab.slides.length === 0) {
            const slide_control = this.formBuilder.group({
              idProfileTab: home_tab.id,
              picture: undefined,
              original_picture: undefined,
              cover: new FormControl(),
              img_file: new FormControl(),
              temp_src: new FormControl(),
              sort_by: 1
            });
            slides_array.push(slide_control);
          } else {
            home_tab.slides.forEach(slide => {
              const slide_control = this.formBuilder.group({
                id: slide.id,
                idProfileTab: home_tab.id,
                picture: slide.picture,
                original_picture: slide.picture,
                cover: new FormControl(),
                img_file: new FormControl(),
                temp_src: new FormControl(),
                sort_by: slide.sort_by
              });
              slides_array.push(slide_control);
            })
          }
        }
        home_group.addControl('slides', slides_array);
        this.header_items_form.push(home_group);
        const profile_group = this.formBuilder.group({
          id: profile_tab.id,
          idModule: new FormControl(profile_tab.idModule, [Validators.required]),
          name: new FormControl(profile_tab.name, [Validators.required]),
          is_visible: new FormControl({ value: profile_tab.is_visible, disabled: !profile_tab.can_be_hide }),
          open_as_external: profile_tab.open_as_external,
          has_sub_menu: profile_tab.has_sub_menu,
          parent_tab: profile_tab.parent_tab,
          can_be_deleted: profile_tab.can_be_deleted,
          sort_by: profile_tab.sort_by,
          can_be_hide: profile_tab.can_be_hide,
          external_url: profile_tab.external_url,
          item_id: profile_tab.item_id,
          idSubmodule: profile_tab.idSubmodule,
          is_new_tab: profile_tab.fixed_id.includes('_-1'),
          fixed_id: profile_tab.fixed_id,
        });
        this.header_items_form.push(profile_group);
      } else {
        this.iglesia.header_items.forEach(element => {
          // const profile_tab_settings = element.profile_tab_settings;
          const group = this.formBuilder.group({
            id: element.id,
            idModule: new FormControl(element.idModule, [Validators.required]),
            name: new FormControl(element.name, [Validators.required]),
            is_visible: new FormControl({ value: element.is_visible, disabled: !element.can_be_hide }),
            open_as_external: element.open_as_external,
            has_sub_menu: element.has_sub_menu,
            parent_tab: element.parent_tab,
            can_be_deleted: element.can_be_deleted,
            sort_by: element.sort_by,
            can_be_hide: element.can_be_hide,
            external_url: element.external_url,
            item_id: element.item_id,
            idSubmodule: element.idSubmodule,
            is_new_tab: element.fixed_id.includes('_-1'),
            fixed_id: element.fixed_id,
            // profile_tab_settings: new FormGroup({
            //   id: new FormControl(profile_tab_settings.id),
            //   col_size: new FormControl(profile_tab_settings.col_size, [Validators.required, Validators.max(12)]),
            //   ids_to_display: new FormControl(profile_tab_settings.ids_to_display, [Validators.required]),
            //   button_border_radius: new FormControl(profile_tab_settings.button_border_radius, [Validators.required, Validators.min(0)]),
            //   button_spacing: new FormControl(profile_tab_settings.button_spacing, [Validators.required, Validators.min(0)]),
            //   shadow_color: new FormControl(profile_tab_settings.shadow_color, Validators.required),
            //   shadow_spread: new FormControl(profile_tab_settings.shadow_spread, [Validators.required, Validators.min(0)]),
            //   shadow_blur: new FormControl(profile_tab_settings.shadow_blur, [Validators.required, Validators.min(0)]),
            //   title_text_bold: new FormControl(profile_tab_settings.title_text_bold, [Validators.required]),
            //   title_text_color: new FormControl(profile_tab_settings.title_text_color, [Validators.required]),
            //   title_text_align: new FormControl(profile_tab_settings.title_text_align, [Validators.required]),
            //   display_description: new FormControl(profile_tab_settings.display_description, Validators.required),
            //   description_text_color: new FormControl(profile_tab_settings.description_text_color, [Validators.required]),
            //   display_more_button: new FormControl(profile_tab_settings.display_more_button, Validators.required),
            //   button_more_color: new FormControl(profile_tab_settings.button_more_color, [Validators.required]),
            //   display_article_titles: new FormControl(profile_tab_settings.display_article_titles, [Validators.required]),
            // })
          });
          if (element.idModule === 2
            || element.idModule === 4
            || element.idModule === 5
            || element.idModule === 6
            || element.idModule === 7
            || element.idModule === 8
            || element.idModule === 9
          ) {
            let profile_tab_settings: UsTabSettingsModel = element.profile_tab_settings;

            if (JSON.stringify(profile_tab_settings) === '{}') {
              profile_tab_settings = new UsTabSettingsModel();
            }

            const settings = this.formBuilder.group({
              id: profile_tab_settings.id,
              idProfileTab: element.id,
              col_size: element.col_size,
              categories: new FormArray([]),
              default_view: 'ignore',
              grid_info: this.formBuilder.group({
                button_border_radius: [0, [Validators.required, Validators.min(0)]],
                categories_to_display: ['[]', [Validators.required]],
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
                col_size: element.col_size
              })
            });
            settings.get('grid_info').patchValue(profile_tab_settings);
            if (!profile_tab_settings.categories) {
              profile_tab_settings.categories = [];
            }
            if (profile_tab_settings.categories.length === 0) {
              const categories_form_array = settings.get('categories') as FormArray;
              const category_group = this.formBuilder.group({
                id: undefined,
                sort_by: categories_form_array.length + 1,
                col_size: 4,
                font_size: new FormControl('14px'),
                font_style: new FormControl('unset'),
                font_weight: new FormControl('normal'),
                font_color: new FormControl('#000000'),
                background_color: new FormControl('#ffffff'),
                active_background_color: new FormControl('#e4e4e4'),
                hover_background_color: new FormControl('#e4e4e4'),
                text_align: new FormControl('center'),
                is_hover: new FormControl(false),
                is_active: new FormControl(false),
                id_key: new FormControl('idCategoriaArticulo'),
                table_id_key: new FormControl('idCategoryArticle')
              });
              if (element.idModule === 2) {
                category_group.addControl('idCategoryArticle', new FormControl());
                category_group.addControl('sort_type', new FormControl());
              } else if (element.idModule === 4) {
                category_group.addControl('idDonationForm', new FormControl());
                category_group.addControl('contact_language', new FormControl());
                category_group.get('id_key').setValue('idDonationForm');
                category_group.get('table_id_key').setValue('idDonationForm');
              } else if (element.idModule === 5) {
                const style = new StyleSettingModel();
                category_group.addControl('idGroupType', new FormControl());
                category_group.addControl('name', new FormControl());
                category_group.addControl('text_color', new FormControl(style.text_color));
                category_group.addControl('degrees', new FormControl(style.degrees));
                category_group.addControl('main_color', new FormControl(style.main_color));
                category_group.addControl('main_percent', new FormControl(style.main_percent));
                category_group.addControl('second_color', new FormControl(style.second_color));
                category_group.addControl('second_percent', new FormControl(style.second_percent));
                category_group.addControl('show_shadow', new FormControl(style.show_shadow));
                category_group.addControl('display_header', new FormControl(style.display_header));
                category_group.addControl('items_per_row', new FormControl(style.items_per_row));
                category_group.addControl('idGroupCategory', new FormControl());
                category_group.addControl('random_id', new FormControl(RandomService.makeId()));
                category_group.addControl('idGroupViewMode', new FormControl(1));
                category_group.addControl('categories', new FormControl([]));
                category_group.get('id_key').setValue('idGroupType');
                category_group.get('table_id_key').setValue('idGroupType');
              } else if (element.idModule === 6) {
                category_group.addControl('idGallery', new FormControl());
                category_group.addControl('idGalleryAlbum', new FormControl());
                category_group.addControl('idGalleryViewMode', new FormControl(1));
                category_group.get('id_key').setValue('idGallery');
                category_group.get('table_id_key').setValue('idGallery');
              } else if (element.idModule === 7) {
                category_group.addControl('idMailingList', new FormControl());
                category_group.addControl('contact_language', new FormControl());
                category_group.get('id_key').setValue('idMailingList');
                category_group.get('table_id_key').setValue('idMailingList');
              } else if (element.idModule === 8) {
                category_group.addControl('idCommunityBox', new FormControl());
                category_group.addControl('display_new_style', new FormControl());
                category_group.get('id_key').setValue('idCommunityBox');
                category_group.get('table_id_key').setValue('idCommunityBox');
              } else if (element.idModule === 9) {
                category_group.addControl('idPlaylist', new FormControl());
                category_group.get('id_key').setValue('idPlaylist');
                category_group.get('table_id_key').setValue('idPlaylist');
                category_group.addControl('sort_type', new FormControl());
              }
              categories_form_array.push(category_group);
            }
            profile_tab_settings.categories.forEach(category => {
              const category_group = this.formBuilder.group({
                id: category.id,
                sort_by: category.sort_by,
                name: '',
                col_size: category.col_size,
                font_size: new FormControl(category.font_size),
                font_style: new FormControl(category.font_style),
                font_weight: new FormControl(category.font_weight),
                font_color: new FormControl(category.font_color),
                background_color: new FormControl(category.background_color),
                active_background_color: new FormControl(category.active_background_color),
                hover_background_color: new FormControl(category.hover_background_color),
                text_align: new FormControl(category.text_align),
                is_hover: new FormControl(false),
                is_active: new FormControl(false),
                id_key: new FormControl('idCategoriaArticulo'),
                table_id_key: new FormControl('idCategoryArticle')
              })
              if (element.idModule === 2) {
                category_group.addControl('idCategoryArticle', new FormControl(category.idCategoryArticle));
                category_group.addControl('sort_type', new FormControl(category.sort_type));
              } else if (element.idModule === 4) {
                category_group.addControl('idDonationForm', new FormControl(category.idDonationForm));
                category_group.addControl('contact_language', new FormControl(category.contact_language));
                category_group.get('id_key').setValue('idDonationForm');
                category_group.get('table_id_key').setValue('idDonationForm');
              } else if (element.idModule === 5) {
                category_group.addControl('idGroupType', new FormControl(category.idGroupType));
                category_group.addControl('idGroupCategory', new FormControl(category.idGroupCategory));
                category_group.addControl('text_color', new FormControl(category.text_color));
                category_group.addControl('degrees', new FormControl(category.degrees));
                category_group.addControl('main_color', new FormControl(category.main_color));
                category_group.addControl('main_percent', new FormControl(category.main_percent));
                category_group.addControl('second_color', new FormControl(category.second_color));
                category_group.addControl('second_percent', new FormControl(category.second_percent));
                category_group.addControl('show_shadow', new FormControl(category.show_shadow));
                category_group.addControl('display_header', new FormControl(category.display_header));
                category_group.addControl('items_per_row', new FormControl(category.items_per_row));
                category_group.addControl('random_id', new FormControl(RandomService.makeId()));
                category_group.addControl('idGroupViewMode', new FormControl(category.idGroupViewMode));
                category_group.addControl('categories', new FormControl([]));
                // category_group.addControl('col_size', new FormControl(`col-sm-${12 / category.items_per_row}`));
                if (category.idGroupViewMode === 1) {
                  const group_type = this.group_types.find(x => x.idGroupType === category.idGroupType);
                  if (group_type) {
                    category_group.get('name').setValue(group_type.name);
                  }
                } else {
                  if (category.idGroupViewMode === 3) {
                    const categories = this.group_types.find(x => x.idGroupType === x.idGroupType).categories;
                    category_group.get('categories').setValue(categories);
                  }
                  const group_type = this.group_categories.find(x => x.idGroupCategory === category.idGroupCategory);
                  if (group_type) {
                    category_group.get('name').setValue(group_type.name);
                  }
                }
              } else if (element.idModule === 6) {
                category_group.addControl('idGallery', new FormControl(category.idGallery));
                category_group.addControl('idGalleryAlbum', new FormControl(category.idGalleryAlbum));
                category_group.addControl('idGalleryViewMode', new FormControl(category.idGalleryViewMode));
                if (category.idGalleryViewMode === 1) {
                  const gallery = this.iglesia.galleries.find(x => x.id === category.idGallery);
                  if (gallery) {
                    category_group.get('name').setValue(gallery.name);
                  }
                } else {
                  const album = this.gallery_albums.find(x => x.id === category.idGalleryAlbum);
                  if (album) {
                    category_group.get('name').setValue(album.name);
                  }
                }
                category_group.get('id_key').setValue('idGallery');
                category_group.get('table_id_key').setValue('idGallery');
              } else if (element.idModule === 7) {
                category_group.addControl('idMailingList', new FormControl(category.idMailingList));
                category_group.addControl('contact_language', new FormControl(category.contact_language));
                category_group.get('id_key').setValue('idMailingList');
                category_group.get('table_id_key').setValue('idMailingList');
              } else if (element.idModule === 8) {
                category_group.addControl('idCommunityBox', new FormControl(category.idCommunityBox));
                category_group.addControl('display_new_style', new FormControl(category.display_new_style));
                category_group.get('id_key').setValue('idCommunityBox');
                category_group.get('table_id_key').setValue('idCommunityBox');
              } else if (element.idModule === 9) {
                category_group.addControl('idPlaylist', new FormControl(category.idPlaylist));
                category_group.addControl('sort_type', new FormControl(category.sort_type));
                category_group.get('id_key').setValue('idPlaylist');
                category_group.get('table_id_key').setValue('idPlaylist');
              }

              const categories_form_array = settings.get('categories') as FormArray;
              categories_form_array.push(category_group);
            });
            group.addControl('settings', settings);
          } else if (element.idModule === 3) {
            let profile_tab_settings = element.profile_tab_settings;

            if (JSON.stringify(profile_tab_settings) === '{}') {
              profile_tab_settings = new EventTemplateSettingsModel();
            }

            const settings = this.formBuilder.group({
              id: profile_tab_settings.id,
              idProfileTab: element.id,
              default_view: profile_tab_settings.default_view ? profile_tab_settings.default_view : 'list',
              text_color: profile_tab_settings.text_color,
              calendar_header_background: profile_tab_settings.calendar_header_background,
              calendar_subheader_background: profile_tab_settings.calendar_subheader_background,
              calendar_subheader_hover: profile_tab_settings.calendar_subheader_hover,
              show_attendances: profile_tab_settings.show_attendances,
              show_capacity: profile_tab_settings.show_capacity,
              show_v2: profile_tab_settings.show_v2 ? profile_tab_settings.show_v2 : false,
              use_own_text: profile_tab_settings.use_own_text ? profile_tab_settings.use_own_text : false,
              events_text_header: profile_tab_settings.events_text_header ? profile_tab_settings.events_text_header : 'Events',
              our_meetings_text:  profile_tab_settings.our_meetings_text ? profile_tab_settings.our_meetings_text : 'Our meetings',
              view_more_text:  profile_tab_settings.view_more_text ? profile_tab_settings.view_more_text : 'View more'
            });
            group.addControl('settings', settings);
          } else if (element.idModule != -1 && element.idModule != 'account') {
            let profile_tab_settings = element.profile_tab_settings;
            const settings = this.formBuilder.group({
              id: profile_tab_settings.id,
              idProfileTab: element.id,
              categories: new FormControl([])
            });
            group.addControl('settings', settings);
          }
          const slides_array = new FormArray([]);
          if (!element.slides) {
            element.slides = [];
          }
          if (element.slides) {
            if (element.slides.length === 0) {
              const slide_control = this.formBuilder.group({
                idProfileTab: element.id,
                picture: undefined,
                original_picture: undefined,
                cover: new FormControl(),
                img_file: new FormControl(),
                temp_src: new FormControl(),
                sort_by: 1
              });
              slides_array.push(slide_control);
            } else {
              element.slides.forEach(slide => {
                const slide_control = this.formBuilder.group({
                  id: slide.id,
                  idProfileTab: element.id,
                  picture: slide.picture,
                  original_picture: slide.picture,
                  cover: new FormControl(),
                  img_file: new FormControl(),
                  temp_src: new FormControl(),
                  sort_by: slide.sort_by
                });
                slides_array.push(slide_control);
              })
            }
          }
          group.addControl('slides', slides_array);

          this.header_items_form.push(group);
        });
      }

      return resolve({});
    })
  }
  getEventsForCalendar() {
    return new Promise((resolve, reject) => {
      this.api.get(`getIglesiaFullData`, { idIglesia: this.iglesiaId || this.currentUser.idIglesia })
        .subscribe((response: any) => {


          this.iglesia.events = response.iglesia.events;
          this.iglesia_full_data = response.iglesia;
          localStorage.setItem("lang", this.iglesia_full_data.language_code);
          this.translate.use(this.iglesia_full_data.language_code);
          return resolve({});
        })
    })
  }

  formatFullAddress(iglesia: any): string {
    let full_address = ``;
    if (iglesia.Calle) {
      full_address = `${iglesia.Calle}`
    }
    if (iglesia.Ciudad) {
      full_address = `${full_address}, ${iglesia.Ciudad}`
    }
    if (iglesia.Provincia) {
      full_address = `${full_address}, ${iglesia.Provincia}`
    }
    if (iglesia.ZIP) {
      full_address = `${full_address}, ${iglesia.ZIP}`
    }
    if (iglesia.country) {
      full_address = `${full_address}, ${iglesia.country}`
    }
    return full_address;
  }

  async saveIglesia() {
    this.is_loading = true;
    if (this.checkFields()) {
      if (this.banner_form.get('img_file').value) {
        const img_file: File = this.banner_form.get('img_file').value;

        const indexPoint = (img_file.name as string).lastIndexOf('.');
        const extension = (img_file.name as string).substring(indexPoint);
        const ticks = (
          Number(String(Math.random()).slice(2)) +
          Date.now() +
          Math.round(performance.now())
        ).toString(36);
        const myUniqueFileName = `organization_logo_${this.currentUser.idIglesia}_${ticks}${extension}`;

        const iglesia_temp = new OrganizationModel();
        iglesia_temp.idIglesia = this.currentUser.idIglesia;
        iglesia_temp.topic = this.currentUser.topic;

        const response: any = await this.organizationService.uploadFile(img_file, iglesia_temp, myUniqueFileName, 'logo', true);
        if (response) {
          const clean_src = this.uploadService.cleanPhotoUrl(response.response);
          this.banner_form.get('cover').setValue(clean_src);
        }
      }
      this.iglesia.group_style_settings.created_by = this.currentUser.idUsuario;
      this.iglesia.header_menu_settings.created_by = this.currentUser.idUsuario;
      // this.grid_template_form.get('col_size').setValue(this.iglesia.col6_grid || 12);
      this.grid_template_form.get('created_by').setValue(this.currentUser.idUsuario);
      const grid_info_form = this.grid_template_form.value;
      grid_info_form.categories_to_display_form.forEach((element, index) => {
        element.sort_by = index + 1;
      });
      grid_info_form.galleries_to_display_form.forEach((element, index) => {
        element.sort_by = index + 1;
      });
      grid_info_form.playlists_to_display_form.forEach((element, index) => {
        element.sort_by = index + 1;
      });
      grid_info_form.community_boxes_to_display_form.forEach((element, index) => {
        element.sort_by = index + 1;
      });
      grid_info_form.contact_inboxes_to_display_form.forEach((element, index) => {
        element.sort_by = index + 1;
      });

      this.api
        .post(`iglesias/saveIglesiaProfileDetail`,
          {
            idIglesia: this.iglesia.idIg,
            google: this.addHttp(this.iglesia.google),
            mision: this.iglesia.mision,
            vision: this.iglesia.vision,
            bienvenida: this.iglesia.bienvenida,
            historia: this.iglesia.historia,
            que_creemos: this.iglesia.que_creemos,
            website: this.addHttp(this.iglesia.website),
            facebook: this.addHttp(this.iglesia.facebook),
            twitter: this.addHttp(this.iglesia.twitter),
            instagram: this.addHttp(this.iglesia.instagram),
            whatsapp: this.iglesia.whatsapp,
            youtube: this.addHttp(this.iglesia.youtube),
            email: (this.iglesia.email),
            Ciudad: this.iglesia.Ciudad,
            Calle: this.iglesia.Calle,
            Provincia: this.iglesia.Provincia,
            ZIP: this.iglesia.ZIP,
            country: this.iglesia.country,
            lat: this.iglesia.lat,
            lng: this.iglesia.lng,
            android_url: this.addHttp(this.iglesia.android_url),
            ios_url: this.addHttp(this.iglesia.ios_url),
            telefono: this.iglesia.telefono,
            col1: this.iglesia.col1,
            col2: this.iglesia.col2,
            col3: this.iglesia.col3,
            col4: this.iglesia.col4,
            col5: this.iglesia.col5,
            col6: this.iglesia.col6,
            col6_grid: this.iglesia.col6_grid,
            col7_grid: this.iglesia.col7_grid,
            inboxId: this.iglesia.inboxId,
            palette: this.iglesia.palette,
            group_type: this.iglesia.group_type,
            galleryId: this.iglesia.galleryId,
            group_style_settings: this.iglesia.group_style_settings,
            header_menu_settings: this.iglesia.header_menu_settings,
            grid_info: grid_info_form,
            col_event: this.iglesia.col_event,
            display_other: this.iglesia.display_other,
            welcome_header_text: this.iglesia.welcome_header_text,
            vision_header_text: this.iglesia.vision_header_text,
            mission_header_text: this.iglesia.mission_header_text,
            our_believe_header_text: this.iglesia.our_believe_header_text,
            history_header_text: this.iglesia.history_header_text,
            banner_settings: this.banner_form.value,
            display_left_section: this.iglesia.display_left_section,
            display_events_section: this.iglesia.display_events_section,
          }
        )
        .subscribe(
          (data: any) => {
            this.api.showToast('Success!', ToastType.success)
            this.getIglesia(564)
            this.editMode = !this.editMode;
            const page = this.route.snapshot.paramMap.get('page');
            const item_value = this.actual_tab_control.value;
            const selected_module = item_value.idModule;
            const fixed_id_module = `_${selected_module}`;
            if (!page.endsWith(fixed_id_module)) {
              item_value.fixed_id = `${item_value.id}_${item_value.idModule}`;
              const module = this.header_modules.find(x => x.id === item_value.idModule);
              item_value.slug = module.slug;
              this.manageRedirection(item_value);
            } else {
              if (page.endsWith('_-1') && item_value.open_as_external) {
                let url = `/organization-profile/main/${this.iglesiaId}/inicio`;
                this.router.navigate([url]);
              } else if (page.endsWith('_10')) {
                const actual_id = this.route.snapshot.paramMap.get('slug');
                const selected_id = this.actual_tab_control.get('item_id').value;
                if (Number(selected_id) !== Number(actual_id)) {
                  const subpage = this.route.snapshot.paramMap.get('subpage');
                  let url = `/organization-profile/main/${this.iglesiaId}/${page}/${subpage}/${selected_id}`;
                  this.router.navigate([url]);
                }
              } else if (page.endsWith('_11')) {
                if (this.detail_custom_component) {
                  this.detail_custom_component.ngOnInit();
                }
              } else if (page.endsWith('_5')) {

                if (this.groups_display) {
                  if (this.groups_display.selected_group_type) {
                    this.groups_display.setGroupType(this.groups_display.selected_group_type);
                  }
                }
              }
            }
          },
          (err: any) => {
            this.api.showToast('There was an error processing the action5', ToastType.error);
            this.is_loading = false;
          },
          () => {
            //this.loadingIglesia = false
          }
        );
    } else {
      this.api.showToast('Please fill all the fields', ToastType.error)
    }
  }
  addWhatsHttp(string: any) {
    if (string) {
      if ((!string.startsWith('http') && !string.startsWith('https://')) && string.length != 0) {
        return `https://wa.me/1${string}`
      } else {
        return string
      }
    } else {
      return string
    }
  }
  addHttp(string: string) {
    if (string) {
      if ((!string.startsWith('http://') && !string.startsWith('https://')) && string.length != 0) {
        return 'http://' + string
      } else {
        return string
      }
    } else {
      return string
    }

  }
  isValidHttpUrl(string: string) {
    if (string) {
      if (!string.startsWith('http://')) {
        string = 'http://' + string
      }
    }
    let url;
    if (!string) {
      return true
    }
    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  }

  getCover() {
    if (this.actual_tab_control) {
      if (this.actual_tab_control.value.slides.length > 0) {
        if (this.actual_tab_control.value.slides[0].temp_src) {
          const temp_src = this.actual_tab_control.value.slides[0].temp_src;
          const sanitize = this.sanitizer.bypassSecurityTrustStyle(`url("${temp_src}")`);
          return `url("${temp_src}")`;
        }
        if (this.actual_tab_control.value.slides[0].picture) {
          return `url("${this.serverUrl}${this.actual_tab_control.value.slides[0].picture}")`;
        } else if (this.iglesia && this.iglesia.portadaArticulos) {
          return `url("${this.serverUrl}${this.iglesia.portadaArticulos}")`;
        }
        return '';
      }
      return '';
    } else {
      return '';
    }
  }

  getBannerCover() {
    if (this.iglesia && this.banner_form.get('temp_src').value) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(this.banner_form.get('temp_src').value);
    } else if (this.banner_form.get('cover').value) {
      return `https://iglesia-tech-api.e2api.com${this.banner_form.get('cover').value}`;
    } else {
      return `/assets/img/default-cover-image.jpg`
    }
  }

  get can_edit() {
    if (this.currentUser) {
      return (this.currentUser.isSuperUser || this.currentUser.idUserType === 1) && this.show_as_preview;
    }
    return false;
  }

  public getAddress(item: AutocompleteResponseModel) {
    if (item) {
      if (item.address) {
        this.iglesia.Ciudad = item.address.city;
        this.iglesia.Calle = item.address.street;
        this.iglesia.Provincia = item.address.state;
        this.iglesia.ZIP = item.address.zip_code;
        this.iglesia.country = item.address.country;
        this.iglesia.lat = item.address.lat;
        this.iglesia.lng = item.address.lng;
      }
    }
  }

  get organization_location() {
    return {
      lat: this.iglesia.lat,
      lng: this.iglesia.lng
    }
  }

  updateCategories(event) {
    setTimeout(() => {
      const categories_ids = this.selected_categories.map(x => x.idCategoriaArticulo);

      this.grid_template_form.get('categories_to_display').setValue(categories_ids);
      this.categories_to_display = this.get_categories_to_display();
    }, 100);
  }

  get_categories_to_display() {
    const categories_ids = this.selected_categories.map(x => x.idCategoriaArticulo);
    if (categories_ids.length > 0) {
      const categories = this.categories.filter(x => categories_ids.includes(x.idCategoriaArticulo));
      if (this.settings_form) {
        const categories_on_control = this.settings_form.value.categories;
        categories.sort((a, b) => {
          const category_a = categories_on_control.find(cat => cat.idCategoryArticle === a.idCategoriaArticulo);
          const category_b = categories_on_control.find(cat => cat.idCategoryArticle === b.idCategoriaArticulo);
          if (category_a && category_b) {
            return category_a.sort_by > category_b.sort_by ? 1 : -1;
          }
          return 1;
        });
      }

      return categories;
    }
    return [];
  }

  print(event) {
  }

  setSize() {
    this.editMode = true;
    // this.grid_template_form.get('col_size').setValue(this.iglesia.col6_grid);
  }

  get show_display_description() {
    if (this.settings_form) {
      if (this.settings_form.get('grid_info')) {
        return this.settings_form.get('grid_info').get('display_description').value;
      }
    }
    return this.grid_template_form.get('display_description').value;
  }

  get show_articles_title() {
    if (this.settings_form) {
      if (this.settings_form.get('grid_info')) {
        return this.settings_form.get('grid_info').get('display_article_titles').value;
      }
    }
    return this.grid_template_form.get('display_article_titles').value;
  }

  get show_display_more_button() {
    if (this.settings_form) {
      if (this.settings_form.get('grid_info')) {
        return this.settings_form.get('grid_info').get('display_more_button').value;
      }
    }
    return this.grid_template_form.get('display_more_button').value;
  }

  toggleAcceptace(form_group: FormGroup, field: string) {
    const actual_value = form_group.get(field).value;
    form_group.get(field).setValue(!actual_value);
  }

  get_selected_category_on_main() {
    if (this.iglesia) {
      if (this.iglesia.categories_to_display.length > 0) {
        const categories = this.iglesia.categories_to_display.map(x => x.idCategoryArticle);
        this.iglesia.categories_to_display.forEach(x => {
          const category = this.categories.find(cat => cat.idCategoriaArticulo === x.idCategoryArticle);
          if (category) {
            category.col_size = x.col_size;
            category.view_as = x.view_as;
            category.sort_by = x.sort_by;
          }
        });
        const category = this.categories.filter(x => categories.includes(x.idCategoriaArticulo));
        category.sort((a, b) => {
          return a.sort_by > b.sort_by ? 1 : -1;
        });
        return category;
      }
      return [];
    }
    return [];
  }

  get_selected_donations() {
    const categories_ids = this.selected_donations.map(x => x.id);

    if (categories_ids.length > 0) {
      const categories = this.donation_forms.filter(x => categories_ids.includes(x.id));
      if (this.settings_form) {
        const categories_on_control = this.settings_form.value.categories;
        categories.sort((a, b) => {
          const category_a = categories_on_control.find(cat => cat.idDonationForm === a.id);
          const category_b = categories_on_control.find(cat => cat.idDonationForm === b.id);
          if (category_a && category_b) {
            return category_a.sort_by > category_b.sort_by ? 1 : -1;
          }
          return 1;
        });
      }

      return categories;
    }
    return [];

  }
  get_selected_galleries() {
    if (this.iglesia) {
      const categories_ids = this.selected_galleries.map(x => x.id);
      if (categories_ids.length > 0) {
        const categories = this.iglesia.galleries.filter(x => categories_ids.includes(x.id));
        if (this.settings_form) {
          const categories_on_control = this.settings_form.value.categories;
          categories.sort((a, b) => {
            const category_a = categories_on_control.find(cat => cat.idGallery === a.id);
            const category_b = categories_on_control.find(cat => cat.idGallery === b.id);
            if (category_a && category_b) {
              return category_a.sort_by > category_b.sort_by ? 1 : -1;
            }
            return 1;
          });
        }

        return categories;
      }
      return [];
    }
    return [];
  }
  get_selected_playlists() {
    if (this.iglesia) {
      const categories_ids = this.selected_playlists.map(x => x.idPlaylist);
      if (categories_ids.length > 0) {
        const categories = this.iglesia.playlists.filter(x => categories_ids.includes(x.idPlaylist));
        if (this.settings_form) {
          const categories_on_control = this.settings_form.value.categories;
          categories.sort((a, b) => {
            const category_a = categories_on_control.find(cat => cat.idPlaylist === a.idPlaylist);
            const category_b = categories_on_control.find(cat => cat.idPlaylist === b.idPlaylist);
            if (category_a && category_b) {
              return category_a.sort_by > category_b.sort_by ? 1 : -1;
            }
            return 1;
          });
        }

        return categories;
      }
      return [];
    }
    return [];
  }
  get_selected_community_boxes() {
    if (this.iglesia) {
      const categories_ids = this.selected_community_boxes.map(x => x.id);
      if (categories_ids.length > 0) {
        const categories = this.iglesia.community_boxes.filter(x => categories_ids.includes(x.id));
        if (this.settings_form) {
          const categories_on_control = this.settings_form.value.categories;

          categories.sort((a, b) => {
            const category_a = categories_on_control.find(cat => cat.idCommunityBox === a.id);
            const category_b = categories_on_control.find(cat => cat.idCommunityBox === b.id);
            if (category_a && category_b) {
              return category_a.sort_by > category_b.sort_by ? 1 : -1;
            }
            return 1;
          });
        }

        return categories;
      }
      return [];
    }
    return [];
  }

  get_selected_contact_inboxes() {
    if (this.iglesia) {
      const categories_ids = this.selected_contact_inboxes.map(x => x.id);
      if (categories_ids.length > 0) {
        const categories = this.iglesia.inboxes.filter(x => categories_ids.includes(x.id));
        if (this.settings_form) {
          const categories_on_control = this.settings_form.value.categories;
          categories.sort((a, b) => {
            const category_a = categories_on_control.find(cat => cat.idMailingList === a.id);
            const category_b = categories_on_control.find(cat => cat.idMailingList === b.id);
            if (category_a && category_b) {
              return category_a.sort_by > category_b.sort_by ? 1 : -1;
            }
            return 1;
          });
        }

        return categories;
      }
      return [];
    }
    return [];
  }

  dismissAndRedirect(idCategoriaArticulo?: number) {
    const page = this.route.snapshot.paramMap.get('page');
    if (page) {
      let url = `/organization-profile/main/${this.iglesiaId}/${page}`;
      if (page.endsWith('_2') || page.endsWith('_1')) {
        const item = this.iglesia.header_items.find(x => x.idModule === this.actual_page_obj.actualPage && x.fixed_id === this.actual_page_obj.id);
        if (item) {
          const subpage = item.slug;
          if (subpage) {
            url = `${url}/${subpage}`
          }
          if (idCategoriaArticulo) {
            url = `${url}/${idCategoriaArticulo}`
          } else {
            const categories = item.profile_tab_settings.categories;
            if (categories.length > 0) {
              const first_id = categories[0].idCategoryArticle;
              url = `${url}/${first_id}`;
            }

          }
        }
      }
      this.router.navigateByUrl(url);
    }
  }

  updateLogo() {
    this.inputLogo.nativeElement.onchange = (event: {
      target: { files: File[] };
    }) => {
      if (event.target.files.length > 0) {
        const confirmation = confirm(
          `You want to update this organization's logo?`
        );
        if (confirmation) {
          const photo: File = event.target.files[0];
          this.uploadLogo(photo);
        }
      }
    };
    (this.inputLogo as ElementRef).nativeElement.click();
  }

  uploadLogo(file: File) {
    this.uploadingLogo = true;
    const iglesia_temp = new OrganizationModel();
    iglesia_temp.idIglesia = this.currentUser.idIglesia;
    iglesia_temp.topic = this.currentUser.topic;
    iglesia_temp.Nombre = this.iglesia.Nombre;
    iglesia_temp.datosPagosIglesia = null;
    iglesia_temp.datosProyectoIglesia = null;
    iglesia_temp.cuponesIglesias = null;
    iglesia_temp.idTipoServicio = this.iglesia.idTipoServicio;

    const indexPoint = (file.name as string).lastIndexOf('.');
    const extension = (file.name as string).substring(indexPoint);
    const ticks = (
      Number(String(Math.random()).slice(2)) +
      Date.now() +
      Math.round(performance.now())
    ).toString(36);
    const myUniqueFileName = `organization_logo_${this.currentUser.idIglesia}_${ticks}${extension}`;

    this.organizationService
      .uploadFile(file, iglesia_temp, myUniqueFileName, 'logo')
      .then((data: any) => {
        iglesia_temp.Logo = this.uploadService.cleanPhotoUrl(data.response);
        this.organizationService.getIglesiaDetail(iglesia_temp)
          .subscribe((response: any) => {

            const organization = Object.assign({}, response.iglesia);
            if (!organization.datosProyectoIglesia) {
              organization.datosProyectoIglesia = new DatosProyectoIglesiaModel();
            }
            const start_date = moment(organization.datosProyectoIglesia.fechaInicioProyecto).utc().format('YYYY-MM-DD');
            const buy_date = moment(organization.datosProyectoIglesia.fechaCompraDominio).utc().format('YYYY-MM-DD');
            organization.datosProyectoIglesia.fechaInicioProyecto = start_date;
            organization.datosProyectoIglesia.fechaCompraDominio = buy_date;
            if (!organization.datosPagosIglesia) {
              organization.datosPagosIglesia = new DatosPagosIglesiaModel();
              organization.datosPagosIglesia.idCatalogoPlan = response.iglesia.idCatalogoPlan;
            }
            organization.Logo = this.uploadService.cleanPhotoUrl(data.response);

            this.organizationService
              .saveIglesia(organization)
              .subscribe((res: any) => {
                this.getIglesia();
              });
          });
      });
  }

  categories_left(idCategoriaArticulo: number, form_array?: FormArray) {
    let value;
    if (form_array) {
      value = form_array.value;
    } else {
      value = this.categories_to_display_form.value;
    }
    const categories_used = value.map(x => Number(x.idCategoryArticle)).filter(c => !!c);
    if (idCategoriaArticulo) {
      return this.categories.filter(x => !categories_used.includes(x.idCategoriaArticulo) || x.idCategoriaArticulo === Number(idCategoriaArticulo));
    }
    return this.categories.filter(x => !categories_used.includes(x.idCategoriaArticulo));
  }

  galleries_left(form: FormGroup) {
    // const galleries_used = this.settings_categories_form.value.map(x => Number(x.idGallery)).filter(c => !!c);
    // if (idGallery) {
    //   return this.iglesia.galleries.filter(x => !galleries_used.includes(x.id) || x.id === Number(idGallery));
    // }
    // return this.iglesia.galleries.filter(x => !galleries_used.includes(x.id));
    const idGallery: number = Number(form.get('idGallery').value);
    if (form.get('idGalleryViewMode').value == 1) {
      const galleries_used = this.settings_categories_form.value.map(x => Number(x.idGallery)).filter(c => !!c);
      if (idGallery) {
        return this.iglesia.galleries.filter(x => !galleries_used.includes(x.id) || x.id === Number(idGallery));
      }
      return this.iglesia.galleries.filter(x => !galleries_used.includes(x.id));
    } else {
      return this.iglesia.galleries;
    }
  }

  playlists_left(idPlaylist: number) {
    const playlists_used = this.settings_categories_form.value.map(x => Number(x.idPlaylist)).filter(c => !!c);
    if (idPlaylist) {
      return this.iglesia.playlists.filter(x => !playlists_used.includes(x.idPlaylist) || x.idPlaylist === Number(idPlaylist));
    }
    return this.iglesia.playlists.filter(x => !playlists_used.includes(x.idPlaylist));
  }

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

  group_types_left_advanced(form: FormGroup) {
    const groups = this.group_types_left(form);
    if (form.get('idGroupViewMode').value == 3) {
      return groups.filter(x => this.group_categories_left(form).length > 0 || x.idGroupType === Number(form.get('idGroupType').value));
    }
    return groups;
  }
  group_types_left(form: FormGroup) {
    const idGroupType: number = Number(form.get('idGroupType').value);
    if (form.get('idGroupViewMode').value == 1) {
      const types_used = this.settings_categories_form.value.map(x => Number(x.idGroupType)).filter(c => !!c);
      if (idGroupType) {
        return this.group_types.filter(x => !types_used.includes(x.idGroupType) || x.idGroupType === Number(idGroupType));
      }
      return this.group_types.filter(x => !types_used.includes(x.idGroupType));
    } else {
      return this.group_types;
    }
  }
  group_categories_left_advanced(form: FormGroup) {
    const categories = this.group_categories_left(form)
    if (form.get('idGroupViewMode').value == 3) {
      const idGroupType = Number(form.get('idGroupType').value);
      if (idGroupType) {
        let categories_per_group_type = form.value.categories || this.group_categories;
        const ids_used = this.settings_categories_form.value.filter(x => x.idGroupViewMode == 3 && x.idGroupType == idGroupType).map(x => Number(x.idGroupCategory)).filter(c => c);
        const idGroupCategory = Number(form.get('idGroupCategory').value);
        if (idGroupCategory) {
          return categories_per_group_type.filter(x => !ids_used.includes(x.idGroupCategory) || x.idGroupCategory === Number(idGroupCategory));
        }
        return categories_per_group_type.filter(x => !ids_used.includes(x.idGroupCategory));
      }
    }
    return categories;
  }
  group_categories_left(form: FormGroup) {
    const idGroupCategory: number = Number(form.get('idGroupCategory').value);
    const idGroupType: number = Number(form.get('idGroupType').value);

    if (form.get('idGroupViewMode').value == 2 || form.get('idGroupViewMode').value == 3) {
      let array = this.settings_categories_form.value;
      if (form.get('idGroupViewMode').value == 3 && idGroupType) {
        array = array.filter(x => Number(x.idGroupType) == idGroupType);
      }
      const types_used = array.map(x => Number(x.idGroupCategory)).filter(c => !!c);
      if (idGroupCategory) {
        return this.group_categories.filter(x => !types_used.includes(x.idGroupCategory) || x.idGroupCategory === Number(idGroupCategory));
      }
      return this.group_categories.filter(x => !types_used.includes(x.idGroupCategory));
    } else {
      return this.group_categories;
    }
  }
  community_boxes_left(idCommunityBox: number) {
    const community_boxes_used = this.settings_categories_form.value.map(x => Number(x.idCommunityBox)).filter(c => !!c);
    if (idCommunityBox) {
      return this.iglesia.community_boxes.filter(x => !community_boxes_used.includes(x.id) || x.id === Number(idCommunityBox));
    }
    return this.iglesia.community_boxes.filter(x => !community_boxes_used.includes(x.id));
  }

  contact_inboxes_left(idMailingList: number) {
    const inboxes_used = this.settings_categories_form.value.map(x => Number(x.idMailingList)).filter(c => !!c);
    if (idMailingList) {
      return this.iglesia.inboxes.filter(x => !inboxes_used.includes(x.id) || x.id === Number(idMailingList));
    }
    return this.iglesia.inboxes.filter(x => !inboxes_used.includes(x.id));
  }

  items_in_array_left(item_id: number, array: any[], array_key: string, form_key: string) {
    const inboxes_used = this.settings_categories_form.value.map(x => Number(x[form_key])).filter(c => !!c);
    if (item_id) {
      return array.filter(x => !inboxes_used.includes(x[array_key]) || x[array_key] === Number(item_id));
    }
    return array.filter(x => !inboxes_used.includes(x[array_key]));
  }

  removeCategory(index: number) {
    if (this.can_edit) {
      this.editMode = true;
    }
    this.categories_to_display_form.removeAt(index);
    if (this.categories_to_display_form.length === 0) {
      this.addCategoryToMain();
    }
  }

  removeCategoryFromSettings(index: number) {
    if (this.can_edit) {
      this.editMode = true;
    }
    this.settings_categories_form.removeAt(index);
    if (this.settings_categories_form.length === 0) {
      this.addCategoryToSettings();
    }
  }

  removeGallery(index: number) {
    if (this.can_edit) {
      this.editMode = true;
    }
    this.settings_categories_form.removeAt(index);
    if (this.settings_categories_form.length === 0) {
      this.addGallery();
    }
  }
  removePlaylist(index: number) {
    if (this.can_edit) {
      this.editMode = true;
    }
    this.settings_categories_form.removeAt(index);
    if (this.settings_categories_form.length === 0) {
      this.addPlaylist();
    }
  }
  removeGroupType(index: number) {
    if (this.can_edit) {
      this.editMode = true;
    }
    this.settings_categories_form.removeAt(index);
    if (this.settings_categories_form.length === 0) {
      this.addGroupType();
    }
  }
  removeCommunityBox(index: number) {
    if (this.can_edit) {
      this.editMode = true;
    }
    this.settings_categories_form.removeAt(index);
    if (this.settings_categories_form.length === 0) {
      this.addCommunityBox();
    }
  }

  removeContactInbox(index: number) {
    if (this.can_edit) {
      this.editMode = true;
    }
    this.settings_categories_form.removeAt(index);
    if (this.settings_categories_form.length === 0) {
      this.addContactInbox();
    }
  }

  removeItem(index: number, form_array: FormArray, id_key: string, form_key: string) {
    if (this.can_edit) {
      this.editMode = true;
    }
    form_array.removeAt(index);
    if (form_array.length === 0) {
      this.addNewItem(id_key, form_key, form_array);
    }
  }

  addCategoryToMain() {
    // if (this.can_edit) {
    //   this.editMode = true;
    // }
    const group = this.formBuilder.group({
      idCategoryArticle: undefined,
      id: undefined,
      sort_by: this.categories_to_display_form.length + 1,
      col_size: 12,
      articles_count: 0,
      view_as: 'load_more',
      rows: 0,
      display_view_as: false
    });
    this.categories_to_display_form.push(group);
  }

  addCategoryToSettings() {
    const group = this.formBuilder.group({
      idCategoryArticle: undefined,
      id: undefined,
      sort_by: this.settings_categories_form.length + 1,
      col_size: 4,
      sort_type: undefined
    });
    this.settings_categories_form.push(group);
  }

  addGallery() {
    const group = this.formBuilder.group({
      idGallery: undefined,
      idGalleryAlbum: undefined,
      idGalleryViewMode: undefined,
      id: undefined,
      idProfileTab: this.settings_form.value.idProfileTab,
      sort_by: this.settings_categories_form.length + 1,
      font_size: new FormControl('14px'),
      font_style: new FormControl('unset'),
      font_weight: new FormControl('normal'),
      font_color: new FormControl('#000000'),
      background_color: new FormControl('#ffffff'),
      active_background_color: new FormControl('#e4e4e4'),
      hover_background_color: new FormControl('#e4e4e4'),
      text_align: new FormControl('center'),
      is_hover: new FormControl(false),
      is_active: new FormControl(false),
      id_key: new FormControl('id'),
      table_id_key: new FormControl('idGallery')
    });
    this.settings_categories_form.push(group);
  }

  addPlaylist() {
    const group = this.formBuilder.group({
      idPlaylist: undefined,
      id: undefined,
      idProfileTab: this.settings_form.value.idProfileTab,
      sort_by: this.settings_categories_form.length + 1,
      font_size: new FormControl('14px'),
      font_style: new FormControl('unset'),
      font_weight: new FormControl('normal'),
      font_color: new FormControl('#000000'),
      background_color: new FormControl('#ffffff'),
      active_background_color: new FormControl('#e4e4e4'),
      hover_background_color: new FormControl('#e4e4e4'),
      text_align: new FormControl('center'),
      is_hover: new FormControl(false),
      is_active: new FormControl(false),
      id_key: new FormControl('id'),
      table_id_key: new FormControl('idPlaylist'),
      sort_type: new FormControl('date_desc')
    });
    this.settings_categories_form.push(group);
  }
  addGroupType() {
    const style = new StyleSettingModel();
    const group = this.formBuilder.group({
      idGroupType: undefined,
      id: undefined,
      idProfileTab: this.settings_form.value.idProfileTab,
      sort_by: this.settings_categories_form.length + 1,
      font_size: new FormControl('14px'),
      font_style: new FormControl('unset'),
      font_weight: new FormControl('normal'),
      font_color: new FormControl('#000000'),
      background_color: new FormControl('#ffffff'),
      active_background_color: new FormControl('#e4e4e4'),
      hover_background_color: new FormControl('#e4e4e4'),
      text_align: new FormControl('center'),
      is_hover: new FormControl(false),
      is_active: new FormControl(false),
      id_key: new FormControl('idGroupType'),
      table_id_key: new FormControl('idGroupType'),
      text_color: new FormControl(style.text_color),
      degrees: new FormControl(style.degrees),
      main_color: new FormControl(style.main_color),
      main_percent: new FormControl(style.main_percent),
      second_color: new FormControl(style.second_color),
      second_percent: new FormControl(style.second_percent),
      show_shadow: new FormControl(style.show_shadow),
      display_header: new FormControl(style.display_header),
      items_per_row: new FormControl(6),
      col_size: new FormControl(style.col_size),
      idGroupCategory: new FormControl(undefined),
      random_id: new FormControl(RandomService.makeId()),
      idGroupViewMode: new FormControl(1)
    });

    this.settings_categories_form.push(group);
  }

  addCommunityBox() {
    const group = this.formBuilder.group({
      idCommunityBox: undefined,
      id: undefined,
      sort_by: this.settings_categories_form.length + 1,
      idProfileTab: this.settings_form.value.idProfileTab,
      display_new_style: false,
      font_size: new FormControl('14px'),
      font_style: new FormControl('unset'),
      font_weight: new FormControl('normal'),
      font_color: new FormControl('#000000'),
      background_color: new FormControl('#ffffff'),
      active_background_color: new FormControl('#e4e4e4'),
      hover_background_color: new FormControl('#e4e4e4'),
      text_align: new FormControl('center'),
      is_hover: new FormControl(false),
      is_active: new FormControl(false),
      id_key: new FormControl('id'),
      table_id_key: new FormControl('idCommunityBox')
    });
    this.settings_categories_form.push(group);
  }

  addContactInbox() {
    const group = this.formBuilder.group({
      idMailingList: undefined,
      id: undefined,
      idProfileTab: this.settings_form.value.idProfileTab,
      sort_by: this.settings_categories_form.length + 1,
      contact_language: 'es',
      font_size: new FormControl('14px'),
      font_style: new FormControl('unset'),
      font_weight: new FormControl('normal'),
      font_color: new FormControl('#000000'),
      background_color: new FormControl('#ffffff'),
      active_background_color: new FormControl('#e4e4e4'),
      hover_background_color: new FormControl('#e4e4e4'),
      text_align: new FormControl('center'),
      is_hover: new FormControl(false),
      is_active: new FormControl(false),
      id_key: new FormControl('id'),
      table_id_key: new FormControl('idMailingList')
    });
    this.settings_categories_form.push(group);
  }

  addNewItem(id_key: string, form_key: string, form_array: FormArray) {
    const group = this.formBuilder.group({
      [form_key]: undefined,
      id: undefined,
      idProfileTab: this.settings_form.value.idProfileTab,
      sort_by: form_array.length + 1,
      contact_language: 'es',
      font_size: new FormControl('14px'),
      font_style: new FormControl('unset'),
      font_weight: new FormControl('normal'),
      font_color: new FormControl('#000000'),
      background_color: new FormControl('#ffffff'),
      active_background_color: new FormControl('#e4e4e4'),
      hover_background_color: new FormControl('#e4e4e4'),
      text_align: new FormControl('center'),
      is_hover: new FormControl(false),
      is_active: new FormControl(false),
      id_key: new FormControl(id_key),
      table_id_key: new FormControl(form_key)
    });
    this.settings_categories_form.push(group);
  }

  cleanCategoriesMain() {
    while (this.categories_to_display_form.length > 0) {
      this.categories_to_display_form.removeAt(0);
    }
  }

  cleanGalleries() {
    while (this.galleries_to_display_form.length > 0) {
      this.galleries_to_display_form.removeAt(0);
    }
  }

  cleanDonations() {
    while (this.galleries_to_display_form.length > 0) {
      this.galleries_to_display_form.removeAt(0);
    }
  }

  cleanPlaylists() {
    while (this.playlists_to_display_form.length > 0) {
      this.playlists_to_display_form.removeAt(0);
    }
  }
  cleanCommunity_boxes() {
    while (this.community_boxes_to_display_form.length > 0) {
      this.community_boxes_to_display_form.removeAt(0);
    }
  }

  cleanContactInboxes() {
    while (this.contact_inboxes_to_display_form.length > 0) {
      this.contact_inboxes_to_display_form.removeAt(0);
    }
  }

  loadMediaTypes(articuloForm: ArticleFormComponent) {
    setTimeout(() => {
      this.organizationService.getMediaTypes()
        .subscribe((response: any) => {
          if (response.msg.Code === 200) {
            if (response.mediaTypes.filter(x => x.idMediaType === 6 || x.idMediaType === 7).length === 0) {
              response.mediaTypes.push({
                idMediaType: 6,
                nombre: 'Audio'
              })
              response.mediaTypes.push({
                idMediaType: 7,
                nombre: 'Document'
              });
              response.mediaTypes.push({
                idMediaType: 8,
                nombre: 'Media Video'
              });
            }
            this.article_form_profile.media_types = response.mediaTypes;
          } else {
            this.article_form_profile.media_types = [];
            this.organizationService.api.showToast(`Error getting Media Types...`, ToastType.error);
          }
        }, error => {
          console.error(error);
        });
    }, 100);
  }

  getting_detail: boolean = false;

  addArticle(articulo: ArticuloModel, article_display: ProfileArticlesDisplayComponent) {
    // articulo.orden = this.tabToShow.articulos.length + 1;
    this.selectedArticle = articulo;
    this.openEditModal(articulo);
    this.actual_article_display = article_display;
  }

  editArticle(articulo: ArticuloModel, article_display: ProfileArticlesDisplayComponent) {
    this.selectedArticle = articulo;
    this.openEditModal(articulo);
    this.actual_article_display = article_display;
  }

  openEditModal(article: ArticuloModel) {
    this.getting_detail = true;
    this.modal.getModal('editArticleProfileModal').open();
    setTimeout(() => {
      this.getting_detail = false;
    }, 100);
  }
  handleSubmitArticle() {
    this.selected_categories = [];
    this.selected_category_on_main = [];
    this.refreshCategories();
  }

  refreshCategories() {
    this.getting_detail = true;
    this.modal.getModal('editArticleProfileModal').close();
    setTimeout(() => {
      const idIglesia = this.iglesiaId ? this.iglesiaId : this.currentUser.idIglesia;
      this.getArticleCategories(idIglesia);
      if (this.actual_article_display) {
        this.actual_article_display.refreshArticles(this.actual_article_display.selected_category);
      }
      this.getting_detail = false;
    }, 100);
  }

  showCategories(manage_categories_modal: NgxSmartModalComponent) {
    this.show_categories = false;
    setTimeout(() => {
      this.show_categories = true;
    }, 100);
    manage_categories_modal.open();
  }

  shouldShow(item) {
    // if (item.idModule === 2) {
    //   return this.categories_to_display.length > 0
    // } else
    const include_ids = [2, 4, 6, 7, 8, 9];
    if (item.idModule === 3) {
      if (this.iglesia) {
        if (this.iglesia.events) {
          return this.iglesia.events.length > 0;
        }
      }
    } else if (item.idModule === 5) {
      if (this.iglesia) {
        if (this.iglesia.groups) {
          return this.iglesia.groups.length > 0;
        }
      }
    } else if (include_ids.includes(item.idModule)) {
      if (this.iglesia && item.profile_tab_settings) {
        if (item.profile_tab_settings.categories) {
          if (item.idModule === 4) {
            return this.check_stripe_settings;
          } else {
            return item.profile_tab_settings.categories.length > 0;
          }
        }
      }
      return false;
    }
    return true;
  }

  dropLevel(event: CdkDragDrop<any>) {
    moveItemInArray(
      this.iglesia.header_items,
      event.previousIndex,
      event.currentIndex
    );
    this.editMode = true;
    this.iglesia.header_items.forEach((x, index) => x.sort_by = index + 1);
    this.setHeaderItems();
  }

  get actual_index() {
    if (this.actualPage) {
      if (this.iglesia.header_items) {
        const item = this.iglesia.header_items.find(x => x.idModule === this.actual_page_obj.actualPage && x.fixed_id === this.actual_page_obj.id);
        const index = this.iglesia.header_items.indexOf(item);
        return index;
      }
    }
    return 0;
  }

  get actual_tab_control() {
    try {
      const item = this.iglesia.header_items.find(x => x.idModule === this.actual_page_obj.actualPage && x.fixed_id === this.actual_page_obj.id);
      if (item) {
        const index = this.iglesia.header_items.indexOf(item);
        if (item.can_be_hide) {
          if (this.header_items_form.at(index)) {
            this.header_items_form.at(index).get('is_visible').enable();
          }
        } else {
          this.header_items_form.at(index).get('is_visible').disable();
        }
      }
    } catch (erro) {
      console.error(erro);
    }
    const group = this.header_items_form.at(this.actual_index);
    return group;
  }

  handleTabClick(item) {
    if (!this.can_edit) {
      if (item.open_as_external) {
        if (item.external_url) {
          if (this.isValidHttpUrl(item.external_url)) {
            window.open(`${item.external_url}`, "_blank");
          } else {
            this.api.showToast(`The url set is incorrect.`, ToastType.error);
          }
        } else {
          this.api.showToast(`You haven't set an url.`, ToastType.error);
        }
      } else {
        this.manageRedirection(item);
        this.setSubmoduleInfo();
      }
    } else {
      this.manageRedirection(item);
      this.setSubmoduleInfo();
    }
  }

  handleSubRoute(item, cat, field_name?: string) {
    let id;
    let slug;
    if (field_name) {
      id = cat[field_name];
    } else {
      id = cat.idCategoryArticle;
    }
    slug = item.slug;
    if (item.idModule === 7) {
      slug = 'view';
    }
    if (item.idModule == 5) {
      const idGroupViewMode = Number(cat.idGroupViewMode);
      if (idGroupViewMode !== 1) {
        slug = 'category';
      }
    }
    if (item.idModule == 6) {
      const idGalleryViewMode = Number(cat.idGalleryViewMode);
      if (idGalleryViewMode !== 1) {
        slug = 'album';
      }
    }
    this.router.navigateByUrl(`/organization-profile/main/${this.iglesiaId}/${item.fixed_id}/${slug}/${id}`);
  }

  getFieldName(item) {
    if (item.idModule === 2) {
      return 'idCategoryArticle';
    } else if (item.idModule === 4) {
      return 'idDonationForm';
    } else if (item.idModule === 5) {
      // const idGroupViewMode = Number(this.grid_template_form.get('idGroupViewMode').value);
      // if (idGroupViewMode === 1) {
      //   return 'idGroupType';
      // }
      // return 'idGroupCategory';
      return 'id';
    } else if (item.idModule === 6) {
      return 'id';
    } else if (item.idModule === 7) {
      return 'idMailingList';
    } else if (item.idModule === 8) {
      return 'idCommunityBox';
    } else if (item.idModule === 9) {
      return 'idPlaylist';
    }
  }

  getId(item, element) {
    if (item.idModule === 2) {
      return element['idCategoryArticle'];
    } else if (item.idModule === 4) {
      return element['idDonationForm'];
    } else if (item.idModule === 5) {
      // const idGroupViewMode = Number(this.grid_template_form.get('idGroupViewMode').value);
      // if (idGroupViewMode === 1) {
      //   return element['idGroupType'];
      // }
      // return element['idGroupCategory'];
      return element.id;
    } else if (item.idModule === 6) {
      return element.id;
    } else if (item.idModule === 7) {
      return element['idMailingList'];
    } else if (item.idModule === 8) {
      return element['idCommunityBox'];
    } else if (item.idModule === 9) {
      return element['idPlaylist'];
    }
  }

  fake_array = [{
    field: 'view'
  }];
  manageRedirection(item) {
    this.is_loading = true;
    let url = `/organization-profile/${this.route.snapshot.url[0].path}/${this.route.snapshot.params.idIglesia}/${item.fixed_id}`;
    let obj: {
      slug: string,
      array_name: string,
      id: string,
      sub_item: string,
      main_item: any
    } = {
      slug: item.slug,
      array_name: 'fake_array',
      id: 'field',
      sub_item: undefined,
      main_item: this
    };
    if (item.idModule === 2) {
      obj = {
        slug: item.slug,
        array_name: 'categories',
        id: 'idCategoryArticle',
        sub_item: undefined,
        main_item: item.profile_tab_settings
      }
    }
    if (item.idModule === 4) {
      obj = {
        slug: item.slug,
        array_name: 'categories',
        id: 'idDonationForm',
        sub_item: undefined,
        main_item: item.profile_tab_settings
      }
    }
    if (item.idModule === 5) {
      obj = {
        slug: item.slug,
        array_name: 'categories',
        id: 'id',
        sub_item: undefined,
        main_item: item.profile_tab_settings
      }
      // const idGroupViewMode = Number(this.grid_template_form.get('idGroupViewMode').value);
      // if (idGroupViewMode !== 1) {
      //   obj.id = 'idGroupCategory'
      //   obj.slug = 'category'
      // }
    }
    if (item.idModule === 6) {
      obj = {
        slug: item.slug,
        array_name: 'categories',
        id: 'id',
        sub_item: undefined,
        main_item: item.profile_tab_settings
      }
    }
    if (item.idModule === 7) {
      obj = {
        slug: item.slug,
        array_name: 'categories',
        id: 'idMailingList',
        sub_item: undefined,
        main_item: item.profile_tab_settings
      }
    }
    if (item.idModule === 8) {
      obj = {
        slug: item.slug,
        array_name: 'categories',
        id: 'idCommunityBox',
        sub_item: undefined,
        main_item: item.profile_tab_settings
      }
    }
    if (item.idModule === 9) {
      obj = {
        slug: item.slug,
        array_name: 'categories',
        id: 'idPlaylist',
        sub_item: undefined,
        main_item: item.profile_tab_settings
      }
    }
    if (item.idModule === 10) {
      const main_item_obj = {
        item_ids: [this.iglesia.header_items.find(x => x.fixed_id === item.fixed_id)]
      };
      obj = {
        slug: item.slug,
        array_name: 'item_ids',
        id: 'item_id',
        sub_item: undefined,
        main_item: main_item_obj
      }
    }
    if (obj) {
      let array = [];
      if (obj.sub_item) {
        array = obj.main_item[obj.sub_item][obj.array_name];
      } else {
        array = obj.main_item[obj.array_name];
      }

      if (array.length > 0) {
        url = `${url}/${obj.slug}/${array[0][obj.id]}`;
      } else {
        if (obj.id !== 'field') {
          url = `${url}/${obj.slug}/view`;
        }
      }
    }
    const query_params = this.route.snapshot.queryParams;
    if (query_params) {
      if (query_params.origin) {
        this.router.navigate([url], {
          queryParams: query_params
        });
      } else {
        this.router.navigate([url]);
      }
    } else {
      this.router.navigate([url]);
    }
    this.is_loading = false;
  }

  addSubpageTab() {
    if (!this.new_tab_existing) {
      const fixed_id = `${this.iglesia.header_items.length + 1}_-1`;
      this.iglesia.header_items.push({
        can_be_deleted: false,
        can_be_hide: true,
        external_url: "",
        has_sub_menu: false,
        idModule: -1,
        is_visible: true,
        name: "New tab",
        open_as_external: false,
        parent_tab: null,
        sort_by: this.iglesia.header_items.length + 1,
        slug: 'edit',
        // id: fixed_id,
        fixed_id,
        slides: new FormArray([])
      });
      this.setHeaderItems();
      this.pageIndexes[fixed_id] = -1;
      this.actualPage = this.pageIndexes[fixed_id]
      this.actual_page_obj.actualPage = this.actualPage;
      this.actual_page_obj.id = fixed_id;

      const page = this.route.snapshot.paramMap.get('page');
      const subpage = this.route.snapshot.paramMap.get('subpage');
      const slug = this.route.snapshot.paramMap.get('slug');
      let url = `/organization-profile/main/${this.iglesiaId}`
      if (slug) {
        url = `${url}/${fixed_id}/edit/new`;
      } else {
        url = `${url}/${fixed_id}`;
      }
      this.router.navigate([url]);
    }
  }

  get custom_category() {
    if (this.actual_tab_control) {
      return this.categories.find(x => x.idCategoriaArticulo === this.actual_tab_control.get('item_id').value)
    }
  }

  fixASNumber(field: string) {
    const selected_id = Number(this.actual_tab_control.get(field).value);
    this.actual_tab_control.get(field).setValue(selected_id);
    if (selected_id === 10) {
      this.actual_tab_control.get('item_id').reset();
    }
    if (selected_id === 4) {
      this.checkStripeInfo();
    }
    if (selected_id === 2) {

      const settings = this.formBuilder.group({
        id: this.settings_form.value.id,
        idProfileTab: this.settings_form.value.idProfileTab,
        col_size: 4,
        categories: new FormArray([]),
        default_view: 'ignore',
        grid_info: this.formBuilder.group({
          button_border_radius: [0, [Validators.required, Validators.min(0)]],
          categories_to_display: ['[]', [Validators.required]],
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
          col_size: 4
        })
      });
      const actual_control = this.actual_tab_control as FormGroup;
      actual_control.setControl('settings', settings);
      // let profile_tab_settings: UsTabSettingsModel = new UsTabSettingsModel();
      // if (this.settings_form.get('grid_info')) {
      //   this.settings_form.get('grid_info').patchValue(profile_tab_settings);
      // } else {
      //   const grid_info = this.formBuilder.group({
      //     button_border_radius: [0, [Validators.required, Validators.min(0)]],
      //     categories_to_display: ['[]', [Validators.required]],
      //     button_spacing: [0, [Validators.required, Validators.min(0)]],
      //     shadow_color: ['#000000', Validators.required],
      //     shadow_spread: [0, [Validators.required, Validators.min(0)]],
      //     shadow_blur: [0, [Validators.required, Validators.min(0)]],
      //     title_text_bold: ['bolder', [Validators.required]],
      //     title_text_color: ['#000000', [Validators.required]],
      //     title_text_align: ['left', [Validators.required]],
      //     display_description: [false, Validators.required],
      //     description_text_color: ['#666666', [Validators.required]],
      //     display_more_button: [false, Validators.required],
      //     button_more_color: ['#e65100', [Validators.required]],
      //     display_article_titles: [true, [Validators.required]],
      //     created_by: [],
      //     donation_language: ['es'],
      //     col_size: 4
      //   })
      //   this.settings_form.addControl('grid_info', grid_info);
      // }

    }
    if (selected_id === 11) {
      this.actual_tab_control.get('idSubmodule').reset();
      this.actual_tab_control.get('item_id').reset();
    }
    if (selected_id < 1) {
      this.editMode = false;
    }

  }

  get new_tab_existing() {
    const new_tab_item = this.iglesia.header_items.find(x => (x.fixed_id || '' as string).endsWith('_-1'));

    if (new_tab_item) {
      const actual_page = this.route.snapshot.paramMap.get('page');
      if (actual_page.endsWith('_-1')) {
        // in editing
        return true;
      }
    }
    const actual_page = this.route.snapshot.paramMap.get('page');
    if (actual_page.endsWith('_-1')) {
      if (this.iglesia.header_items.length > 0) {
        const redirect_page = this.iglesia.header_items[0].fixed_id;
        let url = `/organization-profile/main/${this.iglesiaId}/${redirect_page}`
        this.router.navigate([url]);
      }
    }
    return false;
  }

  deleteTab(actual_tab_control, actual_index) {
    const previous_index = actual_index - 1;
    this.header_items_form.removeAt(actual_index);
    this.iglesia.header_items.splice(actual_index, 1);
    this.editMode = true;
    this.setHeaderItems();
    let item;
    if (previous_index > 0 && previous_index < this.header_items_form.length) {
      item = this.iglesia.header_items[previous_index];
    } else {
      if (this.iglesia.header_items.length > 0) {
        item = this.iglesia.header_items[0];
      }
    }
    if (item) {
      this.manageRedirection(item);
    }
  }

  resetItemID(event) {
    this.actual_tab_control.get('item_id').reset();
    const idSubmodule = Number(event.target.value);
    if (idSubmodule === 2) {
      this.items = [...this.categories];
      this.detail_item_properties.id_key = 'idCategoriaArticulo';
      this.detail_item_properties.name_key = 'nombre';
    } else if (idSubmodule === 3) {
      this.groupsService.getGroupsEventsByIdIglesia(this.iglesiaId).subscribe(
        (data: any) => {
          this.detail_item_properties.id_key = 'idGroupEvent';
          this.detail_item_properties.name_key = 'name';
          this.items = data.events;
        });
    } else if (idSubmodule === 4) {
      this.detail_item_properties.id_key = 'id';
      this.detail_item_properties.name_key = 'name';
      this.items = this.donation_forms;
    } else if (idSubmodule === 5) {
      this.detail_item_properties.id_key = 'idGroup';
      this.detail_item_properties.name_key = 'title';
      this.items = this.iglesia.groups;
    } else if (idSubmodule === 6) {
      this.detail_item_properties.id_key = 'id';
      this.detail_item_properties.name_key = 'name';
      this.items = this.iglesia.galleries;
    } else if (idSubmodule === 7) {
      this.detail_item_properties.id_key = 'id';
      this.detail_item_properties.name_key = 'name';
      this.items = this.iglesia.inboxes;
    } else if (idSubmodule === 8) {
      this.detail_item_properties.id_key = 'id';
      this.detail_item_properties.name_key = 'name';
      this.items = this.iglesia.community_boxes;
    } else if (idSubmodule === 9) {
      this.detail_item_properties.id_key = 'idPlaylist';
      this.detail_item_properties.name_key = 'name';
      this.items = this.iglesia.playlists;
    } else if (idSubmodule === 10) {
      this.detail_item_properties.id_key = 'idCategoriaArticulo';
      this.detail_item_properties.name_key = 'nombre';
      this.items = [...this.categories];
    }
  }

  get check_stripe_settings() {
    if (this.iglesia.stripe_info) {
      return this.iglesia.stripe_info.hasPublicKey && this.iglesia.stripe_info.hasSecretKey;
    }
    return false;
  }


  setIconSize(width: number) {
    if (width < 375) {
      this.width_size = 90;
    } else if (width < 480) {
      this.width_size = 90;
    } else if (width < 800) {
      this.width_size = 115;
    } else if (width <= 1024) {
      this.width_size = 130;
    } else {
      this.width_size = 170;
    }
  }

  setUser(user) {
    this.currentUser = this.userService.getCurrentUser();
    const item = this.iglesia.header_items.find(x => x.idModule == 'account' && x.fixed_id === 'my_account');
    item.name = 'My profile';
  }

  get actual_page_as_string(): string {
    return this.actualPage ? this.actualPage.toString() : '';
  }

  getWhatsappLink(link) {
    if (link) {
      if (link.includes('http')) {
        return link;
      } else {
        return `https://wa.me/1${link}`;
      }
    }
  }

  onCountrySelected(event, component) {
    component.inputElement.value = event.callingCode;
  }

  refreshMeetingsOnNetwork() {
    if (this.networks_profile) {
      this.networks_profile.getMeetings();
    }
  }

  get height_first_col() {
    if (this.first_column) {
      if (this.screen_width > 767) {
        let second_menu = 0;
        if (this.currentUser) {
          second_menu = 80;
        }
        const total_size = 772 + second_menu;
        const height = this.first_column.nativeElement.offsetHeight - total_size;
        return `-${height}px`
      }
    }
  }

  get height_second_col() {
    if (this.news_column) {
      if (this.screen_width > 767) {
        let second_menu = 0;
        if (this.currentUser) {
          second_menu = 80;
        }
        const total_size = 772 + second_menu;
        const height = this.news_column.nativeElement.offsetHeight - total_size - 34;
        return `-${height}px`
      }
    }
  }

  wasEdited() {
    this.editMode = true;

  }

  canToggle() {
    if (this.currentUser) {
      if (this.currentUser.isSuperUser) {
        return true;
      }
      if (this.currentUser.idUserType === 1 && this.currentUser.idIglesia === Number(this.iglesiaId)) {
        return true;
      }
    }
    return false;
  }

  togglePreview() {
    this.show_as_preview = !this.show_as_preview
    this.setPreview();
  }

  setPreview() {
    if (this.show_as_preview) {
      setTimeout(() => {
        this.app.hide_toolbars = false;
        // if (this.iglesia) {
        //   if (this.iglesia.free_version) {
        //     if (this.currentUser) {
        //       if (this.currentUser.isSuperUser) {
        //         this.app.hide_toolbars = false;
        //       } else {
        //         this.app.hide_toolbars = true;
        //       }
        //     }
        //   } else {
        //     this.app.hide_toolbars = false;
        //   }
        // }
        this.setCategories();
      });
    } else {
      // setTimeout(() => {
      // }, 300);
      setTimeout(() => {
        this.app.hide_toolbars = true;
        this.fixFrameStyle();
      });
    }
  }

  fixFrameStyle() {
    Array.prototype.forEach.call(document.getElementsByClassName('fix-frame'), element => {
      Array.prototype.forEach.call(element.getElementsByTagName('p'), p => {
        p.classList.add('card-content-fixed');
        Array.prototype.forEach.call(p.getElementsByTagName('iframe'), img => {
          img.style.maxWidth = '100%';
          img.classList.add('frame-style-custom');
        });
        Array.prototype.forEach.call(p.getElementsByTagName('img'), img => {
          img.style.maxWidth = '95%';
          img.style.display = 'block';
          img.style.margin = 'auto auto';
          img.classList.add('quill-image-fixer');
        });
      });
      Array.prototype.forEach.call(element.getElementsByTagName('iframe'), img => {
        img.style.maxWidth = '100%';
        img.classList.add('frame-style-custom');
      });
    });
  }

  openArticleForm(item: FormGroup, index: number) {
    const articulo = new ArticuloModel();
    articulo.idIglesia = this.iglesiaId || this.currentUser ? this.currentUser.idIglesia : undefined;
    articulo.idTab = null;

    if (Number(item.value.idCategoryArticle) !== 0) {
      articulo.idCategoriaArticulo = item.value.idCategoryArticle;
    }
    if (this.currentUser) {
      articulo.author = `${this.currentUser.nombre} ${this.currentUser.apellido}`;
    } else {
      articulo.author = `N/A`;
    }
    // articulo.orden = this.tabToShow.articulos.length + 1;
    this.selectedArticle = articulo;
    this.openEditModal(articulo);
  }

  getCategory(idCategoryArticle: number, print?: boolean) {
    const category = this.categories.find(x => x.idCategoriaArticulo === Number(idCategoryArticle));
    return category;
  }

  getElement(id: number, array: any[], field_name: string) {
    return array.find(x => x[field_name] === id);

  }

  getServicioInfo(service, key_name) {
    if (!service[`${key_name}_has_been_sanitize`]) {
      service.temp_content = service[key_name];
      if (service[key_name]) {
        let content_fixed = service[key_name].replace(/&lt;/gm, '<').replace(/&gt;/gm, '>');
        const sanitized_content = this.sanitizer.bypassSecurityTrustHtml(content_fixed);
        service[`${key_name}_sanitize_content`] = sanitized_content;
        service[`${key_name}_has_been_sanitize`] = true;
        setTimeout(() => {
          this.fixFrameStyle();
        });
      }
    }
    return service[`${key_name}_sanitize_content`];
  }

  backToSearch() {
    const query_params = this.route.snapshot.queryParams;
    let fixed_params = {};
    if (query_params) {
      Object.keys(query_params).forEach(key => {
        if (key != 'origin') {
          fixed_params[key] = query_params[key];
        }
      })
    }
    this.router.navigate(['/search'], {
      queryParams: fixed_params
    });
  }

  setStyleSettings() {
  }

  onSortItem(array_of_items: any[], item, action: 'up' | 'down') {
    const index = array_of_items.indexOf(item);
    let new_index: number;
    if (action === 'up') {
      if (index !== 0) {
        new_index = index - 1;
      } else {
        new_index = 0;
      }
    } else {
      if (index !== array_of_items.length - 1) {
        new_index = index + 1;
      } else {
        new_index = index;
      }
    }
    moveItemInArray(array_of_items, index, new_index);
    array_of_items.forEach((x, index, arr) => {
      x.get('sort_by').setValue(index + 1);
    })
  }

  actual_style_settings: FormGroup;

  openStylePopup(item, type: string) {
    let name: string;
    let has_additional_keys = false;
    if (type === 'category') {
      name = this.categories.find(x => x.idCategoriaArticulo === Number(item.value.idCategoryArticle)).nombre;
    } else if (type === 'gallery') {
      name = this.iglesia.galleries.find(x => x.id === Number(item.value.idGallery)).name;
    } else if (type === 'contact') {
      name = this.iglesia.inboxes.find(x => x.id === Number(item.value.idMailingList)).name;
    } else if (type === 'community') {
      name = this.iglesia.community_boxes.find(x => x.id === Number(item.value.idCommunityBox)).name;
    } else if (type === 'playlist') {
      name = this.iglesia.playlists.find(x => x.idPlaylist === Number(item.value.idPlaylist)).name;
    } else if (type === 'group_type') {
      name = this.group_types.find(x => x.idGroupType === Number(item.value.idGroupType)).name;
      has_additional_keys = true;
    }
    this.actual_style_settings = item;
    // new FormGroup({
    //   font_size: new FormControl('14px'),
    //   font_style: new FormControl('unset'),
    //   font_weight: new FormControl('normal'),
    //   font_color: new FormControl('#000000'),
    //   background_color: new FormControl('#ffffff'),
    //   text_align: new FormControl('center'),
    //   name: new FormControl(name.nombre)
    // });
    if (this.actual_style_settings.get('name')) {
      this.actual_style_settings.get('name').setValue(name);
    } else {
      this.actual_style_settings.addControl('name', new FormControl(name));
    }
    if (has_additional_keys && type === 'group_type') {
      if (this.actual_style_settings.get('is_group')) {
        this.actual_style_settings.get('is_group').setValue(true);
      } else {
        this.actual_style_settings.addControl('is_group', new FormControl(true));
      }
    }
    this.modal.get('category_style_modal').open(true);
  }

  updateForm(name: string) {
    let value = ``;
    let num_value = this.settings_obj[`${name}_size_size`];
    const unit_value = this.settings_obj[`${name}_size_unit`];
    if (unit_value !== '%') {
      if (name !== 'cover_name') {
        if (num_value > 40) {
          this.settings_obj[`${name}_size_size`] = 40;
          this.updateForm(name);
          return;
        }
      }
    }
    value = `${num_value}${unit_value}`;
    this.actual_style_settings.get(`font_size`).setValue(value);
  }

  sortCategoriesArray(array_of_items: any[], event: CdkDragDrop<any>) {
    moveItemInArray(array_of_items, event.previousIndex, event.currentIndex);
    array_of_items.forEach((x, index, arr) => {
      x.get('sort_by').setValue(index + 1);
    })
    this.editMode = true;
  }

  getMenuTop() {
    return this.currentUser ? '80px' : '56px';
  }

  getMenuArray(item) {
    const include_ids = [2, 4, 5, 6, 7, 8, 9];
    if (include_ids.includes(item.idModule)) {
      return item.profile_tab_settings.categories
    }
  }

  addDefaultEntryPhoto(file: File) {
    this.banner_form.get('img_file').setValue(file);

    if (file) {
      setTimeout(() => {
        this.img_tag.nativeElement.src = URL.createObjectURL(file);
        this.banner_form.get('temp_src').setValue(this.img_tag.nativeElement.src);
      }, 600);
      var reader = new FileReader();
      //Read the contents of Image File.
      reader.readAsDataURL(file);
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

          const client_width = this.col_img_banner_container.nativeElement.clientWidth;

          this.container = {
            width: client_width,
            height: client_width * aspect_ratio
          }

          return true;;
        }
      };
      this.edit_object.home_banner = true

    } else {
      this.banner_form.get('temp_src').setValue(undefined);
      setTimeout(() => {
        this.img_tag.nativeElement.src = this.getBannerCover();
      }, 600);
    }
  }

  addSlidePhoto(form_group: FormGroup, file: File) {


    form_group.get('img_file').setValue(file);

    if (file) {
      setTimeout(() => {
        const src = URL.createObjectURL(file);
        form_group.get('temp_src').setValue(src);
      }, 600);
      var reader = new FileReader();
      //Read the contents of Image File.
      reader.readAsDataURL(file);
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

          // const client_width = this.col_img_banner_container.nativeElement.clientWidth;

          // this.container = {
          //   width: client_width,
          //   height: client_width * aspect_ratio
          // }

          return true;;
        }
      };
      // this.edit_object.home_banner = true

    } else {
      form_group.get('temp_src').setValue(undefined);
      setTimeout(() => {
        // this.img_tag.nativeElement.src = this.getBannerCover();
      }, 600);
    }
  }

  button_gen: {
    link: string;
    background: string;
    height: number;
    width: number;
  } = {
      link: '',
      background: '/assets/img/btn_src.png',
      height: 48,
      width: 222
    };

  get button_frame() {
    return `<div class="text-center"><a href="${this.button_gen.link}" target="_blank" rel="noopener noreferrer"><button class="btn btn-button-test" style="background: url('${this.button_gen.background}');background-position: center;background-size: cover;background-repeat: no-repeat;width: ${this.button_gen.width}px;height: ${this.button_gen.height}px;"></button></a></div>`
  }

  service_editing: FormGroup;

  openButtonModal(service_item: FormGroup) {
    this.service_editing = service_item;
    this.modal.get('generate_button_modal').open();
  }


  insertButton() {
    const form_value: ProfileTextContainerModel = this.service_editing.value;
    let button_frame_fixed = this.button_frame.replace(/</gm, '&lt;').replace(/>/gm, '&gt;');
    form_value.description += button_frame_fixed;
    form_value.has_been_sanitize = false;
    form_value.original_description = form_value.description;
    this.service_editing.patchValue(form_value);
    this.clearFrameButtonInput();
    this.modal.get('generate_button_modal').close();
  }

  insertButtonV2() {
    this.modal.get('generate_button_modal').close();
    this.service_editing = undefined;
    this.setRouterLink();
  }

  clearFrameButtonInput() {
    // this.button_gen = {
    //   link: '',
    //   background: '/assets/img/btn_src.png',
    //   height: 48,
    //   width: 222
    // };
    // this.input_button.nativeElement.value = null;
    this.service_editing = undefined;
  }

  getBackgroundUrl() {
    return `url("${this.button_gen.background}")`;

  }

  async selectAndUploadFile(file: File) {
    const indexPoint = (file.name as string).lastIndexOf('.');
    const extension = (file.name as string).substring(indexPoint);
    const ticks = (
      Number(String(Math.random()).slice(2)) +
      Date.now() +
      Math.round(performance.now())
    ).toString(36);
    const myUniqueFileName = `button_${this.currentUser.idIglesia}_${ticks}${extension}`;

    const iglesia_temp = new OrganizationModel();
    iglesia_temp.idIglesia = this.currentUser.idIglesia;
    iglesia_temp.topic = this.currentUser.topic;

    const response: any = await this.organizationService.uploadFile(file, iglesia_temp, myUniqueFileName, 'logo', true);
    if (response) {
      const clean_src = this.uploadService.cleanPhotoUrl(response.response);
      this.button_gen.background = `${environment.serverURL}${clean_src}`;
    }
    var reader = new FileReader();
    //Read the contents of Image File.
    reader.readAsDataURL(file);
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
        let size_column = 0;
        if (this.first_column) {
          size_column = this.first_column.nativeElement.clientWidth;
        }

        const percent_ratio = size_column * .60;

        const fixed_size = percent_ratio;
        this.button_gen.height = fixed_size * aspect_ratio;
        this.button_gen.width = fixed_size;

        return true;;
      }
    };
  }

  async saveProfileCover(
    actual_tab_control: FormGroup,
    slide: FormGroup
  ) {

    if (slide.get('img_file').value) {
      const img_file: File = slide.get('img_file').value;

      const indexPoint = (img_file.name as string).lastIndexOf('.');
      const extension = (img_file.name as string).substring(indexPoint);
      const ticks = (
        Number(String(Math.random()).slice(2)) +
        Date.now() +
        Math.round(performance.now())
      ).toString(36);
      const myUniqueFileName = `organization_logo_${this.currentUser.idIglesia}_${ticks}${extension}`;

      const iglesia_temp = new OrganizationModel();
      iglesia_temp.idIglesia = this.currentUser.idIglesia;
      iglesia_temp.topic = this.currentUser.topic;

      const response: any = await this.organizationService.uploadFile(img_file, iglesia_temp, myUniqueFileName, 'logo', true);
      if (response) {
        const clean_src = this.uploadService.cleanPhotoUrl(response.response);
        slide.get('picture').setValue(clean_src);

        let call_slide_tab: Observable<any>;
        const payload = slide.value;
        if (slide.value.id) {
          call_slide_tab = this.api.patch(`iglesias/headers/${actual_tab_control.value.id}/slides/${payload.id}`, payload);
        } else {
          payload.created_by = this.currentUser.idUsuario;
          call_slide_tab = this.api.post(`iglesias/headers/${actual_tab_control.value.id}/slides`, payload);
        }
        const response_slide_tab = await call_slide_tab.toPromise()
          .catch(error => {
            console.error(error);
            return;
          });
        if (response_slide_tab) {
          this.api.showToast('Success!', ToastType.success)
          this.editMode = !this.editMode;
          slide.get('temp_src').setValue(undefined);
          slide.get('temp_src').markAsPristine();
          slide.get('img_file').setValue(undefined);
        }
      }
    }
  }

  cancelProfileCover(form_group: FormGroup) {
    form_group.get('temp_src').setValue(undefined);
    form_group.get('temp_src').markAsPristine();
    form_group.get('img_file').setValue(undefined);
  }

  async removeSlide(index: number, form_group: FormGroup) {
    if (confirm('Are you sure you want to delete this slide?')) {
      // if (this.actual_tab_control.get('idModule').value != 1) {
      const payload = form_group.value;
      if (false) {
        this.slides_array.at(index).patchValue({
          picture: undefined,
        });
      } else {
        let call_slide_tab: Observable<any>;
        if (payload.id) {
          call_slide_tab = this.api.delete(`iglesias/headers/${this.actual_tab_control.value.id}/slides/${payload.id}`, { deleted_by: this.currentUser.idUsuario });
          const response_slide_tab = await call_slide_tab.toPromise()
            .catch(error => {
              console.error(error);
              return;
            });
        }
        this.slides_array.removeAt(index);
        if (this.slides_array.length === 0) {
          const slide_control = this.formBuilder.group({
            idProfileTab: this.actual_tab_control.value.id,
            picture: undefined,
            original_picture: undefined,
            cover: new FormControl(),
            img_file: new FormControl(),
            temp_src: new FormControl(),
            sort_by: 1
          });
          this.slides_array.push(slide_control);
        }
      }
    }

  }

  addSlide() {
    const slide_control = this.formBuilder.group({
      idProfileTab: this.actual_tab_control.value.id,
      picture: undefined,
      original_picture: undefined,
      cover: new FormControl(),
      img_file: new FormControl(),
      temp_src: new FormControl(),
      sort_by: this.slides_array.length + 1
    });
    this.slides_array.push(slide_control);
  }

  onResizeEnd(event: ResizeEvent): void {
    this.iglesia.header_menu_settings.height = event.rectangle.height;
    const actual_width = this.rectangle_sizable.nativeElement.clientWidth;
    const aspect_ratio = actual_width / this.iglesia.header_menu_settings.height;
    this.iglesia.header_menu_settings.aspect_ratio = aspect_ratio;
    this.edit_object.home_info = true
    this.wasEdited();
  }

  checkBannerSize() {
    setTimeout(() => {
      const rectangle_width = this.rectangle_sizable.nativeElement.clientWidth;
      const last_width = this.iglesia.header_menu_settings.width;
      const percent_between_rectangles = rectangle_width / last_width;
      this.iglesia.header_menu_settings.height = last_width * percent_between_rectangles / this.iglesia.header_menu_settings.aspect_ratio;
      this.iglesia.header_menu_settings.width = rectangle_width;
    }, 50);
    this.wasEdited();
  }

  addTextContainer(idProfileSection: number, container?: ProfileTextContainerModel) {
    let array;
    if (idProfileSection === 1) {
      array = this.iglesia.first_section_containers;
    } else if (idProfileSection === 2) {
      array = this.iglesia.about_section_containers
    }
    if (container) {
      array.push(container);
    } else {
      let container_new = new ProfileTextContainerModel();
      container_new.idProfileSection = idProfileSection;
      const index_position: number = array.length + 1;
      container_new.identifier = `${index_position}_${container_new.identifier}`;
      array.push(container_new);
    }
  }

  removeProfileTextContainer(event, array_of_containers: ProfileTextContainerModel[], index) {
    array_of_containers.splice(index, 1);
  }

  setViewType(item: FormGroup, trigger_save?: boolean, set_article_count?: boolean) {
    const category: CategoriaArticuloModel = item.value;
    if (trigger_save) {
      this.setSize();
      this.edit_object.categories_at_home = true
    }
    if (set_article_count) {
      const selected_category = this.categories.find(cat => cat.idCategoriaArticulo === Number(category.idCategoryArticle));
      if (selected_category) {
        item.get('articles_count').setValue(selected_category.articles_count);
        category.articles_count = selected_category.articles_count;
      }
    }
    if (category.articles_count > 0) {
      const col_size = 12 / Number(category.col_size);
      if (col_size === 1) {
        item.get('display_view_as').setValue(true);
      } else {
        const standalone_items = category.articles_count % col_size;
        const rows_decimal = category.articles_count / col_size;
        let rows = Math.trunc(rows_decimal);
        item.get('rows').setValue(rows);
        if (rows == 0 && standalone_items > 0) {
          item.get('rows').setValue(1);
          item.get('display_view_as').setValue(false);
          item.get('view_as').setValue('load_more');
        } else if (rows == 1 && standalone_items > 0) {
          item.get('display_view_as').setValue(true);
        } else {
          item.get('display_view_as').setValue(false);
          item.get('view_as').setValue('load_more');
        }
      }
    } else {
      item.get('display_view_as').setValue(false);
      item.get('view_as').setValue('load_more');
    }
  }

  footerClick(event) {
    const head_item = this.iglesia.header_items.find(x => x.id === event.id);
    if (head_item) {
      this.handleTabClick(head_item);
    }
  }

  footerSave(form: FormGroup) {
    this.iglesia.header_menu_settings.idFooterStyle = form.get('id').value;
    this.saveIglesia();
  }

  async checkNewGroupTypeValue(form: FormGroup, event) {
    // const idGroupCategory = form.get('idGroupCategory').value;
    // if (idGroupCategory) {
    //   const exists = this.settings_categories_form.value.find(x => Number(x.idGroupType) == Number(event) && Number(x.idGroupCategory) == Number(idGroupCategory) && x.random_id != form.get('random_id').value);

    //   if (exists) {
    //     this.api.showToast(`Esta categoría ya está asignada al grupo seleccionado`, ToastType.info);
    //     form.get('idGroupCategory').setValue(0);
    //   }
    // }
    const idGroupType = Number(form.get('idGroupType').value);
    if (idGroupType) {
      if (form.get('idGroupViewMode').value == 3) {
        form.get('idGroupCategory').setValue(undefined);
        const id = this.iglesiaId ? this.iglesiaId : this.currentUser.idIglesia

        const response_categories: any = await this.api.get(`groups/categories/filter?idIglesia=${id}&group_type=${idGroupType}`).toPromise();
        const categories = response_categories.categories;
        if (!form.get('categories')) {
          form.addControl('categories', new FormControl(categories));
        } else {
          form.get('categories').setValue(categories);
        }
      }

      this.changeContactUrl();
    }
  }

  canAddNewGroup(form: FormGroup): boolean {
    const idGroupViewMode = Number(form.get('idGroupViewMode').value);
    if (idGroupViewMode === 1) {
      return this.group_types_left(form).length > 1
        && form.get('idGroupType').value
        && form.get('items_per_row').value
    } else if (idGroupViewMode === 2) {
      return this.group_categories_left(form).length > 1 &&
        form.get('idGroupCategory').value
        && form.get('items_per_row').value
    } else if (idGroupViewMode === 3) {
      return true
        && this.group_types_left_advanced(form
        ).length > 1
        // && this.group_categories_left_advanced(form).length > 1
        && form.get('idGroupCategory').value
        && form.get('idGroupType').value
        && form.get('items_per_row').value
    }
  }

  setGroupCategory(form: FormGroup) {
    this.changeContactUrl();
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
    if (call_categories) {

    }
    // if (form.get('categories')) {

    // } else {
    //   form.addControl('categories', new FormControl())
    // }
  }

  getGroupElement(category) {
    const idGroupViewMode = Number(category.idGroupViewMode);
    let key_id = idGroupViewMode === 1 ? 'idGroupType' : 'idGroupCategory';
    const arr = idGroupViewMode === 1 ? this.group_types : this.group_categories;
    const element = this.getElement(category[key_id], arr, key_id)
    if (element) {
      return element.name;
    }
    return 'None';
  }

  getGalleryElement(category) {
    const idGalleryViewMode = Number(category.idGalleryViewMode);
    let key_id = idGalleryViewMode === 1 ? 'idGallery' : 'idGalleryAlbum';
    const arr = idGalleryViewMode === 1 ? this.iglesia.galleries : this.gallery_albums;
    const element = this.getElement(category[key_id], arr, 'id')
    if (element) {
      return element.name;
    }
    return 'None';
  }

  prevent_duplicate: boolean = false;

  async toggleViewSetting(key: string) {
    this.prevent_duplicate = true;
    if (this.iglesia.home_profile_sections[key]) {
      this.iglesia.home_profile_sections[key].is_active = !this.iglesia.home_profile_sections[key].is_active;
    } else {
      this.iglesia.home_profile_sections[key] = {
        identifier: key,
        is_active: true
      }
    }
    const payload = Object.assign({}, this.iglesia.home_profile_sections[key]);
    payload.created_by = this.currentUser.idUsuario;
    payload.idIglesiaProfile = this.iglesia.idIglesia_profile;
    const response: any = await this.api.post(`iglesias/container_settings/toggle_view/${key}`, payload).toPromise()
      .catch(error => {
        console.error(error);
        this.prevent_duplicate = false;
        return;
      });
    if (response) {
      this.prevent_duplicate = false;
    }
  }

  setCategoryInfo(form_group: FormGroup) {
    console.log(form_group);
    const idCategoryArticle = Number(form_group.get('idCategoryArticle').value);
    if (idCategoryArticle) {
      const selected_category = this.categories.find(x => x.idCategoriaArticulo === idCategoryArticle);
      console.log(selected_category);
      if (selected_category) {
        if (!form_group.value.sort_type) {
          form_group.get('sort_type').setValue(selected_category.sort_type);
        }
      }
    }
    this.changeContactUrl();
  }

  // // async checkActualViewSetting(form: FormGroup) {
  // //   const value = form.value;
  // //   const idGroupViewMode = Number(value.idGroupViewMode);
  // //   let call_categories = false;
  // //   if (idGroupViewMode === 1) {
  // //     form.get('idGroupCategory').setValue(undefined);
  // //   } else if (idGroupViewMode === 2) {
  // //     form.get('idGroupType').setValue(undefined);
  // //   } else if (idGroupViewMode === 3) {
  // //     call_categories = true;
  // //   }
  // //   if (call_categories) {

  // //   }
  // //   // if (form.get('categories')) {

  // //   // } else {
  // //   //   form.addControl('categories', new FormControl())
  // //   // }
  // // }
  canAddNewGalleryOrAlbum(form: FormGroup): boolean {
    const idGalleryViewMode = Number(form.get('idGalleryViewMode').value);
    let id;
    if (idGalleryViewMode === 1) {
      id = form.get('idGallery').value;
    } else if (idGalleryViewMode === 2) {
      id = form.get('idGalleryAlbum').value;
    }
    return (this.galleries_left(form).length > 1 || this.gallery_albums_left(form).length > 1) && id
  }

  gallery_albums_left(form: FormGroup) {
    const idGalleryAlbum: number = Number(form.get('idGalleryAlbum').value);

    if (form.get('idGalleryViewMode').value == 2) {
      let array = this.settings_categories_form.value;
      const albums_used = array.map(x => Number(x.idGalleryAlbum)).filter(c => !!c);
      if (idGalleryAlbum) {
        return this.gallery_albums.filter(x => !albums_used.includes(x.id) || x.id === Number(idGalleryAlbum));
      }
      return this.gallery_albums.filter(x => !albums_used.includes(x.id));
    } else {
      return this.gallery_albums;
    }
  }

  gallery_albums_left_advanced(form: FormGroup) {
    const categories = this.gallery_albums_left(form)
    if (form.get('idGroupViewMode').value == 3) {
      const idGroupType = Number(form.get('idGroupType').value);
      if (idGroupType) {
        let categories_per_group_type = form.value.categories || this.group_categories;
        const ids_used = this.settings_categories_form.value.filter(x => x.idGroupViewMode == 3 && x.idGroupType == idGroupType).map(x => Number(x.idGroupCategory)).filter(c => c);
        const idGroupCategory = Number(form.get('idGroupCategory').value);
        if (idGroupCategory) {
          return categories_per_group_type.filter(x => !ids_used.includes(x.idGroupCategory) || x.idGroupCategory === Number(idGroupCategory));
        }
        return categories_per_group_type.filter(x => !ids_used.includes(x.idGroupCategory));
      }
    }
    return categories;
  }

  gallery_albums: any[] = [];
}
