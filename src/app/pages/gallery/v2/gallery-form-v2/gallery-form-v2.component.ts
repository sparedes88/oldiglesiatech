import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { UserService } from "src/app/services/user.service";
import { FileUploadService } from "src/app/services/file-upload.service";
import { Observable } from "rxjs";
import { NgxSmartModalService } from "ngx-smart-modal";
import { ActivatedRoute } from "@angular/router";
import imageCompression from 'browser-image-compression';
import { environment } from "src/environments/environment";
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { GalleryPictureModel } from "src/app/models/GalleryModel";
import { AngularCropperjsComponent } from "angular-cropperjs/";
import * as Cropper from 'cropperjs/dist/cropper';
export interface PositionInterface {
  y_position: 'center' | 'top' | 'bottom';
  x_position: 'center' | 'left' | 'right';
  class: string;
  degrees: number;
}
@Component({
  selector: "app-gallery-form-v2",
  templateUrl: "./gallery-form-v2.component.html",
  styleUrls: ["./gallery-form-v2.component.scss"],
})
export class GalleryFormV2Component implements OnInit {

  @ViewChild('test_form') test_form: ElementRef;
  @ViewChildren('cropper_js') croppers: QueryList<AngularCropperjsComponent>;

  positions: PositionInterface[] = [

  ];
  size: {
    width: number;
    height: number;
  } = {
      width: 444.44,
      height: 250
    }

  default_config: any = {
    aspectRatio: 1.777777777,
    initialAspectRatio: NaN,
    dragMode: 'move',
    autoCropArea: 1,
    movable: true,
    zoomable: true,
    zoom: 1,
    scalable: true,
    viewMode: 1,
    checkOrientation: !environment.production,
    rotatable: true,
    cropBoxResizable: false,
    toggleDragModeOnDblclick: false,
    cropBoxMovable: false,
    // modal: false,
    guides: false,
    center: true,
    // highlight: false,
    data: {
      x: 0,
      y: 0,
      width: 444,
      height: 250,
      rotate: 0,
      scaleX: 1,
      scaleY: 1
    },
    // autoCropArea: 1,
    // restore: false,
  }

  saving: boolean = false;
  loading: boolean = true;

  get config() {
    if (this.test_form) {
      this.size.width = this.test_form.nativeElement.offsetWidth;
      this.size.height = this.size.width / 1.77777776;
      this.default_config.data.width = this.size.width;
      this.default_config.data.height = this.size.height;
    }
    return this.default_config;
  }

  constructor(
    private api: ApiService,
    private fileUpload: FileUploadService,
    private modal: NgxSmartModalService,
    private route: ActivatedRoute,
    private form_builder: FormBuilder,
    private sanitizer: DomSanitizer
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
    pictures: [],
    status: true,
  };

  gallery_form: FormGroup = this.form_builder.group({
    pictures: new FormArray([])
  });

  ngOnInit() {
    this.galleryForm.idIglesia = this.currentUser.idIglesia;
  }

  get pictures_array(): FormArray {
    return this.gallery_form.get('pictures') as FormArray;
  }

  getPosition(cropper_js, config, photo, img_tag) {
    return `0px 0px`;
  }

  getBgImage(group: FormGroup) {
    const photo = group.value;
    if (group.get('temp_src').value) {
      return `url("${group.get('temp_src').value}")`;
      // return `url( ${this.sanitizer.bypassSecurityTrustResourceUrl(group.get('temp_src').value)})`;
    } else if (photo.src_path.startsWith('http')) {
      return `url( ${photo.src_path} )`;
    }
    return `url( ${environment.serverURL}${photo.src_path})`;
  }

