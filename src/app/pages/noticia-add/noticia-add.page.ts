import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { Noticia } from '../../interfaces/fb-interface';
import { PushService } from '../../services/push.service';
import { Router } from '@angular/router';
import { WebView } from '@awesome-cordova-plugins/ionic-webview/ngx';
import * as  moment from 'moment';

@Component({
  selector: 'app-noticia-add',
  templateUrl: './noticia-add.page.html',
  styleUrls: ['./noticia-add.page.scss'],
})

export class NoticiaAddPage implements OnInit {
  creandoNoticia = false;
  duracion = this.fbSrvc.parametrosFB.maxDiasNoticias;
  hoy = moment().toISOString(true);
  nuevaNoticia: Noticia = {
    creadaPor: `${this.fbSrvc.persona.nombres} ${this.fbSrvc.persona.apellidoPaterno}`,
    fecha: moment().utc().toDate(),
    fechaFin: moment().add(this.fbSrvc.parametrosFB.maxDiasNoticias, 'days').utc().toDate(),
    idNoticia: null,
    notificar: true,
    titulo: '',
    texto: '',
    urlImagen: ''
  };
  sinImagen = this.webview.convertFileSrc('assets/images/no-image2.png');

  constructor( private fbSrvc: FirebaseService,
               private router: Router,
               private cam: Camera,
               private fbStorage: AngularFireStorage,
               private pushSrvc: PushService,
               private webview: WebView) { }

  ngOnInit() {
  }
  guardarNoticia() {
    this.creandoNoticia = true;
    this.nuevaNoticia.fecha = moment(this.nuevaNoticia.fecha).toDate();
    this.nuevaNoticia.fechaFin = moment().endOf('day').add(this.duracion, 'days').toDate();
    this.fbSrvc.postNoticia(this.nuevaNoticia)
      .then( idNot => {
        this.fbSrvc.mostrarMensaje('Noticia guardada.');
      })
      .catch( err => {
        this.fbSrvc.mostrarMensaje('No se pudo guardar la Noticia. ' + err);
      });
    if (this.nuevaNoticia.notificar) {
      this.pushSrvc.notificarNoticia(this.nuevaNoticia.titulo)
      .then( () => {
        console.log('Notificación enviada');
      })
      .catch( err => {
        this.fbSrvc.mostrarMensaje('No se pudo enviar la notificación. ' + err);
      });
    }
    this.router.navigate(['/folder/inicio']);
  }
  async tomarFoto() {
    console.log('iniciando cámara...');
    const name = 'noticia-' + new Date().getTime();
    const options: CameraOptions = {
      targetWidth: 600,
      targetHeight: 600,
      destinationType: this.cam.DestinationType.DATA_URL,
      encodingType: this.cam.EncodingType.JPEG,
      mediaType: this.cam.MediaType.PICTURE,
      correctOrientation: true
    };
    await this.cam.getPicture(options)
    .then( async (result) => {
      this.fbSrvc.loading('Iniciando cámara...');
      const image = `data:image/jpeg;base64,${result}`;
      const ref = this.fbStorage.ref(`losMostos/noticias/${name}`);
      this.fbSrvc.stopLoading();
      this.fbSrvc.loading('Cargando fotografía...');
      const pictures = await ref.putString(image, 'data_url')
      .then( task => {
        console.log('Foto cargada ok: ', task);
        const fbUrl = ref.getDownloadURL()
        .subscribe( url => {
          console.log({url});
          this.nuevaNoticia.urlImagen = url;
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
  async abrirGaleria() {
    console.log('Abriendo Galería...');
    // debugger;
    this.fbSrvc.loading('Abriendo galería...');
    const name = 'noticia-' + new Date().getTime();
    const options: CameraOptions = {
      sourceType: this.cam.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.cam.DestinationType.DATA_URL,
    };
    await this.cam.getPicture(options)
    .then( async (result) => {
      this.fbSrvc.stopLoading();
      this.fbSrvc.loading('Cargando imagen...');
      const image = `data:image/jpeg;base64,${result}`;
      const ref = this.fbStorage.ref(`losMostos/noticias/${name}`);
      await ref.putString(image, 'data_url')
      .then( task => {
        console.log('Imagen cargada ok: ', task);
        ref.getDownloadURL()
        .subscribe( url => {
          this.nuevaNoticia.urlImagen = url;
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
  limpiarNoticia() {
    this.nuevaNoticia.fecha = null;
    this.nuevaNoticia.texto = '';
    this.nuevaNoticia.titulo = '';
    this.nuevaNoticia.urlImagen = '';
    this.nuevaNoticia.idNoticia = '';
    this.nuevaNoticia.notificar = false;
  }
  cerrar() {
    this.limpiarNoticia();
    this.router.navigate(['/folder/inicio']);
  }
}
