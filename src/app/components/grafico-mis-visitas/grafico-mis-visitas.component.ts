import { Component, OnInit, Input } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-grafico-mis-visitas',
  templateUrl: './grafico-mis-visitas.component.html',
  styleUrls: ['./grafico-mis-visitas.component.scss'],
})
export class GraficoMisVisitasComponent implements OnInit {
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
  label = 'Mis Visitas';
  gradient = true;
  isDoughnut = false;
  segment = 'torta';
  showDataLabel = true;
  showGridLines = true;
  showLabels = true;
  showLegend = false;
  showXAxis = true;
  showYAxis = true;
  showXAxisLabel = true;
  single: any[] = [];
  xAxisLabel = '';
  showYAxisLabel = true;
  yAxisLabel = '# Visitas';
  // view: any[] = [300, 350];

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
    setTimeout(() => {
      // console.log('%cgrafico-mis-visitas.component.ts line:56 this.mes', 'color: #007acc;', this.mes);
      // console.log('%cgrafico-mis-visitas.component.ts line:57 this.ano', 'color: #007acc;', this.ano);
      const pos = this.fbSrvc.estadisticas.findIndex( est => est.ano === this.ano && est.mes === this.mes);
      if (pos > -1) {
        const calle = this.fbSrvc.parametros.codigoDir.substring(0, this.fbSrvc.parametros.codigoDir.indexOf('-'));
        const numeracion = this.fbSrvc.parametros.codigoDir.substring(this.fbSrvc.parametros.codigoDir.indexOf('-') + 1);
        const posCalle = this.fbSrvc.estadisticas[pos].calles.findIndex((posC) => posC.calle === calle);
        let posNumeracion = -1;
        if (posCalle > -1 && this.fbSrvc.estadisticas[pos].calles[posCalle].direcciones) {
          // eslint-disable-next-line max-len
          posNumeracion = this.fbSrvc.estadisticas[pos].calles[posCalle].direcciones.findIndex((posNum) => posNum.numeracion === numeracion);
          if (posNumeracion > -1) {
            this.single = [];
            const obj1 = {
                  name: 'Mis Visitas',
                  value: this.fbSrvc.estadisticas[pos].calles[posCalle].direcciones[posNumeracion].visitasTotales,
                };
            const obj2 = {
                  name: 'Mis Avisos',
                  value: this.fbSrvc.estadisticas[pos].calles[posCalle].direcciones[posNumeracion].visitasAvisadas,
                };
                const obj3 = {
                  name: '% de Avisos',
                  value: Math.round((obj2.value / (obj1.value || 1)) * 100).toFixed(0),
                };
            const obj4 = {
                  name: 'Mins. de Guardia',
                  // eslint-disable-next-line max-len
                  value: Math.round(this.fbSrvc.estadisticas[pos].calles[posCalle].direcciones[posNumeracion].minutosInvertidos / 60).toFixed(0),
                };
            this.single.push(obj1);
            this.single.push(obj2);
            this.single.push(obj3);
            this.single.push(obj4);
          }
        }
      }
    }, 1000);
  }
  segmentChanged( event ) {
    console.log(event.detail.value);
    this.segment = event.detail.value;
  }
}
