import { ActivatedRoute, Router } from '@angular/router';
import { ArticlesPerCategoryComponent } from './articles-per-category/articles-per-category.component';
import { ArticuloModel } from './../../models/ArticuloModel';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { OrganizationService } from 'src/app/services/organization/organization.service';

import { CategoriaArticuloModel } from './../../models/CategoriaArticuloModel';

@Component({
  selector: 'app-profile-articles-display',
  templateUrl: './profile-articles-display.component.html',
  styleUrls: ['./profile-articles-display.component.scss']
})
export class ProfileArticlesDisplayComponent implements OnInit, OnChanges {

  @Input('is_main_page') is_main_page: boolean;
  @Input('load_all') load_all: boolean;
  @Input('categories') categories: CategoriaArticuloModel[];
  @Input('categories_tab') categories_tab: CategoriaArticuloModel[] = [];
  @Input('idOrganization') idOrganization: number;
  @Input('view_mode') view_mode: string;
  @Input('grid_info_settings') grid_info_settings: any = {};
  @Input('show_category_name') show_category_name: boolean = false;
  @Output('onAddArticle') onAddArticle: EventEmitter<ArticuloModel> = new EventEmitter<ArticuloModel>();
  @Output('onEditArticle') onEditArticle: EventEmitter<ArticuloModel> = new EventEmitter<ArticuloModel>();
  @Output('onOpenArticle') onOpenArticle: EventEmitter<ArticuloModel> = new EventEmitter<ArticuloModel>();
  @ViewChild('articles_per_category') articles_per_category: ArticlesPerCategoryComponent;
  @Input('show_action_buttons') show_action_buttons: boolean = true;
  @Input('left_section_is_hide') left_section_is_hide: boolean = false;
  @Input('direct_redirection') direct_redirection: boolean = false;

  wait_style: boolean = true;
  selected_category: CategoriaArticuloModel;

  loading: boolean = false;
  articulos: any[] = [];
  need_refresh: boolean = false;

  constructor(
    private organizationService: OrganizationService,
    private activated_route: ActivatedRoute,
    private router: Router
  ) {
  }

  ngOnInit() {
    if (this.categories.length === 1) {
      this.selected_category = this.categories[0];
    } else if (this.categories.length > 1) {
      this.selected_category = this.categories[0];
    }

    const page = this.activated_route.snapshot.paramMap.get('page');
    if (page && (page.endsWith(`_2`))) {
      const subpage = this.activated_route.snapshot.paramMap.get('subpage');
      if (subpage === 'us') {
        const slug = this.activated_route.snapshot.paramMap.get('slug');
        if (slug) {
          const slices = slug.split('-');
          if (slices.length > 0) {
            const idCategoriaArticulo = Number(slices[0]);

            if (!Number.isNaN(idCategoriaArticulo)) {
              const category = this.categories.find(x => x.idCategoriaArticulo === idCategoriaArticulo);
              this.selected_category = Object.assign({}, category);
            }
          }
        }
      } else {
        if (this.selected_category) {
          this.router.navigateByUrl(`${this.actual_page}/${subpage}/${this.selected_category.idCategoriaArticulo}`)
        }
      }
    }
    setTimeout(() => {
      this.setStyle();
    }, 100);
  }
  setStyle() {

    this.wait_style = true;
    if (this.categories_tab.length > 0) {
      this.categories.forEach(x => {
        const full_cat = this.categories_tab.find(cat => cat.idCategoryArticle === x.idCategoriaArticulo)

        if (full_cat) {
          x.text_align = full_cat.text_align;
          x.background_color = full_cat.background_color;
          x.active_background_color = full_cat.active_background_color;
          x.hover_background_color = full_cat.hover_background_color;
          x.font_color = full_cat.font_color;
          x.font_weight = full_cat.font_weight;
          x.font_style = full_cat.font_style;
          x.font_size = full_cat.font_size;
          x.sort_type = full_cat.sort_type;
        }
      });
      this.wait_style = false;
    } else {
      this.wait_style = false;
    }
  }

  ngOnChanges(change) {
    if (change.categories) {
      this.setStyle();
      if (change.categories.currentValue.length === 1) {
        this.selected_category = change.categories.currentValue[0];
      }
    }
    if (change.categories_tab) {
      const actual_id = this.selected_category.idCategoriaArticulo;
      const actual_category = change.categories_tab.currentValue.find(x => x.idCategoryArticle === actual_id);
      const prev_category = change.categories_tab.previousValue.find(x => x.idCategoryArticle === actual_id);
      if (prev_category && actual_category) {
        if (this.selected_category.sort_type != actual_category.sort_type) {
          this.need_refresh = true;
        } else {
          this.need_refresh = false;
        }
      }
      this.setStyle();
    }
  }

  scroll(direction: number) {
    document.getElementById('scroll-x').scrollLeft += direction;
  }

  setCategory(category: CategoriaArticuloModel) {
    // if (this.view_mode !== 'edition') {
    this.selected_category = category;
    setTimeout(() => {
      this.articles_per_category.category = category;
      this.articles_per_category.getArticles();
    }, 1);
    // }
  }

  refreshArticles(category: CategoriaArticuloModel) {
    // if (this.view_mode !== 'edition') {
    if (this.articles_per_category) {
      this.articles_per_category.getArticles();
    }
    // }
  }

  addArticle(event) {
    this.onAddArticle.emit(event);
  }

  editArticle(event) {
    this.onEditArticle.emit(event);
  }

  openArticle(event) {
    this.onOpenArticle.emit(event);
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
