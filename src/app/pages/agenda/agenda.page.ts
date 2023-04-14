import { Component, OnInit, ViewChild } from '@angular/core';
// import { CallNumber } from '@ionic-native/call-number/ngx';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { telefonos } from '../../../environments/environment';
import { IonList } from '@ionic/angular';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
})
export class AgendaPage implements OnInit {
@ViewChild('lista', { static: true }) lista: IonList;

  constructor(private call: CallNumber,
              public fbSrvc: FirebaseService ) { }

  ngOnInit() {
  }

  llamar(destino: string) {
    this.lista.closeSlidingItems();
    let numero = '';
    if (destino === 'guardia') {
      numero = this.fbSrvc.parametrosFB.guardia;
    } else if (destino === 'carabineros') {
      numero = telefonos.carabineros;
    } else if (destino === 'bomberos') {
      numero = telefonos.bomberos;
    } else if (destino === 'ambulancia') {
      numero = telefonos.ambulancia;
    } else if (destino === 'pdi') {
      numero = telefonos.pdi;
    } else if (destino === 'cuadrante') {
      numero = this.fbSrvc.parametrosFB.cuadrante;
    } else if (destino === 'seguridad') {
      numero = this.fbSrvc.parametrosFB.seguridadComunal;
    } else if (destino === 'emergencia') {
      numero = this.fbSrvc.parametrosFB.emergenciaComunal;
    } else if (destino === 'familia') {
      numero = telefonos.familia;
    }
    console.log('Llamado a: ', numero);
    console.log({numero});
    this.call.callNumber(numero, true)
      .then( result => {
        console.log('Llamada realizada: ', result);
      })
      .catch( err => {
        console.log('Error al generar llamada: ', err);
        this.fbSrvc.mostrarMensaje(err);
      });
  }

}
