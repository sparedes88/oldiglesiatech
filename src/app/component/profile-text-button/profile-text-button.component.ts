import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { HeaderMenuSettingModel } from 'src/app/pages/organization-profile/organization-profile.component';
import { GroupsService } from 'src/app/services/groups.service';
import { ProfileTextContainerModel } from 'src/app/component/text-container/profile-text-container/profile-text-container.component';

@Component({
  selector: 'app-profile-text-button',
  templateUrl: './profile-text-button.component.html',
  styleUrls: ['./profile-text-button.component.scss']
})
export class ProfileTextButtonComponent implements OnInit {

  @Input('idOrganization') idOrganization: number;
  @Input('style') style: HeaderMenuSettingModel;
  @Input('text_container') text_container: FormGroup;
  @Input('first_column') first_column: any;
  @Input('is_model') is_model: boolean;

  @Output('on_add') on_add: EventEmitter<any> = new EventEmitter<any>();

  current_user: User;

  form: FormGroup = this.form_builder.group({
    type: new FormControl(undefined, [Validators.required]),
    has_text: new FormControl(false, [Validators.required]),
    color_background: new FormControl(''),
    color_text: new FormControl(''),
    text: new FormControl('Button', [Validators.required]),
    src_background: new FormControl('/assets/img/btn_src.png'),
    border_radius: new FormControl(10, [Validators.required, Validators.min(0), Validators.max(30)]),
    placement: new FormControl('', [Validators.required]),
    link_type: new FormControl(undefined, [Validators.required]),
    link: new FormControl('', [Validators.required]),
    internal_link: new FormControl('', []),
    width: new FormControl(222),
    height: new FormControl(48),
    internal_module: new FormControl(''),
    internal_header: new FormControl(''),
    internal_category: new FormControl(''), //for article
    internal_id: new FormControl('')
  })

  internal_options = [
    {
      idModule: 10,
      id: 'category',
      name: 'Category Type',
      path: '/organization-profile/main/{idOrganization}/{page}/us/{id}'
    },
    {
      idModule: 201,
      id: 'article',
      name: 'Specific Article',
      path: '/article/{id}'
    },
    {
      idModule: 7,
      id: 'form',
      name: 'Form',
      path: '/organization-profile/main/{idOrganization}/{page}/{slug}/{id}'
    },
    {
      idModule: 9,
      id: 'playlist',
      name: 'Media',
      path: '/organization-profile/main/{idOrganization}/{page}/{slug}/{id}'
    },
    {
      idModule: 8,
      name: 'Directory',
      path: '/organization-profile/main/{idOrganization}/{page}/{slug}/{id}'
    },
    {
      idModule: 6,
      name: 'Gallery',
      path: '/organization-profile/main/{idOrganization}/{page}/{slug}/{id}'
    },
    {
      idModule: 5,
      name: 'Groups',
      path: '/organization-profile/main/{idOrganization}/{page}/{slug}/{id}'
    },
    {
      idModule: 3,
      name: 'Events',
      path: '/organization-profile/main/{idOrganization}/{page}/{slug}/{id}'
    },
    {
      idModule: 4,
      name: 'Donations',
      path: '/organization-profile/main/{idOrganization}/{page}/{slug}/{id}'
    },
    {
      idModule: 200,
      name: 'Networks',
      path: '/organization-profile/main/{idOrganization}/{page}/{slug}/{id}'
    },
  ]

  profile_tabs: any[] = [];

  constructor(
    private form_builder: FormBuilder,
    private user_service: UserService,
    private fus: FileUploadService,
    private organization_service: OrganizationService,
    private group_service: GroupsService
  ) {
    this.current_user = this.user_service.getCurrentUser();
  }

  ngOnInit() {
    this.getTabs();
    this.form.get('link').setValue(`https://iglesia-tech-api.e2api.com/api/redirect/${this.idOrganization}`);
    console.log(this.style);
    console.log(this.text_container);
    if (this.style) {
      this.form.get('color_background').setValue(this.style.background_color);
      this.form.get('color_text').setValue(this.style.text_color);
    } else {
      this.form.get('color_background').setValue('#f8f9fa');
      this.form.get('color_text').setValue('#212529');
    }
    console.log(this.form);
  }

  supported_modules = [2, 3, 4, 5, 6, 7, 8, 9, 10];

  async getTabs() {
    const response: any = await this.organization_service.api.get(`iglesias/headers`, {
      idIglesia: this.idOrganization,
      extended: true,
      exclude_empty: true
    }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.profile_tabs = response.profile_tabs;
      this.profile_tabs = this.profile_tabs.filter(x => {
        return this.supported_modules.includes(x.idModule) && x.is_visible;
      });
      this.profile_tabs.forEach(x => {
        x.fixed_id = `${x.id}_${x.idModule}`;
      });
      const tabs_ids = this.profile_tabs.map(x => x.idModule).filter((value, index, self) => self.indexOf(value) === index);;
      console.log(this.profile_tabs);
      tabs_ids.push(200, 201);
      console.log(tabs_ids);
      this.internal_options = this.internal_options.filter(x => tabs_ids.includes(x.idModule));
      console.log(this.internal_options);
    }
  }

