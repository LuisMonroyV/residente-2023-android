import { AvisoDePago, Pago } from '../../interfaces/fb-interface';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { IonList, ModalController } from '@ionic/angular';
import { ModalAvisoDePagoComponent } from '../../components/modal-aviso-de-pago/modal-aviso-de-pago.component';
import { ModalRechazoComponent } from '../../components/modal-rechazo/modal-rechazo.component';
import { PushService } from '../../services/push.service';
import * as moment from 'moment';

@Component({
  selector: 'app-mis-avisos-de-pago',
  templateUrl: './mis-avisos-de-pago.page.html',
  styleUrls: ['./mis-avisos-de-pago.page.scss'],
})
export class MisAvisosDePagoPage implements OnInit {
  @ViewChild('listaPendientes', { static: false }) listaP: IonList;
  avisosDePagoPendientes: AvisoDePago[] = [];
  interv: any;
  misAvisosDePago: AvisoDePago[] = [];
  motivo = '';
  guardar = false;
  seccion = 'misAvisos';
  constructor(
              private modalCtrl: ModalController,
              public fbSrvc: FirebaseService,
              private pushSrvc: PushService,
             ) { }
  aprobar( aviso: AvisoDePago) {
    console.log('aprobar()');
    this.modalMotivo('aprobar')
    .then( () => {
      if (this.guardar) {
        aviso.estadoAviso = '1-Aprobado';
        aviso.fechaAprobacion = moment().toDate();
        aviso.revisor = `${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno}`;
        aviso.obsRevisor = this.motivo;
        aviso.revisor = `${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno}`;
        this.pagarPorAviso(aviso);
        this.fbSrvc.putAvisoDePago(aviso);
        this.pushSrvc.actualizarAvisoDePagos(aviso);
        this.avisarResidentes(aviso);
        this.fbSrvc.putAvisoDePago(aviso);
        this.avisarResidentes(aviso);
        this.pushSrvc.actualizarAvisoDePagos(aviso);
        this.listaP.closeSlidingItems();
      } else {
        this.fbSrvc.mostrarMensaje('Aprobación cancelada.');
        this.listaP.closeSlidingItems();
      }
    });
  }
  avisarAdmins() {
    this.fbSrvc.getAdministradores()
    .subscribe( adm => {
      let cont = 0;
      if (adm && !adm.empty) {
        console.log('# Administradores: ', adm.size);
        this.interv = setInterval(() => {
          if (cont < adm.size) {
            if (adm.docs[cont].data().idMovil) {
              this.pushSrvc.notificarNuevoAvisoDePago(adm.docs[cont].data().idMovil)
              .then( () => {
                console.log('notificación de aviso de pago enviada');
              })
              .catch( err => {
                console.log('Error al enviar notificación de aviso de pago: ', err);
              });
            } else {
              if (cont >= adm.size) {
                clearInterval(this.interv);
              }
            }
          } else {
            clearInterval(this.interv);
          }
          cont++;
        }, 1000);
      }
    });
  }
  avisarResidentes(aviso: AvisoDePago) {
    this.fbSrvc.getPersonasxDireccion(aviso.idDireccion)
    .subscribe( personas => {
      if (personas && !personas.empty) {
        console.log('# Residentes: ', personas.size);
        // eslint-disable-next-line prefer-const
        let residentes: string[] = [];
        personas.docs.forEach( per => {
          residentes.push(per.data().idMovil);
        });
        this.pushSrvc.notificarCambioEnAvisoDePago(residentes);
      }
    });
  }
  guardarAvisoPago(aviso: AvisoDePago) {
    this.fbSrvc.postAvisoDePago(aviso)
    .then( () => {
      this.fbSrvc.mostrarMensaje('Aviso de Pago enviado correctamente.');
      this.fbSrvc.misMesesImpagos = [];
      this.avisarAdmins();
      this.pushSrvc.respaldarAvisoDePagos(aviso);
    })
    .catch( err => {
      this.fbSrvc.mostrarMensaje('No se pudo guardar el aviso de pago. Error: ', err);
    });
  }
  async modalMotivo( tipo: string) {
    const modalMotivo = await this.modalCtrl.create({
      component: ModalRechazoComponent,
      componentProps: {
        guardar: '?',
        motivo: this.motivo,
        tipo
      }
    });
    await modalMotivo.present();
    const {data} = await modalMotivo.onDidDismiss();
    if (data) {
      if (data) {
        if (data.guardar === 'SI') {
          this.motivo = data.motivo;
          this.guardar = true;
        } else {
          this.guardar = false;
        }
      }
    }
  }
  ngOnInit() {
    console.log('%cmis-avisos-de-pago.page.ts ngOnInit()', 'color: #007acc;');
    this.seccion = 'misAvisos';
    this.fbSrvc.getMisAvisosDePago()
    .subscribe( dataAP => {
      this.misAvisosDePago = [];
      // console.log('%ccambio en getMisAvisosDePago', 'color: #007acc;');
      if (dataAP && dataAP.length > 0) {
        this.misAvisosDePago = dataAP;
      }
    });
    setTimeout(() => {
      this.rebajarPendientes(this.misAvisosDePago);
    }, 500);
    if (this.fbSrvc.persona.esAdmin) {
      this.fbSrvc.getAvisosDePago()
      .subscribe( dataAPP => {
        this.avisosDePagoPendientes = [];
        // console.log('%ccambio en getAvisosDePago', 'color: #007acc;');
        if (dataAPP && dataAPP.length > 0) {
          this.avisosDePagoPendientes = dataAPP;
        }
      });
    }
  }
  async nuevoAvisoPago() {
    const modalAvisoPago = await this.modalCtrl.create({
      component: ModalAvisoDePagoComponent,
    });
    await modalAvisoPago.present();
    const {data} = await modalAvisoPago.onDidDismiss();
    if (data) {
      if (data.guardar === 'SI') {
        // ahora saco los pagos no seleccionados del nuevo avisoz
        for (let index = 0; index < data.aviso.mesesPagados.length; index++) {
          const element = data.aviso.mesesPagados[index];
          if (element.documento.length === 0) {
            data.aviso.mesesPagados.splice(index, 1);
            index = 0;
          }
        }
        this.guardarAvisoPago(data.aviso);
      }
    }
  }
  pagarPorAviso(aviso: AvisoDePago) {
    if (this.fbSrvc.persona.esTesorero) {
      aviso.mesesPagados.forEach( mesP => {
        const pagoPorAviso: Pago = { ano: parseInt(mesP.mesAno.substring(3), 10),
                                     comentario: `Aprobado por ${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno}`,
                                     idDireccion: aviso.idDireccion,
                                     mes: parseInt(mesP.mesAno.substring(0, 2), 10),
                                     pagado: true,
                                     ultAct: null
                                    };
        // debugger;
        this.fbSrvc.putPago(pagoPorAviso)
        .then( () => {
          console.log(`pago actualizado OK`);
          this.fbSrvc.mostrarMensaje('Pago actualizado.');
        })
        .catch( err => {
          console.log('No se actualizó el pago: ', err);
          this.fbSrvc.mostrarMensaje('No se pudo actualizar el pago.');
        });
      });
    }
  }
  rebajarPendientes(avisos: AvisoDePago[]) {
    console.log('RebajarPendientes()');
    // rebajo los pagos pendientes de los impagos
    avisos.forEach( element => {
      if (element.estadoAviso === '0-Pendiente') {
        element.mesesPagados.forEach( mesP => {
          // ubico la fecha en el arreglo de meses impagos
          const posImpago = this.fbSrvc.misMesesImpagos.findIndex( mesesImp => mesesImp.mesAno === mesP.mesAno );
          if (posImpago > -1) {
            this.fbSrvc.misMesesImpagos.splice(posImpago, 1);
          }
        });
      }
    });
  }
  rechazar( aviso: AvisoDePago) {
    console.log('rechazar()');
    this.modalMotivo('rechazar')
    .then( () => {
      if (this.motivo !== '') {
        console.log('Motivo de rechazo:', this.motivo);
        aviso.estadoAviso = '-1-Rechazado';
        aviso.fechaRechazo = moment().toDate();
        aviso.obsRevisor = this.motivo;
        aviso.revisor = `${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno}`;
        this.fbSrvc.putAvisoDePago(aviso);
        this.avisarResidentes(aviso);
        this.pushSrvc.actualizarAvisoDePagos(aviso);
      } else {
        this.fbSrvc.mostrarMensaje('Debe indicar el motivo de rechazo.');
        this.listaP.closeSlidingItems();
      }
    })
    .catch( err => {
      console.log('Error al rechazar aviso de pago: ', err);
    });
  }
  segmentChanged($event) {
    console.log('seccion: ', $event.detail.value);
    this.seccion = $event.detail.value;
  }
}
