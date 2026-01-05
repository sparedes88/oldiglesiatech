import { environment } from './../../../../environments/environment.prod';
import { ElementRef } from '@angular/core';
import { UserService } from './../../../services/user.service';
import { ArticuloModel } from './../../../models/ArticuloModel';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { OrganizationService } from 'src/app/services/organization/organization.service';

import { CategoriaArticuloModel } from './../../../models/CategoriaArticuloModel';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ToastType } from 'src/app/login/ToastTypes';
import { DomSanitizer } from '@angular/platform-browser';
import { NonNullAssert } from '@angular/compiler';

@Component({
  selector: 'app-articles-per-category',
  templateUrl: './articles-per-category.component.html',
  styleUrls: ['./articles-per-category.component.scss']
})
export class ArticlesPerCategoryComponent implements OnInit, OnChanges {

  @Input('is_main_page') is_main_page: boolean;
  @Input('load_all') load_all: boolean;
  @Input('category') category: CategoriaArticuloModel;
  @Input('idOrganization') idOrganization: number;
  @Input('view_mode') view_mode: string = 'detail';
  @Input('grid_info_settings') grid_info_settings: any = {};
  @Output('onAddArticle') onAddArticle: EventEmitter<ArticuloModel> = new EventEmitter<ArticuloModel>();
  @Output('onEditArticle') onEditArticle: EventEmitter<ArticuloModel> = new EventEmitter<ArticuloModel>();
  @Output('onOpenArticle') onOpenArticle: EventEmitter<ArticuloModel> = new EventEmitter<ArticuloModel>();
  @Input('show_action_buttons') show_action_buttons: boolean = true;
  @Input('left_section_is_hide') left_section_is_hide: boolean = false;
  @Input('direct_redirection') direct_redirection: boolean = false;

  @ViewChildren('img_cover') img_covers: QueryList<ElementRef>;

  page: number = 1;
  loading: boolean = false;
  loading_more: boolean = false;
  articulos: any[] = [];

  public user: any = this.userService.getCurrentUser();
  getting_detail: boolean = false;
  total_articles: number = 0;

  col_generated = [];
  original_col_size: number = 12;
  rows: {
    page: number;
    articulos: any[];
  }[] = [];

  constructor(
    private organizationService: OrganizationService,
    private activated_route: ActivatedRoute,
    private userService: UserService,
    private modal: NgxSmartModalService,
    private dom_sanitizer: DomSanitizer,
    private router: Router
  ) { }

  ngOnInit() {
    this.getArticles();
  }

  ngOnChanges(change) {
    if (change.category) {
      if (change.category.currentValue) {
        this.category = change.category.currentValue;
        this.getArticles();
      }
    }
    if (this.view_mode === 'edition') {
      if (change.grid_info_settings.currentValue) {
        const array = [];
        let size: number;
        if (this.is_main_page) {
          size = 12 / this.grid_info_settings.main_col_size;
        } else {
          size = 12 / this.grid_info_settings.main_col_size;
        }
        if (this.original_col_size != size) {
          this.original_col_size = size;
          for (let index = 0; index < size; index++) {
            array.push({});
          }
          this.col_generated = array;
        }
      }
    }
  }

