import { ToastType } from './../../../login/ToastTypes';
import { Router } from '@angular/router';
import { UserService } from './../../../services/user.service';
import { ApiService } from './../../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';

@Component({
  selector: 'app-document-builder-form',
  templateUrl: './document-builder-form.component.html',
  styleUrls: ['./document-builder-form.component.scss']
})
export class DocumentBuilderFormComponent implements OnInit {

  document_form: FormGroup;
  settings_obj = {
    title_size_unit: 'px',
    title_size_size: 16,
    text_size_unit: 'px',
    text_size_size: 12,
    cover_date_size_unit: 'px',
    cover_date_size_size: 12,
    cover_name_size_unit: 'px',
    cover_name_size_size: 80,
    cover_description_size_unit: 'px',
    cover_description_size_size: 12,
    menu_option: 'content',
    submenu_option: 'body'
  }
  currentUser: any;
  document_id: number;
  server_busy: boolean = false;

  constructor(
    private form_builder: FormBuilder,
    private activated_route: ActivatedRoute,
    private api: ApiService,
    private user_service: UserService,
    private router: Router,
    private modal: NgxSmartModalService
  ) {
    this.currentUser = this.user_service.getCurrentUser();
    this.initBuilder();
    this.document_id = this.activated_route.snapshot.params.document_id;
    if (this.document_id) {
      this.getDocument();
    }
  }

  getDocument() {
    this.server_busy = true;
    this.initBuilder();
    this.api.get(`document-builder/getDocument/${this.document_id}`, { idIglesia: this.currentUser.idIglesia })
      .subscribe((response: any) => {
        const document = response.document;
        this.createArray('paragraphs', this.document_form, document.paragraphs);
        this.document_form.patchValue(response.document);
        const title_size = this.returnSplitSizeValues('title_size');
        const text_size = this.returnSplitSizeValues('text_size');
        const cover_date_size = this.returnSplitSizeValues('cover_date_size');
        const cover_name_size = this.returnSplitSizeValues('cover_name_size');
        const cover_description_size = this.returnSplitSizeValues('cover_description_size');
        this.settings_obj.title_size_size = title_size.number_value;
        this.settings_obj.title_size_unit = title_size.unit;
        this.settings_obj.text_size_size = text_size.number_value;
        this.settings_obj.text_size_unit = text_size.unit;
        this.settings_obj.cover_date_size_size = cover_date_size.number_value;
        this.settings_obj.cover_date_size_unit = cover_date_size.unit;
        this.settings_obj.cover_name_size_size = cover_name_size.number_value;
        this.settings_obj.cover_name_size_unit = cover_name_size.unit;
        this.settings_obj.cover_description_size_size = cover_description_size.number_value;
        this.settings_obj.cover_description_size_unit = cover_description_size.unit;
        this.server_busy = false;
      }, error => {
        console.error(error);
        this.server_busy = false;
        this.api.showToast(`Error getting document`, ToastType.error);
      })
  }
  returnSplitSizeValues(key_name: string) {
    const document = this.document_form.value;
    const title_size = document.settings[key_name] as string;
    const number_value_string = title_size.match(/\d+/g).join();
    const number_value = Number(number_value_string);
    const unit = title_size.replace(number_value_string, '');
    return { number_value, unit };
  }

  createArray(array_name: string, group: FormGroup, items: any[]) {
    items.forEach(paragraph => {
      const form_array = group.get(array_name) as FormArray;
      const new_group = this.initParagraph();
      new_group.addControl('idParagraph', new FormControl(paragraph.idParagraph));
      if (paragraph.children.length > 0) {
        this.createArray('children', new_group, paragraph.children);
      }
      if (paragraph.pictures.length > 0) {
        const form_array_pictures = new_group.get('pictures') as FormArray;
        paragraph.pictures.forEach(picture => {
          const group_picture = new FormGroup({
            idParagraphImage: new FormControl(picture.idParagraphImage),
            url: new FormControl(picture.url)
          });
          form_array_pictures.push(group_picture);
        });
      }
      new_group.patchValue(paragraph);
      form_array.push(new_group);
    });
  }

  ngOnInit() {
  }

