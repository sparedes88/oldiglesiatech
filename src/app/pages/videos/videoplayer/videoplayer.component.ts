import { DomSanitizer } from '@angular/platform-browser';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { VideoModel } from 'src/app/models/VideoModel';

@Component({
  selector: 'app-videoplayer',
  templateUrl: './videoplayer.component.html',
  styleUrls: ['./videoplayer.component.scss']
})
export class VideoplayerComponent implements OnInit {

  @Input('autoplay') autoplay: boolean;
  @Input('src') src: string;
  @Input('hide_buttons') hide_buttons: boolean;
  @Input('is_full_width') is_full_width: boolean;
  safe_src: any;
  loading: boolean = false;
  video: VideoModel;
  @Output('on_close_video') on_close_video: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private dom_sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.loading = true;
    if (this.autoplay) {
      this.addParam('autoplay', 1);
    }
    setTimeout(() => {
      this.safe_src = this.dom_sanitizer.bypassSecurityTrustResourceUrl(this.src);
    }, 300);
  }

  addParam(param: string, value: any) {
    if (!this.has_params) {
      this.src = `${this.src}?`
    }
    const query_params_index = this.src.lastIndexOf('?');
    const only_params = this.src.substring(query_params_index).includes('=');
    if (only_params) {
      this.src = `${this.src}&`;
    }
    this.src = `${this.src}${param}=${value}`;
  }

  get has_params() {
    return this.src.includes('?');
  }

}