  onPrintEvent(event) {
    console.log(event);
    console.log(this.form);
  }

  onChangeLinkType(event) {
    console.log(event);
    console.log(this.form);
    this.form.get('internal_module').setValue('');
    this.form.get('internal_header').setValue('');
    this.form.get('internal_category').setValue('');
    this.form.get('internal_id').setValue('');
    if (!this.is_external) {
      this.form.get('internal_link').setValue('');
    }
  }

  headers: any[] = [];
  options: any[] = [];
  idName: string;
  nameKey: string = 'name';

  async setNextStep() {
    console.log(this.form);
    this.form.get('internal_header').setValue('');
    this.form.get('internal_category').setValue('');
    this.form.get('internal_id').setValue('');
    this.form.get('internal_link').setValue('');
    const idModule = Number(this.form.get('internal_module').value);

    this.headers = this.profile_tabs.filter(x => x.idModule === idModule);
    console.log(idModule);
    let idName: string;
    if (idModule === 200 || idModule === 201) {
      // this.loading = true;
      if (idModule === 200) {
        await this.getNetworks();
        idName = 'id';
        this.nameKey = 'custom_name';
      } else if (idModule === 201) {
        await this.getCategories();
        idName = 'idCategoriaArticulo';
        this.nameKey = 'nombre';
      }
    } else {
      this.nameKey = 'name';
      if (idModule === 2) {
        idName = 'idCategoryArticle';
      }
      else if (idModule === 3) {
        idName = 'idGroupEvent';
      }
      else if (idModule === 4) {
        idName = 'idDonationForm';
      }
      else if (idModule === 5) {
        idName = 'id';
      }
      else if (idModule === 6) {
        idName = 'idGallery';
      }
      else if (idModule === 7) {
        idName = 'idMailingList';
      }
      else if (idModule === 8) {
        idName = 'idCommunityBox';
      }
      else if (idModule === 9) {
        idName = 'idPlaylist';
      }
      else if (idModule === 10) {
        idName = 'id';
      }
    }
    this.idName = idName;
    console.log(this.headers);
    if (this.headers.length === 1) {
      this.form.get('internal_header').setValue(this.headers[0].id);
      this.setHeaderOption();
    }
  }

