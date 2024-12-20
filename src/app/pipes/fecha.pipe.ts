import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
@Pipe({
  name: 'fechaCorta'
})
export class FechaPipe implements PipeTransform {

  // transform(value: firebase.default.firestore.Timestamp, formato: string, tipo: string): string {
  transform(value: any, formato: string, tipo: string): string {
    moment.locale('es');
    // console.log('value:', value);
    if (tipo === 'futuro') {
      // console.log('value.toDate():', value.toDate());
      return moment(value.toDate()).toNow().toString();
    } else if ( tipo === 'pasado') {
      // console.log('value.toDate():', value.toDate());
      return moment(value.toDate()).fromNow().toString();
    } else if ( tipo === 'pagos') {
      // console.log('moment(value).toDate():', moment(value).toDate());
      return moment(moment(value).toDate()).fromNow().toString();
    } else if ( formato ) {
      if (moment(value).isValid()) {
        return moment(value).format(formato).toString();
      } else {
        return moment(value.toDate()).format(formato).toString();
      }
    }
    return '';
  }

}
