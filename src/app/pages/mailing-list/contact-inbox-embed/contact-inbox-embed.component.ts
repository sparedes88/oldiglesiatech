import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MailingListExtraDisplaySettings, MailingListParams } from 'src/app/models/MailingListModel';
import { ContactInboxService } from 'src/app/services/contact-inbox.service';

@Component({
  selector: 'app-contact-inbox-embed',
  templateUrl: './contact-inbox-embed.component.html',
  styleUrls: ['./contact-inbox-embed.component.scss']
})
export class ContactInboxEmbedComponent implements OnInit {

  @Input('idMailingList') idMailingList: number;
  @Input('idOrganization') idOrganization: number;
  @Input('language') language: string;
  @Input('extra_display_settings') extra_display_settings: MailingListExtraDisplaySettings = {
    logo: true,
    name: true
  }

  mailing_list: any;
  contactSafeUrl: SafeResourceUrl;
  loading: boolean = true;

  constructor(
    private contact_inbox_service: ContactInboxService,
    private dom_sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.getMailingList();
  }

  async getMailingList() {
    const parmas: Partial<MailingListParams> = {
      idOrganization: this.idOrganization
    };
    const response: any = await this.contact_inbox_service.getContactInboxDetail(this.idMailingList, parmas).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      if (!response.is_v2) {
        let url = `https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/contact_inbox/${this.idMailingList}?lang=${this.language || 'es'}`;
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
        if (this.extra_display_settings) {
          Object.keys(this.extra_display_settings).forEach(x => {
            url = `${url}&${x}=${this.extra_display_settings[x]}`
          })
        }
        this.contactSafeUrl = this.dom_sanitizer.bypassSecurityTrustResourceUrl(url);
        this.loading = true;
      }
      this.mailing_list = response;
    }
  }

  finishLoad() {
    this.loading = false;
  }

}
