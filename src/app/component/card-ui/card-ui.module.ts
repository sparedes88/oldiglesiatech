import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardUiComponent } from './card-ui.component';

@NgModule({
  declarations: [CardUiComponent],
  imports: [
    CommonModule
  ],
  entryComponents: [CardUiComponent],
  exports: [CardUiComponent]
})
export class CardUiModule { }
