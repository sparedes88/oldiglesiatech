import { DiscipleNoteDetailComponent } from './disciple-note-detail/disciple-note-detail.component';
import { DiscipleHomeComponent } from './disciple-home/disciple-home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DiscipleNoteCategoriesHomeComponent } from './disciple-note-categories-home/disciple-note-categories-home.component';
import { AdminOnlyGuard } from 'src/app/guards/admin-only.guard';

const routes: Routes = [
  {
    path: '',
    component: DiscipleHomeComponent
  },
  {
    path: ':idDiscipleDiscipler/notes',
    component: DiscipleNoteDetailComponent
  },
  {
    path: 'categories',
    component: DiscipleNoteCategoriesHomeComponent,
    canActivate: [AdminOnlyGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiscipleRoutingModule { }
