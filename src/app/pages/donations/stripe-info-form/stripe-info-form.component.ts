import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { ToastType } from 'src/app/login/ToastTypes';
import { StripeInfoModel } from '../donation.model';

@Component({
  selector: 'app-stripe-info-form',
  templateUrl: './stripe-info-form.component.html',
  styleUrls: ['./stripe-info-form.component.scss']
})
export class StripeInfoFormComponent implements OnInit {

  @Input('idOrganization') idOrganization: number;
  @Output('on_close') on_close: EventEmitter<any> = new EventEmitter<any>();

  providedTokens: Partial<StripeInfoModel> = {
    hasPublicKey: false,
    hasSecretKey: false
  };
  stripe: Stripe;
  stripe_info = {
    public_key: "",
    secret_key: "",
    valid_public_key: 0,
    valid_secret_key: 0
  }
  is_busy: boolean = false;

  constructor(
    private api: ApiService
  ) { }

  ngOnInit() {
  }

  async initializeStripe() {
    if (this.stripe_info.public_key.startsWith("pk_live_")) {
      this.stripe =
        await loadStripe(this.stripe_info.public_key)

      await this.stripe.createToken('pii', { personal_id_number: 'test' })
        .then(result => {
          if (result.token) {
            this.stripe_info.valid_public_key = 1
            this.api.showToast('Valid public API Key', ToastType.success);
          }
          // public key is valid :o)
          else {
            console.error("error")
            this.stripe_info.valid_public_key = 2
            this.api.showToast(`Invalid public API Key`, ToastType.error)
          }
          // nope !
        })
    }
  }
  async checkSecretKey() {
    if (this.stripe_info.secret_key.startsWith("sk_live_")) {
      const response = await this.api
        .post(`chat/check_stripe_secret_key`, { key: this.stripe_info.secret_key }).toPromise()
        .catch(error => {
          console.error(error)
          this.stripe_info.valid_secret_key = 2
          this.api.showToast(`Invalid secret API Key`, ToastType.error);
          return;
        });
      if (response) {
        this.stripe_info.valid_secret_key = 1
        this.api.showToast('Valid secret API Key', ToastType.success);
      }
    }
  }

  async submit() {
    this.is_busy = true;
    if (this.stripe_info.public_key.length > 0 &&
      this.stripe_info.secret_key.length > 0) {
      const init = await this.initializeStripe();
      console.log(init);

      console.log(this.stripe_info);
      if (this.stripe_info.valid_public_key == 1) {
        const secret = await this.checkSecretKey();
        console.log(secret);
        console.log(this.stripe_info);
        if (this.stripe_info.valid_secret_key == 1) {
          this.api
            .post(`iglesias/saveStripeKeys`, {
              idIglesia: this.idOrganization,
              publicKey: this.stripe_info.public_key,
              secretKey: this.stripe_info.secret_key
            })
            .subscribe(
              (data: any) => {
                this.is_busy = false;
                this.on_close.emit(true)
                this.api.showToast('API Key successfully saved.', ToastType.success);
              },
              (err) => {
                console.error(err)
                this.is_busy = false;
                this.api.showToast(`Error processing the request.`, ToastType.error)
              }
            );
        } else {
          this.is_busy = false;
        }
        // // .then((value1) => {
        // // }).catch((reason1) => {
        // //   console.error(reason1)
        // //   this.is_busy = false;
        // //   this.api.showToast(`API Keys haven't been saved.`, ToastType.warning)
        // // })
      } else {
        this.is_busy = false;
      }
      // // .then((value) => {
      // // }).catch((reason) => {
      // //   console.error(reason)
      // //   this.is_busy = false;
      // //   this.api.showToast(`API Keys haven't been saved.`, ToastType.warning)
      // // })
    } else {
      this.is_busy = false;
    }
  }

  closeForm() {
    this.on_close.emit();
  }

}
