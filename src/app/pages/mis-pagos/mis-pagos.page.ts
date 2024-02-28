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
  anoActual = moment().year();
  anoInicial = this.fbSrvc.parametrosFB.maxAnoPagos;
  anos = [];
  colorEstado = 'success';
  direcciones: Pago[] = [];
  estadoMisPagos = '';
  idDir = '';
  idDireccion = '';
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
                  idDireccion: this.idDireccion,
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
  // Completa los períodos no pagados
  completarPagos(pag: Pago[]) {
    this.misPagos = [];
    console.log(`${pag.length} pago(s)`);
    // Completo los meses no informados
    this.anos.forEach(ano => {
      for (let mes = 1; mes <= 12; mes++) {
        const existe = pag.filter( data => data.ano === ano.ano && data.mes === mes);
        if (existe.length > 0) {
          this.misPagos.push(existe[0]);
        } else {
          const valorAno = ano.ano;
          const objVacio: Pago = { ano: valorAno,
                                   comentario: null,
                                   idDireccion: this.idDireccion,
                                   mes,
                                   pagado: false,
                                   ultAct: null
                                 };
          this.misPagos.push(objVacio);
        }
      }
    });
    console.log('this.misPagos: ', this.misPagos);
    this.fbSrvc.pagosDir = this.misPagos;
    this.estadoPagos();
  }
  estadoPagos() {
    console.log('%cmis-pagos.page.ts estadoPagos()', 'color: #007acc;');
    this.mesesImpagos = 0;
    this.fbSrvc.misMesesImpagos = [];
    this.totalDeuda = 0;
    let casoEsp = [];
    let fechaCorte = moment().startOf('month').toDate();
    console.log('Fecha de Corte: ', fechaCorte);
    // Limpia valores de totales pagados
    this.anos.forEach(ano => {
      ano.pagado = 0;
      ano.porPagar = 0;
    })
    for (let index = 0; index < this.misPagos.length; index++) {
      const pago = this.misPagos[index];
      const fechaPago = moment(`1-${pago.mes}-${pago.ano}`,'DD-MM-YYYY').startOf('day').toDate();
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
      const montoPago = casoEsp.length > 0 ? montoEspecial : (fechaPago > this.fbSrvc.parametrosFB.fechaCambioCuota) ? this.fbSrvc.parametrosFB.montoCuotaActual : this.fbSrvc.parametrosFB.montoCuotaAnterior;
      if (!pago.pagado && (moment(fechaPago).diff(moment(fechaCorte), 'days') <= 0) &&
         (casoEsp.length === 0 || (casoEsp && casoEsp[0] && casoEsp[0].cuotaEspecial && casoEsp[0].cuotaEspecial > 0))) {
          console.log('%MES IMPAGO: ', 'color: #007acc;', fechaPago, pago.pagado, moment(fechaPago).diff(moment(fechaCorte), 'days'));          
          const mesImpago: MesImpago = {
                                        fecha: fechaPago,
                                        mesAno: moment(fechaPago).format('MM-YYYY'),
                                        monto: montoPago,
                                        documento: '',
                                        idTransaccion: '',
                                      };
        this.fbSrvc.misMesesImpagos.push(mesImpago);
        this.totalDeuda += mesImpago.monto;
        this.mesesImpagos++;
        let posAnoImpago = this.anos.findIndex(ubic => ubic.ano === pago.ano);
        this.anos[posAnoImpago].porPagar += montoPago;
    } else {
        if ((moment(fechaPago).diff(moment(fechaCorte), 'days') <= 0) || pago.pagado) {
          let posAnoPagado = this.anos.findIndex(ubic => ubic.ano === pago.ano);
          this.anos[posAnoPagado].pagado += montoPago;
        }
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
    this.idDireccion = this.idDir + '-' + this.idNum.toUpperCase();
    this.fbSrvc.loading('Actualizando pagos...');
    this.fbSrvc.getPagosDir(this.idDir + '-' + this.idNum.toUpperCase())
    .subscribe( pag => {
      if (pag && pag.length > 0) {
        this.fbSrvc.pagosDir = pag;
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
    // this.estadoPagos();
  }
  misAvisos() {
    this.router.navigate(['/mis-avisos-de-pago']);
  }
  ngOnInit() {
    this.fbSrvc.getCasosEspeciales();
    if (this.fbSrvc.persona.esAdmin) {
      if (!this.fbSrvc.calles || this.fbSrvc.calles.length === 0 ) {
        this.fbSrvc.getCalles();
      }
    }
    this.fbSrvc.loading('Cargando Mis Pagos...');
    this.fbSrvc.cargando = true;
    this.idDir = this.fbSrvc.parametros.codigoDir.substring(0, this.fbSrvc.parametros.codigoDir.search('-'));
    // eslint-disable-next-line max-len
    this.idNum = this.fbSrvc.parametros.codigoDir.substring(this.fbSrvc.parametros.codigoDir.search('-') + 1, this.fbSrvc.parametros.codigoDir.length);
    this.idDireccion = this.idDir + '-' + this.idNum.toUpperCase();
    // En Diciembre ya se visualiza el año siguiente
    if (moment().month() === 11) { // 0 a 11
      const obj1 = { ano: moment().year()+1,
        pagado: 0,
        porPagar: this.fbSrvc.parametrosFB.montoCuotaActual * 12
      };
      this.anos.push(obj1);
    }
    if (this.anoInicial && this.anoInicial > 0) {
      for (let index = this.anoActual; index >= this.anoInicial; index--) {
        const obj2 = { ano: index,
                      pagado: 0,
                      porPagar: 0
                    };
        this.anos.push(obj2);
      }
    } else {
      const obj3 = { ano: moment().year(),
                    pagado: 0,
                    porPagar: 0
                  };
      this.anos.push(obj3);
    }
    console.log('Años a  mostrar: ', this.anos);

    if (!this.fbSrvc.persona.esTesorero) {
      this.fbSrvc.getMisPagosNoAdm()
      .then(() => {
        console.log('%cmis-pagos.page.ts desde getMisPagosNoadm()', 'color: #007acc;', );
        this.completarPagos(this.fbSrvc.pagosDir);
        this.fbSrvc.stopLoading();
      })
      .catch( err => {
        console.error('mis-pagos.page.ts Error en getMisPagosNoadm(): ', err );
      });
    } else {
      this.fbSrvc.getPagosDir(this.idDireccion)
      .subscribe( pag => {
        if (pag && pag.length > 0) {
          this.completarPagos(pag);
          this.fbSrvc.pagosDir = pag;
        }
      });
      this.fbSrvc.cargando = false;
      this.fbSrvc.stopLoading();
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
      // Pago existente
      if (this.misPagos[pos].ultAct) {
        this.fbSrvc.putPago(this.misPagos[pos])
        .then( () => {
          console.log(`pago actualizado OK`);
          this.fbSrvc.mostrarMensaje('Pago actualizado.');
        })
        .catch( err => {
          console.log('No se actualizó el pago: ', err);
          this.fbSrvc.mostrarMensaje('No se pudo actualizar el pago.');
        });
      } else { // Pago nuevo
        this.misPagos[pos].ultAct = moment().toISOString(true);
        this.fbSrvc.postPago(this.misPagos[pos])
        .then( () => {
          console.log(`pago ingresado OK`);
          this.fbSrvc.mostrarMensaje('Pago ingresado.');
        })
        .catch( err => {
          console.log('No se ingresó el pago: ', err);
          this.fbSrvc.mostrarMensaje('No se pudo ingresar el pago.');
        });

      }
    }
  }
}
