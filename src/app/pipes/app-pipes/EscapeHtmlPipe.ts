
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'keepHtml', pure: false })
export class EscapeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
  }

  transform(content: string) {
    let content_fixed;
    if (content) {
      content_fixed = content.replace(/&lt;/gm, '<').replace(/&gt;/gm, '>');
    } else {
      content_fixed = content;
    }
    return this.sanitizer.bypassSecurityTrustHtml(content_fixed);
  }
}
