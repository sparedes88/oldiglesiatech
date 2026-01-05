import { GalleryModel } from './../../../models/GalleryModel';
import { CommunityBoxModel } from './../../../models/CommunityBoxModel';
import { Component, OnInit, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import { ConfigurationTabTemplateModel, TemplateModel } from 'src/app/models/TemplateModel';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { GroupsService } from 'src/app/services/groups.service';
import { GroupCategoryModel, GroupModel } from 'src/app/models/GroupModel';
import { ToastType } from 'src/app/login/ToastTypes';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';
import { Observable, Subscription } from 'rxjs';
import { MultiSelectComponent, IDropdownSettings } from 'ng-multiselect-dropdown';
import { FormGroup, Validators, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { BookingService } from 'src/app/services/booking.service';
import { BookingModel } from 'src/app/models/BookingModel';
import { environment } from 'src/environments/environment';
import { PlaylistModel } from 'src/app/models/VideoModel';
import { VideosService } from 'src/app/services/videos.service';
import { MailingListModel } from 'src/app/models/MailingListModel';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-select-template',
  templateUrl: './select-template.component.html',
  styleUrls: ['./select-template.component.scss']
})
export class SelectTemplateComponent implements OnInit {

  @Input() template: ConfigurationTabTemplateModel;
  @Output() dismiss_page = new EventEmitter();
  @ViewChild('multi_select') multi_select: MultiSelectComponent;
  @ViewChild('multi_select_bookings') multi_select_bookings: MultiSelectComponent;
  @ViewChild('multi_select_community_boxes') multi_select_community_boxes: MultiSelectComponent;
  @ViewChild('multi_select_playlists') multi_select_playlists: MultiSelectComponent;
  @ViewChild('multi_select_galleries') multi_select_galleries: MultiSelectComponent;
  @ViewChild('multi_select_mailing_list_boxes') multi_select_mailing_list_boxes: MultiSelectComponent;
  @ViewChild('multi_select_subcategories') multi_select_subcategories: MultiSelectComponent;

  template_selected: TemplateModel;
  templates: TemplateModel[] = [];
  categories: GroupCategoryModel[] = [];
  bookings: BookingModel[] = [];
  playlists: PlaylistModel[] = [];
  communityBoxes: CommunityBoxModel[] = [];
  mailingLists: MailingListModel[] = [];
  subcategories_headers: any[] = [];
  galleries: GalleryModel[] = [];
  header_submodules: any[] = [];
  items: any[] = [];

  detail_item_properties: {
    id_key: string,
    name_key: string
  } = {
      id_key: '',
      name_key: ''
    }

  settings_obj = {
    menu_option: 'view',
    submenu_option: 'body'
  }

  tabSelected: string = 'sampleImage';

