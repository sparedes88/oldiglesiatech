import { AuthGuard } from './../../guards/guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SuperUserOnlyGuard } from 'src/app/guards/super-user-only.guard';

const routes: Routes = [
  {
    path: 'design-request',
    loadChildren: './design-request/admin-design-request.module#AdminDesignRequestModule',
    canActivate: [AuthGuard, SuperUserOnlyGuard]
  },
  {
    path: 'timesheet',
    loadChildren: './time-sheet/time-sheet.module#TimeSheetModule',
    canActivate: [AuthGuard, SuperUserOnlyGuard]
  },
  {
    path: 'organization',
    loadChildren: './organization/organization.module#OrganizationModule',
    canActivate: [AuthGuard, SuperUserOnlyGuard]
  },
  {
    path: 'notes',
    loadChildren: './notes/notes.module#NotesModule',
    canActivate: [AuthGuard, SuperUserOnlyGuard]
  },
  {
    path: 'pipeline',
    loadChildren: './pipeline/pipeline.module#PipelineModule',
    canActivate: [AuthGuard, SuperUserOnlyGuard]
  },
  {
    path: 'contacts',
    loadChildren: './contacts/contacts.module#ContactsModule',
    canActivate: [AuthGuard, SuperUserOnlyGuard]
  },
  {
    path: 'help-request',
    loadChildren: './help-request/help-request.module#HelpRequestModule',
    canActivate: [AuthGuard, SuperUserOnlyGuard]
  },
  {
    path: 'versions',
    loadChildren: '.././versions/versions.module#VersionsModule',
    canActivate: [AuthGuard, SuperUserOnlyGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperuserRoutingModule { }
