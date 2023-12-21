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
  validacionAviso = '';

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
    // Completa con el año siguiente si es Diciembre
    if (moment().month() === 11) { // 0 a 11
      for (let index = 1; index <= 12; index++) {
        const mesAno = moment(`1-${index}-${moment().year()+1}`,'DD-MM-YYYY').format('MM-YYYY');
        const estaPagado = this.fbSrvc.pagosDir.findIndex( dir => dir.ano ===  moment().year()+1 && dir.mes === index && dir.pagado === true);
        const estaAgregado = this.fbSrvc.misMesesImpagos.findIndex( dir => dir.mesAno ===  mesAno);
        if (estaPagado === -1 && estaAgregado === -1) {
          const newMesImpago: MesImpago = {
            fecha: moment(`1-${index}-${moment().year()+1}`,'DD-MM-YYYY').toDate(),
            mesAno,
            monto: this.fbSrvc.parametrosFB.montoCuotaActual,
            documento: '',
            idTransaccion: ''
          };
          this.fbSrvc.misMesesImpagos.push(newMesImpago);
        }
      }
    }
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
    if (this.nuevoAvisoDePago.mesesPagados[0].documento.length === 0) {
      this.validacionAviso = 'Falta agregar imagen del primer período.';
    } else if (this.nuevoAvisoDePago.mesesPagados.length > 1 && !this.validarPagos()) {
      this.validacionAviso = 'Los períodos deben ser avisados de manera cronológica.';
    } else if (this.nuevoAvisoDePago.transfiere.length === 0) {
      this.validacionAviso = 'Falta el nombre de quien hizo la transferencia';
    } else if (!this.fechaTransf) {
      this.validacionAviso = 'Falta indicar fecha de la transferencia';
    } else if (moment(this.fechaTransf).toDate() > moment().toDate()) {
      this.validacionAviso = 'Fecha de la transferencia no puede ser a futuro';
    } else {
      this.validacionAviso = 'OK';
    }
  }
  validarPagos(): boolean {
    let laguna = false;
    let retorno = true;
    // Validación del pagos en orden
    // Busco si la primera deuda no está ok retorna de inmediato
    if (this.nuevoAvisoDePago.mesesPagados[0].documento.length === 0) {
      return false;
    } else {
      // recorro arreglo de pagos para ver que no hayan lagunas
      this.nuevoAvisoDePago.mesesPagados.forEach(element => {
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
