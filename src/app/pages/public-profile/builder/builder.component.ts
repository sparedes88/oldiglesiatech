import { Component, OnInit } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { ActivatedRoute } from "@angular/router";
import { NgxSmartModalService } from "ngx-smart-modal";
import { Observable } from "rxjs";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { MatSnackBar } from "@angular/material";
import { ToastType } from "src/app/login/ToastTypes";

@Component({
  selector: "app-builder",
  templateUrl: "./builder.component.html",
  styleUrls: ["./builder.component.scss"],
})
export class BuilderComponent implements OnInit {
  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private modal: NgxSmartModalService,
    private snackbar: MatSnackBar
  ) {
    this.idIglesia = this.route.snapshot.params["id"];
  }

  public iglesia: any = {};
  public idIglesia: any;
  public saving: boolean = false;

  // Cloud saved config
  public publicProfileConfig: any = {
    profile_data: {
      lang: 'en'
    },
    lang: "en",
  };

  // Tabs
  public tabs: Array<any> = [{ title: "Home", lang: "en" }];
  public currentTabIndex: number = 0;
  public currentSubPageIndex: number = 0;
  public selectedSubPageIndex: number;
  public langs: Array<any> = [
    {
      name: "English",
      code: "en",
      icon: "",
    },
    {
      name: "Spanish",
      code: "es",
      icon: "",
    },
  ];

  // Sections
  public selectedSection: number;

  get currentTab() {
    if (this.tabsByLang && this.tabsByLang.length) {
      return this.tabsByLang[this.currentTabIndex];
    }
    return {};
  }

  ngOnInit() {
    this.getIglesia();
    this.getPublicProfileConfig();
  }

  getPublicProfileConfig() {
    this.api
      .get("publicProfileWeb", { idIglesia: this.idIglesia })
      .subscribe((data: any) => {
        if (data && data.id) {
          this.publicProfileConfig = data;
          if (this.publicProfileConfig.profile_data) {
            this.tabs = this.publicProfileConfig.profile_data.tabs;
          }

          // if (!this.publicProfileConfig.profile_data.cover_mode) {
          this.publicProfileConfig.profile_data.cover_mode = "slider";
          // }

          if (!this.publicProfileConfig.profile_data.slides) {
            this.publicProfileConfig.profile_data.slides = [];
          }

          if (!this.publicProfileConfig.profile_data.lang) {
            this.publicProfileConfig.profile_data.lang = "en";
          }

          // set favicon
          if (
            this.publicProfileConfig.profile_data.header_style &&
            this.publicProfileConfig.profile_data.header_style.favicon
          ) {
            let func = window["changeFavIcon"];
            func(this.publicProfileConfig.profile_data.header_style.favicon);
          }
        }
      });
  }

  changeLang(langCode: string) {
    this.publicProfileConfig.profile_data.lang = langCode;
    this.currentTabIndex = 0;
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

  // Tabs
  submitTab(data: any) {
    // Insert current lang
    data.lang = this.publicProfileConfig.profile_data.lang || "en";
    console.log(data);
    console.log(this.currentTabIndex);
    const tab = this.tabs.find(x => x.slug === data.slug)
    if (tab) {
      const tabs_by_lang = this.tabs.filter(x => x.lang === tab.lang);
      const index = tabs_by_lang.indexOf(tab);
      console.log(index);
      if (index !== -1 && index !== this.currentTabIndex) {
        this.api.showToast(`Already exists a page with this link.`, ToastType.error);
        return;
      }
    }
    if (this.currentTabIndex != undefined && this.tabsByLang.length) {
      this.tabsByLang[this.currentTabIndex].title = data.title;
      this.tabsByLang[this.currentTabIndex].slug = data.slug;
      this.tabsByLang[this.currentTabIndex].active = data.active;
      this.tabsByLang[this.currentTabIndex].lang = data.lang;
    } else {
      this.tabs.push(data);
    }
    this.modal.getModal("tabForm").close();

  }

  deleteTab(index) {
    const tab = this.tabsByLang[index];
    const index_item = this.tabs.indexOf(tab);
    this.tabs.splice(index_item, 1);

    if (confirm(`Are you sure you want to delete this tab?`)) {
      this.tabsByLang.splice(index, 1);
      if (index > 0) {
        this.currentTabIndex = index - 1;
      }
    }
  }

  openUpdateTab(index) {
    this.currentTabIndex = index;
    this.modal.getModal("tabForm").open();
  }

  openUpdateSubPage(event) {
    const index = this.tabsByLang[this.currentTabIndex].sub_pages.indexOf(event);
    console.log(index);
    console.log(this.tabsByLang[this.currentTabIndex]);
    this.currentSubPageIndex = index;
    this.modal.getModal("subPageForm").open();
  }

  get tabsByLang(): Array<any> {
    if (this.tabs) {
      return this.tabs.filter((tab: any) => {
        // Fallback to english by default
        if (!tab.lang && this.publicProfileConfig.profile_data.lang == "en") {
          return true;
        } else {
          return tab.lang == this.publicProfileConfig.profile_data.lang;
        }
      });
    }
    return [];
  }

  get selectedTab() {
    if (this.currentTabIndex != undefined) {
      return Object.assign({}, this.tabsByLang[this.currentTabIndex]);
    }
    return;
  }

  get selectedSubPage() {
    if (this.currentTabIndex != undefined) {
      if (this.currentSubPageIndex != undefined) {
        if (this.tabsByLang[this.currentTabIndex].sub_pages && this.tabsByLang[this.currentTabIndex].sub_pages.length > 0) {
          return Object.assign({}, this.tabsByLang[this.currentTabIndex].sub_pages[this.currentSubPageIndex]);
        }
      }
      return;
    }
    return;
  }

  dropTab(event: CdkDragDrop<any>) {
    moveItemInArray(this.tabs, event.previousIndex, event.currentIndex);
  }

  /** SUB PAGES */
  get currentSubPage() {
    if (
      this.selectedSubPageIndex != undefined &&
      this.currentTabIndex != undefined
    ) {
      return this.tabsByLang[this.currentTabIndex].sub_pages[
        this.selectedSubPageIndex
      ];
    }
  }

  openSubPageForm() {
    this.modal.getModal("subPageForm").open();
  }

  submitSubPage(data: any) {
    console.log(data);


    if (this.currentTab.sub_pages) {
      const sub_page = this.currentTab.sub_pages.find(x => x.slug === data.slug)
      if (sub_page) {
        const tabs_by_lang = this.currentTab.sub_pages.filter(x => x.lang === sub_page.lang);
        const index = tabs_by_lang.indexOf(sub_page);
        console.log(index);
        if (index !== -1 && index !== this.currentSubPageIndex) {
          this.api.showToast(`Already exists a page with this link.`, ToastType.error);
          return;
        }
      }

      if (this.currentSubPageIndex != undefined && this.currentTab.sub_pages.length) {
        this.currentTab.sub_pages[this.currentSubPageIndex] = data;
      } else {
        this.currentTab.sub_pages.push(data);
      }
    } else {
      this.currentTab.sub_pages = [data];
    }
    this.modal.getModal("subPageForm").close();
  }

  changeSubPage(data: any) {
    this.currentTabIndex = data.tabIndex;
    this.selectedSubPageIndex = data.index;
  }

  // Sections
  submitSection(data: any) {
    this.modal.getModal("sectionForm_1").close();

    if (this.currentSubPage) {
      if (this.currentSubPage.sections) {
        if (this.selectedSection != undefined) {
          this.currentSubPage.sections[this.selectedSection] = data;
          this.selectedSection = undefined;

          // If none selected, insert as new section
        } else {
          this.currentSubPage.sections.push(data);
        }
      } else {
        return (this.currentSubPage.sections = [data]);
      }
    }

    if (this.currentTab.sections && this.currentTab.sections.length) {
      // When a section is previously selected
      // Update the instance
      if (this.selectedSection != undefined) {
        const prevContent = Object.assign(
          {},
          this.currentTab.sections[this.selectedSection].section_content
        );

        if (!prevContent.iframe_height && data.section_content.iframe_height) {
          prevContent.iframe_height = data.section_content.iframe_height;
        } else if (data.section_content.iframe_height) {
          prevContent.iframe_height = data.section_content.iframe_height;
        } else {
          prevContent.iframe_height = 1024;
        }
        // data.section_content = prevContent;
        this.currentTab.sections[this.selectedSection] = Object.assign({}, data);
        this.selectedSection = undefined;

        return

        // If none selected, insert as new section
      } else {
        this.currentTab.sections.push(data);
      }
      return;
    } else {
      return (this.currentTab.sections = [data]);
    }
  }

  deleteSection(index) {
    if (confirm(`Are you sure you want to delete this section?`)) {
      if (this.currentSubPage) {
        this.currentSubPage.sections.splice(index, 1);
      } else {
        this.currentTab.sections.splice(index, 1);
      }
    }
  }

  openUpdateSection(index) {
    this.selectedSection = index;
    this.modal.getModal("sectionForm_1").open();
  }

  get selectedSectionInstance() {
    if (this.currentSubPage) {
      let sections: any[] = [];
      if (this.currentSubPage.sections) {
        sections = this.currentSubPage.sections[this.selectedSection];
      }
      return Object.assign({}, sections);
    } else {
      if (this.selectedSection) {
        return Object.assign(
          {},
          this.currentTab.sections[this.selectedSection]
        );
      }
    }
  }

  trackSections(index, section: any) {
    return index;
  }

  dropSection(event: CdkDragDrop<any>) {
    let sections: any[] = [];

    if (this.currentSubPage) {
      sections = this.currentSubPage.sections || [];
    } else {
      sections = this.currentTab.sections;
    }

    moveItemInArray(sections, event.previousIndex, event.currentIndex);
  }

  // Main save
  saveProfileSettings() {
    let request: Observable<any>;
    this.saving = true;

    const profile_data = {
      tabs: this.tabs,
      social_links: this.publicProfileConfig.profile_data.social_links,
      header_style: this.publicProfileConfig.profile_data.header_style,
      footer: this.publicProfileConfig.profile_data.footer,
      cover_mode: this.publicProfileConfig.profile_data.cover_mode,
      slides: this.publicProfileConfig.profile_data.slides,
      lang: this.publicProfileConfig.profile_data.lang,
    };

    if (this.publicProfileConfig && this.publicProfileConfig.id) {
      request = this.api.patch(
        `publicProfileWeb/${this.publicProfileConfig.id}`,
        {
          profile_data,
          idIglesia: this.idIglesia,
        }
      );
    } else {
      request = this.api.post("publicProfileWeb", {
        profile_data,
        idIglesia: this.idIglesia,
      });
    }

    request.subscribe(
      (res: any) => {
        this.snackbar.open(`Changes were saved and published`, "OK", {
          duration: 5000,
        });
        this.saving = false;
        this.getPublicProfileConfig();
      },
      (err) => {
        console.error(err);
        alert("errror");
        this.saving = false;
      }
    );
  }

  addSocialLinks(data) {
    this.publicProfileConfig.profile_data.social_links = data;
    this.modal.getModal("socialLinksForm").close();
  }

  updateHeaderStyle(data) {
    this.publicProfileConfig.profile_data.header_style = data;
    this.modal.getModal("headerStyleModal").close();
  }

  openPage() {
    window.open(`/organizations/profile/${this.idIglesia}`, "_blank");
  }

  addFooter() {
    this.publicProfileConfig.profile_data.footer = {
      rows: [
        {
          content: `<span>Write here</span>`,
        },
      ],
      background_color: "white",
      text_color: "black",
      background_image: "",
      background_position: "center",
      background_size: "cover",
    };
  }

  // Cover
  toggleCoverMode() {
    this.publicProfileConfig.profile_data.cover_mode =
      this.publicProfileConfig.profile_data.cover_mode == "slider"
        ? "cover"
        : "slider";
  }
}