  getSrc(group: FormGroup, sanitize?: boolean): any {
    let src: string | SafeResourceUrl;

    const photo: GalleryPictureModel = group.value;
    if (photo.temp_src) {
      if (sanitize) {
        src = photo.temp_src;
      } else {
        src = this.sanitizer.bypassSecurityTrustResourceUrl(photo.temp_src);
      }
      // return `url( ${this.sanitizer.bypassSecurityTrustResourceUrl(group.get('temp_src').value)})`;
    } else if (photo.src_path.startsWith('http')) {
      src = photo.src_path;
    } else {
      src = `${environment.serverURL}${photo.src_path}`;
    }
    return src;
  }

  getStyle(group: FormGroup) {
    const src = this.getSrc(group, true);
    const photo: GalleryPictureModel = group.value;
    const url = `url(${src})`;
    return {
      'background-position-x': photo.x_position,
      'background-position-y': photo.y_position,
      'background-image': url
    }
  }

  getNewStyle(group: FormGroup) {
    const url = this.getSrc(group, true);
    const zoom = (group.get('zoom').value || 1) * 100;
    // // background-image: url(https://iglesia-tech-api.e2api.com/img/iglesiaTech/OasysdeRestauracion/galleries/EdFH9dZqDfr08cKvuzaNF2ZzqKaQv2gy.JPG);
    // // background-size: contain;
    // // background-size: 214.35888100000002%;
    // // background-position-x: 28.9%;
    // // background-position-y: 62%;
    return {
      'background-image': `url('${url}')`,
      'background-size': `${zoom}%`,
      'background-position-x': `${group.get('x_position').value}%`,
      'background-position-y': `${group.get('y_position').value}%`,
    }
  }

  getGallery() {
    this.uploading = true;
    this.loading = true;
    this.api
      .get(`galleries/details/${this.galleryId}`)
      .subscribe((data: any) => {
        // data.photos = JSON.parse(data.photos);
        this.galleryForm = data;
        this.loading = false;
        this.galleryForm.pictures.forEach(pic => {
          const group = this.getFormGroup(pic);
          this.pictures_array.push(group);
          setTimeout(() => {
            group.get('ready').setValue(true);
          }, 100);
        })
        this.uploading = false;
      });
  }
  getFormGroup(picture?: any) {
    const group = this.form_builder.group({
      y_position: new FormControl(50, [Validators.required]),
      x_position: new FormControl(50, [Validators.required]),
      zoom: new FormControl(1, [Validators.required]),
      aspect_ratio: new FormControl(1, [Validators.required]),
      natural_width: new FormControl(0),
      natural_height: new FormControl(0),
      actual_width: new FormControl(0),
      actual_height: new FormControl(0),
      src_path: new FormControl(),
      temp_src: new FormControl(undefined),
      id: new FormControl(undefined),
      ready: new FormControl(false),
      is_enable: new FormControl(false)
    });
    if (picture) {
      if (picture.y_position === 'center') {
        picture.y_position = 50;
      }
      if (picture.x_position === 'center') {
        picture.x_position = 50;
      }
      group.patchValue(picture)
    }
    return group;
  }

