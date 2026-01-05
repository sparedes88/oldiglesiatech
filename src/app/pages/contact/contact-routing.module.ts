import { ShowAllUsersComponent } from './show-all-users/show-all-users.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContactComponent } from './contact.component';
import { MemberProfileComponent } from './member-profile/member-profile.component';
import { ImportComponent } from './import/import.component';
import { ContactCategoryComponent } from './contact-category/contact-category.component';
import { AdminOnlyGuard } from 'src/app/guards/admin-only.guard';

const routes: Routes = [
  {
    path: '',
    component: ContactComponent
  },
  {
    path: 'details/:id',
    component: MemberProfileComponent
  },
  {
    path: 'import',
    component: ImportComponent
  },
  {
    path: 'contact-categories',
    component: ContactCategoryComponent
  },
  {
    path: 'all-users',
    component: ShowAllUsersComponent,
    canActivate : [AdminOnlyGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContactRoutingModule { }
