import { NgSelectModule } from '@ng-select/ng-select';
//import { TextEditorModule } from 'src/app/component/text-editor/text-editor.module';
import { AppPipesModule } from './../../../pipes/app-pipes/app-pipes.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotesRoutingModule } from './notes-routing.module';
import { NotesHomeComponent } from './notes-home/notes-home.component';
import { DataTablesModule } from 'angular-datatables';
import { NoteFormComponent } from './note-form/note-form.component';
import { AllNotesComponent } from './all-notes/all-notes.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule, MatFormFieldModule, MatIconModule, MatButtonModule, MatExpansionModule, MatSlideToggleModule } from '@angular/material';
import { MaterialFileInputModule } from 'ngx-material-file-input';
@NgModule({
  entryComponents: [NotesHomeComponent],
  declarations: [NotesHomeComponent, NoteFormComponent, AllNotesComponent],
  imports: [
    CommonModule,
    DataTablesModule,
    NotesRoutingModule,
    AppPipesModule,
    NgxSmartModalModule,
    FormsModule,
    NgSelectModule,
    MatSlideToggleModule,
    //TextEditorModule
  ],
  exports: [NotesHomeComponent]
})
export class NotesModule { }
