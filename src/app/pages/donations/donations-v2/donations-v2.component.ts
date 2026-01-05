import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CreatePaymentMethodData, PaymentIntent } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js/pure';
import { Stripe } from '@stripe/stripe-js';
import {
  StripeCardCvcElement,
  StripeCardElement,
  StripeCardExpiryElement,
  StripeCardExpiryElementChangeEvent,
  StripeCardNumberElement,
  StripeCardNumberElementChangeEvent,
} from '@stripe/stripe-js';
import * as moment from 'moment';
import { User } from 'src/app/interfaces/user';
import { ApiService } from 'src/app/services/api.service';
import { UserService } from 'src/app/services/user.service';

import { ToastType } from './../../../login/ToastTypes';
import { AppComponent } from 'src/app/app.component';
import { DonationSetupModel } from '../forms/donation-form-list/donation-form-list.component';
export enum StripeErrors {
  'generic_decline' = 'Tu tarjeta ha sido rechazada, por favor confirma los datos de tu tarjeta y vuelve a intentarlo.',
  'card_declined' = 'Tu tarjeta ha sido rechazada, por favor confirma los datos de tu tarjeta y vuelve a intentarlo.',
  'lost_card' = 'Tu tarjeta ha sido rechazada, por favor confirma los datos de tu tarjeta y vuelve a intentarlo.',
  'stolen_card' = 'Tu tarjeta ha sido rechazada, por favor confirma los datos de tu tarjeta y vuelve a intentarlo.',
  'insufficient_funds' = 'Tu tarjeta no tiene fondos suficientes.',
  'expired_card' = 'La tarjeta ha caducado.',
  'incorrect_cvc' = 'El código de seguridad de tu tarjeta es incorrecto.',
  'processing_error' = 'Ha ocurrido un error durante el procesamiento de la tarjeta. Vuelve a intentarlo en unos minutos.',
  'invalid_request_error' = 'Hubo un error procesando tu donación, por favor confirma los datos de tu tarjeta y vuelve a intentarlo más tarde.',
  'payment_method' = 'Tu tarjeta ha sido rechazada, por favor confirma los datos de tu tarjeta y vuelve a intentarlo más tarde.'
}
@Component({
  selector: 'app-donations-v2',
  templateUrl: './donations-v2.component.html',
  styleUrls: ['./donations-v2.component.scss']
})
export class DonationsV2Component implements OnInit {

  @ViewChild('card_info_number') card_info_number: ElementRef;
  @ViewChild('card_info_exp') card_info_exp: ElementRef;
  @ViewChild('card_info_cvv') card_info_cvv: ElementRef;
  @Input('id') id: number;
  @Input('idOrganization') idOrganization: number;
  @Input('ignore_login') ignore_login: boolean;
  @Input('hide_headers') hide_headers: boolean;

  card: StripeCardElement;
  card_number: StripeCardNumberElement;
  card_exp: StripeCardExpiryElement;
  card_cvv: StripeCardCvcElement;
  stripe: Stripe;

  donation_setup: DonationSetupModel;
  error_message: string;
  not_stripe: boolean = false;
  processing_payment: boolean = false;
  categories: { idDonationCategory: number; name: number; }[] = [];
  organization: any = {};
  frequencies: {
    id: string;
    name: string;
    key: string;
    amount: number;
  }[] = [
      {
        id: 'weekly',
        name: 'Semanal',
        key: 'week',
        amount: 1
      },
      {
        id: 'biweekly',
        name: 'Cada 2 semanas',
        key: 'week',
        amount: 2
      },
      {
        id: 'monthly',
        name: 'Mensual',
        key: 'month',
        amount: 1
      },
    ]

  verifications: {
    number_is_load: boolean;
    exp_is_load: boolean;
    cvv_is_load: boolean;
  } = {
      number_is_load: false,
      exp_is_load: false,
      cvv_is_load: false
    }

  main_form: FormGroup = this.form_builder.group({
    step: new FormControl('step_1'),
    donation_form: new FormGroup({
      periodicity: new FormControl('only_once', [Validators.required]),
      amount: new FormControl('0.00', [Validators.required, Validators.min(1.00), Validators.max(100000.00)]),
      amount_mask: new FormControl('0.00', []),
      donation_type: new FormControl(undefined, [Validators.required])
    }),
    recurring_form: new FormGroup({
      frequency: new FormControl('weekly', [Validators.required]),
      starting_at: new FormControl(moment().format('YYYY-MM-DD'))
    }),
    contact_info: new FormGroup({
      first_name: new FormControl(undefined, [Validators.required]),
      last_name: new FormControl(undefined, [Validators.required]),
      email: new FormControl(undefined, [Validators.required, Validators.email])
    }),
    payment_methods: new FormArray([])
  });

