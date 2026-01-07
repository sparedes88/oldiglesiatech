import { MessengerModule } from './pages/messenger/messenger.module';
import { ArticleFormModule } from './pages/content/article-form/article-form.module';
import { AppPipesModule } from 'src/app/pipes/app-pipes/app-pipes.module';
import { DonationsModule } from './pages/donations/donations.module';
import { WordpressModule } from './pages/wordpress/wordpress.module';
import { ArticleModule } from './pages/article/article.module';
import { Observable } from 'rxjs';
import { ToastrModule } from 'ngx-toastr';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { AppComponent } from './app.component';
import { MenuComponent } from './component/menu/menu.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FooterComponent } from './component/footer/footer.component';
import { DataTablesModule } from 'angular-datatables';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './login/login.component';
import { PasswordResetComponent } from './pages/password-reset/password-reset.component';
import { NoopAnimationsModule, BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { MatSnackBarModule } from '@angular/material';
import { PushNotificationComponent } from './component/push-notification/push-notification.component';
import { TranslateTempDirective } from './translate-temp.directive';
import { OrganizationService } from './services/organization/organization.service';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgToggleModule } from '@nth-cloud/ng-toggle';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/moment';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
const config: SocketIoConfig = { url: environment.socket_server, options: {} };
// const config: SocketIoConfig = { url: 'http://192.168.1.64/', options: {} };
import * as moment from 'moment';
import { NgxMaskModule } from 'ngx-mask';
import { GroupsModule } from './pages/groups/groups.module';
import { VideosModule } from './pages/videos/videos.module';

import { SocialLoginModule, AuthServiceConfig, LoginOpt } from "angularx-social-login";
import { FacebookLoginProvider } from "angularx-social-login";
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { RegisterModule } from './pages/register/register.module';
import { ChatModule } from './component/chat/chat.module';
import { BookingModule } from './pages/booking/booking.module';
// import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { environment } from '../environments/environment';
import { TextEditorModule } from './component/text-editor/text-editor.module';
import { NotesModule } from './pages/superuser/notes/notes.module';
import { ContactsModule } from './pages/superuser/contacts/contacts.module';
import { ProcessModule } from './pages/process/process.module';
import { LevelsModule } from './pages/levels/levels.module';
import { ContactModule } from './pages/contact/contact.module';
//import { AppPipesModule } from './pipes/app-pipes/app-pipes.module';
//import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';
import { ProjectTrackingModule } from './pages/project-tracking/project-tracking.module';
import { QuillModule } from 'ngx-quill';
import { NguCarouselModule } from '@ngu/carousel';
import { GalleryModule } from './pages/gallery/gallery.module';
import { CommunityBoxModule } from './pages/community-box/community-box.module';
import { DocumentBuilderModule } from './pages/document-builder/document-builder.module';
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CategoriesModule } from './pages/content/categories/categories.module';
import { SearchOrganizationComponent } from './pages/search-organization/search-organization.component';
import { ManageEmailsModule } from './pages/manage-emails/manage-emails.module';
//import { SearchPipe } from './pipes/search.pipe';
//import { HtmlEditorService, ToolbarService, QuickToolbarService, ImageService, LinkService, CountService } from '@syncfusion/ej2-angular-richtexteditor';
//import { CommonModule } from '@angular/common';
//import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
//import { SamDragAndDropGridModule } from '@sam-1994/ngx-drag-and-drop-grid';
import { MatSelectCountryModule } from "@angular-material-extensions/select-country";
import { IconPickerModule } from 'ngx-icon-picker';
import { NetworksModule } from './pages/networks/networks.module';
import { DragAndDropManagerService } from './pages/community-box/details/item/drag-and-drop-manager.service';
import { DragAndDropManagerDirective, DragAndDropManagerRootDirective } from './pages/community-box/details/item/drag-and-drop-manager.directive';
import { DiscipleModule } from './pages/disciple/disciple.module';
import { ResizableModule } from 'angular-resizable-element';
import { VersionsModule } from './pages/versions/versions.module';
import { GroupsReportModule } from './pages/groups-report/groups-report.module';
import { BillingModule } from './pages/billing/billing.module';
import { EventsModule } from './pages/events/events.module';
import { SyncSiteModule } from './pages/sync-site/sync-site.module';
import { MailingListModule } from './pages/mailing-list/mailing-list.module';
import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';

