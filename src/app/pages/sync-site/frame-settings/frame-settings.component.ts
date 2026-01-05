import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/interfaces/user';
import { RandomService } from 'src/app/services/random.service';
import { UserService } from 'src/app/services/user.service';

import { DudaModuleInstruction, DudaModuleOption, DudaModules } from '../sync-duda.model';
import { environment } from 'src/environments/environment';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { CategoriaArticuloModel } from 'src/app/models/CategoriaArticuloModel';
import { VideosService } from 'src/app/services/videos.service';
import { PlaylistModel } from 'src/app/models/VideoModel';
import { StyleSettingModel } from 'src/app/component/groups-embed/groups-embed.component';
import { ProfileTextContainerModel } from 'src/app/component/text-container/profile-text-container/profile-text-container.component';
import { GalleryAlbumModel, GalleryModel, GalleryViewModes } from 'src/app/models/GalleryModel';
import { MailingListExtraDisplaySettings, MailingListModel } from 'src/app/models/MailingListModel';
import { CommunityBoxModel } from 'src/app/models/CommunityBoxModel';
import { GalleryService } from 'src/app/services/gallery.service';
import { EventTemplateSettingsModel } from 'src/app/component/event-calendar-v2/event-calendar-v2.component';

@Component({
  selector: 'app-frame-settings',
  templateUrl: './frame-settings.component.html',
  styleUrls: ['./frame-settings.component.scss']
})
export class FrameSettingsComponent implements OnInit {

  current_user: User = this.user_service.getCurrentUser();

  options_form: FormGroup = this.form_builder.group({
    module: new FormControl('', [Validators.required]),
    option: new FormControl('', [Validators.required]),
    id: new FormControl('', [Validators.required]),
  });
  styles: any = {
    button_border_radius: 0,
    button_spacing: 0,
    shadow_color: '#000000',
    shadow_spread: 0,
    shadow_blur: 0,
    title_text_bold: 'bolder',
    title_text_color: '#000000',
    title_text_align: 'left',
    display_description: false,
    description_text_color: '#666666',
    display_more_button: false,
    button_more_color: '#e65100',
    display_article_titles: true,
    created_by: [],
    donation_language: 'es',
    col_size: 6,
    load_all: false,
    idGalleryViewMode: 1
  };

  group_style = new StyleSettingModel();
  events_style = new EventTemplateSettingsModel();

  networks_options: {
    icon_only: boolean
  } = {
      icon_only: false
    };
  directory_options: {
    v2: boolean
  } = {
      v2: false
    };

  contact_inbox_options: MailingListExtraDisplaySettings = {
    logo: true,
    name: true
  }

  is_full_width: boolean = false;
  selected_module: DudaModules;
  selected_language: string = 'es';

  excluded_params: string[] = [
    'created_by',
    'categories',
    'title_text',
    'idGalleryViewMode'
  ]

  events_excluded_params: string[] = [
    'default_view',
    'text_color',
    'calendar_header_background',
    'calendar_subheader_background',
    'calendar_subheader_hover',
    'show_attendances',
    'show_capacity'
  ]

  gallery_each_option_form = this.form_builder.group({
    id: new FormControl(undefined, [Validators.required])
  });

  get articles_params() {
    if (this.styles) {
      return Object.keys(this.styles).filter(x => !this.excluded_params.includes(x)).map(x => `${x}=${this.styles[x]}`.replace('#', '%23')).join('&');
    }
    return '';
  }
  get contact_inbox_params() {
    if (this.contact_inbox_options) {
      let params = Object.keys(this.contact_inbox_options).filter(x => !this.excluded_params.includes(x)).map(x => `${x}=${this.contact_inbox_options[x]}`.replace('#', '%23')).join('&');
      if (this.selected_language) {
        params += `${params ? '&' : ''}language=${this.selected_language}`;
      }
      return params;
    }
    return '';
  }
  get group_params() {
    if (this.group_style) {
      let params = Object.keys(this.group_style).filter(x => !this.excluded_params.includes(x) && this.group_style[x]).map(x => `${x}=${this.group_style[x]}`.replace('#', '%23')).join('&');
      if (this.group_style.title_text) {
        params += `&name=${encodeURI(this.group_style.title_text)}`;
      }
      return params;
    }
    return '';
  }
  get events_params() {
    if (this.events_style) {
      let params = Object.keys(this.events_style).filter(x => !this.events_excluded_params.includes(x) && this.events_style[x]).map(x => `${x}=${encodeURI(this.events_style[x])}`.replace('#', '%23')).join('&');
      return params;
    }
    return '';
  }
  get networks_params() {
    if (this.networks_options) {
      return Object.keys(this.networks_options).filter(x => !this.excluded_params.includes(x)).map(x => `${x}=${this.networks_options[x]}`.replace('#', '%23')).join('&');
    }
    return '';
  }

