import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { Persona, Visita } from '../../interfaces/fb-interface';
import { ModalController, AlertController } from '@ionic/angular';
import { ModalVisitasComponent } from '../../components/modal-visitas/modal-visitas.component';
import { Router } from '@angular/router';

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
               private alertCtrl: AlertController,
               private router: Router) { }

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
    if (this.misVisitas.idDireccion.length > 0 && 
      ((this.misVisitas.autorizados.length + this.misVisitas.rechazados.length) > 0)) {
      this.fbSrvc.postVisitas(this.misVisitas)
        .then( () => {
          console.log('Visitas actualizadas.');
          console.log(this.misVisitas);
        })
        .catch( err => {
          console.error('Error al actualizar visitas');
        });
      }
    this.guardando = false;
  }
  eliminarCuenta() {
    let cambios: Persona = {...this.fbSrvc.persona};
    cambios.adminOk = false;
    cambios.emailOk = false;
    cambios.estado = '1-rechazado';
    cambios.obs = 'Eliminación de datos solicitada por el residente';
    this.fbSrvc.putPersona(cambios);
    this.fbSrvc.persona.adminOk = false;
    setTimeout(() => {
      this.limpiarParametros();
      this.router.navigate(['activar-mail']);      
    }, 500);
  }
  eliminarVisitaAutorizada( pos: number) {
    this.misVisitas.autorizados.splice(pos, 1);
    this.guardarCambios();
  }
  eliminarVisitaRechazada( pos: number) {
    this.misVisitas.rechazados.splice(pos, 1);
    this.guardarCambios();
  }
  limpiarParametros() {
    this.fbSrvc.parametros.validado = false;
    this.fbSrvc.parametros.verificado = false;
    this.fbSrvc.parametros.identificado = false;
    this.fbSrvc.parametros.primeraVez = false;
    this.fbSrvc.guardarStorage('parametros', this.fbSrvc.parametros);
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
    let header = 'Eliminación de datos de tu cuenta';
    let message = '¿Estás seguro que deseas eliminar tu cuenta?, no podrás registrarte nuevamente hasta 30 días más.'
    if (tipo != 'Cuenta') {
      header = 'Eliminar Visita ' + tipo;
      message = 'Seguro deseas <strong>eliminar</strong> esta visita?'  
    }
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Si, estoy seguro',
          handler: () => {
            if (tipo === 'Autorizada') {
              this.eliminarVisitaAutorizada( pos );
            } else if (tipo === 'Rechazada'){
              this.eliminarVisitaRechazada( pos );
            } else {
              this.eliminarCuenta();
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
