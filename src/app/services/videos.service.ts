import { PlaylistModel } from './../models/VideoModel';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { VideoModel } from '../models/VideoModel';
import { UserService } from './user.service';
import { query } from '@angular/animations';

export class MediaModelFilter {
  sort_by: 'asc' | 'desc';
  media_type: 'all' | 'video' | 'audio' | 'document';
  search: string;
  sort: 'asc' | 'desc';
  type: 'all' | 'video' | 'audio' | 'document';
  idIglesia: number;
  series: number[];
}
@Injectable({
  providedIn: 'root'
})
export class VideosService {

  constructor(
    public api: ApiService,
    private userService: UserService) { }

  getVideos(filter?: Partial<MediaModelFilter>) {
    let payload: Partial<MediaModelFilter> = {
      idIglesia: this.userService.getCurrentUser().idIglesia,
    };
    if (filter) {
      if (filter.media_type != 'all') {
        payload.type = filter.media_type;
      }
      payload.sort = filter.sort_by;
      if (filter.search && filter.search.length > 0) {
        payload.search = encodeURIComponent(filter.search);
      }
      if (filter.series.length > 0) {
        payload.series = filter.series;
      }
    }
    return this.api.get('videos/getVideos/',
      // Params
      payload
      // reqOptions
    );
  }

  getVideoDetail(video: VideoModel) {
    const resp = this.api.get(`videos/detail/${video.idVideo}`,
      // Params
      { idIglesia: this.userService.getCurrentUser().idIglesia }
      // reqOptions
    );
    return resp;
  }

  addVideo(video: VideoModel) {
    video.created_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('videos/addVideo/',
      // Params
      video
      // reqOptions
    );
    return resp;
  }

  updateVideo(video: any) {
    video.created_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('videos/updateVideo/',
      // Params
      video
      // reqOptions
    );
    return resp;
  }

  deleteVideo(video: VideoModel) {
    video.deleted_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('videos/deleteVideo/',
      // Params
      video
      // reqOptions
    );
    return resp;
  }

  getPlaylists() {
    const resp = this.api.get('videos/playlists/getPlaylists/',
      // Params
      { idIglesia: this.userService.getCurrentUser().idIglesia }
      // reqOptions
    );
    return resp;
  }

  getPlaylistDetail(playlist: PlaylistModel) {
    const resp = this.api.get(`videos/playlists/detail/${playlist.idPlaylist}`,
      // Params
      { idIglesia: this.userService.getCurrentUser().idIglesia }
      // reqOptions
    );
    return resp;
  }

  addPlaylist(playlist: PlaylistModel) {
    playlist.created_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('videos/playlists/addPlaylist/',
      // Params
      playlist
      // reqOptions
    );
    return resp;
  }

  updatePlaylist(playlist: PlaylistModel) {
    playlist.created_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('videos/playlists/updatePlaylist/',
      // Params
      playlist
      // reqOptions
    );
    return resp;
  }

  deletePlaylist(playlist: PlaylistModel) {
    playlist.deleted_by = this.userService.getCurrentUser().idUsuario;
    const resp = this.api.post('videos/playlists/deletePlaylist/',
      // Params
      playlist
      // reqOptions
    );
    return resp;
  }
}
