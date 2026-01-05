import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss']
})
export class SkeletonComponent implements OnInit {

  @Input('show_img') show_img: boolean = true;
  @Input('show_body') show_body: boolean = true;
  @Input('show_footer') show_footer: boolean = true;
  @Input('show_button') show_button: boolean = false;
  @Input('show_input') show_input: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
