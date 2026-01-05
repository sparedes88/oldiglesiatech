import { Component, OnInit } from '@angular/core';
import { VideoModel, PlaylistModel } from 'src/app/models/VideoModel';

@Component({
  selector: 'app-manage-videos-home',
  templateUrl: './manage-videos-home.component.html',
  styleUrls: ['./manage-videos-home.component.scss']
})
export class ManageVideosHomeComponent implements OnInit {

  view_type: string = 'videos';
  video_opened: VideoModel;
  playlist_opened: PlaylistModel;

  constructor() { }

  ngOnInit() {
  }

  changeView() {
    if (this.view_type === 'videos') {
      this.view_type = 'playlist';
    } else {
      this.view_type = 'videos';
    }
  }

  show_video(event: VideoModel) {
    this.video_opened = event;
  }

  show_playlist(event: PlaylistModel) {
    this.playlist_opened = event;
  }

}
