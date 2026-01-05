import { ArticleComponent } from "./pages/article/article/article.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./guards/guard";
import { HomeComponent } from "./pages/home/home.component";
import { LoginComponent } from "./login/login.component";
import { PasswordResetComponent } from "./pages/password-reset/password-reset.component";
import { AdminOnlyGuard } from "./guards/admin-only.guard";
import { SuperUserOnlyGuard } from "./guards/super-user-only.guard";
import { DetailsComponent } from "./pages/groups/details/details.component";
import { EventDetailsComponent } from "./pages/groups/event-details/event-details.component";
import { TestEmbedComponent } from "./pages/groups/test-embed/test-embed.component";
import { DonationsComponent } from './pages/donations/donations.component';
import { SearchOrganizationComponent } from "./pages/search-organization/search-organization.component";
const routes: Routes = [
  // {path: '', component: HomeComponent},
  { path: "", redirectTo: "/login", pathMatch: "full" },
  { path: "home", redirectTo: "/dashboard", canActivate: [AuthGuard] }, // AuthGuard save the session user login
  { path: "login", component: LoginComponent },
  {
    path: "contact",
    loadChildren: "./pages/contact/contact.module#ContactModule",
    canActivate: [AuthGuard, AdminOnlyGuard],
  },
  {
    path: "groups",
    loadChildren: "./pages/groups/groups.module#GroupsModule",
    canActivate: [AuthGuard, AdminOnlyGuard],
  },
  {
    path: "process",
    loadChildren: "./pages/process/process.module#ProcessModule",
    canActivate: [],
  },
  {
    path: "password_recovery/:token",
    component: PasswordResetComponent,
  },
  {
    path: "user-profile",
    loadChildren: "./pages/user-profile/user-profile.module#UserProfileModule",
    canActivate: [AuthGuard],
  },
  {
    path: "content",
    loadChildren: "./pages/content/content.module#ContentModule",
    canActivate: [AuthGuard, AdminOnlyGuard],
  },
  {
    path: "events",
    redirectTo: "groups",
    // loadChildren: './pages/events/events.module#EventsModule',
    // canActivate: [AuthGuard]
  },
  {
    path: "ministries",
    redirectTo: "groups",
    // loadChildren: './pages/ministries/ministries.module#MinistriesModule',
    // canActivate: [AuthGuard]
  },
  {
    path: "levels",
    loadChildren: "./pages/levels/levels.module#LevelsModule",
    canActivate: [AuthGuard],
  },
  {
    path: "admin",
    loadChildren: "./pages/superuser/superuser.module#SuperuserModule",
    canActivate: [AuthGuard, SuperUserOnlyGuard],
  },
  {
    path: "design-request",
    loadChildren:
      "./pages/public-design/public-design.module#PublicDesignModule",
    canActivate: [AuthGuard],
  },
  {
    path: "time-sheet",
    loadChildren:
      "./pages/public-time-sheet/public-time-sheet.module#PublicTimeSheetModule",
    canActivate: [AuthGuard],
  },
  {
    path: "salon",
    loadChildren: "./pages/salon/salon.module#SalonModule",
    canActivate: [AuthGuard, AdminOnlyGuard],
  },
  {
    path: "inventory",
    loadChildren: "./pages/inventario/inventario.module#InventarioModule",
    canActivate: [AuthGuard, AdminOnlyGuard],
  },
  {
    path: "report-pdf",
    loadChildren: "./pages/report-pdf/report-pdf.module#ReportPdfModule",
  },
  {
    path: "report-builder",
    loadChildren:
      "./pages/report-builder/report-builder.module#ReportBuilderModule",
    canActivate: [AuthGuard],
  },
  {
    path: "article/:id",
    component: ArticleComponent,
  },
  {
    path: "dashboard",
    loadChildren: "./pages/dashboard/dashboard.module#DashboardModule",
    canActivate: [AuthGuard, AdminOnlyGuard],
  },
  {
    path: "group/detail/:id",
    component: DetailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "group/events/detail/:id",
    component: EventDetailsComponent,
    canActivate: [],
  },
  {
    path: 'playlist',
    loadChildren: "./pages/videos/videos.module#VideosModule",
  },
  {
    path: "videos",
    loadChildren: "./pages/videos/videos.module#VideosModule",
    canActivate: [AuthGuard, AdminOnlyGuard],
  },
  {
    path: "wordpress",
    loadChildren: "./pages/wordpress/wordpress.module#WordpressModule",
    canActivate: [AuthGuard, AdminOnlyGuard],
  },
  {
    path: "playground",
    loadChildren: "./pages/playground/playground.module#PlaygroundModule",
    canActivate: [AuthGuard, AdminOnlyGuard],
  },
  {
    path: "messenger",
    loadChildren: "./pages/messenger/messenger.module#MessengerModule",
    canActivate: [AuthGuard],
  },
  {
    path: "register",
    loadChildren: "./pages/register/register.module#RegisterModule",
    canActivate: [],
  },
  {
    path: "search",
    component: SearchOrganizationComponent,
  },
  {
    path: "organizations",
    loadChildren:
      "./pages/public-profile/public-profile.module#PublicProfileModule",
    canActivate: [],
  },
  {
    path: "project-tracking",
    loadChildren:
      "./pages/project-tracking/project-tracking.module#ProjectTrackingModule",
    canActivate: [AuthGuard],
  },
  {
    path: "gallery",
    redirectTo: 'galleries'
  },
  {
    path: "galleries",
    loadChildren: "./pages/gallery/gallery.module#GalleryModule",
    canActivate: [AuthGuard],
  },
  {
    path: "booking",
    loadChildren: "./pages/booking/booking.module#BookingModule",
    canActivate: [AuthGuard],
  },
  {
    path: "community-box",
    loadChildren: "./pages/community-box/community-box.module#CommunityBoxModule",
    canActivate: [AuthGuard],
  },
  {
    path: 'mailing-list',
    redirectTo: 'contact-forms',
  },
  {
    path: 'contact-forms',
    loadChildren: './pages/mailing-list/mailing-list.module#MailingListModule'
  },
  {
    path: 'plans',
    loadChildren: './pages/plans/plans.module#PlansModule',
    canActivate: [AuthGuard, AdminOnlyGuard],
  },
  {
    path: 'organization-categories',
    loadChildren: './pages/organization-categories/organization-categories.module#OrganizationCategoriesModule',
    canActivate: [AuthGuard, AdminOnlyGuard],
  },
  {
    path: 'denominations',
    loadChildren: './pages/denominations/denominations.module#DenominationsModule',
    canActivate: [AuthGuard, AdminOnlyGuard],
  },
  {
    path: 'test-embed',
    component: TestEmbedComponent
  },
  {
    path: "donations",
    loadChildren: './pages/donations/donations.module#DonationsModule',
  },
  {
    path: 'billing',
    loadChildren: './pages/billing/billing.module#BillingModule',
  },
  {
    path: "document-builder",
    loadChildren: "./pages/document-builder/document-builder.module#DocumentBuilderModule",
    canActivate: [AuthGuard, AdminOnlyGuard],
  },
  {
    path: "organization-profile",
    loadChildren: "./pages/organization-profile/organization-profile.module#OrganizationProfileModule",
  },
  {
    path: "email-manager",
    loadChildren: "./pages/manage-emails/manage-emails.module#ManageEmailsModule",
  },
  {
    path: "network-manager",
    loadChildren: "./pages/networks/networks.module#NetworksModule"
  },
  {
    path: "ezlink-manager",
    loadChildren: "./pages/ezlink/ezlink.module#EzlinkModule"
  },
  {
    path: "ezlink",
    loadChildren: "./pages/ezlink/ezlink.module#EzlinkModule"
  },
  {
    path: 'disciple',
    redirectTo: 'discipler-builder'
  },
  {
    path: "discipler-builder",
    canActivate: [AuthGuard],
    loadChildren: "./pages/disciple/disciple.module#DiscipleModule"
  },
  {
    path: "sync-site",
    canActivate: [],
    loadChildren: "./pages/sync-site/sync-site.module#SyncSiteModule"
  },
  {
    path: "request-remove",
    canActivate: [],
    loadChildren: "./pages/remove-account/remove-account.module#RemoveAccountModule"
  },
  {
    path: "breeze-sync",
    loadChildren: "./pages/breeze/breeze.module#BreezeModule",
    canActivate: [AuthGuard, AdminOnlyGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