  initBuilder() {
    this.document_form = this.form_builder.group({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      created_at: new FormControl(),
      settings: this.form_builder.group({
        idDocumentSetting: new FormControl(undefined, []),
        idDocument: new FormControl(undefined),
        title_size: new FormControl('12px', [Validators.required]),
        title_color: new FormControl('#000000', [Validators.required]),
        text_size: new FormControl('12px', [Validators.required]),
        text_alignment: new FormControl('left', [Validators.required]),
        cover_date_color: new FormControl('#000000', [Validators.required]),
        cover_name_color: new FormControl('#000000', [Validators.required]),
        cover_description_color: new FormControl('#000000', [Validators.required]),
        cover_date_alignment: new FormControl('left', [Validators.required]),
        cover_name_alignment: new FormControl('left', [Validators.required]),
        cover_description_alignment: new FormControl('left', [Validators.required]),
        cover_date_size: new FormControl('12px', [Validators.required]),
        cover_name_size: new FormControl('80px', [Validators.required]),
        cover_description_size: new FormControl('12px', [Validators.required]),
      }),
      paragraphs: this.form_builder.array([]),
      pictures: this.form_builder.array([]) // not in use.
    });
  }

  get settings_form() {
    return this.document_form.get('settings') as FormGroup;
  }

  get paragraphs() {
    return this.document_form.get('paragraphs') as FormArray;
  }

  addParagraph() {
    this.paragraphs.push(this.initParagraph())
  }

  initParagraph() {
    return this.form_builder.group({
      title: new FormControl('Title', [Validators.required]),
      content: new FormControl('Content', [Validators.required]),
      children: new FormArray([]),
      sort_by: new FormControl(),
      pictures: new FormArray([])
    });
  }

  dropParagraph(event: CdkDragDrop<any>) {

    moveItemInArray(
      this.paragraphs.controls,
      event.previousIndex,
      event.currentIndex
    );
  }

  updateForm(name: string) {
    let value = ``;
    let num_value = this.settings_obj[`${name}_size_size`];
    const unit_value = this.settings_obj[`${name}_size_unit`];
    if (unit_value !== '%') {
      if (name !== 'cover_name') {
        if (num_value > 20) {
          this.settings_obj[`${name}_size_size`] = 20;
          this.updateForm(name);
          return;
        }
      }
    }
    value = `${num_value}${unit_value}`;
    this.settings_form.get(`${name}_size`).setValue(value);
  }

  deleteParagraph(paragraph, i) {
    this.paragraphs.removeAt(i);
  }

  saveDocument() {
    this.server_busy = true;
    const document_id = this.activated_route.snapshot.params.document_id;
    if (document_id) {
      // update
      const payload = this.document_form.value;
      payload.created_by = this.currentUser.idUsuario;
      payload.idOrganization = this.currentUser.idIglesia;
      this.api.patch(`document-builder/update/${this.document_id}`, payload)
        .subscribe((response: any) => {
          this.api.showToast(`Document saved`, ToastType.success);
          // this.router.navigateByUrl(`/document-builder/detail/${response.idDocument}`);
          this.server_busy = false;
          this.modal.get('choose_after_action').open();
        }, error => {
          this.api.showToast(`Error saving document.`, ToastType.error);
          console.error(error);
          this.server_busy = false;
        });
    } else {
      const payload = this.document_form.value;
      payload.created_by = this.currentUser.idUsuario;
      payload.idOrganization = this.currentUser.idIglesia;
      this.api.post(`document-builder/save`, payload)
        .subscribe((response: any) => {
          this.api.showToast(`Document saved`, ToastType.success);
          // this.router.navigateByUrl(`/document-builder/detail/${response.idDocument}`);
          this.document_id = response.idDocument;
          this.modal.get('choose_after_action').open();
          this.server_busy = false;
        }, error => {
          console.error(error);
          this.api.showToast(`Error saving document.`, ToastType.error);
          this.server_busy = false;
        });
    }

  }

  handleModalClose(choose_after_action?: NgxSmartModalComponent) {
    if (choose_after_action) {
      choose_after_action.close();
    }
    if (this.router.url.includes('create')) {
      this.router.navigateByUrl(`/document-builder/update/${this.document_id}`);
    } else {
      this.getDocument();
    }
  }

}
