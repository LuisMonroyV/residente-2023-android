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
  // async actualizarAvisoDePagos(aviso: AvisoDePago ) {
  //     const query = `${apiLosMostosAVP}?filter=idAvisoPago,eq,${aviso.idAvisoPago}`;
  //     this.http.get<ArrAvisoDePagoLM>(query)
  //     .subscribe( avisoLM => {
  //       const queryPut = `${apiLosMostosAVP}/${avisoLM.records[0].id}`;
  //       const body = { estadoAviso: aviso.estadoAviso,
  //                      fechaAprobacion: aviso.fechaAprobacion ? moment(aviso.fechaAprobacion).format('YYYY-MM-DD') : null,
  //                      fechaRechazo: aviso.fechaRechazo ? moment(aviso.fechaRechazo).format('YYYY-MM-DD') : null,
  //                      obsRevisor: aviso.obsRevisor ? aviso.obsRevisor : null,
  //                      revisor: aviso.revisor,
  //                    };
  //       console.log('queryPut:', queryPut);
  //       console.log('body:', body);
  //       return this.http.put(queryPut, body, { headers: headersLosMostos })
  //       .subscribe( respLM => {
  //         if (respLM) {
  //           console.log('respuesta api LosMostos: ', respLM);
  //         }
  //       });
  //     });
  // }
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
  // async respaldarAvisoDePagos(aviso: AvisoDePago ) {
  //   const body: AvisoDePagoLM = { estadoAviso: aviso.estadoAviso,
  //                                 id: null,
  //                                 fechaAprobacion: null,
  //                                 fechaAviso: moment(aviso.fechaAviso).format('YYYY-MM-DD'),
  //                                 fechaRechazo: null,
  //                                 idAvisoPago: aviso.idAvisoPago,
  //                                 idDireccion: aviso.idDireccion,
  //                                 mesesPagados: JSON.stringify(aviso.mesesPagados),
  //                                 montoPago: aviso.montoPago.toString(),
  //                                 obsResidente: aviso.obsResidente,
  //                                 obsRevisor: null,
  //                                 revisor: null,
  //                               };
  //   console.log('%cpush.service.ts respaldarAvisoDePagos body', 'color: #007acc;', body);
  //   this.http.post(apiLosMostosAVP, body, { headers: headersLosMostos } )
  //   .subscribe( resp => {
  //     if (resp) {
  //       console.log('respuesta api LosMostos: ', resp);
  //     }
  //   });
  // }
}
