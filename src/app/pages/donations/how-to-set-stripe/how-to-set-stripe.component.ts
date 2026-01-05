import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-how-to-set-stripe',
  templateUrl: './how-to-set-stripe.component.html',
  styleUrls: ['./how-to-set-stripe.component.scss']
})
export class HowToSetStripeComponent implements OnInit {

  @Output('on_close') on_close: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  closeForm(){
    this.on_close.emit();
  }

}
