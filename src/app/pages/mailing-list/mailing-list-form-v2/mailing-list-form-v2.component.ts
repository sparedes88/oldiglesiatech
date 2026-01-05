import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';
import { MailingListInput, MailingListInputSetup, MailingListModel, MailingListParams } from 'src/app/models/MailingListModel';
import { ContactInboxService } from 'src/app/services/contact-inbox.service';
import { UserService } from 'src/app/services/user.service';
import { MailingListInputFormComponent } from '../mailing-list-input-form/mailing-list-input-form.component';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { moveItemInFormArray } from 'src/app/models/Utility';
import { FileUploadService } from 'src/app/services/file-upload.service';

@Component({
  selector: 'app-mailing-list-form-v2',
  templateUrl: './mailing-list-form-v2.component.html',
  styleUrls: ['./mailing-list-form-v2.component.scss']
})
export class MailingListFormV2Component implements OnInit {

  @Input('idMailingList') idMailingList: number;

  @ViewChild('mailing_input_form') mailing_input_form: MailingListInputFormComponent;

  @Output('on_add') on_add: EventEmitter<MailingListModel> = new EventEmitter<MailingListModel>();

  current_user: User;
  wait: boolean = false;

  form_group: FormGroup = this.form_builder.group({
    name: new FormControl("", [Validators.required]),
    idOrganization: new FormControl(null, [Validators.required]),
    created_by: new FormControl(null, [Validators.required]),
    inputs: new FormArray([]),
    setup: new FormGroup({
      header_text: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
      message_text: new FormControl('', [Validators.maxLength(1000)]),
      picture: new FormControl('', [Validators.maxLength(1500)]),
      icon_color: new FormControl('#ff7f50', [Validators.maxLength(10)]),
      sunday_service: new FormControl('', [Validators.maxLength(8000)]),
      display_contact_info: new FormControl(false, [Validators.required]),
      hide_picture: new FormControl(true, [Validators.required]),
      hide_address: new FormControl(true, [Validators.required]),
      hide_phones: new FormControl(true, [Validators.required]),
      hide_emails: new FormControl(true, [Validators.required]),
      hide_sunday_service: new FormControl(true, [Validators.required]),
      show_picture: new FormControl(false, [Validators.required]),
      show_address: new FormControl(false, [Validators.required]),
      show_phones: new FormControl(false, [Validators.required]),
      show_emails: new FormControl(false, [Validators.required]),
      show_sunday_service: new FormControl(false, [Validators.required]),
      hide_message_input: new FormControl(false, [Validators.required]),
      show_message_input: new FormControl(true, [Validators.required]),
      hide_email_input: new FormControl(false, [Validators.required]),
      show_email_input: new FormControl(true, [Validators.required]),
      email_required_input: new FormControl(true, [Validators.required]),
      phone_required_input: new FormControl(true, [Validators.required]),
      first_name_required_input: new FormControl(true, [Validators.required]),
      last_name_required_input: new FormControl(true, [Validators.required]),
      message_required_input: new FormControl(true, [Validators.required]),
      hide_custom_input: new FormControl(false, [Validators.required]),
      show_custom_input: new FormControl(true, [Validators.required]),
      custom_required_input: new FormControl(true, [Validators.required]),
      inline: new FormControl(true, [Validators.required]),
      row_size: new FormControl(5, [Validators.min(1), Validators.max(15)]),
      custom_type: new FormControl('number', []),
      custom_text: new FormControl('Custom label', [Validators.maxLength(1000)]),
      custom_placeholder: new FormControl('Placeholder', [Validators.maxLength(1000)]),
      question_1_as_check: new FormControl(false, [Validators.required]),
      question_2_as_check: new FormControl(false, [Validators.required]),
      order_array: new FormControl('[]'),
      button_settings: new FormGroup({
        button_color: new FormControl('#e65100', [Validators.required]),
        text_color: new FormControl('#ffffff', [Validators.required]),
        text: new FormControl('Subscribe', [Validators.required]),
        width: new FormControl(40, [Validators.required]),
        align: new FormControl('center', [Validators.required]),
        border_radius: new FormControl(4, [Validators.required, Validators.max(20), Validators.min(1)])
      }),
      thank_you_message: new FormControl('Thanks for subscribing to our mailing list!', [Validators.required, Validators.maxLength(1000)])
    })
  });
  on_new_control: FormGroup;

  inputs: MailingListInput[] = [];

  constructor(
    private form_builder: FormBuilder,
    private user_service: UserService,
    private contact_inbox_service: ContactInboxService,
    private modal_service: NgxSmartModalService,
    private fus: FileUploadService
  ) {
    this.current_user = this.user_service.getCurrentUser();
    this.form_group.get('idOrganization').setValue(this.current_user.idIglesia);
    this.form_group.get('created_by').setValue(this.current_user.idUsuario);
  }

