import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PlaygroundRoutingModule } from './playground-routing.module';
import { PlaygroundComponent } from './playground.component';
import { PixieModule } from 'src/app/component/pixie/pixie.module';
import { ChatModule } from 'src/app/component/chat/chat.module';

@NgModule({
  declarations: [PlaygroundComponent],
  imports: [
    CommonModule,
    PlaygroundRoutingModule,
    PixieModule,
    ChatModule
  ]
})
export class PlaygroundModule { }
