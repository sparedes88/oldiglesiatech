import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { UserService } from './user.service';
import { RandomService } from './random.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(
    public api: ApiService,
    public userService: UserService,
    public random: RandomService) {
    this.currentUser = this.userService.getCurrentUser()
  }

  public currentUser: any

  /**
   * Upload file to Server
   * @param file File
   * @param randomName boolean
   * @param path string
   */
  public uploadFile(file: File, randomName = false, path?: string) {
    const formData = new FormData()

    // Set random name if required
    let filename: string = file.name
    if (randomName) {
      let ext: string = filename.split('.').pop()
      filename = `${this.random.makeId()}.${ext}`
    }
    if (!this.currentUser) {
      this.currentUser = this.userService.getCurrentUser();
    }
    let route = this.currentUser.topic;

    if (path) {
      route = `${route}/${path}`;
    }

    formData.append('v2', 'true'); // Not ready yet. DO NOT ACTIVATE
    formData.append('topic', route)
    formData.append('idOrganization', this.currentUser.idIglesia)
    formData.append('created_by', this.currentUser.idUsuario)
    formData.append('image', file, filename)

    return this.api.post('upload_file_v2', formData)
  }

  public uploadWithProgress(file: File, randomName = false, callback: any, path?: string) {
    const formData = new FormData()

    // Set random name if required
    let filename: string = file.name
    if (randomName) {
      let ext: string = filename.split('.').pop()
      filename = `${this.random.makeId()}.${ext}`
    }
    if (!this.currentUser) {
      this.currentUser = this.userService.getCurrentUser();
    }
    let route = this.currentUser.topic;

    if (path) {
      route = `${route}/${path}`;
    }

    formData.append('topic', route)
    formData.append('idOrganization', this.currentUser.idIglesia)
    formData.append('created_by', this.currentUser.idUsuario)
    formData.append('v2', 'true'); // Not ready yet. DO NOT ACTIVATE
    formData.append('image', file, filename)

    return new Promise((resolve, reject) => {
      // Upload photo
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'json';
      xhr.upload.addEventListener('progress', callback);
      const link = `${environment.apiUrl}/upload_file_v2`;
      xhr.addEventListener('load', event => resolve(event), false);
      xhr.open('post', link);
      xhr.timeout = 45000;
      xhr.send(formData);
    });
  }

  /**
   * Clean current fotoUrl
   * @param fullPath String
   */
  public cleanPhotoUrl(fullPath: string): string {
    if (fullPath) {

      const serverRegex: RegExp = new RegExp('https://iglesia-tech-api.e2api.com', 'g')
      let cleanUrl: string = fullPath
      .replace(serverRegex, '')
        // .replace(/\/external\/files\//g, '')
      return `${cleanUrl}`
    } else {
      return;
    }
  }
}
