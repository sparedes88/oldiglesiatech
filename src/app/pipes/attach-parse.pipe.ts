import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'attachParse'
})
export class AttachParsePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let inserted: string = this.insertItech(value)
    return this.urlfyText(inserted)
  }

  /**
   * 
   * @param value 
   */
  insertItech(value: string) {
    try {
      let text: string = value
      text = text.replace('[Attachments]', `<div><hr><b>Attachments</b></div>`)
      return text.replace(/public\/attachments\/iglesiaTech\//g, 'https://iglesia-tech-api.e2api.com/attachments/iglesiaTech/')
    } catch (err) {
      return value
    }
  }

  /**
   * Find any url and convert it to string
   * @param value 
   */
  urlfyText(value:string) {
    const exp = /(\b(https?|ftp|file|http):\/\/\b(iglesia-tech-api.e2api.com)\/(.*)\/(.*))/ig;
    // const exp2 = /(?:[^/][\d\w\.]+)$(?<=\.\w{3,10})/ig;
    return value.replace(exp, `<a href="$1" target="_blank" rel="noopener">$5</a><br>`);
  }

}