  saveGallery() {
    this.saving = true;
    let request: Observable<any>;
    this.croppers.forEach((cropper, index) => {
      const form_group = this.pictures_array.at(index);
      this.setCropperValues(cropper, form_group as FormGroup);
    })
    let payload: any = Object.assign({}, this.galleryForm);
    payload.v2 = true;
    payload.photos = JSON.stringify(payload.photos);
    payload.idOrganization = this.currentUser.idIglesia;
    payload.created_by = this.currentUser.idUsuario;
    payload.pictures = this.pictures_array.value;
    let show_modal = false;
    if (this.galleryForm.id) {
      request = this.api.patch(
        `galleries/v2/update/${this.galleryForm.id}`,
        payload
      );
      show_modal = true;
    } else {
      request = this.api.post("galleries", payload);
      this.loading = false;
    }
    request.subscribe(
      (res) => {
        this.galleryForm.id = res.id;
        if (show_modal) {
          this.modal.getModal("submitModal").open();
        }
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

  uploadedImageURL

  async handlePhotosV2(files: Array<File>) {
    this.uploading = true;
    for await (const file of files) {
      // Simulate an asynchronous operation (e.g., fetching data from an API)
      const result = await this.uploadPhoto(file);
      const payload = {
        id: this.galleryForm.id,
        idOrganization: this.currentUser.idIglesia,
        created_by: this.currentUser.idUsuario,
        pictures: [{
          y_position: 50,
          x_position: 50,
          zoom: 1,
          idResource: result.file_info.id
        }]
      }
      const response = await this.api.post(`galleries/v2/update/${this.galleryForm.id}/photos`, payload).toPromise()
        .catch(error => {
          console.error(error);
          return;
        });
      if (response) {
        const group = this.getFormGroup();
        group.patchValue(response);
        group.get('ready').setValue(true);
        this.pictures_array.push(group);
      }
    }
    setTimeout(() => {
      this.uploading = false;
    }, 600);
  }

  async uploadPhoto(file: File): Promise<any> {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    }
    try {
      const compressedFile = await imageCompression(file, options);
      // await uploadToServer(compressedFile); // write your own logic
      return await this.fileUpload
        .uploadFile(compressedFile, true, `galleries`)
        .toPromise();
    } catch (error) {
      console.error(error);
    }

  }

  onSubmit() { }

  deletePhoto(group, index) {
    // this.uploading = true;
    const index_fix = this.pictures_array.controls.indexOf(group);
    this.pictures_array.removeAt(index_fix);
    // this.galleryForm.pictures.splice(index, 1);
    // this.uploading = false;
  }

  isSelected(position: PositionInterface, group: FormGroup) {
    const photo: GalleryPictureModel = group.value;
    return position.x_position === photo.x_position && position.y_position === photo.y_position;

  }

  setPosition(position: PositionInterface, group: FormGroup) {
    group.patchValue(position);
  }

  cropperReady(cropper_js: AngularCropperjsComponent, ready, form_group: FormGroup) {
    if (ready) {
      const element_ref: ElementRef = cropper_js.image;
      const { width, height } = element_ref.nativeElement;
      const new_aspect_ratio = width / height;
      const cropper = cropper_js.cropper;
      const canvas_data_fixed = {
        left: 0,
        top: 17.3125,
        width: 444.44444,
        height: 250
      }
      if (new_aspect_ratio > 1) {
        // means is more vertical
        canvas_data_fixed.width = 444.44444;
        canvas_data_fixed.height = canvas_data_fixed.width / new_aspect_ratio;
      }
      canvas_data_fixed.top = cropper.getContainerData().height / 2 - cropper.getCanvasData().height / 2;

      const crop_box_data = {
        height: 250,
        width: 444.444444
      }
      cropper_js.cropper.setCropBoxData(crop_box_data);

      cropper_js.cropper.setCanvasData(canvas_data_fixed);
      const options = cropper_js.cropper.options.data;
      form_group.get('natural_height').setValue(options.height);
      form_group.get('natural_width').setValue(options.width);
      cropper_js.cropperOptions.aspectRatio = 1.7777777777777777;
      if (!form_group.get('is_new')) {
        let zoom = (form_group.get('zoom').value || 1);
        const container_width = cropper.cropBoxData.width;
        const container_percent = container_width / 444.4444444 * 100;
        const imported_data = {
          height: canvas_data_fixed.height * zoom,
          width: canvas_data_fixed.width * zoom,
        }
        canvas_data_fixed.height = canvas_data_fixed.height * zoom;
        canvas_data_fixed.width = canvas_data_fixed.width * zoom;
        canvas_data_fixed.top = cropper.getContainerData().height / 2 - cropper.getCanvasData().height / 2;

        cropper_js.cropper.setCanvasData(canvas_data_fixed);
        cropper_js.cropper.setCropBoxData(crop_box_data);
        const canvasData = cropper_js.cropper.canvasData

        const width = canvasData.maxLeft - canvasData.minLeft
        const h = canvasData.maxTop - canvasData.minTop
        const y_value = (Number(form_group.get('y_position').value) - 100) * -1
        const actual_left_size = width * Number(form_group.get('x_position').value) / 100;
        const actual_top_size = h * y_value / 100;
        const left = actual_left_size - canvasData.maxLeft;
        const top = actual_top_size + canvasData.minTop;
        const position_data = {
          left: -left,
          top
        }
        cropper_js.cropper.setCanvasData(position_data);
        cropper_js.cropper.setCropBoxData(crop_box_data);
        if (
          (
            position_data.left.toFixed(4) === cropper.canvasData.maxLeft.toFixed(4) ||
            position_data.top.toFixed(4) === cropper.canvasData.maxTop.toFixed(4)
          )
          && (cropper.canvasData.maxTop > 0 || cropper.canvasData.maxLeft > 0)
        ) {
          if (position_data.top.toFixed(4) === cropper.canvasData.maxTop.toFixed(4)) {
            position_data.top = 0;
          }
          if (position_data.left.toFixed(4) === cropper.canvasData.maxLeft.toFixed(4)) {
            position_data.left = 0;
          }
          cropper_js.cropper.setCanvasData(position_data);
          cropper_js.cropper.setCropBoxData(crop_box_data);
          const new_canvas_data = cropper_js.cropper.canvasData;
          const new_width = new_canvas_data.maxLeft - new_canvas_data.minLeft;
          const new_actual_left_size = new_width * Number(form_group.get('x_position').value) / 100;
          const new_left = new_actual_left_size - new_canvas_data.maxLeft;
          position_data.left = -new_left;
          cropper_js.cropper.setCanvasData(position_data);
          cropper_js.cropper.setCropBoxData(crop_box_data);
        }
        cropper_js.cropper.disable();
      }
    }
  }

  disableCropper(cropper_js: AngularCropperjsComponent, form_group: FormGroup) {
    cropper_js.cropper.disable();
    form_group.get('is_enable').setValue(false);
  }

  enableCropper(cropper_js: AngularCropperjsComponent, form_group: FormGroup) {
    cropper_js.cropper.enable();
    form_group.get('is_enable').setValue(true);
  }

  zoom_value: number = 0;

  setCropperValues(cropper_js: AngularCropperjsComponent, form_group: FormGroup, disable_after?: boolean) {
    const cropper = cropper_js.cropper;
    const cropBoxData = cropper.cropBoxData;
    const canvasData = cropper.canvasData;
    const canvas_data = cropper.getCanvasData();
    const container_width = cropper.cropBoxData.width;
    const container_percent = container_width / 444.4444444 * 100;
    const actual_ratio = canvas_data.naturalWidth / canvas_data.naturalHeight;
    const ratio_percent = actual_ratio * 100 / this.default_config.aspectRatio;
    const zoom_percent = canvas_data.height / form_group.get('natural_height').value;
    const min_zoom = container_percent / ratio_percent;
    const zoom_fixed = zoom_percent / min_zoom;
    const data = {
      x: {
        max: canvasData.maxLeft,
        min: canvasData.minLeft,
        value: canvas_data.left,
        center: 0,
        width: canvasData.maxLeft - canvasData.minLeft,
        position: 0
      },
      y: {
        max: canvasData.maxTop,
        min: canvasData.minTop,
        value: canvas_data.top,
        center: 0,
        width: canvasData.maxTop - canvasData.minTop,
        position: 0
      },
      zoom: (zoom_fixed || 1) * 100,
    }
    data.x.center = data.x.max - ((data.x.width) / 2);
    data.y.center = data.y.max - ((data.y.width) / 2);
    data.x.position = 50 * (data.x.value - data.x.max) / (data.x.center - data.x.max);
    data.y.position = 50 * (data.y.value - data.y.max) / (data.y.center - data.y.max);

    form_group.get('zoom').setValue(zoom_fixed);
    form_group.get('x_position').setValue(data.x.position);
    form_group.get('y_position').setValue(data.y.position);
    if (disable_after) {
      this.disableCropper(cropper_js, form_group);
    }
  }
}
