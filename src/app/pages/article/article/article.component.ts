import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticuloModel, ArticuloMediaModel, GradientType, ArticleGradientHeaderModel, ArticleHeaderStyle } from '../../../models/ArticuloModel';
import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { ArticuloMediaComponent } from 'src/app/component/articulo-media/articulo-media.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ResizeEvent } from 'angular-resizable-element';
import ImageResize from "quill-image-resize-module";
import * as QuillNamespace from "quill";
import { getFonts } from 'src/app/component/text-editor/quillCustomFontsTest';
import { colors } from "src/app/models/Utility";
import { ContactInboxService } from 'src/app/services/contact-inbox.service';

let Quill: any = QuillNamespace;
Quill.register("modules/imageResize", ImageResize);
const Font: any = Quill.import("formats/font");

const fontSizeArr = ['8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px', '20px', '22px', '24px', '26px', '28px', '32px', '36px', '42px', '48px', '54px', '68px', '72px', '84px', '98px'];

var Size = Quill.import('attributors/style/size');
Size.whitelist = fontSizeArr;
Quill.register(Size, true);


let fontNames = [];
getFonts().then((response: any) => {
  const fonts = response.fonts;
  const font_names = response.fontNames;
  fontNames = response.fontNames
  Font.whitelist = font_names;
  Quill.register(Font, true);
})

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {

  articulo: ArticuloModel;
  loader = true;

  sampleUpdatedDate: any;

  origin: string;
  contactSafeUrl: any;
  mailing_list: any;

  @ViewChild('toPrint') toPrint: HTMLElement;
  @ViewChild('rectangle_sizable') rectangle_sizable: ElementRef;
  @Input('id') id: number;
  @Input('articulo') articulo_input: ArticuloModel;
  @Input('skip_id_as_param') skip_id_as_param: boolean = false;
  @Input('iglesia') iglesia: any;
  @Input('is_preview') is_preview: boolean = false;

  @ViewChildren('article_media') articles_media: QueryList<ArticuloMediaComponent>;

  @Output() dismiss: EventEmitter<any> = new EventEmitter<any>();
  @Output('set_header') set_header: EventEmitter<any> = new EventEmitter<any>();

  title_settings: FormGroup = this.form_builder.group({
    text: new FormControl('Sample'),
    font: new FormControl(''),
    color: new FormControl('#121212'),
    position: new FormControl('center'),
    size: new FormControl(20),
    height: new FormControl(300),
    rich_text: new FormControl(`<p class=\"ql-align-center\"><span class=\"ql-font-arial\" style=\"font-size: 28px; color: rgb(0, 0, 0);\">Sample</span></p>`)
  });

  public modules: any = {
    toolbar: {
      container: [
        [{ font: fontNames }],
        ["blockquote", "code-block"],
        [{ size: fontSizeArr }],
        ["bold", "italic", "underline", "strike"],
        [{ header: 1 }, { header: 2 }],
        [{ color: colors.concat('color-picker_article') }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image"],
      ],
    },
    imageResize: true,
  };

  constructor(
    private domSanitizer: DomSanitizer,
    public route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private form_builder: FormBuilder,
    private contact_inbox_service: ContactInboxService
  ) {
    if (!this.skip_id_as_param) {
      this.id = this.route.snapshot.params['id'];
    }
    this.origin = this.route.snapshot.queryParams.origin;
  }

  get show_picture() {
    if (this.articulo) {
      if (this.articulo.header_style) {
        return this.articulo.header_style.design_style === 'graphic';
      }
      return true;
    }
  }

  get background_style() {
    if (this.articulo) {
      if (this.articulo.header_style) {
        if (this.articulo.header_style.design_style === 'hex') {
          return this.articulo.header_style.color_hex;
        } else {
          const gradient_options: ArticleGradientHeaderModel = this.articulo.header_style.gradient_options as ArticleGradientHeaderModel;
          const gradient_type = gradient_options.type;
          const gradient_style = GradientType[gradient_type];
          let background_formed: string = gradient_style;
          if (gradient_type === 'radial') {
            background_formed = `${background_formed}(circle, `
            const colors = gradient_options.colors.map(x => `rgba(${x.r},${x.g},${x.b},${x.alpha}) ${x.degrees}%`).join(',');
            background_formed = `${background_formed}${colors})`;
          } else {
            background_formed = `${background_formed}(${gradient_options.degrees}deg, `
            const colors = gradient_options.colors.map(x => `rgba(${x.r},${x.g},${x.b},${x.alpha}) ${x.degrees}%`).join(',');
            background_formed = `${background_formed}${colors})`;
          }
          return background_formed
        }
      }
    }
  }

  ngOnInit() {
    if (this.is_preview) {
      this.title_settings.valueChanges.subscribe(d => {
        this.set_header.emit(this.title_settings.value);
      });
    }
    console.log(this.articulo);

    if (this.id) {

      this.api.get(`articulos/getArticuloDetail/${this.id}`, {})
        .subscribe(
          (data: any) => {
            this.articulo = data.articulo;
            setTimeout(() => {
              console.log(this.rectangle_sizable);

              if (this.rectangle_sizable) {
                const width = this.rectangle_sizable.nativeElement.clientWidth;
                const new_height = width / 2.211111111;
                this.title_settings.get('height').setValue(new_height || 350);
              }
            });
            if (JSON.stringify(this.articulo.header_style) == '{}') {
              this.articulo.header_style = new ArticleHeaderStyle();
              this.articulo.header_style.design_style = 'graphic';
            }
            if (this.articulo.template) {
              if ((this.articulo.template.idTemplate == 26 && this.articulo.template.detail_info.link_module_id == 7) ||
                this.articulo.template.idTemplate == 21
              ) {
                this.setContacturl();
              }
            }
            this.loader = false;
            console.log(this.articulo.header_style.title_settings);

            this.title_settings.patchValue(this.articulo.header_style.title_settings);
          });
      this.sampleUpdatedDate = new Date();
    } else {
      setTimeout(() => {
        this.loader = false;
        if (this.articulo_input) {
          this.articulo = this.articulo_input;
          this.title_settings.patchValue(this.articulo.header_style.title_settings);

          this.sanitize();
        }
      }, 0);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (!this.id) {
        this.loader = false;
      }
      if (this.articulo_input) {
        this.articulo = this.articulo_input;
        this.sanitize();
      }
    }, 0);
  }

  sanitize() {
    if (!this.articulo.hasBeenSanitized) {
      const contenido = this.domSanitizer.bypassSecurityTrustHtml(
        this.articulo.contenido
      );
      this.articulo.contenido = contenido;
    }
    this.articulo.hasBeenSanitized = true;
  }

  fixUrl(url: string) {
    if (url) {
      if (url.includes('https')) {
        return url;
      } else {
        return `${this.api.baseUrl}${url}`;
        // return `${environment.serverURL}${url}`;
      }
    }
    if (this.iglesia) {
      if (this.iglesia.portadaArticulos) {
        const path = this.fixUrl(this.iglesia.portadaArticulos);
        return path;
      }
    }
    return '';
    // return 'assets/img/default-image.jpg';
  }

  dismissArticle() {
    this.dismiss.emit(this.articulo.idCategoriaArticulo);
  }

  closeOthers(event) {
    setTimeout(() => {
      const medias = this.articles_media.filter(x => x.articuloMedia.idMediaType === 7 && x.articuloMedia.idArticuloMedia !== event.articulo_media.idArticuloMedia);

      medias.forEach(x => {
        if (x.document_embed) {
          x.document_embed.closeVideo();
        }
      });
    }, 50);
  }

  backToSearch() {
    this.router.navigateByUrl(`/organization-profile/main/${this.articulo.idIglesia}/inicio`);
  }

  async setContacturl() {
    this.loader = true;
    let id;
    if (this.articulo.template.idTemplate == 26) {
      id = this.articulo.template.detail_info.element_id;
    } else {
      id = this.articulo.template.mailing_list_info.idMailingList;
    }
    const contact_inbox = {
      id,
      contact_language: 'es'
    };
    this.mailing_list = await this.contact_inbox_service.getContactInboxDetail(id, { idOrganization: this.articulo.idIglesia })
      .toPromise()
      .catch(error => {
        console.error(error);
      });
    console.log(this.mailing_list);

    if (this.mailing_list) {
      if (!this.mailing_list.is_v2) {
        let url = `https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/contact_inbox/${contact_inbox.id}?lang=${contact_inbox.contact_language || 'es'}`;
        this.contactSafeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(url)
      }
    } else {
      let url = `https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/contact_inbox/${contact_inbox.id}?lang=${contact_inbox.contact_language || 'es'}`;
      this.contactSafeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(url)
    }
    // this.contact_inbox_embed.idMailingList = contact_inbox.id;
    // this.contact_inbox_embed.getcontact_inbox();
    // if (this.style_settings) {
    //   const style = this.style_settings;
    //   if (style.home_title_text_align) {
    //     url = `${url}&align=${style.home_title_text_align}`;
    //   }
    //   if (style.home_title_text_bold) {
    //     url = `${url}&weight=${style.home_title_text_bold}`;
    //   }
    //   if (style.home_title_text_color) {
    //     url = `${url}&color=${style.home_title_text_color.replace('#', '')}`;
    //   }
    // }
  }


  finishLoad() {
    this.loader = false;
    // if (this.display_load) {
    // } else {
    //   this.loading_finished.emit();
    // }
  }

  async onResizeEnd(event: ResizeEvent) {
    console.log(event);
    this.title_settings.get('height').setValue(event.rectangle.height);
    // // const response: any = await this.organizationService.saveDashboardHeight({
    // //   idOrganization: this.user.idIglesia,
    // //   dashboard_height: this.header_menu_settings.dashboard_height
    // // }).toPromise().catch(error => {
    // //   console.error(error);
    // //   return;
    // // });
    // // if (response) {
    // //   console.log(response);
    // // }
  }

  openPopup() {
    var popup = document.getElementById("popup");
    popup.style.display = "block";
  }

  closePopup() {
    var popup = document.getElementById("popup");
    popup.style.display = "none";
  }

  setText(title_text: string) {
    console.log(title_text);
    this.title_settings.get('rich_text').setValue(title_text);
  }
}
