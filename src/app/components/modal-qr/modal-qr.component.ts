import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FirebaseService } from '../../../app/services/firebase.service';
import { Qr } from '../../interfaces/fb-interface';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import * as moment from 'moment';
moment.locale('es');

@Component({
  selector: 'app-modal-qr',
  templateUrl: './modal-qr.component.html',
  styleUrls: ['./modal-qr.component.scss'],
})
export class ModalQrComponent implements OnInit {
  validez = '24h';
  horaHoy = moment().format('HH:mm');
  semana = moment().endOf('day').add(7, 'days').format('ddd DD-MMM');
  qrMostrarBase = `https://api.qrserver.com/v1/create-qr-code/?format=svg&size=2000x200&qzone=4&data=`;
  qrMostrar = '';
  qrCompartirBase = `https://api.qrserver.com/v1/create-qr-code/?format=svg&size=800x800&qzone=4&data=`;
  qrCompartir = '';
  datosQr: Qr = {
    calle: this.fbSrvc.persona.calle,
    generado: moment().format('YYYY-MM-DD HH:mm:ss'),
    idQr: '',
    numero: this.fbSrvc.persona.numero,
    utilizado: false,
    validoHasta: '24h',
  };

  constructor( public fbSrvc: FirebaseService,
               private modalCtrl: ModalController,
               private socialSharing: SocialSharing,
               ) {
               }

  ngOnInit() {
    this.guardarQr();
  }
  cambiarValidez(valor: string) {
    if (valor !== this.validez) {
      this.validez = valor;
      this.datosQr.validoHasta = valor;
      this.datosQr.generado = moment().format('YYYY-MM-DD HH:mm:ss');
      this.guardarQr();
    }
  }
  cerrarModal() {
    this.modalCtrl.dismiss();
  }
  async compartirQr() {
    const image = this.qrCompartir;
    console.log({image});
    const qrOptions = {
      url: this.qrCompartir,
    };
    this.socialSharing.shareWithOptions(qrOptions)
    .then( ok => {
      console.log('Compartido!: ', ok);
    })
    .catch( err => {
      console.log('Error: ', err);
    });
  }
  guardarQr() {
    this.fbSrvc.loading('Generando código QR');
    this.fbSrvc.postQr(this.datosQr)
    .then( idQr => {
      setTimeout(() => {
        this.fbSrvc.stopLoading();
      }, 1000);
      this.fbSrvc.putIdQr(idQr.id);
      this.datosQr.idQr = idQr.id;
      this.qrMostrar = this.qrMostrarBase + idQr.id;
      this.qrCompartir = this.qrCompartirBase + idQr.id;
      console.log('qrMostrar: ', this.qrMostrar);
      console.log('qrCompartir: ', this.qrCompartir);
    })
    .catch( err => {
      console.log('Error: ', err);
    });
  }
  // invalidarQr() {
  //   if (this.datosQr.idQr.length > 0) {
  //     this.fbSrvc.putInvalidarQr(this.datosQr.idQr)
  //     .then( () => {
  //       console.log('Código QR Invalidado.');
  //     })
  //     .catch(err => {
  //       console.log('Error al invalidar código QR.');
  //     });
  //   }
  // }
}
