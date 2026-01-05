import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-see-step-detail',
  templateUrl: './see-step-detail.component.html',
  styleUrls: ['./see-step-detail.component.scss']
})
export class SeeStepDetailComponent implements OnInit {
  step: any;

  constructor(
    private domSanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    if (this.step) {
      if (!this.step.hasBeenSanitized) {
        console.log(this.step);
        if (this.step.frame_video) {
          const contenido = this.domSanitizer.bypassSecurityTrustHtml(this.step.frame_video);
          this.step.frame_video = contenido;
          this.step.hasBeenSanitized = true;
        }
      }
    }
  }

  getUrl(url) {
    return `${environment.serverURL}${url}`;
  }

}