  getArticles(handle_more_items?: boolean) {
    if (!handle_more_items) {
      this.loading = true;
    } else {
      this.loading_more = true;
    }
    if (this.category) {
      let observable: Observable<any>;
      if (this.is_main_page) {
        if (this.category.view_as == 'load_more') {
          if(this.load_all){
            observable = this.organizationService.getArticulosByIdCategory(this.category.idCategoriaArticulo, this.idOrganization, this.category.sort_type)
          } else{
            observable = this.organizationService.getArticulosByIdCategoryInMainPage(this.category.idCategoriaArticulo, this.page, this.idOrganization, this.category.sort_type)
          }
        } else {
          observable = this.organizationService.getArticulosByIdCategory(this.category.idCategoriaArticulo, this.idOrganization, this.category.sort_type)
        }
      } else {
        observable = this.organizationService.getArticulosByIdCategory(this.category.idCategoriaArticulo, this.idOrganization, this.category.sort_type)
      }
      const subscription = observable
        .subscribe((data: any) => {
          if (handle_more_items) {
            let new_articles: ArticuloModel[] = data.articulos;
            if (data.last_article) {
              new_articles = new_articles.filter(x => x.idArticulo !== data.last_article.idArticulo);
            }
            const existing_articles = this.articulos.map(x => x.idArticulo);
            const new_articles_to_add = new_articles.filter(art => !existing_articles.includes(art.idArticulo));
            this.articulos = this.articulos.concat(new_articles_to_add);
          } else {
            if (data.articulos) {
              this.articulos = data.articulos;
            } else {
              this.articulos = [];
            }
            this.articulos = this.articulos.filter(x => !x.idTab);
            if (data.last_article) {
              data.last_article.is_last = true;
              this.articulos = this.articulos.filter(x => x.idArticulo !== data.last_article.idArticulo);
              this.articulos.unshift(data.last_article);
            }
          }
          if (this.articulos.length > 0 && this.is_main_page) {
            this.total_articles = this.articulos[0].total_articles;
          }
          this.loading = false;
          this.loading_more = false;
          if (!this.category.articles_count) {
            this.category.articles_count = this.articulos.length;
          }
          const col_size = 12 / Number(this.category.col_size);
          if (this.category.view_as === 'carousel') {
            this.rows = [];
            if (this.category.articles_count > 0) {

              const standalone_items = this.category.articles_count % col_size;
              const rows_decimal = this.category.articles_count / col_size;
              let rows = Math.trunc(rows_decimal);
              if (rows == 0 && standalone_items > 0) {
                this.rows.push({
                  page: 1,
                  articulos: this.articulos
                });
              } else if (rows == 1) {
                this.rows.push({
                  page: 1,
                  articulos: this.articulos.slice(0, 1 * col_size)
                });
                if (standalone_items > 0) {
                  this.rows.push({
                    page: 2,
                    articulos: this.articulos.slice(1 * col_size)
                  });
                }
              } else {
                // more than 1 or
                for (let index = 0; index < rows; index++) {
                  this.rows.push({
                    page: index + 1,
                    articulos: this.articulos.slice(index * col_size, (index + 1) * col_size)
                  });
                }
                if (standalone_items > 0) {
                  this.rows.push({
                    page: rows,
                    articulos: this.articulos.slice(rows * col_size)
                  });
                }
              }
            }

          } else {
            const array_size = this.articulos.length;
            if (array_size < this.category.articles_count && array_size > 0) {
              const has_more_items = array_size % col_size > 0;
              if (has_more_items) {
                this.articulos = this.articulos.slice(0, this.page * col_size);
              }
            }
          }
          subscription.unsubscribe();
          setTimeout(() => {
            Array.prototype.forEach.call(document.getElementsByClassName('inner-span'), element => {
              Array.prototype.forEach.call(element.getElementsByTagName('p'), p => {
                p.classList.add('inner-span-p');
                p.style.marginBottom = '0px';
              });
            });
          }, 200);
          setTimeout(() => {
            if (this.img_covers.length > 0) {
              this.img_covers.forEach((x, index, arr) => {
                setTimeout(() => {
                  const id = Number(x.nativeElement.id);
                  const article = this.articulos.find(x => x.idArticulo === id);
                  const { height, width } = x.nativeElement;
                  const aspect_ratio = height / width;;

                  article.height_zoom = aspect_ratio > 0.62 ? 2 : 1
                }, 100 * (index + 1));
              })
            }
          }, 100);
        }, error => {
          this.articulos = [];
          console.error(error);
          subscription.unsubscribe();
          this.loading = false;
          this.loading_more = false;
        });
    } else {
      setTimeout(() => {
        this.loading = false;
        this.loading_more = false;
      }, 1350);
    }
    // if (this.view_mode !== 'edition') {
    // } else {
    //   setTimeout(() => {
    //     this.loading = false;
    //     this.loading_more = false;
    //   }, 1350);
    // }
  }

  fixUrl(url: string, use_as_string?: boolean) {
    if (url) {
      if (url.includes('https')) {
        if (!use_as_string) {
          return `"${url}"`;
        } else {
          return `${url}`;
        }
      } else {
        if (!use_as_string) {
          return `"${environment.serverURL}${url}"`;
        } else {
          return `${environment.serverURL}${url}`;
        }
        // return `${environment.serverURL}/${url}`;
      }
    } else {
      return 'assets/img/default-image.jpg';
    }
  }

