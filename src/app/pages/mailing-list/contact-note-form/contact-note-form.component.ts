import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as QuillNamespace from 'quill';
import ImageResize from 'quill-image-resize-module';
import { Observable } from 'rxjs';
import { ToastType } from 'src/app/login/ToastTypes';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { environment } from 'src/environments/environment';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { MailingListContactNoteModel } from 'src/app/models/MailingListModel';
import { ApiService } from 'src/app/services/api.service';

// tslint:disable-next-line: variable-name
const Quill: any = QuillNamespace;
Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-contact-note-form',
  templateUrl: './contact-note-form.component.html',
  styleUrls: ['./contact-note-form.component.scss']
})
export class ContactNoteFormComponent implements OnInit {

  imageResizeInstance: ImageResize;

  @ViewChild('editor') container: ElementRef;
  @ViewChild('input_file_use') input_file_use;
  // tslint:disable-next-line: no-output-on-prefix tslint:disable-next-line: no-output-rename
  @Output('onDismiss') onDismiss = new EventEmitter();

  editor: QuillNamespace;

  iglesia: any;

  contactNote: MailingListContactNoteModel = new MailingListContactNoteModel();
  contact: any = {};
  mailingList: any = {};

  currentUser: User;


  constructor(
    private organizationService: OrganizationService,
    private userService: UserService,
    private api: ApiService
  ) { }

  ngOnInit() {
    this.loadEditor(this.container.nativeElement);
    this.currentUser = this.userService.getCurrentUser();
    if (this.currentUser.idUserType !== 1 && !this.currentUser.isSuperUser) {
      this.contactNote.is_private = false;
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
            promises.push(this.organizationService.uploadFile(file, this.iglesia, myUniqueFileName, 'contact_note'));
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
    if (this.contactNote) {
      if (this.contactNote.idMailingListContactNote !== 0) {
        if (this.contactNote.hasBeenSanitized) {
          this.editor.clipboard.dangerouslyPasteHTML(0, this.contactNote.original_content);
        } else {
          this.editor.clipboard.dangerouslyPasteHTML(0, this.contactNote.content);
        }
      } else {
        this.editor.clipboard.dangerouslyPasteHTML(0, this.contactNote.original_content);
      }
    }
  }

  updateContent() {
    this.contactNote.content = this.editor.container.firstChild.innerHTML;
    this.contactNote.original_content = this.editor.container.firstChild.innerHTML;

    const style_regex = /((<style>)|(<style type=.+))((\s+)|(\S+)|(\r+)|(\n+))(.+)((\s+)|(\S+)|(\r+)|(\n+))(<\/style>)/g;
    let summary_content = this.contactNote.content;
    summary_content = summary_content.replace(style_regex, ``);
    summary_content = summary_content.replace(/&nbsp;/g, ' ');

    this.contactNote.summary = summary_content
      ? String(summary_content)
        .replace(/<(?:.|\n)*?>/gm, '')
        .trim()
      : '';

    if (this.validateInputs()) {
      let subscription: Observable<any>;
      let message: string;
      let message_error: string;

      if (this.contactNote.idMailingListContactNote && this.contactNote.idMailingListContactNote !== 0) {
        // Update

        subscription = this.api.post(`mailingList/${this.mailingList.id}/contacts/${this.contact.id}/notes/update`, this.contactNote);
        message = 'Note updated successfully!';
        message_error = 'Error updating note.';
      } else {
        // Add
        subscription = this.api.post(`mailingList/${this.mailingList.id}/contacts/${this.contact.id}/notes/save`, this.contactNote);
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
    if (!this.contactNote.summary
      || this.contactNote.summary === ''
      || (this.contactNote.summary as string).length < 1) {
      this.organizationService.api.showToast(`You need to add some body to your content.`, ToastType.info);
      return false;
    }

    return true;
  }


}
