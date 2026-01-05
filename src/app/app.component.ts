import { TranslateService } from "@ngx-translate/core";
import { Component, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { MenuComponent } from "./component/menu/menu.component";
import { FooterComponent } from "./component/footer/footer.component";
import { ChatService } from "./services/chat.service";
import { UserService } from "./services/user.service";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "iglesiatech2";

  @ViewChild("menu") menu: MenuComponent;
  @ViewChild("footer") footer: FooterComponent;
  hide_toolbars: boolean = false;
  // is_menu_enabled = false;

  constructor(
    public router: Router,
    private translate: TranslateService,
    public route: ActivatedRoute,
    private chatService: ChatService,
    public user_service: UserService
  ) {
    this.initTranslate();
    // const userId = 'user001';
    // this.chatService.requestPermission(userId)
    // this.chatService.receiveMessage()
    // this.message = this.chatService.currentMessage
    // setTimeout(() => {
    //   if (this.router.url != '/login' && !router.url.includes('/sync-site/frame')) {
    //     this.is_menu_enabled = true;
    //   }
    // }, 200);
  }

  get menu_enabled() {
    return this.router.url != '/login' && !this.router.url.includes('/sync-site/frame');
  }
  message;
  initTranslate() {
    // Set the default language for translation strings, and the current language.
    const localLang = localStorage.getItem("lang");
    if (!localLang) {
      this.translate.setDefaultLang("es");
      const browserLang = this.translate.getBrowserLang();
      let lang;
      if (browserLang) {
        if (browserLang === "zh") {
          const browserCultureLang = this.translate.getBrowserCultureLang();

          if (browserCultureLang.match(/-CN|CHS|Hans/i)) {
            lang = "zh-cmn-Hans";
            this.translate.use("zh-cmn-Hans");
          } else if (browserCultureLang.match(/-TW|CHT|Hant/i)) {
            lang = "zh-cmn-Hant";
            this.translate.use("zh-cmn-Hant");
          }
        } else {
          lang = this.translate.getBrowserLang();
          this.translate.use(lang);
        }
      } else {
        lang = "es";
        this.translate.use("es"); // Set your language here
      }
      localStorage.setItem("lang", lang);
    } else {
      this.translate.use(localLang); // Set your language here‚
    }
  }
}
