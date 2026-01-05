import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileGalleriesDisplayComponent } from './profile-galleries-display.component';
import { GalleryModule } from 'src/app/pages/gallery/gallery.module';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    ProfileGalleriesDisplayComponent
  ],
  imports: [
    CommonModule,
    GalleryModule,
    RouterModule
  ],
  exports: [
    ProfileGalleriesDisplayComponent
  ],
  entryComponents: [
    ProfileGalleriesDisplayComponent
  ]
})
export class ProfileGalleriesDisplayModule { }
