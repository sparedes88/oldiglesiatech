import { ToastType } from 'src/app/login/ToastTypes';
import { Router, ActivatedRoute } from '@angular/router';
import { GroupModel } from './../../models/GroupModel';
import { ApiService } from './../../services/api.service';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { environment } from 'src/environments/environment';
import slugify from 'slugify';

export class StyleSettingModel {
  text_color: string;
  degrees: number;
  main_color: string;
  main_percent: number;
  second_color: string;
  second_percent: number;
  show_shadow: boolean;
  display_header: boolean;
  items_per_row: number;
  col_size: string;
  idGroupType?: number;
  idGroupCategory?: number;
  idGroupViewMode?: number;
  categories?: any[];
  title_text?: string;
  language?: string;

  constructor() {
    this.text_color = "#ffffff";
    this.degrees = 112;
    this.main_color = "#e65100";
    this.main_percent = 72;
    this.second_color = "#ffb994";
    this.second_percent = 100;
    this.show_shadow = true;
    this.display_header = true;
    this.items_per_row = 2;
    this.col_size = 'col-sm-6'
    this.language = 'es';
  }
}

@Component({
  selector: 'app-groups-embed',
  templateUrl: './groups-embed.component.html',
  styleUrls: ['./groups-embed.component.scss']
})
export class GroupsEmbedComponent implements OnInit, OnChanges {

  @Input('idOrganization') idOrganization: number;
  @Input('style_settings') style_settings: StyleSettingModel = {
    text_color: "#ffffff",
    degrees: 112,
    main_color: "#e65100",
    main_percent: 72,
    second_color: "#ffb994",
    second_percent: 100,
    show_shadow: true,
    display_header: true,
    items_per_row: 2,
    col_size: 'col-sm-6'
  }
  @Input('group_type_id') group_type_id: number;
  @Input('group_category_id') group_category_id: number;
  @Input('title') title: string;
  @Input('language') currentLang: string = 'es';
  original_elements: GroupModel[] = [];
  @Input('elements') elements: GroupModel[] = [];
  @Input('element') selectedElement: GroupModel;
  @Input('show_back_button') show_back_button: boolean = true;
  @Input('title_style_settings') title_style_settings: any;
  @Input('make_request') make_request: boolean;

