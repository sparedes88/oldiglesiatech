import { environment } from './../../../../environments/environment';
import { environment as prod } from './../../../../environments/environment.prod';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';

import { VideoplayerComponent } from '../videoplayer/videoplayer.component';
import { MediaAudioModel, MediaDocumentModel, PlaylistModel, VideoModel } from './../../../models/VideoModel';
import { ApiService } from './../../../services/api.service';
import { AudioPlayerComponent } from '../audio-player/audio-player.component';
import { DocumentViewerComponent } from '../document-viewer/document-viewer.component';

@Component({
  selector: 'app-playlist-embed',
  templateUrl: './playlist-embed.component.html',
  styleUrls: ['./playlist-embed.component.scss']
})
export class PlaylistEmbedComponent implements OnInit {

  @Input('idPlaylist') idPlaylist: number;
  @Input('idOrganization') idOrganization: number;
  @Input('style_settings') style_settings: any;
  @Input('is_standalone') is_standalone: boolean;
  @Input('standalone_videos') standalone_videos: VideoModel[] = [];
  @Input('show_tab_searchbar') show_tab_searchbar: boolean = true;
  @Input('sort_type') sort_type: 'date_asc' | 'date_desc' | 'alpha_asc' | 'alpha_desc' = 'date_asc';
  @Input('profile_tab_id') profile_tab_id: number;
  @Input('is_full_width') is_full_width: boolean;
  @ViewChild('video_player') video_player: VideoplayerComponent;
  @ViewChild('audio_player') audio_player: AudioPlayerComponent;
  @ViewChild('document_viewer') document_viewer: DocumentViewerComponent;

  playlist: PlaylistModel;
  loadingPlaylist: boolean = false;
  last_video: VideoModel;
  searchValue: string;
  currentLang = 'es';
  langDB: any[];
  selected_file: VideoModel | MediaAudioModel | MediaDocumentModel;

  constructor(
    private api: ApiService
  ) { }

  ngOnInit() {
    if (!this.is_standalone) {
      this.getPlaylist();
    } else {
      this.loadingPlaylist = false;
      this.setLastVideo();
    }
    this.getLangs();
  }

  async getPlaylist() {
    this.loadingPlaylist = true;
    let params: Partial<
      {
        idIglesia: number;
        sort_type: 'date_asc' | 'date_desc' | 'alpha_asc' | 'alpha_desc';
      }> = {
      idIglesia: this.idOrganization
    };
    if (this.profile_tab_id) {
      const tab_id = this.profile_tab_id;
      const response: any = await this.api
        .get(`iglesias/headers/${tab_id}`, { idIglesia: this.idOrganization }).toPromise()
        .catch(error => {
          console.error(error);
          // this.items = [];
          return;
        });
      console.log(response);
      if (response) {
        const profile_tab = response.profile_tab;
        const playlists = profile_tab.profile_tab_settings.categories;
        const selected_playlist = playlists.find(x => x.idPlaylist === Number(this.idPlaylist));
        console.log(selected_playlist);
        console.log(this.idPlaylist);

        if (selected_playlist) {
          params.sort_type = selected_playlist.sort_type;
        }
      }
    } else {
      if (this.sort_type) {
        params.sort_type = this.sort_type;
      }
    }
    this.api
      .get(
        `videos/playlists/detail/${this.idPlaylist}`,
        params
      )
      .subscribe((response: any) => {
        this.playlist = response.playlist;
        if (this.selected_file) {
          const audio_in_playlist = this.playlist.audios.find(x => x.idVideo === this.selected_file.idVideo);
          if (!audio_in_playlist) {
            this.selected_file = undefined;
          }
        }
        this.setLastVideo();

        this.playlist.featured_videos = this.video_array.filter(
          (v) => v.featured
        );
      }, (error) => {
        console.error(error.response);
      }, () => {
        this.loadingPlaylist = false;
      });
  }
  setLastVideo() {
    this.last_video = undefined;
    this.video_array.forEach((video) => {
      const iframe_url = video.embed_frame;
      const src_index = iframe_url.indexOf('src="') + 5;
      const next_index = iframe_url
        .substring(src_index)
        .indexOf('"');
      video.url = video.embed_frame.substring(
        src_index,
        src_index + next_index
      );
    });

    if (this.selected_file) {
      const video_in_playlist = this.video_array.find(x => x.idVideo === this.selected_file.idVideo);
      if (!video_in_playlist) {
        this.selected_file = undefined;
      }
    }
    if (this.video_array.length !== 0) {
      // this.video_array = this.video_array.sort((a, b) => {
      //   return moment(a.publish_date).isBefore(b.publish_date)
      //     ? 1
      //     : -1;
      // });
      this.last_video = this.video_array[0];
      this.video_array = this.video_array.splice(1);
    }
  }

