import { Component, OnInit, ViewChild, ElementRef, NgZone, Input } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { NgxSmartModalService } from "ngx-smart-modal";;
import { loadStripe, Stripe } from '@stripe/stripe-js'
import { ActivatedRoute } from '@angular/router';
import { ToastType } from 'src/app/login/ToastTypes';
declare var $: any;
@Component({
  selector: 'app-donations',
  templateUrl: './donations.component.html',
  styleUrls: ['./donations.component.scss']
})
export class DonationsComponent implements OnInit {

  constructor(private api: ApiService, private modal: NgxSmartModalService, private NgZone: NgZone, private activated_route: ActivatedRoute) { }

  //currentUser: any = UserService.getCurrentUser();
  @ViewChild('cardInfo') cardInfo: ElementRef;
  @Input('idOrganization') idOrganization: number;

  cardError: string;
  card: any;
  stripe: Stripe;
  fee: boolean = false;
  donation;
  total = 0.0;
  iglesia;
  email: string = undefined;
  first_name: string = undefined;
  last_name: string = undefined
  idDonationCategory: number;
  categories: any[] = [];

  public states = {
    "AL": "alabama",
    "AK": "alaska",
    "AS": "american samoa",
    "AZ": "arizona",
    "AR": "arkansas",
    "CA": "california",
    "CO": "colorado",
    "CT": "connecticut",
    "DE": "delaware",
    "DC": "district Of Columbia",
    "FM": "federated states of micronesia",
    "FL": "florida",
    "GA": "georgia",
    "GU": "guam",
    "HI": "hawaii",
    "ID": "idaho",
    "IL": "illinois",
    "IN": "indiana",
    "IA": "iowa",
    "KS": "kansas",
    "KY": "kentucky",
    "LA": "louisiana",
    "ME": "maine",
    "MH": "marshall islands",
    "MD": "maryland",
    "MA": "massachusetts",
    "MI": "michigan",
    "MN": "minnesota",
    "MS": "mississippi",
    "MO": "missouri",
    "MT": "montana",
    "NE": "nebraska",
    "NV": "nevada",
    "NH": "new nampshire",
    "NJ": "new jersey",
    "NM": "new mexico",
    "NY": "new york",
    "NC": "north carolina",
    "ND": "north dakota",
    "MP": "northern mariana islands",
    "OH": "ohio",
    "OK": "oklahoma",
    "OR": "oregon",
    "PW": "palau",
    "PA": "pennsylvania",
    "PR": "puerto Rico",
    "RI": "rhode Island",
    "SC": "south Carolina",
    "SD": "south Dakota",
    "TN": "tennessee",
    "TX": "texas",
    "UT": "utah",
    "VT": "vermont",
    "VI": "virgin Islands",
    "VA": "virginia",
    "WA": "washington",
    "WV": "west virginia",
    "WI": "wisconsin",
    "WY": "wyoming"
  }
  ngOnInit() {
    if (!this.idOrganization) {
      this.idOrganization = this.activated_route.snapshot.params.id;
    }
    document.getElementById("mainFooter").style.display = "none";
    document.getElementById("mainAppMenu").style.display = "none";
    $('[data-toggle="popover"]').popover();
  }
  fixUrl(url: string) {
    if (url) {
      if (url.includes('https')) {
        return url;
      } else {
        // return `${environment.serverURL}/${url}`;
        return `https://iglesia-tech-api.e2api.com${url}`;
      }
    } else {
      return 'assets/img/default-image.jpg';
    }
  }
  captureFee(event) {
    this.total = this.donation ? this.donation : 0.0
    if (this.fee && this.donation) {
      this.total = this.calculateCCAfterFee(this.total);
    } else {
      this.total = parseFloat(this.donation.toFixed(2))
    }
  }
  fixDonation() {
    this.captureFee(null)
  }
  validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }
  checkFields() {
    var flag = true
    if (this.email && this.last_name && this.first_name && this.total >= 1.0 && !this.cardError) {
      if (this.email.length > 0 && this.last_name.length > 0 && this.first_name.length > 0) {
        if (this.validateEmail(this.email)) {
          flag = false
        }
      }
    }
    return flag
  }
  calculateCCAfterFee(qty) {
    var FIXED_FEE = 0.30;
    var PERCENTAGE_FEE = 0.029;
    return parseFloat(Number((qty + FIXED_FEE) / (1 - PERCENTAGE_FEE)).toFixed(2));
  }
  getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }
  ngAfterViewInit(): void {
    this.api.get('iglesias/getIglesiaDetailWithToken', { idIglesia: this.idOrganization })
      .subscribe(
        (data: any) => {
          this.iglesia = data.iglesia
          this.iglesia.abb = this.getKeyByValue(this.states, String(this.iglesia.Provincia).toLowerCase())
          if (this.iglesia.publicKey) {
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
          } else {
            //this.api.showToast(`This church does not have any linked Stripe account.`, ToastType.error)
            this.cardError = "This church does not have any linked Stripe account."
          }
        },
        (err) => {
          console.error(err);
        }
      );

    this.getCategories();
  }

  getCategories() {
    this.api.get(`donations/categories`, { idIglesia: this.idOrganization })
      .subscribe((response: any) => {
        this.categories = response.categories;
        if (this.categories.length > 0) {
          this.idDonationCategory = this.categories[0].idDonationCategory;
        }
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
      await loadStripe(this.iglesia.publicKey)
  }
  async onClick() {
    const { token, error } = await this.stripe.createToken(this.card)
    if (token) {
      this.api
        .post(`chat/stripe_testing3`, {
          token: token.id,
          cover_fees: this.fee,
          email: this.email,
          amount: this.donation,
          idIglesia: this.idOrganization,
          first_name: this.first_name,
          last_name: this.last_name,
          idDonationCategory: this.idDonationCategory
        })
        .subscribe(
          (data: any) => {
            this.api.showToast('Successful donation. Thank you!', ToastType.success);
            this.donation = undefined;
            this.total = 0.0;
            this.email = undefined;
            this.first_name = undefined;
            this.last_name = undefined
            this.fee = false
            this.ngAfterViewInit()
          },
          (err) => {
            this.api.showToast(`Error processing the transaction.`, ToastType.error)
          }
        );
    } else {
      this.NgZone.run(() => {
        this.cardError = error.message
      })
    }
  }
}
