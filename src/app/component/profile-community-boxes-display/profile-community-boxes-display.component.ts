import { Component, Input, OnInit, OnChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommunityBoxModel } from 'src/app/models/CommunityBoxModel';
import { ViewComponent } from 'src/app/pages/community-box/view/view.component';

@Component({
  selector: 'app-profile-community-boxes-display',
  templateUrl: './profile-community-boxes-display.component.html',
  styleUrls: ['./profile-community-boxes-display.component.scss']
})
export class ProfileCommunityBoxesDisplayComponent implements OnInit, OnChanges {

  @Input('community_boxes') community_boxes: CommunityBoxModel[];
  @Input('community_boxes_tab') community_boxes_tab: CommunityBoxModel[] = [];
  @Input('idOrganization') idOrganization: number;
  @Input('view_mode') view_mode: string;

  @ViewChild('community_box_embed') community_box_embed: ViewComponent;

  selected_community_box: CommunityBoxModel;
  loading: boolean = false;
  wait_style: boolean = true;

  constructor(
    private activated_route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    console.log(this.community_boxes);
    console.log(this.community_boxes_tab);

    if (this.community_boxes.length === 1) {
      this.selected_community_box = this.community_boxes[0];
    } else if (this.community_boxes.length > 1) {
      this.selected_community_box = this.community_boxes[0];
    }
    const settings = this.community_boxes_tab.find(x => x.idCommunityBox == this.selected_community_box.id);
    if (settings) {
      this.selected_community_box.display_new_style = settings.display_new_style;
    }

    const page = this.activated_route.snapshot.paramMap.get('page');
    if (page && (page.endsWith('_8'))) {
      const subpage = this.activated_route.snapshot.paramMap.get('subpage');
      if (subpage === 'community_box') {
        const slug = this.activated_route.snapshot.paramMap.get('slug');
        if (slug) {
          const slices = slug.split('-');
          if (slices.length > 0) {
            const idCommunityBox = Number(slices[0]);

            if (!Number.isNaN(idCommunityBox)) {
              const community_box = this.community_boxes.find(x => x.id === idCommunityBox);
              this.selected_community_box = Object.assign({}, community_box);
            }
          }
        }
      } else {
        if (this.selected_community_box) {
          this.router.navigateByUrl(`${this.actual_page}/community_box/${this.selected_community_box.id}`)
        }
      }
    }
    setTimeout(() => {
      this.setStyle();
    }, 100);

  }

  setStyle() {

    this.wait_style = true;
    if (this.community_boxes_tab.length > 0) {
      this.community_boxes.forEach(x => {
        const full_cat = this.community_boxes_tab.find(cat => cat.idCommunityBox === x.id)

        if (full_cat) {
          x.text_align = full_cat.text_align;
          x.background_color = full_cat.background_color;
          x.active_background_color = full_cat.active_background_color;
          x.hover_background_color = full_cat.hover_background_color;
          x.font_color = full_cat.font_color;
          x.font_weight = full_cat.font_weight;
          x.font_style = full_cat.font_style;
          x.font_size = full_cat.font_size;
          x.display_new_style = full_cat.display_new_style;
        }
      });
      this.wait_style = false;
    } else {
      this.wait_style = false;
    }
  }

  ngOnChanges(change) {
    if (this.community_boxes.length === 1) {
      this.selected_community_box = this.community_boxes[0];
    }
    this.setStyle();
  }

  scroll(direction: number) {
    document.getElementById('scroll-x').scrollLeft += direction;
  }

  setCommunityBox(community_box: CommunityBoxModel) {
    if (this.view_mode !== 'edition') {
      this.selected_community_box = community_box;
      this.community_box_embed.cleanMarkers();
      this.community_box_embed.communityId = community_box.id;
      this.community_box_embed.getCommunity();
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
