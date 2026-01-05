import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
const mime = require('mime');

@Injectable({
  providedIn: 'root'
})
export class DownloadServiceService {

  constructor() { }


  public fileBlob: Blob

  public downloadFile(fileBlob: any, filename: string = undefined, callBack?: any) {
    const contentType: string = 'application/pdf'
    this.fileBlob = new Blob([fileBlob], { type: contentType })

    const fileData = window.URL.createObjectURL(this.fileBlob)


    // Generate virtual link
    let link = document.createElement('a')
    link.href = fileData
    link.download = filename
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    setTimeout(function () {
      // For Firefox it is necessary to delay revoking the ObjectURL
      link.remove();
    }, 100);
  }


  downloadDocumentFromUrl(document_file: { name: string; url: string; }) {
    const logoUrl = `${environment.serverURL}${document_file.url}`;

    fetch(logoUrl, { method: 'GET' })
      .then((response) => response.blob())
      .then((blob) => {
        const extension = document_file.url.substring(document_file.url.lastIndexOf('.') + 1);
        const mimeType = mime.getType(extension);

        const contentType: string = mimeType;
        const fileBlob = new Blob([blob], { type: contentType });

        const fileData = window.URL.createObjectURL(fileBlob);
        // Generate virtual link
        const link = document.createElement('a');
        link.href = fileData;
        link.download = document_file.name + '.' + extension;
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        setTimeout(() => {
          // For Firefox it is necessary to delay revoking the ObjectURL
          link.remove();
        }, 100);

      });
  }
}
