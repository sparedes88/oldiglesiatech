import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card-ui',
  templateUrl: './card-ui.component.html',
  styleUrls: ['./card-ui.component.scss']
})
export class CardUiComponent implements OnInit {

  @Input('card_number') card_number: string = '****';
  @Input('exp_month') exp_month: string | number = 'MM';
  @Input('exp_year') exp_year: string = 'AA';
  @Input('brand') brand: string;
  @Input('selected') selected: boolean;

  fixed_month: string;
  fixed_year: string;

  constructor() { }

  ngOnInit() {
    if (this.exp_month < 10) {
      this.fixed_month = `0${this.exp_month}`;
    } else {
      this.fixed_month = this.exp_month as string;
    }
    const exp_year = this.exp_year.toString();
    if (exp_year.toString().length > 2) {
      this.fixed_year = `${exp_year.substring(exp_year.length - 2)}`;
    } else {
      this.fixed_year = this.exp_year as string;
    }
  }

}
