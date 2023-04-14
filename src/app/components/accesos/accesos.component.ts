import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { RegistroVisita } from '../../interfaces/fb-interface';
// import { firestore } from 'firebase';
import * as moment from 'moment';

@Component({
  selector: 'app-accesos',
  templateUrl: './accesos.component.html',
  styleUrls: ['./accesos.component.scss'],
})
export class AccesosComponent implements OnInit {
  accesos: RegistroVisita[];
  constructor(public fbSrvc: FirebaseService) { }

  ngOnInit() {
    // console.log('ngOnInit(accesosComponent)');
    if (!this.fbSrvc.parametros.codigoDir) {
      console.warn('Esperar 2 segs por el código dir');
      setTimeout(() => {
        this.misAccesos();
      }, 2000);
    } else {
      this.misAccesos();
    }
  }
  misAccesos() {
    this.fbSrvc.getMisAccesos()
    .subscribe( acc => {
      if (acc && acc.length > 0) {
        this.accesos = acc;
        if (!this.fbSrvc.ultimoAcceso) {
          this.fbSrvc.ultimoAcceso = this.accesos[0].fecha.toDate();
          console.log('no hay ultimo acceso, nuevo ultimo acceso: ', moment(this.fbSrvc.ultimoAcceso).format('lll'));
        }
        const fechaAcceso = this.accesos[0].fecha.toDate();
        console.log('nuevo acceso?');
        console.log('ultimoAcceso: ', moment(this.fbSrvc.ultimoAcceso).format('lll'));
        console.log('fechaAcceso: ', moment(fechaAcceso).format('lll'));
        // tslint:disable-next-line: max-line-length
        console.log(`Tiempo transcurrido desde último acceso: ${moment().diff(moment(fechaAcceso), 'minutes')} minutos`);
        if ( moment(this.fbSrvc.ultimoAcceso).format('lll') !==  moment(fechaAcceso).format('lll')) {
          console.log('Si, nuevo acceso...');
          this.fbSrvc.registroAvisado = false;
          // Si no han pasado 1 hora aún y no ha sido avisado
          if ((Math.abs(moment().diff(moment(fechaAcceso), 'hours')) <= 1) && (!this.fbSrvc.registroAvisado)) {
            this.fbSrvc.lanzarSonido('door', 1);
            this.fbSrvc.registroAvisado = true;
          } else {
            console.log('...pero vencido o ya avisado');
          }
          this.fbSrvc.ultimoAcceso = fechaAcceso;
          console.log('nuevo ultimo Acceso: ', moment(this.fbSrvc.ultimoAcceso).format('lll'));
        } else {
          console.log('No es nuevo acceso...');
          if ((Math.abs(moment().diff(moment(fechaAcceso), 'hours')) <= 1) && (!this.fbSrvc.registroAvisado)) {
            this.fbSrvc.lanzarSonido('door', 1);
            this.fbSrvc.registroAvisado = true;
          } else {
            console.log('aviso vencido o ya avisado.');
          }

        }
      }
    });
  }
}
