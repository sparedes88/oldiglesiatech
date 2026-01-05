import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FrameComponent } from './frame/frame.component';
import { DudaSettingsComponent } from './duda-settings/duda-settings.component';
import { SyncSiteRoutingModule } from './sync-site-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FrameSettingsComponent } from './frame-settings/frame-settings.component';
import { EventCalendarV2Module } from 'src/app/component/event-calendar-v2/event-calendar-v2.module';
import { GroupsEmbedModule } from 'src/app/component/groups-embed/groups-embed.module';
import { DonationsModule } from '../donations/donations.module';
import { ProfileArticlesDisplayModule } from 'src/app/component/profile-articles-display/profile-articles-display.module';
import { StyleEditorModule } from 'src/app/component/style-editor/style-editor.module';
import { TranslateModule } from '@ngx-translate/core';
import { ArticleModule } from '../article/article.module';
import { VideosModule } from '../videos/videos.module';
import { NetworksModule } from '../networks/networks.module';
import { MeetingsManagerModule } from 'src/app/component/meetings-manager/meetings-manager.module';
import { AddressManagerModule } from 'src/app/component/address-manager/address-manager.module';
import { MapModule } from 'src/app/component/map/map.module';
import { TextContainerModule } from 'src/app/component/text-container/text-container.module';
import { GalleryModule } from '../gallery/gallery.module';
import { StandaloneAccountLoginModule } from 'src/app/component/standalone-account-login/standalone-account-login.module';
import { CommunityBoxModule } from '../community-box/community-box.module';
import { MailingListModule } from '../mailing-list/mailing-list.module';

@NgModule({
  declarations: [FrameComponent, DudaSettingsComponent, FrameSettingsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SyncSiteRoutingModule,
    RouterModule,
    EventCalendarV2Module,
    GroupsEmbedModule,
    DonationsModule,
    ProfileArticlesDisplayModule,
    StyleEditorModule,
    TranslateModule,
    ArticleModule,
    VideosModule,
    NetworksModule,
    MeetingsManagerModule,
    MapModule,
    AddressManagerModule,
    TextContainerModule,
    GalleryModule,
    StandaloneAccountLoginModule,
    CommunityBoxModule,
    MailingListModule
  ],
  exports: [
    DudaSettingsComponent
  ]
})
export class SyncSiteModule { }
