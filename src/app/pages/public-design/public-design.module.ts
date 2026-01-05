import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicDesignRoutingModule } from './public-design-routing.module';
import { PublicDesignHomeComponent } from './public-design-home/public-design-home.component';
import { PublicDesignFormComponent } from './public-design-form/public-design-form.component';
import { PublicDesignDetailComponent } from './public-design-detail/public-design-detail.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule, MatExpansionModule } from '@angular/material';
import { NgToggleModule } from '@nth-cloud/ng-toggle';
import { DataTablesModule } from 'angular-datatables';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { AppPipesModule } from 'src/app/pipes/app-pipes/app-pipes.module';
import { PublicDesignNoteFormComponent } from './public-design-note-form/public-design-note-form.component';
import { PublicDesignNoteDetailComponent } from './public-design-note-detail/public-design-note-detail.component';

@NgModule({
  declarations: [PublicDesignHomeComponent, PublicDesignFormComponent, PublicDesignDetailComponent, PublicDesignNoteFormComponent, PublicDesignNoteDetailComponent],
  imports: [
    CommonModule,
    PublicDesignRoutingModule,
    FormsModule,
    DataTablesModule,
    NgToggleModule,
    NgxSmartModalModule,
    MatIconModule,
    NgMultiSelectDropDownModule,
    MatExpansionModule,
    AppPipesModule
  ]
})
export class PublicDesignModule { }
