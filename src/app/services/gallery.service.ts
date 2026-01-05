import { Injectable } from '@angular/core';

import { ApiService } from './api.service';
import { UserService } from './user.service';
import { GalleryAlbumGalleryModel, GalleryAlbumModel, GalleryModel } from '../models/GalleryModel';

@Injectable({
  providedIn: 'root'
})
export class GalleryService {

  constructor(
    public api: ApiService,
    private user_service: UserService) {

  }

  getGalleries(params: Partial<GalleryModel>) {
    return this.api.get(`galleries`, params);
  }

  getGalleriesByAlbum(params: Partial<GalleryAlbumGalleryModel>) {
    return this.api.get(`galleries/albums/${params.idGalleryAlbum}/galleries`, params);
  }

  getGallery() {

  }

  addGallery() {

  }

  updateGallery() {

  }

  deleteGallery() {

  }

  getAlbums(params: any) {
    return this.api.get(`galleries/albums`, params);
  }

  getAlbum(params: Partial<GalleryAlbumModel>) {
    return this.api.get(`galleries/albums/${params.id}`, params);
  }

  addAlbum(payload: Partial<GalleryAlbumModel>) {
    return this.api.post(`galleries/albums/`, payload);
  }

  updateAlbum(payload: Partial<GalleryAlbumModel>) {
    return this.api.patch(`galleries/albums/${payload.id}`, payload);
  }

  deleteAlbum(params: Partial<GalleryAlbumModel>) {
    return this.api.delete(`galleries/albums/${params.id}`, params);
  }

}
