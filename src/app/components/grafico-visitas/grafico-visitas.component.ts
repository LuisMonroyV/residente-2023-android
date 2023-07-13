import { Component, OnInit, Input } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
// import * as moment from 'moment';


@Component({
  selector: 'app-grafico-visitas',
  templateUrl: './grafico-visitas.component.html',
  styleUrls: ['./grafico-visitas.component.scss'],
})
export class GraficoVisitasComponent implements OnInit {
  @Input() ano: number;
  @Input() mes: number;

  arcWidth =  0.45;
  legendPos: any = {
    right: 'right',
    below: 'below'
  };
  legend = true;
  legendPosition = this.legendPos.below;
  explodeSlices = false;
  legendTitle = '';
  label = 'Total de Visitas';
  gradient = true;
  isDoughnut = false;
  segment = 'torta';
  showLabels = true;
  showLegend = false;
  showXAxis = true;
  showYAxis = true;
  showXAxisLabel = true;
  single: any[] = [];
  xAxisLabel = '';
  showYAxisLabel = true;
  yAxisLabel = '# Visitas';
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
      for (const x of this.fbSrvc.estadisticas[pos].calles) {
        const obj = {
          name: x.calle,
          value: x.visitasTotales
        };
        this.single.push(obj);
      }
    }
  }
  segmentChanged( event ) {
    console.log(event.detail.value);
    this.segment = event.detail.value;
  }
}