  currentUser: User;

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
    singleSelection: false,
    idField: 'idPlaylist',
    textField: 'name',
    allowSearchFilter: true,
    clearSearchFilter: true,
    selectAllText: 'Select all',
    unSelectAllText: 'Unselect all'
  };

  select_community_options: IDropdownSettings = {
    singleSelection: false,
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
    display_header_text: [true, [Validators.required]],
    header_text: ['', Validators.required],
    display_subheader_text: [true, [Validators.required]],
    subheader_text: ['', Validators.required],
    background_picture: ['assets/imgs/default-portrait.png', Validators.required],
    giving_buttons: new FormArray([])
  });

  events_template_form: FormGroup = this.formBuilder.group({
    display_register_button: [true, [Validators.required]],
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
    show_tab_searchbar: [true, Validators.required],
    description_text_color: ['#666666', [Validators.required]],
    selected_items: new FormControl(),
    items: new FormArray([])
  });

  groups_template_form: FormGroup = this.formBuilder.group({
    selected_items: new FormControl(),
    items: new FormArray([])
  });

  community_box_template_form: FormGroup = this.formBuilder.group({
    idCommunityBox: ['', Validators.required],
    display_header: [true, [Validators.required]],
    selected_items: new FormControl(),
    items: new FormArray([])
  });

  mailing_list_template_form: FormGroup = this.formBuilder.group({
    idMailingList: ['', Validators.required],
    mailing_language: ['es', Validators.required],
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
    shadow_blur: [1.5, [Validators.required, Validators.min(0)]],
    title_text_bold: ['bolder', [Validators.required]],
    title_text_color: ['#000000', [Validators.required]],
    title_text_align: ['left', [Validators.required]],
    display_description: [false, Validators.required],
    show_tab_searchbar: [true, Validators.required],
    description_text_color: ['#666666', [Validators.required]],
    display_more_button: [false, Validators.required],
    button_more_color: ['#e65100', [Validators.required]],
    display_article_titles: [true, [Validators.required]]
  });

  link_template_form: FormGroup = this.formBuilder.group({
    link_page: ['', Validators.required]
  });

  detail_template_form: FormGroup = this.formBuilder.group({
    parent_module_id: [1, Validators.required],
    parent_id: [undefined, Validators.required],
    link_module_id: new FormControl(0, [Validators.required, Validators.min(1)]),
    element_id: new FormControl(undefined, [Validators.required, Validators.min(1)]),
  });

  subcategories_template_form: FormGroup = this.formBuilder.group({
    selected_items: new FormControl(),
    headers: new FormArray([])
  });

  constructor(
    private iglesiaProvider: OrganizationService,
    private groupProvider: GroupsService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private fus: FileUploadService,
    private bookingService: BookingService,
    private videoService: VideosService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    if (this.template) {
      this.detail_template_form.get('parent_id').setValue(this.template.idConfiguracionTab);
      this.loadTemplates();
    }
    this.groupProvider.api
      .get(`iglesias/getModules`)
      .subscribe((response: any) => {
        this.header_submodules = response.submodules;
        this.header_submodules.unshift({
          id: 0,
          name: ' -- Please select an option --'
        });
      });
  }

  loadTemplates() {
    this.iglesiaProvider.getTemplates()
      .subscribe((response: any) => {
        if (response.msg.Code === 200) {
          this.templates = response.templates;
          this.showPic(this.template.idTemplate);
        } else {
          this.templates = [];
          this.iglesiaProvider.api.showToast(`We couldn't find any template.`, ToastType.info);
        }
      }, error => {
        console.error(error);
        this.iglesiaProvider.api.showToast('Error getting the templates... Please try again', ToastType.error);
      });
  }

  showPic(event) {
    this.template_selected = this.templates.find(tem => tem.idTemplate === event);

    if (event === 10) {
      this.bookingService.api
        .get('iglesias/headers', { idIglesia: this.currentUser.idIglesia, idModule: 5 })
        .subscribe((data: any) => {
          this.categories = data.profile_tabs;
          if (!this.template.group_info) {
            const fake_item: Partial<GroupModel> = {};
            this.template.group_info = fake_item as GroupModel;
          }
          if (!this.template.group_info.items) {
            this.template.group_info.items = [];
          }
          let selected_items: GroupCategoryModel[] = [];
          if (this.template.group_info) {
            selected_items = this.categories.filter(x => this.template.group_info.items.includes(x.id))
          }
          if (this.template.idTemplate === 10) {
            this.multi_select.writeValue(selected_items);
          }
          if (this.template.group_info) {
            this.groups_template_form.patchValue(this.template.group_info);
          } else {
            this.groups_template_form.patchValue({});
          }
          this.groups_template_form.get('selected_items').patchValue(selected_items);
          this.clearGroupsForm();
          if (selected_items.length > 0) {
            const array = this.groups_template_form.get('items') as FormArray;
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
          this.groupProvider.api.showToast(`Error getting groups tab...`, ToastType.error);
          this.categories = [];
        });
      // this.groupProvider.getGroupsCategories(this.currentUser.idIglesia)
      //   .subscribe((data: any) => {
      //     this.categories = data.categories;

      //     if (this.template.idTemplate === 10) {
      //       this.multi_select.writeValue(this.categories.filter(x => (this.template.idGroupCategories as number[]).includes(x.idGroupCategory)));
      //     }
      //   }, error => {
      //     console.error(error);
      //     this.groupProvider.api.showToast(`Error getting groups categories...`, ToastType.error);
      //     this.categories = [];
      //   });
    }
    if (event === 11) {
      this.bookingService.api
        .get('iglesias/headers', { idIglesia: this.currentUser.idIglesia, idModule: 9 })
        .subscribe((data: any) => {
          this.playlists = data.profile_tabs;
          if (!this.template.playlist_info) {
            const fake_item: Partial<PlaylistModel> = {};
            this.template.playlist_info = fake_item as PlaylistModel;
          }
          if (!this.template.playlist_info.items) {
            this.template.playlist_info.items = [];
          }
          let selected_items: PlaylistModel[] = [];
          if (this.template.playlist_info) {
            selected_items = this.playlists.filter(x => this.template.playlist_info.items.includes(x.id))
          }
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
          //   show_tab_searchbar: [true, Validators.required],
          //   description_text_color: ['#666666', [Validators.required]],
          //   selected_items: new FormControl(),
          //   items: new FormArray([])
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
    if (event === 12) {
      this.events_template_form = this.formBuilder.group({
        display_register_button: [true, [Validators.required]],
      });
      if (this.template.events_info) {
        this.events_template_form.patchValue(this.template.events_info);
      } else {
        this.events_template_form.patchValue({});
      }
    }
    if (event === 13) {
      this.giving_template_form = this.formBuilder.group({
        display_header_text: [true, [Validators.required]],
        header_text: ['', Validators.required],
        display_subheader_text: [true, [Validators.required]],
        subheader_text: ['', Validators.required],
        background_picture: ['assets/imgs/default-portrait.png', Validators.required],
        giving_buttons: new FormArray([])
      });
      this.resetFormArray(this.giving_template_form, 'giving_buttons');
      if (this.template.giving_info) {
        const form_array = this.giving_template_form.get('giving_buttons') as FormArray;
        this.template.giving_info.giving_buttons.forEach(button => {
          form_array.push(this.formBuilder.group({
            id: [button.id],
            button_text: ['', Validators.required],
            button_color: ['#E65100', Validators.required],
            donation_url: ['', Validators.required],
          }));
        });
        this.giving_template_form.patchValue(this.template.giving_info);
      } else {
        this.giving_template_form.patchValue({});
      }
    }
    if (event === 14) {
      this.bookingService.getBookingsToShare(this.currentUser.idIglesia)
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
          if (!this.template.community_box_info) {
            const fake_item: Partial<CommunityBoxModel> = {};
            this.template.community_box_info = fake_item as CommunityBoxModel;
          }
          if (!this.template.community_box_info.items) {
            this.template.community_box_info.items = [];
          }
          let selected_items: CommunityBoxModel[] = [];
          if (this.template.community_box_info) {
            selected_items = this.communityBoxes.filter(x => this.template.community_box_info.items.includes(x.id));
          }
          console.log(selected_items);

          if (this.template.idTemplate === 15) {
            this.multi_select_community_boxes.writeValue(selected_items);
          }
          // this.community_box_template_form = this.formBuilder.group({
          //   idCommunityBox: ['', Validators.required],
          //   display_header: [true, [Validators.required]]
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

    if (event === 17 || event === 27) {
      this.grid_template_form = this.formBuilder.group({
        display_header: [false, Validators.required],
        blocks_per_row: [1, [Validators.required, Validators.max(2)]],
        button_border_radius: [25, [Validators.required, Validators.min(0)]],
        button_spacing: [10, [Validators.required, Validators.min(0)]],
        shadow_color: ['#000000', Validators.required],
        shadow_spread: [0.5, [Validators.required, Validators.min(0)]],
        shadow_blur: [1.5, [Validators.required, Validators.min(0)]],
        title_text_bold: ['bolder', [Validators.required]],
        title_text_color: ['#000000', [Validators.required]],
        title_text_align: ['left', [Validators.required]],
        display_description: [false, Validators.required],
        show_tab_searchbar: [true, Validators.required],
        description_text_color: ['#666666', [Validators.required]],
        display_more_button: [false, Validators.required],
        button_more_color: ['#e65100', [Validators.required]],
        display_article_titles: [true, [Validators.required]]
      });
      if (this.template.grid_info) {
        this.grid_template_form.patchValue(this.template.grid_info);
      } else {
        this.grid_template_form.patchValue({});
      }
    }
    if (event === 18) {

      this.link_template_form = this.formBuilder.group({
        link_page: ['', Validators.required]
      });
      if (this.template.link_page) {
        this.link_template_form.patchValue({ link_page: this.template.link_page });
      } else {
        this.link_template_form.patchValue({});
      }

    }

    if (event === 20) {
      this.bookingService.api
        .get('iglesias/headers', { idIglesia: this.currentUser.idIglesia, idModule: 6 })
        .subscribe((data: any) => {
          this.galleries = data.profile_tabs;
          console.log(this.galleries);
          if (!this.template.gallery_info) {
            const fake_item: Partial<GalleryModel> = {};
            this.template.gallery_info = fake_item as GalleryModel;
          }
          if (!this.template.gallery_info.items) {
            this.template.gallery_info.items = [];
          }
          let selected_items: GalleryModel[] = [];
          if (this.template.gallery_info) {
            selected_items = this.galleries.filter(x => this.template.gallery_info.items.includes(x.id));
          }
          if (this.template.idTemplate === 25) {
            this.multi_select_galleries.writeValue(selected_items);
          }
          // this.subcategories_template_form = this.formBuilder.group({
          //   selected_items: new FormControl(),
          //   headers: new FormArray([])
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
          console.log(this.gallery_template_form.value);

        }, error => {
          console.error(error);
          this.groupProvider.api.showToast(`Error getting headers...`, ToastType.error);
          this.galleries = [];
        });
    }
    if (event === 21) {
      this.bookingService.api
        .get('iglesias/headers', { idIglesia: this.currentUser.idIglesia, idModule: 7 })
        .subscribe((data: any) => {
          this.mailingLists = data.profile_tabs;
          console.log(this.mailingLists);
          if (!this.template.mailing_list_info) {
            const mailing_list: Partial<MailingListModel> = {};
            this.template.mailing_list_info = mailing_list as MailingListModel;
          }
          if (!this.template.mailing_list_info.items) {
            this.template.mailing_list_info.items = [];
          }
          let selected_items: MailingListModel[] = [];
          if (this.template.mailing_list_info) {
            selected_items = this.mailingLists.filter(x => this.template.mailing_list_info.items.includes(x.id));
          }
          if (this.template.idTemplate === 21) {
            this.multi_select_mailing_list_boxes.writeValue(selected_items);
          }
          // this.subcategories_template_form = this.formBuilder.group({
          //   selected_items: new FormControl(),
          //   headers: new FormArray([])
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
          console.log(this.mailing_list_template_form.value);

        }, error => {
          console.error(error);
          this.groupProvider.api.showToast(`Error getting headers...`, ToastType.error);
          this.mailingLists = [];
        });
    }
    if (event === 25) {
      this.bookingService.api
        .get('iglesias/headers', { idIglesia: this.currentUser.idIglesia, idModule: 2 })
        .subscribe((data: any) => {
          this.subcategories_headers = data.profile_tabs;
          console.log(this.subcategories_headers);
          let selected_items: any[] = [];
          if (this.template.header_items) {
            selected_items = this.subcategories_headers.filter(x => this.template.header_items.includes(x.id));
          }
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
          console.log(this.subcategories_template_form.value);

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
            parent_module_id: [1, Validators.required],
            parent_id: [this.template.idConfiguracionTab, Validators.required],
            link_module_id: new FormControl(0, [Validators.required, Validators.min(1)]),
            element_id: new FormControl(undefined, [Validators.required, Validators.min(1)]),
          });
          console.log(this.template);

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

  resetFormArray(template_form: FormGroup, array_name: string) {
    const array = template_form.get(array_name) as FormArray;
    while (array.length > 0) {
      array.removeAt(0);
    }
  }

  dismiss(response?) {
    this.dismiss_page.emit(response);
  }

  changeTab(tab_selected: string, idTemplate: number) {
    this.tabSelected = tab_selected;
    this.template.idTemplate = idTemplate;
    this.template_selected = this.templates.find(tem => tem.idTemplate === idTemplate);
    this.showPic(idTemplate);
  }

  saveTemplate(template: TemplateModel | ConfigurationTabTemplateModel) {
    let method: Observable<any>;
    let success_message: string;
    let error_message: string;
    if (this.template.idTemplate === 10) {
      const element_size = this.groups_template_form.get('items').value.length;
      if (element_size === 0) {
        this.groupProvider.api.showToast(`This template need at least one item selected, please fill all the fields.`, ToastType.info);
        return;
      }
      this.template.group_info = this.groups_template_form.value;

      // const groups_categories: number[] = [];
      // this.multi_select.selectedItems.forEach(cat => {
      //   groups_categories.push(cat.id as number);
      // });
      // this.template.idGroupCategories = groups_categories;
      // } else {
      //   this.template.idGroupCategories = [];
    }
    if (this.template.idTemplate === 11) {
      const element_size = this.playlist_template_form.get('items').value.length;
      if (element_size === 0) {
        this.groupProvider.api.showToast(`This template need at least one item selected, please fill all the fields.`, ToastType.info);
        return;
      }
      this.template.playlist_info = this.playlist_template_form.value;
    }
    if (this.template.idTemplate === 12) {
      if (this.events_template_form.invalid) {
        this.groupProvider.api.showToast(`This template need some extra info, please fill all the fields.`, ToastType.info);
        return;
      }
      this.template.events_info = this.events_template_form.value;
    }
    if (this.template.idTemplate === 13) {
      const giving_payload = this.giving_template_form.value;
      if (!giving_payload.display_header_text) {
        this.giving_template_form.setControl('header_text', new FormControl());
      } else {
        this.giving_template_form.setControl('header_text', new FormControl(giving_payload.header_text, [Validators.required]));
      }
      if (!giving_payload.display_subheader_text) {
        this.giving_template_form.setControl('subheader_text', new FormControl());
      } else {
        this.giving_template_form.setControl('subheader_text', new FormControl(giving_payload.subheader_text, [Validators.required]));
      }
      if (this.giving_template_form.value.giving_buttons.length === 0) {
        this.groupProvider.api.showToast(`This template requires at least one button.`, ToastType.info);
        return;
      }
      if (this.giving_template_form.invalid) {
        this.groupProvider.api.showToast(`This template need some extra info, please fill all the fields.`, ToastType.info);
        return;
      }
      this.template.giving_info = this.giving_template_form.value;
    }
    if (this.template.idTemplate === 14) {
      if (this.booking_template_form.invalid) {
        this.groupProvider.api.showToast(`This template need some extra info, please fill all the fields.`, ToastType.info);
        return;
      }
      this.template.booking_info = this.booking_template_form.value;
    }
    if (this.template.idTemplate === 15) {
      const element_size = this.community_box_template_form.get('items').value.length;
      if (element_size === 0) {
        this.groupProvider.api.showToast(`This template need at least one item selected, please fill all the fields.`, ToastType.info);
        return;
      }
      this.template.community_box_info = this.community_box_template_form.value;
    }
    if (this.template.idTemplate === 17 || this.template.idTemplate === 27) {
      if (this.grid_template_form.invalid) {
        this.groupProvider.api.showToast(`This template need some extra info, please fill all the fields.`, ToastType.info);
        return;
      }
      this.template.grid_info = this.grid_template_form.value;
    }
    if (this.template.idTemplate === 18) {
      if (this.link_template_form.invalid) {
        this.groupProvider.api.showToast(`This template need some extra info, please fill all the fields.`, ToastType.info);
        return;
      }
      this.template.link_page = this.link_template_form.get('link_page').value;
    }
    if (this.template.idTemplate === 20) {
      // if (this.gallery_template_form.invalid) {
      //   this.groupProvider.api.showToast(`This template need some extra info, please fill all the fields.`, ToastType.info);
      //   return;
      // }
      // this.template.gallery_info = this.gallery_template_form.value;
      const element_size = this.gallery_template_form.get('items').value.length;
      if (element_size === 0) {
        this.groupProvider.api.showToast(`This template need at least one item selected, please fill all the fields.`, ToastType.info);
        return;
      }
      this.template.gallery_info.items = this.gallery_template_form.get('items').value;
      // this.template.gallery_info.idGallery = this.template.gallery_info.galleries[0].id;
    }
    if (this.template.idTemplate === 21) {
      const element_size = this.mailing_list_template_form.get('items').value.length;
      if (element_size === 0) {
        this.groupProvider.api.showToast(`This template need at least one item selected, please fill all the fields.`, ToastType.info);
        return;
      }
      this.template.mailing_list_info.items = this.mailing_list_template_form.get('items').value;
      // this.template.mailing_list_info.idMailingList = this.template.mailing_list_info.items[0].id;
    } else if (this.template.idTemplate === 25) {
      const element_size = this.subcategories_template_form.get('headers').value.length;
      if (element_size === 0) {
        this.groupProvider.api.showToast(`This template need at least one item selected, please fill all the fields.`, ToastType.info);
        return;
      }
      this.template.header_items = this.subcategories_template_form.get('headers').value;
    } else if (this.template.idTemplate === 26) {
      if (this.detail_template_form.invalid) {
        this.groupProvider.api.showToast(`This template need some extra info, please fill all the fields.`, ToastType.info);
        return;
      }
      this.template.detail_info = this.detail_template_form.value;
    }
    if (this.template.idConfiguracionTabsTemplates) {
      method = this.iglesiaProvider.updateConfiguracionTabTemplate(this.template);
      success_message = `Configuration updated successfully.`;
      error_message = `Error updating the template selected.`;
    } else {
      success_message = `Configuration saved successfully.`;
      error_message = `Error saving the template selected.`;
      method = this.iglesiaProvider.saveConfiguracionTabTemplate(this.template);
    }
    method.subscribe(response => {
      // this.iglesiaProvider.getIglesiaFullData(this.iglesiaProvider._idIglesia).subscribe(data => {
      //   this.iglesiaProvider.iglesia_selected = data["iglesia"];
      //   this.theme.setTheme(this.iglesiaProvider.iglesia_selected["theme"]);
      //   this.stateProvider.set('theme', "theme");
      // })
      this.iglesiaProvider.api.showToast(`${success_message}`, ToastType.success);
      this.dismiss(response);
    }, error => {
      console.error(error);
      this.iglesiaProvider.api.showToast(`${error_message}`, ToastType.error);
    });
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

  fixBooking(event) {
    const booking = this.bookings.find(x => x.idBookingCalendar === event.idBookingCalendar);
    if (booking) {
      const frame_code = `${environment.server_calendar}/preview/${booking.idBookingCalendar}/${btoa(booking.calendar_id)}`;
      this.booking_template_form.get('idBookingCalendar').setValue(event.idBookingCalendar);
      this.booking_template_form.get('preview_url').setValue(frame_code);
    }
  }

  fixGroups(event) {
    const selected_items = this.groups_template_form.value.selected_items;
    console.log(selected_items);

    this.clearGroupsForm();
    if (selected_items.length > 0) {
      const array = this.groups_template_form.get('items') as FormArray;
      selected_items.forEach(x => {
        const group = this.formBuilder.group({
          id: new FormControl('')
        })
        group.patchValue(x);
        array.push(group);
      })
    }
  }

  fixPlaylist(event) {
    // const playlist = this.playlists.find(x => x.idPlaylist === event.idPlaylist);
    // if (playlist) {
    //   this.playlist_template_form.get('idPlaylist').setValue(event.idPlaylist);
    // }
    const selected_items = this.playlist_template_form.value.selected_items;
    console.log(selected_items);

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
    // const booking = this.communityBoxes.find(x => x.id === event.id);
    // if (booking) {
    //   this.community_box_template_form.get('idCommunityBox').setValue(event.id);
    // }
    const selected_items = this.community_box_template_form.value.selected_items;
    console.log(selected_items);

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

  fixMailing(event) {
    // const mailing_list = this.mailingLists.find(x => x.id === event.id);
    // if (mailing_list) {
    //   this.mailing_list_template_form.get('idMailingList').setValue(event.id);
    // }
    const selected_items = this.mailing_list_template_form.value.selected_items;
    console.log(selected_items);

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

  fixSubcategories(event) {
    console.log(event)
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
    console.log(this.subcategories_template_form)
  }

  fixGallery(event) {
    // const gallery = this.galleries.find(x => x.id === event.id);
    // if (gallery) {
    //   this.gallery_template_form.get('idGallery').setValue(event.id);
    // }
    const selected_items = this.gallery_template_form.value.selected_items;
    console.log(selected_items);

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

  clearEventsForm() {
    this.events_template_form.patchValue({
      display_register_button: undefined
    });
  }

  clearPlaylistForm() {
    // this.playlist_template_form.patchValue({
    //   idPlaylist: undefined
    // });
    const items = this.playlist_template_form.get('items') as FormArray;
    while (items.length > 0) {
      items.removeAt(0);
    }
  }

  clearGroupsForm() {
    // this.playlist_template_form.patchValue({
    //   idPlaylist: undefined
    // });
    const items = this.groups_template_form.get('items') as FormArray;
    while (items.length > 0) {
      items.removeAt(0);
    }
  }

  clearCommunityForm() {
    // this.community_box_template_form.patchValue({
    //   idCommunityBox: undefined,
    //   display_header: undefined
    // });
    const items = this.community_box_template_form.get('items') as FormArray;
    while (items.length > 0) {
      items.removeAt(0);
    }
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
    // this.gallery_template_form.patchValue({
    //   idGallery: undefined
    // });
    const galleries = this.gallery_template_form.get('items') as FormArray;
    while (galleries.length > 0) {
      galleries.removeAt(0);
    }
  }

  clearSubcategoriesForm() {

    const headers = this.subcategories_template_form.get('headers') as FormArray;
    while (headers.length > 0) {
      headers.removeAt(0);
    }
  }

  toggleAcceptace(form_group: FormGroup, field: string) {
    const actual_value = form_group.get(field).value;
    form_group.get(field).setValue(!actual_value);
  }

  print(event) {
    console.log(event);
    console.log(this.grid_template_form.value);

  }

  get show_display_description() {
    return this.grid_template_form.get('display_description').value;
  }

  get show_articles_title() {
    return this.grid_template_form.get('display_article_titles').value;
  }

  get show_display_more_button() {
    return this.grid_template_form.get('display_more_button').value;
  }

  get show_display_description_on_playlist() {
    return this.playlist_template_form.get('display_description').value;
  }
  get show_display_more_button_on_playlist() {
    return this.playlist_template_form.get('display_more_button').value;
  }

  get show_header_text_on_giving() {
    return this.giving_template_form.get('display_header_text').value;
  }
  get show_subheader_text_on_giving() {
    return this.giving_template_form.get('display_subheader_text').value;
  }

  get giving_buttons() {
    return this.giving_template_form.get('giving_buttons') as FormArray;
  }

  removeButton(form_array: FormArray, index: number) {
    const control = form_array.at(index);
    if (control.get('id')) {
      const confirmation = confirm(`Are you sure you want to delete this button?`);
      if (confirmation) {
        form_array.removeAt(index);
      }
    } else {
      form_array.removeAt(index);
    }
  }

  addButton(form_array: FormArray) {
    if (form_array.length < 4) {
      form_array.push(this.formBuilder.group({
        button_text: ['', Validators.required],
        button_color: ['#E65100', Validators.required],
        donation_url: ['', Validators.required],
      }));
    } else {
      this.bookingService.api.showToast(`You can't add more than 4 buttons.`, ToastType.info);
    }
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

  translateCategories() {
    const array = [];
    this.items.forEach(item => {
      array.push(item.nombre);
    });
    this.translate.get(array).subscribe(response => {
      const keys = Object.keys(response);
      keys.forEach(key => {
        this.items.find(x => x.nombre === key).nombre = response[key];
      });
    }, error => {
    });
  }
}
