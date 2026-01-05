import { ToastType } from './../../../login/ToastTypes';
import { Observable } from 'rxjs';
import { environment } from './../../../../environments/environment';
import { OrganizationService } from './../../../services/organization/organization.service';
import { Component, OnInit, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import { DesignRequestNoteModel } from 'src/app/models/DesignRequestModel';
import { DesignRequestService } from 'src/app/services/design-request.service';
import * as QuillNamespace from 'quill';
let Quill: any = QuillNamespace;
import ImageResize from 'quill-image-resize-module';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';
Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-design-request-note-form',
  templateUrl: './design-request-note-form.component.html',
  styleUrls: ['./design-request-note-form.component.scss']
})
export class DesignRequestNoteFormComponent implements OnInit {

  imageResizeInstance: ImageResize;

  @ViewChild('editor') container: ElementRef;
  @ViewChild('input_file_use') input_file_use;
  // tslint:disable-next-line: no-output-on-prefix tslint:disable-next-line: no-output-rename
  @Output('onDismiss') onDismiss = new EventEmitter();

  editor: QuillNamespace;

  iglesia: any;

  designRequestNote: DesignRequestNoteModel = new DesignRequestNoteModel();

  currentUser: User;

  constructor(
    private organizationService: OrganizationService,
    private designRequestService: DesignRequestService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.loadEditor(this.container.nativeElement);
    this.currentUser = this.userService.getCurrentUser();
    if (this.currentUser.idUserType !== 1 && !this.currentUser.isSuperUser) {
      this.designRequestNote.is_private = false;
    }
  }

  dismiss(response?) {
    if (response) {
      this.onDismiss.emit(response);
    } else {
      this.onDismiss.emit();
    }
  }

  loadEditor(container) {

    const toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],

      [{ header: 1 }, { header: 2 }],               // custom button values
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],      // superscript/subscript
      [{ indent: '-1' }, { indent: '+1' }],          // outdent/indent
      [{ direction: 'rtl' }],                         // text direction

      [{ size: ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ header: [1, 2, 3, 4, 5, 6, false] }],

      [{ color: [] }, { background: [] }],          // dropdown with defaults from theme
      [{ font: [] }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean']                                         // remove formatting button
    ];

    // container: toolbarOptions,  // Selector for toolbar container
    const options = {
      modules: {
        toolbar: {
          container: toolbarOptions,  // Selector for toolbar container
        },
        imageResize: true
      },
      placeholder: 'Edit your content...',
      theme: 'snow',
    };

    if (!this.editor) {
      this.editor = new Quill(container, options);
    } else {
      // this.editor = new Quill(container, options);
    }
    const toolbar = this.editor.getModule('toolbar');
    toolbar.addHandler('image', () => {
      if (this.input_file_use) {
        this.input_file_use.nativeElement.onchange = (event: { target: { files: FileList } }) => {
          const promises = [];
          Array.from(event.target.files).forEach(file => {
            const indexPoint = (file.name as string).lastIndexOf('.');
            const extension = (file.name as string).substring(indexPoint);
            const ticks = (Number(String(Math.random()).slice(2)) + Date.now() + Math.round(performance.now())
            ).toString(36);
            const myUniqueFileName = ticks + extension;
            promises.push(this.organizationService.uploadFile(file, this.iglesia, myUniqueFileName, 'designRequest'));
          });

          Promise.all(promises).then((responses: any) => {

            // tslint:disable-next-line: prefer-for-of
            for (let index = 0; index < responses.length; index++) {
              this.editor.insertEmbed(1000, 'image', `${environment.serverURL}${responses[index].file_info.src_path}`);
            }
          });
        };
      }
      this.input_file_use.nativeElement.click();
    });

    this.editor.deleteText(0, 10000000);
    if (this.designRequestNote) {
      if (this.designRequestNote.idDesignRequestNote !== 0) {
        if (this.designRequestNote.hasBeenSanitized) {
          this.editor.clipboard.dangerouslyPasteHTML(0, this.designRequestNote.original_content);
        } else {
          this.editor.clipboard.dangerouslyPasteHTML(0, this.designRequestNote.content);
        }
      } else {
        this.editor.clipboard.dangerouslyPasteHTML(0, this.designRequestNote.original_content);
      }
    }
  }

  updateContent() {
    this.designRequestNote.content = this.editor.container.firstChild.innerHTML;
    this.designRequestNote.original_content = this.editor.container.firstChild.innerHTML;

    const style_regex = /((<style>)|(<style type=.+))((\s+)|(\S+)|(\r+)|(\n+))(.+)((\s+)|(\S+)|(\r+)|(\n+))(<\/style>)/g;
    let summary_content = this.designRequestNote.content;
    summary_content = summary_content.replace(style_regex, ``);
    summary_content = summary_content.replace(/&nbsp;/g, ' ');

    this.designRequestNote.summary = summary_content
      ? String(summary_content)
        .replace(/<(?:.|\n)*?>/gm, '')
        .trim()
      : '';

    if (this.validateInputs()) {
      let subscription: Observable<any>;
      let message: string;
      let message_error: string;

      if (this.designRequestNote.idDesignRequestNote && this.designRequestNote.idDesignRequestNote !== 0) {
        // Update
        subscription = this.designRequestService.updateDesignRequestNote(this.designRequestNote);
        message = 'Note updated successfully!';
        message_error = 'Error updating note.';
      } else {
        // Add
        subscription = this.designRequestService.addDesignRequestNote(this.designRequestNote);
        message = 'Note added successfully!';
        message_error = 'Error adding note.';
      }

      subscription.subscribe(response => {
        this.organizationService.api.showToast(message, ToastType.success);
        this.onDismiss.emit(response);
      }, error => {
        console.error(error);
        this.organizationService.api.showToast(message_error, ToastType.error);
      });
    }

  }


  validateInputs(): boolean {
    if (!this.designRequestNote.summary
      || this.designRequestNote.summary === ''
      || (this.designRequestNote.summary as string).length < 1) {
      this.organizationService.api.showToast(`You need to add some body to your content.`, ToastType.info);
      return false;
    }

    return true;
  }

}