  payment_info: FormGroup = this.form_builder.group({
    zip_code: new FormControl(undefined, [Validators.required])
  });

  get actual_step(): 'step_1' | 'step_2' | 'step_3' {
    return this.main_form.get('step').value;
  }

  set actual_step(step: 'step_1' | 'step_2' | 'step_3') {
    this.main_form.get('step').setValue(step);
  }

  get donation_form() {
    return this.main_form.get('donation_form') as FormGroup;
  }

  set donation_form(form: FormGroup) {
    this.main_form.setControl('donation_form', form);
  }

  get recurring_form() {
    return this.main_form.get('recurring_form') as FormGroup;
  }

  set recurring_form(form: FormGroup) {
    this.main_form.setControl('recurring_form', form);
  }

  get contact_form() {
    return this.main_form.get('contact_info') as FormGroup;
  }

  get payment_methods() {
    return this.main_form.get('payment_methods') as FormArray;
  }

  get elements_loaded() {
    return this.verifications.cvv_is_load && this.verifications.number_is_load && this.verifications.exp_is_load
  }

  constructor(
    private api: ApiService,
    private form_builder: FormBuilder,
    private activated_route: ActivatedRoute,
    private user_service: UserService,
    private app: AppComponent
  ) { }

  async ngOnInit() {
    if (!this.id) {
      this.id = this.activated_route.snapshot.params.id;
    }
    if (!this.idOrganization) {
      this.idOrganization = this.activated_route.snapshot.params.idOrganization;
    }
    if (this.id) {
      this.getDonationSetup();
    }
    if (!this.ignore_login) {
      this.ignore_login = JSON.parse(this.activated_route.snapshot.queryParamMap.get('login'));
    }
    if (this.ignore_login && !this.id) {
      this.hide_headers = true;
    }
    if (this.hide_headers) {
      setTimeout(() => {
        this.app.hide_toolbars = true;
      });
    }
    const org_response: any = await this.api.get('iglesias/getIglesiaDetail', { idIglesia: this.idOrganization, minimal: true }).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (org_response) {
      this.organization = org_response.iglesia;
    }

    const data_token: any = await this.api.get('iglesias/getIglesiaDetailWithToken', { idIglesia: this.idOrganization }).toPromise();

    if (data_token) {
      const iglesia = data_token.iglesia;
      if (iglesia) {
        if (iglesia.publicKey) {
          this.stripe = await loadStripe(iglesia.publicKey);
          await this.getCategories();
        } else {
          this.api.showToast(`Esta organización no tiene vinculada una cuenta de Stripe.`, ToastType.error);
          this.not_stripe = true;
        }
      } else {
        this.api.showToast(`Esta organización no tiene vinculada una cuenta de Stripe.`, ToastType.error);
        this.not_stripe = true;
      }
    }
  }

  async getDonationSetup() {
    if (this.main_form.get('id')) {
      this.main_form.get('id').setValue(this.id);
    } else {
      this.main_form.addControl('id', new FormControl(this.id));
    }
    const response: any = await this.api.get(`donations_v2/forms/${this.id}`, { idIglesia: this.idOrganization })
      .toPromise()
      .catch(error => {
        return;
      });
    if (response) {
      this.donation_setup = response.setup;
      document.documentElement.style.setProperty('--donation-header-background', this.donation_setup.header_background);
      document.documentElement.style.setProperty('--donation-header-text-color', this.donation_setup.header_text_color);
      document.documentElement.style.setProperty('--donation-active-background', this.donation_setup.active_background);
      document.documentElement.style.setProperty('--donation-active-text-color', this.donation_setup.active_text_color);
      this.donation_form.get('donation_type').setValue(this.donation_setup.defaultIdDonationCategory);
      this.main_form.get('donation_form').get('amount').setValue((this.donation_setup.default_amount * 100).toString() || '0.00');
      this.formatNumber();
    }
  }

