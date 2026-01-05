import { environment as environment_prod } from './../../../../environments/environment.prod';
import { DomSanitizer } from '@angular/platform-browser';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home-banner-slide',
  templateUrl: './home-banner-slide.component.html',
  styleUrls: ['./home-banner-slide.component.scss']
})
export class HomeBannerSlideComponent implements OnInit, OnChanges {

  @Input('slides') slides: FormArray = new FormArray([]);
  @Input('iglesia') iglesia: any = {};
  @Input('id') id: any;

  public serverUrl: string = environment.serverURL;

  constructor(
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    if (changes.id) {
      setTimeout(() => {
        // ($(`#${this.id}`) as any).carousel({
        //   interval: 3100,
        // });
        console.log(this.id);
        ($(`#${this.id}`) as any).carousel('cycle');
      }, 100);

    }
  }

  getCover(form_group: FormGroup, force_prod: boolean) {
    if (form_group) {
      if (form_group.value.temp_src) {
        const temp_src = form_group.value.temp_src;
        return `${temp_src}`;
      }
      if (form_group.value.picture) {
        if (force_prod) {
          return `${environment_prod.serverURL}${form_group.value.picture}`;
        } else {
          return `${this.serverUrl}${form_group.value.picture}`;
        }
      } else if (this.iglesia && this.iglesia.portadaArticulos) {
        if (force_prod) {
          return `${environment_prod.serverURL}${this.iglesia.portadaArticulos}`;
        } else {
          return `${this.serverUrl}${this.iglesia.portadaArticulos}`;
        }
      }
      return '';
    } else {
      return '';
    }
  }

}
