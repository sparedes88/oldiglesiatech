import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { VideoModel, PlaylistModel } from 'src/app/models/VideoModel';
import { VideosService } from 'src/app/services/videos.service';
import { ToastType } from 'src/app/login/ToastTypes';
import { User } from 'src/app/interfaces/user';
import { UserService } from 'src/app/services/user.service';
import { Observable, Subject } from 'rxjs';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { ResourceModel } from 'src/app/models/RessourceModel';
import { log } from 'console';
import { DomSanitizer } from '@angular/platform-browser';
import { DataTableDirective } from 'angular-datatables';
@Component({
  selector: 'app-videos-list',
  templateUrl: './videos-list.component.html',
  styleUrls: ['./videos-list.component.scss']
})
export class VideosListComponent implements OnInit {

  @Input() show_header: boolean;
  @Output() show_video = new EventEmitter<VideoModel>();
  @Output() toggle_view = new EventEmitter<any>();

  @ViewChild('img_tag') img_tag: any;
  // Data tables
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  dtOptions: any = {
    searching: false,
    dom: "lfrtip",
    lengthMenu: [10, 25, 50, 100, 250, 500],
    columnDefs: [
      { orderable: false, targets: 0 },
      { targets: [0, 3], sortable: false },
    ],
    columns: [

      { orderable: false },
      null,
      null,
      { orderable: false },
    ]
    // buttons: [
    //   { extend: "copy", className: "btn btn-outline-primary btn-sm" },
    //   {
    //     extend: "print",
    //     className: "btn btn-outline-primary btn-sm",
    //     action: this.print.bind(this),
    //   },
    //   { extend: "csv", className: "btn btn-outline-primary btn-sm" },
    // ],
  };
  videos: VideoModel[] = [];
  playlists: PlaylistModel[] = [];

  video_opened: VideoModel;
  temp_video: VideoModel;

  display_form: boolean = false;
  show_loading: boolean = true;
  submit_loading: boolean = false;
  uploaded: boolean = false;
  video_form: FormGroup;

  currentUser: User;
  today = moment().format('YYYY-MM-DD');

  select_options: any = {
    singleSelection: false,
    idField: 'idPlaylist',
    textField: 'name',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  };

  filter_form: FormGroup = this.form_builder.group({
    sort_by: new FormControl('desc'),
    media_type: new FormControl('all'),
    search: new FormControl(''),
    playlists: new FormControl([])
  });