  async getCategories() {
    const response: any = await this.api.get(`donations/categories`, { idIglesia: this.idOrganization })
      .toPromise()
      .catch(error => {
        this.categories = [];
        return;
      });

    if (response) {
      this.categories = response.categories || [];
      if (this.categories.length > 0) {
        this.donation_form.get('donation_type').setValue(this.categories[0].idDonationCategory);
      } else {
        this.donation_form.get('donation_type').setValidators([]);
        this.donation_form.get('donation_type').setValue(undefined);
      }
      if (this.donation_setup) {
        const category = this.categories.find(x => x.idDonationCategory === this.donation_setup.defaultIdDonationCategory);
        if (category) {
          this.donation_form.get('donation_type').setValue(this.donation_setup.defaultIdDonationCategory);
        }
      }
    }
  }

  preventEvent(event: KeyboardEvent) {
    let amount: string = this.main_form.get('donation_form').get('amount').value || '';
    if (amount === '0.00') {
      if (event.key === 'Backspace' || event.key === '0') {
        event.stopPropagation();
        event.preventDefault()
        event.cancelBubble = true;
        return false;
      }
    }
    let allowed = [
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Backspace', 'ArrowRight', 'ArrowLeft'
    ];
    if (!allowed.includes(event.key) || amount.length > 9) {
      if (event.key !== 'Backspace') {
        event.stopPropagation();
        event.preventDefault()
        event.cancelBubble = true;
        return false;
      }
    }
    // return false;
  }
  formatNumber(event?: KeyboardEvent) {
    let amount: string = this.main_form.get('donation_form').get('amount').value || '';
    amount = amount.replace(/\D/g, '');
    let amount_str: string = Number(amount).toString();
    if (amount_str.length === 1) {
      amount_str = `0.0${amount_str}`;
    } else if (amount_str.length === 2) {
      amount_str = `0.${amount_str}`;
    } else {
      amount_str = `${amount_str.substring(0, amount_str.length - 2)}.${amount_str.substring(amount_str.length - 2)}`;
    }
    if (amount_str.length > 6) {
      let point_index = amount_str.indexOf('.');
      let first_segment = amount_str.substring(0, point_index);
      if (first_segment.length > 3) {
        first_segment = `${first_segment.substring(0, first_segment.length - 3)},${first_segment.substring(first_segment.length - 3)}`;
      }
      amount_str = `${first_segment}${amount_str.substring(point_index)}`
    }
    this.main_form.get('donation_form').get('amount').setValue(amount_str);
    this.main_form.get('donation_form').get('amount_mask').setValue(amount_str);
    console.log(amount_str);

    // this.main_form.get('donation_form').get('amount_mask').setValue(amount_str);
    this.error_message = undefined;
    if (event) {
      event.stopPropagation();
    }

  }

  setPeriodicity(value) {
    this.donation_form.get('periodicity').setValue(value);
  }

  async nextStep() {
    if (this.actual_step === 'step_1') {
      if (this.donation_form.valid) {
        let amount: string = this.main_form.get('donation_form').get('amount').value || '';
        amount = amount.replace(/\D/g, '');
        const amount_number = Number(amount);
        if (amount_number / 100 > 100000) {
          this.error_message = `La cantidad debe ser entre $1.00 y $100,000.00`
          return;
        }
        if (this.verifyStep2Status()) {
          this.requestPayment();
          this.actual_step = 'step_3';
          this.goToStep3();
        } else {
          this.actual_step = 'step_2';
        }
      } else {
        this.printControlError(this.donation_form);
      }
    } else if (this.actual_step === 'step_2') {
      if (this.contact_form.valid) {
        await this.requestPayment();
        this.actual_step = 'step_3';
        this.goToStep3();
      } else {
        this.printControlError(this.contact_form);
      }
    }
  }

  printControlError(form_group: FormGroup) {
    const controls = Object.keys(form_group.controls);
    for (let index = 0; index < controls.length; index++) {
      const key = controls[index];
      const control = form_group.get(key);
      if (control.errors) {
        const error_keys = Object.keys(control.errors);
        if (error_keys.length > 0) {

          if (error_keys[0] === 'min') {
            if (control.errors[error_keys[0]].actual == '0.00') {
              this.error_message = `Ingrese una cantidad`
            } else {
              this.error_message = `La cantidad debe ser entre $1.00 y $100,000.00`
            }
            return;
          } else if (error_keys[0] === 'required') {
            let field: string;
            if (key === 'donation_type') {
              field = `Tipo de donación`;
            } else if (key === 'first_name') {
              field = `Nombre`;
            } else if (key === 'last_name') {
              field = `Apellido`;
            } else if (key === 'email') {
              field = `El correo`;
            }
            this.error_message = `${field} es un campo requerido.`;
            return;
          } else if (error_keys[0] === 'email') {
            this.error_message = `El correo ingresado es inválido.`
          }
        }
      }
      this.error_message = undefined;
    }
  }

