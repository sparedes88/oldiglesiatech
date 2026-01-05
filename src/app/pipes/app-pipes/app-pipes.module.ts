import { ReplacePipe } from './../replace.pipe';
import { FormatNamePipe } from './../format-name.pipe';
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { EscapeHtmlPipe } from "./EscapeHtmlPipe";
import { AttachParsePipe } from "../attach-parse.pipe";
import { SafeUrlPipe } from "../safe-url.pipe";
import { TruncatePipe } from "../truncate.pipe";
import { SearchPipe } from "../search.pipe";
import { FilterPipe } from "../filter.pipe";

@NgModule({
  declarations: [EscapeHtmlPipe, AttachParsePipe, SafeUrlPipe, TruncatePipe, SearchPipe, FilterPipe, FormatNamePipe, ReplacePipe],
  imports: [CommonModule],
  exports: [EscapeHtmlPipe, AttachParsePipe, SafeUrlPipe, TruncatePipe, SearchPipe, FilterPipe, FormatNamePipe, ReplacePipe],
})
export class AppPipesModule {}
