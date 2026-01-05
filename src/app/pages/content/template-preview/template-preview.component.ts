import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { User } from 'src/app/interfaces/user';
import { ArticleGradientHeaderModel, ArticuloModel, GradientType } from 'src/app/models/ArticuloModel';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-template-preview',
  templateUrl: './template-preview.component.html',
  styleUrls: ['./template-preview.component.scss']
})
export class TemplatePreviewComponent implements OnInit, OnChanges {

  @ViewChild('scroll_container') scroll_container: ElementRef;
  @ViewChild('row_container') row_container: ElementRef;

  @Input('tab') tab: any = {};

  scroll_height: string = 'calc(375px/2)';

  organization: Partial<OrganizationModel> = {};

  constructor(
    private sanitizer: DomSanitizer,
    private user_service: UserService
  ) {
  }

  ngOnInit() {

    const user: User = this.user_service.getCurrentUser();
    this.organization = {
      Nombre: user.iglesia,
      portadaArticulos: this.tab.portadaArticulos
    };

    const element = document.getElementById('preview_template');
    const elementWidth = element.offsetWidth;
    document.documentElement.style.setProperty('--element-width', elementWidth + 'px');

    setTimeout(() => {
      if (this.scroll_container) {
        console.log(this.scroll_container);

        const native_element = this.scroll_container.nativeElement;
        console.log(this.row_container.nativeElement.offsetHeight);

        const height = `${this.row_container.nativeElement.offsetHeight}px`;
        native_element.style.height = height;
        this.scroll_height = `${height}`;
      }
    }, 250);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    console.log(this.tab);
  }

  sub_background_style(article) {
    if (article.header_style) {
      if (article.header_style.design_style === 'hex') {
        return article.header_style.color_hex;
      } else {
        const gradient_options: ArticleGradientHeaderModel = article.header_style.gradient_options as ArticleGradientHeaderModel;
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

  getTitle(article: ArticuloModel): SafeHtml {
    if (!article.hasBeenSanitized) {
      article.original_description = article.header_style.title_settings.rich_text;
      if (article.header_style.title_settings.rich_text) {
        let content_fixed = article.header_style.title_settings.rich_text.replace(/&lt;/gm, '<').replace(/&gt;/gm, '>');
        const sanitized_content = this.sanitizer.bypassSecurityTrustHtml(content_fixed);
        article.hasBeenSanitized = true;
        article.sanitize_description = sanitized_content;
        // setTimeout(() => {
        //   this.fixFrameStyle();
        // });
      }
    }
    return article.sanitize_description;
  }


  fixUrl(url: string) {
    if (url) {
      if (url.includes('https')) {
        return url;
      } else {
        // return `${environment.serverURL}/${url}`;
        return `${environment.serverURL}${url}`;
      }
    } else {
      return 'assets/img/default-image.jpg';
    }
  }

}