  get inputs_array(): FormArray {
    return this.form_group.get('inputs') as FormArray;
  }

  ngOnInit() {
    this.getInputs();
  }

  setContactInbox(contact_inbox: any) {
    this.form_group.addControl('id', new FormControl(contact_inbox.id, [Validators.required]));
    contact_inbox.setup.show_picture = !contact_inbox.setup.hide_picture;
    contact_inbox.setup.show_address = !contact_inbox.setup.hide_address;
    contact_inbox.setup.show_phones = !contact_inbox.setup.hide_phones;
    contact_inbox.setup.show_emails = !contact_inbox.setup.hide_emails;
    contact_inbox.setup.show_sunday_service = !contact_inbox.setup.hide_sunday_service;
    contact_inbox.setup.show_message_input = !contact_inbox.setup.hide_message_input;
    contact_inbox.setup.show_custom_input = !contact_inbox.setup.hide_custom_input;
    contact_inbox.setup.show_email_input = !contact_inbox.setup.hide_email_input;

    this.form_group.patchValue(contact_inbox);
    if (contact_inbox.inputs) {
      contact_inbox.inputs.forEach(x => {
        const form_group = this.form_builder.group({
          id: new FormControl(x.id),
          idMailingList: new FormControl(contact_inbox.id),
          idMailingListInput: new FormControl(x.idMailingListInput, [Validators.required]),
          idMailingListInputType: new FormControl(x.idMailingListInputType),
          label: new FormControl(x.label),
          placeholder: new FormControl(x.placeholder),
          show_hint: new FormControl(x.show_hint),
          hint: new FormControl(x.hint),
          options: new FormControl(x.options),
          is_required: new FormControl(x.is_required),
          sort_by: new FormControl(x.sort_by),
          created_by: new FormControl(this.current_user.idUsuario),
          custom_label: new FormControl(x.custom_label),
          custom_placeholder: new FormControl(x.custom_placeholder),
          custom_hint: new FormControl(x.custom_hint),
          editable: new FormControl(false),
        });
        this.inputs_array.push(form_group);
      })
    }
  }

  async getInputs() {
    const params: Partial<MailingListParams> = {
      idOrganization: this.current_user.idIglesia,
      extended: true,
      all: true
    }
    const response: any = await this.contact_inbox_service.getOrganizationInput(params).toPromise()
      .catch(error => {
        this.contact_inbox_service.api.showToast('Error getting the organization inputs.', ToastType.error);
        return;
      });
    if (response) {
      this.inputs = response;
    }
  }

  async refreshInputs(event) {
    this.modal_service.get('add_new_input_form').close();
    await this.getInputs();
    if (event) {
      this.on_new_control.get('idMailingListInput').setValue(Number(event.idMailingListInput));
      this.setInput(this.on_new_control, {});
      this.on_new_control = undefined;
    }
  }

  addInput() {
    const payload: Partial<MailingListInputSetup> = {
      is_required: false,
      sort_by: this.inputs_array.length + 1
    }
    if (this.current_user) {
      payload.created_by = this.current_user.idUsuario
    }
    if (this.idMailingList) {
      payload.idMailingList = this.idMailingList
    }
    const form_group = this.form_builder.group({
      idMailingList: new FormControl(),
      idMailingListInput: new FormControl(undefined, [Validators.required]),
      idMailingListInputType: new FormControl(),
      label: new FormControl(''),
      placeholder: new FormControl(''),
      show_hint: new FormControl(false),
      hint: new FormControl(false),
      options: new FormControl([]),
      is_required: new FormControl(false),
      sort_by: new FormControl(),
      created_by: new FormControl(this.current_user.idUsuario),
      custom_label: new FormControl(''),
      custom_placeholder: new FormControl(''),
      custom_hint: new FormControl(''),
      editable: new FormControl(false),
    });
    form_group.patchValue(payload);
    this.inputs_array.push(form_group);
  }

  editInput(input_control: FormGroup) {
    input_control.get('editable').setValue(true);
  }

  toggleAcceptace(form_group: FormGroup | AbstractControl, field: string) {
    let actual_value = form_group.get(field).value;
    const handle_items = ['show_picture', 'show_phones', 'show_address', 'show_emails', 'show_sunday_service', 'show_custom_input', 'show_message_input', 'show_email_input'];
    if (handle_items.includes(field)) {
      const main_field = field.replace('show_', '');
      const new_field = `hide_${main_field}`;
      form_group.get(new_field).setValue(actual_value);
    }
    form_group.get(field).setValue(!actual_value);
    actual_value = form_group.get(field).value;
    if (field === 'display_contact_info') {
      form_group.get('hide_picture').setValue(false);
      form_group.get('hide_address').setValue(false);
      form_group.get('hide_phones').setValue(false);
      form_group.get('hide_emails').setValue(false);
      form_group.get('hide_sunday_service').setValue(false);
    }
  }

