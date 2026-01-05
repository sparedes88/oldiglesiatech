import {
  Component,
  OnInit,
  EventEmitter,
  ElementRef,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { PlaylistModel } from "src/app/models/VideoModel";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-playlist-detail",
  templateUrl: "./playlist-detail.component.html",
  styleUrls: ["./playlist-detail.component.scss"],
})
export class PlaylistDetailComponent implements OnInit {
  @Input() playlist: PlaylistModel;
  @Output() dismiss_detail = new EventEmitter();
  @ViewChild("iframe") iframe: ElementRef;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    Array.prototype.forEach.call(
      document.getElementsByClassName("playlistWrapper"),
      (element) => {
        Array.prototype.forEach.call(
          element.getElementsByTagName("iframe"),
          (img) => {
            img.style = "max-width: 100%";
          }
        );
      }
    );
  }

  iframeLang: string = "en";
  get iframeCode() {
    return {
      entry_point: `<div id="appPlaylist"></div>`,
      scripts: `
<script>
var IDIGLESIA = ${this.playlist.idOrganization}
var IDPLAYLIST = ${this.playlist.idPlaylist}
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
<script src="https://iglesia-tech-api.e2api.com/api/iglesiaTechApp/public/playlists/scripts"></script>`,
    };
  }

  fixUrl(url: string) {
    if (url) {
      if (url.includes("https")) {
        return url;
      } else {
        // return `${environment.serverURL}/${url}`;
        return `${environment.serverURL}${url}`;
      }
    } else {
      return "assets/img/default-cover-image.jpg";
    }
  }
}
