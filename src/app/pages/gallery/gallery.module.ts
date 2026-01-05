import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { GalleryRoutingModule } from "./gallery-routing.module";
import { GalleryFormComponent } from "./v1/gallery-form/gallery-form.component";
import { SamDragAndDropGridModule } from "@sam-1994/ngx-drag-and-drop-grid";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { GalleryListComponent } from "./v1/gallery-list/gallery-list.component";
import { NgxSmartModalModule } from "ngx-smart-modal";
import { DataTablesModule } from "angular-datatables";
import { GalleryComponent } from "./v1/gallery/gallery.component";
import { NgbCarouselModule } from "@ng-bootstrap/ng-bootstrap";
import { GalleryFormV2Component } from "./v2/gallery-form-v2/gallery-form-v2.component";
import { GalleryListV2Component } from "./v2/gallery-list-v2/gallery-list-v2.component";
import { GalleryV2Component } from "./v2/gallery-v2/gallery-v2.component";
import { AngularCropperjsModule } from 'angular-cropperjs';
import { NgxQRCodeModule } from "ngx-qrcode2";
import { GalleryAlbumViewComponent } from "./gallery-abum/gallery-album-view/gallery-album-view.component";
import { GalleryAlbumListComponent } from "./gallery-abum/gallery-album-list/gallery-album-list.component";
import { GalleryAlbumFormComponent } from "./gallery-abum/gallery-album-form/gallery-album-form.component";
import { GalleryHomeComponent } from "./gallery-home/gallery-home.component";
import { MatTabsModule } from "@angular/material";
@NgModule({
  declarations: [GalleryHomeComponent, GalleryFormComponent, GalleryListComponent, GalleryComponent, GalleryFormV2Component, GalleryListV2Component, GalleryV2Component,
  GalleryAlbumListComponent,
  GalleryAlbumFormComponent,
  GalleryAlbumViewComponent,
],
  entryComponents:[GalleryComponent, GalleryV2Component, GalleryAlbumViewComponent],
  imports: [
    CommonModule,
    GalleryRoutingModule,
    SamDragAndDropGridModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSmartModalModule.forChild(),
    DataTablesModule,
    NgbCarouselModule,
    AngularCropperjsModule,
    NgxQRCodeModule,
    MatTabsModule,
    DragDropModule
  ],
  exports: [GalleryComponent, GalleryV2Component, GalleryAlbumViewComponent],
})
export class GalleryModule {}
