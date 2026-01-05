import { RandomService } from './../../../services/random.service';
import { ToastType } from './../../../login/ToastTypes';
import { UserService } from './../../../services/user.service';
import { ApiService } from './../../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import jsPDF from 'jspdf';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import htmlToPdfmake from 'html-to-pdfmake';
import * as moment from 'moment';

@Component({
  selector: 'app-document-builder-preview',
  templateUrl: './document-builder-preview.component.html',
  styleUrls: ['./document-builder-preview.component.scss']
})
export class DocumentBuilderPreviewComponent implements OnInit {

  @Input('settings') settings: any;
  @Input('document') document: any;
  @Input('is_preview') is_preview: any;
  @Input('showing_page') showing_page: string;
  document_id: number;
  currentUser: any;
  iglesia: any;
  constructor(
    private activated_route: ActivatedRoute,
    private api: ApiService,
    private user_service: UserService,
    public random: RandomService
  ) {
    this.currentUser = this.user_service.getCurrentUser();
    this.document_id = this.activated_route.snapshot.params.document_id;
    this.getIglesia();
    if (this.document_id) {
      this.getDetail();
    }
  }

  getDetail() {
    this.api.get(`document-builder/getDocument/${this.document_id}`, { idIglesia: this.currentUser.idIglesia })
      .subscribe((response: any) => {
        this.document = response.document;
        this.settings = response.document.settings;
      }, error => {
        console.error(error);
        this.api.showToast(`Error getting document`, ToastType.error);
      });

  }

  ngOnInit() {
  }

  title = 'htmltopdf';

  @ViewChild('pdfTable') pdfTable: ElementRef;

  public async downloadAsPDF() {
    const doc = new jsPDF();

    const pdfTable = this.pdfTable.nativeElement;

    var html = htmlToPdfmake(pdfTable.innerHTML);
    console.log(html);
    html.styles = {
      'col-4': {
        width: '33%'
      }
    }
    const images = this.returnImages(html);
    console.log(images);
    for await (const image of images) {
      const response = await this.getBase64ImageFromURL(image.image);
      // console.log(response);
      image.image = response;
      // image.width = 150;
    }
    const documentDefinition = {
      content: html,
      styles: {
        'col-4': {
          width: '33%'
        }
      }
    };

    pdfMake.createPdf(documentDefinition).open();
  }

  getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");

      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        resolve(dataURL);
      };

      img.onerror = error => {
        reject(error);
      };

      img.src = url;
    });
  }

  returnImages(html: any[]) {
    let stacks = [];
    html.forEach(item => {
      if (item.stack) {
        if (item.stack.length > 0) {
          const result = this.returnImages(item.stack);
          if (result.length > 0) {
            stacks = stacks.concat(result);
          }
        }
        const result = item.stack.filter(x => x.nodeName === 'IMG');
        if (result.length > 0) {
          stacks = stacks.concat(result);
        }
      }
    });
    return stacks;
  }

  printPdf(pdf: any) {
    pdf.saveAs(`${moment().format('YYYY-MM-DD HH:mm:ss')}_${this.random.makeId()}.pdf`)
  }

  getIglesia() {
    this.api
      .get(`getIglesiaFullData/`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          this.iglesia = data.iglesia;
        },
        (err: any) => console.error(err)
      );
  }

}
