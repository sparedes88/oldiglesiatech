import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { GalleryAlbumModel, GalleryModel, GalleryPictureModel } from 'src/app/models/GalleryModel';
import { GalleryService } from 'src/app/services/gallery.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-gallery-album-view',
  templateUrl: "./gallery-album-view.component.html",
  styleUrls: ["./gallery-album-view.component.scss"],
})
export class GalleryAlbumViewComponent implements OnInit {

  @Input('idGalleryAlbum') idGalleryAlbum: number;
  @Input('idOrganization') idOrganization: number;
  @Input('style_settings') style_settings: any = {
    is_full_width: false
  };
  @Input('is_auto_open') is_auto_open: boolean;

  selected_gallery: GalleryModel;

  album: GalleryAlbumModel;
  current_user: User;

  loading: boolean = true;

  constructor(
    private gallery_service: GalleryService,
    private user_service: UserService,
    private activated_route: ActivatedRoute
  ) {
    this.current_user = this.user_service.getCurrentUser();
  }

  ngOnInit(): void {
    if (this.activated_route.snapshot.params['id']) {
      this.idGalleryAlbum = Number(this.activated_route.snapshot.params['id']);
    }
    if (!this.idOrganization) {
      this.idOrganization = this.current_user.idIglesia
    }
    this.getGalleryAlbum();
  }

  async getGalleryAlbum() {
    this.loading = true;
    const params: Partial<GalleryAlbumModel> = {
      id: this.idGalleryAlbum,
      idOrganization: this.idOrganization
    }
    const response: any = await this.gallery_service.getAlbum(params).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.album = response;
      if (this.album.album_galleries) {
        if (this.album.album_galleries.length > 0) {
          if (this.album.album_galleries.length == 1) {
            this.selectGallery(this.album.album_galleries[0]);
          } else {
            if (this.is_auto_open) {
              this.selectGallery(this.album.album_galleries[0]);
            }
          }
        }
      } else {
        this.album.album_galleries = [];
      }
    }
    this.loading = false;
  }

  selectGallery(gallery: GalleryModel, index?: number) {
    this.selected_gallery = gallery;
  }

  close() {
    this.selected_gallery = undefined;
  }

  calculateHeight(div_container: any) {
    const h = this.getHeight(div_container);
    return { height: `${h}px` };
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

  getSrc(photo: GalleryPictureModel, sanitize?: boolean): any {
    let src: string | SafeResourceUrl;

    // const photo: GalleryPictureModel = group.value;
    if (photo.temp_src) {
      // console.log(sanitize);
      if (sanitize) {
        src = photo.temp_src;
      } else {
        // src = this.sanitizer.bypassSecurityTrustResourceUrl(photo.temp_src);
      }
      // return `url( ${this.sanitizer.bypassSecurityTrustResourceUrl(group.get('temp_src').value)})`;
    } else if (!photo.src_path) {
      src = 'assets/img/default-image.jpg';
    } else if (photo.src_path.startsWith('http')) {
      src = photo.src_path;
    } else {
      src = `${environment.serverURL}${photo.src_path}`;
    }
    return src;
  }
}
