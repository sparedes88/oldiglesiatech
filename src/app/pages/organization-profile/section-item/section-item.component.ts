import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-section-item',
  templateUrl: './section-item.component.html',
  styleUrls: ['./section-item.component.scss']
})
export class SectionItemComponent implements OnInit {

  @Input('idContainerType') idContainerType: number;
  @Input('iglesia') iglesia: any;
  @Input('section') section: any;

  constructor(
    private api: ApiService
  ) { }

  ngOnInit() {
  }

  fixUrl(image: string) {
    if (image) {
      if (image.includes('https://')) {
        return `${image}`;
      }
      return `${this.api.baseUrl}${image}`;
    }
    if (this.iglesia) {
      if (this.iglesia.portadaArticulos) {
        const path = this.fixUrl(this.iglesia.portadaArticulos);
        return path;
      }
    }
    return 'assets/img/default-image.jpg';
  }

}
