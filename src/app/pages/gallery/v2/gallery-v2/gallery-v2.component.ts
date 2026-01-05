import { environment } from 'src/environments/environment.prod';
import { Component, OnInit, Input, ViewChild, EventEmitter, Output } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { NgxSmartModalService } from "ngx-smart-modal";
import { ActivatedRoute } from "@angular/router";
import { NgbCarousel } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GalleryPictureModel } from 'src/app/models/GalleryModel';

@Component({
  selector: "app-gallery-v2",
  templateUrl: "./gallery-v2.component.html",
  styleUrls: ["./gallery-v2.component.scss"],
})
export class GalleryV2Component implements OnInit {

  @ViewChild('carousel') carousel: NgbCarousel;

  constructor(
    private api: ApiService,
    private modal: NgxSmartModalService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {
    const id = this.route.snapshot.params["idGallery"];
    if (id) this.idGallery = id;
  }

  @Input() idGallery: number;
  @Input() show_horizontal: boolean = false;
  @Input() is_from_album: boolean;
  @Input('style_settings') style_settings: any;

  public gallery: any = {};
  public selectedPhoto: string;
  public loading: boolean = false;

  @Output('on_close') on_close: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit() {
    this.getGallery();
  }

  getGallery() {
    this.loading = true;
    this.api.get(`galleries/details/${this.idGallery}`).subscribe(
      (data: any) => {
        // data.photos = JSON.parse(data.photos);
        this.gallery = data;
        console.log(this.gallery);
        this.loading = false;
      },
      (err) => {
        console.error(err);
        this.loading = false;
      });
  }

  openPhoto(photo, index?: number) {
    this.selectedPhoto = photo;
    console.log(this.carousel);
    console.log(index);
    console.log(index || index == 0);

    this.carousel.pause();
    this.carousel.interval = 0;
    if (index || index == 0) {
      this.carousel.select(`id_${index}`);
    }
    this.modal.getModal("photoModal").open();
  }

  getUrlBack(photo) {
    // console.log(photo);
    if (photo.src_path.startsWith('http')) {
      return `url( ${photo.src_path} )`;
    }
    return `url( ${environment.serverURL}${photo.src_path})`;
  }

  // getSrc(photo) {
  //   console.log(photo);
  //   if (photo.src_path.startsWith('http')) {
  //     return photo.src_path;
  //   }
  //   return `${environment.serverURL}${photo.src_path}`;
  // }

  getSrc(photo: GalleryPictureModel, sanitize?: boolean): any {
    let src: string | SafeResourceUrl;

    // const photo: GalleryPictureModel = group.value;
    if (photo.temp_src) {
      // console.log(sanitize);
      if (sanitize) {
        src = photo.temp_src;
      } else {
        src = this.sanitizer.bypassSecurityTrustResourceUrl(photo.temp_src);
      }
      // return `url( ${this.sanitizer.bypassSecurityTrustResourceUrl(group.get('temp_src').value)})`;
    } else if (photo.src_path.startsWith('http')) {
      src = photo.src_path;
    } else {
      src = `${environment.serverURL}${photo.src_path}`;
    }
    return src;
  }

  getHeight(self_div) {
    const width = self_div.offsetWidth;
    const h = width / 1.777776;
    return h;
  }

  getNewStyle(photo: GalleryPictureModel, self_div: any) {
    const url = this.getSrc(photo, true);
    let zoom = (photo.zoom || 1) * 100;
    if (zoom < 100) {
      zoom = 100;
    }
    const h = this.getHeight(self_div);
    return {
      'background-image': `url('${url}')`,
      'background-size': `${zoom}%`,
      'background-position-x': `${photo.x_position}%`,
      'background-position-y': `${photo.y_position}%`,
      height: `${h}px`
    }
  }

  calculateHeight(div_container: any) {
    const h = this.getHeight(div_container);
    return { height: `${h}px` };
  }

  close() {
    this.on_close.emit({});
  }
}
