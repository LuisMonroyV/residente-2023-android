import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { AvisoDePago, MesImpago } from '../../interfaces/fb-interface';
import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-modal-aviso-de-pago',
  templateUrl: './modal-aviso-de-pago.component.html',
  styleUrls: ['./modal-aviso-de-pago.component.scss'],
})
export class ModalAvisoDePagoComponent implements OnInit {
  fechaCorte = moment().startOf('month').toDate(); // primero del mes
  fechaTransf = null;
  misAvisosDePago: AvisoDePago[] = [];
  nuevoAvisoDePago: AvisoDePago = {
    estadoAviso: '0-Pendiente',
    fechaAprobacion: null,
    fechaAviso: null,
    fechaRechazo: null,
    fechaTransferencia: null,
    idAvisoPago: '',
    idDireccion: this.fbSrvc.parametros.codigoDir,
    mesesPagados: [],
    montoPago: 0,
    obsResidente: '',
    obsRevisor: '',
    revisor: '',
    transfiere: ''
  };
  totalDeuda = 0;
  totalAviso = 0;
  paso = 1;
  validacionAviso = '';
  validacionAvisoP1 = 'Seleccionar la imagen del período a informar.';
  validacionAvisoP2 = 'Seleccionar la imagen del período a informar.';
  validacionAvisoP3 = 'Seleccionar la imagen del período a informar.';
  verElFuturo = false;
  constructor(
              private cam: Camera,
              public fbSrvc: FirebaseService,
              private fbStorage: AngularFireStorage,
              private modalCtrl: ModalController,
            ) { }

