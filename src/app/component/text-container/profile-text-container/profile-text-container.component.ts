import { Observable } from 'rxjs';
import { ToastType } from '../../../pages/contact/toastTypes';
import { ElementRef, EventEmitter, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Component, Input, OnInit, Sanitizer } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgxSmartModalStackService } from 'ngx-smart-modal/src/services/ngx-smart-modal-stack.service';
import { User } from 'src/app/interfaces/user';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { ResourceModel } from 'src/app/models/RessourceModel';
import { ApiService } from 'src/app/services/api.service';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { RandomService } from 'src/app/services/random.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

export class ProfileTextContainerModel {
  id: number;
  identifier: string;
  idOrganization: number;
  title: string;
  display_title: boolean;
  label: string;
  display_label: boolean;
  idResource: number;
  display_picture: boolean;
  description: string;
  created_by: number;
  has_been_sanitize: boolean;
  sanitize_description: SafeHtml;
  original_description: string;
  sort_by: number;
  idProfileSection: number;
  file_info: ResourceModel;

  constructor() {
    this.has_been_sanitize = false;
    this.identifier = RandomService.makeId();
  }
}

@Component({
  selector: 'app-profile-text-container',
  templateUrl: './profile-text-container.component.html',
  styleUrls: ['./profile-text-container.component.scss']
})
export class ProfileTextContainerComponent implements OnInit, OnChanges {

  @Input('can_edit') can_edit: boolean;
  @Input('idOrganization') idOrganization: number;
  @Input('loading') loading: boolean;
  @Input('container') container: ProfileTextContainerModel;
  @Input('parent_container') parent_container: ElementRef;
  @Input('style_settings') style_settings: any;
  @Input('make_request') make_request: boolean;
  @Input('id') id: number;

  @Output('add_button') add_button: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  @Output('on_delete') on_delete: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('input_button') input_button: ElementRef;
  @ViewChild('img_tag') img_tag: any;

  currentUser: User;
  submit_loading: boolean = false;

  text_editor_form: FormGroup = this.form_builder.group({
    id: new FormControl(),
    identifier: new FormControl(),
    idOrganization: new FormControl(),
    idProfileSection: new FormControl(),
    title: new FormControl(),
    display_title: new FormControl(true),
    label: new FormControl(),
    display_label: new FormControl(true),
    idResource: new FormControl(),
    display_picture: new FormControl(true),
    description: new FormControl('', [Validators.required]),
    created_by: new FormControl(),
    has_been_sanitize: new FormControl(false),
    sanitize_description: new FormControl(),
    original_description: new FormControl(),
    img_file: new FormControl(),
    temp_src: new FormControl(undefined),
    sort_by: new FormControl(1),
  });

  button_gen: {
    link: string;
    background: string;
    height: number;
    width: number;
  } = {
      link: '',
      background: '/assets/img/btn_src.png',
      height: 48,
      width: 222
    };

  constructor(
    private form_builder: FormBuilder,
    private user_service: UserService,
    private sanitizer: DomSanitizer,
    private modal_service: NgxSmartModalService,
    private organizationService: OrganizationService,
    private fus: FileUploadService,
    private api: ApiService,
    private el_ref: ElementRef,
    private router: Router
  ) {
    this.currentUser = this.user_service.getCurrentUser();
  }

  async ngOnInit() {
    if (this.make_request && this.id) {
      await this.getContainer();
    }
    if (!this.idOrganization) {
      this.text_editor_form.get('idOrganization').setValue(this.currentUser.idIglesia);
    }
    if (this.container) {
      this.text_editor_form.addControl('idResource', new FormControl(this.container.idResource, []));
      this.text_editor_form.addControl('file_info', new FormControl(this.container.file_info, []));
      this.text_editor_form.patchValue(this.container);
    }
    this.text_editor_form.get('idOrganization').setValue(this.idOrganization);
    this.text_editor_form.get('created_by').setValue(this.currentUser.idUsuario);
    this.setLinks();
  }

  async getContainer() {
    this.loading = true;
    let params: Partial<{
      id: number;
      idOrganization: number;
      extended: boolean;
    }> = {
      id: Number(this.id),
      idOrganization: this.idOrganization,
      extended: true
    };
    const response: any = await this.api.get(`iglesias/sections/filter`, params).toPromise()
      .catch(error => {
        this.api.showToast(`Error getting your settings.`, ToastType.error);
        return;
      });
    if (response) {
      if (response.sections.length > 0) {
        this.container = response.sections[0];
        console.log(this.container);

      }
      this.loading = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.can_edit) {
      if (!changes.can_edit.firstChange && !changes.can_edit.currentValue) {
        this.setLinks();
      }
    }
  }

