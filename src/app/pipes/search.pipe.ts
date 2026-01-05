import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash/fp';
@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(items, searchTerm) {
    if (searchTerm) {
      let newSearchTerm = !isNaN(searchTerm) ? searchTerm.toString() : searchTerm.toString().toUpperCase(); return items.filter(item => {
        return this.lookForNestedObject(item, newSearchTerm);
      })
    }
    else { return items; }
  }
  lookForNestedObject(item, newSearchTerm) {
    let origItem = { ...item };
    let that = this;
    let count = 0;
    parseNestedObject(item);
    function parseNestedObject(item) {
      for (let key in item) {
        if (_.isPlainObject(item[key])) {
          if (origItem[key]) { delete origItem[key] }
          parseNestedObject(item[key]);
        }
        else if (Array.isArray(item[key])) {
          if (origItem[key]) { delete origItem[key] }
          parseNestedObject(item[key]);
        }
        else {
          count++;
          if (origItem[key]) { delete origItem[key] }
          origItem[key + count] = item[key];
        }
      }
    }
    return that.search(item, origItem, newSearchTerm);
  }
  search(item, origItem, newSearchTerm) {
    let filteredList = [];
    let prop = "";
    for (let koy in origItem) {
      prop = isNaN(origItem[koy]) ? origItem[koy].toString().toUpperCase() : origItem[koy].toString(); if (prop.indexOf(newSearchTerm) > -1) {
        filteredList.push(item);
        return filteredList;
      }
    }
  }

}
