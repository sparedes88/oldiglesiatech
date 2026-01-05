import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { VideoModel } from 'src/app/models/VideoModel';

@Component({
  selector: 'app-video-detail',
  templateUrl: './video-detail.component.html',
  styleUrls: ['./video-detail.component.scss']
})
export class VideoDetailComponent implements OnInit {

  @Input() video: VideoModel;
  @Input() show_header: boolean = true;
  @Output() dismiss_detail = new EventEmitter();
  @ViewChild('iframe') iframe: ElementRef;

  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnInit() {
    if (!this.video.has_been_sanitize) {
      this.video.embed_frame = this.sanitizer.bypassSecurityTrustHtml(this.video.embed_frame) as any;
      this.video.has_been_sanitize = true;
    }
  }


  ngAfterViewInit() {
    Array.prototype.forEach.call(document.getElementsByClassName('videoWrapper'), element => {
      Array.prototype.forEach.call(element.getElementsByTagName('iframe'), img => {
        img.style = 'max-width: 100%';
      });
    });
  }

}