  async abrirGaleria(pos: number) {
    console.log(`%cabrirGalería(${pos})`);
    this.fbSrvc.loading('Abriendo galería...');
    const name = `${this.nuevoAvisoDePago.idDireccion}-` + new Date().getTime();
    const options: CameraOptions = {
      allowEdit: true,
      sourceType: this.cam.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.cam.DestinationType.DATA_URL,
      // destinationType: this.cam.DestinationType.FILE_URI,
    };
    await this.cam.getPicture(options)
    .then( async (result) => {
      this.fbSrvc.stopLoading();
      this.fbSrvc.loading('Cargando imagen...');
      const image = `data:image/jpeg;base64,${result}`;
      const ref = this.fbStorage.ref(`losMostos/avisosDePago/${this.nuevoAvisoDePago.idDireccion}/${name}`);
      await ref.putString(image, 'data_url')
      .then( task => {
        console.log('Imagen cargada ok: ', task);
        ref.getDownloadURL()
        .subscribe( url => {
          this.nuevoAvisoDePago.mesesPagados[pos].documento = url;
          this.totalAviso += this.nuevoAvisoDePago.mesesPagados[pos].monto;
          console.log('%cthis.nuevoAvisoDePago', 'color: #007acc;', this.nuevoAvisoDePago);
          this.validarAviso();
        });
        this.fbSrvc.stopLoading();
      })
      .catch( err => {
        console.log('Error al cargar la imagen: ', err);
        this.fbSrvc.mostrarMensaje('No se pudo cargar la imagen.');
        this.fbSrvc.stopLoading();
      });
    })
    .catch( err => {
      console.log('Error al recuperar foto de la galería. ', err);
      this.fbSrvc.mostrarMensaje('No se pudo abrir la galería.');
      this.fbSrvc.stopLoading();
    });
  }
  anterior() {
    this.paso--;
  }
  casoEspecialCero( idDir: string, mesAno: string) : boolean {
    const anoMes = moment(`1-${mesAno}`,'DD-MM-YYYY').format('YYYY-MM');
    const  casoEsp = this.fbSrvc.casosEspeciales.filter( caso => caso.idDireccion === idDir &&
                  caso.cuotaEspecial === 0 &&
                  moment(anoMes).isBetween(`${caso.fechaInicioCuotaEspecial}-01`, caso.fechaTerminoCuotaEspecial ? `${caso.fechaTerminoCuotaEspecial}-01` : undefined, 'day', '[]'));
    return casoEsp.length > 0; 
  }
  cerrarModal() {
    console.log('%ccerrarModal()', 'color: #007acc;');
    this.modalCtrl.dismiss();
  }
  deseleccionarMes(pos: number) {
    console.log(`%cdeseleccionarMes(${pos})`, 'color: #007acc;');
    // Borrado de la imagen
    const ref = this.fbStorage.refFromURL(this.nuevoAvisoDePago.mesesPagados[pos].documento);
    ref.delete()
    .subscribe( () => {
      this.nuevoAvisoDePago.mesesPagados[pos].documento = '';
      this.totalAviso -= this.nuevoAvisoDePago.mesesPagados[pos].monto;
      if (this.totalAviso < 0) {
        this.totalAviso = 0;
      }
      this.validarAviso();
      console.log('Imagen eliminada!');
    });
  }
  guardarAvisoDePago() {
    if (this.validarPagos()) {
      console.log('%cguardarAvisoDePago()', 'color: #007acc;');
      this.nuevoAvisoDePago.fechaAviso = moment().toDate();
      this.nuevoAvisoDePago.fechaTransferencia = moment(this.fechaTransf).toDate();
      this.nuevoAvisoDePago.montoPago = this.totalAviso;
      console.log('%cthis.nuevoAvisoDePago', 'color: #007acc;', this.nuevoAvisoDePago);
      this.modalCtrl.dismiss({ guardar: 'SI', aviso: this.nuevoAvisoDePago });
    } else {
      this.fbSrvc.mostrarMensaje('Las deudas deben ser pagadas en orden desde la más antigua a la más nueva.', 6000);
    }
  }
  ngOnInit() {
    this.totalDeuda = 0;
    this.totalAviso = 0;
    this.nuevoAvisoDePago.mesesPagados = [];

    this.fbSrvc.misMesesImpagos.forEach(element => {
      if (element.fecha <= this.fechaCorte) {
        this.totalDeuda += element.monto;
      }
      element.documento = '';
    });
    // Completa con el año siguiente si es Diciembre, sino con el año actual
    let año = moment().year();
    if (moment().month() === 11) { // 0 a 11
      año++;
    }
    for (let index = 1; index <= 12; index++) {
      const mesAno = moment(`1-${index}-${año}`,'DD-MM-YYYY').format('MM-YYYY');
      const estaPagado = this.fbSrvc.pagosDir.findIndex( dir => dir.ano ===  año && dir.mes === index && dir.pagado === true);
      const estaAgregado = this.fbSrvc.misMesesImpagos.findIndex( dir => dir.mesAno ===  mesAno);
      if (estaPagado === -1 && estaAgregado === -1) {
        if ( !this.casoEspecialCero(this.fbSrvc.idDirConsulta, mesAno )) {
          const newMesImpago: MesImpago = {
            fecha: moment(`1-${index}-${año}`,'DD-MM-YYYY').toDate(),
            mesAno,
            monto: this.fbSrvc.parametrosFB.montoCuotaActual,
            documento: '',
            idTransaccion: ''
          };
          this.fbSrvc.misMesesImpagos.push(newMesImpago);
        }
        else {
          // Si el período es un CE-0 entonces se csca de los impagos
          this.fbSrvc.misMesesImpagos.splice(index, 1);
        }
      }
    }
    this.fbSrvc.getMisAvisosDePago()
    .subscribe( dataAP => {
      this.misAvisosDePago = [];
      if (dataAP && dataAP.length > 0) {
        this.misAvisosDePago = dataAP;
      }
    });
    setTimeout(() => {
      this.rebajarPendientes(this.misAvisosDePago);
    }, 500);
    // orden cronológico
    this.fbSrvc.misMesesImpagos = this.fbSrvc.misMesesImpagos.sort((a,b) => {
      if ( a.fecha < b.fecha ){
        return -1;
      }
      if ( a.fecha > b.fecha ){
        return 1;
      }
      return 0;
    });
    this.nuevoAvisoDePago.mesesPagados = this.fbSrvc.misMesesImpagos;
    //console.log('%cthis.nuevoAvisoDePago ', 'color: #007acc;', this.nuevoAvisoDePago);
  }
  rebajarPendientes(avisos: AvisoDePago[]) {
    // rebajo los pagos pendientes de los impagos
    avisos.forEach( element => {
      if (element.estadoAviso === '0-Pendiente') {
        element.mesesPagados.forEach( mesP => {
          // ubico la fecha en el arreglo de meses impagos
          const posImpago = this.fbSrvc.misMesesImpagos.findIndex( mesesImp => mesesImp.mesAno === mesP.mesAno );
          if (posImpago > -1) {
            this.fbSrvc.misMesesImpagos[posImpago].idTransaccion = 'Pendiente';
          }
        });
      }
    });
    console.log('Mis meses impagos Rebajados: ', this.fbSrvc.misMesesImpagos);
  }
  siguiente() {
    this.paso++;
    this.validarAviso();
  }

