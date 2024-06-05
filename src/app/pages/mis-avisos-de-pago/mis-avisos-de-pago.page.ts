import { AvisoDePago, Pago } from '../../interfaces/fb-interface';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { IonList, ModalController } from '@ionic/angular';
import { ModalAvisoDePagoComponent } from '../../components/modal-aviso-de-pago/modal-aviso-de-pago.component';
import { ModalVersionAppComponent } from 'src/app/components/modal-version-app/modal-version-app.component';
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
    if (this.fbSrvc.persona.esTesorero) {
      this.modalMotivo('aprobar')
      .then( () => {
        if (this.guardar) {
          aviso.estadoAviso = '1-Aprobado';
          aviso.fechaAprobacion = moment().toDate();
          aviso.revisor = `${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno}`;
          aviso.obsRevisor = this.motivo;
          this.pagarPorAviso(aviso);
          this.listaP.closeSlidingItems();
        } else {
          this.fbSrvc.mostrarMensaje('Aprobación cancelada.');
          this.listaP.closeSlidingItems();
        }
      });
    } else {
      this.fbSrvc.mostrarMensaje('No puedes aprobar avisos de pago.');
      this.listaP.closeSlidingItems();
    }
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
          if (per.data().idMovil && per.data().idMovil.length > 0) {
            residentes.push(per.data().idMovil);
          }
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
      if (dataAP && dataAP.length > 0) {
        this.misAvisosDePago = dataAP;
      }
    });
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
    if (!this.fbSrvc.actualizarAppObligatorio) {
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
    } else {
      const modalVersionApp = await this.modalCtrl.create({
        component: ModalVersionAppComponent,
      });
      await modalVersionApp.present();
    }
  }
  pagarPorAviso(aviso: AvisoDePago) {
    if (this.fbSrvc.persona.esTesorero) {
      let pagadosOK = 0;
      aviso.mesesPagados.forEach( mesP => {
        const pagoPorAviso: Pago = { ano: parseInt(mesP.mesAno.substring(3), 10),
                                     comentario: `Aprobado por ${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno}`,
                                     idDireccion: aviso.idDireccion,
                                     mes: parseInt(mesP.mesAno.substring(0, 2), 10),
                                     pagado: true,
                                     ultAct: null
                                    };
        this.fbSrvc.putPago(pagoPorAviso)
        .then( () => {
          console.log(`pago ${pagoPorAviso.mes}-${pagoPorAviso.ano} actualizado OK`);
          pagadosOK++;
          if (pagadosOK === aviso.mesesPagados.length) {
            this.fbSrvc.mostrarMensaje('Pago actualizado.');
            this.fbSrvc.putAvisoDePago(aviso);
            this.avisarResidentes(aviso);
          }
        })
        .catch( err => {
          console.log('No se actualizó el pago: ', err);
          this.fbSrvc.mostrarMensaje('No se pudo actualizar el aviso de pago.');
          // Rollback
          aviso.estadoAviso = '0-Pendiente';
          aviso.fechaAprobacion = null;
          this.fbSrvc.putAvisoDePago(aviso);
          return;
        });
      });
    } else {
      this.fbSrvc.mostrarMensaje('No puedes aprobar avisos de pago.');
    }
  }
  rechazar( aviso: AvisoDePago) {
    if (this.fbSrvc.persona.esTesorero) {
      this.modalMotivo('rechazar')
      .then( () => {
        if (this.guardar) {
          console.log('Motivo de rechazo:', this.motivo);
          aviso.estadoAviso = '-1-Rechazado';
          aviso.fechaRechazo = moment().toDate();
          aviso.obsRevisor = this.motivo;
          aviso.revisor = `${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno}`;
          this.fbSrvc.putAvisoDePago(aviso);
          this.avisarResidentes(aviso);
        } else {
          this.fbSrvc.mostrarMensaje('Debe indicar el motivo de rechazo.');
          this.listaP.closeSlidingItems();
        }
      })
      .catch( err => {
        console.log('Error al rechazar aviso de pago: ', err);
      });
    } else {
      this.fbSrvc.mostrarMensaje('No puedes rechazar avisos de pago.');
      this.listaP.closeSlidingItems();
    }
  }
  segmentChanged($event) {
    console.log('seccion: ', $event.detail.value);
    this.seccion = $event.detail.value;
  }
}
