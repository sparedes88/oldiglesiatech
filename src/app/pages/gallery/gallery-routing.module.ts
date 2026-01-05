import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { GalleryFormV2Component } from "./v2/gallery-form-v2/gallery-form-v2.component";
import { GalleryV2Component } from "./v2/gallery-v2/gallery-v2.component";
import { GalleryListV2Component } from "./v2/gallery-list-v2/gallery-list-v2.component";
import { GalleryHomeComponent } from "./gallery-home/gallery-home.component";
import { GalleryAlbumViewComponent } from "./gallery-abum/gallery-album-view/gallery-album-view.component";
import { GalleryAlbumFormComponent } from "./gallery-abum/gallery-album-form/gallery-album-form.component";

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'list',
    redirectTo: 'home?tab=galleries',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: GalleryHomeComponent
  },
  {
    path: "v2/create",
    component: GalleryFormV2Component,
  },
  {
    path: "v2/edit/:id",
    component: GalleryFormV2Component,
  },
  {
    path: "v2/details/:idGallery",
    component: GalleryV2Component,
  },
  {
    path: "albums/create",
    component: GalleryAlbumFormComponent,
  },
  {
    path: "albums/edit/:id",
    component: GalleryAlbumFormComponent,
  },
  {
    path: "albums/details/:id",
    component: GalleryAlbumViewComponent,
  },
  {
    path: "list",
    component: GalleryListV2Component,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GalleryRoutingModule {}
