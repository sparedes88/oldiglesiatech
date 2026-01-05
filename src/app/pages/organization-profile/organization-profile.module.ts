import { EventCalendarV2Module } from './../../component/event-calendar-v2/event-calendar-v2.module';
import { ContactInfoModule } from './../../component/contact-info/contact-info.module';
import { NetworksModule } from './../networks/networks.module';
import { CustomIconPickerModule } from './../../component/icon-picker/custom-icon-picker.module';
import { ProfileCommunityBoxesDisplayModule } from './../../component/profile-community-boxes-display/profile-community-boxes-display.module';
import { ProfileContactInboxDisplayModule } from './../../component/profile-contact-inbox-display/profile-contact-inbox-display.module';
import { ArticleFormModule } from './../content/article-form/article-form.module';
import { ArticleModule } from './../article/article.module';
import { MapModule } from './../../component/map/map.module';
import { GroupsEmbedModule } from './../../component/groups-embed/groups-embed.module';
import { GalleryModule } from 'src/app/pages/gallery/gallery.module';
import { RegisterModule } from './../register/register.module';
import { OrganizationProfileComponent } from './organization-profile.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationProfileRoutingModule } from './organization-profile-routing.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatInputModule, MatFormFieldModule, MatIconModule, MatButtonModule, MatExpansionModule, MatSlideToggleModule, MatCheckboxModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { NgToggleModule } from '@nth-cloud/ng-toggle';
import { DropDownListAllModule } from '@syncfusion/ej2-angular-dropdowns';
import { GridModule } from '@syncfusion/ej2-angular-grids';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxMaskModule } from 'ngx-mask';
import { MaterialFileInputModule } from 'ngx-material-file-input';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { AppPipesModule } from 'src/app/pipes/app-pipes/app-pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { PropertyBoxModule } from 'src/app/component/property-box/property-box.module';
import { QuillModule } from 'ngx-quill';
import { DonationsModule } from '../donations/donations.module';
import { GooglePlacesModule } from 'src/app/component/google-places/google-places.module';
import { ProfileArticlesDisplayModule } from 'src/app/component/profile-articles-display/profile-articles-display.module';
import { EventCalendarModule } from 'src/app/component/event-calendar/event-calendar.module';
import { CategoriesModule } from '../content/categories/categories.module';
import { ProfileGalleriesDisplayModule } from 'src/app/component/profile-galleries-display/profile-galleries-display.module';
import { DetailCustomComponentComponent } from './detail-custom-component/detail-custom-component.component';
import { StandaloneAccountLoginModule } from 'src/app/component/standalone-account-login/standalone-account-login.module';
import { ProfilePlaylistsDisplayModule } from 'src/app/component/profile-playlists-display/profile-playlists-display.module';
import { MatSelectCountryModule } from '@angular-material-extensions/select-country';
import { HttpClientModule } from '@angular/common/http';
import { SectionContainerComponent } from './section-container/section-container.component';
import { OrganizationContactSectionComponent } from './organization-contact-section/organization-contact-section.component';
import { SectionItemComponent } from './section-item/section-item.component';
import { ProfileEventsComponent } from './profile-events/profile-events.component';
import { HomeBannerSlideComponent } from './home-banner-slide/home-banner-slide.component';
import { ResizableModule } from 'angular-resizable-element';
import { ProfileItemsDisplayModule } from 'src/app/component/profile-items-display/profile-items-display.module';
import { TextEditorModule } from 'src/app/component/text-editor/text-editor.module';
import { FooterSectionComponent } from './footer-section/footer-section.component';
import { ProfileGroupsDisplayModule } from 'src/app/component/profile-groups-display/profile-groups-display.module';
import { ProfileTextButtonModule } from 'src/app/component/profile-text-button/profile-text-button.module';
import { MeetingsManagerModule } from 'src/app/component/meetings-manager/meetings-manager.module';
import { AddressManagerModule } from 'src/app/component/address-manager/address-manager.module';
import { TextContainerModule } from 'src/app/component/text-container/text-container.module';
@NgModule({
  declarations: [OrganizationProfileComponent, DetailCustomComponentComponent, SectionContainerComponent, OrganizationContactSectionComponent, SectionItemComponent, ProfileEventsComponent, HomeBannerSlideComponent, FooterSectionComponent],
  imports: [
    CommonModule,
    OrganizationProfileRoutingModule,
    MatInputModule,
    MatFormFieldModule,
    MaterialFileInputModule,
    MatIconModule,
    MatButtonModule,
    MatIconModule,
    DragDropModule,
    FormsModule,
    NgMultiSelectDropDownModule,
    NgxSmartModalModule.forChild(),
    NgToggleModule,
    NgxMaskModule.forChild(),
    MatExpansionModule,
    MatSlideToggleModule,
    AppPipesModule,
    TranslateModule.forChild(),
    GridModule,
    DropDownListAllModule,
    DataTablesModule,
    PropertyBoxModule,
    RegisterModule,
    DonationsModule,
    ReactiveFormsModule,
    GalleryModule,
    QuillModule.forRoot(),
    GroupsEmbedModule,
    GooglePlacesModule,
    MapModule,
    ProfileArticlesDisplayModule,
    ArticleModule,
    ArticleFormModule,
    EventCalendarModule,
    CategoriesModule,
    ProfileGalleriesDisplayModule,
    ProfileItemsDisplayModule,
    ProfileContactInboxDisplayModule,
    StandaloneAccountLoginModule,
    ProfileCommunityBoxesDisplayModule,
    ProfilePlaylistsDisplayModule,
    MatSelectCountryModule,
    HttpClientModule,
    CustomIconPickerModule,
    NetworksModule,
    ContactInfoModule,
    MatCheckboxModule,
    EventCalendarV2Module,
    ResizableModule,
    TextEditorModule,
    ProfileGroupsDisplayModule,
    ProfileTextButtonModule,
    MeetingsManagerModule,
    AddressManagerModule,
    TextContainerModule
  ],
  entryComponents: [
    DetailCustomComponentComponent,
    HomeBannerSlideComponent,
    FooterSectionComponent
  ]
})
export class OrganizationProfileModule { }
