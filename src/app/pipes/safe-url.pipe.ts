import { Pipe, PipeTransform, SecurityContext } from "@angular/core";
import {
  SafeHtml,
  SafeStyle,
  SafeScript,
  SafeUrl,
  SafeResourceUrl,
  DomSanitizer,
} from "@angular/platform-browser";

@Pipe({
  name: "safe",
})
export class SafeUrlPipe implements PipeTransform {
  constructor(protected sanitizer: DomSanitizer) {}

  public transform(
    value: any,
    type: string
  ): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl | string {
    switch (type) {
      case "html":
        return this.sanitizer.bypassSecurityTrustHtml(value);
      case "style":
        return this.sanitizer.bypassSecurityTrustStyle(value);
      case "script":
        return this.sanitizer.bypassSecurityTrustScript(value);
      case "url":
        return this.sanitizer.bypassSecurityTrustUrl(value);
      case "resourceUrl":
        return this.sanitizer.bypassSecurityTrustResourceUrl(value);
      case "text":
        return this.sanitizer.sanitize(SecurityContext.HTML, value);
      default:
        throw new Error(`Invalid safe type specified: ${type}`);
    }
  }
}
