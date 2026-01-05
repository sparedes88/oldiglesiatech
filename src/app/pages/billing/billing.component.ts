import { Component, OnInit, NgZone, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { AppComponent } from 'src/app/app.component';
import { User } from 'src/app/interfaces/user';
import { ApiService } from 'src/app/services/api.service';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { UserService } from 'src/app/services/user.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { BillingPaymentMethodsComponent } from './billing-payment-methods/billing-payment-methods.component';
@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss']
})
export class BillingComponent implements OnInit {

  @ViewChild('payment_methods') payment_methods: BillingPaymentMethodsComponent;

  constructor(private organizationService: OrganizationService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private app: AppComponent,
    private router: Router,
    private api: ApiService,
    private NgZone: NgZone,
    private activated_route: ActivatedRoute
  ) {
    this.currentUser = this.userService.getCurrentUser();
    if (!this.idOrganization) {
      this.idOrganization = Number(this.activated_route.snapshot.params['idOrganization']);
    }
    if (!this.idOrganization) {
      this.idOrganization = this.currentUser.idIglesia;
    }
  }

  plan
  cost = 0.0
  plan_is_changed = false
  currentUser: User;
  cardError: string;
  coupon = undefined
  couponError = false
  coupon_changed = false
  card: any;
  loading = true
  couponCode: string;
  couponPercent = undefined
  datosStripe: any
  @ViewChild('cardInfo') cardInfo: ElementRef;
  stripe: Stripe;
  hide_products: boolean = true;
  hide_status: boolean = true;
  hide_categories: boolean = true;
  days_remaining = 0
  current_month = 0
  last_month = 0
  coupons = []
  charges = [
    {
      id: 'ch_1BHEeGFsVUXh4OG7BRhMZuR3',
      amount: 4999
    }
  ]
  plans = [
    {
      name: "Basic Plan ($49.99/month)",
      id: 1
    },
    {
      name: "Premium Plan ($79.99/month)",
      id: 2
    },
    {
      name: "Exclusive Plan ($99.99/month)",
      id: 3
    },
  ]

  idOrganization: number;

  addCoupon() {
    this.loading = true
    this.api
      .post(`iglesias/addCoupon`, {
        percent: this.couponPercent
      })
      .subscribe((data: any) => {
        this.api.showToast(`Success.`, ToastType.success)
        this.getCoupons()
        this.coupon = data.coupon.id
        this.couponCode = data.coupon.id
        this.couponPercent = undefined
        this.loading = false
      },
        (err) => {
          this.loading = false
          this.api.showToast(`Error adding the coupon.`, ToastType.error)
        })
  }
  changedCoupon() {
    this.couponCode = this.coupon
  }
  changedCouponPlan() {
    this.couponCode = this.coupon
    this.coupon_changed = true
    this.changePlan()
  }
  ngAfterViewInit(): void {
    this.initializeStripe().then((value) => {
      this.card = this.stripe.elements().create('card', {
        style: {
          base: {
            // Add your base input styles here. For example:
            fontSize: '14px',
            color: '#32325d',
          },
        }
      });
      this.card.mount(this.cardInfo.nativeElement);
      this.card.addEventListener('change', this.onChange.bind(this))
    })
  }
  onChange({ error }) {
    if (error) {
      this.NgZone.run(() => {
        this.cardError = error.message
      })
    } else {
      this.NgZone.run(() => {
        this.cardError = null
      })
    }
  }
  async initializeStripe() {
    this.stripe =
      await loadStripe('pk_live_lFVwMl9P5iRRyJEe3UFIQxeA')
  }
  async cancelSuscription(suscription_id) {
    this.loading = true
    this.api
      .post(`iglesias/cancelSuscription`, {
        subscription_id: suscription_id
      })
      .subscribe((data: any) => {
        this.loading = false
        this.api.showToast(`Success.`, ToastType.success)
        this.getStripeInfo()
      },
        (err) => {
          this.loading = false
          this.api.showToast(`Error processing the cancel.`, ToastType.error)
        })
  }
  async renewSuscription() {
    this.loading = true
    this.api
      .post(`iglesias/renewSuscription`, {
        customer_id: this.datosStripe.customer_id,
        idDatosPagoStripe: this.datosStripe.idDatosPagoStripe
      })
      .subscribe((data: any) => {
        this.loading = false
        this.api.showToast(`Success.`, ToastType.success)
        this.getStripeInfo()
      },
        (err) => {
          this.loading = false
          this.api.showToast(`Error processing the renew.`, ToastType.error)
        })
  }

  async checkCoupon() {
    this.coupon = {}
    this.couponError = true
    this.loading = true
    this.api
      .post(`iglesias/checkStripeCoupon`, {
        coupon: this.couponCode
      })
      .subscribe((data: any) => {
        this.coupon = data.coupon
        this.couponError = false
        this.loading = false
        this.api.showToast(`Successful coupon code verification.`, ToastType.success)
      },
        (err) => {
          this.loading = false
          this.api.showToast(`Invalid coupon code.`, ToastType.error)
        })
  }

