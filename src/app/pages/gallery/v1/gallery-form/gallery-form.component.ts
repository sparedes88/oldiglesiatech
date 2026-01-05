import { Component, OnInit } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { UserService } from "src/app/services/user.service";
import { FileUploadService } from "src/app/services/file-upload.service";
import { Observable } from "rxjs";
import { NgxSmartModalService } from "ngx-smart-modal";
import { ActivatedRoute } from "@angular/router";
import imageCompression from 'browser-image-compression';

@Component({
  selector: "app-gallery-form",
  templateUrl: "./gallery-form.component.html",
  styleUrls: ["./gallery-form.component.scss"],
})
export class GalleryFormComponent implements OnInit {

  saving: boolean = false;

  constructor(
    private api: ApiService,
    private fileUpload: FileUploadService,
    private modal: NgxSmartModalService,
    private route: ActivatedRoute
  ) {
    this.currentUser = UserService.getCurrentUser();

    const id = this.route.snapshot.params["id"];
    if (id) {
      this.galleryId = id;
      this.getGallery();
    }
  }

  public galleryId: any;
  public currentUser: any;
  public uploading: boolean = false;
  public galleryForm = {
    id: "",
    name: "",
    description: "",
    idIglesia: "",
    photos: [],
    status: true,
  };

  ngOnInit() {
    this.galleryForm.idIglesia = this.currentUser.idIglesia;
  }

  getBgImage(photo) {
    if (photo) {
      return `url("${photo}")`;
    }
  }

  getGallery() {
    this.uploading = true;
    this.api
      .get(`galleries/details/${this.galleryId}`)
      .subscribe((data: any) => {
        data.photos = JSON.parse(data.photos);
        this.galleryForm = data;
        this.uploading = false;
      });
  }

  saveGallery() {
    this.saving = true;
    let request: Observable<any>;
    let payload: any = Object.assign({}, this.galleryForm);
    payload.photos = JSON.stringify(payload.photos);

    if (this.galleryForm.id) {
      request = this.api.patch(
        `galleries/update/${this.galleryForm.id}`,
        payload
      );
    } else {
      request = this.api.post("galleries", payload);
    }

    request.subscribe(
      (res) => {
        this.galleryForm.id = res.id;
        this.modal.getModal("submitModal").open();
        this.saving = false;
      },
      (err) => {
        console.error(err);
        this.saving = false;
      }
    );
  }

  handlePhotos(files: Array<File>) {
    this.uploading = true;
    let requests = [];
    files.forEach((file) => {
      requests.push(this.uploadPhoto(file));
    });

    Promise.all(requests)
      .then((responses: any[]) => {
        responses.map((data) => {
          const url = `${this.fileUpload.api.baseUrl}${data.file_info.src_path}`;
          this.galleryForm.photos.push(url);
        });
      })
      .finally(() => {
        this.uploading = false;
      });

    files = undefined
  }

  async uploadPhoto(file: File): Promise<any> {
    console.log('originalFile instanceof Blob', file instanceof Blob); // true
    console.log(`originalFile size ${file.size / 1024 / 1024} MB`);
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    }
    try {
      const compressedFile = await imageCompression(file, options);
      // console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
      // console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB

      // await uploadToServer(compressedFile); // write your own logic
      return await this.fileUpload
        .uploadFile(compressedFile, true, `galleries`)
        .toPromise();
    } catch (error) {
      console.log(error);
    }

  }

  onSubmit() { }

  deletePhoto(index) {
    this.uploading = true;
    this.galleryForm.photos.splice(index, 1);
    this.uploading = false;
  }
}
