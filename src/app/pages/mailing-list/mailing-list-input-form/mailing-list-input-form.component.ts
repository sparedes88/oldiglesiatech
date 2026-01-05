import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/interfaces/user';
import { ToastType } from 'src/app/login/ToastTypes';
import { MailingListInput, MailingListInputType } from 'src/app/models/MailingListModel';
import { ContactInboxService } from 'src/app/services/contact-inbox.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-mailing-list-input-form',
  templateUrl: './mailing-list-input-form.component.html',
  styleUrls: ['./mailing-list-input-form.component.scss']
})
export class MailingListInputFormComponent implements OnInit {

  @Input('view_type') view_type: 'edition' | 'view' = 'edition';
  @Input('input_form') input_form: MailingListInput;

  @Output('on_add') on_add: EventEmitter<any> = new EventEmitter<any>();

  current_user: User = this.user_service.getCurrentUser();

  form_group: FormGroup = this.form_builder.group({
    idOrganization: new FormControl(this.current_user.idIglesia, [Validators.required]),
    idMailingListInputType: new FormControl('', [Validators.required]),
    label: new FormControl('', [Validators.required]),
    placeholder: new FormControl('', []),
    should_be_required: new FormControl(false, []),
    show_hint: new FormControl(false, []),
    hint: new FormControl('', []),
    created_by: new FormControl(this.current_user.idUsuario, [Validators.required]),
  });

  input_types: MailingListInputType[] = [];
  selected_type: MailingListInputType;

  constructor(
    private form_builder: FormBuilder,
    private contact_inbox_service: ContactInboxService,
    private user_service: UserService
  ) {
  }

  get options_array(): FormArray {
    if (this.form_group.get('options')) {
      return this.form_group.get('options') as FormArray;
    }
    return this.form_builder.array([]);
  }

  ngOnInit() {
    this.getInputTypes();
  }

  resetForm() {
    this.form_group = this.form_builder.group({
      idOrganization: new FormControl(this.current_user.idIglesia, [Validators.required]),
      idMailingListInputType: new FormControl('', [Validators.required]),
      label: new FormControl('', [Validators.required]),
      placeholder: new FormControl('', []),
      should_be_required: new FormControl(false, []),
      show_hint: new FormControl(false, []),
      hint: new FormControl('', []),
      created_by: new FormControl(this.current_user.idUsuario, [Validators.required]),
    });
  }

  async getInputTypes() {
    const response: any = await this.contact_inbox_service.getInputTypes().toPromise().catch(error => {
      console.error(error);
      return;
    });
    if (response) {
      this.input_types = response;
    }
  }

  setSelectedType() {
    const selected_id = Number(this.form_group.get('idMailingListInputType').value);
    console.log(selected_id);
    console.log(this.form_group);
    console.log(this.input_types);

    if (!isNaN(selected_id)) {
      this.selected_type = this.input_types.find(x => x.id === selected_id);
      if (this.selected_type.need_options) {
        if (!this.form_group.get('options')) {
          this.form_group.addControl('options', this.form_builder.array([]));
        }
      } else {
        if (this.form_group.get('options')) {
          this.form_group.removeControl('options');
        }
      }
    }
  }

  async submit() {
    if (this.form_group.invalid) {
      const control_names = Object.keys(this.form_group.controls);
      control_names.forEach(name => {
        this.form_group.get(name).markAsDirty();
        if (name === 'options') {
          console.log(name);
          const array = this.form_group.get(name) as FormArray;
          array.controls.forEach((c: FormGroup) => {
            console.log(c);
            const option_control_names = Object.keys(c.controls);
            console.log(c);
            option_control_names.forEach(option_name => {
              c.get(option_name).markAsDirty();
            })
          });
        }
      });
      this.contact_inbox_service.api.showToast(`Please fill all the fields`, ToastType.error);
      return;
    }
    if (this.form_group.get('options')) {
      const options = this.form_group.get('options').value;
      if (options.length === 0) {
        this.contact_inbox_service.api.showToast(`You need to add at least 1 option for this input type`, ToastType.info);
        return;
      }
    }

    const payload = this.form_group.value;
    const response: any = await this.contact_inbox_service.saveOrganizationInput(payload).toPromise()
      .catch(error => {
        console.error(error);
        return;
      });
    if (response) {
      this.contact_inbox_service.api.showToast('Element saved', ToastType.success);
      this.on_add.emit(response);
    }
  }

  addNewOption() {
    const form_group = this.form_builder.group({
      name: new FormControl('', [Validators.required]),
      value: new FormControl('', [Validators.required])
    });
    this.options_array.push(form_group);
  }

  editOption(option) {
    console.log(option);
  }

  deleteOption(option, index: number) {
    console.log(option);
    this.options_array.removeAt(index);
  }


}