  async changeSuscription() {
    this.loading = true
    this.api
      .post(`iglesias/changeSuscription`, {
        idDatosPagoStripe: this.datosStripe.idDatosPagoStripe,
        plan: this.plan,
        coupon: this.couponCode
      })
      .subscribe((data: any) => {
        this.loading = false
        this.api.showToast(`Success.`, ToastType.success)
        this.getStripeInfo()
        this.plan = undefined
        this.cost = 0.0
        this.plan_is_changed = false
      },
        (err) => {
          this.loading = false
          this.api.showToast(`Error processing the change.`, ToastType.error)
        })
  }
  async changePlan() {
    var past_coupon = this.datosStripe.coupon_id ? this.coupons.find(element => element.id == this.datosStripe.coupon_id) : undefined
    this.coupon = this.datosStripe.coupon_id && !this.coupon_changed ?
      this.coupons.find(element => element.id == this.datosStripe.coupon_id).id : this.coupon
    var coupon = this.coupon ? this.coupons.find(element => element.id == this.coupon) : undefined
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    var diff = Math.floor((firstDay.getTime() - date.getTime()) / 86400000);
    diff++;
    var total_precharged = ((((this.plan == 1 ? 4999 : this.plan == 2 ? 7999 : 9999) * 12) / 365) *
      diff) * (coupon ? ((100 - (coupon.percent_off)) / 100) : 1);
    const current_total = ((((this.datosStripe.idCatalogoPlan == 1 ? 4999 : this.datosStripe.idCatalogoPlan == 2 ? 7999 : 9999) * 12) / 365) *
      diff) * (past_coupon ? ((100 - (past_coupon.percent_off)) / 100) : 1)
    var remaining = (total_precharged - current_total)
    this.plan ? this.plan_is_changed = true : this.plan_is_changed = false
    this.plan ? (this.cost = remaining) : this.cost = 0.0
  }
  async consolelog() {
    const { token, error } = await this.stripe.createToken(this.card)
    if (token && this.plan) {
      const payload = this.coupon ? {
        token: token.id,
        plan: this.plan,
        idIglesia: this.currentUser.idIglesia,
        coupon: this.couponCode
      } : {
        token: token.id,
        plan: this.plan,
        idIglesia: this.currentUser.idIglesia
      }
      this.loading = true
      this.api
        .post(`iglesias/saveStripeBilling`, payload)
        .subscribe((data: any) => {
          this.loading = false
          this.api.showToast(`Success.`, ToastType.success)
          this.getStripeInfo()
        }, (err) => {
          this.loading = false
          this.api.showToast(`Error processing the transaction.`, ToastType.error)
        })

    }
  }
  getStripeInfo() {
    this.loading = true
    this.api
      .get(`iglesias/getStripeInfo`, { idIglesia: this.currentUser.idIglesia })
      .subscribe((data: any) => {
        this.datosStripe = data.iglesia
        if (this.datosStripe.customer_id) {
          this.plans = [
            {
              name: "Basic Plan ($49.99/month)",
              id: 1
            },
            {
              name: "Premium Plan ($79.99/month)",
              id: 2
            },
            {
              name: "Exclusive Plan ($99.99/month)",
              id: 3
            },
          ]
          this.plans = this.plans.filter((obj) => {
            return obj.id !== this.datosStripe.idCatalogoPlan;
          })
          this.datosStripe.charges = this.datosStripe.charges.sort(function (a, b) {
            return a.created < b.created ? 1 : -1;
          });
          if (this.datosStripe.last_succeded_payment) {
            var date = new Date(this.datosStripe.last_succeded_payment);
            this.last_month = date.getMonth()
            this.current_month = new Date().getMonth()
          }
          if (this.current_month == this.last_month) {
            var date = new Date();
            var firstDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            var diff = Math.floor((firstDay.getTime() - date.getTime()) / 86400000);
            diff++;
            this.days_remaining = diff
          } else {
            var date = new Date();
            var firstDay = new Date(this.datosStripe.last_succeded_payment);
            var diff = Math.floor((date.getTime() - firstDay.getTime()) / 86400000);
            this.days_remaining = diff
          }
        }
        this.loading = false
      });
  }
  getCoupons() {
    if (this.currentUser.isSuperUser) {
      this.loading = true
      this.api
        .get(`iglesias/getCoupons`, {})
        .subscribe((data: any) => {
          this.coupons = data.coupons
          this.loading = false
        },
          (err) => {
            this.loading = false
            this.api.showToast(`Error getting coupons.`, ToastType.error)
          })
    }
  }
  ngOnInit() {
    this.getStripeInfo()
    this.getCoupons();
    if (this.router.url.includes('payment_methods')) {
      this.onAddPayment();
    }
  }

  onAddPayment() {
    // ($('.nav-tabs a[href="#' + tab + '"]') as any).tab('show');
    ($('#profile-tab') as any).tab('show');
    if (this.payment_methods) {
      if (this.payment_methods.elements_loaded) {
        this.payment_methods.add_new_payment = true;
      }
    }
  }
}
