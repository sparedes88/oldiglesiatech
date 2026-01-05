import { TextEditorModule } from 'src/app/component/text-editor/text-editor.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WordpressRoutingModule } from './wordpress-routing.module';
import { WordpressComponent } from './wordpress.component';
import { PostFormComponent } from './post-form/post-form.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { MatIconModule, MatSnackBarModule, MatTabsModule } from '@angular/material';
import { SetupWordpressComponent } from './setup-wordpress/setup-wordpress.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { QuillModule } from 'ngx-quill';
import { PixieModule } from 'src/app/component/pixie/pixie.module';
import { FullscreenModalModule } from 'src/app/component/fullscreen-modal/fullscreen-modal.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { RouterModule } from '@angular/router';
import { PagesListComponent } from './pages-list/pages-list.component';
import { AppPipesModule } from 'src/app/pipes/app-pipes/app-pipes.module';
import {
  AggregateService,
  ColumnChooserService,
  ColumnMenuService,
  FilterService,
  GridModule,
  GroupService,
  PageService,
  PdfExportService,
  ResizeService,
  SortService,
  ToolbarService,

} from '@syncfusion/ej2-angular-grids';
@NgModule({
  declarations: [WordpressComponent, PostFormComponent, SetupWordpressComponent, PagesListComponent],
  imports: [
    CommonModule,
    RouterModule,
    WordpressRoutingModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    DataTablesModule,
    PixieModule,
    FullscreenModalModule,
    NgxSmartModalModule.forChild(),
    TextEditorModule,
    NgSelectModule,
    MatTabsModule,
    QuillModule.forRoot(),
    AppPipesModule,
    GridModule,
  ],
  providers: [
    SortService,
    FilterService,
    PageService,
    PdfExportService,
    ToolbarService,
    ColumnChooserService,
    ColumnMenuService,
    AggregateService,
    ResizeService,
    GroupService
  ]
})
export class WordpressModule { }
