import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeetingsManagerComponent } from './meetings-manager/meetings-manager.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatIconModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    MeetingsManagerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    MatIconModule,
    TranslateModule.forChild()
  ],
  entryComponents: [
    MeetingsManagerComponent
  ],
  exports: [
    MeetingsManagerComponent
  ]
})
export class MeetingsManagerModule { }
