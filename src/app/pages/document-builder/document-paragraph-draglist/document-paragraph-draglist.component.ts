import { ToastType } from 'src/app/login/ToastTypes';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from './../../../services/api.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormArray, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-document-paragraph-draglist',
  templateUrl: './document-paragraph-draglist.component.html',
  styleUrls: ['./document-paragraph-draglist.component.scss']
})
export class DocumentParagraphDraglistComponent implements OnInit {

  @Input('array_name') array_name: string;
  @Input('group') group: FormGroup;
  @Input('is_parent') is_parent: boolean;
  @Input('deep_level') deep_level: number;
  @Output('request_document_detail') request_document_detail = new EventEmitter<any>();

  actual_edited_group: FormGroup | AbstractControl = new FormGroup({
    title: new FormControl('', [Validators.required]),
    content: new FormControl('', [Validators.required, Validators.maxLength(8000)]),
    children: new FormArray([]),
    pictures: new FormArray([])
  });
  currentUser;
  base_url = environment.serverURL;

  constructor(
    private form_builder: FormBuilder,
    private modal: NgxSmartModalService,
    private api: ApiService,
    private fus: FileUploadService,
    private activated_route: ActivatedRoute,
    private user_service: UserService
  ) {
    this.currentUser = this.user_service.getCurrentUser();
  }

  ngOnInit() {
  }

  get paragraphs() {
    return this.group.get(this.array_name) as FormArray;
  }

  children(index: number, array_name: string) {
    return this.paragraphs.at(index).get(array_name) as FormArray;
  }

  addParagraph() {
    this.actual_edited_group = this.initParagraph();
    this.modal.get(`paragraph_in_progress_modal_${this.deep_level}`).open();
  }

  openEditModal(paragraph: FormGroup, parent_index: number) {
    this.actual_edited_group = paragraph;
    (this.actual_edited_group as FormGroup).addControl('idParagraph', new FormControl(paragraph.value.idParagraph));
    (this.actual_edited_group as FormGroup).addControl('idDocument', new FormControl(undefined));
    this.actual_edited_group.patchValue(paragraph.value);
    (this.actual_edited_group as FormGroup).addControl('parent_index', new FormControl(parent_index));
    this.modal.get(`paragraph_in_progress_modal_${this.deep_level}`).open();
  }

  initParagraph() {
    return this.form_builder.group({
      title: new FormControl(``, [Validators.required]),
      content: new FormControl('', [Validators.required]),
      children: new FormArray([]),
      sort_by: new FormControl(),
      pictures: new FormArray([])
    });
  }

  addChildren(paragraph: FormGroup, parent_index: number) {
    const group = this.initParagraph();
    group.addControl('is_child', new FormControl(true, [Validators.required]));
    group.addControl('parent_index', new FormControl(parent_index));
    this.actual_edited_group = group;
    this.modal.get(`paragraph_in_progress_modal_${this.deep_level}`).open();
  }

  dropParagraph(event: CdkDragDrop<any>) {
    moveItemInArray(
      this.paragraphs.controls,
      event.previousIndex,
      event.currentIndex
    );
    this.paragraphs.controls.forEach((control: FormGroup, index) => {
      control.get('sort_by').setValue(index + 1);
    });
  }

  deleteParagraph(paragraph, i) {
    this.paragraphs.removeAt(i);
  }

  resetForm() {
    this.actual_edited_group = this.initParagraph();
  }