  modules: DudaModules[] = [
    {
      id: 'events',
      name: 'Events',
      support_full_width: false,
      options: [
        {
          value: 'option_1',
          name: 'Use IglesiaTechApp',
          percent: 100,
          instructions: [
            {
              type: 'explanation',
              text: `Edit the collection 'Eventos' inside Content > Collections. Click on the Gear and then in Collection Settings.`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_1_how_to_edit_collection.png',
              classes: 'fix-size'
            },
            {
              type: 'explanation',
              text: `Replace the text {{ID}} for your organization's ID => ${this.current_user.idIglesia}`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_2_replace_endpoint.png',
              classes: 'fix-size fix-size-w'
            },
            {
              type: 'explanation',
              text: 'You should get something like this:'
            },
            {
              type: 'code',
              text: `https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/groups/getEventsByView?idIglesia=${this.current_user.idIglesia}`
            },
            {
              type: 'explanation',
              text: `Click on Refetch Collection and then click Done.

Now add a Photo Gallery Widget.`,
              classes: 'text-wrap'
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_3_add_a_widget.png',
              classes: 'fix-size'
            },
            {
              type: 'explanation',
              text: 'Connect the widget to your collection:'
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_4_connect_to_data.png',
              classes: 'fix-size'
            },
            {
              type: 'explanation',
              text: `Select the 'Eventos' collection and fill the fields as the next image shows. and then click on Done.`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_5_set_collection.png',
              classes: 'fix-size'
            },
            {
              type: 'explanation',
              text: `Use the widget Design options to adjust the desire style.`
            },
          ]
        },
        {
          value: 'option_2',
          name: 'Use iframe (Vue JS)',
          percent: 100,
          instructions: [
            {
              type: 'explanation',
              text: 'Follow this instructions'
            },
            {
              type: 'explanation',
              text: 'First, copy the next code.'
            },
            {
              type: 'code',
              text: '<div id="appEvents"></div>'
            },
            {
              type: 'explanation',
              text: 'Then, copy/paste the next scripts below the previous div.'
            },
            {
              type: 'code',
              text:
                `<script>
  var IDIGLESIA = ${this.current_user.idIglesia}
  var LANG = 'en'
  var SLIDER = false
</script>
<script src="https://cdn.jsdelivr.net/npm/vue@2.5.16/dist/vue.js"></script>
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/flexboxgrid/6.3.1/flexboxgrid.min.css"
/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js"></script>
<link
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap"
  rel="stylesheet"
/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment-with-locales.min.js"></script>
<link rel="stylesheet" href="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/styles" />
<script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/vue-carousel"></script>
<script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/format-events"></script>
<script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/events_v2/scripts"></script>
`
            },
            {
              type: 'explanation',
              text: 'You should have something like this.'
            },
            {
              type: 'code',
              text: `<div id="appEvents"></div>

<script>
  var IDIGLESIA = ${this.current_user.idIglesia}
  var LANG = 'en'
  var SLIDER = false
</script>
<script src="https://cdn.jsdelivr.net/npm/vue@2.5.16/dist/vue.js"></script>
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/flexboxgrid/6.3.1/flexboxgrid.min.css"
/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js"></script>
<link
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap"
  rel="stylesheet"
/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment-with-locales.min.js"></script>
<link rel="stylesheet" href="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/styles" />
<script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/vue-carousel"></script>
<script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/format-events"></script>
<script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/events_v2/scripts"></script>
`
            },
          ]
        },
        {
          value: 'option_3',
          name: 'Use iframe (Angular)',
          percent: 70,
          has_form: true,
          instructions: [
            {
              type: 'explanation',
              text: 'Please copy and paste the following code in the HTML IglesiaTechApp Widget'
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_1c_add_a_widget.png',
              classes: 'fix-size'
            },
            {
              type: 'code',
              text: `<style>
  iframe {
    width: 1px;
    min-width: 100%;
  }
</style>
<script src="${environment.apiUrl}/public/scripts/resizer"></script>
<iframe src="${environment.site_url}/sync-site/frame?idOrganization=${this.current_user.idIglesia}&site_id=none&module={module_name}" id="{generated_id}"></iframe>

<script>
  setTimeout(() => {
    iFrameResize({ log: false }, "#{generated_id}");
  }, 100);
  setInterval(iFrameResize({ log: false }, "#{generated_id}"), 1000);
</script>
`,
              params: () => {
                return {
                  new_text: this.events_params,
                  is_full_width: this.is_full_width,
                  current_user: this.current_user,
                  selected_module: this.options_form.get('module').value
                };
              },
              method({ new_text, is_full_width, current_user, selected_module }) {
                const regex = /<iframe[^>]+src=["'](.*?)["']/;
                const match: string[] = this.text.match(regex);
                if (match && match[1]) {
                  const full_src = match[1];
                  const original_url = full_src.substring(0, full_src.indexOf('?'));
                  let new_url = `${original_url}?idOrganization=${current_user.idIglesia}&site_id=none&module=${selected_module}`
                  if (new_text) {
                    new_url = `${new_url}&${new_text}`;
                  }
                  if (is_full_width) {
                    new_url = `${new_url}&is_full_width=true`;
                  }
                  this.text = this.text.replace(full_src, new_url);
                }
              },
              can_copy: true,
              validation: () => {
                return true;
              }
            }
          ]
        }]
    }, {
      id: 'groups',
      name: 'Groups',
      support_full_width: false,
      options: [
        {
          value: 'option_1',
          name: 'Use IglesiaTechApp',
          instructions: [],
          percent: 0
        },
        {
          value: 'option_2',
          name: 'Use iframe (Vue JS)',
          percent: 100,
          instructions: [
            {
              type: 'explanation',
              text: 'Follow this instructions'
            },
            {
              type: 'explanation',
              text: 'First, copy the next code.'
            },
            {
              type: 'code',
              text: '<div id="groupApp"></div>'
            },
            {
              type: 'explanation',
              text: 'Then, copy/paste the next scripts below the previous div.'
            },
            {
              type: 'code',
              text:
                `<script>
  var IDIGLESIA = ${this.current_user.idIglesia}
  var LANG = 'en'
  var VIEW_TYPE = 'list'
  var HEADER_TEXT_COLOR = '#ffffff'
  var GROUP_TYPE = 2
  var DEGREES = 112
  var MAIN_COLOR = '#e65100'
  var MAIN_PERCENT= 72
  var SECOND_COLOR= '#ffb994'
  var SECOND_PERCENT= 100
  var SHOW_SHADOW= true
  var DISPLAY_HEADER= true
  var ITEMS_PER_ROW= 2
</script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flexboxgrid/6.3.1/flexboxgrid.min.css"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap"/>
<link rel="stylesheet" href="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/styles" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css" integrity="sha384-eOJMYsd53ii+scO/bJGFsiCZc+5NDVN2yr8+0RDqr0Ql0h+rP48ckxlpbzKgwra6" crossorigin="anonymous" />
<script src="https://cdn.jsdelivr.net/npm/vue@2.5.16/dist/vue.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js"></script>
<script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/groups/scripts"></script>
`
            },
            {
              type: 'explanation',
              text: 'You should have something like this.'
            },
            {
              type: 'code',
              text: `<div id="groupApp"></div>

<script>
  var IDIGLESIA = ${this.current_user.idIglesia}
  var LANG = 'en'
  var VIEW_TYPE = 'list'
  var HEADER_TEXT_COLOR = '#ffffff'
  var GROUP_TYPE = 2
  var DEGREES = 112
  var MAIN_COLOR = '#e65100'
  var MAIN_PERCENT= 72
  var SECOND_COLOR= '#ffb994'
  var SECOND_PERCENT= 100
  var SHOW_SHADOW= true
  var DISPLAY_HEADER= true
  var ITEMS_PER_ROW= 2
</script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flexboxgrid/6.3.1/flexboxgrid.min.css"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap"/>
<link rel="stylesheet" href="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/styles" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css" integrity="sha384-eOJMYsd53ii+scO/bJGFsiCZc+5NDVN2yr8+0RDqr0Ql0h+rP48ckxlpbzKgwra6" crossorigin="anonymous" />
<script src="https://cdn.jsdelivr.net/npm/vue@2.5.16/dist/vue.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js"></script>
<script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/groups/scripts"></script>
`
            },
          ]
        },
        {
          value: 'option_3',
          name: 'Use iframe (Angular)',
          percent: 70,
          has_form: true,
          instructions: [
            {
              type: 'explanation',
              text: 'Please copy and paste the following code in the HTML IglesiaTechApp Widget'
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_1c_add_a_widget.png',
              classes: 'fix-size'
            },
            {
              type: 'code',
              text: `<style>
  iframe {
    width: 1px;
    min-width: 100%;
  }
</style>
<script src="${environment.apiUrl}/public/scripts/resizer"></script>
<iframe src="${environment.site_url}/sync-site/frame?idOrganization=${this.current_user.idIglesia}&site_id=none&module={module_name}" id="{generated_id}"></iframe>

<script>
  setTimeout(() => {
    iFrameResize({ log: false }, "#{generated_id}");
  }, 100);
  setInterval(iFrameResize({ log: false }, "#{generated_id}"), 1000);
</script>`,
              params: () => {
                return {
                  new_text: this.group_params,
                  is_full_width: this.is_full_width,
                  current_user: this.current_user,
                  selected_module: this.options_form.get('module').value
                };
              },
              method({ new_text, is_full_width, current_user, selected_module }) {
                const regex = /<iframe[^>]+src=["'](.*?)["']/;
                const match: string[] = this.text.match(regex);
                if (match && match[1]) {
                  const full_src = match[1];
                  const original_url = full_src.substring(0, full_src.indexOf('?'));
                  let new_url = `${original_url}?idOrganization=${current_user.idIglesia}&site_id=none&module=${selected_module}`
                  if (new_text) {
                    new_url = `${new_url}&${new_text}`;
                  }
                  if (is_full_width) {
                    new_url = `${new_url}&is_full_width=true`;
                  }
                  this.text = this.text.replace(full_src, new_url);
                }
              },
              can_copy: true,
              validation: () => {
                if (this.group_style.idGroupViewMode == 1) {
                  return this.group_style.idGroupType ? true : false
                }
                if (this.group_style.idGroupViewMode == 2) {
                  return this.group_style.idGroupCategory ? true : false
                }
                if (this.group_style.idGroupViewMode == 3) {
                  return (this.group_style.idGroupType && this.group_style.idGroupCategory) ? true : false
                }
                return false;
              }
            }
          ]
        }
      ]
    }, {
      id: 'articles',
      name: 'Articles',
      support_full_width: true,
      options: [
        {
          value: 'option_1',
          name: 'Use IglesiaTechApp',
          instructions: [
            {
              type: 'explanation',
              text: `First, create a page for Articles. We were use this later to place our Dynamic Pages under this option.
In this example we choose 'Empty Page', feel free to choose any one you want.`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/categories_1a_1_add_a_page.png',
              classes: 'fix-size'
            },
            {
              type: 'explanation',
              text: 'Create a new Dynamic Page.'
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/categories_1a_2_add_dynamic_page.png',
              classes: 'fix-size'
            },
            {
              type: 'explanation',
              text: `Give a name to your new Dynamic Page. Select the 'Categories' collection.`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/categories_1a_3_set_dynamic_page.png',
              classes: 'text-center'
            },
            {
              type: 'explanation',
              text: `Add a Photo Gallery Widget.`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_3_add_a_widget.png',
              classes: 'fix-size'
            },
            {
              type: 'explanation',
              text: `Connect the widget to your collection 'Articles':`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_4_connect_to_data.png',
              classes: 'fix-size'
            },
            {
              type: 'explanation',
              text: `Fill the fields as the next image shows and then click on Filter & Sort (optional).`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/categories_1a_4_connect_to_data.png',
              classes: 'text-center'
            },
            {
              type: 'explanation',
              text: `Apply your filters to show your articles according your category page.`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/categories_1a_5_filter_for_category.png',
              classes: 'text-center'
            },
            {
              type: 'explanation',
              text: `Use the widget Design options to adjust the desire style.`
            },
            {
              type: 'explanation',
              text: `Now, click on Pages > click on [your page name] engine > Hide/Show in navigation > Show on all`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/categories_1a_6_publish_your_page.png',
              classes: 'fix-size'
            },
            {
              type: 'explanation',
              text: `Select the page created in the step [1], select the 'nombre' field and clic on Save Details.`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/categories_1a_7_set_your_navigation.png',
              classes: 'text-center'
            },
            {
              type: 'explanation',
              text: `Note: Probably you need to republish your site.`
            },
          ],
          percent: 100
        },
        {
          value: 'option_2',
          name: 'Use iframe (Vue JS)',
          percent: 0,
          instructions: []
        },
        {
          value: 'option_3',
          name: 'Use iframe (Angular)',
          percent: 70,
          has_form: true,
          need_call: true,
          function: this.getCategories,
          instructions: [
            {
              type: 'explanation',
              text: 'Please copy and paste the following code in the HTML IglesiaTechApp Widget'
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_1c_add_a_widget.png',
              classes: 'fix-size'
            },
            {
              type: 'code',
              text: `<style>
  iframe {
    width: 1px;
    min-width: 100%;
    min-height: 300px;
  }
</style>
<script src="${environment.apiUrl}/public/scripts/resizer"></script>
<iframe src="${environment.site_url}/sync-site/frame?idOrganization=${this.current_user.idIglesia}&site_id=none&module={module_name}" id="{generated_id}"></iframe>

<script>
  setTimeout(() => {
    iFrameResize({ log: false }, "#{generated_id}");
  }, 100);
  setInterval(iFrameResize({ log: false }, "#{generated_id}"), 1000);
</script>`,
              params: () => {
                return {
                  new_text: this.articles_params,
                  current_user: this.current_user,
                  is_full_width: this.is_full_width,
                  selected_module: this.options_form.get('module').value,
                  id: this.options_form.get('id').value
                };
              },
              method({ new_text, is_full_width, current_user, selected_module, id }) {
                const regex = /<iframe[^>]+src=["'](.*?)["']/;
                const match: string[] = this.text.match(regex);
                if (match && match[1]) {
                  const full_src = match[1];
                  const original_url = full_src.substring(0, full_src.indexOf('?'));
                  let new_url = `${original_url}?idOrganization=${current_user.idIglesia}&site_id=none&module=${selected_module}`
                  if (new_text) {
                    new_url = `${new_url}&${new_text}`;
                  }
                  if (id) {
                    new_url = `${new_url}&id=${id}`;
                  }
                  if (is_full_width) {
                    new_url = `${new_url}&is_full_width=true`;
                  }
                  this.text = this.text.replace(full_src, new_url);
                }
              },
              can_copy: true,
              validation: () => {
                return this.options_form.get('id').value && this.options_form.get('id').valid
              }
            }
          ]
        }
      ]
    },
    {
      id: 'forms',
      name: 'Forms',
      options: [
        //         {
        //           value: 'option_1',
        //           name: 'Use IglesiaTechApp',
        //           instructions: [],
        //           percent: 0
        //         },
        //         {
        //           value: 'option_2',
        //           name: 'Use iframe (Vue JS)',
        //           percent: 100,
        //           need_call: true,
        //           has_form: true,
        //           function: this.getContactInboxes,
        //           instructions: [
        //             {
        //               type: 'explanation',
        //               text: 'Follow this instructions'
        //             },
        //             {
        //               type: 'explanation',
        //               text: 'First, copy the next code.'
        //             },
        //             {
        //               type: 'code',
        //               text: '<div id="mailingListApp"></div>'
        //             },
        //             {
        //               type: 'explanation',
        //               text: 'Then, copy/paste the next scripts below the previous div.'
        //             },
        //             {
        //               type: 'code',
        //               text:
        //                 `<script>
        //   var IDMAILINGLIST = {Your Form ID}
        //   var LANG = '{Your selected lang}'
        // </script>
        // <script src="https://cdn.jsdelivr.net/npm/vue@2.5.16/dist/vue.js"></script>
        // <script src="https://cdn.jsdelivr.net/npm/v-mask/dist/v-mask.min.js"></script>
        // <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js"></script>
        // <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment-with-locales.min.js"></script>
        // <script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/vueCountryCode"></script>
        // <script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/mailingList/scripts"></script>
        // <script src="https://kit.fontawesome.com/a617da3919.js" crossorigin="anonymous"></script>
        // <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flexboxgrid/6.3.1/flexboxgrid.min.css">
        // <link rel="stylesheet" href="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/form_style">
        // <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.8.1/css/bulma.min.css">
        // <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-eOJMYsd53ii+scO/bJGFsiCZc+5NDVN2yr8+0RDqr0Ql0h+rP48ckxlpbzKgwra6" crossorigin="anonymous">
        // `
        //             },
        //             {
        //               type: 'explanation',
        //               text: 'You should have something like this.'
        //             },
        //             {
        //               type: 'code',
        //               text: `<div id="mailingListApp"></div>

        // <script>
        //   var IDMAILINGLIST = {Your Form ID};
        //   var LANG = 'es';
        // </script>
        // <script src="https://cdn.jsdelivr.net/npm/vue@2.5.16/dist/vue.js"></script>
        // <script src="https://cdn.jsdelivr.net/npm/v-mask/dist/v-mask.min.js"></script>
        // <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js"></script>
        // <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment-with-locales.min.js"></script>
        // <script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/vueCountryCode"></script>
        // <script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/mailingList/scripts"></script>
        // <script src="https://kit.fontawesome.com/a617da3919.js" crossorigin="anonymous"></script>
        // <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flexboxgrid/6.3.1/flexboxgrid.min.css">
        // <link rel="stylesheet" href="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/form_style">
        // <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.8.1/css/bulma.min.css">
        // <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-eOJMYsd53ii+scO/bJGFsiCZc+5NDVN2yr8+0RDqr0Ql0h+rP48ckxlpbzKgwra6" crossorigin="anonymous">
        // `,
        //               params: () => {
        //                 return {
        //                   obj: {
        //                     id: this.options_form.get('id').value,
        //                     lang: this.selected_language
        //                   }
        //                 }
        //               },
        //               method({ obj }) {
        //                 if (obj.id) {
        //                   const replace_info = [
        //                     { key: 'var IDMAILINGLIST', field: 'id', type: 'number' },
        //                     { key: 'var LANG', field: 'lang', type: 'text' },
        //                   ];
        //                   replace_info.forEach(item => {
        //                     let value: string;
        //                     value = obj[item.field];
        //                     if (item.type === 'text') {
        //                       value = `'${value}'`;
        //                     }
        //                     const index_item_to_replace = this.text.indexOf(item.key);
        //                     const substring: string = this.text.substring(index_item_to_replace);
        //                     const trim_to_index = substring.indexOf(';');
        //                     const new_value = `${item.key} = ${value};`;
        //                     const old_value = this.text.substring(index_item_to_replace, index_item_to_replace + trim_to_index + 1);
        //                     this.text = this.text.replace(old_value, new_value)
        //                   });
        //                 }
        //               },
        //               can_copy: true,
        //               validation: () => {
        //                 return this.options_form.get('id').value && this.options_form.get('id').valid
        //               }
        //             },

        //           ]
        //         },
        {
          value: 'option_3',
          name: 'Use iframe (Angular)',
          percent: 70,
          has_form: true,
          need_call: true,
          function: this.getContactInboxes,
          instructions: [
            {
              type: 'explanation',
              text: 'Please copy and paste the following code in the HTML IglesiaTechApp Widget'
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_1c_add_a_widget.png',
              classes: 'fix-size'
            },
            {
              type: 'code',
              text: `<style>
  iframe {
    width: 1px;
    min-width: 100%;
    min-height: 300px;
  }
</style>
<script src="${environment.apiUrl}/public/scripts/resizer"></script>
<iframe src="${environment.site_url}/sync-site/frame?idOrganization=${this.current_user.idIglesia}&site_id=none&module={module_name}" id="{generated_id}"></iframe>

<script>
  setTimeout(() => {
    iFrameResize({ log: false }, "#{generated_id}");
  }, 100);
  setInterval(iFrameResize({ log: false }, "#{generated_id}"), 1000);
</script>`,
              params: () => {
                return {
                  new_text: this.contact_inbox_params,
                  current_user: this.current_user,
                  is_full_width: this.is_full_width,
                  selected_module: this.options_form.get('module').value,
                  id: this.options_form.get('id').value
                };
              },
              method({ new_text, is_full_width, current_user, selected_module, id }) {
                const regex = /<iframe[^>]+src=["'](.*?)["']/;
                const match: string[] = this.text.match(regex);
                if (match && match[1]) {
                  const full_src = match[1];
                  const original_url = full_src.substring(0, full_src.indexOf('?'));
                  let new_url = `${original_url}?idOrganization=${current_user.idIglesia}&site_id=none&module=${selected_module}`
                  if (new_text) {
                    new_url = `${new_url}&${new_text}`;
                  }
                  if (id) {
                    new_url = `${new_url}&id=${id}`;
                  }
                  if (is_full_width) {
                    new_url = `${new_url}&is_full_width=true`;
                  }
                  this.text = this.text.replace(full_src, new_url);
                }
              },
              can_copy: true,
              validation: () => {
                return this.options_form.get('id').value && this.options_form.get('id').valid
              }
            }
          ]
        }
      ]
    },
    {
      id: 'media',
      name: 'Media',
      support_full_width: true,
      options: [
        {
          value: 'option_1',
          name: 'Use IglesiaTechApp',
          instructions: [],
          percent: 0
        },
        {
          value: 'option_2',
          name: 'Use iframe (Vue JS)',
          percent: 0,
          instructions: []
        },
        {
          value: 'option_3',
          name: 'Use iframe (Angular)',
          percent: 70,
          has_form: true,
          need_call: false,
          function: this.getProfileMediaTab,
          instructions: [
            {
              type: 'explanation',
              text: 'Please copy and paste the following code in the HTML IglesiaTechApp Widget'
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_1c_add_a_widget.png',
              classes: 'fix-size'
            },
            {
              type: 'code',
              text: `<style>
  iframe {
    width: 1px;
    min-width: 100%;
    min-height: 300px;
  }
</style>
<script src="${environment.apiUrl}/public/scripts/resizer"></script>
<iframe src="${environment.site_url}/sync-site/frame?idOrganization=${this.current_user.idIglesia}&site_id=none&module={module_name}" id="{generated_id}"></iframe>

<script>
  setTimeout(() => {
    iFrameResize({ log: false }, "#{generated_id}");
  }, 100);
  setInterval(iFrameResize({ log: false }, "#{generated_id}"), 1000);
</script>`,
              params: () => {
                return {
                  current_user: this.current_user,
                  is_full_width: this.is_full_width,
                  selected_module: this.options_form.get('module').value,
                  id: this.options_form.get('id').value,
                  sort_type: this.options_form.get('sort_type').value,
                  tab_id: this.options_form.get('tab_id').value
                }
              },
              method({ current_user, is_full_width, selected_module, id, sort_type, tab_id }) {
                const regex = /<iframe[^>]+src=["'](.*?)["']/;
                const match: string[] = this.text.match(regex);
                if (match && match[1]) {
                  const full_src = match[1];
                  const original_url = full_src.substring(0, full_src.indexOf('?'));
                  let new_url = `${original_url}?idOrganization=${current_user.idIglesia}&site_id=none&module=${selected_module}`
                  if (id) {
                    new_url = `${new_url}&id=${id}`;
                  }
                  if (is_full_width) {
                    new_url = `${new_url}&is_full_width=true`;
                  }
                  if (tab_id) {
                    new_url = `${new_url}&tab_id=${tab_id}`;
                  } else {
                    if (sort_type) {
                      new_url = `${new_url}&sort_type=${sort_type}`;
                    }
                  }
                  this.text = this.text.replace(full_src, new_url);
                }
              },
              can_copy: true,
              validation: () => {
                return this.options_form.get('id').value && this.options_form.get('id').valid
              }
            }
          ]
        }
      ]
    },
    {
      id: 'donations',
      name: 'Donations',
      support_full_width: false,
      options: [
        {
          value: 'option_1',
          name: 'Use IglesiaTechApp',
          instructions: [],
          percent: 0
        },
        {
          value: 'option_2',
          name: 'Use iframe (Vue JS)',
          percent: 0,
          instructions: []
        },
        {
          value: 'option_3',
          name: 'Use iframe (Angular)',
          percent: 70,
          instructions: [
            {
              type: 'explanation',
              text: 'Please copy and paste the following code in the HTML IglesiaTechApp Widget'
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_1c_add_a_widget.png',
              classes: 'fix-size'
            },
            {
              type: 'code',
              text: `<style>
  iframe {
    width: 1px;
    min-width: 100%;
  }
</style>
<script src="${environment.apiUrl}/public/scripts/resizer"></script>
<iframe src="${environment.site_url}/sync-site/frame?idOrganization=${this.current_user.idIglesia}&site_id=none&module={module_name}" id="{generated_id}"></iframe>

<script>
  setTimeout(() => {
    iFrameResize({ log: false }, "#{generated_id}");
  }, 100);
  setInterval(iFrameResize({ log: false }, "#{generated_id}"), 1000);
</script>`,
              can_copy: true,
              validation: () => { return true; }
            }
          ]

        }
      ]
    },
    {
      id: 'galleries',
      name: 'Galleries',
      support_full_width: true,
      options: [
        {
          value: 'option_1',
          name: 'Use IglesiaTechApp',
          percent: 100,
          need_call: true,
          function: this.getGalleriesOrAlbums,
          instructions: [
            {
              type: 'explanation',
              text: `Create a collection called 'galleries' inside Content > Collections. Click on the Gear and then in Collection Settings.`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/galleries/galleries_1_how_to_create_collection.png',
              classes: 'fix-size'
            },
            {
              type: 'explanation',
              text: `Copy the next url into de endpoint url: `
            },
            {
              type: 'code',
              text: `https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/galleries/duda_sync/galleries?idOrganization=${this.current_user.idIglesia}`,
              can_copy: true,
              validation: () => {
                return true;
              }
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/galleries/galleries_2_setup_the_collection.png',
              classes: 'fix-size-w text-center'
            },
            {
              type: 'explanation',
              text: `Repeat the same proccess. This time create a collection called gallery_pictures using the next url:`,
              classes: 'text-wrap'
            },
            {
              type: 'code',
              text: `https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/galleries/duda_sync/pictures?idOrganization=${this.current_user.idIglesia}`,
              can_copy: true,
              validation: () => {
                return true;
              }
            },
            {
              type: 'explanation',
              text: `In this new collection we need to set up the proper fields.`,
              classes: 'text-wrap'
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/galleries/galleries_3_picture_collection_fields.png',
              classes: 'fix-size-w text-center'
            },
            {
              type: 'explanation',
              text: `Now we have two options:
A. Create each gallery page (Steps 11-19).
B. Create the galleries as dynamic pages. (Steps 20-37)`
,
              classes: 'text-wrap'
            },
            {
              type: 'explanation',
              text: `A. Add a Photo Gallery Widget.`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_3_add_a_widget.png',
              classes: 'fix-size'
            },
            {
              type: 'explanation',
              text: `A. Connect the widget to your collection 'gallery_pictures':`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_4_connect_to_data.png',
              classes: 'fix-size'
            },
            {
              type: 'explanation',
              text: `A. Fill the fields as the next image shows.`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/galleries/galleries_4_connect_to_data.png',
              classes: 'text-center'
            },
            {
              type: 'selectable',
              text: 'A. Then click on Filter & Sort and apply a static filter. Select idGallery and use the next selectable to get the gallery ID. Then paste this value into the input.',
              elements: ()=> { return this.galleries},
              field_id: 'id',
              field_name:'name',
              option_form: this.gallery_each_option_form,
              value_params: () => {
                return {
                  option_form: this.gallery_each_option_form,
                  field_id: 'id',
                }
              },
              value: ({option_form, field_id }) => {
                console.log(option_form)
                if (option_form.get(field_id).value){
                  return option_form.get(field_id).value;
                }
                return '-- Select an item --';
              },
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/galleries/galleries_5_filter_data_manually.png',
              classes: 'fix-size-w text-center'
            },
            {
              type: 'explanation',
              text: `A. Use the widget Design options to adjust the desire style.`
            },
            {
              type: 'explanation',
              text: `B. First, create a dynamic page for Galleries.`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/galleries/galleries_6_create_empty_page.png',
            },
            {
              type: 'explanation',
              text: `B. Give a name to your new Dynamic Page. Select the 'galleries' collection.`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/galleries/galleries_7_set_dynamic_page.png',
              classes: 'fix-size-w text-center'
            },
            {
              type: 'explanation',
              text: `B. Add a Photo Gallery Widget.`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_3_add_a_widget.png',
              classes: 'fix-size'
            },
            {
              type: 'explanation',
              text: `B. Connect the widget to your collection 'gallery_pictures':`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_4_connect_to_data.png',
              classes: 'fix-size'
            },
            {
              type: 'explanation',
              text: `B. Fill the fields as the next image shows.`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/galleries/galleries_4_connect_to_data.png',
              classes: 'text-center'
            },
            {
              type: 'explanation',
              text: 'B. Then click on Filter & Sort and apply a dynamic filter.',
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/galleries/galleries_8_set_dynamic_data.png',
              classes: 'text-center'
            },
            {
              type: 'explanation',
              text: `B. Use the widget Design options to adjust the desire style.`
            },
            {
              type: 'explanation',
              text: `B. Now, click on Pages > click on [your page name] engine > Hide/Show in navigation > Show on all`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/categories_1a_6_publish_your_page.png',
              classes: 'fix-size-w text-center'
            },
            {
              type: 'explanation',
              text: `B. Select an existing page or create a new one (and repeat step [33] and after), select the 'name' field and clic on Save Details.`
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/galleries/galleries_9_save_info.png',
              classes: 'text-center'
            },
            {
              type: 'explanation',
              text: `B. Note: Probably you need to republish your site.`
            },
          ]
        },
        {
          value: 'option_3',
          name: 'Use iframe (Angular)',
          percent: 70,
          has_form: true,
          need_call: true,
          function: this.getGalleriesOrAlbums,
          instructions: [
            {
              type: 'explanation',
              text: 'Please copy and paste the following code in the HTML IglesiaTechApp Widget'
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_1c_add_a_widget.png',
              classes: 'fix-size'
            },
            {
              type: 'code',
              text: `<style>
  iframe {
    width: 1px;
    min-width: 100%;
    min-height: 300px;
  }
</style>
<script src="${environment.apiUrl}/public/scripts/resizer"></script>
<iframe src="${environment.site_url}/sync-site/frame?idOrganization=${this.current_user.idIglesia}&site_id=none&module={module_name}" id="{generated_id}"></iframe>

<script>
  setTimeout(() => {
    iFrameResize({ log: false }, "#{generated_id}");
  }, 100);
  setInterval(iFrameResize({ log: false }, "#{generated_id}"), 1000);
</script>`,
              params: () => {
                return {
                  current_user: this.current_user,
                  is_full_width: this.is_full_width,
                  selected_module: this.options_form.get('module').value,
                  view_mode: this.styles.idGalleryViewMode,
                  id: this.options_form.get('id').value
                }
              },
              method({ current_user, is_full_width, selected_module, view_mode, id }) {
                const regex = /<iframe[^>]+src=["'](.*?)["']/;
                const match: string[] = this.text.match(regex);
                if (match && match[1]) {
                  const full_src = match[1];
                  const original_url = full_src.substring(0, full_src.indexOf('?'));
                  let new_url = `${original_url}?idOrganization=${current_user.idIglesia}&site_id=none&module=${selected_module}`
                  if (view_mode) {
                    const view_type = GalleryViewModes[`_${view_mode}`];
                    new_url = `${new_url}&view_type=${view_type}`;
                  }
                  if (id) {
                    new_url = `${new_url}&id=${id}`;
                  }
                  if (is_full_width) {
                    new_url = `${new_url}&is_full_width=true`;
                  }
                  this.text = this.text.replace(full_src, new_url);
                }
              },
              can_copy: true,
              validation: () => {
                return this.options_form.get('id').value && this.options_form.get('id').valid
              }
            }
          ]
        }
      ]
    },
    {
      id: 'directories',
      name: 'Directories',
      support_full_width: true,
      options: [
        {
          value: 'option_3',
          name: 'Use iframe (Angular)',
          percent: 70,
          has_form: true,
          need_call: true,
          function: this.getDirectories,
          instructions: [
            {
              type: 'explanation',
              text: 'Please copy and paste the following code in the HTML IglesiaTechApp Widget'
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_1c_add_a_widget.png',
              classes: 'fix-size'
            },
            {
              type: 'code',
              text: `<style>
  iframe {
    width: 1px;
    min-width: 100%;
    min-height: 300px;
  }
</style>
<script src="${environment.apiUrl}/public/scripts/resizer"></script>
<iframe src="${environment.site_url}/sync-site/frame?idOrganization=${this.current_user.idIglesia}&site_id=none&module={module_name}" id="{generated_id}"></iframe>

<script>
  setTimeout(() => {
    iFrameResize({ log: false }, "#{generated_id}");
  }, 100);
  setInterval(iFrameResize({ log: false }, "#{generated_id}"), 1000);
</script>`,
              params: () => {
                return {
                  current_user: this.current_user,
                  is_full_width: this.is_full_width,
                  selected_module: this.options_form.get('module').value,
                  id: this.options_form.get('id').value,
                  v2: this.directory_options.v2
                }
              },
              method({ current_user, is_full_width, selected_module, id, v2 }) {
                const regex = /<iframe[^>]+src=["'](.*?)["']/;
                const match: string[] = this.text.match(regex);
                if (match && match[1]) {
                  const full_src = match[1];
                  const original_url = full_src.substring(0, full_src.indexOf('?'));
                  let new_url = `${original_url}?idOrganization=${current_user.idIglesia}&site_id=none&module=${selected_module}`
                  if (id) {
                    new_url = `${new_url}&id=${id}`;
                  }
                  if (is_full_width) {
                    new_url = `${new_url}&is_full_width=true`;
                  }
                  if (v2) {
                    new_url = `${new_url}&v2=true`;
                  }
                  this.text = this.text.replace(full_src, new_url);
                }
              },
              can_copy: true,
              validation: () => {
                return this.options_form.get('id').value && this.options_form.get('id').valid
              }
            }
          ]
        }
      ]
    },
    {
      id: 'networks',
      name: 'Networks',
      options: [
        {
          value: 'option_1',
          name: 'Use IglesiaTechApp',
          instructions: [],
          percent: 0
        },
        {
          value: 'option_3',
          name: 'Use iframe (Angular)',
          percent: 70,
          has_form: true,
          instructions: [
            {
              type: 'explanation',
              text: 'Please copy and paste the following code in the HTML IglesiaTechApp Widget'
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_1c_add_a_widget.png',
              classes: 'fix-size'
            },
            {
              type: 'code',
              text: `<style>
  iframe {
    width: 1px;
    min-width: 100%;
    min-height: 300px;
  }
</style>
<script src="${environment.apiUrl}/public/scripts/resizer"></script>
<iframe src="${environment.site_url}/sync-site/frame?idOrganization=${this.current_user.idIglesia}&site_id=none&module={module_name}" id="{generated_id}"></iframe>

<script>
  setTimeout(() => {
    iFrameResize({ log: false }, "#{generated_id}");
  }, 100);
  setInterval(iFrameResize({ log: false }, "#{generated_id}"), 1000);
</script>`,
              params: () => {
                return {
                  new_text: this.networks_params,
                  current_user: this.current_user,
                  selected_module: this.options_form.get('module').value
                }
              },
              method({ new_text, current_user, selected_module }) {
                const regex = /<iframe[^>]+src=["'](.*?)["']/;
                const match: string[] = this.text.match(regex);
                if (match && match[1]) {
                  const full_src = match[1];
                  const original_url = full_src.substring(0, full_src.indexOf('?'));
                  let new_url = `${original_url}?idOrganization=${current_user.idIglesia}&site_id=none&module=${selected_module}`
                  if (new_text) {
                    new_url = `${new_url}&${new_text}`;
                  }
                  this.text = this.text.replace(full_src, new_url);
                }
              },
              can_copy: true,
              validation: () => {
                return true
              }
            }
          ]
        }
      ]
    },
    {
      id: 'meetings',
      name: 'Meetings',
      options: [
        {
          value: 'option_3',
          name: 'Use iframe (Angular)',
          percent: 70,
          instructions: [
            {
              type: 'explanation',
              text: 'Please copy and paste the following code in the HTML IglesiaTechApp Widget'
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_1c_add_a_widget.png',
              classes: 'fix-size'
            },
            {
              type: 'code',
              text: `<style>
  iframe {
    width: 1px;
    min-width: 100%;
    min-height: 300px;
  }
</style>
<script src="${environment.apiUrl}/public/scripts/resizer"></script>
<iframe src="${environment.site_url}/sync-site/frame?idOrganization=${this.current_user.idIglesia}&site_id=none&module={module_name}" id="{generated_id}"></iframe>

<script>
  setTimeout(() => {
    iFrameResize({ log: false }, "#{generated_id}");
  }, 100);
  setInterval(iFrameResize({ log: false }, "#{generated_id}"), 1000);
</script>`,
              params: () => {
                return {
                  current_user: this.current_user,
                  selected_module: this.options_form.get('module').value
                }
              },
              method({ current_user, selected_module }) {
                const regex = /<iframe[^>]+src=["'](.*?)["']/;
                const match: string[] = this.text.match(regex);
                if (match && match[1]) {
                  const full_src = match[1];
                  const original_url = full_src.substring(0, full_src.indexOf('?'));
                  let new_url = `${original_url}?idOrganization=${current_user.idIglesia}&site_id=none&module=${selected_module}`;
                  this.text = this.text.replace(full_src, new_url);
                }
              },
              can_copy: true,
              validation: () => {
                return true
              }
            }
          ]
        }
      ]
    },
    {
      id: 'locations',
      name: 'Locations',
      options: [
        {
          value: 'option_3',
          name: 'Use iframe (Angular)',
          percent: 70,
          instructions: [
            {
              type: 'explanation',
              text: 'Please copy and paste the following code in the HTML IglesiaTechApp Widget'
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_1c_add_a_widget.png',
              classes: 'fix-size'
            },
            {
              type: 'code',
              text: `<style>
  iframe {
    width: 1px;
    min-width: 100%;
    min-height: 300px;
  }
</style>
<script src="${environment.apiUrl}/public/scripts/resizer"></script>
<iframe src="${environment.site_url}/sync-site/frame?idOrganization=${this.current_user.idIglesia}&site_id=none&module={module_name}" id="{generated_id}"></iframe>

<script>
  setTimeout(() => {
    iFrameResize({ log: false }, "#{generated_id}");
  }, 100);
  setInterval(iFrameResize({ log: false }, "#{generated_id}"), 1000);
</script>`,
              params: () => {
                return {
                  current_user: this.current_user,
                  selected_module: this.options_form.get('module').value
                }
              },
              method({ current_user, selected_module }) {
                const regex = /<iframe[^>]+src=["'](.*?)["']/;
                const match: string[] = this.text.match(regex);
                if (match && match[1]) {
                  const full_src = match[1];
                  const original_url = full_src.substring(0, full_src.indexOf('?'));
                  let new_url = `${original_url}?idOrganization=${current_user.idIglesia}&site_id=none&module=${selected_module}`;
                  this.text = this.text.replace(full_src, new_url);
                }
              },
              can_copy: true,
              validation: () => {
                return true
              }
            }
          ]
        }
      ]
    },
    {
      id: 'containers',
      name: 'Containers',
      options: [
        {
          value: 'option_3',
          name: 'Use iframe (Angular)',
          percent: 70,
          has_form: true,
          need_call: true,
          function: this.getSections,
          instructions: [
            {
              type: 'explanation',
              text: 'Please copy and paste the following code in the HTML IglesiaTechApp Widget'
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_1c_add_a_widget.png',
              classes: 'fix-size'
            },
            {
              type: 'code',
              text: `<style>
  iframe {
    width: 1px;
    min-width: 100%;
    min-height: 300px;
  }
</style>
<script src="${environment.apiUrl}/public/scripts/resizer"></script>
<iframe src="${environment.site_url}/sync-site/frame?idOrganization=${this.current_user.idIglesia}&site_id=none&module={module_name}" id="{generated_id}"></iframe>

<script>
  setTimeout(() => {
    iFrameResize({ log: false }, "#{generated_id}");
  }, 100);
  setInterval(iFrameResize({ log: false }, "#{generated_id}"), 1000);
</script>`,
              params: () => {
                return {
                  current_user: this.current_user,
                  is_full_width: this.is_full_width,
                  selected_module: this.options_form.get('module').value,
                  id: this.options_form.get('id').value
                }
              },
              method({ current_user, is_full_width, selected_module, id }) {
                const regex = /<iframe[^>]+src=["'](.*?)["']/;
                const match: string[] = this.text.match(regex);
                if (match && match[1]) {
                  const full_src = match[1];
                  const original_url = full_src.substring(0, full_src.indexOf('?'));
                  let new_url = `${original_url}?idOrganization=${current_user.idIglesia}&site_id=none&module=${selected_module}`
                  if (id) {
                    new_url = `${new_url}&id=${id}`;
                  }
                  if (is_full_width) {
                    new_url = `${new_url}&is_full_width=true`;
                  }
                  this.text = this.text.replace(full_src, new_url);
                }
              },
              can_copy: true,
              validation: () => {
                return this.options_form.get('id').value && this.options_form.get('id').valid
              }
            }
          ]
        }
      ]
    },
    {
      id: 'account',
      name: 'Account',
      options: [
        {
          value: 'option_3',
          name: 'Use iframe (Angular)',
          percent: 0,
          instructions: [
            {
              type: 'explanation',
              text: 'Please copy and paste the following code in the HTML IglesiaTechApp Widget'
            },
            {
              type: 'image',
              text: 'assets/img/duda-resources/events_1c_add_a_widget.png',
              classes: 'fix-size'
            },
            {
              type: 'code',
              text: `<style>
  iframe {
    width: 1px;
    min-width: 100%;
    min-height: 300px;
  }
</style>
<script src="${environment.apiUrl}/public/scripts/resizer"></script>
<iframe src="${environment.site_url}/sync-site/frame?idOrganization=${this.current_user.idIglesia}&site_id=none&module={module_name}" id="{generated_id}"></iframe>

<script>
  setTimeout(() => {
    iFrameResize({ log: false }, "#{generated_id}");
  }, 100);
  setInterval(iFrameResize({ log: false }, "#{generated_id}"), 1000);
</script>`,
              params: () => {
                return {
                  current_user: this.current_user,
                  selected_module: this.options_form.get('module').value
                }
              },
              method({ current_user, selected_module }) {
                const regex = /<iframe[^>]+src=["'](.*?)["']/;
                const match: string[] = this.text.match(regex);
                if (match && match[1]) {
                  const full_src = match[1];
                  const original_url = full_src.substring(0, full_src.indexOf('?'));
                  let new_url = `${original_url}?idOrganization=${current_user.idIglesia}&site_id=none&module=${selected_module}`;
                  this.text = this.text.replace(full_src, new_url);
                }
              },
              can_copy: true,
              validation: () => {
                return true
              }
            }
          ]
        }
      ]
    },
    {
      id: 'colors',
      name: 'Colors',
      options: [
        {
          value: 'option_1',
          name: 'Sync with Duda',
          instructions: [],
          percent: 0
        },
        {
          value: 'option_3',
          name: 'Use form',
          percent: 80,
          has_form: true,
          need_call: true,
          function: this.getHeaderSettings,
          instructions: [
            {
              type: 'explanation',
              text: 'Here you can quickly copy any color of your profile header style. Click on the color you need to copy the value.'
            }
          ]
        }
      ]
    },
  ];
  options: DudaModuleOption[] = [];
  selected_option: DudaModuleOption;
  instructions: DudaModuleInstruction[] = [];

  constructor(
    private form_builder: FormBuilder,
    private user_service: UserService,
    private organization_service: OrganizationService,
    private playlist_service: VideosService,
    private gallery_service: GalleryService
  ) { }

  ngOnInit() {

  }

  setOptions() {
    const selected_module = this.options_form.get('module').value;
    this.options_form.get('option').setValue('');
    this.selected_option = undefined;
    const module = this.modules.find(x => x.id === selected_module);
    this.selected_module = module;
    if (module.id === 'media') {
      this.options_form.addControl('type', new FormControl());
      this.options_form.addControl('tab_id', new FormControl());
      this.options_form.addControl('sort_type', new FormControl('date_desc'));
    } else {
      this.options_form.removeControl('type');
      this.options_form.removeControl('tab_id');
      this.options_form.removeControl('sort_type');
    }
    this.options = module.options;
    if (this.options.length === 1) {
      this.options_form.get('option').setValue(this.options[0].value);
      this.setInstructions();
    }
  }

  setInstructions() {
    console.log(this.options_form);
    const selected_option = this.options_form.get('option').value;
    const option = this.options.find(x => x.value === selected_option);
    this.options_form.get('id').setValue('');
    this.selected_option = option;
    this.instructions = option.instructions;
    if (option.name.includes('Angular')) {
      const frame_instruction = this.instructions.find(x => x.text.includes('{module_name}'));
      if (frame_instruction) {
        const id = `id_${RandomService.makeId(5)}`;
        const selected_module = this.options_form.get('module').value;
        frame_instruction.text = frame_instruction.text.replace(/{module_name}/g, selected_module).replace(/{generated_id}/g, id);

      }
    }
    if (option.need_call) {
      option.function.call(this);
    }
  }

  colors: any[] = [];
  categories: CategoriaArticuloModel[] = [];
  playlists: PlaylistModel[] = [];
  media_tabs: any[] = [];
  galleries: GalleryModel[] = [];
  gallery_albums: GalleryAlbumModel[] = [];
  directories: CommunityBoxModel[] = [];
  contact_inboxes: MailingListModel[] = [];
  id: any;
  sections: ProfileTextContainerModel[] = [];

  async getCategories() {
    const response: any = await this.organization_service.getCategoriasArticulos().toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.categories = response.categorias;
    }
  }

  async getProfileMediaTab() {

    const response: any = await this.organization_service.api
      .get('iglesias/headers', { idIglesia: this.current_user.idIglesia, idModule: 9, exclude_empty: true }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.media_tabs = response.profile_tabs;
      if (this.media_tabs.length === 1) {
        this.options_form.get('tab_id').setValue(this.media_tabs[0].id);
        await this.getPlaylistsInTab();
      }
    };
  }

  async getPlaylists() {
    const response: any = await this.playlist_service.getPlaylists().toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.playlists = response.playlists;
    }
  }

  get galleries_or_albums() {
    if (this.styles) {
      if (this.styles.idGalleryViewMode == 1) {
        return this.galleries;
      } else if (this.styles.idGalleryViewMode == 2) {
        return this.gallery_albums;
      }
    }
    return this.galleries;
  }

  async getGalleriesOrAlbums() {
    const response: any = await this.playlist_service.api.get('galleries', { idIglesia: this.current_user.idIglesia }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.galleries = response;
    }
    let params = {
      idOrganization: this.current_user.idIglesia
    }
    const response_albums: any = await this.gallery_service.getAlbums(params).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.gallery_albums = response_albums;
    }
  }


  async getDirectories() {
    const response: any = await this.playlist_service.api.get('communityBox', { idIglesia: this.current_user.idIglesia }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.directories = response;
    }
  }
  async getContactInboxes() {
    const response: any = await this.playlist_service.api.get('mailingList', { idIglesia: this.current_user.idIglesia }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.contact_inboxes = response;
    }
  }

  async getHeaderSettings() {
    let params: Partial<{
      idOrganization: number;
      formatted: boolean;
      extended: boolean
    }> = {
      idOrganization: this.current_user.idIglesia,
      formatted: true,
      extended: true
    }
    const response: any = await this.organization_service.getHeaderStyle(params).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.colors = response.colors;
    }
  }
  async getSections() {
    const params = {
      idOrganization: this.current_user.idIglesia,
    }
    // section: 'disclaimer'
    const response: any = await this.organization_service.api.get(`iglesias/sections/filter`, params).toPromise()
      .catch(error => {
        this.organization_service.api.showToast(`Error getting your settings.`, ToastType.error);
        return;
      });
    if (response) {
      this.sections = response.sections;
    }
  }

  async copyValue(value) {
    const blob = new Blob([value], { type: 'text/plain' })
    await window.navigator['clipboard'].write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ]);
    this.organization_service.api.showToast('Color copied!', ToastType.success);
  }

  printValue(event) {
    console.log(event);
    console.log(this.styles);

  }

  async copyCode(instruction: DudaModuleInstruction) {
    const blob = new Blob([instruction.text], { type: 'text/plain' })
    await window.navigator['clipboard'].write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ]);
    this.organization_service.api.showToast('Code copied!', ToastType.success);
  }

  async onPrintEvent() {
    // getProfileMediaTab
    console.log(this.options_form);
    const type = this.options_form.get('type').value;
    this.options_form.get('tab_id').setValue(undefined);
    this.options_form.get('id').setValue(undefined);
    if (type === 'tab') {
      await this.getProfileMediaTab();
    } else {
      await this.getPlaylists();
    }
  }

  async getPlaylistsInTab() {
    const tab_id = this.options_form.get('tab_id').value;
    const response: any = await this.organization_service.api
      .get(`iglesias/headers/${tab_id}`, { idIglesia: this.current_user.idIglesia }).toPromise()
      .catch(error => {
        console.error(error);
        // this.items = [];
        return;
      });
    console.log(response);
    if (response) {
      const profile_tab = response.profile_tab;
      this.playlists = profile_tab.profile_tab_settings.categories;
    }
  }

  async setSortType() {
    console.log(this.options_form);
    const id = Number(this.options_form.get('id').value);
    const type = this.options_form.get('type').value;
    if (type === 'tab') {
      const selected_playlist = this.playlists.find(x => x.idPlaylist === id);
      if (selected_playlist) {
        this.options_form.get('sort_type').setValue(selected_playlist.sort_type);
      }
    }
  }

  async checkActualViewSetting() {
    this.options_form.get('id').setValue('');
    this.printValue({});
  }

}
