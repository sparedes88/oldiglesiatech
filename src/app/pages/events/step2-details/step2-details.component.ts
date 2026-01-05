import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-step2-details',
  templateUrl: './step2-details.component.html',
  styleUrls: ['./step2-details.component.scss']
})
export class Step2DetailsComponent implements OnInit {

  @Input('form') form: FormGroup;

  constructor() { }

  ngOnInit() {
  }

}
