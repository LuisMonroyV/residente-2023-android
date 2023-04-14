import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'versionApp'
})
export class VersionAppPipe implements PipeTransform {

  transform(value: string): string {
    // eslint-disable-next-line max-len
    return (Number(value.toString().substring(0, 1)) + '.' + Number(value.toString().substring(1, 2)) + '.' + Number(value.toString().substring(3)));
  }

}
