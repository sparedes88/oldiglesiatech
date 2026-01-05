import { GalleryModule } from 'src/app/pages/gallery/gallery.module';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { PublicProfileRoutingModule } from "./public-profile-routing.module";
import { ProfileComponent } from "./profile/profile.component";
import { DirectoryComponent } from "./directory/directory.component";
import { DataTablesModule } from "angular-datatables";
import { BuilderComponent } from "./builder/builder.component";
import { TabFormComponent } from "./tab-form/tab-form.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxSmartModalModule } from "ngx-smart-modal";
import { SectionFormComponent } from "./section-form/section-form.component";
import { SectionComponent } from "./section/section.component";
import { AppPipesModule } from "src/app/pipes/app-pipes/app-pipes.module";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { TextEditorModule } from "src/app/component/text-editor/text-editor.module";
import { MatSnackBarModule } from "@angular/material";
import { HeaderComponent } from "./header/header.component";
import { SocialLinksFormComponent } from "./social-links-form/social-links-form.component";
import { HeaderStyleFormComponent } from "./header-style-form/header-style-form.component";
import { SectionColumnFormComponent } from "./section-column-form/section-column-form.component";
import { FooterEditorComponent } from "./footer-editor/footer-editor.component";
import { FooterComponent } from "./footer/footer.component";
import { NguCarouselModule } from "@ngu/carousel";
import { SliderEditorComponent } from "./slider-editor/slider-editor.component";
import { SlideItemComponent } from "./slide-item/slide-item.component";
import { SliderComponent } from "./slider/slider.component";

@NgModule({
  declarations: [
    ProfileComponent,
    DirectoryComponent,
    BuilderComponent,
    TabFormComponent,
    SectionFormComponent,
    SectionComponent,
    HeaderComponent,
    SocialLinksFormComponent,
    HeaderStyleFormComponent,
    SectionColumnFormComponent,
    FooterEditorComponent,
    FooterComponent,
    SliderEditorComponent,
    SlideItemComponent,
    SliderComponent,
  ],
  imports: [
    CommonModule,
    PublicProfileRoutingModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    AppPipesModule,
    DragDropModule,
    TextEditorModule,
    MatSnackBarModule,
    NgxSmartModalModule.forChild(),
    NguCarouselModule,
    GalleryModule
  ],
})
export class PublicProfileModule {}
