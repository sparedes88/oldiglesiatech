import { TextEditorModule } from './../../component/text-editor/text-editor.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VideosRoutingModule } from './videos-routing.module';
import { VideosListComponent } from './videos-list/videos-list.component';
import { ManageVideosHomeComponent } from './manage-videos-home/manage-videos-home.component';
import { PlaylistListComponent } from './playlist-list/playlist-list.component';
import { VideoDetailComponent } from './video-detail/video-detail.component';
import { AppPipesModule } from 'src/app/pipes/app-pipes/app-pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PlaylistDetailComponent } from './playlist-detail/playlist-detail.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { PlaylistEmbedComponent } from './playlist-embed/playlist-embed.component';
import { VideoplayerComponent } from './videoplayer/videoplayer.component';
import { AudioPlayerComponent } from './audio-player/audio-player.component';
import { PlaylistStandaloneComponent } from './playlist-standalone/playlist-standalone.component';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { AudioEmbedComponent } from './audio-embed/audio-embed.component';
import { DocumentViewerComponent } from './document-viewer/document-viewer.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { DocumentEmbedComponent } from './document-embed/document-embed.component';
import { DataTablesModule } from 'angular-datatables';
@NgModule({
  declarations: [VideosListComponent, ManageVideosHomeComponent, PlaylistListComponent, VideoDetailComponent, PlaylistDetailComponent, PlaylistEmbedComponent, VideoplayerComponent, AudioPlayerComponent, PlaylistStandaloneComponent, AudioEmbedComponent, DocumentViewerComponent, DocumentEmbedComponent],
  entryComponents:[
    PlaylistEmbedComponent,
    AudioPlayerComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    VideosRoutingModule,
    AppPipesModule,
    NgMultiSelectDropDownModule,
    NgxSmartModalModule.forChild(),
    TextEditorModule,
    NgxQRCodeModule,
    NgxExtendedPdfViewerModule,
    DataTablesModule
  ],
  exports:[
    PlaylistEmbedComponent,
    AudioPlayerComponent,
    VideoplayerComponent,
    AudioEmbedComponent,
    DocumentEmbedComponent
  ]
})
export class VideosModule { }