  async saveParagraph() {
    if (this.actual_edited_group.valid) {
      const is_child = this.actual_edited_group.get('parent_index');
      if (is_child) {
        const has_id = this.actual_edited_group.get('idDocument');
        if (has_id) {
          if (this.actual_edited_group.get('idParagraph')) {
            const promises = [];
            const pic_array = this.actual_edited_group.get('pictures') as FormArray;
            const url_pics = await this.uploadFiles(pic_array);
            if (url_pics.length > 0) {
              const idParagraph = this.actual_edited_group.get('idParagraph').value;
              const idDocument = this.activated_route.snapshot.params.document_id;
              const payload = {
                pictures: url_pics,
                created_by: this.currentUser.idUsuario
              };
              const response_save = await this.api.post(`document-builder/${idDocument}/paragraphs/${idParagraph}/savePictures`, payload).toPromise<any>().catch(err => err);
              if (response_save)
                this.request_document_detail.emit();
            }
            this.modal.get(`paragraph_in_progress_modal_${this.deep_level}`).close();
          } else {
            this.modal.get(`paragraph_in_progress_modal_${this.deep_level}`).close();
          }
        } else {
          try {
            const parent_index = this.actual_edited_group.get('parent_index').value;
            const next_order_by = this.children(parent_index, 'children').length + 1;
            this.actual_edited_group.get('sort_by').setValue(next_order_by);
            this.children(parent_index, 'children').push(this.actual_edited_group);
            this.modal.get(`paragraph_in_progress_modal_${this.deep_level}`).close();
          } catch (ex) {
            console.error(ex);
          }
        }

      } else {
        const has_id = this.actual_edited_group.get('idDocument');
        if (has_id) {
          const index = this.paragraphs.controls.indexOf(this.actual_edited_group);
          this.paragraphs.at(index).patchValue(this.actual_edited_group.value);
        } else {
          const next_order_by = this.paragraphs.length + 1;
          this.actual_edited_group.get('sort_by').setValue(next_order_by);
          this.paragraphs.push(this.actual_edited_group);
        }
        this.modal.get(`paragraph_in_progress_modal_${this.deep_level}`).close();
      }
    }
  }

  handleFileInput(files: FileList) {
    const children_array = this.actual_edited_group.get('pictures') as FormArray;
    let original_pictures = children_array.value;
    original_pictures = original_pictures.filter(x => x.idParagraphImage);

    while (children_array.length > 0) {
      children_array.removeAt(0);
    }
    original_pictures.forEach(picture => {
      const group_picture = new FormGroup({
        idParagraphImage: new FormControl(picture.idParagraphImage),
        url: new FormControl(picture.url)
      });
      children_array.push(group_picture);
    });
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      const group = new FormGroup({
        file: new FormControl(file)
      });
      group.patchValue({ file })
      children_array.push(group);
    }
  }

  async uploadFiles(pic_array: FormArray) {
    const promises = [];
    for await (const pic of pic_array.controls) {
      if (pic.get('file')) {
        const file = pic.get('file').value;
        const response = await this.fus.uploadFile(file, true, 'document_pictures').toPromise<any>();
        const clean_response = this.fus.cleanPhotoUrl(response.response);
        promises.push(clean_response);
      }
    }
    return promises;
  }

  emitToParent() {
    this.request_document_detail.emit();
  }

  getPicturesToDelete(form_group: FormGroup | AbstractControl) {
    const values: any[] = form_group.get('pictures').value;
    return values.filter(x => x.idParagraphImage);
  }

  async deletePhoto(form_group: FormGroup, photo: any, index: number) {
    console.log(photo);

    if (confirm(`Are you sure you want to delete this picture? This action can't be undone.`)) {
      const idParagraph = form_group.get('idParagraph').value;
      const idDocument = this.activated_route.snapshot.params.document_id;
      const idParagraphImage = photo.idParagraphImage;
      const payload = {
        deleted_by: this.currentUser.idUsuario
      };

      const response_delete = await this.api.post(`document-builder/${idDocument}/paragraphs/${idParagraph}/deletePicture/${idParagraphImage}`, payload).toPromise<any>().catch(err => {
        console.error(err);
        return false;
      });
      console.log(response_delete);
      if (response_delete) {
        (form_group.get('pictures') as FormArray).removeAt(index);
        this.api.showToast(`Picture deleted`, ToastType.success);
      } else {
        this.api.showToast(`Error deleting picture`, ToastType.error);
      }
    }
  }

  getBgImage(photo) {
    if (photo.url) {
      return `url("${this.base_url}${photo.url}")`;
    }
  }
}
