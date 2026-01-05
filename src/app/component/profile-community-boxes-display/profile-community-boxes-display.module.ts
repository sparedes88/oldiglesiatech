import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileCommunityBoxesDisplayComponent } from './profile-community-boxes-display.component';
import { CommunityBoxModule } from './../../pages/community-box/community-box.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    ProfileCommunityBoxesDisplayComponent
  ],
  imports: [
    CommonModule,
    CommunityBoxModule,
    RouterModule
  ],
  exports: [
    ProfileCommunityBoxesDisplayComponent
  ],
  entryComponents: [
    ProfileCommunityBoxesDisplayComponent
  ]
})
export class ProfileCommunityBoxesDisplayModule { }
