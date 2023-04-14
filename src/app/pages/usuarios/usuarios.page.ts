import { Component, OnInit, ViewChild } from '@angular/core';
// import { CallNumber } from '@ionic-native/call-number/ngx';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { FirebaseService } from '../../services/firebase.service';
import { Persona } from '../../interfaces/fb-interface';
import { ModalController, IonList, IonInfiniteScroll } from '@ionic/angular';
import { ModalRechazoComponent } from '../../components/modal-rechazo/modal-rechazo.component';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {
  @ViewChild('listaNuevos', { static: false }) listaN: IonList;
  @ViewChild('listaActuales', { static: false }) listaA: IonList;
  @ViewChild('infinite', {static: false}) infinite: IonInfiniteScroll;
  personasNuevas: Persona[] = [];
  personasReplica: Persona[] = [];
  personasRegistradas: Persona[] = [];
  motivo = '';
  textoBuscar = '';
  totalRegistrados = 0;
  maxView = 50;

  constructor( public fbSrvc: FirebaseService,
               private modalCtrl: ModalController,
               private call: CallNumber ) { }

  aprobar( id: string, tipo: string) {
    let pos = 0;
    if (tipo === 'nuevos') {
      pos = this.personasNuevas.findIndex(per => per.idPersona === id);
    } else {
      pos = this.personasRegistradas.findIndex(per => per.idPersona === id);
    }
    console.log(`Posición ${tipo}: ${pos}`);
    if (pos >= 0) {
      if (tipo === 'nuevos') {
        this.listaN.closeSlidingItems();
        if (this.personasNuevas[pos].emailOk) {
          this.personasNuevas[pos].adminOk = true;
          this.personasNuevas[pos].estado = '2-vigente';
          this.personasNuevas[pos].obs = '';
          this.fbSrvc.putPersona(this.personasNuevas[pos]);
        } else {
          this.fbSrvc.mostrarMensaje('No se puede aprobar sin haber validado el correo', 5000);
        }
      } else {
        this.listaA.closeSlidingItems();
        this.personasRegistradas[pos].adminOk = true;
        this.personasRegistradas[pos].estado = '2-vigente';
        this.personasRegistradas[pos].obs = '';
        this.fbSrvc.putPersona(this.personasRegistradas[pos]);
      }
    }
  }
  buscarUsuario(event) {
    console.log('Buscar: ', event.target.value.toLowerCase());
    this.textoBuscar = event.target.value.toLowerCase();
  }
  cargarUsuarios( event ) {
    console.log('cargarUsuarios()');
    this.fbSrvc.cargando = true;
    this.maxView += 50;
    console.log('maxView: ', this.maxView);
    event.target.complete();
    if (this.maxView >= this.totalRegistrados) {
        event.target.complete();
        event.target.disabled = true;
    }
  }
  llamar(numero: string) {
    if (numero.indexOf('+') < 0) {
      numero = '+' + numero;
    }
    console.log('Llamando a: ', numero);
    this.call.callNumber(numero, false)
      .then( result => {
        console.log('Llamada realizada: ', result);
      })
      .catch( err => {
        console.log('Error al generar llamada: ', err);
        this.fbSrvc.mostrarMensaje(err);
      });
  }
  async modalMotivo(pos: number, tipo: string) {
    if (tipo === 'nuevos') {
      this.motivo = this.personasNuevas[pos].obs;
    } else {
      this.motivo = this.personasRegistradas[pos].obs;
    }
    const modalMotivo = await this.modalCtrl.create({
      component: ModalRechazoComponent,
      componentProps: {
        guardar: '?',
        motivo: this.motivo
      }
    });
    await modalMotivo.present();
    const {data} = await modalMotivo.onDidDismiss();
    if (data) {
      if (data.guardar === 'SI') {
        this.motivo = data.motivo;
      }
    }
  }
  ngOnInit() {
    this.fbSrvc.loading('Cargando información...');
    this.fbSrvc.cargando = true;
    this.fbSrvc.getNuevasPersonas()
    .subscribe( perN => {
      this.personasNuevas = [];
      if (perN && perN.length > 0) {
        console.log(perN.length + ' usuarios Nuevos.');
        console.log({perN});
        this.personasNuevas = perN;
      }
    });
    this.fbSrvc.getPersonasRegistradas()
    .subscribe( per => {
      this.fbSrvc.stopLoading();
      this.personasRegistradas = [];
      this.personasReplica = [];
      if (per && per.length > 0) {
        console.log(per.length + ' usuarios Registrados.');
        console.log({per});
        this.totalRegistrados = per.length;
        this.personasRegistradas = per;
        this.personasReplica = per;
        this.personasReplica.forEach(element => {
          element.movil = element.movil.replace('+', '');
        });
      }
    });
  }
  rechazar( id: string, tipo: string) {
    let pos = 0;
    if (tipo === 'nuevos') {
      pos = this.personasNuevas.findIndex(per => per.idPersona === id);
    } else {
      pos = this.personasRegistradas.findIndex(per => per.idPersona === id);
    }
    console.log(`Posición ${tipo}: ${pos}`);
    if (pos >= 0) {
      this.modalMotivo(pos, tipo)
      .then( () => {
        if (this.motivo !== '' && this.motivo !== 'Los datos de tu cuenta deben ser validados por el administrador de la aplicación.') {
          console.log('Motivo de rechazo:', this.motivo);
          if (tipo === 'nuevos') {
            this.personasNuevas[pos].estado = '1-rechazado';
            this.personasNuevas[pos].adminOk = false;
            this.personasNuevas[pos].obs = this.motivo;
            this.fbSrvc.putPersona(this.personasNuevas[pos]);
          } else {
            this.personasRegistradas[pos].estado = '3-suspendido';
            this.personasRegistradas[pos].adminOk = false;
            this.personasRegistradas[pos].obs = this.motivo;
            this.fbSrvc.putPersona(this.personasRegistradas[pos]);
          }
        } else {
          this.fbSrvc.mostrarMensaje('Debe indicar motivo de rechazo.');
          if (tipo === 'nuevos') {
            this.listaN.closeSlidingItems();
          } else {
            this.listaA.closeSlidingItems();
          }
        }
      })
      .catch( err => {
        console.log('Error al rechazar usuario: ', err);
      });
    } else {
      this.fbSrvc.mostrarMensaje('No se encontró al usuario.');
    }
  }
}
