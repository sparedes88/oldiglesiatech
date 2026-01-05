import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationCategoriesRoutingModule } from './organization-categories-routing.module';
import { OrganizationCategoryFormComponent } from './organization-category-form/organization-category-form.component';
import { OrganizationCategoriesHomeComponent } from './organization-categories-home/organization-categories-home.component';

@NgModule({
  declarations: [OrganizationCategoryFormComponent, OrganizationCategoriesHomeComponent],
  imports: [
    CommonModule,
    OrganizationCategoriesRoutingModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,

  ]
})
export class OrganizationCategoriesModule { }
