import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MediaDocumentModel } from 'src/app/models/VideoModel';
const mime = require('mime');

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss']
})
export class DocumentViewerComponent implements OnInit {

  @Input('hide_buttons') hide_buttons: boolean;
  @Input('src') src: string;
  @Input('style_settings') style_settings = {
    home_title_text_color: '#6ce59c'
  }
  @Input('video') video: MediaDocumentModel;
  @Input('is_full_width') is_full_width: boolean;

  loading: boolean = true;

  @Output('on_close_video') on_close_video: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    this.fetchFile();
  }

  document: Blob;
  async fetchFile() {
    console.log(this.src);

    this.loading = true;
    fetch(this.src, { method: 'GET' })
      .then((response) => response.blob())
      .then((blob) => {
        const extension = this.src.substring(this.src.lastIndexOf('.') + 1);
        const mimeType = mime.getType(extension);

        const contentType: string = mimeType;
        const fileBlob = new Blob([blob], { type: contentType });
        this.document = fileBlob;
        const fileData = window.URL.createObjectURL(fileBlob);
        // Generate virtual link
        const link = document.createElement('a');
        link.href = fileData;
        this.loading = false;
      })
      .catch(error => {
        this.loading = false;
      });
  }

}
