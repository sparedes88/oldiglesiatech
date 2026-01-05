import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatName'
})
export class FormatNamePipe implements PipeTransform {

  transform(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

}
