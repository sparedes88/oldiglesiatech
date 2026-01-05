import { RouterModule } from '@angular/router';
import { GalleryModule } from './../../pages/gallery/gallery.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupsEmbedComponent } from './groups-embed.component';

@NgModule({
  declarations: [GroupsEmbedComponent],
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    GalleryModule,
    RouterModule
  ],
  exports: [GroupsEmbedComponent],
  entryComponents: [GroupsEmbedComponent]
})
export class GroupsEmbedModule { }