  constructor(
    private videoService: VideosService,
    private form_builder: FormBuilder,
    private userService: UserService,
    private fus: FileUploadService,
    private sanitizer: DomSanitizer
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  get selected_media_name() {
    if (this.video_form) {
      const idMediaType = this.video_form.get('idMediaType').value;
      return idMediaType == 1 ? 'Video' : idMediaType == 2 ? 'Audio' : 'Document';
    }
  }

  get accepted_formats() {
    if (this.video_form) {
      const idMediaType = this.video_form.get('idMediaType').value;
      return idMediaType == 2 ? '.wav, .ogg, .mp3' : '.pdf, .doc';
    }
  }

  get resource_file(): File {
    if (this.video_form) {
      return this.video_form.get('resource_file').value;
    }
  }
  set resource_file(value) {
    if (this.video_form) {
      this.video_form.get('resource_file').setValue(value);
    }
  }
  get file_info(): ResourceModel {
    if (this.video_form) {
      if (this.video_form.get('file_info')) {
        return this.video_form.get('file_info').value;
      }
    }
  }
  set file_info(value) {
    if (this.video_form) {
      if (this.video_form.get('file_info')) {
        this.video_form.get('file_info').setValue(value);
      }
    }
  }
  get thumbnail_file_info(): ResourceModel {
    if (this.video_form) {
      if (this.video_form.get('thumbnail_file_info')) {
        return this.video_form.get('thumbnail_file_info').value;
      }
    }
  }
  set thumbnail_file_info(value) {
    if (this.video_form) {
      if (this.video_form.get('thumbnail_file_info')) {
        this.video_form.get('thumbnail_file_info').setValue(value);
      }
    }
  }

  async ngOnInit() {
    await this.getVideos();

    await this.getPlaylists();

    this.show_loading = false;
  }

  async getPlaylists() {
    const response_playlist: any = await this.videoService.getPlaylists().toPromise()
      .catch(error => {
        console.error(error);
        if (error.error.msg.Code === 404) {
          // this.videoService.api.showToast(
          //   `There aren't playlists yet.`,
          //   ToastType.info,
          //   `Nothing found.`
          // );
        } else {
          this.videoService.api.showToast(
            `Something happened while trying to get organization's playlists.`,
            ToastType.error
          );
        }
        return;
      });
    if (response_playlist) {
      this.playlists = response_playlist.playlists;
    }
  }

  async getVideos() {
    const filter_payload = this.filter_form.value;
    filter_payload.series = filter_payload.playlists.map(x => x.idPlaylist);
    const response = this.videoService.getVideos(filter_payload)
      .subscribe((data: any) => {
        if (data) {
          this.videos = data.videos;
          this.videos.forEach(x => {
            x.publish_date_fixed = moment(x.publish_date).utc().format('MMM. DD, YYYY');
          })
        } else {
          this.videos = [];
        }
        response.unsubscribe();
        this.restartTable();
        this.dtTrigger.next();
      }, error => {
        this.videos = [];
        this.restartTable();
        this.dtTrigger.next();
      })
    // .toPromise()
    //   .catch(error => {
    //     console.error(error);
    //     if (error.error.msg.Code !== 404) {
    //       this.videoService.api.showToast(
    //         `Something happened while trying to get organization's videos.`,
    //         ToastType.error
    //       );
    //     }
    //     return;
    //   });
    // if (response) {
    //   this.videos = response.videos;
    //   this.videos.forEach(x => {
    //     x.publish_date_fixed = moment(x.publish_date).utc().format('MMM. DD, YYYY');
    //   })
    // } else {
    //   this.videos = [];
    // }
    // console.log(response);
    // this.restartTable();
    // this.dtTrigger.next();
  }

  async openVideoDetail(video: VideoModel) {
    const video_response = await this.videoService.getVideoDetail(video).toPromise()
      .catch(error => {
        console.error(error);
        return video;
      });
    this.video_opened = video;
    this.show_video.emit(this.video_opened);
  }

  deleteVideo(video: VideoModel) {

    if (confirm(`Delete this video?`)) {
      this.videoService.deleteVideo(video)
        .subscribe(data => {
          this.show_loading = true;
          this.ngOnInit();
          this.videoService.api.showToast(`Video deleted successfully.`, ToastType.success);
        }, error => {
          this.videoService.api.showToast(`Error deleting video.`, ToastType.error);
        });
    }
  }

  addVideo() {
    this.display_form = true;
    this.initForm();
    this.temp_video = new VideoModel();
  }

  async editVideo(video: VideoModel) {
    const video_response: any = await this.videoService.getVideoDetail(video).toPromise()
      .catch(error => {
        console.error(error);
        video.playlists = [];
        return { video };
      });

    const video_temp: VideoModel = video_response.video;

    this.display_form = true;
    this.initForm();
    this.video_form.addControl('idVideo', new FormControl(video.idVideo, [Validators.required]));
    Object.keys(video).map(key => {
      if (this.video_form.get(key)) {
        if (key == 'publish_date') {
          this.video_form.get(key).setValue(moment(video[key]).utc().format('YYYY-MM-DD'));
        } else {
          this.video_form.get(key).setValue(video[key]);
        }
      }
    });

    const ids_playlist = [];
    video_temp.playlists.forEach(playlist => {
      ids_playlist.push(playlist.idPlaylist);
    });
    this.video_form.patchValue({ playlists: this.playlists.filter(v => ids_playlist.includes(v.idPlaylist)) });
    if (video.idMediaType == 2 || video.idMediaType == 3) {
      this.video_form.addControl('idResource', new FormControl(video_temp.idResource, []));
      this.video_form.addControl('file_info', new FormControl(video_temp.file_info, []));
    }
    if (video_temp.idResourceThumbnail) {
      this.video_form.addControl('idResourceThumbnail', new FormControl(video_temp.idResourceThumbnail, []));
      this.video_form.addControl('thumbnail_file_info', new FormControl(video_temp.thumbnail_file_info, []));
    }
    this.temp_video = Object.assign({}, video);
  }

  initForm() {
    this.video_form = this.form_builder.group({
      speaker: new FormControl('', [Validators.required]),
      embed_frame: new FormControl(''),
      description: new FormControl('', []),
      sermon_notes: new FormControl('', []),
      title: new FormControl('', [Validators.required]),
      idOrganization: new FormControl(this.currentUser.idIglesia, [Validators.required]),
      playlists: new FormControl('', []),
      thumbnail: new FormControl(''),
      custom_url: new FormControl(false),
      publish_date: new FormControl(this.today, [Validators.required]),
      idMediaType: new FormControl('1', [Validators.required]),
      resource_file: new FormControl(),
      thumbnail_file: new FormControl(),
      temp_src: new FormControl(undefined),
      is_embed: new FormControl(false)
    });
  }

  async submitForm(video_form: FormGroup) {
    this.submit_loading = true;
    if (video_form.invalid) {
      this.submit_loading = false;
      this.videoService.api.showToast(`Please check the info provided.`, ToastType.error);
      return;
    }
    const payload = video_form.value;
    console.log(payload);
    console.log(this.temp_video);
    const idMediaType = Number(payload.idMediaType);
    console.log(idMediaType);
    let has_new_file = false;
    if ((idMediaType == 2 || idMediaType == 3)) {
      if (!payload.resource_file) {
        if (this.temp_video.idVideo) {
          if (this.video_form.get('idResource')) {
            if (!this.video_form.get('idResource').value) {
              this.videoService.api.showToast(`Please add a file.`, ToastType.error);
              this.submit_loading = false;
              return;
            }
            if (this.file_info) {
              const extension = this.file_info.file_extension;
              const check_format = this.checkFormat(idMediaType, extension);
              if (!check_format) {
                this.submit_loading = false;
                return;
              }
            }
          }
        } else {
          this.videoService.api.showToast(`Please add a file.`, ToastType.error);
          this.submit_loading = false;
          return;
        }
      } else {
        const file = payload.resource_file as File;
        const extension = file.name.substring(file.name.lastIndexOf('.') + 1);
        const check_format = this.checkFormat(idMediaType, extension);
        if (!check_format) {
          this.submit_loading = false;
          return;
        }
        has_new_file = true;
      }
    }

    const ids = [];
    if (payload.playlists) {
      payload.playlists.forEach(playlist => {
        ids.push(playlist.idPlaylist);
      });
    }

    payload.playlists = ids;

    payload.sermon_notes = this.temp_video.sermon_notes;
    if ((idMediaType == 2 || idMediaType == 3)) {
      if (has_new_file) {
        const response: any = await this.fus.uploadWithProgress(payload.resource_file, false, this.uploadProgress(payload, 'resource_file'), 'media')
          .catch(error => {
            console.error(error);
            return;
          });
        console.log(response);
        if (response) {
          const json_response = response.target.response;
          payload.idResource = json_response.file_info.id
        } else {
          this.videoService.api.showToast(`Error uploading the file.`, ToastType.error);
          return;
        }
      }
    }
    // thumbnail_file_info
    // idResourceThumbnail
    let has_new_thumbnail = false;
    if (!payload.thumbnail_file) {
      if (payload.idVideo) {
        if (this.video_form.get('idResourceThumbnail')) {
        }
      } else {
      }
    } else {
      has_new_thumbnail = true;
    }
    if (has_new_thumbnail) {
      if (payload.thumbnail_file) {
        const response: any = await this.fus.uploadWithProgress(payload.thumbnail_file, false, this.uploadProgress(payload, 'thumbnail_file'), 'thumbnail')
          .catch(error => {
            console.error(error);
            return;
          });
        console.log(response);
        if (response) {
          const json_response = response.target.response;
          payload.idResourceThumbnail = json_response.file_info.id
          payload.thumbnail = json_response.file_info.src_path
        } else {
          this.videoService.api.showToast(`Error uploading the file.`, ToastType.error);
          return;
        }
      }
    }

    let subscription: Observable<any>;
    let success_message: string;
    let error_message: string;
    if (payload.idVideo) {
      subscription = this.videoService.updateVideo(payload);
      success_message = `${this.selected_media_name} updated successfully.`;
      error_message = `Error updating ${this.selected_media_name.toLowerCase()}`;
    } else {
      subscription = this.videoService.addVideo(payload);
      success_message = `${this.selected_media_name} added successfully`;
      error_message = `Error adding ${this.selected_media_name.toLowerCase()}`;
    }

    subscription
      .subscribe(response => {
        this.show_loading = true;
        this.submit_loading = false;
        this.videoService.api.showToast(`${success_message}`, ToastType.success);
        this.closeForm();
        this.ngOnInit();
      }, error => {
        console.error();
        this.submit_loading = false;
        this.videoService.api.showToast(`${error_message}`, ToastType.error);
      });
  }
  checkFormat(idMediaType: number, extension: string) {
    let supported_formats = [];
    if (idMediaType == 2) {
      supported_formats = ['wav', 'ogg', 'mp3'];
    } else {
      supported_formats = ['pdf', 'doc'];

    }
    if (!supported_formats.includes(extension)) {
      this.videoService.api.showToast(`Please add a file with the some of the following extentions: ${supported_formats.join(', ')}.`, ToastType.error);
      return false;
    }
    return true;
  }

  closeForm() {
    this.display_form = false;
    this.video_form = undefined;
    this.temp_video = undefined;
  }

  uploadPicture(input_file) {
    input_file.onchange = (event: { target: { files: File[] } }) => {
      if (event.target.files.length > 0) {
        this.uploadImage(event.target.files[0]);
      }
    };
    input_file.click();
  }

  uploadImage(photo) {
    this.fus.uploadFile(photo, true, 'video')
      .subscribe((response: any) => {
        this.video_form.get('thumbnail').setValue(this.fus.cleanPhotoUrl(response.response));
        // const group = Object.assign({}, this.group);
        // this.fixMembers(group);
        // this.videoService.updateVideo(group)
        //   .subscribe(response_updated => {
        //     this.videoService.api.showToast(`Slider updated successfully`, ToastType.success);
        //   }, error => {
        //     console.error(error);
        //     this.videoService.api.showToast(`Something happened trying to save the slider.`, ToastType.error);
        //   });
      });
  }

  uploadFile(event: { target: { files: File[] } }, form_key: string) {
    console.log(event);
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.video_form.get(form_key).setValue(file)
      if (form_key == 'thumbnail_file') {
        setTimeout(() => {
          this.img_tag.nativeElement.src = URL.createObjectURL(file);
          this.video_form.get('temp_src').setValue(this.img_tag.nativeElement.src);
        }, 600);
        var reader = new FileReader();
        //Read the contents of Image File.
        reader.readAsDataURL(file);
        reader.onload = (e: any) => {

          //Initiate the JavaScript Image object.
          var image = new Image();

          //Set the Base64 string return from FileReader as source.
          image.src = e.target.result as any;

          //Validate the File Height and Width.
          image.onload = () => {
            var height = image.height;
            var width = image.width;
            // const aspect_ratio = height / width;

            // const client_width = this.col_img_banner_container.nativeElement.clientWidth;

            // this.container = {
            //   width: client_width,
            //   height: client_width * aspect_ratio
            // }

            return true;;
          }
        };
        // this.edit_object.home_banner = true

      } else {
        this.video_form.get('temp_src').setValue(undefined);
        setTimeout(() => {
          this.img_tag.nativeElement.src = this.fixUrl();
        }, 600);
      }
    }
  }


