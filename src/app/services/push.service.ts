/* eslint-disable @typescript-eslint/naming-convention */
import { AvisoDePago } from '../interfaces/fb-interface';
import { FirebaseService } from './firebase.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OneSignal } from '@awesome-cordova-plugins/onesignal/ngx';
import { oneSignalConfig, firebaseConfig, losMostosBDConfig } from '../../environments/environment';
// import { Router } from '@angular/router';
import * as moment from 'moment';


const oSAppIdCliente = oneSignalConfig.OSapiId;
const oSApiUrl = oneSignalConfig.OSApiUrl;
const oSRestApiKey = oneSignalConfig.OSRestApiKey;
const fBId = firebaseConfig.messagingSenderId;
const headers = new HttpHeaders({
  'Content-Type': 'application/json; charset=utf-8',
  // eslint-disable-next-line quote-props
  'Authorization': 'Basic ' + oSRestApiKey
});
const headersLosMostos = new HttpHeaders({
  'Content-Type': 'application/json; charset=utf-8',
});
const apiLosMostosAVP = losMostosBDConfig.apiUrl + '/aviso_pagos';
@Injectable({
  providedIn: 'root'
})
export class PushService {
  constructor( private oneSignal: OneSignal,
               private fbSrvc: FirebaseService,
               private http: HttpClient
             ) { }

