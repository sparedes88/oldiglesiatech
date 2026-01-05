import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { CommunityBoxRoutingModule } from "./community-box-routing.module";
import { ListComponent } from "./list/list.component";
import { DataTablesModule } from "angular-datatables";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxSmartModalModule } from "ngx-smart-modal";
import { DetailsComponent } from "./details/details.component";
import { ViewComponent } from "./view/view.component";
import { AppPipesModule } from 'src/app/pipes/app-pipes/app-pipes.module';
import { GooglePlacesModule } from 'src/app/component/google-places/google-places.module';
import { CategoriesComponent } from './categories/categories.component';
import { EntryComponent } from './entry/entry.component';
import { NgSelectModule } from "@ng-select/ng-select";
import { EntryGroupsComponent } from './entry-groups/entry-groups.component';
import { EntryGroupFormComponent } from './entry-group-form/entry-group-form.component';
import { MatCardModule, MatExpansionModule, MatIconModule } from "@angular/material";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { ListItemComponent } from './details/list-item/list-item.component';
import { ItemComponent } from './details/item/item.component';
import { CommunityContainerComponent } from './view/community-container/community-container.component';
import { NgxMaskModule } from "ngx-mask";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";

@NgModule({
  declarations: [ListComponent, DetailsComponent, ViewComponent, CategoriesComponent, EntryComponent, EntryGroupsComponent, EntryGroupFormComponent, ListItemComponent, ItemComponent, CommunityContainerComponent
  ],
  entryComponents: [ViewComponent, ListItemComponent, ItemComponent],
  imports: [
    CommonModule,
    CommunityBoxRoutingModule,
    DataTablesModule,
    FormsModule,
    ReactiveFormsModule,
    AppPipesModule,
    GooglePlacesModule,
    NgxSmartModalModule.forChild(),
    NgSelectModule,
    MatExpansionModule,
    MatIconModule,
    DragDropModule,
    MatCardModule,
    NgxMaskModule,
    NgMultiSelectDropDownModule
  ],
  exports: [ViewComponent, ListItemComponent],
})
export class CommunityBoxModule { }
