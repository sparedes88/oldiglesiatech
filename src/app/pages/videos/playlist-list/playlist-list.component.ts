import { EventEmitter } from '@angular/core';
import { Component, OnInit, Input, Output } from '@angular/core';
import { ToastType } from 'src/app/login/ToastTypes';
import { PlaylistModel, VideoModel } from 'src/app/models/VideoModel';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { VideosService } from 'src/app/services/videos.service';
import { UserService } from 'src/app/services/user.service';
import { OrganizationService } from 'src/app/services/organization/organization.service';
import { OrganizationModel } from 'src/app/models/OrganizationModel';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-playlist-list',
  templateUrl: './playlist-list.component.html',
  styleUrls: ['./playlist-list.component.scss']
})
export class PlaylistListComponent implements OnInit {

  @Input() show_header: boolean;
  @Output() show_playlist = new EventEmitter<PlaylistModel>();
  @Output() toggle_view = new EventEmitter<any>();

  playlists: PlaylistModel[] = [];
  organization_resources: VideoModel[] = [];

  playlist_opened: PlaylistModel;

  display_form: boolean = false;
  show_loading: boolean = true;
  playlist_form: FormGroup;

  currentUser: User;

  select_options: any = {
    singleSelection: false,
    idField: 'idVideo',
    textField: 'title',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    allowSearchFilter: true
  };

  selected_id: number;

  constructor(
    private playlistService: VideosService,
    private form_builder: FormBuilder,
    private userService: UserService,
    private organizationService: OrganizationService,
    private fus: FileUploadService,
  ) {
    this.currentUser = this.userService.getCurrentUser();
  }

  get videos() {
    return this.organization_resources.filter(x => x.idMediaType === 1);
  }
  get audios() {
    return this.organization_resources.filter(x => x.idMediaType === 2);
  }
  get documents() {
    return this.organization_resources.filter(x => x.idMediaType === 3);
  }

  async ngOnInit() {
    const response: any = await this.playlistService.getPlaylists().toPromise()
      .catch(error => {
        console.error(error);
        if (error.error.msg.Code === 404) {
          // this.playlistService.api.showToast(
          //   `There aren't playlists yet.`,
          //   ToastType.info,
          //   `Nothing found.`
          // );
        } else {
          this.playlistService.api.showToast(
            `Something happened while trying to get organization's playlists.`,
            ToastType.error
          );
        }
        return error.error;
      });

    const response_videos: any = await this.playlistService.getVideos().toPromise()
      .catch(error => {
        if (error.error.msg.Code === 404) {
          // this.playlistService.api.showToast(
          //   `There aren't videos yet.`,
          //   ToastType.info,
          //   `Nothing found.`
          // );
        } else {
          this.playlistService.api.showToast(
            `Something happened while trying to get organization's videos.`,
            ToastType.error
          );
        }
        return error.error;
      });
    this.organization_resources = response_videos.videos;
    this.show_loading = false;

    this.playlists = response.playlists;
    this.show_loading = false;
  }

  async openPlaylistDetail(playlist: PlaylistModel) {
    const playlist_response: any = await this.playlistService.getPlaylistDetail(playlist).toPromise()
      .catch(error => {
        console.error(error);
        playlist.videos = [];
        return { playlist };
      });
    this.playlist_opened = playlist_response.playlist;
    this.show_playlist.emit(this.playlist_opened);
  }

  deletePlaylist(playlist: PlaylistModel) {

    if (confirm(`Delete this serie?`)) {
      this.playlistService.deletePlaylist(playlist)
        .subscribe(data => {
          this.show_loading = true;
          this.ngOnInit();
          this.playlistService.api.showToast(`Serie deleted successfully.`, ToastType.success);
        }, error => {
          this.playlistService.api.showToast(`Error deleting serie.`, ToastType.error);
        });
    }
  }

  addPlaylist() {
    this.display_form = true;
    this.initForm();
  }

