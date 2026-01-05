import { environment } from 'src/environments/environment';
import { Component, Input, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'app-document-paragraph',
  templateUrl: './document-paragraph.component.html',
  styleUrls: ['./document-paragraph.component.scss']
})
export class DocumentParagraphComponent implements OnInit, OnChanges {

  @Input('settings') settings: any;
  @Input('paragraph') paragraph: any;
  @Input('deep_level') deep_level: number;

  number_value: number = 16;
  unit: string = 'px';
  stepper: number = 1;
  base_url = environment.serverURL;
  constructor() { }

  ngOnInit() {
    const title_size = this.settings.title_size as string;
    const number_value = title_size.match(/\d+/g).join();
    this.number_value = Number(number_value);
    this.unit = title_size.replace(number_value, '');
    if (this.unit === '%') {
      this.stepper = 5;
    } else if (this.unit === 'em') {
      this.stepper = 0.4;
    } else {
      this.stepper = 1;
    }
  }

  ngOnChanges() {
    this.ngOnInit();
  }

  get fixed_title_size() {
    const value = this.number_value - (this.deep_level * this.stepper);
    return `${value}${this.unit}`;
  }

  getColWidth() {
    if (this.paragraph.pictures.length) {
      const qty = this.paragraph.pictures.length;
      if (qty >= 4) {
        return 'col-3';
      } else if (qty == 3) {
        return 'col-4';
      } else if (qty === 2) {
        return 'col-6';
      } else {
        return 'col-12';
      }
    }
  }

}
