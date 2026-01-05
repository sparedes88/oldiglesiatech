import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { MatSnackBar } from "@angular/material";
import { UserService } from "src/app/services/user.service";
import { ApiService } from "src/app/services/api.service";
import { NgxSmartModalService } from "ngx-smart-modal";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { DownloadServiceService } from 'src/app/download-service.service';

declare var Pixie: any;

@Component({
  selector: "pixie-editor",
  templateUrl: "./pixie.component.html",
  styleUrls: ["./pixie.component.scss"],
})
export class PixieComponent implements OnInit {
  constructor(
    private snackbar: MatSnackBar,
    private userService: UserService,
    private api: ApiService,
    private modal: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private downloadService: DownloadServiceService
  ) {
    this.currentUser = userService.getCurrentUser();
  }

  public currentUser: any;
  public serverUrl: any = this.api.baseUrl;

  @Input() standalone: boolean = false
  // Event emiiter
  @Output() onExport = new EventEmitter();

  // Export form
  public templateId: any;
  public uploading: Boolean = false;
  public showExportForm: Boolean = false;
  public exportForm: FormGroup = this.formBuilder.group({
    title: ["", Validators.required],
    category: ["", Validators.required],
    thumbnail: [],
    json_file: [],
  });

  /** GALLERY */
  showGalleryForm: boolean = false;
  public galleryForm: FormGroup = this.formBuilder.group({
    title: ["", Validators.required],
    category: ["", Validators.required],
    photo: ["", Validators.required],
  });

  templates: any[] = [];
  galleryItems: any[] = [];
  showTemplatedModal: Boolean = true;
  tabIndex: number = 0;

  // Declare pixie entry point
  public pixie: any;
  public state: any;

  ngOnInit() {
    this.initPixie();
    this.getTemplates();
    this.getGallery();
  }

  ngOnDestroy(): void {
    this.pixie.close()
  }

  initPixie() {
    this.getTemplates();

    this.pixie = new Pixie({
      selector: "#pixieEditor",
      crossOrigin: true,
      tools: {
        export: {
          defaultFormat: "jpeg", //png, jpeg or json
          defaultName: "image", //default name for downloaded photo file
          defaultQuality: 0.8, //works with jpeg only, 0 to 1
        },
      },
      ui: {
        openImageDialog: {
          show: false,
        },
        nav: {
          replaceDefault: false,
          items: this.getAdminActions(),
        },
      },
      onSave: (data, name) => {
        if (this.standalone == true) {
          this.downloadFile(data, name)
        } else {
          this.exportBlob(data);
        }
      },
      onLoad: () => {
        this.state = this.pixie.getState();
      },
    });
  }

  getTemplates() {
    this.api.get("pixieTemplates").subscribe(
      (data: any) => {
        this.templates = data;
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  getGallery() {
    this.api.get("pixieGallery").subscribe(
      (data: any) => {
        this.galleryItems = data;
      },
      (err: any) => {
        console.error(err);
      }
    );
  }

  downloadFile(base64, name) {
    const blob: Blob = this.base64ToBlob(base64)
    this.downloadService.downloadFile(blob, name)
    console.log(name);
  }

  /**
   * Emit onExport event with file blob
   * @param encoded Base64
   */
  exportBlob(encoded: string) {
    const blob: Blob = this.base64ToBlob(encoded);
    this.onExport.emit(new File([blob], "image.jpeg"));
    console.log(blob)
  }

  /**
   * Convert base64 string to blob
   * @param dataURI base64
   */
  base64ToBlob(dataURI) {
    let byteString = atob(dataURI.split(",")[1]);
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: "image/jpeg" });
  }

  exportAsTemplate(form: FormGroup) {
    const state: any = this.pixie.getState();
    form.patchValue({ json_file: state });

    // Start upload process
    this.uploading = true;

    this.saveTemplate(form.value);
  }

  saveTemplate(payload) {
    let request: Observable<any>;

    if (this.templateId) {
      request = this.api.patch(`pixieTemplates/${this.templateId}`, payload);
    } else {
      request = this.api.post(`pixieTemplates`, payload);
    }

    request.subscribe(
      (data: any) => {
        this.uploading = false;
        this.exportForm.reset();
        this.showExportForm = false;

        this.getTemplates();
      },
      (error: any) => {
        console.error(error);
        this.uploading = false;
      }
    );
  }

  saveGalleryPhoto(form: FormGroup) {
    this.uploading = true;
    this.api.post(`pixieGallery`, form.value).subscribe(
      (res) => {
        this.getGallery();
        this.uploading = false;
        this.showGalleryForm = false;
        this.galleryForm.reset();
      },
      (err) => {
        console.error(err);
        this.uploading = false;
        this.snackbar.open(
          `Can't upload the file, please check the form and try again`,
          "OK"
        );
      }
    );
  }

  deleteGalleryItem(id) {
    if (
      !confirm(
        `Are you sure you want to delete this Photo?\nThis action can't be undone`
      )
    ) {
      return;
    }

    this.api.delete(`pixieGallery/${id}`).subscribe(
      (res) => {
        this.getGallery();
        this.snackbar.open(`Sucess: The photo was deleted.`, "OK", {
          duration: 3000,
        });
      },
      (err) => {
        console.error(err);
        this.snackbar.open(
          `Can't upload the file, please check the form and try again`,
          "OK"
        );
      }
    );
  }

  getAdminActions(): any[] {
    let actions: any[] = [{ type: "separator" }];
    if (this.currentUser.isSuperUser) {
      actions.push({
        name: "export template",
        icon: "/assets/icons/individual/cloud-upload.svg",
        action: () => {
          this.showExportForm = true;
        },
      });
    }

    actions.push({
      name: "import template",
      icon: "/assets/icons/individual/file-download.svg",
      action: () => {
        this.showTemplatedModal = true;
      },
    });

    actions.push({
      name: "gallery",
      icon: "/assets/icons/individual/image.svg",
      action: () => {
        this.tabIndex = 1;
        this.showTemplatedModal = true;
      },
    });

    actions.push({
      name: "logo",
      icon: "/assets/icons/individual/insert-drive-file.svg",
      action: () => {
        if (this.currentUser.logoPic) {
          this.getLogo();
        }
      },
    });

    return actions;
  }

  handleFileInput(files: FileList) {
    const file = files.item(0);
    if (file) {
      // Preview file
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (_event) => {
        this.exportForm.patchValue({ thumbnail: reader.result });
      };
    }
  }

  handleFileInputGallery(files: FileList) {
    const file = files.item(0);
    if (file) {
      // Preview file
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (_event) => {
        this.galleryForm.patchValue({ photo: reader.result });
      };
    }
  }

  setTemplate(template: any) {
    this.templateId = template.id;
    this.pixie.loadState(template.state);
    this.showTemplatedModal = false;

    this.exportForm.patchValue({
      title: template.title,
      category: template.category,
    });
  }

  loadImage(item: any) {
    const img = this.serverUrl + item.photo;
    this.pixie.resetAndOpenEditor({ image: img });
    this.showTemplatedModal = false;
  }

  getLogo() {
    const logoUrl = this.serverUrl + this.currentUser.logoPic;

    fetch(logoUrl, { method: "GET" })
      .then((response) => response.blob())
      .then((blob) => {
        const b64File = window.URL.createObjectURL(blob);

        this.pixie
          .getTool("import")
          .openFile(b64File)
          .then((obj: any) => {
            console.log(obj);

            obj.set({
              top: 12,
              left: 12,
            });
          });
      });
  }
}
