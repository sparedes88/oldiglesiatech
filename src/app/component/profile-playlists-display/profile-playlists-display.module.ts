import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfilePlaylistsDisplayComponent } from './profile-playlists-display.component';
import { RouterModule } from '@angular/router';
import { VideosModule } from 'src/app/pages/videos/videos.module';

@NgModule({
  declarations: [
    ProfilePlaylistsDisplayComponent
  ],
  imports: [
    CommonModule,
    VideosModule,
    RouterModule
  ],
  exports: [
    ProfilePlaylistsDisplayComponent
  ],
  entryComponents: [
    ProfilePlaylistsDisplayComponent
  ]
})
export class ProfilePlaylistsDisplayModule { }
