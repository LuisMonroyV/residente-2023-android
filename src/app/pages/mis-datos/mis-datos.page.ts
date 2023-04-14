import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { Visita } from '../../interfaces/fb-interface';
import { ModalController, AlertController, IonInput, IonToggle } from '@ionic/angular';
import { ModalVisitasComponent } from '../../components/modal-visitas/modal-visitas.component';

@Component({
  selector: 'app-mis-datos',
  templateUrl: './mis-datos.page.html',
  styleUrls: ['./mis-datos.page.scss'],
})
export class MisDatosPage implements OnInit {
  guardando = false;
  nuevaVisita = '';
  segmento = 'autorizadas';
  misVisitas: Visita = {
    idDireccion: this.fbSrvc.parametros.codigoDir,
    autorizados: [],
    rechazados: []
  };

  constructor( public fbSrvc: FirebaseService,
               private modalCtrl: ModalController,
               private alertCtrl: AlertController) { }

  ngOnInit() {
    this.fbSrvc.getMisVisitas()
    .subscribe( vis => {
      if (vis && vis.length > 0) {
        this.misVisitas = vis[0];
      } else {
        this.misVisitas.idDireccion = this.fbSrvc.parametros.codigoDir;
      }
    });
    if (this.fbSrvc.persona.esAdmin) {
      this.fbSrvc.deleteQRs();
    }
  }
  guardarCambios() {
    console.log('Guardando Datos.');
    this.guardando = true;
    this.fbSrvc.putPersona(this.fbSrvc.persona);
    this.fbSrvc.guardarStorage('parametros', this.fbSrvc.parametros);
    this.fbSrvc.postVisitas(this.misVisitas)
    .then( () => {
      console.log('Visitas actualizadas.');
      console.log(this.misVisitas);
    })
    .catch( err => {
      console.error('Error al actualizar visitas');
    });
    this.guardando = false;
  }
  eliminarVisitaAutorizada( pos: number) {
    this.misVisitas.autorizados.splice(pos, 1);
    this.guardarCambios();
  }
  eliminarVisitaRechazada( pos: number) {
    this.misVisitas.rechazados.splice(pos, 1);
    this.guardarCambios();
  }
  async modalVisita() {
    const modalOpc = await this.modalCtrl.create({
      component: ModalVisitasComponent,
      componentProps: {
        guardar: '?',
        visita: ''
      }
    });
    await modalOpc.present();
    const {data} = await modalOpc.onDidDismiss();
    if (data) {
      if (data.guardar === 'SI') {
        this.nuevaVisita = data.visita;
        if (this.segmento === 'autorizadas') {
          this.misVisitas.autorizados.push(this.nuevaVisita);
          this.guardarCambios();
        } else {
          this.misVisitas.rechazados.push(this.nuevaVisita);
          this.guardarCambios();
        }
      }
    }
  }
  async confirmacion( pos: number, tipo: string ) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Visita ' + tipo,
      message: 'Seguro deseas <strong>eliminar</strong> esta visita?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Si',
          handler: () => {
            if (tipo === 'Autorizada') {
              this.eliminarVisitaAutorizada( pos );
            } else {
              this.eliminarVisitaRechazada( pos );
            }
          }
        }
      ]
    });
    await alert.present();
  }
  segmentChanged($event) {
    this.segmento = $event.detail.value;
  }
}
