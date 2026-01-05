import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { loadStripe } from '@stripe/stripe-js/pure';
import { CreatePaymentMethodData, Stripe, StripeCardCvcElement, StripeCardElement, StripeCardExpiryElement, StripeCardExpiryElementChangeEvent, StripeCardNumberElement, StripeCardNumberElementChangeEvent } from '@stripe/stripe-js';
import { ChatLogService } from 'src/app/chat-log.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { StripeErrors } from '../../donations/donations-v2/donations-v2.component';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-billing-payment-methods',
  templateUrl: './billing-payment-methods.component.html',
  styleUrls: ['./billing-payment-methods.component.scss']
})
export class BillingPaymentMethodsComponent implements OnInit {

  @ViewChild('card_info_number') card_info_number: ElementRef;
  @ViewChild('card_info_exp') card_info_exp: ElementRef;
  @ViewChild('card_info_cvv') card_info_cvv: ElementRef;

  @Input('idOrganization') idOrganization: number;
  @Input('hide_title') hide_title: boolean;

  processing: boolean = false;

  current_user: User;
  main_form: FormGroup = this.form_builder.group({
    set_as_default: new FormControl(false),
    payment_methods: new FormArray([])
  });

  payment_methods_arr: any[] = [];

  verifications: {
    number_is_load: boolean;
    exp_is_load: boolean;
    cvv_is_load: boolean;
  } = {
      number_is_load: false,
      exp_is_load: false,
      cvv_is_load: false
    }

  add_new_payment: boolean = false;

  card: StripeCardElement;
  card_number: StripeCardNumberElement;
  card_exp: StripeCardExpiryElement;
  card_cvv: StripeCardCvcElement;
  stripe: Stripe;

  constructor(
    private chat_log_service: ChatLogService,
    private activated_route: ActivatedRoute,
    private form_builder: FormBuilder,
    private user_service: UserService
  ) {
    this.current_user = this.user_service.getCurrentUser();
    if (!this.idOrganization) {
      this.idOrganization = Number(this.activated_route.snapshot.params['idOrganization']);
    }
    if (!this.idOrganization) {
      this.idOrganization = this.current_user.idIglesia;
    }
  }

  get payment_methods() {
    return this.main_form.get('payment_methods') as FormArray;
  }

  get elements_loaded() {
    return this.verifications.cvv_is_load && this.verifications.number_is_load && this.verifications.exp_is_load
  }

  ngOnInit() {
    this.initStripe();
    this.getOrganizationPayments();
    setTimeout(() => {
      this.initCardElement();
    });
  }

  async initStripe() {
    this.stripe = await loadStripe(environment.stripe_key);
  }

  async getOrganizationPayments() {
    const response: any = await this.chat_log_service.getPaymentMethods({
      idOrganization: this.idOrganization
    }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.payment_methods_arr = response;
      while (this.payment_methods.length != 0) {
        this.payment_methods.removeAt(0);
      }
      this.payment_methods_arr.forEach(card => {
        // const card = method.card;
        const payment_info = new FormGroup({
          last4: new FormControl(card.last_4_digits),
          brand: new FormControl(card.brand),
          exp_month: new FormControl(card.exp_month),
          exp_year: new FormControl(card.exp_year),
          id: new FormControl(card.id),
          zip_code: new FormControl(),
          selected: new FormControl(false),
          set_as_default: new FormControl(card.is_default_method)
        });
        this.payment_methods.push(payment_info);
      });
    }
  }

  initCardElement() {
    const elements = this.stripe.elements({
      // clientSecret: this.payment_intent.client_secret
    });
    this.card_number = elements.create('cardNumber', {
      showIcon: true,
      placeholder: '0000 0000 0000 0000',
      iconStyle: 'solid',
      classes: {
        base: 'test_number_only form-control'
      },
      style: {
        base: {
          // Add your base input styles here. For example:
          // fontSize: '14px',
          // color: '#32325d',
          iconColor: '#4d4d4d',
          color: '#4d4d4d',
          fontWeight: '500',
          fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
          fontSize: '17px',
          fontSmoothing: 'antialiased',
          ':-webkit-autofill': {
            color: '#fce883',
          },
          '::placeholder': {
            color: '#c3c3c3',
          },
        },
      }
    });
    this.card_exp = elements.create('cardExpiry', {
      classes: {
        base: 'test_number_only form-control'
      },
      style: {
        base: {
          // Add your base input styles here. For example:
          // fontSize: '14px',
          // color: '#32325d',
          iconColor: '#c4f0ff',
          color: '#4d4d4d',
          fontWeight: '500',
          fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
          fontSize: '17px',
          fontSmoothing: 'antialiased',
          ':-webkit-autofill': {
            color: '#fce883',
          },
          '::placeholder': {
            color: '#c3c3c3',
          },
        },
      },

    });
    this.card_cvv = elements.create('cardCvc', {
      classes: {
        base: 'test_number_only form-control'
      },
      style: {
        base: {
          // Add your base input styles here. For example:
          // fontSize: '14px',
          // color: '#32325d',
          iconColor: '#c4f0ff',
          color: '#4d4d4d',
          fontWeight: '500',
          fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
          fontSize: '17px',
          fontSmoothing: 'antialiased',
          ':-webkit-autofill': {
            color: '#fce883',
          },
          '::placeholder': {
            color: '#c3c3c3',
          },
        },
      }
    });
    this.card_number.mount(this.card_info_number.nativeElement);
    this.card_exp.mount(this.card_info_exp.nativeElement);
    this.card_cvv.mount(this.card_info_cvv.nativeElement);
    this.markAsReady(this.card_number, 'number_is_load', 'cardNumber');
    this.markAsReady(this.card_exp, 'exp_is_load', 'cardExpiry');
    this.markAsReady(this.card_cvv, 'cvv_is_load', 'cardCvc');
    this.card_number.on('change', (event: StripeCardNumberElementChangeEvent) => {
      if (event.complete) {
        this.card_exp.focus();
      }
    });
    this.card_exp.on('change', (event: StripeCardExpiryElementChangeEvent) => {
      if (event.complete) {
        this.card_cvv.focus();
      }
    });
  }