  async tomarFoto(pos: number) {
    console.log(`%ctomarFoto(${pos})`);
    const name = `${this.nuevoAvisoDePago.idDireccion}-` + new Date().getTime();
    const options: CameraOptions = {
      quality: 50,
      targetWidth: 1000,
      targetHeight: 1000,
      destinationType: this.cam.DestinationType.DATA_URL,
      encodingType: this.cam.EncodingType.PNG,
      mediaType: this.cam.MediaType.PICTURE,
      correctOrientation: true
    };
    await this.cam.getPicture(options)
    .then( async (result) => {
      const image = `data:image/jpeg;base64,${result}`;
      const ref = this.fbStorage.ref(`losMostos/avisosDePago/${this.nuevoAvisoDePago.idDireccion}/${name}`);
      this.fbSrvc.stopLoading();
      this.fbSrvc.loading('Cargando fotografía...');
      const pictures = await ref.putString(image, 'data_url')
      .then( task => {
        console.log('Foto cargada ok: ', task);
        const fbUrl = ref.getDownloadURL()
        .subscribe( url => {
          console.log({url});
          this.nuevoAvisoDePago.mesesPagados[pos].documento = url;
          this.totalAviso += this.nuevoAvisoDePago.mesesPagados[pos].monto;
          console.log('%cthis.nuevoAvisoDePago', 'color: #007acc;', this.nuevoAvisoDePago);
          this.validarAviso();
          this.fbSrvc.stopLoading();
        });
        this.fbSrvc.stopLoading();
      })
      .catch( err => {
        console.log('Error al cargar la foto: ', err);
        this.fbSrvc.mostrarMensaje('No se pudo cargar la foto.');
        this.fbSrvc.stopLoading();
      });

    })
    .catch( err => {
      console.log('Error al tomar la foto. ', err);
      this.fbSrvc.stopLoading();
    });
  }
  validarAviso() {
    if (this.paso === 1) {
      // saco posible avisos pendientes
      const mesesValidos = this.nuevoAvisoDePago.mesesPagados.filter( pagoOk => pagoOk.idTransaccion != 'Pendiente');
      this.validacionAvisoP1 = '';
      if (mesesValidos[0].documento.length === 0) {
        this.validacionAvisoP1 = 'Agregar imagen del primer período.';
      } else if (mesesValidos.length > 1 && !this.validarPagos()) {
        this.validacionAvisoP1 = 'Informar los períodos de manera cronológica.';
      } else {
        this.validacionAvisoP1 = 'OK';
      }
    } else if (this.paso === 2) {
      this.validacionAvisoP2 = '';
      if (this.nuevoAvisoDePago.transfiere.length === 0) {
        this.validacionAvisoP2 = 'Indicar el nombre de quien hizo la transferencia';
      } else {
        this.validacionAvisoP2 = 'OK';
      }
    } else if (this.paso === 3) {
      this.validacionAvisoP3 = '';
      if (!this.fechaTransf) {
        this.validacionAvisoP3 = 'Indicar fecha de la transferencia';
      } else if (moment(this.fechaTransf).toDate() > moment().toDate()) {
        this.validacionAvisoP3 = 'Indicar la fecha de la transferencia (no puede ser a futuro)';
      } else {
        this.validacionAvisoP3 = 'OK';
      }
    }
  }
  validarPagos(): boolean {
    // saco posible avisos pendientes
    const mesesValidos = this.nuevoAvisoDePago.mesesPagados.filter( pagoOk => pagoOk.idTransaccion != 'Pendiente');
    let laguna = false;
    let retorno = true;
    // Validación del pagos en orden
    // Busco si la primera deuda no está ok retorna de inmediato
    if (mesesValidos[0].documento.length === 0) {
      return false;
    } else {
      // recorro arreglo de pagos para ver que no hayan lagunas
      mesesValidos.forEach(element => {
        // laguna es un orden impago - pago
        if (element.documento.length === 0) {
          laguna = true;
        } else if (element.documento.length > 0 && laguna) {
          retorno = false;
        }
      });
    }
    return retorno;
  }
}
