import { ArticleItem } from './drag-article-item/item';
import { CategoriaArticuloModel } from './../../models/CategoriaArticuloModel';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SelectTemplateComponent } from './select-template/select-template.component';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { Subject } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

import { ConfigurationTabModel } from '../../models/ConfigurationTabModel';
import { OrganizationService } from '../../services/organization/organization.service';
import { ArticuloModel } from './../../models/ArticuloModel';
import { ConfigurationTabTemplateModel } from './../../models/TemplateModel';
import { ArticleFormComponent } from './article-form/article-form.component';
import { ToastType } from 'src/app/login/ToastTypes';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { CdkDragDrop, CdkDragEnter, CdkDragExit, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-content-home',
  templateUrl: './content-home.component.html',
  styleUrls: ['./content-home.component.scss']
})
export class ContentHomeComponent implements OnInit, AfterViewInit {

  @ViewChild('myTab') myTab: any;
  @ViewChild('title') private title;
  @ViewChild('article_form_content') article_form_content: ArticleFormComponent;
  @ViewChild('input_file') private input_file;

  tabs: ConfigurationTabModel[];
  tabToShow: ConfigurationTabModel;
  tabSelected = '1';
  sort_type: string = 'asc';

  newTitle: string = '';
  editTitle: boolean = false;
  visiblePixieModal: boolean = false

