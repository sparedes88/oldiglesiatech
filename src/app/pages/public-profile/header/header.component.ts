import { ActivatedRoute } from '@angular/router';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {

  public height: number = 0;

  constructor() { }

  @Input() displayMode: string = "edit";
  @Input() lang: string = "en";
  @Input() headerStyle: any;
  @Input() socialLinks: any = {};
  @Input() tabs: any[] = [];
  @Input() currentTabIndex: number;
  @Input() iglesia: any = {};
  @Output() onUpdate = new EventEmitter();
  @Output() onAdd = new EventEmitter();
  @Output() onChangeTab = new EventEmitter();
  @Output() onSocialLinkAdd = new EventEmitter();
  @Output() onStyleUpdate = new EventEmitter();
  @Output() onChangeSubPage = new EventEmitter();
  @Output() onChangeLang = new EventEmitter();
  @ViewChild('profile_div') profile_div: ElementRef;

  // Themes
  public theme: string = "theme1";
  public showSidenav: boolean = false;

  ngOnInit() {
    this.height = this.profile_div.nativeElement.clientHeight;
  }

  openTabForm() {
    this.onAdd.emit();
  }

  openUpdateTabForm() {
    this.onUpdate.emit();
  }

  changeTab(index) {
    this.onChangeTab.emit(index);
    if (this.showSidenav) {
      this.showSidenav = false;
    }
  }

  addSocialLinks() {
    this.onSocialLinkAdd.emit();
  }

  openStyleUpdate() {
    this.onStyleUpdate.emit();
  }

  changeSubPage(index, tabIndex) {
    this.onChangeSubPage.emit({ index, tabIndex });
  }

  changeLang(langCode: string) {
    this.onChangeLang.emit(langCode);
  }

  toggleLang() {
    if (this.lang == "es") {
      this.changeLang("en");
    } else {
      this.changeLang("es");
    }
  }

  openUrl(path) {
    console.log(path);
  }
}
