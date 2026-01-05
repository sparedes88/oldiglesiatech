import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "src/app/services/user.service";
import AOS from "aos";
import { HeaderComponent } from "../header/header.component";

@Component({
  selector: "public-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit, AfterViewInit {

  @ViewChild('app_header') app_header: HeaderComponent;
  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {
    this.idIglesia = this.route.snapshot.params["id"];
    this.currentUser = this.userService.getCurrentUser();
  }

  public iglesia: any = {};
  public idIglesia: any;
  public publicProfile: any = {
    profile_data: {},
  };
  public tabs: any[] = [];
  public currentTabIndex: number = 0;
  public currentSubPageIndex: number;
  public currentUser: any;

  ngOnInit() {
    this.getIglesia();
    this.getPublicProfileConfig();
    document.getElementById("mainFooter").style.display = "none";
    document.getElementById("mainAppMenu").style.display = "none";
    AOS.init();
  }

  ngAfterViewInit() {
    // setTimeout(() => {
    //   this.app_header.ngOnInit();
    // }, 600);
  }

  ngAfterViewChecked() {
    this.app_header.ngOnInit();
    this.cdRef.detectChanges();
  }

  ngOnDestroy(): void {
    document.getElementById("mainFooter").style.display = "block";
    document.getElementById("mainAppMenu").style.display = "block";
  }

  getCover() {
    if (this.iglesia && this.iglesia.portadaArticulos) {
      return `url(${this.iglesia.portadaArticulos})`;
    } else {
      return 'url(\'/assets/img/default-cover-image.jpg\')';
    }
  }

  getIglesia() {
    this.api
      .get(`getIglesiaFullData/`, { idIglesia: this.idIglesia })
      .subscribe(
        (data: any) => {
          this.iglesia = data.iglesia;
        },
        (err: any) => console.error(err),
        () => { }
      );
  }

  getPublicProfileConfig() {
    this.api
      .get("publicProfileWeb", { idIglesia: this.idIglesia })
      .subscribe((data: any) => {
        if (data && data.id) {
          this.publicProfile = data;

          if (this.publicProfile.profile_data) {
            this.tabs = this.publicProfile.profile_data.tabs;
          }

          const slug = this.route.snapshot.paramMap.get('slug');
          const sub_page = this.route.snapshot.paramMap.get('sub_page');
          const tab = this.tabs.find(x => x.slug === slug);
          if (tab) {
            this.changeLang(tab.lang);
            const index = this.tabsByLang.findIndex(x => x.slug === slug);
            console.log(tab);

            if (index !== -1) {
              this.currentTabIndex = index;
              if (tab.sub_pages) {
                const index_sub_page = tab.sub_pages.findIndex(x => x.slug === sub_page);
                if (index_sub_page !== -1) {
                  this.currentSubPageIndex = index_sub_page;
                }
              }
            }
          }

          // set favicon
          if (
            this.publicProfile.profile_data.header_style &&
            this.publicProfile.profile_data.header_style.favicon
          ) {
            let func = window["changeFavIcon"];
            func(this.publicProfile.profile_data.header_style.favicon);
          }
          setTimeout(() => {
            this.app_header.ngOnInit();
          }, 1200);
        }
      });
  }

  changeTab(data: any) {
    this.currentTabIndex = data;
    this.currentSubPageIndex = undefined;
    const slug = this.tabsByLang[this.currentTabIndex].slug;
    const id = this.route.snapshot.paramMap.get('id');
    const url = `organizations/profile/${id}`
    if (slug) {
      this.router.navigateByUrl(`/${url}/${slug}`);
    } else if (slug) {
      this.router.navigateByUrl(`/${url}`);
    }
  }

  changeSubPage(data: any) {
    this.currentTabIndex = data.tabIndex;
    this.currentSubPageIndex = data.index;
    const slug = this.tabsByLang[this.currentTabIndex].slug;
    const slug_sub_page = this.tabsByLang[this.currentTabIndex].sub_pages[this.currentSubPageIndex].slug;

    const id = this.route.snapshot.paramMap.get('id');
    const url = `organizations/profile/${id}`
    if (slug && slug_sub_page) {
      this.router.navigateByUrl(`/${url}/${slug}/${slug_sub_page}`);
    } else if (slug) {
      this.router.navigateByUrl(`/${url}/${slug}`);
    }
  }

  get currentSubPage() {
    if (this.currentSubPageIndex != undefined) {
      const tab = this.tabsByLang[this.currentTabIndex];
      if (tab.sub_pages) {
        return tab.sub_pages[
          this.currentSubPageIndex
        ];
      }
    }
  }

  trackSections(index, section: any) {
    return index;
  }

  get tabsByLang(): Array<any> {
    if (this.tabs) {
      return this.tabs.filter((tab: any) => {
        // Fallback to english by default
        if (!tab.lang && this.publicProfile.profile_data.lang == "en") {
          return true;
        } else {
          return tab.lang == this.publicProfile.profile_data.lang;
        }
      });
    }
    return [];
  }

  changeLang(langCode) {
    this.publicProfile.profile_data.lang = langCode;
  }

  reloadAnimations() {
    AOS.refreshHard();
  }
}