  public selectedArticle: ArticuloModel;
  getting_detail: boolean = false;

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  // Datatables
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    dom: 'Blfrtip',
    lengthMenu: [10, 25, 50, 100, 250, 500],
    buttons: [
      { extend: 'copy', className: 'btn btn-outline-primary btn-sm mt-2' },
      { extend: 'print', className: 'btn btn-outline-primary btn-sm mt-2' },
      { extend: 'csv', className: 'btn btn-outline-primary btn-sm mt-2' },
      {
        text: 'Add Article',
        className: 'fix-button-heigh btn btn-sm btn-outline-citric mt-2',
        action: this.addArticulo.bind(this)
      },
    ]
  };

  public user: any = this.userService.getCurrentUser();

  photo: File;
  background_form: FormGroup = new FormGroup({
    idConfiguracionTab: new FormControl(undefined, [Validators.required]),
    background_picture: new FormControl(),
    background_type: new FormControl('color')
  })

  categorias: CategoriaArticuloModel[] = [{
    idCategoriaArticulo: 18,
    nombre: 'CategoriaArticulo_Default',
    descripcion: '',
    estatus: true,
    restricted_to_users: false
  }];

  selected_category = 0;

  constructor(
    private organizationService: OrganizationService,
    public modal: NgxSmartModalService,
    private userService: UserService,
    private fus: FileUploadService,
    private translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.loadTabs();
  }

  ngAfterViewInit() {
    this.modal.getModal('editArticleContentModal').onClose.subscribe((text: NgxSmartModalComponent) => {
      this.article_form_content.restartTable();
    });

    this.modal.getModal('editArticleContentModal').onOpenFinished.subscribe(opened => {
      setTimeout(() => {
        if (this.article_form_content) {
          this.article_form_content.dtTrigger.next();
        }
      });
    });
  }

  loadTabs() {
    this.organizationService.getConfiguracionesTabs()
      .subscribe((data: any) => {
        console.log(data)
        if (data.msg.Code === 200) {
          this.tabs = [...data.tabs];
          if (this.tabToShow) {
            this.tabSelected = this.tabToShow.idTab.toString();
          } else {
            this.tabSelected = '1';
          }
          const config_tab = new ConfigurationTabModel();
          config_tab.idTab = 6;
          config_tab.tabTitle = 'Manager';
          this.tabs.push(config_tab);
          const config_tab_2 = new ConfigurationTabModel();
          config_tab_2.idTab = 7;
          config_tab_2.tabTitle = 'Extra Settings';
          this.tabs.push(config_tab_2);
          if (this.tabs.length > 0) {
            if (this.tabToShow) {
              this.tabToShow = this.tabs.find(item => item.idTab === this.tabToShow.idTab);
            } else {
              this.tabToShow = this.tabs[0];
            }
          }
          if (this.tabToShow) {
            this.background_form.patchValue(this.tabToShow);
            this.tabToShow.articulos.forEach((x, index) => x.order = index + 1);
            this.applySort(this.sort_type);
          }
        } else if (data.msg.Code === 400) {
          this.organizationService.api.showToast(`Nothing was found...`, ToastType.warning);
        } else {
          this.organizationService.api.showToast(`Error getting the organization's tabs`, ToastType.error);
        }
      }, error => {
        console.error(error);
        this.organizationService.api.showToast(`Error getting the organization's tabs`, ToastType.error);
      }, () => {
        setTimeout(() => {
          // this.dtTrigger.next();
        });
      });
  }

  changeTab(item) {
    if (Number(item.idTab) !== 6 && Number(item.idTab) !== 7) {
      this.canEditTitle(false);
      this.tabToShow = this.tabs.find(tab => tab.idTab === Number(item.idTab));
      this.applySort(this.sort_type);
      // this.restartTable();
      // this.dtTrigger.next();


    } else {
      this.tabToShow = this.tabs.find(tab => tab.idTab === Number(item.idTab));
      if (Number(item.idTab) === 7) {
        this.getSettings();
      } else if (Number(item.idTab) === 6) {
        this.getCategories();
        this.filterArticles({});
      }
    }
    this.background_form.patchValue(this.tabToShow);
  }

  restartTable(): void {
    if (this.dtElement.dtInstance) {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
      });
    }
  }

  applySort(sort_type: string) {
    this.sort_type = sort_type;
    if (this.sort_type === 'asc') {
      this.tabToShow.articulos = [...this.tabToShow.articulos].sort((a, b) => {
        return a.orden > b.orden ? 1 : -1;
      });
    } else {
      this.tabToShow.articulos = [...this.tabToShow.articulos].sort((a, b) => {
        return b.orden > a.orden ? 1 : -1;
      });
    }
  }
  canEditTitle(can: boolean) {
    this.editTitle = can;
    if (can) {
      this.newTitle = this.tabToShow.tabTitle;
      setTimeout(() => {
        if (this.title) {
          this.title.nativeElement.focus();
        }
      });
    } else {
      this.newTitle = '';
    }
  }

  saveTemplate(
    template: ConfigurationTabTemplateModel,
    select_template_modal: NgxSmartModalComponent,
    select_template_form: SelectTemplateComponent
  ) {
    select_template_modal.open();
    if (template) {
      select_template_form.template = Object.assign({}, template);
    } else {
      const newTemplate = new ConfigurationTabTemplateModel();
      newTemplate.idConfiguracionTab = this.tabToShow.idConfiguracionTab;
      select_template_form.template = newTemplate;
    }
    select_template_form.ngOnInit();
  }

  saveEditTitle(tabToShow: ConfigurationTabModel) {
    tabToShow.tabTitle = this.newTitle;
    const tab = Object.assign({}, tabToShow);
    tab.tabTitle = this.newTitle;
    this.organizationService.updateConfiguracionTabTitle(tab)
      .subscribe(response => {
        this.canEditTitle(false);
        this.organizationService.api.showToast(`Title updated!`, ToastType.success);
      }, error => {
        console.error(error);
        this.organizationService.api.showToast(`Error updating the title...`, ToastType.error);
      });
  }

  openEditModal(article: ArticuloModel) {
    this.getting_detail = true;
    if (article.idArticulo) {
      this.getArticuloDetail(article)
        .then((articulo_response: ArticuloModel) => {
          this.selectedArticle = articulo_response;
          this.modal.getModal('editArticleContentModal').open();
          this.getting_detail = false;
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

  updateTabs(editModal: NgxSmartModalComponent) {
    editModal.close();
    // if (this.dtElement.dtInstance) {
    //   this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //     dtInstance.destroy();
    this.loadTabs();
    //   });
    // }
    if (this.tabToShow.idTab === 6) {
      this.filterArticles({});
    }
  }

  addArticulo() {
    if (this.getting_detail) {
      this.userService.api.showToast(`Other action is running. Please wait and try again in a few seconds.`, ToastType.info)
      return;
    } else {
      const articulo = new ArticuloModel();
      articulo.idIglesia = this.user.idIglesia;
      articulo.idTab = this.tabToShow.idTab;
      if (this.user) {
        articulo.author = `${this.user.nombre} ${this.user.apellido}`;
      } else {
        articulo.author = `N/A`;
      }
      articulo.orden = this.tabToShow.articulos.length + 1;
      this.selectedArticle = articulo;
      this.openEditModal(articulo);
    }
  }

  loading: boolean = false;

  addArticuloWithManager() {
    if (this.getting_detail) {
      this.userService.api.showToast(`Other action is running. Please wait and try again in a few seconds.`, ToastType.info)
      return;
    } else {
      const articulo = new ArticuloModel();
      articulo.idIglesia = this.user.idIglesia;
      articulo.idTab = null;
      if (Number(this.selected_category) !== 0) {
        articulo.idCategoriaArticulo = this.selected_category;
      }
      if (this.user) {
        articulo.author = `${this.user.nombre} ${this.user.apellido}`;
      } else {
        articulo.author = `N/A`;
      }
      articulo.orden = this.tabToShow.articulos.length + 1;
      this.selectedArticle = articulo;
      this.openEditModal(articulo);
    }
  }

  loadMediaTypes(articuloForm: ArticleFormComponent) {
    setTimeout(() => {
      this.organizationService.getMediaTypes()
        .subscribe((response: any) => {
          if (response.msg.Code === 200) {
            if (response.mediaTypes.filter(x => x.idMediaType === 6 || x.idMediaType === 7).length === 0) {
              response.mediaTypes.push({
                idMediaType: 6,
                nombre: 'Audio'
              })
              response.mediaTypes.push({
                idMediaType: 7,
                nombre: 'Document'
              });
              response.mediaTypes.push({
                idMediaType: 8,
                nombre: 'Media Video'
              });
            }
            this.article_form_content.media_types = response.mediaTypes;
          } else {
            this.article_form_content.media_types = [];
            this.organizationService.api.showToast(`Error getting Media Types...`, ToastType.error);
          }
        }, error => {
          console.error(error);
        });
    }, 100);
  }

  deleteArticulo(articulo) {
    this.getting_detail = true;
    this.getArticuloDetail(articulo)
      .then((articulo_response: ArticuloModel) => {
        this.selectedArticle = articulo_response;
        if (confirm(`Are you sure you want to delete this item?`)) {
          articulo_response.estatus = false;
          articulo_response.articulosMedia = articulo_response.segments;
          this.organizationService.updateArticulo(articulo_response)
            .subscribe(response => {
              const index = this.tabToShow.articulos.indexOf(articulo);
              if (index !== -1) {
                this.tabToShow.articulos.splice(index, 1);
                this.organizationService.api.showToast(`Article deleted successfully!`, ToastType.success);
                // this.restartTable();
                this.loadTabs();
              }
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

  addCover() {
    this.input_file.nativeElement.onchange = (event: { target: { files: File[] } }) => {
      if (event.target.files.length > 0) {
        const confirmation = confirm(`You want to update this article's cover? This will update all the tabs cover.`);
        if (confirmation) {
          this.photo = event.target.files[0];
          this.uploadTabImage();
        }
      }
    };
    (this.input_file as ElementRef).nativeElement.click();
  }

  handlePixieExport(file: any) {
    this.photo = file;
    this.uploadTabImage();
    this.visiblePixieModal = false
    console.log(file);
  }

  uploadTabImage() {
    const indexPoint = (this.photo.name as string).lastIndexOf('.');
    const extension = (this.photo.name as string).substring(indexPoint);
    const ticks = (Number(String(Math.random()).slice(2)) + Date.now() + Math.round(performance.now())
    ).toString(36);
    const myUniqueFileName = `tab_cover_${this.tabToShow.idConfiguracionTab}_${ticks}${extension}`;
    const iglesia_temp = new OrganizationModel();
    iglesia_temp.idIglesia = this.user.idIglesia;
    iglesia_temp.topic = this.user.topic;

    this.organizationService.uploadFile(this.photo, iglesia_temp, myUniqueFileName, 'articulo')
      .then((response: any) => {
        this.tabToShow.slider = this.fus.cleanPhotoUrl(response.response);
        const tab = Object.assign({}, this.tabToShow);
        this.organizationService.updateArticlesCover(tab)
          .subscribe(response_updated => {
            this.organizationService.api.showToast(`Slider updated successfully`, ToastType.success);
          }, error => {
            console.error(error);
            this.organizationService.api.showToast(`Something happened trying to save the slider.`, ToastType.error);
          });
      });
  }

  dismissTemplateModal(
    select_template_modal: NgxSmartModalComponent,
    select_template_form: SelectTemplateComponent) {
    select_template_modal.close();
    select_template_form.template = undefined;
    select_template_form.template_selected = undefined;
    // this.restartTable();
    this.loadTabs();
  }

  server_busy: boolean = false;
  settings: any[] = [];

  getSettings() {
    this.server_busy = true;
    this.organizationService.getExtraSettings()
      .subscribe(data => {
        if (data["settings"]) {
          this.settings = data['settings'];
        } else {
          this.settings = [];
        }
        this.server_busy = false;
      }, err => {
        console.error(err);
        this.organizationService.api.showToast(`Error getting settings.`, ToastType.error);
        this.server_busy = false;
      })
  }

  updateExtraSetting(setting) {
    this.server_busy = true;
    setting.idIglesia = this.userService.getCurrentUser().idIglesia;
    this.organizationService.updateExtraSettings(setting)
      .subscribe(response => {
        this.getSettings();
        this.organizationService.api.showToast(`Configuration saved correctly.`, ToastType.success);
      }, error => {
        console.error(error);
        this.organizationService.api.showToast(`Error saving the configuration.`, ToastType.error);
        this.server_busy = false;
      });
  }

  dropLevel(event: CdkDragDrop<any>) {

    moveItemInArray(
      this.tabToShow.articulos,
      event.previousIndex,
      event.currentIndex
    );
    this.tabToShow.articulos.forEach((x, index) => x.orden = index + 1);
    this.organizationService.api.post(`articulos/updateOrder`, {
      articles: this.tabToShow.articulos
    })
      .subscribe(response => {
        console.log(response);
      }, error => {
        console.error(error);
      });

  }

  resetOrder(tab) {
    if (tab.temp_articulos.length > 0) {
      const articles = [...tab.temp_articulos];
      articles.forEach((x, index) => x.orden = undefined);
      this.organizationService.api.post(`articulos/updateOrder`, {
        articles
      })
        .subscribe(response => {
          this.filterArticles({});
        }, error => {
          console.error(error);
        });

    }
  }

  dropLevelGroup(event: CdkDragDrop<any>, articles: any[]) {
    this.loading = true;
    moveItemInArray(
      articles,
      event.previousIndex,
      event.currentIndex
    );
    articles.forEach((x, index) => x.orden = index + 1);
    this.organizationService.api.post(`articulos/updateOrder`, {
      articles
    })
      .subscribe(response => {
        this.filterArticles({});
      }, error => {
        console.error(error);
      });

  }

  uploadPicture(input_file) {
    if (this.background_settings.background_type === 'picture') {
      input_file.onchange = (event: { target: { files: File[] } }) => {
        if (event.target.files.length > 0) {
          this.uploadImage(event.target.files[0]);
        }
      };
      input_file.click();
    }
  }

  addDefaultImage() {
    this.background_form.patchValue({
      background_picture: undefined
    });
    this.savePictureOrColor();
  }

  savePictureOrColor() {
    const payload = this.background_form.value;
    this.organizationService.updateConfiguracionTabBackground(payload)
      .subscribe(response => {
        this.organizationService.api.showToast(`Background saved correctly.`, ToastType.success);
        this.loadTabs();
      }, error => {
        console.error(error);
        this.organizationService.api.showToast(`Error saving the configuration.`, ToastType.error);
      });
  }

  uploadImage(photo) {
    this.fus.uploadFile(photo, true, 'templates')
      .subscribe((response: any) => {
        const background_picture = this.fus.cleanPhotoUrl(response.response);
        this.background_form.patchValue({
          background_picture
        });
        this.savePictureOrColor();
      });
  }

  get background_settings() {
    const background_type = this.background_form.get('background_type').value;
    let other_type = 'color';
    if (background_type === 'color') {
      other_type = 'picture';
    }
    return { background_type, other_type }
  }

  toggleType() {
    const background_type = this.background_form.get('background_type').value;;
    if (background_type === 'color') {
      this.background_form.get('background_type').setValue('picture');;
    } else {
      this.background_form.get('background_type').setValue('color');;
    }
  }

  getCategories() {
    this.organizationService.getCategoriasArticulos()
      .subscribe((response: any) => {
        if (response.msg.Code === 200) {
          this.categorias = response.categorias;
          const category: CategoriaArticuloModel = {
            idCategoriaArticulo: 0,
            nombre: 'All',
            descripcion: '',
            estatus: true,
            restricted_to_users: false
          }
          this.categorias.unshift(category);
        } else {
          this.organizationService.api.showToast(`Nothing was found, default category will be used...`, ToastType.warning);
        }
        this.translateCategories();
      }, error => {
        console.error();
        this.translateCategories();
        this.organizationService.api.showToast(`Error getting the categories, the default category will be used...`, ToastType.error);
      });
  }

  translateCategories() {
    const array = [];
    this.categorias.forEach(item => {
      array.push(item.nombre);
    });
    this.translate.get(array).subscribe(response => {
      const keys = Object.keys(response);
      keys.forEach(key => {
        this.categorias.find(x => x.nombre === key).nombre = response[key];
      });
    }, error => {
    });
  }

  filterArticles(event) {
    this.loading = true;
    this.organizationService.getArticulosByIdCategory(this.selected_category)
      .subscribe((data: any) => {
        if (data.articulos) {
          this.tabToShow.articulos = data.articulos;
        } else {
          this.tabToShow.articulos = [];
        }
        this.tab_articles_categoties = this.create_tab_articles_categoties();
        this.loading = false;
      }, error => {
        this.tabToShow.articulos = [];
        console.error(error);
        this.loading = false;
      });
  }

  tab_articles_categoties: ConfigurationTabModel[]

  create_tab_articles_categoties() {
    let tabs = this.tabs.filter(x => x.idTab < 6);
    if (tabs.length === 5) {
      const config_tab = new ConfigurationTabModel();
      config_tab.idTab = null;
      config_tab.tabTitle = '';
      tabs.push(config_tab);
    }
    tabs.forEach(tab => {
      tab.temp_articulos = this.tabToShow.articulos.filter(x => x.idTab === tab.idTab);
    });
    tabs = tabs.filter(tab => tab.temp_articulos.length > 0);
    tabs = tabs.sort((a, b) => {
      return a.idTab > b.idTab ? 1 : -1;
    });
    return tabs;
  }

  public get connectedDropListsIds(): string[] {
    // We reverse ids here to respect items nesting hierarchy
    return this.getIdsRecursive(this.tabToShow).reverse();
  }

  private getIdsRecursive(item: ArticleItem | any): string[] {
    let ids = [item.uId];
    if (item.articulos) {
      item.articulos.forEach((childItem) => { ids = ids.concat(this.getIdsRecursive(childItem)) });
    }
    return ids;
  }

  public onDragDropV1(event: CdkDragDrop<ArticleItem>) {

    event.container.element.nativeElement.classList.remove('active');

    const movingItem: any = event.item.data;
    console.log(event);
    console.log(this.canBeDropped(event));

    if (this.canBeDropped(event)) {
      event.previousContainer.data.articulos = event.previousContainer.data.articulos.filter((child) => child.uId !== movingItem.uId);
      event.container.data.articulos.push(movingItem);
      this.tabToShow.trigger = !this.tabToShow.trigger;
      // if (movingItem.type === 'container') {
      // } else {
      //   event.container.data.entries.push(movingItem);
      //   event.previousContainer.data.entries = event.previousContainer.data.entries.filter((child) => child.uId !== movingItem.uId);
      // }
    } else {
      // if (movingItem.type === 'entry') {
      //   moveItemInArray(
      //     event.container.data.entries,
      //     event.previousIndex,
      //     event.currentIndex
      //   );

      // } else {
      moveItemInArray(
        event.container.data.articulos,
        event.previousIndex,
        event.currentIndex
      );
      if (!movingItem.group_article_id && movingItem.articulos.length > 0 && event.container.data.idArticulo) {
        this.organizationService.api.showToast(`You can only drop articles that do not have sub-articles added.`, ToastType.error);
      } else {
        console.log(this.tabToShow.trigger);
        this.tabToShow.trigger = !this.tabToShow.trigger;
      }
      // }
    }
    this.updateSortElements(event.container.data);
  }

  updateSortElements(parent: ArticleItem) {
    parent.articulos.forEach((x, index) => {
      x.sort_by = index + 1;
      if (parent.type !== 'directory') {
        x.group_article_id = parent.idArticulo;
      } else {
        x.group_article_id = undefined;
      }
    });
    const body = {
      group_article_id: parent.idArticulo,
      parent_container_id: parent.idArticulo,
      articulos: parent.articulos,
    }
    if (parent.type === 'directory') {
      body.group_article_id = undefined;
      body.parent_container_id = undefined;
    }

    this.organizationService.api.patch(`articulos/sort/`, [body])
      .subscribe(response => {
        console.log(response);
      });
  }

  private canBeDropped(event: CdkDragDrop<ArticleItem, ArticleItem>): boolean {
    const movingItem: ArticleItem = event.item.data;

    if (!movingItem) {
      return true;
    }
    if (!movingItem.articulos) {
      movingItem.articulos = [];
    }
    let is_father = !movingItem.group_article_id;
    return event.previousContainer.id !== event.container.id
      && this.isNotSelfDrop(event)
      && !this.hasChild(movingItem, event.container.data)
      && ((is_father && movingItem.articulos.length === 0) || !is_father);
  }


  private isNotSelfDrop(event: CdkDragDrop<ArticleItem> | CdkDragEnter<ArticleItem> | CdkDragExit<ArticleItem>): boolean {
    return event.container.data.uId !== event.item.data.uId;
  }

  private hasChild(parentItem: ArticleItem, childItem: ArticleItem): boolean {
    if (parentItem.type === 'entry') {
      return false;
    }
    if (!parentItem.articulos) {
      parentItem.articulos = [];
    }
    const hasChild = parentItem.articulos.some((item) => item.uId === childItem.uId);
    return hasChild ? true : parentItem.articulos.some((item) => this.hasChild(item, childItem));
  }
}