  setInput(input_control: FormGroup, event: any) {
    const idMailingListInput = Number(input_control.value.idMailingListInput);
    if (!isNaN(idMailingListInput)) {
      if (idMailingListInput < 1) {
        input_control.get('idMailingListInput').setValue('');
        input_control.get('idMailingListInput').markAsPristine();
        this.mailing_input_form.resetForm();
        this.on_new_control = input_control;
        this.modal_service.get('add_new_input_form').open();
      } else {
        const input_info = this.inputs.find(x => x.id === idMailingListInput);
        if (input_info) {
          input_control.get('is_required').setValue(input_info.should_be_required);
          input_control.get('idMailingListInputType').setValue(input_info.idMailingListInputType);
          input_control.get('label').setValue(input_info.label);
          input_control.get('placeholder').setValue(input_info.placeholder);
          input_control.get('show_hint').setValue(input_info.show_hint);
          input_control.get('hint').setValue(input_info.hint);
          input_control.get('options').setValue(input_info.options);
          input_control.get('custom_label').setValue(input_info.custom_label);
          input_control.get('custom_placeholder').setValue(input_info.custom_placeholder);
          input_control.get('custom_hint').setValue(input_info.custom_hint);
        }
      }
    }
  }

  sortArray(event: CdkDragDrop<any>) {
    moveItemInFormArray(this.inputs_array, event.previousIndex,
      event.currentIndex);
  }

  removeInput(index: number) {
    this.inputs_array.removeAt(index);
    this.inputs_array.controls.forEach((x, index, arr) => {
      x.get('sort_by').setValue(index + 1);
    });
  }

  async submit() {
    this.wait = true;
    if (this.form_group.invalid) {
      const control_names = Object.keys(this.form_group.controls);
      control_names.forEach(name => {
        this.form_group.get(name).markAsDirty();
        if (name === 'inputs' || name === 'setup') {
          if (name === 'inputs') {
            const array = this.form_group.get(name) as FormArray;
            array.controls.forEach((c: FormGroup) => {
              const option_control_names = Object.keys(c.controls);
              option_control_names.forEach(option_name => {
                c.get(option_name).markAsDirty();
              })
            });
          } else {
            const c = this.form_group.get(name);
            const option_control_names = Object.keys(c.value);
            option_control_names.forEach(option_name => {
              c.get(option_name).markAsDirty();
            })
          }
        }
      });
      this.contact_inbox_service.api.showToast(`Please fill all the fields`, ToastType.error);
      this.wait = false;
      return;
    }
    if (this.inputs_array.length === 0) {
      this.contact_inbox_service.api.showToast(`You need to add at least 1 input.`, ToastType.info);
      this.wait = false;
      return;
    }
    const payload = this.form_group.value;
    payload.is_v2 = true;
    payload.setup.button_settings = JSON.stringify(payload.setup.button_settings);
    let method: Promise<any>;
    if (payload.id) {
      method = this.contact_inbox_service.updateContactInbox(payload).toPromise();
    } else {
      method = this.contact_inbox_service.saveContactInbox(payload).toPromise()
    }
    const response: any = await method
      .catch(error => {
        console.error(error);
        this.contact_inbox_service.api.showToast(`Error saving your contact form.`, ToastType.error);
        return;
      });
    if (response) {
      this.contact_inbox_service.api.showToast(`Contact form saved`, ToastType.success);
      this.on_add.emit(response);
    }
    this.wait = false;
  }

  cancelForm() {
    this.on_add.emit();
  }

  uploadPicture(input_file) {
    input_file.onchange = (event: { target: { files: File[] } }) => {
      if (event.target.files.length > 0) {
        this.uploadImage(event.target.files[0]);
      }
    };
    input_file.click();
  }

  uploadImage(photo) {
    this.fus.uploadFile(photo, true, 'mailing_list')
      .subscribe((response: any) => {
        this.form_group.get('setup').get('picture').setValue(this.fus.cleanPhotoUrl(response.response));
        // const group = Object.assign({}, this.group);
        // this.fixMembers(group);
        // this.videoService.updateVideo(group)
        //   .subscribe(response_updated => {
        //     this.videoService.api.showToast(`Slider updated successfully`, ToastType.success);
        //   }, error => {
        //     console.error(error);
        //     this.videoService.api.showToast(`Something happened trying to save the slider.`, ToastType.error);
        //   });
      });
  }

  saveEdition(input: FormGroup) {
    this.cancelEdition(input);
  }

  cancelEdition(input: FormGroup, reset_values?: boolean) {
    input.get('editable').setValue(false);
    if (reset_values) {
      const value = input.value;
      input.get('custom_label').setValue(value.label);
      input.get('custom_placeholder').setValue(value.placeholder);
      input.get('custom_hint').setValue(value.hint);
    }
  }

}
