import { DesignRequestNoteModel } from 'src/app/models/DesignRequestModel';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-public-design-note-detail',
  templateUrl: './public-design-note-detail.component.html',
  styleUrls: ['./public-design-note-detail.component.scss']
})
export class PublicDesignNoteDetailComponent implements OnInit {

  design_request_note: DesignRequestNoteModel;

  constructor() { }

  ngOnInit() {
    setTimeout(() => {
      Array.prototype.forEach.call(document.getElementsByClassName('content-detail-container'), element => {
        Array.prototype.forEach.call(element.getElementsByTagName('img'), img => {
          img.style = 'max-width: 100%';
        });
      });
    });
  }

  addClass(content: string) {
    return `<div class="content-detail-container">${content}</div>`;
  }

}
