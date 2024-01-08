import { ApplicationRef, Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { Dia, Hora, Reserva } from 'src/app/interfaces/fb-interface';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ModalReservaComponent } from '../modal-reserva/modal-reserva.component';
import { PushService } from 'src/app/services/push.service';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.scss'],
})
export class ReservasComponent implements OnInit {
diaSemHoy = moment().weekday();
misReservasSemana: Reserva[] = [];
solictudesCanchaPendientes: Reserva[] = [];
seccion = 'calendario';
semana: Dia[] = [];
dia: Hora[] = [];
solicitudesHoy = 0;

  constructor( private fbSrvc: FirebaseService,
               private modalCtrl: ModalController,
               private alertCtrl: AlertController,
               private appRef: ApplicationRef,
               private pushSrvc: PushService
             ) { }

  async anular(pos: number) {
    const alert = await this.alertCtrl.create({
        header: 'Eliminar Reserva ' + moment(this.misReservasSemana[pos].fechaInicioReserva).format('DD-MMM @HH:mm'),
        message: 'Estás seguro?',
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
              this.fbSrvc.deleteReserva(this.misReservasSemana[pos].idReserva)
              .then( () => {
                this.misReservasSemana.splice(pos, 1);
                // this.inicializaSemana();    
                this.fbSrvc.mostrarMensaje('Reserva eliminada.', 3);
                this.appRef.tick();
              })
              .catch(err => {
                this.fbSrvc.mostrarMensaje(`No se pudo eliminar la reserva: ${err}`, 3);
              });
          
            }
          }
        ]
    });
    await alert.present(); 
  }
  avisarAdminsCancha() {
    this.fbSrvc.getAdminsCancha()
    .subscribe( admins => {
      if (admins && !admins.empty) {
        console.log('# admins: ', admins.size);
        let adminsC: string[] = [];
        admins.docs.forEach( adm => {
          if (adm.data().idMovil && adm.data().idMovil.length > 0) {
            adminsC.push(adm.data().idMovil);
          }
        });
        this.pushSrvc.notificarNuevaReserva(adminsC);
      }
    });
  }
  guardarReserva(res: Reserva) {
    this.fbSrvc.postReserva(res);
    this.avisarAdminsCancha();
  }
  inicializaSemana() {
    // console.log('%cinicializaSemana()', 'color: #007acc;');
    const reservaVacia: Reserva = {
      fechaSolicitud: null,
      fechaInicioReserva: null,
      fechaFinReserva: null,
      estado: 'Disponible',
      idDireccion: '',
      obs: '',
      idReserva: ''
    };
    this.semana = [];
    let maxHorario = 0;
    let minHorario = 0;
    let numDia = 0;
    for (let indexDiaSem = 0; indexDiaSem <= 6; indexDiaSem++) {
      const diaSemana = moment().startOf('day').add(indexDiaSem, 'day').toDate();
      numDia = moment(diaSemana).day(); // Domingo 0 .. Sábado 6
      if (this.fbSrvc.esFeriado(diaSemana) || numDia === 0) {
        minHorario = this.fbSrvc.parametrosFB.horaInicioFeriado;
        maxHorario = this.fbSrvc.parametrosFB.horaFinFeriado;
      } else if( numDia === 6) { // Sábado
        minHorario = this.fbSrvc.parametrosFB.horaInicioSabado;
        maxHorario = this.fbSrvc.parametrosFB.horaFinSabado;
      } else {
        minHorario = this.fbSrvc.parametrosFB.horaInicioSemana;
        maxHorario = this.fbSrvc.parametrosFB.horaFinSemana;
      }
      this.dia = [];
      for (let indexHora = minHorario; indexHora < maxHorario; indexHora++) {
        const horaVacia: Hora = {
          hora: moment().startOf('day').add(indexDiaSem, 'day').add(indexHora, 'hour').toDate(),
          reserva: reservaVacia
        };
        const horaReserva: Hora = {
          hora: moment().startOf('day').add(indexDiaSem, 'day').add(indexHora, 'hour').toDate(),
          reserva: this.fbSrvc.hayReserva(moment().startOf('day').add(indexDiaSem, 'day').add(indexHora, 'hour').toDate())
        };
        if (horaReserva.reserva){
          this.dia.push(horaReserva);
        } else {
          this.dia.push(horaVacia);
        }
      }
      this.semana.push({
        dia: diaSemana,
        horas: this.dia
      });
    }
    // console.log('%creservas.component.ts line:74 this.semana', 'color: #007acc;', this.semana);
    this.appRef.tick();
  }
  ngOnInit() {
    this.fbSrvc.getReservas()
    .subscribe(reserva => {
      console.log('%creservas.component.ts Cambio en reservas', 'color: #007acc;');
      this.fbSrvc.reservasCancha = [];
      if (reserva && reserva.length > 0) {
        // console.log('%creservas.component.ts reservas', 'color: #007acc;', reserva);
        reserva.forEach(res => {
          const newReserva: Reserva = {
            fechaSolicitud: this.fbSrvc.timestampToDate(res.fechaSolicitud),
            fechaInicioReserva: this.fbSrvc.timestampToDate(res.fechaInicioReserva),
            fechaFinReserva: this.fbSrvc.timestampToDate(res.fechaFinReserva),
            estado: res.estado,
            idDireccion: res.idDireccion,
            obs: res.obs,
            idReserva: res.idReserva
          };
          this.fbSrvc.reservasCancha.push(newReserva);
          if (res.estado === 'Solicitada') {
            this.solictudesCanchaPendientes.push(newReserva);
          }
        });
      } else {
        console.log('%creservas.component.ts No hay reservas', 'color: #007acc;');
      }
      this.inicializaSemana();    
    });
    this.fbSrvc.getMisReservas()
    .subscribe( misRes => {
      if (misRes && misRes.length > 0) {
        this.misReservasSemana = [];
        this.solicitudesHoy = 0;
        misRes.forEach( res => {
          const miReserva: Reserva = {
            fechaSolicitud: this.fbSrvc.timestampToDate(res.fechaSolicitud),
            fechaInicioReserva: this.fbSrvc.timestampToDate(res.fechaInicioReserva),
            fechaFinReserva: moment(this.fbSrvc.timestampToDate(res.fechaFinReserva)).toDate(),
            estado: res.estado,
            idDireccion: res.idDireccion,
            obs: res.obs,
            idReserva: res.idReserva
          };
          this.misReservasSemana.push(miReserva);
          // Cuenta de solicitudes diarias
          if (this.fbSrvc.soloFecha(this.fbSrvc.timestampToDate(res.fechaSolicitud)) === this.fbSrvc.soloFecha(moment().toDate())) {
            this.solicitudesHoy++;
          }
        });
        // console.log('%creservas.component.ts Mis Reservas', 'color: #007acc;', this.misReservasSemana);
        console.log('%cSolicitudes realizadas Hoy:', 'color: #007acc;', this.solicitudesHoy);
      } else {
        console.log(`%creservas.component.ts No hay reservas para ${this.fbSrvc.parametros.codigoDir}`, 'color: #007acc;');
      }
    });
    this.inicializaSemana();    
  }
  async solicitar() {
    if (this.solicitudesHoy < this.fbSrvc.parametrosFB.maxReservasDiarias) {
      const modalNuevaReserva = await this.modalCtrl.create({
        component: ModalReservaComponent,
      });
      await modalNuevaReserva.present();
      const {data} = await modalNuevaReserva.onDidDismiss();
      if (data) {
        if (data.guardar === 'SI') {
          this.guardarReserva(data.reserva);
        }
      }
    } else {
      this.fbSrvc.mostrarMensaje('Has alcanzado el máximo de reservas diarias.');
    }

  }
  segmentChanged($event) {
    this.seccion = $event.detail.value;
  }

}