  setLinks() {
    setTimeout(() => {
      const buttons: NodeList = this.el_ref.nativeElement.querySelectorAll('.src-custom-button-as-internal');
      buttons.forEach(x => {
        const full_url: string = x['href'];
        if (full_url.startsWith('http') && full_url.includes(x.baseURI)) {
          x.removeEventListener('click', () => { });
          x.addEventListener('click', (event) => {
            event.preventDefault();
            let url: string = x['href'];
            if (full_url.startsWith('http')) {
              url = url.replace(x.baseURI, '');
            }
            this.router.navigateByUrl(url);
          })
        }
      })
    }, 500);
  }

  getInfo(): SafeHtml {
    const form_value: ProfileTextContainerModel = this.text_editor_form.value;
    if (!form_value.has_been_sanitize) {
      form_value.original_description = form_value.description;
      if (form_value.description) {
        let content_fixed = form_value.description.replace(/&lt;/gm, '<').replace(/&gt;/gm, '>');
        const sanitized_content = this.sanitizer.bypassSecurityTrustHtml(content_fixed);
        this.text_editor_form.get('has_been_sanitize').setValue(true);
        this.text_editor_form.get('sanitize_description').setValue(sanitized_content);
        form_value.sanitize_description = sanitized_content;
        setTimeout(() => {
          this.fixFrameStyle();
        });
      }
    }
    return form_value.sanitize_description;
  }

  updateSanitizeContent() {
    const form_value: ProfileTextContainerModel = this.text_editor_form.value;
    if (form_value.description) {
      let content_fixed = form_value.description.replace(/&lt;/gm, '<').replace(/&gt;/gm, '>');
      const sanitized_content = this.sanitizer.bypassSecurityTrustHtml(content_fixed);
      this.text_editor_form.get('has_been_sanitize').setValue(true);
      this.text_editor_form.get('sanitize_description').setValue(sanitized_content);
    }
  }

  fixFrameStyle() {
    Array.prototype.forEach.call(document.getElementsByClassName('fix-frame'), element => {
      Array.prototype.forEach.call(element.getElementsByTagName('p'), p => {
        p.classList.add('card-content-fixed');
        Array.prototype.forEach.call(p.getElementsByTagName('iframe'), img => {
          img.style.maxWidth = '100%';
          img.style.height = 'unset';
          img.style.width = '100%';
          img.classList.add('frame-style-custom');
        });
        Array.prototype.forEach.call(p.getElementsByTagName('img'), img => {
          img.style.maxWidth = '95%';
          img.style.display = 'block';
          img.style.margin = 'auto auto';
          img.classList.add('quill-image-fixer');
        });
      });
      Array.prototype.forEach.call(element.getElementsByTagName('iframe'), img => {
        img.style.maxWidth = '100%';
        img.classList.add('frame-style-custom');
      });
    });
  }

  openButtonModal() {
    this.add_button.emit(this.text_editor_form);
  }

  insertButton() {
    const form_value: ProfileTextContainerModel = this.text_editor_form.value;
    let button_frame_fixed = this.button_frame.replace(/</gm, '&lt;').replace(/>/gm, '&gt;');
    form_value.description += button_frame_fixed;
    form_value.has_been_sanitize = false;
    form_value.original_description = form_value.description;
    // this.editService(-1);
    this.clearFrameButtonInput();
    const identifier = `button_modal_${form_value.identifier}`;
    this.modal_service.get('generate_button_modal').close();
  }


  clearFrameButtonInput() {
    this.button_gen = {
      link: '',
      background: '/assets/img/btn_src.png',
      height: 48,
      width: 222
    };
    this.input_button.nativeElement.value = null;
    // this.service_editing = undefined;
  }