  get fixed_border_radius() {
    if (this.grid_info_settings) {
      return this.grid_info_settings.button_border_radius;
    }
    return 0;
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

  // get col_generated() {
  //   const array = [];
  //   let size: number;
  //   if (this.is_main_page) {
  //     size = 12 / this.grid_info_settings.main_col_size;
  //   } else {
  //     size = 12 / this.grid_info_settings.main_col_size;
  //   }
  //   for (let index = 0; index < size; index++) {
  //     array.push({});
  //   }
  //   return array;
  // }

  addArticle() {
    const articulo = new ArticuloModel();
    articulo.idIglesia = this.idOrganization;
    articulo.idTab = null;

    if (Number(this.category.idCategoriaArticulo) !== 0) {
      articulo.idCategoriaArticulo = this.category.idCategoriaArticulo;
    }
    if (this.user) {
      articulo.author = `${this.user.nombre} ${this.user.apellido}`;
    } else {
      articulo.author = `N/A`;
    }
    // articulo.orden = this.tabToShow.articulos.length + 1;
    this.onAddArticle.emit(articulo)
  }

  get can_edit() {
    if (this.user) {
      if (this.user.isSuperUser) {
        return true;
      }
      return this.user.idUserType === 1 && this.user.idIglesia === Number(this.idOrganization);
    }
    return false;
  }

  updateArticle(article) {
    this.getting_detail = true;
    if (article.idArticulo) {
      this.getArticuloDetail(article)
        .then((articulo_response: ArticuloModel) => {
          // this.selectedArticle = articulo_response;
          // this.modal.getModal('editArticleContentModal').open();
          this.getting_detail = false;
          this.onEditArticle.emit(articulo_response);
        })
        .catch(error => {
          console.error(error);
          this.organizationService.api.showToast(`Error getting article's detail.`, ToastType.error);
          this.getting_detail = false;
        });
    } else {
      this.modal.getModal('editArticleContentModal').open();
      this.getting_detail = false;
    }
  }

  getArticuloDetail(articulo: ArticuloModel) {
    return new Promise((resolve, reject) => {
      this.organizationService.getArticuloDetail(articulo)
        .subscribe((response: any) => {
          if (response.msg.Code === 200) {
            return resolve(response.articulo);
          }
          return reject(response);
        }, error => {
          return reject(error);
        });
    });
  }

  hasMoreItems() {
    return this.articulos.length !== this.total_articles
  }

  loadMoreItems() {
    this.page++;
    this.getArticles(true);
  }

  deleteArticle(articulo) {
    this.getting_detail = true;
    this.getArticuloDetail(articulo)
      .then((articulo_response: ArticuloModel) => {
        if (confirm(`Are you sure you want to delete this item?`)) {
          articulo_response.estatus = false;
          articulo_response.articulosMedia = articulo_response.segments;
          this.organizationService.updateArticulo(articulo_response)
            .subscribe(response => {
              this.organizationService.api.showToast(`Article deleted successfully!`, ToastType.success);
              this.getArticles();
              this.getting_detail = false;
            }, error => {
              console.error(error);
              this.organizationService.api.showToast(
                `Couldn't delete the article. Please, try again. ${error.error.msg.Message}.`,
                ToastType.error
              );
              this.getting_detail = false;
            });
        } else {
          this.getting_detail = false;
        }
      })
      .catch(error => {
        this.getting_detail = false;
        console.error(error);
        this.organizationService.api.showToast(`Error getting article's detail.`, ToastType.error);
      });
  }

  sanitize(article) {
    if (!article.hasBeenSanitized) {
      article.content = this.dom_sanitizer.bypassSecurityTrustHtml(article.summary_content);
      article.hasBeenSanitized = true;
      return article.content;
    } else {
      return article.content;
    }
  }

  getRouterLink(article) {
    if (article.idTemplate) {
      if (article.idTemplate === 18) {
        return `${article.link_page}`;
      } else if (article.idTemplate === 21) {
        if (article.item_id) {
          return `${this.actual_page}/contact/${article.idArticulo}`;
        }
      }
    }
    return `${this.actual_page}/article/${article.idArticulo}`;
  }

  goToPage(event, article) {
    event.stopPropagation();
    if (article.idTemplate) {
      if (article.idTemplate === 18) {
        window.open(article.link_page, '_blank');
        return;
      } else if (article.idTemplate === 21) {
        if (article.item_id) {
          this.router.navigate([`${this.actual_page}/contact/${article.item_id}`], {
            queryParams: {
              idCategoryArticle: article.idCategoriaArticulo
            }
          });
          return;
        }
      }
    }

    if (this.direct_redirection) {
      // this.router.navigateByUrl(`/article/${article.idArticulo}`);
      this.onOpenArticle.emit(article);
    } else {
      this.router.navigateByUrl(`${this.actual_page}/article/${article.idArticulo}`);
    }
  }

}