  async getEvents() {
    const response: any = await this.group_service.getEventsByView(this.idOrganization, 'publish', 1).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.options = [].concat(response.events.custom, response.events.periodic, response.events.standalone);
      this.idName = 'idGroupEvent';
      this.nameKey = 'name';
    }
  }
  async getCategories() {
    const response: any = await this.organization_service.api.get(`articulos/categories/getCategories`,
      {
        idIglesia: this.idOrganization
      }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.headers = response.categories;
      this.headers.forEach(x => {
        x.id = x.idCategoriaArticulo;
        x.name = x.nombre;
      });
    }
  }

  async getNetworks() {
    const payload: {
      idIglesia: number,
      profile?: boolean,
      ezlink?: boolean
    } = {
      idIglesia: this.idOrganization,
      profile: true
    };
    const response: any = await this.organization_service.api.get(`networks/organization`, payload).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.options = response.networks;
    }
    // this.loading = false;
  }

  async setHeaderOption() {
    const idModule = Number(this.form.get('internal_module').value);
    const idProfileTab = Number(this.form.get('internal_header').value);
    if (idModule === 3) {
      await this.getEvents();
      this.nameKey = 'name';
    } else if (idModule === 201) {
      await this.getArticles();
    } else {
      const tab = this.profile_tabs.find(x => x.idModule === idModule && x.id === idProfileTab);
      if (idModule === 10) {
        this.options = [
          {
            name: tab.name,
            id: tab.item_id
          }
        ];
      } else {
        this.options = tab.profile_tab_settings.categories;
      }
    }
    this.form.get('internal_link').setValue('');
    if (this.options.length === 1) {
      console.log(this.options[0]);
      this.form.get('internal_id').setValue(this.options[0][this.idName]);
      this.setOption();
    }
  }

  async getArticles() {
    const idCategoryArticle = Number(this.form.get('internal_header').value);
    const response: any = await this.organization_service.getArticulosByIdCategoryInMainPage(idCategoryArticle, 1000, this.idOrganization, 'alpha_asc').toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.options = response.articulos;
      console.log(this.options);
      this.idName = 'idArticulo';
      this.nameKey = 'titulo';
    }
  }

  setOption() {
    const idModule = Number(this.form.get('internal_module').value);
    const idProfileTab = Number(this.form.get('internal_header').value);
    const id = Number(this.form.get('internal_id').value);
    let link;
    if (this.supported_modules.includes(idModule)) {
      const tab = this.profile_tabs.find(x => x.idModule === idModule && x.id === idProfileTab);
      console.log(tab);
      if (tab) {
        if (tab.idModule === 3) {
          link = `/groups/events/detail/${id}?origin=profile`;
        } else {
          link = `/organization-profile/main/${this.idOrganization}/${tab.fixed_id}/${tab.slug}/${id}`;
        }
        console.log(link);
        this.form.get('internal_link').setValue(link);
      }
    } else if (idModule === 200) {
      // networks
      const network = this.options.find(x => x[this.idName] === id);
      if (network) {
        this.form.get('internal_link').setValue(network.full_site_link);
      }
    } else if (idModule === 201) {
      this.form.get('internal_link').setValue(`/article/${id}?origin=profile`);
    }
  }

  get is_upload() {
    return this.form.get('type').value === 'upload';
  }

  get is_external() {
    return this.form.get('link_type').value === 'external';
  }

  get step_1_filled() {
    return this.form.get('type').valid && (this.is_upload ? this.form.get('src_background').value != '/assets/img/btn_src.png' : true)
  }

  get step_2_filled() {
    return this.form.get('type').valid && this.step_1_filled && (!this.is_upload ?
      this.form.get('color_background').value
      && this.form.get('color_background').value
      && this.form.get('color_text').value
      && this.form.get('text').value
      : true)
  }

  get step_3_filled() {
    return this.step_2_filled && this.form.get('placement').valid;
  }

  get step_4_filled() {
    return this.step_1_filled && this.form.get('link_type').valid;
  }
  get step_5_filled() {
    return this.step_4_filled && this.step_3_filled && ((this.is_external && this.form.get('link').valid) || (!this.is_external && this.form.get('internal_link').value));
  }

  get has_text(): boolean {
    if (this.is_upload) {
      return this.form.get('has_text').value;
    }
    return true;
  }

  get parsed_style() {
    const style = this.getStyle();
    const style_text = Object.keys(style).map(x => {
      return `${x}:${style[x]}`;
    }).join(';');
    return style_text;
  }

  get button_frame() {
    return `
<div class="text-${this.form.get('placement').value}"><a ${!this.is_external ? 'class="src-custom-button-as-internal"' : ''} href="${this.is_external ? this.form.get('link').value : this.internal_url}" target="_blank" rel="noopener noreferrer"><button class="btn btn-button-test" style="${this.parsed_style}">${!this.is_upload ? this.form.get('text').value : ''}</button></a></div>
`
    // return `<div class="text-${this.form.get('placement').value}"><a href="${this.form.get('link').value}" target="_blank" rel="noopener noreferrer"><button class="btn btn-button-test" style="${this.parsed_style}">${!this.is_upload ? this.form.get('text').value : ''}</button></a></div>`
  }

  get internal_url() {
    // return '/organization-profile/main/99999/3951_5/groups/3187';
    return this.form.get('internal_link').value;
  }

  getStyle() {
    const style = this.form.value;
    if (this.is_upload) {
      return {
        'background-image': this.getBackgroundUrl(),
        'width': `${style.width}px`,
        'height': `${style.height}px`,
        'background-position': 'center',
        'background-size': 'cover',
        'background-repeat': 'no-repeat',
        'border-radius': `${style.border_radius}px`
      }
    } else {
      return {
        'width': `${style.width}px`,
        'height': `${style.height}px`,
        'background': `${style.color_background}`,
        'color': `${style.color_text}`,
        'border-radius': `${style.border_radius}px`
      }
    }
  }

  getBackgroundUrl() {
    return `url('${this.form.get('src_background').value}')`;

  }

  async selectAndUploadFile(file: File) {
    const response: any = await this.fus.uploadFile(file, true, 'buttons').toPromise();
    if (response) {
      console.log(response);

      const clean_src = this.fus.cleanPhotoUrl(response.response);
      this.form.get('src_background').setValue(`${environment.serverURL}${clean_src}`)
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
          const percent_ratio = size_column * .60;

          const fixed_size = percent_ratio;
          this.form.get('width').setValue(fixed_size);
          this.form.get('height').setValue(fixed_size * aspect_ratio);
        }
        return true;;
      }
    };
  }

  createButton() {
    const style = this.getStyle();
    console.log(style);
    const style_text = Object.keys(style).map(x => {
      console.log(x);
      return `${x}: ${style[x]}`;
    }).join(';');
    console.log(style_text);

  }

  insertButton() {
    let button_frame_fixed = this.button_frame.replace(/</gm, '&lt;').replace(/>/gm, '&gt;');
    const code_to_add = `
    <br>
    &lt;!-- This is a button --&gt;
    ${button_frame_fixed}
    <br>
    &lt;!-- End of button --&gt;
    <br>
    <br>
    `;
    if (this.is_model) {
      this.on_add.emit(code_to_add);
    } else {
      const form_value: ProfileTextContainerModel = this.text_container.value;
      console.log(form_value);
      if (!form_value.description) {
        form_value.description = '';
      }
      form_value.description += code_to_add;
      console.log(form_value);
      form_value.has_been_sanitize = false;
      form_value.original_description = form_value.description;
      this.text_container.patchValue(form_value);
      // this.clearFrameButtonInput();
      this.on_add.emit(this.button_frame);
    }
  }

}
