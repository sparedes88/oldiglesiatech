import { ApiService } from './../../services/api.service';
import { ArticuloMediaModel } from './../../models/ArticuloModel';
import { Component, OnInit, Input, ElementRef, ViewChild, ViewChildren, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { MediaDocumentModel } from 'src/app/models/VideoModel';
import { VideoplayerComponent } from 'src/app/pages/videos/videoplayer/videoplayer.component';
import { DocumentEmbedComponent } from 'src/app/pages/videos/document-embed/document-embed.component';
import { Router } from '@angular/router';

@Component({
  selector: 'articulo-media',
  templateUrl: './articulo-media.component.html',
  styleUrls: ['./articulo-media.component.scss']
})
export class ArticuloMediaComponent implements OnInit {

  private link: string;

  @Input() articuloMedia: ArticuloMediaModel;
  @ViewChild('video_player') video_player: VideoplayerComponent;
  @ViewChild('document_embed') document_embed: DocumentEmbedComponent;

  @Output('close_others') close_others: EventEmitter<{ media: MediaDocumentModel, articulo_media: ArticuloMediaModel }> = new EventEmitter<{ media: MediaDocumentModel, articulo_media: ArticuloMediaModel }>();

  constructor(
    private domSanitizer: DomSanitizer,
    private api: ApiService,
    private element: ElementRef,
    private router: Router
  ) {
  }

  ngOnInit() {
    if (this.articuloMedia.mediaType === 'Content') {
      if (!this.articuloMedia.hasBeenSanitized) {
        this.articuloMedia.original_content = this.articuloMedia.content;
        this.articuloMedia.content = this.articuloMedia.content.replace(/&lt;/gm, '<').replace(/&gt;/gm, '>');
        const contenido = this.domSanitizer.bypassSecurityTrustHtml(this.articuloMedia.content);
        this.articuloMedia.content = contenido;
        setTimeout(() => {
          Array.prototype.forEach.call(document.getElementsByClassName('fix-frame'), element => {
            Array.prototype.forEach.call(element.getElementsByTagName('p'), p => {
              p.classList.add('card-content-fixed');
              Array.prototype.forEach.call(p.getElementsByTagName('iframe'), img => {
                p.classList.add('p-embed-frame');
                p.style.textAlign = 'center';
                img.style.maxWidth = '100%';
                img.classList.add('frame-style-custom');
              });
              Array.prototype.forEach.call(p.getElementsByTagName('img'), img => {
                img.style.maxWidth = '100%';
                img.classList.add('img-style-frame-custom');
              });
            });
            Array.prototype.forEach.call(element.getElementsByTagName('iframe'), img => {
              img.style.maxWidth = '100%';
              img.classList.add('frame-style-custom');
            });
          });
        });
      }
    } else if (this.articuloMedia.mediaType === 'Video' && this.articuloMedia.idMediaType != 8) {
      if (!this.articuloMedia.hasBeenSanitized) {
        this.articuloMedia.original_url = this.articuloMedia.url;
        const url = this.domSanitizer.bypassSecurityTrustResourceUrl(this.articuloMedia.url);
        this.articuloMedia.url = url;
      }
    } else if (this.articuloMedia.idMediaType == 6) {
      if (this.articuloMedia.media_item.file_info) {
        const link = `${environment.serverURL}${this.articuloMedia.media_item.file_info.src_path}`;
        this.articuloMedia.media_item.url = link;
      }
    } else if (this.articuloMedia.idMediaType == 8) {
      if (this.articuloMedia.media_item) {

        const iframe_url = this.articuloMedia.media_item.embed_frame;
        const src_index = iframe_url.indexOf('src="') + 5;
        const next_index = iframe_url
          .substring(src_index)
          .indexOf('"');
        this.articuloMedia.media_item.url = this.articuloMedia.media_item.embed_frame.substring(
          src_index,
          src_index + next_index
        );
        setTimeout(() => {
          if (!this.video_player.video) {
            this.video_player.video = this.articuloMedia.media_item;
          }
          if (this.video_player.video) {
            if (this.video_player.video.idVideo !== this.articuloMedia.media_item.idVideo) {
              this.video_player.src = this.articuloMedia.media_item.url;
              this.video_player.video = this.articuloMedia.media_item;
              this.video_player.ngOnInit();
            }
          }
        }, 50);
      }
    }
    this.articuloMedia.hasBeenSanitized = true;
    this.enableDynamicHyperlinks()
  }

  private enableDynamicHyperlinks(): void {
    // Provide a minor delay to allow the HTML to be rendered and 'found'
    // within the view template
    setTimeout(() => {
      // Query the DOM to find ALL occurrences of the <a> hyperlink tag
      const urls: any = this.element.nativeElement.querySelectorAll('a');
      // Iterate through these
      urls.forEach((url) => {
        const full_url: string = url['href'];
        if (full_url.startsWith('http') && full_url.includes(url.baseURI) && url.className.includes('src-custom-button-as-internal')) {
          url.removeEventListener('click', () => { });
          url.addEventListener('click', (event) => {
            event.preventDefault();
            let site_link: string = url['href'];
            if (full_url.startsWith('http')) {
              site_link = site_link.replace(url.baseURI, '');
            }
            this.router.navigateByUrl(site_link);
          })
        } else {
          // Listen for a click event on each hyperlink found
          url.addEventListener('click', (event) => {
            if (event.target.href) {
              this.link = event.target.href;
            } else {
              this.link = url['href'];
            }
            // Retrieve the href value from the selected hyperlink
            event.preventDefault();

            this.launchInAppBrowser(this.link);
          }, false);
        }
      });
    }, 200);

    setTimeout(() => {
      Array.prototype.forEach.call(document.getElementsByClassName('card-content'), element => {
        Array.prototype.forEach.call(element.getElementsByTagName('p'), p => {
          p.classList.add('card-content-fixed');
          p.style.marginBottom = '0px';
          Array.prototype.forEach.call(p.getElementsByTagName('iframe'), img => {
            img.style.maxWidth = '100%';
            img.classList.add('frame-style-custom');
          });
        });
      });
    });
  }

  private launchInAppBrowser(link: string): void {
    // const opts: string = "location=yes,clearcache=yes,hidespinner=no"
    // this.iab.create(link, '_system', opts);
    window.open(link);
  }

  fixUrl(image: string) {
    if (image) {
      if (image.includes('https://')) {
        return `${image}`;
      }
      return `${this.api.baseUrl}${image}`;
    }
    return 'assets/img/default-image.jpg';
  }

  openDocument(document: MediaDocumentModel) {
    const link = `${environment.serverURL}${document.file_info.src_path}`;
    window.open(link, '_blank');

  }

  get document_link() {
    return `${environment.serverURL}${this.articuloMedia.media_item.file_info.src_path}`
  }

  getPicture(picture) {
    if (!picture) {
      return "https://iglesiatech.app/assets/img/default-image.jpg";
    } else if (picture.includes("http")) {
      return picture;
    }
    return `${environment.serverURL}${picture}`;
  }

  closeOthers(document: MediaDocumentModel) {
    this.close_others.emit({
      media: document,
      articulo_media: this.articuloMedia
    });
  }

}
