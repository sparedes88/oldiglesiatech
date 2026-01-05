import { EventEmitter, Output, ViewChild } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { MatExpansionPanel } from '@angular/material';
import { environment } from 'src/environments/environment';
import { Item } from '../../details/list-item/item';

@Component({
  selector: 'app-community-container',
  templateUrl: './community-container.component.html',
  styleUrls: ['./community-container.component.scss']
})
export class CommunityContainerComponent implements OnInit {

  @Input('community') community: any;
  @Input('item') item: Item;
  @Input('searchBoxValue') searchBoxValue: string;
  @Input('iglesia') iglesia: any;

  @ViewChild('accordion') accordion: MatExpansionPanel;

  @Output('open_entry') open_entry: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      if (this.community.style_settings) {
        if (this.community.style_settings.header_text_color) {
          const panel_headers = document.getElementsByClassName('custom_panel_header');

          for (let index = 0; index < panel_headers.length; index++) {
            const element = panel_headers[index];
            window.getComputedStyle(element).setProperty('--be-text', this.community.style_settings.header_text_color || 'black');
          }
        }
      }
      // if (this.accordions.length > 0) {
      //   this.accordions.first.expanded = true;
      // }
    }, 100);
  }


  filtered_group_entries(group, accordion: MatExpansionPanel): Array<any> {
    let values = group.entries;
    if (group.searchBoxValue) {
      values = values.filter(
        (entry) => {
          return (
            entry.business_name
              .toLowerCase()
              .includes(group.searchBoxValue.toLowerCase()) ||
            `${entry.contact_first_name} ${entry.contact_last_name}`
              .toLocaleLowerCase()
              .includes(group.searchBoxValue.toLowerCase()) ||
            entry.business_summary
              .toLowerCase()
              .includes(group.searchBoxValue.toLowerCase()) ||
            entry.locations
              .toLowerCase()
              .includes(group.searchBoxValue.toLowerCase())
          );
        }
      );
    }
    if (this.searchBoxValue) {
      values = values.filter(
        (entry) => {
          return (
            entry.business_name
              .toLowerCase()
              .includes(this.searchBoxValue.toLowerCase()) ||
            `${entry.contact_first_name} ${entry.contact_last_name}`
              .toLocaleLowerCase()
              .includes(this.searchBoxValue.toLowerCase()) ||
            entry.business_summary
              .toLowerCase()
              .includes(this.searchBoxValue.toLowerCase()) ||
            entry.locations
              .toLowerCase()
              .includes(this.searchBoxValue.toLowerCase())
          );
        }
      );
    }

    // if (this.selectedCategory && this.selectedCategory != "all") {
    //   values = values.filter(
    //     function (entry) {
    //       return entry.industry.includes(this.selectedCategory);
    //     }.bind(this)
    //   );
    // }
    if (this.searchBoxValue && this.searchBoxValue != '') {
      if (values.length > 0) {
        accordion.expanded = true;
      } else {
        if (this.item.type === 'container') {
          accordion.expanded = false;
        }
      }
    }

    return values;
  }


  fixUrl(image: string) {
    if (image) {
      if (image.includes('https://')) {
        return `${image}`;
      }
      return `${environment.serverURL}${image}`;
    }
    if (this.iglesia) {
      const path = this.fixUrl(this.iglesia.Logo);
      return path;
    }
    return '/assets/img/favicon.png';
  }

  openDetailsModal(entry) {
    this.open_entry.emit(entry);
  }

}
