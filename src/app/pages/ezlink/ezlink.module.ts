import { NgxSmartModalModule } from 'ngx-smart-modal';
import { MatSlideToggleModule } from '@angular/material';
import { EzlinkRoutingModule } from './ezlink-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EzlinkHomeComponent } from './ezlink-home/ezlink-home.component';
import { EzlinkPreviewComponent } from './ezlink-preview/ezlink-preview.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NetworksModule } from '../networks/networks.module';
import { NgxQRCodeModule } from 'ngx-qrcode2';

@NgModule({
  declarations: [EzlinkHomeComponent, EzlinkPreviewComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    EzlinkRoutingModule,
    MatSlideToggleModule,
    NgxSmartModalModule,
    DragDropModule,
    NetworksModule,
    NgxQRCodeModule
  ]
})
export class EzlinkModule { }
