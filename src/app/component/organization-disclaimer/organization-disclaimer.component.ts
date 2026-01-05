import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';
import { ProfileTextContainerModel } from 'src/app/component/text-container/profile-text-container/profile-text-container.component';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-organization-disclaimer',
  templateUrl: './organization-disclaimer.component.html',
  styleUrls: ['./organization-disclaimer.component.scss']
})
export class OrganizationDisclaimerComponent implements OnInit {

  @Input('idOrganization') idOrganization: number;
  @Input('handle_as_modal') handle_as_modal: boolean = false;
  @Output('on_close') on_close: EventEmitter<any> = new EventEmitter<any>();

  currentUser: User;
  disclaimer_content: ProfileTextContainerModel;

  constructor(
    private router: Router,
    private userService: UserService,
    private activated_route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private api: ApiService
  ) { }

  get link() {
    return `/organization-profile/main/${this.idOrganization}/inicio`
  }

  async ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    if (!this.idOrganization) {
      if (this.activated_route.snapshot.paramMap.get('idOrganization')) {
        this.idOrganization = Number(this.activated_route.snapshot.paramMap.get('idOrganization'));
      } else {
        if (this.currentUser) {
          this.idOrganization = this.currentUser.idIglesia;
        }
      }
    }
    if (!this.idOrganization) {
      // somwething is wrong
      return;
    }

    //get info
    const params = {
      idOrganization: this.idOrganization,
      section: 'disclaimer'
    }
    const response: any = await this.api.get(`iglesias/sections/filter`, params).toPromise()
      .catch(error => {
        this.close();
        this.api.showToast(`Error getting your settings.`, ToastType.error);
        return;
      });
    if (response) {
      if (response.sections.length > 0) {
        this.disclaimer_content = response.sections[0];
      }
    }
    if (!this.disclaimer_content) {
      this.disclaimer_content = new ProfileTextContainerModel();
      this.disclaimer_content.label = `Thank you!`;
      this.disclaimer_content.display_label = true;
      this.disclaimer_content.description = `<p>Thank you for Joining Iglesia Tech. We are building. Gracias por unirte a la familia de Iglesia Tech, estamos construyendo.</p>`;
    }
  }

  getInfo(): SafeHtml {
    if (this.disclaimer_content) {
      const form_value: ProfileTextContainerModel = this.disclaimer_content;
      if (!form_value.has_been_sanitize) {
        form_value.original_description = form_value.description;
        if (form_value.description) {
          let content_fixed = form_value.description.replace(/&lt;/gm, '<').replace(/&gt;/gm, '>');
          const sanitized_content = this.sanitizer.bypassSecurityTrustHtml(content_fixed);
          this.disclaimer_content.has_been_sanitize = true;
          this.disclaimer_content.sanitize_description = sanitized_content;
          form_value.sanitize_description = sanitized_content;
          setTimeout(() => {
            this.fixFrameStyle();
          });
        }
      }
      return form_value.sanitize_description;
    }
  }

  close() {

    if (this.handle_as_modal) {
      this.on_close.emit();
    } else {
      this.router.navigate([this.link]);
    }
  }

  fixFrameStyle() {
    Array.prototype.forEach.call(document.getElementsByClassName('fix-frame'), element => {
      Array.prototype.forEach.call(element.getElementsByTagName('p'), p => {
        p.classList.add('card-content-fixed');
        Array.prototype.forEach.call(p.getElementsByTagName('iframe'), img => {
          img.style.maxWidth = '100%';
          img.style.height = 'unset';
          img.style.width = '100%';
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

}
