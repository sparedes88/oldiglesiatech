import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from 'src/app/app.component';
import { AddressManagerComponent } from 'src/app/component/address-manager/address-manager/address-manager.component';
import { ToastType } from 'src/app/login/ToastTypes';
import { MailingListExtraDisplaySettings } from 'src/app/models/MailingListModel';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { SyncService } from 'src/app/services/sync.service';

@Component({
  selector: 'app-frame',
  templateUrl: './frame.component.html',
  styleUrls: ['./frame.component.scss']
})
export class FrameComponent implements OnInit {

  @ViewChild('address_manager') address_manager: AddressManagerComponent;

  idArticle: number;

  params: {
    site_id: string;
    idOrganization: number;
    module: 'events' | 'groups' | 'articles' | 'forms' | 'media' | 'donations' | 'galleries' | 'networks' | 'login' | 'colors' | 'containers' | 'locations',
    id?: string;
    is_full_width?: boolean;
  };

  organization: OrganizationModel;

  style: any = {};

  constructor(
    private activated_route: ActivatedRoute,
    private router: Router,
    private sync_service: SyncService,
    private app: AppComponent
  ) {
    this.params = this.activated_route.snapshot.queryParams as any;
    console.log(this.params);
    Object.keys(this.params).forEach(key => {
      if (this.params[key] == 'true' || this.params[key] == 'false') {
        this.style[key] = JSON.parse(this.params[key]);
      } else {
        this.style[key] = this.params[key];
      }
    });
  }

  ngOnInit() {
    // this.checkSettings();
    setTimeout(() => {
      this.app.hide_toolbars = true;
      const body = document.querySelector('body');
      body.classList.add('transparent');
    });
  }

  async checkSettings() {
    const response = await this.sync_service.checkOrganization(this.params.idOrganization).toPromise()
      .catch(error => {
        console.error(error);
        this.sync_service.api.showToast(`This frame hasn't set any module`, ToastType.error);
        return;
      });
    if (response) {

    }
  }

  openArticle(event) {
    console.log(event);
    this.idArticle = event.idArticulo;
  }

  dismissAndRedirect() {
    this.idArticle = undefined;
  }

  get organization_location() {
    if (this.address_manager) {
      if (this.address_manager.first_item) {
        return {
          lat: this.address_manager.first_item.value.lat,
          lng: this.address_manager.first_item.value.lng
        }
      }
    }
  }

  get mailing_extra_params(): MailingListExtraDisplaySettings{
    const settings: MailingListExtraDisplaySettings = {
      logo: true, name: true
    };
    if(this.params){
      if(this.params['logo']){
        settings.logo = this.style.logo;
      }
      if(this.params['name']){
        settings.name = this.style.name;
      }
    }
    return settings;
  }

}
