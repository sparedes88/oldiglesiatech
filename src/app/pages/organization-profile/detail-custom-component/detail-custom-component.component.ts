import { ProfileArticlesDisplayComponent } from 'src/app/component/profile-articles-display/profile-articles-display.component';
import { ProfileContactInboxDisplayComponent } from './../../../component/profile-contact-inbox-display/profile-contact-inbox-display.component';
import { ViewChild } from '@angular/core';
import { ApiService } from './../../../services/api.service';
import { StyleSettingModel, GroupsEmbedComponent } from './../../../component/groups-embed/groups-embed.component';
import { Component, Input, OnInit } from '@angular/core';
import { ProfileGalleriesDisplayComponent } from 'src/app/component/profile-galleries-display/profile-galleries-display.component';

@Component({
  selector: 'app-detail-custom-component',
  templateUrl: './detail-custom-component.component.html',
  styleUrls: ['./detail-custom-component.component.scss']
})
export class DetailCustomComponentComponent implements OnInit {

  @Input('idSubmodule') idSubmodule: number;
  @Input('idOrganization ') idOrganization: number;
  @Input('item_id ') item_id: number;
  // @Input('items ') items: any[] = [];
  @Input('grid_info_settings') grid_info_settings: any = {};
  @Input('style_settings') style_settings: StyleSettingModel = {
    text_color: "#ffffff",
    degrees: 112,
    main_color: "#e65100",
    main_percent: 72,
    second_color: "#ffb994",
    second_percent: 100,
    show_shadow: true,
    display_header: true,
    items_per_row: 2,
    col_size: 'col-sm-6'
  }
  items: any[] = [];

  @ViewChild('group_embed_custom') group_embed_custom: GroupsEmbedComponent;
  // is_loading: boolean = false;

  @ViewChild('detail_category_articles_display') detail_category_articles_display: ProfileGalleriesDisplayComponent | ProfileContactInboxDisplayComponent | ProfileArticlesDisplayComponent;
  selected_item: any;

  constructor(
    private api: ApiService
  ) { }

  ngOnInit() {
    // this.is_loading = false;
    console.log(this.items);
    console.log(this.item_id);

    this.api
      .get(`iglesias/getItemDetail`, {
        idIglesia: this.idOrganization,
        idSubmodule: this.idSubmodule,
        item_id: this.item_id
      })
      .subscribe((data: any) => {
        this.items = data.items;
        console.log(this.items);
        console.log(this.item_id);
        this.selected_item =  this.items.find(x => x.id == this.item_id);
        // console.log(item);

        setTimeout(() => {
          console.log(this.selected_item);

          console.log(this.detail_category_articles_display);
          console.log(this.detail_category_articles_display instanceof ProfileGalleriesDisplayComponent);
          if (this.detail_category_articles_display instanceof ProfileGalleriesDisplayComponent) {
            (this.detail_category_articles_display as ProfileGalleriesDisplayComponent).setGallery(this.selected_item);
          } else if (this.detail_category_articles_display instanceof ProfileContactInboxDisplayComponent) {
            (this.detail_category_articles_display as ProfileContactInboxDisplayComponent).setContactInbox(this.selected_item);
          }
        }, 200);
      }, error => {
        this.items = [];
      });
    setTimeout(() => {

      if (this.idSubmodule === 5) {
        if (this.group_embed_custom) {
          this.group_embed_custom.getSelectedElement(this.item_id, true);
        }
      }
      // this.is_loading = true;

    }, 100);
  }

  // get selected_item() {
  //   return this.items.find(x => x.id === this.item_id);
  // }

}
