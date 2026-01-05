import { NgxSmartModalModule } from 'ngx-smart-modal';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material';
import { DataTablesModule } from 'angular-datatables';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentBuilderRoutingModule } from './document-builder-routing.module';
import { DocumentBuilderHomeComponent } from './document-builder-home/document-builder-home.component';
import { DocumentBuilderFormComponent } from './document-builder-form/document-builder-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DocumentBuilderPreviewComponent } from './document-builder-preview/document-builder-preview.component';
import { DocumentParagraphComponent } from './document-paragraph/document-paragraph.component';
import { MatButtonToggleModule } from '@angular/material';
import { DocumentParagraphDraglistComponent } from './document-paragraph-draglist/document-paragraph-draglist.component';
import { TextEditorModule } from 'src/app/component/text-editor/text-editor.module';
import { AppPipesModule } from 'src/app/pipes/app-pipes/app-pipes.module';
import { PDFExportModule } from "@progress/kendo-angular-pdf-export";

@NgModule({
  declarations: [DocumentBuilderHomeComponent, DocumentBuilderFormComponent, DocumentBuilderPreviewComponent, DocumentParagraphComponent, DocumentParagraphDraglistComponent],
  imports: [
    CommonModule,
    DocumentBuilderRoutingModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
    MatIconModule,
    DragDropModule,
    NgxSmartModalModule,
    TextEditorModule,
    AppPipesModule,
    PDFExportModule
  ]
})
export class DocumentBuilderModule { }
