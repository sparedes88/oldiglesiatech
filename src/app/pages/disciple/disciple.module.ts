import { RouterModule } from '@angular/router';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DiscipleRoutingModule } from './disciple-routing.module';
import { DiscipleHomeComponent } from './disciple-home/disciple-home.component';
import { DiscipleNoteDetailComponent } from './disciple-note-detail/disciple-note-detail.component';
import { DiscipleNoteFormComponent } from './disciple-note-form/disciple-note-form.component';
import { DiscipleNoteCategoriesHomeComponent } from './disciple-note-categories-home/disciple-note-categories-home.component';
import { DataTablesModule } from 'angular-datatables';
import { DiscipleNoteCategoryFormComponent } from './disciple-note-category-form/disciple-note-category-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApprovedDisciplerFormComponent } from './approved-discipler-form/approved-discipler-form.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DiscipleFormComponent } from './disciple-form/disciple-form.component';
import { QuillModule } from 'ngx-quill';
import { AppPipesModule } from 'src/app/pipes/app-pipes/app-pipes.module';

@NgModule({
  declarations: [DiscipleHomeComponent, DiscipleNoteDetailComponent, DiscipleNoteFormComponent, DiscipleNoteCategoriesHomeComponent, DiscipleNoteCategoryFormComponent, ApprovedDisciplerFormComponent, DiscipleFormComponent],
  imports: [
    CommonModule,
    DiscipleRoutingModule,
    DataTablesModule,
    NgxSmartModalModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgMultiSelectDropDownModule,
    QuillModule,
    AppPipesModule
  ]
})
export class DiscipleModule { }
