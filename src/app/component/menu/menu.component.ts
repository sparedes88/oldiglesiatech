import { TranslateService } from '@ngx-translate/core';
import { NoteService } from './../../services/note.service';
import { GroupsService } from './../../services/groups.service';
import { OrganizationService } from './../../services/organization/organization.service';
import { NgxSmartModalComponent, NgxSmartModalService } from 'ngx-smart-modal';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';
import { UserService } from '../../services/user.service';
import { Observable } from 'rxjs';
import { ConfigurationTabModel } from 'src/app/models/ConfigurationTabModel';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { ApiService } from 'src/app/services/api.service';
import { environment } from 'src/environments/environment';
import { environment as prod } from 'src/environments/environment.prod';
import { ToastType } from 'src/app/login/ToastTypes';
import * as moment from 'moment-timezone';
import { COUNTRIES_DB } from '@angular-material-extensions/select-country';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ResourceModel } from 'src/app/models/RessourceModel';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  currentUser: User;
  requestCount: number = 0
  custom_logo_pic: string;

  countries = COUNTRIES_DB;
  organization_checked: boolean;

  text_editor_form: FormGroup = this.form_builder.group({
    id: new FormControl(),
    created_by: new FormControl(),
    has_been_sanitize: new FormControl(false),
    img_file: new FormControl(),
    temp_src: new FormControl(undefined),
  });
  @ViewChild('img_tag') img_tag: any;
  submit_loading: boolean = false;

  get file_info(): ResourceModel {
    if (this.text_editor_form) {
      if (this.text_editor_form.get('file_info')) {
        return this.text_editor_form.get('file_info').value;
      }
    }
  }

  constructor(
    private router: Router,
    public userService: UserService,
    private organizationService: OrganizationService,
    public groupService: GroupsService,
    private modal: NgxSmartModalService,
    public noteService: NoteService,
    private fus: FileUploadService,
    private api: ApiService,
    private translate_service: TranslateService,
    private form_builder: FormBuilder,
    private sanitizer: DomSanitizer,
  ) {
    this.currentUser = this.userService.getCurrentUser();
    if (window != window.top) {
    } else {

      console.log(this.currentUser);
    }
  }
  public selectedIglesia: any[] = [];
  public iglesia: any = {};
  public iglesias: any[] = [];
  public assignedIglesias: any[] = [];
  tabToShow: ConfigurationTabModel;
  selectOpts = {
    singleSelection: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
    closeDropDownOnSelection: false,
    idField: 'idIglesia',
    textField: 'Nombre'
  };
  select_country_options = {
    singleSelection: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
    closeDropDownOnSelection: false,
    idField: 'alpha2Code',
    textField: 'name'
  };
  select_zone_options = {
    singleSelection: true,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true,
    closeDropDownOnSelection: false,
    idField: 'value',
    textField: 'name'
  };
  selectIglesia(selectedIglesia: any) {
    const iglesia = this.iglesias.find(
      ig => ig.idIglesia === selectedIglesia.idIglesia
    );


    this.currentUser = this.userService.getCurrentUser();
    if (iglesia) {
      this.currentUser.idIglesia = iglesia.idIglesia;
      this.currentUser.iglesia = iglesia.Nombre;
      this.currentUser.topic = iglesia.topic;
      if (iglesia.Logo) {
        this.currentUser.logoPic = this.fus.cleanPhotoUrl(iglesia.Logo);
      } else {
        this.currentUser.logoPic = undefined;
      }
    }
    const userStr: string = JSON.stringify(this.currentUser);
    localStorage.setItem('currentUser', userStr);
    this.loadTabs();
    this.getIglesia();

  }

  changeIglesia(selectedIglesia: any) {
    const iglesia = this.iglesias.find(
      ig => ig.idIglesia === selectedIglesia.idIglesia
    );


    this.currentUser = this.userService.getCurrentUser();
    this.currentUser.idIglesia = iglesia.idIglesia;
    this.currentUser.iglesia = iglesia.Nombre;
    this.currentUser.topic = iglesia.topic;
    if (iglesia.Logo) {
      this.currentUser.logoPic = this.fus.cleanPhotoUrl(iglesia.Logo);
    } else {
      this.currentUser.logoPic = undefined;
    }
    const userStr: string = JSON.stringify(this.currentUser);
    localStorage.setItem('currentUser', userStr);
    this.loadTabs();
    this.getIglesia();
    window.location.reload()
  }

  loadTabs() {
    this.organizationService.getConfiguracionesTabs().subscribe(
      (data: any) => {
        if (data.msg.Code === 200) {
          const tabs = [...data.tabs];
          this.tabToShow = tabs[0];
        }
      },
      error => {
        console.error(error);
      }
    );
  }
  getIglesias() {
    if (this.currentUser) {
      let endpoint = `designRequests/getDesignRequestDropdown/`;
      if (this.currentUser.isSuperUser) {
        endpoint += `?show_test=true`;
      }
      this.api
        .get(`${endpoint}`)
        .subscribe((data: any) => {
          if (data.iglesias) {
            if (this.currentUser.isSuperUser) {
              this.iglesias = data.iglesias;
            } else {
              this.iglesias = data.iglesias.filter(ig =>
                this.assignedIglesias.includes(ig.idIglesia)
              );
            }
          }
          if (this.currentUser.idIglesia) {
            this.selectIglesia(this.currentUser);
          }
        });
    }
  }
  zones: any = [];
  ngOnInit() {
    let subscription: Observable<any>;
    let subscription2: Observable<any>;
    console.log(this.currentUser);

    if (this.currentUser) {
      if (this.currentUser.isSuperUser) {
        subscription = this.groupService.getRequestCount();
        subscription.subscribe(response => {
          this.groupService.helpRequestCount = response.count
        }, error => {
          console.error(error);
        });
        subscription2 = this.noteService.getAssignedCount();
        subscription2.subscribe(response => {
          console.log(response)
          this.noteService.assignedCount = response.count
        }, error => {
          console.error(error);
        });
      }
      this.getIglesia();
    }
    this.getIglesias()

    if (this.iglesia) {
      this.selected_country = this.countries.find(x => x.alpha2Code === this.iglesia.country);
      if (this.selected_country) {
        this.getZonesForCountry(this.selected_country.alpha2Code);
      }
    }
    this.checkBanner();
  }
  async checkBanner(reset_form?: boolean) {
    const response: any = await this.api.get(`theme/banner/`, {}).toPromise()
      .catch(error => {
        console.error(error);
        return;
      }
      );
    if (response) {
      this.text_editor_form.addControl('idResource', new FormControl(response.idResource, []));
      this.text_editor_form.addControl('file_info', new FormControl(response.file_info, []));
      this.text_editor_form.patchValue(response);
      if (reset_form) {
        this.text_editor_form.get('temp_src').setValue(undefined);
        this.text_editor_form.get('img_file').setValue(undefined);
      }
      console.log(this.text_editor_form);

    }
  }

  get is_possible_client() {
    if (this.iglesia) {
      return this.iglesia.idCatalogoPlan == 16;
    }
    return false;
  }

  getOrganizationProfile() {
    const user_service = this.userService.getCurrentUser();
    if (user_service) {
      if (this.iglesia) {
        if (this.iglesia.idCatalogoPlan == 16) {
          return `/dashboard`;
        } else {
          return `/organization-profile/main/${user_service.idIglesia}/inicio`;
        }
      } else {
        return `/organization-profile/main/${user_service.idIglesia}/inicio`;
      }
    }
  }

  getZonesForCountry(country_code: string) {
    this.zones = [];
    const zones = moment.tz.zonesForCountry(country_code);
    zones.forEach(x => {
      const item = {
        name: x.replace(/_/g, ' '),
        value: x
      }
      this.zones.push(item);
    });
    if (this.iglesia) {
      this.selected_zone = this.zones.filter(x => x.value === this.iglesia.timezone);
    }
  }

  getIglesia() {
    this.organization_checked = false;
    this.api
      .get(`getIglesiaFullData/`, { idIglesia: this.currentUser.idIglesia })
      .subscribe(
        (data: any) => {
          this.iglesia = data.iglesia;
          // Set selected Iglesia dropdown
          this.api
            .get(`iglesias/getIglesiaProfileDetail`, { idIglesia: this.currentUser.idIglesia })
            .subscribe((response: any) => {
              this.iglesia.free_version = response.iglesia.free_version;
              this.organization_checked = true;
            },
              (err: any) => {
                console.error(err);
                this.organization_checked = true;
              },
              () => {
              }
            );
          this.selectedIglesia = [
            {
              idIglesia: data.iglesia.idIglesia,
              Nombre: data.iglesia.Nombre
            }
          ];
          this.selected_country = this.countries.filter(x => x.alpha2Code === this.iglesia.country);
          if (this.selected_country.length > 0) {
            this.getZonesForCountry(this.selected_country[0].alpha2Code);
          }
        },
        (err: any) => console.error(err),
        () => {
        }
      );
  }

  logout() {
    this.router.navigate(['/login']);
    this.userService.logout();
    console.log('Logout Bye!');
  }

  get is_inside_register() {
    return this.router.url.includes('register/groups/details/');
  }

  getLogo() {
    this.currentUser = this.userService.getCurrentUser();
    if (this.is_inside_register) {
      if (this.custom_logo_pic) {
        if (this.custom_logo_pic.includes('http')) {
          return this.custom_logo_pic;
        } else {
          return `${environment.serverURL}${this.custom_logo_pic}`;
        }
      }
      return `${environment.serverURL}${this.currentUser.logoPic}`;
    } else {
      if (this.currentUser.logoPic) {
        return `${environment.serverURL}${this.currentUser.logoPic}`;
      }
    }
    // else
    return '/assets/img/favicon.png';
  }

  makePushNotification() {
    if (this.currentUser.idUserType === 1) {
      this.modal.getModal('makePushModal_1').open();
    }
  }
  consolelog() {
    console.log("redirect")
    this.router.navigateByUrl(`/content`);
  }
  dismissPushModal(message) {
    if (message) {
      const currentUser = this.userService.getCurrentUser();
      const notification = {
        title: message.title,
        body: message.body,
        idIglesia: currentUser.idIglesia,
        topic: currentUser.topic
      };
      this.organizationService.sendNotification(notification)
        .subscribe(response => {
          console.log(response);
          this.organizationService.api.showToast('Notification sent successfully', 1);
          this.modal.getModal('makePushModal_1').close();
        }, error => {
          console.error(error);
          this.organizationService.api.showToast('Error sending the notification.', 2);
        });
    } else {
      this.modal.getModal('makePushModal_1').close();
    }
  }

  getRouterDesign(currentUser: User) {
    if (currentUser.isSuperUser) {
      return `/admin/design-request`;
    } else {
      return `/design-request/${currentUser.idIglesia}/list`;
    }
  }
  getRouterTimesheet(currentUser: User) {
    if (currentUser.isSuperUser) {
      return `/admin/timesheet`;
    } else {
      return `/time-sheet/${currentUser.idIglesia}/list`;
    }
  }

  getRouterHome(currentUser: User) {
    if (currentUser.isSuperUser || currentUser.idUserType === 1) {
      return `/dashboard`;
    } else {
      return `/user-profile/details/${currentUser.idUsuario}`;
    }
  }

  openLanguageModal() {
    this.modal.getModal('language_modal').open();
    // this.api.get()
  }

  openEventsBanner() {
    this.modal.getModal('banner_modal').open();
  }

  async updateLanguage() {
    let is_error = false;
    const response_language: any = await this.api.post(`iglesias/updateLanguage`, {
      idIdioma: this.iglesia.idIdioma,
      idIglesia: this.currentUser.idIglesia
    }).toPromise()
      .catch(error => {
        console.error(error);
        this.api.showToast(`Error updating language`, ToastType.error);
        is_error = true;
        return;
      })
    if (response_language) {
      let code: string;
      console.log(this.iglesia.idIdioma);

      switch (this.iglesia.idIdioma) {
        case '1':
          code = 'es';
          break;
        case '2':
          code = 'en';
          break;
      }
      console.log(code);
      localStorage.setItem("lang", code);
      this.translate_service.use(code);
      this.modal.getModal('language_modal').close();
    }

    const response_timezone: any = await this.api.post(`iglesias/updateTimezone`, {
      timezone: this.iglesia.timezone,
      idIglesia: this.currentUser.idIglesia
    }).toPromise().catch(error => {
      console.error(error);
      is_error = true;
      this.api.showToast(`Error updating the timezone`, ToastType.error);
      return;
    });
    if (!is_error) {
      this.api.showToast(`Info saved successfully`, ToastType.success);
    }
  }

  visits_info: any;

  openAnalyticsModal(modal: NgxSmartModalComponent) {
    modal.open();
    console.log('ionViewDidLoad RedirectFormPage');
    this.getVisitsInfo();
  }

  getVisitsInfo() {
    this.api.get_old(`redirect/${this.currentUser.idIglesia}/manage`,)
      .subscribe((response: any) => {
        console.log(response);
        this.visits_info = response;
      }, error => {
        this.api.showToast(`Error getting url.`, ToastType.error);
      });
  }

  get visit_domain_code() {
    if (this.currentUser) {
      return `
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "https://iglesia-tech-api.e2api.com/api/redirect/domain/${this.currentUser.idIglesia}");

  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.onload = () => console.log(xhr.responseText);

  let data = '{}';
  xhr.send(data);`;
    }
  }

  get example_visit_domain_code() {
    return `
$(document).ready(function() {
  calcHeight();
  ${this.visit_domain_code}
});
`;
  }

  selected_country
  selected_zone

  setCountry(event) {
    this.getZonesForCountry(event.alpha2Code);

  }
  setZone(event) {
    this.iglesia.timezone = event.value;
  }

  fixUrl() {
    if (this.text_editor_form.get('temp_src').value) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(this.text_editor_form.get('temp_src').value);
    } else if (this.file_info) {
      return `${environment.serverURL}${this.file_info.src_path}`;
    } else {
      return `/assets/img/default-cover-image.jpg`
    }
  }

  addEventBannerPhoto(file: File) {
    this.text_editor_form.get('img_file').setValue(file);

    if (file) {
      setTimeout(() => {
        this.img_tag.nativeElement.src = URL.createObjectURL(file);
        this.text_editor_form.get('temp_src').setValue(this.img_tag.nativeElement.src);
      }, 600);
      var reader = new FileReader();
      //Read the contents of Image File.
      reader.readAsDataURL(file);
      reader.onload = (e: any) => {
        console.log(this.text_editor_form);
        //Initiate the JavaScript Image object.
        var image = new Image();

        //Set the Base64 string return from FileReader as source.
        image.src = e.target.result as any;

        //Validate the File Height and Width.
        image.onload = () => {
          var height = image.height;
          var width = image.width;
          // const aspect_ratio = height / width;

          // const client_width = this.col_img_banner_container.nativeElement.clientWidth;

          // this.container = {
          //   width: client_width,
          //   height: client_width * aspect_ratio
          // }

          return true;
        }
      };
    } else {
      this.text_editor_form.get('temp_src').setValue(undefined);
      setTimeout(() => {
        this.img_tag.nativeElement.src = this.fixUrl();
      }, 600);
    }
  }

  async updateBanner() {
    this.submit_loading = true;
    if (this.text_editor_form.invalid) {
      this.submit_loading = false;
      this.api.showToast(`Please check the info provided.`, ToastType.error);
      return;
    }
    const payload = this.text_editor_form.value;
    payload.created_by = this.currentUser.idUsuario;
    let has_new_file = false;
    if (!payload.img_file) {
      if (this.text_editor_form.get('idResource').value) {
        this.api.showToast(`Please add a new picture.`, ToastType.error);
      } else {
        this.api.showToast(`Please add a picture.`, ToastType.error);
      }
      this.submit_loading = false;
      return;
    } else {
      has_new_file = true;
    }
    if (has_new_file) {
      const response: any = await this.fus.uploadFile(payload.img_file, false, 'media')
        .toPromise()
        .catch(error => {
          console.error(error);
          return;
        });
      if (response) {
        payload.idResource = response.file_info.id
      } else {
        this.api.showToast(`Error uploading the file.`, ToastType.error);
        return;
      }
    }


    let subscription: Observable<any>;
    let success_message: string;
    let error_message: string;
    if (payload.id) {
      subscription = this.api.post(`theme/banner/`, payload);
      success_message = `Banner updated successfully.`;
      error_message = `Error updating banner`;
    } else {
      subscription = this.api.post('theme/banner/', payload);
      success_message = `Banner added successfully`;
      error_message = `Error adding banner`;
    }

    subscription
      .subscribe(response => {
        this.submit_loading = false;
        this.api.showToast(`${success_message}`, ToastType.success);
        this.checkBanner(true);
        this.text_editor_form.get('id').setValue(response.id);
      }, error => {
        console.error();
        this.submit_loading = false;
        this.api.showToast(`${error_message}`, ToastType.error);
      });
  }

}
