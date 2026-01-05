import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule, MatFormFieldModule, MatInputModule, MatTabsModule } from '@angular/material';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxMaskModule } from 'ngx-mask';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { OrganizationDisclaimerModule } from 'src/app/component/organization-disclaimer/organization-disclaimer.module';

import { GroupsModule } from '../groups/groups.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { PushNotificationComponent } from './push-notification/push-notification.component';
import { TodoFormComponent } from './todo-form/todo-form.component';
import { ResizableModule } from 'angular-resizable-element';
import { SkeletonModule } from 'src/app/component/skeleton/skeleton.module';
import { DonationsModule } from '../donations/donations.module';
import { SyncSiteModule } from '../sync-site/sync-site.module';

@NgModule({
  declarations: [
    DashboardComponent,
    PushNotificationComponent,
    TodoFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DashboardRoutingModule,
    // ContactModule,
    GroupsModule,
    // LevelsModule,
    NgxSmartModalModule.forChild(),
    NgMultiSelectDropDownModule,
    NgxQRCodeModule,
    MatTabsModule,
    NgxMaskModule.forChild(),
    MatInputModule,
    MatFormFieldModule,
    MatBadgeModule,
    // ProcessModule,
    // ChatModule,
    OrganizationDisclaimerModule,
    ResizableModule,
    SkeletonModule,
    DonationsModule,
    SyncSiteModule
  ]
})
export class DashboardModule { }