  async goToStep3() {
    if (this.payment_intent &&
      (!this.verifications.cvv_is_load
        || !this.verifications.number_is_load
        || !this.verifications.exp_is_load)) {
      setTimeout(() => {
        this.initCardElement();
      });
    }
    await this.getCustomerInfo();
  }

  add_new_payment: boolean = false;
  customer: any;
  customer_loaded: boolean;

  async getCustomerInfo() {
    this.customer_loaded = false;
    const payload = this.contact_form.value;
    payload.idOrganization = this.idOrganization;
    const response: any = await this.api.post(`donations_v2/customer`, payload).toPromise();
    if (response) {
      this.customer = response;
      const update_payment_payload = {
        payment_intent_id: this.payment_intent.id,
        customer_id: this.customer.id,
        idOrganization: this.idOrganization
      }
      const customer_update: any = await this.api.patch(`donations_v2/payment`, update_payment_payload).toPromise();
      while (this.payment_methods.length != 0) {
        this.payment_methods.removeAt(0);
      }
      this.customer.payment_methods.forEach(method => {
        const card = method.card;
        this.payment_info = new FormGroup({
          last4: new FormControl(card.last4),
          brand: new FormControl(card.brand),
          exp_month: new FormControl(card.exp_month),
          exp_year: new FormControl(card.exp_year),
          id: new FormControl(method.id),
          zip_code: new FormControl(),
          selected: new FormControl(false)
        });
        this.payment_methods.push(this.payment_info);
      });
      this.actual_step = 'step_3';
      this.customer_loaded = true;
    }
  }

  selectCard(card: FormGroup) {
    this.payment_methods.controls.forEach(x => {
      x.get('selected').setValue(false);
    });
    card.get('selected').setValue(true);
  }

  verifyStep2Status() {
    const check_session = this.getSession();
    if (check_session) {
      // make some login
      return true;
    }
    if (!this.ignore_login) {
      const current_user: User = this.user_service.getCurrentUser();
      if (current_user) {
        this.contact_form.get('first_name').setValue(current_user.nombre);
        this.contact_form.get('last_name').setValue(current_user.apellido);
        this.contact_form.get('email').setValue(current_user.email);
        return true;
      }
    }
    if (this.contact_form.get('email').valid) {
      return true;
    }
    return false;
  }

  getSession() {
    return undefined;
  }

  backStep() {
    if (this.actual_step === 'step_3') {
      this.actual_step = 'step_2';
    } else if (this.actual_step === 'step_2') {
      this.actual_step = 'step_1';
    }
  }

  backToStep1() {
    this.actual_step = 'step_1';
    this.verifications = {
      cvv_is_load: false,
      number_is_load: false,
      exp_is_load: false
    };
    this.card_number.unmount();
    this.card_exp.unmount();
    this.card_cvv.unmount();
  }

  async addNewPayment() {
    const data: CreatePaymentMethodData = {
      type: 'card',
      card: this.card_number,
    }
    const payment_method = await this.stripe.createPaymentMethod(data);
    if (payment_method.paymentMethod) {
      const card = payment_method.paymentMethod.card;
      this.payment_info = new FormGroup({
        last4: new FormControl(card.last4),
        brand: new FormControl(card.brand),
        exp_month: new FormControl(card.exp_month),
        exp_year: new FormControl(card.exp_year),
        id: new FormControl(payment_method.paymentMethod.id),
        zip_code: new FormControl(),
        selected: new FormControl(false)
      });
      const response: any = await this.api.post(`donations_v2/customer/attach`, {
        customer_id: this.customer.id,
        payment_id: payment_method.paymentMethod.id,
        idOrganization: this.idOrganization
      }).toPromise();
      if (response.code) {
        let decline_message = StripeErrors[response.message];
        this.api.showToast(decline_message, ToastType.error);
      } else {
        this.payment_methods.push(this.payment_info);
        this.payment_info = new FormGroup({});
        this.closeNewCardForm();
      }
    }
  }
  payment_intent: PaymentIntent;