  markAsReady(card_element: any,
    verify_key: string, element_type: 'cardNumber' | 'cardExpiry' | 'cardCvc') {
    card_element.on('ready', (event: { elementType: 'cardCvc' }) => {
      this.verifications[verify_key] = true;
    });
  }

  async addNewPayment() {
    this.processing = true;
    const data: CreatePaymentMethodData = {
      type: 'card',
      card: this.card_number,
    }
    const payment_method = await this.stripe.createPaymentMethod(data);
    if (payment_method.paymentMethod) {
      const card = payment_method.paymentMethod.card;
      let set_as_default;
      if (this.payment_methods.controls.length > 0) {
        set_as_default = this.main_form.get('set_as_default').value;
      } else {
        set_as_default = true;
      }
      const payment_info = new FormGroup({
        last4: new FormControl(card.last4),
        brand: new FormControl(card.brand),
        exp_month: new FormControl(card.exp_month),
        exp_year: new FormControl(card.exp_year),
        id: new FormControl(payment_method.paymentMethod.id),
        zip_code: new FormControl(),
        selected: new FormControl(false),
        set_as_default: new FormControl(set_as_default)
      });
      console.log(payment_method);

      const response: any = await this.chat_log_service.attachPaymentMethod({
        payment_id: payment_method.paymentMethod.id,
        idOrganization: this.idOrganization,
        created_by: this.current_user.idUsuario,
        set_as_default: set_as_default
      }).toPromise();
      if (response.code) {
        let decline_message = StripeErrors[response.message];
        this.chat_log_service.api.showToast(decline_message, ToastType.error);
      } else {
        if (set_as_default) {
          this.payment_methods.controls.forEach(x => {
            x.get('set_as_default').setValue(false);
          });
        }
        payment_info.get('id').setValue(response.id);
        this.payment_methods.push(payment_info);
        // this.getOrganizationPayments();
        this.closeNewCardForm();
      }
    }
    this.processing = false;
  }

  closeNewCardForm() {
    this.card_number.clear();
    this.card_exp.clear();
    this.card_cvv.clear();
    this.main_form.get('set_as_default').setValue(false);
    this.add_new_payment = false;
  }

  selectCard(card: FormGroup) {
    this.payment_methods.controls.forEach(x => {
      x.get('selected').setValue(false);
    });
    card.get('selected').setValue(true);
  }

  async askAndDisable(event, card: FormGroup) {
    console.log(event);
    console.log(card);
    const original_card_default = this.payment_methods.controls.find(x => x.get('set_as_default').value && x.get('id').value != card.get('id').value);
    console.log(original_card_default);

    if (event.target.checked) {
      if (confirm(`Are you sure you want to set this card as your default payment method?`)) {
        this.payment_methods.controls.forEach(x => {
          x.get('set_as_default').setValue(false);
        });
        card.get('set_as_default').setValue(true);
        const payload = {
          id: card.value.id,
          idOrganization: this.idOrganization
        }
        const response: any = await this.chat_log_service.setDefaultPaymentMethod(payload).toPromise().catch(error => {
          console.error(error);
          this.chat_log_service.api.showToast(`Error setting your new default payment method`, ToastType.error);
          if (original_card_default) {
            original_card_default.get('set_as_default').setValue(true);
          }
          card.get('set_as_default').setValue(false);
          return;
        });
        if (response) {
          this.chat_log_service.api.showToast(`Your new default payment method is set.`, ToastType.success);
        }
      } else {
        card.get('set_as_default').setValue(false);
      }
    }
  }

}
