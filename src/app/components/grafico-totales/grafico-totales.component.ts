import { Component, OnInit, Input } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-grafico-totales',
  templateUrl: './grafico-totales.component.html',
  styleUrls: ['./grafico-totales.component.scss'],
})
export class GraficoTotalesComponent implements OnInit {
  @Input() ano: number;
  @Input() mes: number;

  legendPos: any = {
    right: 'right',
    below: 'below'
  };

  colorCard = ['#ffffff', '#c66e68', '#6868c6', '#68c677', '#9568c6', '#c69068', '#68a5c6'];
  legend = true;
  legendPosition = this.legendPos.below;
  cardColor = this.colorCard[0];
  legendTitle = 'Cestades';
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
  yAxisLabel = 'Visitas';
  view: any[] = [350, 350];

  // eslint-disable-next-line max-len
  colores = ['nightLights','vivid', 'natural', 'cool', 'fire', 'solar', 'air', 'aqua', 'flame', 'ocean', 'forest', 'horizon', 'neons', 'picnic', 'night'];
  numScheme = 0;
  numColorCard = 0;
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
    if (this.numColorCard === 6) {
      this.numColorCard = 0;
    } else {
      this.numColorCard++;
    }
    this.colorScheme = this.colores[this.numScheme];
    this.cardColor = this.colorCard[this.numColorCard];
  }
  ngOnInit() {
        const pos = this.fbSrvc.estadisticas.findIndex( est => est.ano === this.ano && est.mes === this.mes);
    // console.log('pos: ', this.fbSrvc.estadisticas[pos].calles);
    if (pos >= 0) {
      this.single = [
        { name: 'Total de visitas',
          value: this.fbSrvc.estadisticas[pos].totalVisitas
        },
        { name: 'Prom. diario V.',
          value: Math.round(this.fbSrvc.estadisticas[pos].promedioDiarioVisitas)
        },
        { name: 'Avisos x app.',
          value: this.fbSrvc.estadisticas[pos].avisosApp
        },
        { name: 'Prom. diario A.',
          value: Math.round(this.fbSrvc.estadisticas[pos].promedioDiarioAvisosApp)
        },
        { name: 'Avisos efectivos',
          value: this.fbSrvc.estadisticas[pos].avisosEfectivos
        },
        { name: 'Efectividad',
          value: Math.round(this.fbSrvc.estadisticas[pos].porcentajeEfectividad * 100)
        },
      ];
      }
  }
  segmentChanged( event ) {
    console.log(event.detail.value);
    this.segment = event.detail.value;
    if (this.segment === 'torta') {
    }
  }
  format(event) {
    // console.log(event);
    if (event.label === 'Efectividad') {
      return event.value + '%';
    } else {
      return  new Intl.NumberFormat('de-DE').format(event.value);
    }
  }
}