  configuracionInicialCliente() {
    console.log('PUSH configuracionInicialCliente()');
    this.oneSignal.startInit(oSAppIdCliente, fBId);
    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification );
  }
  async notificarAlerta(tipo: string) {
    let audiencia = '';
    if ( this.fbSrvc.persona.esAdmin && this.fbSrvc.parametrosFB.pruebasTienda) {
      audiencia = 'Tester';
    } else {
      audiencia = 'Subscribed Users';
    }
    const body = {
      app_id: oSAppIdCliente,
      included_segments: [audiencia],
      data: {
        nombre: 'Alerta de residente',
        calle: this.fbSrvc.persona.calle,
        numero: this.fbSrvc.persona.numero,
      },
      contents: {
        // eslint-disable-next-line max-len
        en: `${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno} needs help in ${this.fbSrvc.persona.calle} ${this.fbSrvc.persona.numero}`,
        // eslint-disable-next-line max-len
        es: `${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno} necesita ayuda ${tipo} en ${this.fbSrvc.persona.calle} ${this.fbSrvc.persona.numero}`
      },
      headings: {
        en: 'Alerta de Seguridad en Los Mostos',
        es: 'Alerta de Seguridad en Los Mostos'
      },
      ios_sound: 'woopWoop.mp3',
      android_sound: 'woopWoop',
    };
    console.log({body});
    return this.http.post(oSApiUrl, body, { headers } )
    .subscribe( data2 => {
      console.log('Respuesta oneSignal: ', data2);
    });
  }
  async notificarCambioEnAvisoDePago(idUsers: string[]) {
    const body = {
      app_id: oSAppIdCliente,
      include_player_ids: idUsers,
      data: {
        nombre: 'Tu aviso de pago ha cambiado de estado',
        calle: this.fbSrvc.persona.calle,
        numero: this.fbSrvc.persona.numero,
      },
      contents: {
        // tslint:disable-next-line: max-line-length
        en: `Your payment advice has a new state`,
        // tslint:disable-next-line: max-line-length
        es: `Tu aviso de pago ha cambiado de estado`
      },
      headings: {
        en: 'Se ha revisado tu aviso de pago',
        es: 'Se ha revisado tu aviso de pago.'
      },
      ios_sound: 'woopWoop.mp3',
      android_sound: 'woopWoop',
    };
    console.log({body});
    return this.http.post(oSApiUrl, body, { headers } )
    .subscribe( data2 => {
      console.log('Respuesta oneSignal: ', data2);
    });
  }
  async notificarNuevoAvisoDePago(idAdmin: string) {
    const body = {
      app_id: oSAppIdCliente,
      include_player_ids: [idAdmin],
      data: {
        nombre: 'Nuevo aviso de pago esperando aprobación',
        calle: this.fbSrvc.persona.calle,
        numero: this.fbSrvc.persona.numero,
      },
      contents: {
        // tslint:disable-next-line: max-line-length
        en: `${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno} ha avisado un pago`,
        // tslint:disable-next-line: max-line-length
        es: `${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno} ha avisado un pago`
      },
      headings: {
        en: 'Nuevo aviso de pago esperando aprobación',
        es: 'Nuevo aviso de pago esperando aprobación'
      },
      ios_sound: 'woopWoop.mp3',
      android_sound: 'woopWoop',
    };
    console.log({body});
    return this.http.post(oSApiUrl, body, { headers } )
    .subscribe( data2 => {
      console.log('Respuesta oneSignal: ', data2);
    });
  }
  async notificarNuevaReserva(idUsers: string[]) {
    const body = {
      app_id: oSAppIdCliente,
      include_player_ids: idUsers,
      data: {
        nombre: 'reservas de multicancha',
        calle: this.fbSrvc.persona.calle,
        numero: this.fbSrvc.persona.numero,
      },
      contents: {
        en: `Un residente de ${this.fbSrvc.persona.calle}-${this.fbSrvc.persona.numero} ha solicitado una reserva`,
        es: `Un residente de ${this.fbSrvc.persona.calle}-${this.fbSrvc.persona.numero} ha solicitado una reserva`
      },
      headings: {
        en: 'Se ha solicitado una reserva de cancha.',
        es: 'Se ha solicitado una reserva de cancha.'
      }
    };
    console.log({body});
    return this.http.post(oSApiUrl, body, { headers } )
    .subscribe( data2 => {
      console.log('Respuesta oneSignal: ', data2);
    });
  }
  async notificarNuevoUsuario(idAdmin: string) {
    const body = {
      app_id: oSAppIdCliente,
      include_player_ids: [idAdmin],
      data: {
        nombre: 'Nuevo usuario esperando aprobación',
        calle: this.fbSrvc.persona.calle,
        numero: this.fbSrvc.persona.numero,
      },
      contents: {
        // tslint:disable-next-line: max-line-length
        en: `${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno} has registered`,
        // tslint:disable-next-line: max-line-length
        es: `${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno} se ha registrado`
      },
      headings: {
        en: 'Nuevo usuario esperando aprobación',
        es: 'Nuevo usuario esperando aprobación'
      },
      ios_sound: 'woopWoop.mp3',
      android_sound: 'woopWoop',
    };
    console.log({body});
    return this.http.post(oSApiUrl, body, { headers } )
    .subscribe( data2 => {
      console.log('Respuesta oneSignal: ', data2);
    });
  }
  async notificarNoticia(titulo: string) {
    const body = {
      app_id: oSAppIdCliente,
      included_segments: ['Subscribed Users'],
      data: {
        nombre: 'Nueva noticia'
      },
      contents: {
        en: 'News',
        // tslint:disable-next-line: max-line-length
        es: `${titulo} - Creada por @${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno}.`
      },
      headings: {
        en: 'Nueva noticia de la comunidad Los Mostos',
        es: 'Nueva noticia de la comunidad Los Mostos'
      },
    };
    console.log({body});
    return this.http.post(oSApiUrl, body, { headers } )
    .subscribe( data2 => {
      console.log('Respuesta oneSignal: ', data2);
    });
  }
  async notificarReserva(idUsers: string[]) {
    const body = {
      app_id: oSAppIdCliente,
      include_player_ids: idUsers,
      data: {
        nombre: 'reservas de multicancha',
        calle: this.fbSrvc.persona.calle,
        numero: this.fbSrvc.persona.numero,
      },
      contents: {
        // tslint:disable-next-line: max-line-length
        en: `Entra a la app para saber el resultado.`,
        // tslint:disable-next-line: max-line-length
        es: `Entra a la app para saber el resultado.`
      },
      headings: {
        en: 'Tu reserva ha sido procesada.',
        es: 'Tu reserva ha sido procesada.'
      },
      ios_sound: 'woopWoop.mp3',
      android_sound: 'woopWoop',
    };
    console.log({body});
    return this.http.post(oSApiUrl, body, { headers } )
    .subscribe( data2 => {
      console.log('Respuesta oneSignal: ', data2);
    });
  }
}
