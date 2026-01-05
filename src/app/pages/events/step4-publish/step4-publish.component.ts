import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-step4-publish',
  templateUrl: './step4-publish.component.html',
  styleUrls: ['./step4-publish.component.scss']
})
export class Step4PublishComponent implements OnInit {

  @Input('form') form: FormGroup;

  constructor() { }

  ngOnInit() {
  }

}
