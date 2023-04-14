import { AngularFireStorage } from '@angular/fire/compat/storage';
// import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { AvisoDePago } from '../../interfaces/fb-interface';
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
  totalDeuda = 0;
  totalAviso = 0;
  nuevoAvisoDePago: AvisoDePago = {
    estadoAviso: '0-Pendiente',
    fechaAprobacion: null,
    fechaAviso: null,
    fechaRechazo: null,
    idAvisoPago: '',
    idDireccion: this.fbSrvc.parametros.codigoDir,
    mesesPagados: [],
    montoPago: 0,
    obsResidente: '',
    obsRevisor: '',
    revisor: '',
    transfiere: ''
  };

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
    };
    await this.cam.getPicture(options)
    .then( async (result) => {
      this.fbSrvc.stopLoading();
      this.fbSrvc.loading('Cargando imagen...');
      const image = `data:image/jpeg;base64,${result}`;
      const ref = this.fbStorage.ref(`losMostos/avisosDePago/${name}`);
      await ref.putString(image, 'data_url')
      .then( task => {
        console.log('Imagen cargada ok: ', task);
        ref.getDownloadURL()
        .subscribe( url => {
          this.nuevoAvisoDePago.mesesPagados[pos].documento = url;
          this.totalAviso += this.nuevoAvisoDePago.mesesPagados[pos].monto;
          console.log('%cthis.nuevoAvisoDePago', 'color: #007acc;', this.nuevoAvisoDePago);
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
      console.log('Imagen eliminada!');
    });
    this.nuevoAvisoDePago.mesesPagados[pos].documento = '';
    this.totalAviso -= this.nuevoAvisoDePago.mesesPagados[pos].monto;
  }
  guardarAvisoDePago() {
    if (this.validarPagos()) {
      console.log('%cguardarAvisoDePago()', 'color: #007acc;');
      this.nuevoAvisoDePago.fechaAviso = moment().toDate();
      this.nuevoAvisoDePago.montoPago = this.totalAviso;
      console.log('%cthis.nuevoAvisoDePago', 'color: #007acc;', this.nuevoAvisoDePago);
      this.modalCtrl.dismiss({ guardar: 'SI', aviso: this.nuevoAvisoDePago });
    } else {
      this.fbSrvc.mostrarMensaje('Las deudas deben ser pagadas en orden desde la más antigua a la más nueva.', 6000);
    }
  }
  ngOnInit() {
    this.fbSrvc.misMesesImpagos.forEach(element => {
      this.totalDeuda += element.monto;
    });
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
    // console.log('%cthis.nuevoAvisoDePago ', 'color: #007acc;', this.nuevoAvisoDePago);
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
      const ref = this.fbStorage.ref(`losMostos/avisosDePago/${name}`);
      this.fbSrvc.stopLoading();
      this.fbSrvc.loading('Cargando fotografía...');
      const pictures = await ref.putString(image, 'data_url')
      .then( task => {
        console.log('Foto cargada ok: ', task);
        const fbUrl = ref.getDownloadURL()
        .subscribe( url => {
          console.log({url});
          this.nuevoAvisoDePago.mesesPagados[pos].documento = url;
          // this.nuevoAvisoDePago.mesesPagados[pos].monto = this.fbSrvc.misMesesImpagos[pos].monto;
          this.totalAviso += this.nuevoAvisoDePago.mesesPagados[pos].monto;
          console.log('%cthis.nuevoAvisoDePago', 'color: #007acc;', this.nuevoAvisoDePago);
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
