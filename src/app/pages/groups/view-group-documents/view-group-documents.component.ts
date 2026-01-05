import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DownloadServiceService } from 'src/app/download-service.service';
import { User } from 'src/app/interfaces/user';
import { GroupModel } from 'src/app/models/GroupModel';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { GroupsService } from 'src/app/services/groups.service';
import { UserService } from 'src/app/services/user.service';

import { ToastType } from './../../../login/ToastTypes';
import { GroupDocumentModel } from './../../../models/GroupModel';
import { environment } from 'src/environments/environment';

const mime = require('mime');

interface ClipboardItem {
  readonly types: string[]
  getType: (type: string) => Promise<Blob>
}

declare var ClipboardItem: {
  prototype: ClipboardItem
  new (objects: Record<string, Blob>): ClipboardItem
}

interface Clipboard {
  read?(): Promise<Array<ClipboardItem>>
  write?(items: Array<ClipboardItem>): Promise<void>
}

@Component({
  selector: 'app-view-group-documents',
  templateUrl: './view-group-documents.component.html',
  styleUrls: ['./view-group-documents.component.scss']
})
export class ViewGroupDocumentsComponent implements OnInit {

  // tslint:disable-next-line: no-output-on-prefix
  @Output() onDismiss = new EventEmitter();

  @Input() show_dismiss: boolean = true;

  currentUser: User;
  group: GroupModel;
  show_loading: boolean = false;
  documents: GroupDocumentModel[] = [];

  documentStatusForm: FormGroup = this.formBuilder.group({
    statuses: new FormArray([])
  });

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private groupService: GroupsService,
    private fus: FileUploadService,
  ) { }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUser();
  }

  getDocuments() {
    this.show_loading = true;
    return new Promise((resolve, reject) => {
      this.groupService.getGroupDocuments(this.group)
        .subscribe((response: any) => {
          this.documents = response.documents;
          this.documentStatusForm = this.formBuilder.group({
            statuses: this.formBuilder.array([])
          });
          this.documents.forEach(document => {
            const control = this.documentStatusForm.controls.statuses as FormArray;
            control.push(this.formBuilder.group({
              idGroupDocument: new FormControl(document.idGroupDocument, [
                Validators.required,
              ]),
              name: new FormControl(document.name, [
                Validators.required,
              ]),
              original_name: new FormControl(document.name, [
                Validators.required,
              ]),
              file_url: new FormControl(document.file_url, [
                Validators.required,
              ])
            }));
          });

          this.show_loading = false;
          return resolve(this.documents);
        }, error => {
          this.show_loading = false;
          if (error.error.msg.Code === 404) {
            this.documents = [];
            return resolve([]);
          }
          console.error(error);
          this.groupService.api.showToast(`Error getting documents.`, ToastType.error);
          return reject([]);
        });
    });
  }


  deleteDocument(document: GroupDocumentModel) {
    if (confirm(`Delete ${document.name}?`)) {
      document.deleted_by = this.currentUser.idUsuario;
      this.groupService.deleteGroupDocument(document)
        .subscribe(data => {
          this.getDocuments();
          this.groupService.api.showToast(`Document successfully deleted.`, ToastType.success);
        },
          err => {
            console.error(err);
            this.groupService.api.showToast(`Error deleting document.`, ToastType.error);
          });
    }
  }


  getPermissions() {
    if (this.group) {
      if (this.currentUser.isSuperUser) {
        return false;
      }
      if (this.currentUser.idUserType === 1) {
        return false;
      }
      return true;
    } else {
      return true;
    }
  }

  dismiss(response?) {
    this.onDismiss.emit(response);
  }

  uploadPicture(input_file) {
    if (!this.getPermissions()) {
      input_file.onchange = (event: { target: { files: FileList } }) => {
        if (event.target.files.length > 0) {
          this.onFileChange(event.target.files);
        }
      };
      input_file.click();
    }
  }

  private async onFileChange(files: FileList) {
    if (files.length && files.length > 0) {
      // this.processing = true;
      console.log(`Processing ${files.length} file(s).`);
      // setTimeout(() => {
      //   // Fake add attachment
      //   // this.processing = false;
      //   this.fus.uploadFile()
      // }, 1000);
      // this.message.has_attachments = true;
      const array = Array.from(files);
      this.show_loading = true;
      const attachments = [];
      for (const file of array) {
        const url: any = await this.fus.uploadFile(file, true, `group_files`).toPromise();
        attachments.push({ name: file.name, file_url: this.fus.cleanPhotoUrl(url.response) });
      }
      const group = {
        idGroup: this.group.idGroup,
        created_by: this.currentUser.idUsuario,
        attachments
      };
      this.groupService.saveDocuments(group)
        .subscribe(response => {
          this.show_loading = false;
          this.getDocuments();
        }, error => {
          console.error(error);
          this.groupService.api.showToast(`Error registering files... Please try again.`, ToastType.error);
          this.show_loading = false;
        });
    }
  }

  downloadDocument(document_file: GroupDocumentModel) {
    const logoUrl = `${environment.serverURL}${document_file.file_url}`;

    fetch(logoUrl, { method: 'GET' })
      .then((response) => response.blob())
      .then((blob) => {
        const extension = document_file.file_url.substring(document_file.file_url.lastIndexOf('.') + 1);
        const mimeType = mime.getType(extension);
        const contentType: string = mimeType;
        const fileBlob = new Blob([blob], { type: contentType });
        const fileData = window.URL.createObjectURL(fileBlob);
        // Generate virtual link
        const link = document.createElement('a');
        link.href = fileData;
        link.download = document_file.name;
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        setTimeout(() => {
          // For Firefox it is necessary to delay revoking the ObjectURL
          link.remove();
        }, 100);

      });
  }

  viewDocument(document: GroupDocumentModel) {
    // const win = window.open(`${environment.serverURL}${document.file_url}`, "_blank");
    // win.focus();
    let anyNavigator: any;
    anyNavigator = window.navigator;
    anyNavigator.navigator['clipboard'].writeText(`${environment.serverURL}${document.file_url}`);

    /* Alert the copied text */
    this.groupService.api.showToast(`Link copied to clipboard.`, ToastType.info);
  }

  get statuses() {
    return this.documentStatusForm.controls.statuses as FormArray
  }

  toggleEditDocument(control: FormGroup, document: GroupDocumentModel) {
    document._editable = !document._editable;
    if (!document._editable) {
      control.get('name').setValue(control.get('original_name').value);
    }
  }

  renameDocument(control: FormGroup, document: GroupDocumentModel) {
    const doc_temp = Object.assign({}, document);
    if (control.valid) {
      doc_temp.updated_by = this.currentUser.idUsuario;
      doc_temp.name = control.value.name;
      this.groupService.updateDocument(doc_temp)
        .subscribe(response => {
          this.groupService.api.showToast(`File updated!`, ToastType.success);
          control.get('original_name').setValue(doc_temp.name);
          control.get('name').setValue(doc_temp.name);
        }, error => {
          console.error(error);
          this.groupService.api.showToast(`Error updating file!`, ToastType.error);
        });
    } else {
      this.groupService.api.showToast(`Please check the name entered...`, ToastType.info);
    }
  }

}
