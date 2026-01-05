import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MediaDocumentModel } from 'src/app/models/VideoModel';
import { ApiService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment.prod';
import { DocumentViewerComponent } from '../document-viewer/document-viewer.component';

@Component({
  selector: 'app-document-embed',
  templateUrl: './document-embed.component.html',
  styleUrls: ['./document-embed.component.scss']
})
export class DocumentEmbedComponent implements OnInit {


  @ViewChild('document_viewer') document_viewer: DocumentViewerComponent;

  @Input('media_item') media_item: MediaDocumentModel;
  @Input('handle_as_page') handle_as_page: boolean;
  @Input('emit_open') emit_open: boolean;
  selected_file: MediaDocumentModel;

  @Output('open_video') open_video: EventEmitter<MediaDocumentModel> = new EventEmitter<MediaDocumentModel>();

  constructor(
    private api: ApiService
  ) {
  }

  ngOnInit() {
    console.log(this.selected_file);
  }

  closeVideo() {
    this.selected_file = undefined;
  }

  getPicture(picture) {
    if (!picture) {
      return "https://iglesiatech.app/assets/img/default-image.jpg";
    } else if (picture.includes("http")) {
      return picture;
    }
    return `${this.api.baseUrl}${picture}`;
  }

  openDocument(document: MediaDocumentModel) {
    if (document.is_embed) {
      if(this.emit_open){
        this.open_video.emit(document);
      }
      const link = `${environment.serverURL}${document.file_info.src_path}`;
      document.url = link;
      this.selected_file = document;
      setTimeout(() => {
        if (!this.document_viewer.video) {
          const link = `${environment.serverURL}${document.file_info.src_path}`;
          this.document_viewer.video = document;
          this.document_viewer.src = link;
        }
        if (this.document_viewer.video) {
          if (this.document_viewer.video.idVideo !== document.idVideo) {
            const link = `${environment.serverURL}${document.file_info.src_path}`;
            this.document_viewer.src = link;
            this.document_viewer.video = document;
            this.document_viewer.ngOnInit();
          }
        }
      });
    } else {
      const link = `${environment.serverURL}${document.file_info.src_path}`;
      window.open(link, '_blank');
    }

  }
}
