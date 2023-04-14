import { Component, OnInit } from '@angular/core';
import { Aviso } from '../../interfaces/fb-interface';
import { FirebaseService } from '../../services/firebase.service';
import { ModalAvisoComponent } from '../../components/modal-aviso/modal-aviso.component';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-aviso',
  templateUrl: './aviso.page.html',
  styleUrls: ['./aviso.page.scss'],
})
export class AvisoPage implements OnInit {
  misAvisos: Aviso[] = [];
  misAvisosProgramados: Aviso[] = [];

  constructor( public fbSrvc: FirebaseService,
               private modalCtrl: ModalController,
             ) {
  }
  ionViewWillLeave() {
    console.log(' Aviso Page - ionViewWillLeave()');
  }
  ngOnInit() {
    this.fbSrvc.getMisAvisos()
    // tslint:disable-next-line: deprecation
    .subscribe(avi => {
      if (avi && avi.length > 0) {
        this.misAvisos = avi;
      } else {
        this.misAvisos = [];
      }
    });
    this.fbSrvc.getMisAvisosProgramados()
    // tslint:disable-next-line: deprecation
    .subscribe( avip => {
      if (avip && avip.length > 0) {
        this.misAvisosProgramados = avip;
      } else {
        this.misAvisosProgramados = [];
      }
    });

  }
  guardarAviso( av: Aviso) {
    console.log('guardarAviso()');
    if (av.empresa && av.empresa.length > 0) {
      av.empresa = av.empresa.toUpperCase();
    }
    if (av.nota && av.nota.length > 0) {
      av.nota = av.nota.toUpperCase();
    }
    if (av.patente && av.patente.length > 0) {
      av.patente = av.patente.toUpperCase();
    }
    // console.log('fecha de aviso: ', this.nuevoAviso.fecha);
    this.fbSrvc.postAviso(av)
    .catch(err => {
      console.log('Error al guardar aviso: ', err);
      this.fbSrvc.mostrarMensaje('No se pudo guardar el aviso, reintenta en unos momentos.');
    });
  }
  borrarAviso(pos: number) {
    this.fbSrvc.deleteAviso(this.misAvisos[pos].idAviso)
    .then( () => {
      this.fbSrvc.mostrarMensaje('Aviso eliminado');
      if (this.misAvisos.length === 0) {
        this.misAvisos = [];
      }
    })
    .catch(err => {
      console.log('Error al borrar aviso: ', err);
      this.fbSrvc.mostrarMensaje('No se pudo borrar el aviso, reintenta en unos momentos.');
    });
  }
  borrarAvisoProgramado(pos: number) {
    this.fbSrvc.deleteAviso(this.misAvisosProgramados[pos].idAviso)
    .then( () => {
      this.fbSrvc.mostrarMensaje('Aviso programado eliminado');
      if (this.misAvisosProgramados.length === 0) {
        this.misAvisosProgramados = [];
      }
    })
    .catch(err => {
      console.log('Error al borrar aviso programado: ', err);
      this.fbSrvc.mostrarMensaje('No se pudo borrar el aviso programado, reintenta en unos momentos.');
    });
  }
  async nuevoAviso() {
    const modalOpc = await this.modalCtrl.create({
      component: ModalAvisoComponent,
    });
    await modalOpc.present();
    const {data} = await modalOpc.onDidDismiss();
    if (data) {
      if (data.guardar === 'SI') {
        this.guardarAviso(data.aviso);
      }
    }
  }
}
