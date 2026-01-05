import { GalleryAlbumGalleryModel, GalleryModel } from './../../models/GalleryModel';
import { Component, Input, OnInit, OnChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GalleryAlbumViewComponent } from 'src/app/pages/gallery/gallery-abum/gallery-album-view/gallery-album-view.component';
import { GalleryV2Component } from 'src/app/pages/gallery/v2/gallery-v2/gallery-v2.component';

@Component({
  selector: 'app-profile-galleries-display',
  templateUrl: './profile-galleries-display.component.html',
  styleUrls: ['./profile-galleries-display.component.scss']
})
export class ProfileGalleriesDisplayComponent implements OnInit, OnChanges {

  @Input('galleries') galleries: GalleryModel[];
  @Input('galleries_tab') galleries_tab: GalleryModel[] = [];
  @Input('idOrganization') idOrganization: number;
  @Input('view_mode') view_mode: string;
  @Input('style_settings') style_settings: any;

  @ViewChild('gallery_embed') gallery_embed: GalleryV2Component;
  @ViewChild('gallery_album_embed') gallery_album_embed: GalleryAlbumViewComponent;

  selected_gallery: GalleryModel;
  loading: boolean = false;
  wait_style: boolean = true;

  constructor(
    private activated_route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    if (this.galleries.length === 1) {
      this.selected_gallery = this.galleries[0];
    } else if (this.galleries.length > 1) {
      this.selected_gallery = this.galleries[0];
    }

    const page = this.activated_route.snapshot.paramMap.get('page');
    if (page && (page.endsWith('_6'))) {
      const subpage = this.activated_route.snapshot.paramMap.get('subpage');
      if (subpage === 'gallery' || subpage === 'album') {
        const slug = this.activated_route.snapshot.paramMap.get('slug');
        if (slug) {
          const slices = slug.split('-');
          if (slices.length > 0) {
            const idGallery = Number(slices[0]);

            if (!Number.isNaN(idGallery)) {
              const gallery = this.galleries.find(x => x.id === idGallery);
              this.selected_gallery = Object.assign({}, gallery);
            }
          }
        }
      } else {
        if (this.selected_gallery) {
          this.router.navigateByUrl(`${this.actual_page}/${this.selected_gallery.id}`)
        }
      }
    }
    setTimeout(() => {
      this.setStyle();
    }, 100);
  }

  setStyle() {

    this.wait_style = true;
    if (this.galleries_tab.length > 0) {
      if (this.selected_gallery) {
        let full_cat;
        if (this.selected_gallery.idGalleryViewMode === 1) {
          full_cat = this.galleries_tab.find(cat => cat.idGallery === this.selected_gallery.idGallery);
        } else if (this.selected_gallery.idGalleryViewMode === 2) {
          full_cat = this.galleries_tab.find(cat => cat.idGalleryAlbum === this.selected_gallery.idGalleryAlbum);
        } else {
          full_cat = this.galleries_tab.find(cat => cat.idGallery === this.selected_gallery.idGallery);
        }
      }
      this.galleries.forEach(x => {
        const full_cat = this.galleries_tab.find(cat => cat.idGallery === x.id)

        if (full_cat) {
          x.text_align = full_cat.text_align;
          x.background_color = full_cat.background_color;
          x.active_background_color = full_cat.active_background_color;
          x.hover_background_color = full_cat.hover_background_color;
          x.font_color = full_cat.font_color;
          x.font_weight = full_cat.font_weight;
          x.font_style = full_cat.font_style;
          x.font_size = full_cat.font_size;
        }
      });
      this.wait_style = false;
    } else {
      this.wait_style = false;
    }
    // // this.wait_style = true;
    // // if (this.galleries_tab.length > 0) {
    // //   this.galleries.forEach(x => {
    // //     const full_cat = this.galleries_tab.find(cat => cat.idGallery === x.id)

    // //     if (full_cat) {
    // //       x.text_align = full_cat.text_align;
    // //       x.background_color = full_cat.background_color;
    // //       x.active_background_color = full_cat.active_background_color;
    // //       x.hover_background_color = full_cat.hover_background_color;
    // //       x.font_color = full_cat.font_color;
    // //       x.font_weight = full_cat.font_weight;
    // //       x.font_style = full_cat.font_style;
    // //       x.font_size = full_cat.font_size;
    // //     }
    // //   });
    // //   this.wait_style = false;
    // // } else {
    // //   this.wait_style = false;
    // // }
  }

  ngOnChanges(change) {
    if (this.galleries.length === 1) {
      this.selected_gallery = this.galleries[0];
    }
    this.setStyle();
  }

  scroll(direction: number) {
    document.getElementById('scroll-x').scrollLeft += direction;
  }

  setGallery(gallery: GalleryModel) {
    console.log(gallery);
    if (this.view_mode !== 'edition') {
      this.selected_gallery = gallery;
      setTimeout(() => {
        if (gallery.idGalleryViewMode == 1) {
          this.gallery_embed.idGallery = gallery.idGallery;
          this.gallery_embed.getGallery();
        } else {
          this.gallery_album_embed.selected_gallery = undefined;
          this.gallery_album_embed.idGalleryAlbum = gallery.idGalleryAlbum;
          this.gallery_album_embed.getGalleryAlbum();
        }
      }, 200);
    }
  }

  get actual_page() {
    const regex = new RegExp(/^[a-z0-9]+$/i, 'g');
    // const original_slug = `${this.selectedElement.idGroup} ${this.selectedElement.title}`;
    // const slug_ = original_slug.replace(regex, '').toLowerCase().replace(/\./g, '');
    // const slug = this.slugifyValue(slug_);
    const page = this.activated_route.snapshot.paramMap.get('page');
    if (page) {
      const subpage = this.activated_route.snapshot.paramMap.get('subpage');
      if (subpage) {
        return `/organization-profile/main/${this.idOrganization}/${page}/${subpage}`;
      }
      return `/organization-profile/main/${this.idOrganization}/${page}`;
    }
  }

}
