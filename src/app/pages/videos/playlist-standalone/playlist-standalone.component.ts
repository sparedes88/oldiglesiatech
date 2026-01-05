import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-playlist-standalone',
  templateUrl: './playlist-standalone.component.html',
  styleUrls: ['./playlist-standalone.component.scss']
})
export class PlaylistStandaloneComponent implements OnInit {

  idPlaylist: number;
  idOrganization: number;

  constructor(private route: ActivatedRoute) {
    if (!this.idPlaylist) {
      this.idPlaylist = Number(this.route.snapshot.params.idPlaylist);
    }
    if (!this.idOrganization) {
      this.idOrganization = Number(this.route.snapshot.params.idOrganization);
    }
  }

  ngOnInit() {
  }

}