  group_types: {
    idGroupType: number,
    name: string
  }[] = [];
  langDB: any;
  searchValue: string;
  loading: boolean = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.setLanguages();
    // this.getLangs();
    console.log(this.elements);
    console.log(this.style_settings);
    if (this.make_request) {
      await this.getGroups();
    }
    this.getGroupTypes();
    const page = this.route.snapshot.paramMap.get('page');
    if (page && page.endsWith('_5')) {
      const slug = this.route.snapshot.paramMap.get('slug');
      if (slug) {
        const id_name = this.route.snapshot.paramMap.get('id');
        if (id_name) {
          const slices = id_name.split('-');
          if (slices.length > 0) {
            const idGroup = Number(slices[0]);
            console.log(idGroup);

            if (!Number.isNaN(idGroup)) {
              const group = this.original_elements.find(x => x.idGroup === idGroup);
              console.log(group);
              console.log(this.original_elements);
              if (group) {
                this.getSelectedElement(group.idGroup, true);
              } else {
                this.api.showToast(`Error: Group not found.`, ToastType.error)
                this.resetSelectedElement();
              }
            }
          }
        }
      }
    }
  }

  async setLanguages(){
    if (!this.currentLang) {
      const is_locked_or_maintenance = await this.api
      .get(`iglesias/contact_info/getCountryCode`, { idIglesia: this.idOrganization })
      .toPromise()
      .catch(err => { return { country_code: undefined, country: undefined, code_language: undefined} }) as any;

      console.log(is_locked_or_maintenance);
      if(is_locked_or_maintenance.code_language){
        this.currentLang = is_locked_or_maintenance.code_language;
      }
    }

    this.langDB = await this.api
      .get(`public/langs`).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
  }

  ngOnChanges(event) {
    if (event.elements) {
      this.original_elements = [...event.elements.currentValue];
    }

    if (this.group_type_id) {
      this.elements = this.original_elements.filter((x) => {
        return x.idGroupType === Number(this.group_type_id);
      });
    } else {
      this.elements = Object.assign([], this.original_elements);
    }
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

  getGroupTypes() {
    this.loading = true;
    this.api.get(`getFrecuenciasyNivelesDeAcceso?idIglesia=${this.idOrganization}`)
      .subscribe((response: any) => {
        this.group_types = response.groups_types;

        if (this.group_type_id) {
          this.elements = this.original_elements.filter((x) => {
            return x.idGroupType === Number(this.group_type_id);
          });
        }
        this.loading = false;
      }, (error) => {
        console.error(error);
        this.loading = false;
      });
  }

  getSelectedElement(elementId, not_navigate?: boolean) {
    this.loading = true;
    this.api
      .post(`groups/detail/${elementId}`, {
        idIglesia: this.idOrganization,
        idUsuario: 276,
      })
      .subscribe((response: any) => {
        this.selectedElement = response.group;
        if (!not_navigate) {
          const regex = new RegExp(/^[a-z0-9]+$/i, 'g');
          const original_id = `${this.selectedElement.idGroup} ${this.selectedElement.title}`;
          const id_ = original_id.replace(regex, '').toLowerCase().replace(/\./g, '');
          const id = this.slugifyValue(id_);
          const page = this.route.snapshot.paramMap.get('page');
          let url = `organization-profile/main/${this.idOrganization}`
          if (page) {
            url = `${url}/${page}`
            const subpage = this.route.snapshot.paramMap.get('subpage');
            if (subpage) {
              url = `${url}/${subpage}`
              const slug = this.route.snapshot.paramMap.get('slug');
              if (slug) {
                url = `${url}/${slug}`
                if (id) {
                  this.router.navigateByUrl(`/${url}/${id}`);
                }
              }
            }
          }
        }
        this.loading = false;
      }, (error) => {
        console.error(error);
        this.loading = false;
      });
  }

  slugifyValue(text_to_slug: string) {
    return slugify(text_to_slug);
  }

  getPicture(picture) {
    if (!picture) {
      return 'assets/img/default-image.jpg';
    }
    return `${environment.serverURL}${picture}`;
  }

  getCategoriesList(categories) {
    if (categories && categories.length) {
      return categories.map((c) => c.name).join(", ");
    }
  }

  convertTime(time) {
    // Check correct time format and split into components
    if (!time) {
      return "";
    }
    time = time
      .toString()
      .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time.length > 1) {
      // If time format correct
      time = time.slice(1); // Remove full string match value
      time[5] = +time[0] < 12 ? "AM" : "PM"; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join(""); // return adjusted time or original string
  }

  resetSelectedElement() {
    this.selectedElement = undefined;
    const page = this.route.snapshot.paramMap.get('page');
    let url = `/organization-profile/main/${this.idOrganization}`
    if (page) {
      const subpage = this.route.snapshot.paramMap.get('subpage');
      if (subpage) {
        const slug = this.route.snapshot.paramMap.get('slug');
        if (slug) {
          url = `${url}/${page}/${subpage}/${slug}`
        }
      }
    }
    this.router.navigateByUrl(url);
  }

  get page_title() {
    if (this.title) {
      const group_type_name = this.group_types.find(
        (x) => x.idGroupType === Number(this.group_type_id)
      );
      if (group_type_name) {
        return `${this.lang.keys[group_type_name.name]}...`
      }
      return '';
      // return this.title;
    } else {
      const group_type_name = this.group_types.find(
        (x) => x.idGroupType === Number(this.group_type_id)
      );
      if (group_type_name) {
        return `${this.lang.keys[group_type_name.name]}...`
      }
      return '';
    }
  }

  get lang() {
    if (this.langDB && this.currentLang) {
      return this.langDB.find((l) => l.lang == this.currentLang);
    }
    return {
      keys: {},
    };

  }

  get filteredElements() {
    if (this.searchValue) {
      return this.original_elements.filter((element) => {
        return element.title
          .toLowerCase()
          .includes(this.searchValue.toLowerCase());
      });
    }
    return this.original_elements;
  }

  get adjust_col_size() {
    if (this.style_settings.items_per_row === 1) {
      return 'col-8';
    }
    return `col-12`;
  }

  get col_size() {
    if (this.style_settings) {
      const size = 12 / this.style_settings.items_per_row;
      return `col-md-${this.style_settings.items_per_row}`;
    }
    return 'col-md-6';
  }

  getGroups() {
    return new Promise((resolve, reject) => {
      this.loading = true;
      let url = `groups/filter?idIglesia=${this.idOrganization}&type=public`;
      if (this.group_type_id) {
        url = `${url}&group_type=${this.group_type_id}`
      }
      if (this.group_category_id) {
        url = `${url}&category=${this.group_category_id}`
      }
      this.api
        .get(url)
        .subscribe(
          (data: any) => {
            console.log(data);
            this.original_elements = data.groups
            this.loading = false;
            return resolve({});
          },
          (err: any) => {
            this.loading = false;
            return resolve({});
          },
          () => {
            this.loading = false;
            return resolve({});
          }
        );
    })
  }

  getLink(group: GroupModel) {
    if (group.is_external) {
      return group.external_url;
    }
    return `https://iglesiatech.app/register/groups/details/${group.idGroup}?action=register`;
  }

}
