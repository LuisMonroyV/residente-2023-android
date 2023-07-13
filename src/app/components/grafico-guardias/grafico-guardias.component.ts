import { Component, OnInit, Input } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-grafico-guardias',
  templateUrl: './grafico-guardias.component.html',
  styleUrls: ['./grafico-guardias.component.scss'],
})
export class GraficoGuardiasComponent implements OnInit {
  @Input() ano: number;
  @Input() mes: number;
  legendPos: any = {
    right: 'right',
    below: 'below'
  };

  legend = true;
  legendPosition = this.legendPos.below;
  legendTitle = 'Guardias';
  label = 'Total de Registros';
  gradient = true;
  isDoughnut = false;
  segment = 'torta';
  showLabels = false;
  showLegend = false;
  showXAxis = true;
  showYAxis = true;
  showXAxisLabel = true;
  single: any[] = [];
  xAxisLabel = '';
  showYAxisLabel = true;
  yAxisLabel = '# Registros';
  view: any[] = [300, 350];

  // eslint-disable-next-line max-len
  colores = ['nightLights','vivid', 'natural', 'cool', 'fire', 'solar', 'air', 'aqua', 'flame', 'ocean', 'forest', 'horizon', 'neons', 'picnic', 'night'];
  numScheme = 0;
  colorScheme = 'nightLights';

  constructor( private fbSrvc: FirebaseService) {
  }
  changeScheme() {
    console.log('changeScheme()');
    if (this.numScheme === 14) {
      this.numScheme = 0;
    } else {
      this.numScheme++;
    }
    this.colorScheme = this.colores[this.numScheme];
  }
  ngOnInit() {
    const pos = this.fbSrvc.estadisticas.findIndex( est => est.ano === this.ano && est.mes === this.mes);
    // console.log('pos: ', this.fbSrvc.estadisticas[pos].calles);
    if (pos >= 0) {
      this.single = [];
      for (const x of this.fbSrvc.estadisticas[pos].guardias) {
        const obj = {
          name: x.nombre.substring(0, x.nombre.indexOf(' ')),
          value: x.registrosTotales
        };
        this.single.push(obj);
      }
    }
  }
  segmentChanged( event ) {
    console.log(event.detail.value);
    this.segment = event.detail.value;
    if (this.segment === 'torta') {
    }
  }
}
