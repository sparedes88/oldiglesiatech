import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MailingListModel } from 'src/app/models/MailingListModel';
import { MailingListViewComponent } from 'src/app/pages/mailing-list/mailing-list-view/mailing-list-view.component';

@Component({
  selector: 'app-profile-contact-inbox-display',
  templateUrl: './profile-contact-inbox-display.component.html',
  styleUrls: ['./profile-contact-inbox-display.component.scss']
})
export class ProfileContactInboxDisplayComponent implements OnInit {

  contactSafeUrl: any;

  @ViewChild('mailing_list_embed') mailing_list_embed: MailingListViewComponent;

  @Input('contact_inboxes') contact_inboxes: MailingListModel[];
  @Input('contact_inboxes_tab') contact_inboxes_tab: MailingListModel[] = [];
  @Input('idOrganization') idOrganization: number;
  @Input('view_mode') view_mode: string;
  @Input('display_load') display_load: boolean = true;
  @Input('style_settings') style_settings: any;

  @Output('loading_finished') loading_finished: EventEmitter<boolean> = new EventEmitter<boolean>();

  // @ViewChild('contact_inbox_embed') contact_inbox_embed: contact_inboxComponent;

  selected_contact_inbox: MailingListModel;
  loading: boolean = true;
  wait_style: boolean = true;

  constructor(
    private dom_sanitizer: DomSanitizer,
    private activated_route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    if (this.contact_inboxes.length === 1) {
      this.selected_contact_inbox = this.contact_inboxes[0];
    } else if (this.contact_inboxes.length > 1) {
      this.selected_contact_inbox = this.contact_inboxes[0];
    }
    const page = this.activated_route.snapshot.paramMap.get('page');
    if (page && (page.endsWith('_7'))) {
      const subpage = this.activated_route.snapshot.paramMap.get('subpage');
      if (subpage === 'contact') {
        const slug = this.activated_route.snapshot.paramMap.get('slug');
        if (slug) {
          const slices = slug.split('-');
          if (slices.length > 0) {
            const idContactInbox = Number(slices[0]);

            if (!Number.isNaN(idContactInbox)) {
              const gallery = this.contact_inboxes.find(x => x.id === idContactInbox);
              this.selected_contact_inbox = Object.assign({}, gallery);
            }
          }
        }
      } else {
        if (this.selected_contact_inbox) {
          this.router.navigateByUrl(`${this.actual_page}/${this.selected_contact_inbox.id}`)
        }
      }
    }
    let url = `https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/contact_inbox/${this.selected_contact_inbox.id}?lang=${this.selected_contact_inbox.contact_language || 'es'}`;
    if (this.style_settings) {
      const style = this.style_settings;
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
    this.contactSafeUrl = this.dom_sanitizer.bypassSecurityTrustResourceUrl(url)
    setTimeout(() => {
      this.setStyle();
    }, 100);
  }

  setStyle() {

    this.wait_style = true;
    if (this.contact_inboxes_tab.length > 0) {
      this.contact_inboxes.forEach(x => {
        const full_cat = this.contact_inboxes_tab.find(cat => cat.idMailingList === x.id)
        if (full_cat) {
          full_cat.is_v2 = x.is_v2;
          x.text_align = full_cat.text_align;
          x.background_color = full_cat.background_color;
          x.active_background_color = full_cat.active_background_color;
          x.hover_background_color = full_cat.hover_background_color;
          x.font_color = full_cat.font_color;
          x.font_weight = full_cat.font_weight;
          x.font_style = full_cat.font_style;
          x.font_size = full_cat.font_size;
          x.contact_language = full_cat.contact_language;
        }
      });
      this.wait_style = false;
    } else {
      this.wait_style = false;
    }
  }

  ngOnChanges(change) {
    if (this.contact_inboxes.length === 1) {
      this.selected_contact_inbox = this.contact_inboxes[0];
    }
    if (this.selected_contact_inbox) {
      const same_inbox = this.contact_inboxes.find(x => x.id === this.selected_contact_inbox.id);
      if (same_inbox) {
        if (same_inbox.contact_language !== this.selected_contact_inbox.contact_language) {
          this.loading = true;
          this.selected_contact_inbox.contact_language = same_inbox.contact_language;
          let url = `https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/contact_inbox/${this.selected_contact_inbox.id}?lang=${this.selected_contact_inbox.contact_language || 'es'}`;
          if (this.style_settings) {
            const style = this.style_settings;
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
          this.contactSafeUrl = this.dom_sanitizer.bypassSecurityTrustResourceUrl(url)
        }
      }
    }
    this.setStyle();
  }

  scroll(direction: number) {
    document.getElementById('scroll-x').scrollLeft += direction;
  }

  setContactInbox(contact_inbox: MailingListModel) {
    this.loading = true;
    this.selected_contact_inbox = contact_inbox;
    if (this.selected_contact_inbox.is_v2) {
      setTimeout(() => {
        this.mailing_list_embed.idMailingList = contact_inbox.id;
        this.mailing_list_embed.getDetail();
        this.loading = false;
      }, 100);
    } else {
      // this.contact_inbox_embed.idMailingList = contact_inbox.id;
      // this.contact_inbox_embed.getcontact_inbox();
      let url = `https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/contact_inbox/${this.selected_contact_inbox.id}?lang=${this.selected_contact_inbox.contact_language || 'es'}`;
      if (this.style_settings) {
        const style = this.style_settings;
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
      this.contactSafeUrl = this.dom_sanitizer.bypassSecurityTrustResourceUrl(url)
    }

  }

  get actual_page() {
    const regex = new RegExp(/^[a-z0-9]+$/i, 'g');
    // const original_slug = `${this.selectedElement.idGroup} ${this.selectedElement.title}`;
    // const slug_ = original_slug.replace(regex, '').toLowerCase().replace(/\./g, '');
    // const slug = this.slugifyValue(slug_);
    const page = this.activated_route.snapshot.paramMap.get('page');
    if (page) {
      const subpage = this.activated_route.snapshot.paramMap.get('subpage');
      if (subpage) {
        return `/organization-profile/main/${this.idOrganization}/${page}/${subpage}`;
      }
      return `/organization-profile/main/${this.idOrganization}/${page}`;
    }
  }

  finishLoad() {
    if (this.display_load) {
      this.loading = false;
    } else {
      this.loading_finished.emit();
    }
  }

}
