import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VersionsRoutingModule } from './versions-routing.module';
import { VersionsHomeComponent } from './versions-home/versions-home.component';
import { VersionFormComponent } from './version-form/version-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TextEditorModule } from 'src/app/component/text-editor/text-editor.module';
import { PackageFormComponent } from './package-form/package-form.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DataTablesModule } from 'angular-datatables';
import { VersionPanelManagerComponent } from './version-panel-manager/version-panel-manager.component';
import { NgxDropzoneModule } from 'ngx-dropzone';

@NgModule({
  declarations: [VersionsHomeComponent, VersionFormComponent, PackageFormComponent, VersionPanelManagerComponent],
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    VersionsRoutingModule,
    TextEditorModule,
    NgMultiSelectDropDownModule,
    DataTablesModule,
    NgxSmartModalModule.forChild(),
    NgxDropzoneModule
  ]
})
export class VersionsModule { }
