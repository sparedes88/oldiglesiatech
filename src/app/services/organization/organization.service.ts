import { AddressModel } from './../../component/google-places/google-places.component';
import { ArticuloTemplateModel, ConfigurationTabTemplateModel } from 'src/app/models/TemplateModel';
import { OrganizationModel } from './../../models/OrganizationModel';
import { Observable } from 'rxjs';
import { ArticuloModel } from './../../models/ArticuloModel';
import { ConfigurationTabModel } from './../../models/ConfigurationTabModel';
import { UserService } from './../user.service';
import { ApiService } from './../api.service';
import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ToDoModel } from 'src/app/models/ToDoModel';
import { User } from 'src/app/interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  show_test: any;

  constructor(
    public api: ApiService,
    private userService: UserService) { }

  getConfiguracionesTabs() {
    const resp = this.api.get('configuracionesTabs/getTemplates',
      // Params
      { idIglesia: this.userService.getCurrentUser().idIglesia }
      // reqOptions
    );
    return resp;
  }

  updateConfiguracionTabTitle(configuracionTab: ConfigurationTabModel) {
    const resp = this.api.post('configuracionesTabs/updateConfiguracionTabTitle',
      // Params
      configuracionTab
      // reqOptions
    );
    return resp;
  }

  updateConfiguracionTabBackground(configuracionTab: ConfigurationTabModel) {
    const resp = this.api.post('configuracionesTabs/updateConfiguracionTabBackground',
      // Params
      configuracionTab
      // reqOptions
    );
    return resp;
  }

  updateArticlesCover(configuracionTab: ConfigurationTabModel) {
    const resp = this.api.post('configuracionesTabs/updateArticlesCover',
      // Params
      configuracionTab
      // reqOptions
    );
    return resp;
  }

  getArticuloDetail(articulo: ArticuloModel) {
    const resp = this.api.get(`articulos/getArticuloDetail/${articulo.idArticulo}`,
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

  getCategoriasArticulos() {
    const user = this.userService.getCurrentUser();
    console.log(user);
    const idIglesia = user.idIglesia;
    const resp = this.api.get(`articulos/getCategoriasArticulosByIdIglesia`,
      // Params
      { idIglesia }
      // reqOptions
    );
    return resp;
  }

  getYouTubeInfo(url: any) {
    const resp = this.api.get(`articulos/getYouTubeInfo`,
      // Params
      { url }
      // reqOptions
    );
    return resp;
  }

  saveArticulo(articulo: ArticuloModel) {
    const resp = this.api.post(`articulos/saveArticulo`,
      // Params
      articulo
      // reqOptions
    );
    return resp;
  }

  updateArticulo(articulo: ArticuloModel) {
    const resp = this.api.post(`articulos/updateArticulo`,
      // Params
      articulo
      // reqOptions
    );
    return resp;
  }

  saveArticleTemplate(template: ArticuloTemplateModel): Observable<any> {
    const resp = this.api.post(`articulos/saveArticuloTemplate`,
      // Params
      template
      // reqOptions
    );
    return resp;
  }
  updateArticleTemplate(template: ArticuloTemplateModel): Observable<any> {
    const resp = this.api.post(`articulos/updateArticuloTemplate`,
      // Params
      template
      // reqOptions
    );
    return resp;
  }

  getMediaTypes() {
    const resp = this.api.get(`articulos/getMediaTypes`,
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

  uploadFile(blob: Blob, iglesiaModel: OrganizationModel, name?: string, subFolder?: string, hide_message?: boolean) {
    return new Promise((resolve, reject) => {
      // if ((blob.size / 1024 / 1024) < 1.5) {
      const data = new FormData();
      let route = iglesiaModel.topic;
      if (subFolder) {
        route = `${route}/${subFolder}`;
      }

      data.append('v2', 'true'); // Not ready yet. DO NOT ACTIVATE
      data.append('topic', route);
      data.append('idOrganization', `${iglesiaModel.idIglesia}`)
      data.append('created_by', this.userService.getCurrentUser().idUsuario)
      data.append('image', blob, name);
      this.createFile(data)
        .subscribe(response => {
          console.log(response);
          if (!hide_message) {
            this.api.showToast(`Image uploaded successfully. Please save your changes.`, 3);
          }
          return resolve(response);
        }, err => {
          console.warn(err);
          this.api.showToast(`Error uploading picture. Please try again.`, 2);
          return reject(err);
        });
      // } else {
      //   this.api.showToast(`File size too large.`, 2);
      //   return reject({});
      // }
    });
  }

  createFile(data: FormData): any {
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT',
        Accept: '*/*',
      })
      // 'Content-Type': 'multipart/form-data'
    };
    const seq = this.api.post('upload_file_v2',
      // PARAMS
      data,
      // OPTIONS
      httpOptions
    );
    return seq;
  }

  deleteImages(images: any[]) {
    const seq = this.api.post('deleteImages',
      // PARAMS
      { images },
      // OPTIONS
      {}
    );
    return seq;
  }

  sendNotification(notification: {
    title: string,
    body: string,
    idIglesia: number,
    topic: any;
  }) {
    const resp = this.api.post('sendNotification',
      // Params
      notification
      // reqOptions
    );
    return resp;
  }

  getUsers() {
    const seq = this.api.get('users/getUsers',
      // PARAMS
      {}
      // OPTIONS
    );
    return seq;
  }

  getTranslateFile(lang): Observable<any> {
    const resp = this.api.get('getTranslateFile',
      // Params
      { lang });
    return resp;
  }

  getIglesiasWithTagsAndContacts(show_test) {
    const resp = this.api.get('iglesias/getIglesiasWithTagsAndContacts',
      // Params
      { show_test }
      // reqOptions
    );
    return resp;
  }

  getIglesiasWithTagsAndContactsWithFilter(payload) {
    const resp = this.api.get('iglesias/getIglesiasWithTagsAndContactsWithFilter',
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  getTags() {
    const resp = this.api.get('tags/getTags',
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

  getCoupons() {
    const resp = this.api.get('coupons/getCoupons',
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

  getPlans() {
    const resp = this.api.get('coupons/getPlans',
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

  getPaymentTypes() {
    const resp = this.api.get('coupons/getPaymentTypes',
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

  getServiceTypes() {
    const resp = this.api.get('coupons/getServiceTypes',
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

  getLenguajes(): any {
    const resp = this.api.get('getLenguajes',
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

  saveIglesia(organization: OrganizationModel) {
    const resp = this.api.post('iglesias/saveIglesias',
      // Params
      organization
      // reqOptions
    );
    return resp;
  }

  getIglesiaDetail(item: OrganizationModel) {
    const resp = this.api.get('iglesias/getIglesiaDetail',
      // Params
      { idIglesia: item.idIglesia }
      // reqOptions
    );
    return resp;
  }

  getLastNotifications(page: number) {
    const resp = this.api.get('iglesias/getNotifications',
      // Params
      {
        page,
        idIglesia: this.userService.getCurrentUser().idIglesia,
      }
      // reqOptions
    );
    return resp;
  }

  getTemplates(params?) {
    const resp = this.api.get('templates/getTemplates',
      // Params
      params ? params : {}
      // reqOptions
    );
    return resp;
  }

  saveConfiguracionTabTemplate(template: ConfigurationTabTemplateModel) {
    template.created_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('configuracionesTabs/saveTemplateForTab',
      // Params
      template
      // reqOptions
    );
    return resp;
  }

  updateConfiguracionTabTemplate(template: ConfigurationTabTemplateModel) {
    template.created_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('configuracionesTabs/updateTemplateForTab',
      // Params
      template
      // reqOptions
    );
    return resp;
  }

  registerOrganization(payload) {
    const resp = this.api.post('iglesias/register',
      // Params
      payload
      // reqOptions
    );
    return resp;
  }

  getOrganizations() {
    return this.api.get(`getIglesias`)
  }

  getTodoTypes() {
    const resp = this.api.get('todos/getTypes',
      // Params
      { idIglesia: this.userService.getCurrentUser().idIglesia }
      // reqOptions
    );
    return resp;
  }

  getTodos() {
    const resp = this.api.get('todos/getTodos',
      // Params
      { idIglesia: this.userService.getCurrentUser().idIglesia }
      // reqOptions
    );
    return resp;
  }

  addTodo(todo: ToDoModel): Observable<any> {
    const resp = this.api.post('todos/saveTodo',
      // Params
      todo
      // reqOptions
    );
    return resp;
  }

  updateTodo(todo: ToDoModel): Observable<any> {
    const resp = this.api.post('todos/updateTodo',
      // Params
      todo
      // reqOptions
    );
    return resp;
  }

  deleteTodo(todo: any) {
    const resp = this.api.post('todos/deleteTodo',
      // Params
      todo
      // reqOptions
    );
    return resp;
  }

  accomplishTodo(todo: ToDoModel) {
    const resp = this.api.post(`todos/${todo.idToDo}/accomplish`,
      // Params
      todo
      // reqOptions
    );
    return resp;
  }

  reviewTodo(todo: ToDoModel) {
    const resp = this.api.post(`todos/${todo.idToDo}/review`,
      // Params
      todo
      // reqOptions
    );
    return resp;
  }

  getContactInfo(idIglesia: number, contact_type?: number) {
    let url;
    if (!contact_type) {
      url = 'iglesias/contact_info/';
    } else {
      url = 'iglesias/contact_info/filter';
    }
    const resp = this.api.get(`${url}`,
      // Params
      { idIglesia, contact_type }
      // reqOptions
    );
    return resp;
  }

  getContacts() {
    const resp = this.api.get('getAgendaByIdIglesiaAll',
      // Params
      {}
      // reqOptions
    );
    return resp;
  }

  getExtraSettings(): any {
    const resp = this.api.get('iglesias/getExtraSettings',
      // Params
      { idIglesia: this.userService.getCurrentUser().idIglesia }
      // reqOptions
    );
    return resp;

  }

  updateExtraSettings(setting: any) {
    const resp = this.api.post('iglesias/updateExtraSettings',
      // Params
      setting
      // reqOptions
    );
    return resp;
  }

  getIglesiasFeatured() {
    const resp = this.api.get('iglesias/getIglesiasFeatured',
      // Params
      { show_test: this.show_test }
      // reqOptions
    );
    return resp;
  }

  getIglesias() {
    const resp = this.api.get('iglesias/getIglesias',
      // Params
      { show_test: this.show_test }
      // reqOptions
    );
    return resp;
  }

  getIglesiasExclusive() {
    const resp = this.api.get('iglesias/getIglesiasExclusive',
      // Params
      { show_test: this.show_test }
      // reqOptions
    );
    return resp;
  }

  getArticulosByIdCategory(idCategoriaArticulo: number, idIglesia?: number, sort_type?: 'date_asc' | 'date_desc' | 'alpha_asc' | 'alpha_desc') {
    const id_iglesia_fixed = idIglesia ? idIglesia : this.userService.getCurrentUser().idIglesia;
    return this.api.get(`articulos/getArticulosByCategoria`,
      // Params
      {
        idCategoriaArticulo,
        idIglesia: id_iglesia_fixed,
        sort_type
      });
  }

  getArticulosByIdCategoryInMainPage(idCategoriaArticulo: number, page: number, idIglesia?: number, sort_type?: 'date_asc' | 'date_desc' | 'alpha_asc' | 'alpha_desc') {
    const id_iglesia_fixed = idIglesia ? idIglesia : this.userService.getCurrentUser().idIglesia;
    return this.api.get(`articulos/getArticulosByCategoryPage`,
      // Params
      {
        page,
        idCategoriaArticulo,
        idIglesia: id_iglesia_fixed,
        sort_type
      });
  }

  getAddresses(idIglesia: number) {
    const resp = this.api.get(`iglesias/addresses`,
      // Params
      { idIglesia }
      // reqOptions
    );
    return resp;
  }

  updateAddresses(address: AddressModel) {
    const resp = this.api.patch(`iglesias/addresses/${address.idOrganizationAddress}`,
      // Params
      address
      // reqOptions
    );
    return resp;
  }

  getMeetings(idIglesia: number, extended?: boolean) {
    let params: Partial<{ idIglesia: number, extended: boolean }> = {
      idIglesia
    }
    if (extended) {
      params.extended = true;
    }
    const resp = this.api.get(`iglesias/meetings`,
      // Params
      params
      // reqOptions
    );
    return resp;
  }

  getContainerSetting(idIglesia: number) {
    const resp = this.api.get(`iglesias/container_settings`,
      // Params
      { idIglesia }
      // reqOptions
    );
    return resp;
  }

  getEventsSearch() {
    const resp = this.api.get('iglesias/addresses/next_events',
      // Params
      { show_test: this.show_test }
      // reqOptions
    );
    return resp;
  }

  getOrganizationMinimal(idIglesia?: number) {
    let idOrganization: number;
    if (idIglesia) {
      idOrganization = idIglesia
    } else {
      const user: User = this.userService.getCurrentUser();
      idOrganization = user.idIglesia;
    }
    return this.api.get(`iglesias/minimal`, {
      idIglesia: idOrganization,
    });
  }

  getHeaderStyle(params: Partial<{ idOrganization: number; formatted: boolean; extended: boolean; }>) {
    return this.api.get(`iglesias/headers/general/style`, params);
  }

  saveDashboardHeight(params: Partial<{ idOrganization: number; dashboard_height: number; }>) {
    return this.api.post(`iglesias/headers/general/style/dashboard`, params);
  }

}