  async editPlaylist(playlist: PlaylistModel) {
    const playlist_response: any = await this.playlistService.getPlaylistDetail(playlist).toPromise()
      .catch(error => {
        console.error(error);
        playlist.videos = [];
        return { playlist };
      });

    const playlist_temp: PlaylistModel = playlist_response.playlist;

    this.display_form = true;
    this.initForm();
    this.playlist_form.addControl('idPlaylist', new FormControl(playlist.idPlaylist, [Validators.required]));
    Object.keys(playlist).map(key => {
      if (this.playlist_form.get(key)) {
        this.playlist_form.get(key).setValue(playlist[key]);
      }
    });


    const ids_video = [];
    const ids_featured_video = [];
    playlist_temp.videos.forEach(video => {
      ids_video.push(video.idVideo);
      if (video.featured) {
        ids_featured_video.push(video.idVideo);
      }
    });
    const audios_ids = playlist_temp.audios.map(x => x.idVideo);
    const document_ids = playlist_temp.documents.map(x => x.idVideo);
    this.playlist_form.patchValue({
      videos: this.organization_resources.filter(v => ids_video.includes(v.idVideo)),
      audios: this.organization_resources.filter(v => audios_ids.includes(v.idVideo)),
      documents: this.organization_resources.filter(v => document_ids.includes(v.idVideo)),
    });
    this.playlist_form.patchValue({ featured_videos: this.organization_resources.filter(v => ids_featured_video.includes(v.idVideo)) });

  }

  initForm() {
    this.playlist_form = this.form_builder.group({
      description: new FormControl('', []),
      name: new FormControl('', [Validators.required]),
      idOrganization: new FormControl(this.currentUser.idIglesia, [Validators.required]),
      videos: new FormControl([], []),
      audios: new FormControl([], []),
      documents: new FormControl([], []),
      featured_videos: new FormControl('', []),
      picture: new FormControl(''),
      videos_size: new FormControl(4),
      audios_size: new FormControl(4),
      documents_size: new FormControl(4)
    });
  }

  submitForm(playlist_form: FormGroup) {
    if (playlist_form.invalid) {
      this.playlistService.api.showToast(`Please check the info provided.`, ToastType.error);
      return;
    }
    const payload = playlist_form.value;

    let subscription: Observable<any>;
    let success_message: string;
    let error_message: string;

    const ids = [];
    if (payload.videos) {
      payload.videos.forEach(video => {
        ids.push({ idVideo: video.idVideo, featured: false });
      });
    }
    if (payload.featured_videos) {
      payload.featured_videos.forEach(video => {
        const video_added = ids.find((x, index) => {
          x.index = index;
          return x.idVideo === video.idVideo
        });
        if (video_added) {
          video_added.featured = true;
          ids[video_added.index] = video_added;
        }
      });
    }

    payload.videos = ids;
    payload.videos = (payload.videos as any[]).concat(payload.audios).concat(payload.documents);

    if (payload.idPlaylist) {
      subscription = this.playlistService.updatePlaylist(payload);
      success_message = `Serie updated successfully.`;
      error_message = `Error updating serie`;
    } else {
      subscription = this.playlistService.addPlaylist(payload);
      success_message = `Serie added successfully`;
      error_message = `Error adding serie`;
    }

    subscription
      .subscribe(response => {
        this.show_loading = true;
        this.playlistService.api.showToast(`${success_message}`, ToastType.success);
        this.closeForm();
        this.ngOnInit();
      }, error => {
        console.error();
        this.playlistService.api.showToast(`${error_message}`, ToastType.error);
      });
  }

  closeForm() {
    this.display_form = false;
    this.playlist_form = undefined;
  }