  async requestPayment() {
    let amount: string = this.main_form.get('donation_form').get('amount').value || '';
    amount = amount.replace(/\D/g, '');
    if (this.payment_intent) {
      if (this.payment_intent.amount != Number(amount)) {
        const update_payment_payload = {
          amount,
          payment_intent_id: this.payment_intent.id,
          idOrganization: this.idOrganization
        }
        const amount_update: any = await this.api.patch(`donations_v2/payment`, update_payment_payload).toPromise();
      }

    } else {
      const response: any = await this.api.post(`donations_v2/payment`, {
        amount,
        idOrganization: this.idOrganization,
        email: this.contact_form.get('email').value
      }).toPromise();
      if (response) {
        this.payment_intent = response;
        setTimeout(() => {
          this.initCardElement();
        });
      }
    }

  }

  initCardElement() {
    const elements = this.stripe.elements({
      clientSecret: this.payment_intent.client_secret
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

  closeNewCardForm() {
    this.card_number.clear();
    this.card_exp.clear();
    this.card_cvv.clear();
    this.add_new_payment = false;
  }

  async confirmDonation() {
    if (this.processing_payment) {
      return;
    }
    this.processing_payment = true;
    const selected_card = this.payment_methods.value.find(x => x.selected);
    if (!selected_card) {
      this.api.showToast(`Necesitas seleccionar un método de pago.`, ToastType.info);
      this.processing_payment = false;
      return;
    }
    if (this.donation_form.get('periodicity').value === 'recurrent') {
      if (this.recurring_form.valid) {
        const selected_frequency = this.frequencies.find(x => x.id === this.recurring_form.get('frequency').value);
        if (selected_frequency) {
          const next_date = moment().add(selected_frequency.amount, this.convertKeyToUnit(selected_frequency.key)).valueOf();

          let amount: string = this.main_form.get('donation_form').get('amount').value || '';
          amount = amount.replace(/\D/g, '');

          const payload = {
            amount,
            start_date: next_date,
            payment_method_id: selected_card.id,
            customer_id: this.customer.id,
            frequency: selected_frequency.id,
            idOrganization: this.idOrganization,
            donation_type: this.donation_form.get('donation_type').value,
            id: undefined
          }
          if (this.id) {
            payload.id = this.id;
          }

          const response: any = await this.api.post(`donations_v2/subscribe`, payload).toPromise();
          if (response.code) {
            const message = StripeErrors[response.message];
            this.api.showToast(message, ToastType.error);
            this.processing_payment = false;
            return;
          } else {
            this.recurring_form.get('frequency').setValue('weekly');
            this.api.showToast('Gracias por tu donación', ToastType.success);
          }
        }
      }
    } else {
      const payment_response = await this.stripe.confirmCardPayment(this.payment_intent.client_secret, {
        payment_method: selected_card.id
      })
        .catch(error => {
          console.error(error);
          return;
        });
      if (payment_response) {
        if (payment_response.error) {
          let message: string;
          if (payment_response.error.decline_code) {
            message = StripeErrors[payment_response.error.decline_code];
          } else {
            message = StripeErrors[payment_response.error.code];
          }
          this.api.showToast(message, ToastType.error);
          this.processing_payment = false;
          return;
        } else {
          const payment_confirmed = payment_response.paymentIntent;
          const payload_confirm = {
            payment_id: payment_confirmed.id,
            payment_method_id: selected_card.id,
            customer_id: this.customer.id,
            idOrganization: this.idOrganization,
            donation_type: this.donation_form.get('donation_type').value,
            id: undefined
          }
          if (this.id) {
            payload_confirm.id = this.id;
          }
          const register_response: any = await this.api.post(`donations_v2/confirm`, payload_confirm).toPromise();
          this.api.showToast('Gracias por tu donación', ToastType.success);
        }
      }
    }

    this.main_form.reset();
    this.donation_form = this.form_builder.group({
      periodicity: new FormControl('only_once', [Validators.required]),
      amount: new FormControl('0.00', [Validators.required, Validators.min(1.00), Validators.max(100000.00)]),
      amount_mask: new FormControl('0.00', []),
      donation_type: new FormControl(undefined)
    });

    this.backToStep1();
    this.payment_intent = undefined;
    this.processing_payment = false;
  }

  convertKeyToUnit(key: string): moment.unitOfTime.DurationConstructor {
    if (key === 'week') {
      return 'week'
    } else if (key === 'month') {
      return 'month';
    }
  }

}
