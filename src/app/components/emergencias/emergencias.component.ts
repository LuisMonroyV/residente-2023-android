import { Component, OnInit } from '@angular/core';
import { Emergencia } from '../../interfaces/fb-interface';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-emergencias',
  templateUrl: './emergencias.component.html',
  styleUrls: ['./emergencias.component.scss'],
})
export class EmergenciasComponent implements OnInit {
  emergencias: Emergencia[] = [];
  constructor(public fbSrvc: FirebaseService ) { }

  ngOnInit() {
    this.fbSrvc.getEmergencias()
    .subscribe( emer => {
      if (emer && emer.length > 0) {
        this.emergencias = emer;
      }
    });
  }
}