  fixUrl() {
    // video_form.get('thumbnail').value
    // if (url) {
    //   if (url.includes('https')) {
    //     return url;
    //   } else {
    //     // return `${environment.serverURL}/${url}`;
    //     return `${environment.serverURL}${url}`;
    //   }
    // } else {
    //   return 'assets/img/default-image.jpg';
    // }
    if (this.video_form.get('temp_src').value) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(this.video_form.get('temp_src').value);
    } else if (this.thumbnail_file_info) {
      return `${environment.serverURL}${this.thumbnail_file_info.src_path}`;
    } else {
      return `assets/img/default-image.jpg`
    }
  }

  toggleThumbReadOnly() {
    const value = this.video_form.get('custom_url').value;
    this.video_form.get('custom_url').setValue(!value);
  }

  setValidations(event) {
    console.log(event);
    console.log(this.video_form);
    console.log(this.video_form.value);
    const idMediaType = Number(this.video_form.get('idMediaType').value);
    if (idMediaType == 1) {
      this.video_form.get('embed_frame').setValidators([Validators.required]);
      this.video_form.get('resource_file').clearValidators();
    } else {
      this.video_form.get('embed_frame').clearValidators();
      this.video_form.get('resource_file').setValidators([Validators.required]);
    }
  }

  removeAttach() {
    this.resource_file = undefined;
    if (this.temp_video.idVideo) {
      this.video_form.get('idResource').setValue(undefined);
      this.file_info = undefined;
    }
  }

  async uploadFileTest() {
    const payload = this.video_form.value;

    const response: any = await this.fus.uploadWithProgress(payload.resource_file, false, this.uploadProgress(payload, 'resource_file'), 'media')
      .catch(error => {
        console.error(error);
        return;
      });
    console.log(response);
    if (response) {

    }
  }

  uploadProgress(payload, key_item: string) {
    return (e) => {
      const file: File = payload[key_item];
      var file1Size = file.size;
      if (e.loaded <= file1Size) {
        var percent = Math.round(e.loaded / file1Size * 100);
        document.getElementById('progress-bar-file1').style.width = percent + '%';
        document.getElementById('progress-bar-file1').innerHTML = `${percent}%`;
        this.uploaded = false;

      }

      if (e.loaded == e.total) {
        document.getElementById('progress-bar-file1').style.width = '100%';
        document.getElementById('progress-bar-file1').innerHTML = `100%`;
        this.uploaded = true;
      }
    }
  }

  async applyFilters() {
    this.show_loading = true;
    await this.getVideos()
      .catch(error => {
        console.error(error);
      });
    this.show_loading = false;
  }

  restartTable(): void {
    if (this.dtElement) {
      if (this.dtElement.dtInstance) {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          dtInstance.destroy();
        });
      }
    }
  }
}
