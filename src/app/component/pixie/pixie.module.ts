import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PixieComponent } from "./pixie.component";
import { NgxSmartModalModule } from "ngx-smart-modal";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MatInputModule,
  MatFormFieldModule,
  MatButtonModule,
} from "@angular/material";

@NgModule({
  declarations: [PixieComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    NgxSmartModalModule.forChild(),
  ],
  exports: [PixieComponent],
})
export class PixieModule {}
