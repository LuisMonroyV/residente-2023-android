import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';
@Pipe({
  name: 'fechaCorta'
})
export class FechaPipe implements PipeTransform {

  transform(value: any, formato: string, tipo: string): string {
    moment.locale('es');
    if (value) {    
      if (tipo === 'futuro') {
        if (value.seconds) {  // es timestamp
          return moment(value.toDate()).toNow().toString();
        } else {
          return moment(value).toNow().toString();
        }
      } else if ( tipo === 'pasado') {
        if (value.seconds) {  // es timestamp
          return moment(value.toDate()).fromNow().toString();
        } else {
          return moment(value).fromNow().toString();
        }
      } else if ( tipo === 'pagos') {
        if (value.seconds) {  // es timestamp
          return moment(value.toDate()).fromNow().toString();
        } else {
          return moment(value).fromNow().toString();
        }
      } else if ( formato ) {
        if (value.seconds) {  // es timestamp
          return moment(value.toDate()).format(formato).toString();
        } else {
          return moment(value).format(formato).toString();
        }
      }
    } else {
      return '';
    }
  }
}