  async selectAndUploadFile(file: File) {
    const indexPoint = (file.name as string).lastIndexOf('.');
    const extension = (file.name as string).substring(indexPoint);
    const ticks = (
      Number(String(Math.random()).slice(2)) +
      Date.now() +
      Math.round(performance.now())
    ).toString(36);
    const myUniqueFileName = `button_${this.currentUser.idIglesia}_${ticks}${extension}`;

    const iglesia_temp = new OrganizationModel();
    iglesia_temp.idIglesia = this.currentUser.idIglesia;
    iglesia_temp.topic = this.currentUser.topic;

    const response: any = await this.organizationService.uploadFile(file, iglesia_temp, myUniqueFileName, 'logo', true);
    if (response) {
      const clean_src = this.fus.cleanPhotoUrl(response.response);
      this.button_gen.background = `${environment.serverURL}${clean_src}`;
    }
    var reader = new FileReader();
    //Read the contents of Image File.
    reader.readAsDataURL(file);
    reader.onload = (e: any) => {

      //Initiate the JavaScript Image object.
      var image = new Image();

      //Set the Base64 string return from FileReader as source.
      image.src = e.target.result as any;

      //Validate the File Height and Width.
      image.onload = () => {
        var height = image.height;
        var width = image.width;

        const aspect_ratio = height / width;
        const size_column = this.parent_container.nativeElement.clientWidth;

        const percent_ratio = size_column * .60;

        const fixed_size = percent_ratio;
        this.button_gen.height = fixed_size * aspect_ratio;
        this.button_gen.width = fixed_size;

        return true;;
      }
    };
  }

  getBackgroundUrl() {
    return `url("${this.button_gen.background}")`;
  }

  get button_frame() {
    return `<div class="text-center"><a href="${this.button_gen.link}" target="_blank" rel="noopener noreferrer"><button class="btn btn-button-test" style="background: url('${this.button_gen.background}');background-position: center;background-size: cover;background-repeat: no-repeat;width: ${this.button_gen.width}px;height: ${this.button_gen.height}px;"></button></a></div>`
  }

  get file_info(): ResourceModel {
    if (this.text_editor_form) {
      if (this.text_editor_form.get('file_info')) {
        return this.text_editor_form.get('file_info').value;
      }
    }
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

  addDefaultEntryPhoto(file: File) {
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

          return true;;
        }
      };
      // this.edit_object.home_banner = true

    } else {
      this.text_editor_form.get('temp_src').setValue(undefined);
      setTimeout(() => {
        this.img_tag.nativeElement.src = this.fixUrl();
      }, 600);
    }
  }

  cancelEdit() {
    this.can_edit = false;
  }

  async saveContainer() {
    this.submit_loading = true;
    if (this.text_editor_form.invalid) {
      this.submit_loading = false;
      this.api.showToast(`Please check the info provided.`, ToastType.error);
      return;
    }
    if (this.text_editor_form.get('display_title').value && !this.text_editor_form.get('title').value) {
      this.submit_loading = false;
      this.api.showToast(`Please type your title.`, ToastType.error);
      return;
    }
    if (this.text_editor_form.get('display_label').value && !this.text_editor_form.get('label').value) {
      this.submit_loading = false;
      this.api.showToast(`Please type your subtitle/label.`, ToastType.error);
      return;
    }
    const payload = this.text_editor_form.value;
    let has_new_file = false;
    if (!payload.img_file) {
      if (this.container.id) {
        if (this.text_editor_form.get('idResource')) {
          if (!this.text_editor_form.get('idResource').value && this.text_editor_form.get('display_picture').value) {
            this.api.showToast(`Please add a picture.`, ToastType.error);
            this.submit_loading = false;
            return;
          }
        }
      } else {
        if (this.text_editor_form.get('display_picture').value) {
          this.api.showToast(`Please add a file.`, ToastType.error);
          this.submit_loading = false;
          return;
        }
      }
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
      subscription = this.api.patch(`iglesias/sections/${payload.id}`, payload);
      success_message = `Text section updated successfully.`;
      error_message = `Error updating text section`;
    } else {
      subscription = this.api.post('iglesias/sections', payload);
      success_message = `Text section added successfully`;
      error_message = `Error adding text section`;
    }

    subscription
      .subscribe(response => {
        this.submit_loading = false;
        this.api.showToast(`${success_message}`, ToastType.success);
        if (!payload.id) {
          this.container.id = response.id;
          this.text_editor_form.get('id').setValue(response.id);
          this.ngOnInit();
        }
      }, error => {
        console.error();
        this.submit_loading = false;
        this.api.showToast(`${error_message}`, ToastType.error);
      });
  }

  async deleteContainer() {
    if (confirm('Are you sure yo want to delete this text editor?')) {
      if (this.container.id) {
        const response = await this.api.delete(`iglesias/sections/${this.container.id}?idIglesia=${this.idOrganization}&deleted_by=${this.currentUser.idUsuario}`).toPromise()
          .catch(error => {
            console.error(error);
            return;
          });
        if (response) {
          this.api.showToast(`Deleted successfully`, ToastType.success);
          this.on_delete.emit()
        }
      } else {
        this.on_delete.emit()
      }
    }
  }
}
