import { Component, OnInit, ViewChild, ElementRef, NgZone } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { NgxSmartModalService } from "ngx-smart-modal";
import { UserService } from "src/app/services/user.service";
//import { loadStripe, Stripe } from '@stripe/stripe-js'
import * as moment from 'moment-timezone';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
@Component({
  selector: "app-log",
  templateUrl: "./log.component.html",
  styleUrls: ["./log.component.scss"],
})
export class LogComponent implements OnInit {
  constructor(
    private api: ApiService,
    private modal: NgxSmartModalService,
    private NgZone: NgZone,
    private form_builder: FormBuilder
  ) { }

  currentUser: any = UserService.getCurrentUser();
  public logs: Array<any> = [];
  //@ViewChild('cardInfo') cardInfo: ElementRef;
  cardError: string;
  card: any;
  //stripe: Stripe;

  iglesia = {
    sms_count: 0,
    email_count: 0,
    chat_count: 0,
    weeks: []
  };

  show_form: boolean = false;
  loading: boolean = true;
  dates: { name: string, value: string }[] = [];

  selectOpts = {
    singleSelection: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
    closeDropDownOnSelection: true,
    idField: 'value',
    textField: 'name'
  };

  filter_form: FormGroup = this.form_builder.group({
    period: new FormControl('', Validators.required),
    selected_period: new FormControl(moment.utc().format('YYYY-MM'))
  });

  ngOnInit() {
    this.getLogs();
    this.getSummary();
    this.getDropdows();
  }
  getDropdows() {
    const period = this.filter_form.get('selected_period').value;
    this.api.post(`chat/log/filters`, { idIglesia: this.currentUser.idIglesia })
      .subscribe((data: any) => {
        this.dates = data;
        // const period = moment.utc().format('YYYY-MM');
        const actual_period = this.dates.find(x => x.value === period);
        if (!actual_period) {
          this.dates.unshift({
            name: moment.utc().format('MMM YYYY'),
            value: period
          });
        }
        this.filter_form.get('period').setValue(this.dates.filter(x => x.value === period))
      });
  }

  getSummary() {
    const period = this.filter_form.get('selected_period').value;
    this.api.post(`chat/log/summary`, { period, idIglesia: this.currentUser.idIglesia })
      .subscribe((data: any) => {
        this.iglesia = data;
      })
  }
  /*ngAfterViewInit(): void {
    this.initializeStripe().then((value) => {
      this.card = this.stripe.elements().create('card');
      this.card.mount(this.cardInfo.nativeElement);
      this.card.addEventListener('change', this.onChange.bind(this))
    })
  }*/
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
  /*async initializeStripe() {
    this.stripe =
      await loadStripe('pk_test_51IfSRGKDBLh5H0WI4TzRB10QLjpUHsCU9EdcubZbbqIMAX42MINQU20wscgUi5isf0CFQw52CWERuc7plEMOrrds00BCo148wu')
  }*/
  /*async onClick() {
    const { token, error } = await this.stripe.createToken(this.card)
    if (token) {
      console.log(token)
      this.api
        .post(`chat/stripe_testing3`, { token: token.id })
        .subscribe(
          (data: any) => {
            console.log(data)
          },
          (err) => {
            console.error(err);
          }
        );
    } else {
      this.NgZone.run(() => {
        this.cardError = error.message
      })
    }
  }*/
  async getLogs() {
    this.loading = true;
    const period = this.filter_form.get('selected_period').value;
    const response: any = await this.api
      .get(`chat/log`, { period, idIglesia: this.currentUser.idIglesia })
      .toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.logs = response;
      // this.logs.sort(function (a, b) {
      //   return (a.createdAt > b.createdAt) ? -1 : ((a.createdAt < b.createdAt) ? 1 : 0);
      // });
    }
    this.loading = false;
  }

  openForm() {
    this.show_form = true;
  }

  reloadLogs() {
    this.show_form = false;
    this.ngOnInit();
  }

  setPeriod(event) {
    this.filter_form.get('selected_period').setValue(event.value);
    this.getLogs();
    this.getSummary();
  }
}