  iframeLang: string = 'en'
  get iframeCode() {
    return {
      entry_point: `<div id="appPlaylist"></div>`,
      scripts: `
<script>
var IDIGLESIA = ${this.currentUser.idIglesia}
var IDPLAYLIST = undefined
var LANG = "${this.iframeLang}"
</script>
<script src="https://cdn.jsdelivr.net/npm/vue@2.5.16/dist/vue.js"></script>
<link
rel="stylesheet"
href="https://cdnjs.cloudflare.com/ajax/libs/flexboxgrid/6.3.1/flexboxgrid.min.css"
/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js"></script>
<link
href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700&display=swap"
rel="stylesheet"
/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment-with-locales.min.js"></script>
<link rel="stylesheet" href="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/styles" />
<script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/playlists/scripts"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css" integrity="sha384-eOJMYsd53ii+scO/bJGFsiCZc+5NDVN2yr8+0RDqr0Ql0h+rP48ckxlpbzKgwra6" crossorigin="anonymous">`,
    };
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
    const indexPoint = (photo.name as string).lastIndexOf('.');
    const extension = (photo.name as string).substring(indexPoint);
    const ticks = (
      Number(String(Math.random()).slice(2)) +
      Date.now() +
      Math.round(performance.now())
    ).toString(36);

    let myUniqueFileName: string;

    if (this.playlist_form.get('idPlaylist')) {
      myUniqueFileName = `playlist_picture_${this.playlist_form.get('idPlaylist').value}_${ticks}${extension}`;
    } else {
      myUniqueFileName = `playlist_picture_new_${ticks}${extension}`;
    }

    const iglesia_temp = new OrganizationModel();
    iglesia_temp.idIglesia = this.currentUser.idIglesia;
    iglesia_temp.topic = this.currentUser.topic;

    this.organizationService
      .uploadFile(photo, iglesia_temp, myUniqueFileName, `videos/playlist_pictures`)
      .then((response: any) => {
        // this.group_event.picture = this.fus.cleanPhotoUrl(response.response);
        // const group = Object.assign({}, this.group_event);
        //   this.groupsService.updateGroup(group)
        //     .subscribe(response_updated => {
        //       this.groupsService.api.showToast(`Slider updated successfully`, ToastType.success);
        //     }, error => {
        //       console.error(error);
        //       this.groupsService.api.showToast(`Something happened trying to save the slider.`, ToastType.error);
        //     });
        // });
        this.playlist_form.patchValue({ picture: this.fus.cleanPhotoUrl(response.response) });
      });
  }

  fixUrl() {
    if (this.playlist_form.get('picture')) {
      const url = this.playlist_form.get('picture').value;
      if (url) {
        if (url.includes('https')) {
          return url;
        } else {
          // return `${environment.serverURL}/${url}`;
          return `${environment.serverURL}${url}`;
        }
      } else {
        return 'assets/img/default-cover-image.jpg';
      }
    }
    return 'assets/img/default-cover-image.jpg';
  }

  fixUrlList(url: string) {
    if (url) {
      if (url.includes('https')) {
        return url;
      } else {
        // return `${environment.serverURL}/${url}`;
        return `${environment.serverURL}${url}`;
      }
    } else {
      return 'assets/img/default-cover-image.jpg';
    }
  }

  get selected_videos() {
    return this.playlist_form.get('videos').value;
  }

  async shareQR(qr_code) {
    const element = qr_code.qrcElement.nativeElement;
    const img_child = element.firstChild;
    try {
      const imgURL = img_child.src;
      const data = await fetch(imgURL);
      const blob = await data.blob();
      await window.navigator['clipboard'].write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      this.fus.api.showToast('QR copied to clipboard', ToastType.success);
    } catch (err) {
      console.error(err.name, err.message);
    }

  }

  get iframeDetailCode() {
    return {
      link: `${environment.server_calendar}/playlist/${this.currentUser.idIglesia}/view/${this.selected_id}`,
      embed: `<iframe
      src="${environment.server_calendar}/playlist/${this.currentUser.idIglesia}/view/${this.selected_id}"
      frameborder="0"
      id="detail_frame_frame"
      height="100%"
      width="100%"
    ></iframe>`
    };
  }
}
