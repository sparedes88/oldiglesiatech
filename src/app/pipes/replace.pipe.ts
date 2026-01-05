import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'replace'
})
export class ReplacePipe implements PipeTransform {

  constructor(
    private translate_service: TranslateService
  ) {

  }

  transform(value: string, ...args: string[]): string {
    let numOfChunk = 2;
    console.log(value);
    console.log(args);

    let result = args.reduce((c, v, i, a) => i + numOfChunk <= a.length ? c.concat([a.slice(i, i + numOfChunk)]) : c, [])
    let message = value;
    result.forEach((array_of_arguments: string[]) => {
      if (array_of_arguments.length === 2) {
        message = message.replace(`\$\{${array_of_arguments[0]}\}`, this.translate_service.instant(array_of_arguments[1]));
      }
    });
    return message;
  }

}
