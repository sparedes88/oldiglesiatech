import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-step3-register',
  templateUrl: './step3-register.component.html',
  styleUrls: ['./step3-register.component.scss']
})
export class Step3RegisterComponent implements OnInit {

  @Input('form') form: FormGroup;

  constructor() { }

  ngOnInit() {
  }

}
