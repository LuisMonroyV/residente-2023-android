import { Component, OnInit } from '@angular/core';
import { Emergencia } from '../../interfaces/fb-interface';
import { FirebaseService } from '../../services/firebase.service';
import { PushService } from '../../services/push.service';
import * as moment from 'moment';


@Component({
  selector: 'app-alerta',
  templateUrl: './alerta.page.html',
  styleUrls: ['./alerta.page.scss'],
})
export class AlertaPage implements OnInit {
  // movilesRegistrados: string[] = [];
  codigoAlerta = '';
  pasoActual = 'en alerta';
  nuevaEmergencia: Emergencia = {
    estado: 'Enviada',
    fechaInicio: new Date(),
    fechaTermino: null,
    guardia: null,
    idDireccion: this.fbSrvc.parametros.codigoDir,
    idEmergencia: null,
    obs: ''
  };
  constructor( public fbSrvc: FirebaseService,
               private pushSrvc: PushService,
               ) { }

  ngOnInit() {
  }
  siguiente(tipo: string) {
    if (this.fbSrvc.pasoAlerta === 0) {
      this.fbSrvc.pasoAlerta = 1;
    } else if ( this.fbSrvc.pasoAlerta === 1 &&
                this.fbSrvc.persona.nombres &&
                this.fbSrvc.persona.apellidoPaterno &&
                this.fbSrvc.persona.calle &&
                this.fbSrvc.persona.numero) {
      // enviar alerta
      this.pushSrvc.notificarAlerta(tipo)
      .then( () => {
        if (tipo === 'por seguridad') {
          this.fbSrvc.imagenEmergenciaSeleccionada = this.fbSrvc.imagenEmergenciaSeguridad;
        } else if (tipo === 'médica') {
          this.fbSrvc.imagenEmergenciaSeleccionada = this.fbSrvc.imagenEmergenciaMedica;
        } else if (tipo === 'por incendio') {
          this.fbSrvc.imagenEmergenciaSeleccionada = this.fbSrvc.imagenEmergenciaIncendio;
        } else if (tipo === '') {
          this.fbSrvc.imagenEmergenciaSeleccionada = this.fbSrvc.imagenEmergenciaOtra;
        }
        this.fbSrvc.mostrarMensaje('Emergencia enviada.');
        this.fbSrvc.pasoAlerta = 2;
        this.fbSrvc.alertaEnviada = true;
        const hora = moment().format('HH:mm');
        // eslint-disable-next-line max-len
        this.fbSrvc.textoAlerta = `Emergencia en la comunidad: ${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno} necesita ayuda ${tipo} en ${this.fbSrvc.persona.calle} ${this.fbSrvc.persona.numero} @${hora}`;
        this.nuevaEmergencia.obs = this.fbSrvc.textoAlerta;
        this.fbSrvc.postEmergencia(this.nuevaEmergencia)
        .then( () => {
          console.log('Emergencia guardada.');
        })
        .catch( err => {
          console.error('Error al guardar emergencia: ', err);
        });
      })
      .catch( err => {
        console.error('Error al notificar ususarios: ', err);
      });
    } else if ( this.fbSrvc.pasoAlerta === 2) {
      this.fbSrvc.mostrarMensaje('Emergencia ya fué enviada.');
    } else {
      this.fbSrvc.mostrarMensaje(`No se pudo enviar la emergencia ${tipo}, reintente.`);
    }
  }
}
