import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';
import { StripeInfoModel } from '../donation.model';
import { DonationCategoryComponent } from '../donation-category/donation-category.component';

@Component({
  selector: 'app-finance-dashboard',
  templateUrl: `./finance-dashboard.component.html`,
  styleUrls: ['./finance-dashboard.component.scss']
})
export class FinanceDashboardComponent implements OnInit {

  @Input('idOrganization') idOrganization: number;
  @ViewChild('donation_category_view') donation_category_view: DonationCategoryComponent;

  current_user: User;
  forms: {
    stripe_info: boolean;
    any_open: boolean;
    how_to: boolean;
    donations_list: boolean;
    donations_categories: boolean;
    form_list: boolean;
  } = {
      stripe_info: false,
      any_open: false,
      how_to: false,
      donations_list: false,
      donations_categories: false,
      form_list: false
    };

  stripe_info: StripeInfoModel = {
      hasPublicKey: false,
      hasSecretKey: false,
      is_possible_client: false
    }
  loaders: {
    general: boolean
  } = {
      general: true
    };

  constructor(
    private api: ApiService,
    private user_service: UserService
  ) {
    this.current_user = this.user_service.getCurrentUser();
  }

  ngOnInit() {
    this.checkStripeInfo();
  }

  get check_stripe_settings() {
    if (this.stripe_info) {
      return this.stripe_info.hasPublicKey && this.stripe_info.hasSecretKey;
    }
    return false;
  }

  async checkStripeInfo() {
    this.loaders.general = true;
    const response: any = await this.api.get('iglesias/getIglesiasProvidedTokens', { idIglesia: this.idOrganization ? this.idOrganization : this.current_user.idIglesia })
      .toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      const keys_info = response.iglesia;
      this.stripe_info = keys_info;

    }
    this.loaders.general = false;
  }

  openForm(key: string){
    Object.keys(this.forms).filter(x => x != key).forEach(x => this.forms[x] = false);
    this.forms[key] = true;
    this.forms.any_open = true;
  }

  async closeForms(event, form_key?: string) {
    if (event && form_key == 'stripe_info') {
      this.checkStripeInfo();
    }
    Object.keys(this.forms).forEach(x => this.forms[x] = false);
  }


}
