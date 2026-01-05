import { MediaAudioModel } from './../../../models/VideoModel';
import { DomSanitizer } from '@angular/platform-browser';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { VideoModel } from 'src/app/models/VideoModel';
import { environment } from 'src/environments/environment';
import { generateColor, updateCssText } from 'src/app/models/parse-css';
@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.scss']
})
export class AudioPlayerComponent implements OnInit {

  @Input('autoplay') autoplay: boolean;
  @Input('hide_buttons') hide_buttons: boolean;
  @Input('src') src: string;
  @Input('style_settings') style_settings = {
    home_title_text_color: '#6ce59c'
  }
  @Input('video') video: MediaAudioModel;
  @Input('is_full_width') is_full_width: boolean;

  safe_src: any;
  loading: boolean = false;
  @Output('on_close_video') on_close_video: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('audio') audio_player_element: ElementRef;
  audioContainer: HTMLAudioElement;
  @ViewChild('soundline') timeline: ElementRef;
  @ViewChild('volumeBar') volume: ElementRef;
  @ViewChild('volumeStatus') volumeStatus: ElementRef;
  private volumeBar: HTMLElement;
  private volumeStatusBar: HTMLElement;

  is_playing: boolean = false;
  private currentVolume: number = 1;

  constructor(
    private dom_sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    if (!this.style_settings) {
      this.style_settings = {
        home_title_text_color: '#6ce59c'
      }
    }
    const genColor = generateColor('name', 'test', this.style_settings.home_title_text_color);

    document.documentElement.style.setProperty('--progress-bar-color', genColor.value);
    document.documentElement.style.setProperty('--progress-bar-color-tint', genColor.tint);
    document.documentElement.style.setProperty('--progress-bar-color-shade', genColor.shade);

    this.safe_src = this.dom_sanitizer.bypassSecurityTrustResourceUrl(this.src);
    setTimeout(() => {
      this.setAudioEvents();
      if (this.autoplay) {
        this.audioContainer.play();
        this.is_playing = true;
      }
    }, 100);
  }
  setAudioEvents() {
    this.audioContainer = this.audio_player_element.nativeElement;
    this.volumeBar = this.volume.nativeElement;
    this.volumeStatusBar = this.volumeStatus.nativeElement;
    this.audioContainer.removeEventListener('loadedmetadata', () => { });
    this.audioContainer.removeEventListener('timeupdate', () => { });
    this.audioContainer.removeEventListener('ended', () => { });

    this.audioContainer.addEventListener('loadedmetadata', ev => {
      this.video.duration = this.formatTime(this.audioContainer.duration);
    });
    // this.video.duration = this.formatTime(this.audioContainer.duration);
    this.audioContainer.addEventListener('timeupdate', (ev) => {
      const timeline = this.timeline.nativeElement;
      const percentagePosition = (100 * this.audioContainer.currentTime) / this.audioContainer.duration;
      timeline.style.backgroundSize = `${percentagePosition}% 100%`;
      timeline.value = percentagePosition;
    });
    this.audioContainer.addEventListener('ended', (ev) => {
      this.is_playing = false;
    });
  }

  formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let hours: number
    let hour_str: string = '';
    if (minutes > 60) {
      hours = Math.floor(minutes / 60);
      minutes = minutes % 60;
      hour_str = `${hours}:`
    }
    let minutes_str = (minutes >= 10) ? minutes : "0" + minutes;
    let seconds_temp = Math.floor(seconds % 60);
    let seconds_str = (seconds_temp >= 10) ? seconds_temp : "0" + seconds_temp;
    return `${hour_str}${minutes_str}:${seconds_str}`;
  }

  changeSeek(event) {
    const time = (event.target.value * this.audioContainer.duration) / 100;
    this.audioContainer.currentTime = time;
  }

  getPicture(picture) {
    if (!picture) {
      return "https://iglesiatech.app/assets/img/default-image.jpg";
    } else if (picture.includes("http")) {
      return picture;
    }
    return `${environment.serverURL}${picture}`;
  }

  fixUrl(image: string) {
    if (image) {
      if (image.includes('https://')) {
        return `${image}`;
      }
      return `${environment.serverURL}${image}`;
    }
    return ``;
    // return 'assets/img/default-image.jpg';
  }

  togglePlay() {
    if (this.audioContainer.paused) {
      this.audioContainer.play();
      this.is_playing = true;
    } else {
      this.audioContainer.pause();
      this.is_playing = false;
    }
  }

  muteSong(): void {
    if (this.audioContainer.volume) {
      this.setVolume(0);
      this.changeVolumeBarStatus(0);
    } else {
      this.setVolume(this.currentVolume);
      this.changeVolumeBarStatus(this.currentVolume * 100);
    }
  }

  setVolume(volume: number): void {
    this.audioContainer.volume = volume;
  }

  changeVolumeBarStatus(persentage: number): void {
    this.volumeStatusBar.style.width = `${persentage}%`;
  }

  handChangeVolume(event: MouseEvent): void {
    const volumeBarProperty = this.volumeBar.getBoundingClientRect();
    const mousePosition = event.pageX - volumeBarProperty.left + pageXOffset;
    const volumePersentage = (mousePosition * 100) / volumeBarProperty.width;
    this.changeVolumeBarStatus(volumePersentage);
    this.setCurrentVolume(volumePersentage / 100);
    this.setVolume(this.currentVolume);
  }

  setCurrentVolume(volume: number): void {
    this.currentVolume = volume;
  }



}
