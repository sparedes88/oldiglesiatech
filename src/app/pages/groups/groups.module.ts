import { EventsSettingListComponent } from './events-setting-list/events-settings-list.component';
import { EventCalendarModule } from './../../component/event-calendar/event-calendar.module';
import { GooglePlacesModule } from 'src/app/component/google-places/google-places.module';
import { PropertyBoxModule } from './../../component/property-box/property-box.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { MaskDirective, MaskService, NgxMaskModule } from 'ngx-mask';
import { ContactModule } from './../contact/contact.module';
import { TranslateModule } from "@ngx-translate/core";
import { NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";

import { GroupsRoutingModule } from "./groups-routing.module";
import { ListComponent } from "./list/list.component";
import { DetailsComponent } from "./details/details.component";
import { CategoriesComponent } from "./categories/categories.component";
import { CategoryDetailComponent } from "./category-detail/category-detail.component";
import { DataTablesModule } from "angular-datatables";
import { GroupFormComponent } from "./group-form/group-form.component";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";
import { NgxSmartModalModule } from "ngx-smart-modal";
import {
  MatInputModule,
  MatFormFieldModule,
  MatIconModule,
  MatTableModule,
  MatSlideToggleModule
} from "@angular/material";
import { MaterialFileInputModule } from "ngx-material-file-input";
import { GroupCategoryFormComponent } from "./group-category-form/group-category-form.component";
import { AddMembersFormComponent } from "./add-members-form/add-members-form.component";
import {
  CalendarCommonModule,
  CalendarMonthModule,
  CalendarWeekModule,
  CalendarDayModule
} from "angular-calendar";
import { GroupEventFormComponent } from "./group-event-form/group-event-form.component";
import { ViewEventActivitiesComponent } from './view-event-activities/view-event-activities.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ViewEventReviewsComponent } from './view-event-reviews/view-event-reviews.component';
import { ViewEventFinancesComponent } from './view-event-finances/view-event-finances.component';
import { ViewEventAttendanceComponent } from './view-event-attendance/view-event-attendance.component';
import { EventsListComponent } from './events-list/events-list.component';
import { TeamListComponent } from './team-list/team-list.component';
import { EventDetailsComponent } from './event-details/event-details.component';
import { SelectEventsComponent } from './select-events/select-events.component';
import { PixieModule } from 'src/app/component/pixie/pixie.module';
import { FullscreenModalModule } from 'src/app/component/fullscreen-modal/fullscreen-modal.module';
import { ViewGroupNotesComponent } from './view-group-notes/view-group-notes.component';
import { ViewGroupDocumentsComponent } from './view-group-documents/view-group-documents.component';
// import { GetStartedComponent } from './event-details/get-started/get-started.component';
// import { LoginPortalComponent } from './event-details/login-portal/login-portal.component';
import { HowManyPortalComponent } from './event-details/how-many-portal/how-many-portal.component';
import { ServiceRegistrationPortalComponent } from './event-details/service-registration-portal/service-registration-portal.component';
import { SuccessfulRegistrationComponent } from './event-details/successful-registration/successful-registration.component';
// import { CreateAccountPortalComponent } from './event-details/create-account-portal/create-account-portal.component';
import  {  NgxEmojiPickerModule  }  from  'ngx-emoji-picker';
import { TestEmbedComponent } from './test-embed/test-embed.component';
import { NgAudioRecorderService } from 'ng-audio-recorder';
import { GroupEventSettingFormComponent } from './group-event-setting-form/group-event-setting-form.component';
import { StandaloneAccountLoginModule } from 'src/app/component/standalone-account-login/standalone-account-login.module';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { GroupsReportModule } from '../groups-report/groups-report.module';
import { GroupEventSettingFormV2Component } from './group-event-setting-form-v2/group-event-setting-form-v2.component';
import { EventDesignRequestComponent } from './event-design-request/event-design-request.component';
@NgModule({
  declarations: [
    ListComponent,
    DetailsComponent,
    CategoriesComponent,
    CategoryDetailComponent,
    GroupFormComponent,
    GroupCategoryFormComponent,
    AddMembersFormComponent,
    GroupEventFormComponent,
    GroupEventSettingFormComponent,
    GroupEventSettingFormV2Component,
    ViewEventActivitiesComponent,
    ViewEventReviewsComponent,
    ViewEventFinancesComponent,
    ViewEventAttendanceComponent,
    EventsListComponent,
    EventsSettingListComponent,
    TeamListComponent,
    EventDetailsComponent,
    SelectEventsComponent,
    ViewGroupNotesComponent,
    ViewGroupDocumentsComponent,
    // GetStartedComponent,
    // LoginPortalComponent,
    HowManyPortalComponent,
    ServiceRegistrationPortalComponent,
    SuccessfulRegistrationComponent,
    // CreateAccountPortalComponent,
    TestEmbedComponent,
    EventDesignRequestComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    GroupsRoutingModule,
    DataTablesModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MaterialFileInputModule,
    MatIconModule,
    NgxSmartModalModule.forChild(),
    NgMultiSelectDropDownModule.forRoot(),
    CalendarCommonModule,
    CalendarMonthModule,
    CalendarWeekModule,
    CalendarDayModule,
    TranslateModule,
    ContactModule,
    MatTableModule,
    DragDropModule,
    MatSlideToggleModule,
    PixieModule,
    FullscreenModalModule,
    NgxMaskModule.forChild(),
    NgxEmojiPickerModule,
    NgSelectModule,
    PropertyBoxModule,
    GooglePlacesModule,
    EventCalendarModule,
    StandaloneAccountLoginModule,
    NgxQRCodeModule,
    GroupsReportModule
  ],
  providers: [DatePipe, MaskDirective, MaskService,
    NgAudioRecorderService
  ],
  exports: [ListComponent, GroupFormComponent, SelectEventsComponent],
  entryComponents: [
    EventsSettingListComponent
  ]
})
export class GroupsModule {}
