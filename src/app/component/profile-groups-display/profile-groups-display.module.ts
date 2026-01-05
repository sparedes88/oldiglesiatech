import { GroupsEmbedModule } from './../groups-embed/groups-embed.module';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileGroupsDisplayComponent } from './profile-groups-display.component';

@NgModule({
  declarations: [
    ProfileGroupsDisplayComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    GroupsEmbedModule
  ],
  exports: [
    ProfileGroupsDisplayComponent
  ],
  entryComponents: [
    ProfileGroupsDisplayComponent
  ]
})
export class ProfileGroupsDisplayModule { }
