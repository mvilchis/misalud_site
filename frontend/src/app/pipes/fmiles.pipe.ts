import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fmiles'
})
export class fmilesPipe implements PipeTransform {
  transform(value: any): any {

    if (value > 9999 && value < 999999) {
      value = (value / 1000);
      return Math.trunc(value) + 'K';

    }
    else if (value > 999999) {
      value = (value / 1000000);
      return Math.trunc(value) + 'M';
    }
    else if (value < 9999 && value > 999) {
      const valor = value + '';

      return valor.substr(0, 1) + ',' + valor.substr(1);
    }
    else {
      return value;
    }


  }
}
