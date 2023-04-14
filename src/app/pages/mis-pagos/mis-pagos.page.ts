import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { MesImpago, Pago } from '../../interfaces/fb-interface';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import * as moment from 'moment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mis-pagos',
  templateUrl: './mis-pagos.page.html',
  styleUrls: ['./mis-pagos.page.scss'],
})
export class MisPagosPage implements OnInit {
  // cargando = false;
  anos = [];
  colorEstado = 'success';
  direcciones: Pago[] = [];
  estadoMisPagos = '';
  idDir = '';
  idNum = '';
  mesesImpagos = 0;
  misPagos: Pago[] = [];
  totalDeuda = 0;
  trimestre1 = [{ mes: 'Ene', num: 0}, { mes: 'Feb', num: 1}, { mes: 'Mar', num: 2}, { mes: 'Abr', num: 3}];
  trimestre2 = [{ mes: 'May', num: 4}, { mes: 'Jun', num: 5}, { mes: 'Jul', num: 6}, { mes: 'Ago', num: 7}];
  trimestre3 = [{ mes: 'Sep', num: 8}, { mes: 'Oct', num: 9}, { mes: 'Nov', num: 10}, { mes: 'Dic', num: 11}];
  ubicacionBoton = 'center';
  vacio: Pago = { ano: 0,
                  comentario: null,
                  idDireccion: this.idDir,
                  mes: 0,
                  pagado: false,
                  ultAct: null
                };
  constructor( public fbSrvc: FirebaseService,
               private socialSharing: SocialSharing,
               private router: Router,
             ) { }
  async compartirDatos() {
    const qrOptions = {
      // eslint-disable-next-line max-len
      message: 'Banco: BCI\r\nNombre: Junta de Vecinos Los Mostos\r\nRUT: 65.906.970-9\r\nCuenta Corriente: 29725496\r\nEmail: recaudacion.losmostos@gmail.com',
      // subject: '', // fi. for email
      // files: ['BCI', 'Junta de Vecinos Los Mostos', '65.906.970-9', '29725496', 'recaudacion.losmostos@gmail.com'],
      // url: this.qrCompartir,
      // chooserTitle: 'Pick an app', // Android only, you can override the default share sheet title
      // appPackageName: 'com.apple.social.facebook', // Android only, you can provide id of the App you want to share with
      // iPadCoordinates: '0,0,0,0' //IOS only iPadCoordinates for where the popover should be point.  Format with x,y,width,height
    };
    this.socialSharing.shareWithOptions(qrOptions)
    .then( ok => {
      console.log('Compartido!: ', ok);
    })
    .catch( err => {
      console.log('Error: ', err);
    });
  }
  completarPagos(pag: Pago[]) {
    this.misPagos = [];
    console.log(`${pag.length} pago(s)`);
    // Completo los meses no informados
    this.anos.forEach(ano => {
      for (let mes = 1; mes <= 12; mes++) {
        const existe = pag.filter( data => data.ano === ano && data.mes === mes);
        if (existe.length > 0) {
          this.misPagos.push(existe[0]);
        } else {
          const objVacio: Pago = { ano,
                                  comentario: null,
                                  idDireccion: this.idDir + '-' + this.idNum,
                                  mes,
                                  pagado: false,
                                  ultAct: null
                                };
          this.misPagos.push(objVacio);
        }
      }
    });
    console.log(this.misPagos);
    this.estadoPagos();
  }
  estadoPagos() {
    console.log('%cmis-pagos.page.ts estadoPagos()', 'color: #007acc;');
    this.mesesImpagos = 0;
    this.fbSrvc.misMesesImpagos = [];
    this.totalDeuda = 0;
    let fechaCorte = moment().startOf('month').toDate();
    let casoEsp = [];
    // si estamos a 6 o más del mes se cuenta este mes
    // if (moment().date() >= 6) {
    fechaCorte = moment().startOf('month').toDate(); // primero de este mes
    // } else {
    //   fechaCorte = moment().subtract(1, 'month').startOf('month').toDate(); // primero del mes anterior
    // }
    console.log('Fecha de Corte: ', fechaCorte);
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let index = 0; index < this.misPagos.length; index++) {
      const pago = this.misPagos[index];
      const fechaPago = moment().set('D', 1).set('month', pago.mes -1).set('year', pago.ano).toDate();
      let montoEspecial = 0;
      casoEsp = [];
      casoEsp = this.fbSrvc.casosEspeciales.filter( caso => caso.idDireccion === pago.idDireccion &&
                                                    // eslint-disable-next-line max-len
                                                    moment(fechaPago).isBetween(`${caso.fechaInicioCuotaEspecial}-01`, caso.fechaTerminoCuotaEspecial ? `${caso.fechaTerminoCuotaEspecial}-01` : undefined, 'day', '[]'));
      if (casoEsp && casoEsp.length > 0) {
        montoEspecial = casoEsp[0].cuotaEspecial;
      } else {
        montoEspecial = null;
      }
      if (!pago.pagado && (moment(fechaPago).diff(moment(fechaCorte), 'days') <= 0) &&
         (casoEsp.length === 0 || (casoEsp && casoEsp[0] && casoEsp[0].cuotaEspecial && casoEsp[0].cuotaEspecial > 0))) {
          console.log('%MES IMPAGO: ', 'color: #007acc;', fechaPago, pago.pagado, moment(fechaPago).diff(moment(fechaCorte), 'days'));
        const mesImpago: MesImpago = {
                                      fecha: fechaPago,
                                      mesAno: moment(fechaPago).format('MM-YYYY'),
                                      // eslint-disable-next-line max-len
                                      monto: casoEsp.length > 0 ? montoEspecial : (fechaPago > this.fbSrvc.parametrosFB.fechaCambioCuota) ? this.fbSrvc.parametrosFB.montoCuotaActual : this.fbSrvc.parametrosFB.montoCuotaAnterior,
                                      documento: '',
                                      idTransaccion: '',
                                     };
        this.fbSrvc.misMesesImpagos.push(mesImpago);
        this.totalDeuda += mesImpago.monto;
        this.mesesImpagos++;
      }
    }
    console.log('Meses Impagos: ', {meses: this.mesesImpagos, detalle: this.fbSrvc.misMesesImpagos, total: this.totalDeuda});
    if (this.mesesImpagos === 0 ) {
      this.estadoMisPagos = 'Al día';
      this.colorEstado = 'primary';
    } else if (this.mesesImpagos <= 3 ) {
      this.estadoMisPagos = 'Atrasado';
      this.colorEstado = 'warning';
    } else {
      this.estadoMisPagos = 'Deudor';
      this.colorEstado = 'danger';
    }
    this.fbSrvc.stopLoading();
  }
  getPagosDir() {
    console.log('getPagosDir :', this.idDir + '-' + this.idNum.toUpperCase());
    this.fbSrvc.loading('Actualizando pagos...');
    this.fbSrvc.getPagos(this.idDir + '-' + this.idNum.toUpperCase())
    .subscribe( pag => {
      if (pag && pag.length > 0) {
        console.log('%cmis-pagos.page.ts desde getPagosDir()', 'color: #007acc;', );
        this.completarPagos(pag);
      } else {
        this.misPagos = [];
        console.log('No hay Información de pagos.', pag);
      }
      this.fbSrvc.cargando = false;
      this.fbSrvc.stopLoading();
    });
  }
  ionViewWillEnter() {
    console.log('mis-pagos - ionViewWillEnter()');
    this.estadoPagos();
  }

  misAvisos() {
    this.router.navigate(['/mis-avisos-de-pago']);
  }
  mostrarMensaje(texto: string) {
    this.fbSrvc.mostrarMensaje(texto, 3000);
  }
  ngOnInit() {
    this.fbSrvc.getCasosEspeciales();
    if (this.fbSrvc.persona.esAdmin) {
      // this.ubicacionBoton = 'bottom';
      if (!this.fbSrvc.calles || this.fbSrvc.calles.length === 0 ) {
        this.fbSrvc.getCalles();
      }
    }
    this.fbSrvc.loading('Cargando Mis Pagos...');
    this.fbSrvc.cargando = true;
    this.idDir = this.fbSrvc.parametros.codigoDir.substring(0, this.fbSrvc.parametros.codigoDir.search('-'));
    // eslint-disable-next-line max-len
    this.idNum = this.fbSrvc.parametros.codigoDir.substring(this.fbSrvc.parametros.codigoDir.search('-') + 1, this.fbSrvc.parametros.codigoDir.length);
    const anoActual = moment().year();
    const anoInicial = this.fbSrvc.parametrosFB.maxAnoPagos;
    if (anoInicial && anoInicial > 0) {
      for (let index = anoActual; index >= anoInicial; index--) {
        this.anos.push(index);
      }
    } else {
      this.anos.push(moment().year());
    }
    console.log(this.anos);

    if (!this.fbSrvc.persona.esTesorero) {
      this.fbSrvc.getMisPagosNoAdm();
      setTimeout(() => {
        console.log('%cmis-pagos.page.ts desde getMisPagosNoadm()', 'color: #007acc;', );
        this.completarPagos(this.fbSrvc.misPagosNoAdm);
        this.fbSrvc.stopLoading();
      }, 2000);
    } else {
      this.fbSrvc.getMisPagos()
      .subscribe( pag => {
        if (pag && pag.length > 0) {
          console.log('%cmis-pagos.page.ts desde getMisPagos()', 'color: #007acc;', );
          this.completarPagos(pag);
        } else {
          console.log('No hay Información de pagos.');
        }
        this.fbSrvc.cargando = false;
        this.fbSrvc.stopLoading();
      });
    }
  }
  pagar(pos: number) {
    if (this.fbSrvc.persona.esTesorero) {
      this.misPagos[pos].pagado = !this.misPagos[pos].pagado;
      if (this.misPagos[pos].pagado) {
        this.misPagos[pos].comentario = `Aprobado por ${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno}`;
      } else {
        this.misPagos[pos].comentario = `Rechazado por ${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno}`;
      }
      // console.log(`pos[${pos}] pagado estaba en: ${this.misPagos[pos].pagado}`);
      this.fbSrvc.putPago(this.misPagos[pos])
      .then( () => {
        console.log(`pago actualizado OK`);
        this.fbSrvc.mostrarMensaje('Pago actualizado.');
      })
      .catch( err => {
        console.log('No se actualizó el pago: ', err);
        this.fbSrvc.mostrarMensaje('No se pudo actualizar el pago.');
      });
    }
  }
}
