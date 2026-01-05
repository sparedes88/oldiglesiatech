import { PlaylistEmbedComponent } from './../../pages/videos/playlist-embed/playlist-embed.component';
import { PlaylistModel } from './../../models/VideoModel';
import { Component, Input, OnInit, OnChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-profile-playlists-display',
  templateUrl: './profile-playlists-display.component.html',
  styleUrls: ['./profile-playlists-display.component.scss']
})
export class ProfilePlaylistsDisplayComponent implements OnInit, OnChanges {

  @Input('playlists') playlists: PlaylistModel[];
  @Input('playlists_tab') playlists_tab: PlaylistModel[] = [];
  @Input('idOrganization') idOrganization: number;
  @Input('view_mode') view_mode: string;
  @Input('style_settings') style_settings: any;

  // @ViewChild('playlist_embed') playlist_embed: PlaylistComponent;
  @ViewChild('playlist_embed') playlist_embed: PlaylistEmbedComponent;

  selected_playlist: PlaylistModel;
  loading: boolean = false;
  wait_style: boolean = true;
  need_refresh: boolean = false;

  constructor(
    private activated_route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    if (this.playlists.length === 1) {
      this.selected_playlist = this.playlists[0];
    } else if (this.playlists.length > 1) {
      this.selected_playlist = this.playlists[0];
    }

    const page = this.activated_route.snapshot.paramMap.get('page');

    if (page && (page.endsWith('_9'))) {
      const subpage = this.activated_route.snapshot.paramMap.get('subpage');
      if (subpage === 'playlist') {
        const slug = this.activated_route.snapshot.paramMap.get('slug');
        if (slug) {
          const slices = slug.split('-');
          if (slices.length > 0) {
            const idPlaylist = Number(slices[0]);

            if (!Number.isNaN(idPlaylist)) {
              const playlist = this.playlists.find(x => x.idPlaylist === idPlaylist);
              this.selected_playlist = Object.assign({}, playlist);
            }
          }
        }
      } else {
        if (this.selected_playlist) {
          this.router.navigateByUrl(`${this.actual_page}/playlist/${this.selected_playlist.idPlaylist}`)
        }
      }
    }
    setTimeout(() => {
      this.setStyle();
    }, 100);
  }

  setStyle() {

    this.wait_style = true;
    if (this.playlists_tab.length > 0) {
      this.playlists.forEach(x => {
        const full_cat = this.playlists_tab.find(cat => cat.idPlaylist === x.idPlaylist)

        if (full_cat) {
          x.text_align = full_cat.text_align;
          x.background_color = full_cat.background_color;
          x.active_background_color = full_cat.active_background_color;
          x.hover_background_color = full_cat.hover_background_color;
          x.font_color = full_cat.font_color;
          x.font_weight = full_cat.font_weight;
          x.font_style = full_cat.font_style;
          x.font_size = full_cat.font_size;
          x.sort_type = full_cat.sort_type;
        }
      });
      this.wait_style = false;
    } else {
      this.wait_style = false;
    }
  }

  ngOnChanges(change) {
    if (this.playlists.length === 1) {
      this.selected_playlist = this.playlists[0];
    }

    if (change.playlists_tab) {
      const actual_id = this.selected_playlist.idPlaylist;
      const actual_category = change.playlists_tab.currentValue.find(x => x.idPlaylist === actual_id);
      const prev_category = change.playlists_tab.previousValue.find(x => x.idPlaylist === actual_id);
      if (prev_category && actual_category) {
        if (this.selected_playlist.sort_type != actual_category.sort_type) {
          this.need_refresh = true;
        } else {
          this.need_refresh = false;
        }
      }
    }
    this.setStyle();
  }

  scroll(direction: number) {
    document.getElementById('scroll-x').scrollLeft += direction;
  }

  setPlaylist(playlist: PlaylistModel) {
    // if (this.view_mode !== 'edition') {
      this.selected_playlist = playlist;
      this.playlist_embed.sort_type = playlist.sort_type;
      this.playlist_embed.idPlaylist = playlist.idPlaylist;
      this.playlist_embed.getPlaylist();
    // }
  }

  get actual_page() {
    const regex = new RegExp(/^[a-z0-9]+$/i, 'g');
    // const original_slug = `${this.selectedElement.idGroup} ${this.selectedElement.title}`;
    // const slug_ = original_slug.replace(regex, '').toLowerCase().replace(/\./g, '');
    // const slug = this.slugifyValue(slug_);
    const page = this.activated_route.snapshot.paramMap.get('page');
    if (page) {
      return `/organization-profile/main/${this.idOrganization}/${page}`;
    }
  }

}
