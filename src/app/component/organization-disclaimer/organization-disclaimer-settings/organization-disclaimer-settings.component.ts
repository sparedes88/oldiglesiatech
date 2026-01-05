import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';

import { ToastType } from './../../../login/ToastTypes';
import { ApiService } from './../../../services/api.service';
import { ProfileTextContainerModel } from 'src/app/component/text-container/profile-text-container/profile-text-container.component';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-organization-disclaimer-settings',
  templateUrl: './organization-disclaimer-settings.component.html',
  styleUrls: ['./organization-disclaimer-settings.component.scss']
})
export class OrganizationDisclaimerSettingsComponent implements OnInit {

  @Input('idOrganization') idOrganization: number;
  @Output('on_close') on_close: EventEmitter<any> = new EventEmitter<any>();

  submit_loading: boolean = false;
  section: ProfileTextContainerModel;
  currentUser: User;
  text_editor_form: FormGroup = this.form_builder.group({
    id: new FormControl(),
    identifier: new FormControl(),
    idOrganization: new FormControl(),
    idProfileSection: new FormControl(),
    title: new FormControl(),
    display_title: new FormControl(false),
    label: new FormControl(),
    display_label: new FormControl(true),
    idResource: new FormControl(),
    display_picture: new FormControl(false),
    description: new FormControl('', [Validators.required]),
    created_by: new FormControl(),
    has_been_sanitize: new FormControl(false),
    sanitize_description: new FormControl(),
    original_description: new FormControl(),
    img_file: new FormControl(),
    temp_src: new FormControl(undefined),
    sort_by: new FormControl(1000),
  });

  constructor(
    private userService: UserService,
    private activated_route: ActivatedRoute,
    private api: ApiService,
    private form_builder: FormBuilder,
    private sanitizer: DomSanitizer
  ) { }

  async ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
    if (!this.idOrganization) {
      if (this.activated_route.snapshot.paramMap.get('idOrganization')) {
        this.idOrganization = Number(this.activated_route.snapshot.paramMap.get('idOrganization'));
      } else {
        if (this.currentUser) {
          this.idOrganization = this.currentUser.idIglesia;
        }
      }
    }
    if (!this.idOrganization) {
      // somwething is wrong
      this.close();
      this.api.showToast(`The ID from your organization wasn't pass it.`, ToastType.error);
      return;
    }
    this.text_editor_form.get('idOrganization').setValue(this.idOrganization);
    this.text_editor_form.get('created_by').setValue(this.currentUser.idUsuario);
    this.text_editor_form.get('idProfileSection').setValue(3);
    //get info
    const params = {
      idOrganization: this.idOrganization,
      section: 'disclaimer'
    }
    const response: any = await this.api.get(`iglesias/sections/filter`, params).toPromise()
      .catch(error => {
        this.close();
        this.api.showToast(`Error getting your settings.`, ToastType.error);
        return;
      });
    if (response) {
      if (response.sections.length > 0) {
        this.section = response.sections[0];
        this.text_editor_form.patchValue(this.section);
      }
    }
    if (!this.section) {
      this.section = new ProfileTextContainerModel();
      this.section.label = `Thank you!`;
      this.section.display_label = true;
      this.section.description = `<p>Thank you for Joining Iglesia Tech. We are building. Gracias por unirte a la familia de Iglesia Tech, estamos construyendo.</p>`;
      this.text_editor_form.patchValue(this.section);
    }
  }

  close() {
    this.on_close.emit();
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

  async saveSettings() {
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
          this.section.id = response.id;
          this.text_editor_form.get('id').setValue(response.id);
          this.ngOnInit();
          this.close();
        }
      }, error => {
        console.error();
        this.submit_loading = false;
        this.api.showToast(`${error_message}`, ToastType.error);
      });
  }

}
