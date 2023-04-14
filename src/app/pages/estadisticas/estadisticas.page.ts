import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.page.html',
  styleUrls: ['./estadisticas.page.scss'],
})
export class EstadisticasPage implements OnInit {

  constructor( public fbSrvc: FirebaseService ) { }

  ngOnInit() {
    this.fbSrvc.getEstadisticasAll();
  }
  format(event) {
    if (event.label === 'Efectividad') {
      return event.value + '%';
    } else {
      return event.value;
    }
  }

}
