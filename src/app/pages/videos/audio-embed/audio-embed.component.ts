import { ApiService } from './../../../services/api.service';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MediaAudioModel } from 'src/app/models/VideoModel';
import { AudioPlayerComponent } from '../audio-player/audio-player.component';

@Component({
  selector: 'app-audio-embed',
  templateUrl: './audio-embed.component.html',
  styleUrls: ['./audio-embed.component.scss']
})
export class AudioEmbedComponent implements OnInit {

  @ViewChild('audio_player') audio_player: AudioPlayerComponent;

  @Input('media_item') media_item: MediaAudioModel;
  @Input('handle_as_page') handle_as_page: boolean;
  selected_audio: MediaAudioModel;

  @Output('open_video') open_video: EventEmitter<MediaAudioModel> = new EventEmitter<MediaAudioModel>();

  constructor(
    private api: ApiService
  ) {
  }

  ngOnInit() {
    console.log(this.selected_audio);
  }

  closeVideo() {
    this.selected_audio = undefined;
  }

  getPicture(picture) {
    if (!picture) {
      return "https://iglesiatech.app/assets/img/default-image.jpg";
    } else if (picture.includes("http")) {
      return picture;
    }
    return `${this.api.baseUrl}${picture}`;
  }

  reproduceAudio(video: MediaAudioModel) {
    const link = `${this.api.baseUrl}${video.file_info.src_path}`;
    video.url = link;
    this.selected_audio = video;
    setTimeout(() => {
      // if (this.selected_video) {
      //   const idVideos = this.playlist.audios.map(x => x.idVideo);
      //   if (!idVideos.includes(this.last_video.idVideo)) {
      //     this.playlist.audios.unshift(this.last_video);
      //   }
      // }
      if (!this.audio_player.video) {
        const link = `${this.api.baseUrl}${video.file_info.src_path}`;
        this.audio_player.video = video;
        this.audio_player.src = link;
      }
      if (this.audio_player.video) {
        if (this.audio_player.video.idVideo !== video.idVideo) {
          const link = `${this.api.baseUrl}${video.file_info.src_path}`;
          this.audio_player.src = link;
          this.audio_player.video = video;
          this.audio_player.ngOnInit();
        }
      }
    });

  }

}
