import { Pipe, PipeTransform } from '@angular/core';
import { Persona } from '../interfaces/fb-interface';

@Pipe({
  name: 'filtroUsuarios'
})
export class FiltroUsuariosPipe implements PipeTransform {

  transform(arreglo: Persona[], texto: string): Persona[] {
    if (!texto || texto.length < 4 || !arreglo || arreglo.length === 0) {
      return arreglo;
    } else {
      texto = texto.toLowerCase();
      return arreglo.filter( text => {
        const dataUsuario = `${text.nombres}${text.apellidoPaterno}${text.apellidoMaterno}${text.calle}${text.numero}${text.movil}`;
        return (dataUsuario.toLowerCase()).includes(texto);
      });
    }
  }
}