const fbLoginOptions: LoginOpt = {
  scope: 'id,first_name,last_name,email',
  return_scopes: true,
  enable_profile_selector: true
}

const loginConfig = new AuthServiceConfig([
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider("3117419608270269")
  }
]);

export function provideConfig() {
  return loginConfig;
}

export function momentAdapterFactory() {
  return adapterFactory(moment);
}

@Injectable()
export class CustomTranslateLoader implements TranslateLoader {
  contentHeader = new Headers({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });

  constructor(private http: HttpClient, private organizationService: OrganizationService) { }
  getTranslation(lang: string): Observable<any> {
    // var apiAddress = AppConfig.API_URL + "/static/i18n/" + lang + ".json";
    return Observable.create(observer => {
      this.organizationService.getTranslateFile(lang)
        .subscribe((res: any) => {
          if (res.msg) {

            if (res.msg.Code === 200 && res.null || res.msg.Code === 500) {
              this.getTranslation(lang).subscribe((res_) => {
                observer.next(res_);
                observer.complete();
              }
              );
            } else {
              observer.next(res);
              observer.complete();
            }
          } else {
            this.http.get('./assets/i18n/es.json').subscribe((res: Response) => {
              observer.next(res);
              observer.complete();
            });
          }
        }, err => {
          console.log(err);
          this.http.get('./assets/i18n/es.json').subscribe((res: Response) => {
            observer.next(res);
            observer.complete();
          });
        });
    });
  }
}

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent,
    PasswordResetComponent,
    PushNotificationComponent,
    TranslateTempDirective,
    SearchOrganizationComponent,
    //SearchPipe,
    DragAndDropManagerDirective,
    DragAndDropManagerRootDirective,
    PrivacyPolicyComponent
  ],
  imports: [
    BrowserModule,
    NgMultiSelectDropDownModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    DataTablesModule,
    ReactiveFormsModule,
    NoopAnimationsModule,
    MatSnackBarModule,
    DragDropModule,
    NgxSmartModalModule.forRoot(),
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-center',
      preventDuplicates: true,
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslateLoader,
        deps: [HttpClient, OrganizationService]
      }
    }),
    NgToggleModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: momentAdapterFactory }),
    SocketIoModule.forRoot(config),
    ArticleModule,
    ArticleFormModule,
    GroupsModule,
    VideosModule,
    SocialLoginModule,
    NgxMaskModule.forRoot(),
    NgxQRCodeModule.forRoot(),
    ChatModule,
    CalendarModule,
    BookingModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    // AngularFireMessagingModule, // Temporarily disabled due to webpack dynamic import issue
    AngularFireModule.initializeApp(environment.firebase),
    //RichTextEditorAllModule,//Importando cualquiera de estos 3, se produce el error
    NotesModule,//Pero no se puede acceder a OrganizationsModule a menos que se importe
    TextEditorModule,//NotesModule y se comenten los tags
    ContactsModule,
    LevelsModule,
    ContactModule,
    ProcessModule,
    ProjectTrackingModule,
    //Select2Module,
    ContactsModule,
    QuillModule.forRoot(),
    NguCarouselModule,
    GalleryModule,
    CommunityBoxModule,
    WordpressModule,
    DocumentBuilderModule,
    PDFExportModule,
    CategoriesModule,
    DonationsModule,
    RegisterModule,
    AppPipesModule,
    ManageEmailsModule,
    //NgMultiSelectDropDownModule,
    //DesignRequestModule,
    // Listen all actions in the url
    MatSelectCountryModule.forRoot('en'),
    IconPickerModule,
    NetworksModule,
    DiscipleModule,
    ResizableModule,
    VersionsModule,
    GroupsReportModule,
    BillingModule,
    MessengerModule,
    EventsModule,
    SyncSiteModule,
    MailingListModule
  ],
  providers: [
    TranslateService,
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    },
    DragAndDropManagerService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
