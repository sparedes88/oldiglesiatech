import { GalleryV2Component } from 'src/app/pages/gallery/v2/gallery-v2/gallery-v2.component';
import { Component, Input, OnInit, OnChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DonationsV2Component } from 'src/app/pages/donations/donations-v2/donations-v2.component';
export class ItemModel {
  id: number;
  idGallery: number;
  idDonationForm: number;
  name: string;
  description: string;
  photos: any[];

  text_align?: string;
  active_background_color?: string;
  hover_background_color?: string;
  background_color?: string;
  font_color?: string;
  font_weight?: string;
  font_style?: string;
  font_size?: string;
  is_hover?: boolean;
  ids: any[];
  items: any[];
}

@Component({
  selector: 'app-profile-items-display',
  templateUrl: './profile-items-display.component.html',
  styleUrls: ['./profile-items-display.component.scss']
})
export class ProfileItemsDisplayComponent implements OnInit, OnChanges {

  @Input('items') items: ItemModel[];
  @Input('items_in_tab') items_in_tab: ItemModel[] = [];
  @Input('idOrganization') idOrganization: number;
  @Input('view_mode') view_mode: string;
  @Input('style_settings') style_settings: any;
  @Input('idModule') number: number;

  @ViewChild('item_embed') item_embed: DonationsV2Component | GalleryV2Component;

  selected_item: ItemModel;
  loading: boolean = false;
  wait_style: boolean = true;

  constructor(
    private activated_route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    if (this.items.length === 1) {
      this.selected_item = this.items[0];
    } else if (this.items.length > 1) {
      this.selected_item = this.items[0];
    }

    const page = this.activated_route.snapshot.paramMap.get('page');
    if (page && (page.endsWith('_6'))) {
      const subpage = this.activated_route.snapshot.paramMap.get('subpage');
      if (subpage === 'item') {
        const slug = this.activated_route.snapshot.paramMap.get('slug');
        if (slug) {
          const slices = slug.split('-');
          if (slices.length > 0) {
            const idItem = Number(slices[0]);

            if (!Number.isNaN(idItem)) {
              const item = this.items.find(x => x.id === idItem);
              this.selected_item = Object.assign({}, item);
            }
          }
        }
      } else {
        if (this.selected_item) {
          this.router.navigateByUrl(`${this.actual_page}/donations/${this.selected_item.id}`)
        }
      }
    }
    setTimeout(() => {
      this.setStyle();
    }, 100);
  }

  setStyle() {

    this.wait_style = true;
    if (this.items_in_tab.length > 0) {
      this.items.forEach(x => {
        const full_cat = this.items_in_tab.find(cat => cat.idDonationForm === x.id)

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
  }

  ngOnChanges(change) {
    if (this.items.length === 1) {
      this.selected_item = this.items[0];
    }
    this.setStyle();
  }

  scroll(direction: number) {
    document.getElementById('scroll-x').scrollLeft += direction;
  }

  setItem(item: ItemModel) {

    if (this.view_mode !== 'edition') {
      this.selected_item = item;
      (this.item_embed as DonationsV2Component).id = item.id;
      (this.item_embed as DonationsV2Component).getDonationSetup();
    }
  }

  get actual_page() {
    const regex = new RegExp(/^[a-z0-9]+$/i, 'g');
    // const original_slug = `${this.selectedElement.idGroup} ${this.selectedElement.title}`;
    // const slug_ = original_slug.replace(regex, '').toLowerCase().replace(/\./g, '');
    // const slug = this.slugifyValue(slug_);
    const page = this.activated_route.snapshot.paramMap.get('page');
    if (page) {
      return `/organization-profile/main/${this.idOrganization}/${page}`;
    }
  }

}
