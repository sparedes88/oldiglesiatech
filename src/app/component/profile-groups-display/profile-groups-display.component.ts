import { GroupsEmbedComponent } from './../groups-embed/groups-embed.component';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MailingListModel } from 'src/app/models/MailingListModel';

@Component({
  selector: 'app-profile-groups-display',
  templateUrl: './profile-groups-display.component.html',
  styleUrls: ['./profile-groups-display.component.scss']
})
export class ProfileGroupsDisplayComponent implements OnInit {

  @Input('items') items: any[];
  @Input('items_tab') items_tab: any[] = [];
  @Input('categories') categories: any[] = [];
  @Input('idOrganization') idOrganization: number;
  @Input('view_mode') view_mode: string;
  @Input('display_load') display_load: boolean = true;
  @Input('style_settings') style_settings: any;
  @Input('idGroupViewMode') idGroupViewMode: number;

  @Output('loading_finished') loading_finished: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('groups_embed') groups_embed: GroupsEmbedComponent;

  selected_group_type: any;
  loading: boolean = true;
  wait_style: boolean = true;

  constructor(
    private dom_sanitizer: DomSanitizer,
    private activated_route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    if (this.items.length === 1) {
      this.selected_group_type = this.items[0];
    } else if (this.items.length > 1) {
      this.selected_group_type = this.items[0];
    }
    const page = this.activated_route.snapshot.paramMap.get('page');
    if (page && (page.endsWith('_5'))) {
      const subpage = this.activated_route.snapshot.paramMap.get('subpage');
      if (subpage === 'groups' || subpage === 'category') {
        const slug = this.activated_route.snapshot.paramMap.get('slug');
        if (slug) {
          const slices = slug.split('-');
          if (slices.length > 0) {
            const idGroupType = Number(slices[0]);
            if (!Number.isNaN(idGroupType)) {
              const group_type = this.items.find(x => x.id === idGroupType);
              this.selected_group_type = Object.assign({}, group_type);
              if (JSON.stringify(this.selected_group_type) == '{}' && this.items.length >= 1) {
                this.selected_group_type = this.items[0];
                this.router.navigateByUrl(`${this.actual_page}/${this.selected_group_type.id}`)
              }
              // if (this.idGroupViewMode === 1) {
              // } else {
              //   const group_type = this.items.find(x => x.idGroupCategory === idGroupType);
              //   this.selected_group_type = Object.assign({}, group_type);
              // }
            }
          }
        }
      } else {
        if (this.selected_group_type) {
          this.router.navigateByUrl(`${this.actual_page}/${this.selected_group_type.idGroupType}`)
        }
      }
    }
    setTimeout(() => {
      this.setStyle();
    }, 100);
  }

  setStyle() {

    this.wait_style = true;
    if (this.items_tab.length > 0) {
      if (this.selected_group_type) {
        let full_cat;
        if (this.selected_group_type.idGroupViewMode === 1) {
          full_cat = this.items_tab.find(cat => cat.idGroupType === this.selected_group_type.idGroupType);
        } else if (this.selected_group_type.idGroupViewMode === 2) {
          full_cat = this.items_tab.find(cat => cat.idGroupCategory === this.selected_group_type.idGroupCategory);
        } else if (this.selected_group_type.idGroupViewMode === 3) {
          full_cat = this.items_tab.find(cat => cat.idGroupType === this.selected_group_type.idGroupType && cat.idGroupCategory === this.selected_group_type.idGroupCategory);
        } else {
          full_cat = this.items_tab.find(cat => cat.idGroupType === this.selected_group_type.idGroupType);
        }

        const string_cat = JSON.stringify(this.selected_group_type);
        const string_new = JSON.stringify(full_cat);
        if (string_cat != string_new) {
          this.selected_group_type = Object.assign(full_cat);
          setTimeout(() => {
            if (this.groups_embed) {
              this.groups_embed.getGroups();
            }
          }, 100);
        }
      }
      this.wait_style = false;
    } else {
      this.wait_style = false;
    }
  }

  ngOnChanges(change) {
    if (this.items.length === 1) {
      this.selected_group_type = this.items[0];
    }
    this.setStyle();
  }

  scroll(direction: number) {
    document.getElementById('scroll-x').scrollLeft += direction;
  }

  setGroupType(group_type: any) {
    this.loading = true;
    this.selected_group_type = group_type;
    this.groups_embed.group_type_id = group_type.idGroupType;
    this.groups_embed.group_category_id = group_type.idGroupCategory;
    this.groups_embed.getGroups();
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

  finishLoad() {
    if (this.display_load) {
      this.loading = false;
    } else {
      this.loading_finished.emit();
    }
  }

  is_active(element) {
    if (this.selected_group_type) {
      if (this.selected_group_type.idGroupViewMode === 1) {
        return this.selected_group_type.idGroupType === element.idGroupType;
      } else if (this.selected_group_type.idGroupViewMode === 2) {
        return this.selected_group_type.idGroupCategory === element.idGroupCategory;
      } else if (this.selected_group_type.idGroupViewMode === 3) {
        return this.selected_group_type.idGroupCategory === element.idGroupCategory && this.selected_group_type.idGroupType === element.idGroupType;
      } else {
        return this.selected_group_type.idGroupType === element.idGroupType;
      }
    }
    return false;
  }

}
