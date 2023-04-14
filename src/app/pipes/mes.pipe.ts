import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'mes'
})
export class MesPipe implements PipeTransform {

  transform(value: any): any {
    moment.locale('es');
    let mes: any;
    let newMes = '';
    if (value < 10) {
      newMes = '0' + value;
      // console.log({newMes});
      mes = moment(`2020-${newMes}-01`).format('MMMM');
    } else {
      mes = moment(`2020-${value}-01`).format('MMMM');
    }
    // console.log({mes});
    return mes.charAt(0).toUpperCase() + mes.slice(1);
  }

}
