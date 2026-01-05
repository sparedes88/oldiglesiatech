import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as moment from 'moment';
import * as QuillNamespace from 'quill';
import ImageResize from 'quill-image-resize-module';
import { Observable } from 'rxjs';
import { NoteModel } from 'src/app/models/NoteModel';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { environment } from './../../../../../environments/environment';
import { ToastType } from './../../../../login/ToastTypes';
import { NoteService } from './../../../../services/note.service';


// tslint:disable-next-line: variable-name
const Quill: any = QuillNamespace;
Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-note-form',
  templateUrl: './note-form.component.html',
  styleUrls: ['./note-form.component.scss']
})
export class NoteFormComponent implements OnInit {

  imageResizeInstance: ImageResize;

  @ViewChild('editor') container: ElementRef;
  @ViewChild('input_file_use') input_file_use;
  @Input() idProjectTracking: number;
  @Input() idProjectTrackingStep: number;
  // tslint:disable-next-line: no-output-on-prefix tslint:disable-next-line: no-output-rename
  @Output('onDismiss') onDismiss = new EventEmitter();

  editor: QuillNamespace;

  iglesia: any;

  note: NoteModel = new NoteModel();

  constructor(
    private organizationService: OrganizationService,
    private noteService: NoteService
  ) { }

  ngOnInit() {
    console.log(this.note)
    this.loadEditor(this.container.nativeElement);
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
            promises.push(this.organizationService.uploadFile(file, this.iglesia, myUniqueFileName, 'note'));
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
    if (this.note) {
      if (this.note.idNotaIglesia !== 0) {
        if (this.note.hasBeenSanitized) {
          this.editor.clipboard.dangerouslyPasteHTML(0, this.note.original_descripcion);
        } else {
          this.editor.clipboard.dangerouslyPasteHTML(0, this.note.descripcion);
        }
      } else {
        this.editor.clipboard.dangerouslyPasteHTML(0, this.note.original_descripcion);
      }
    }
  }

  updateContent() {
    this.note.descripcion = this.editor.container.firstChild.innerHTML;
    this.note.original_descripcion = this.editor.container.firstChild.innerHTML;
    this.note.fechaCreacion = moment().format('YYYY-MM-DD HH:mm:ss');
    const style_regex = /((<style>)|(<style type=.+))((\s+)|(\S+)|(\r+)|(\n+))(.+)((\s+)|(\S+)|(\r+)|(\n+))(<\/style>)/g;
    let summary_content = this.note.descripcion;
    summary_content = summary_content.replace(style_regex, ``);
    summary_content = summary_content.replace(/&nbsp;/g, ' ');

    this.note.summary = summary_content
      ? String(summary_content)
        .replace(/<(?:.|\n)*?>/gm, '')
        .trim()
      : '';

    if (this.validateInputs()) {
      let subscription: Observable<any>;
      let message: string;
      let message_error: string;

      if (this.note.idNotaIglesia && this.note.idNotaIglesia !== 0) {
        // Update
        subscription = this.noteService.updateNote(this.note);
        message = 'Note updated successfully!';
        message_error = 'Error updating note.';
      } else {
        // Add
        subscription = this.noteService.addNote(this.note);
        message = 'Note added successfully!';
        message_error = 'Error adding note.';
      }
      /*console.log({
        projectTracking: this.idProjectTracking,
        projectTrackStep: this.idProjectTrackingStep,
      })*/
      subscription.subscribe(response => {
        this.noteService.api.showToast(message, ToastType.success);
        if(this.idProjectTrackingStep){
          var temp_array = []
          temp_array.push(response.idNotaIglesia)
          /*console.log({
            s: this.idProjectTrackingStep,
            e: temp_array
          })*/
          if (!(this.note.idNotaIglesia && this.note.idNotaIglesia !== 0)) {
            this.noteService.addNotesToTracking(this.idProjectTracking, this.idProjectTrackingStep, temp_array).subscribe(response => {
              //console.log(response)
              this.onDismiss.emit(true);
            })
          } else {
            this.onDismiss.emit(true);
          }
        } else {
          this.onDismiss.emit(response);
        }
        //console.log(response)
      }, error => {
        console.error(error);
        this.noteService.api.showToast(message_error, ToastType.error);
      });
    }

  }


  validateInputs(): boolean {
    if (!this.note.summary
      || this.note.summary === ''
      || (this.note.summary as string).length < 1) {
      this.noteService.api.showToast(`You need to add some body to your content.`, ToastType.info);
      return false;
    }

    return true;
  }

}