  getLangs() {
    this.api
      .get("public/langs")
      .subscribe((response: any) => {
        this.langDB = response;
      }, error => {
        console.error(error.response);
      })
  }

  set video_array(videos: VideoModel[]) {
    if (this.is_standalone) {
      this.standalone_videos = videos;
    }
    if (this.playlist) {
      this.playlist.videos = videos;
    }
  }

  get video_array(): VideoModel[] {
    if (this.is_standalone) {
      return this.standalone_videos;
    }
    if (this.playlist) {
      return this.playlist.videos;
    }
    return [];
  }

  get filteredElements() {
    if (this.is_standalone) {
      return this.standalone_videos;
    }
    if (this.playlist) {
      if (this.searchValue) {
        return this.video_array.filter(element => {

          return element.title
            .toLowerCase()
            .includes(this.searchValue.toLowerCase()) && element.idMediaType === 1;
        });
      }
      return this.video_array;
    }
    return [];
  }
  get filteredAudios() {
    if (this.playlist) {
      if (this.searchValue) {
        return this.playlist.audios.filter(element => {

          return element.title
            .toLowerCase()
            .includes(this.searchValue.toLowerCase()) && element.idMediaType === 2;
        });
      }
      return this.playlist.audios;
    }
    return [];
  }
  get filteredDocuments() {
    if (this.playlist) {
      if (this.searchValue) {
        return this.playlist.documents.filter(element => {

          return element.title
            .toLowerCase()
            .includes(this.searchValue.toLowerCase()) && element.idMediaType === 3;
        });
      }
      return this.playlist.documents;
    }
    return [];
  }

  getPicture(picture) {
    if (!picture) {
      return "https://iglesiatech.app/assets/img/default-image.jpg";
    } else if (picture.includes("http")) {
      return picture;
    }
    return `${prod.serverURL}${picture}`;
  }

  get lang() {
    if (this.langDB && this.currentLang) {
      return this.langDB.find((l) => l.lang == this.currentLang);
    }
    return {
      keys: {},
    };
  }

  reproduceVideo(video: VideoModel) {
    this.selected_file = video;
    setTimeout(() => {
      if (this.selected_file) {
        const idVideos = this.video_array.map(x => x.idVideo);
        if (!idVideos.includes(this.last_video.idVideo)) {
          this.video_array.unshift(this.last_video);
        }
      }
      if (!this.video_player.video) {
        this.video_player.video = video;
      }
      if (this.video_player.video) {
        if (this.video_player.video.idVideo !== video.idVideo) {
          this.video_player.src = video.url;
          this.video_player.video = video;
          this.video_player.ngOnInit();
        }
      }
    });
  }
  reproduceAudio(video: MediaAudioModel) {
    const link = `${environment.serverURL}${video.file_info.src_path}`;
    video.url = link;
    this.selected_file = video;
    setTimeout(() => {
      if (!this.audio_player.video) {
        const link = `${environment.serverURL}${video.file_info.src_path}`;
        this.audio_player.video = video;
        this.audio_player.src = link;
      }
      if (this.audio_player.video) {
        if (this.audio_player.video.idVideo !== video.idVideo) {
          const link = `${environment.serverURL}${video.file_info.src_path}`;
          this.audio_player.src = link;
          this.audio_player.video = video;
          this.audio_player.ngOnInit();
        }
      }
    });
  }

  openDocument(document: MediaDocumentModel) {
    if (document.is_embed) {
      const link = `${prod.serverURL}${document.file_info.src_path}`;
      document.url = link;
      this.selected_file = document;
      setTimeout(() => {
        if (!this.document_viewer.video) {
          const link = `${prod.serverURL}${document.file_info.src_path}`;
          this.document_viewer.video = document;
          this.document_viewer.src = link;
        }
        if (this.document_viewer.video) {
          if (this.document_viewer.video.idVideo !== document.idVideo) {
            const link = `${prod.serverURL}${document.file_info.src_path}`;
            this.document_viewer.src = link;
            this.document_viewer.video = document;
            this.document_viewer.ngOnInit();
          }
        }
      });
    } else {
      const link = `${prod.serverURL}${document.file_info.src_path}`;
      window.open(link, '_blank');
    }
  }

  closeVideo() {
    if (this.last_video) {
      const idLastVideo = this.last_video.idVideo;
      this.video_array = this.video_array.filter(x => x.idVideo !== idLastVideo);
    }
    this.selected_file = undefined;
    if (this.video_player) {
      this.video_player.video = undefined;
      this.video_player.src = undefined;
    }
    if (this.audio_player) {
      this.audio_player.video = undefined;
      this.audio_player.src = undefined;
    }
    if (this.document_viewer) {
      this.document_viewer.video = undefined;
      this.document_viewer.src = undefined;
    }
  }

}
