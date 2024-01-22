import { Component, OnInit, ViewChild } from '@angular/core';
import { IonTextarea, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { start } from 'repl';
import { Reserva } from 'src/app/interfaces/fb-interface';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-modal-reserva',
  templateUrl: './modal-reserva.component.html',
  styleUrls: ['./modal-reserva.component.scss'],
})
export class ModalReservaComponent implements OnInit {
  // @ViewChild('descripcion') desc!: IonTextarea;
  fechasDisponibles: Date[] = [];
  horariosDisponibles: Date[] = [];
  fechaSeleccionada = false;
  horaSeleccionada = false;
  nuevaReserva: Reserva = {
    fechaSolicitud: null,
    fechaInicioReserva: null,
    fechaFinReserva: null,
    estado: '0-Solicitada',
    idDireccion: this.fbSrvc.parametros.codigoDir,
    obs: '',
    idReserva: ''
  }
  paso = 1;
  constructor( private modalCtrl: ModalController,
               public fbSrvc: FirebaseService) {}
  anterior() {
    this.paso--;
  }
  cerrarModal() {
    console.log('%ccerrarModal()', 'color: #007acc;');
    this.modalCtrl.dismiss();
  }
  guardarReserva() {
    this.modalCtrl.dismiss({ guardar: 'SI', reserva: this.nuevaReserva });
  }
  // ionViewDidEnter() {
  //   this.desc.setFocus();
  // }
  ngOnInit() {
    for (let index = 0; index <= 6; index++) {
      const element = moment().startOf('day').add(index, 'days').toDate();
      this.fechasDisponibles.push(element);
    }
  }

  recalculaHoras(desde: number, hasta: number) {
    this.horariosDisponibles = [];
    for (let index = desde; index < hasta; index++) {
      const element = moment(this.nuevaReserva.fechaInicioReserva).startOf('day').add(index, 'hour').toDate();
      this.horariosDisponibles.push(element);
    }
    // Deja no disponible las horas reservadas
    this.horariosDisponibles = this.horariosDisponibles.filter(horasRes => !this.fbSrvc.hayReserva(horasRes));
    // Deja no disponible las horas anteriores a la hora actual
    this.horariosDisponibles = this.horariosDisponibles.filter(horasok => horasok > moment().toDate());
  }

  recalculaMinMax(idx: number) {
    this.fechaSeleccionada = true;
    this.nuevaReserva.fechaInicioReserva = this.fechasDisponibles[idx];
    let diaSem = moment(this.fechasDisponibles[idx]).day(); // Domingo 0 .. Sábado 6
    if (this.fbSrvc.esFeriado(moment(this.fechasDisponibles[idx]).toDate()) || diaSem === 0) {
      diaSem = 0;  // Le asigno dia feriado o domingo
    }
    switch (diaSem) {
      case 6: // Sábado
        this.recalculaHoras(this.fbSrvc.parametrosFB.horaInicioSabado, this.fbSrvc.parametrosFB.horaFinSabado);
        break;
      case 0: // Domingo o Feriado
      this.recalculaHoras(this.fbSrvc.parametrosFB.horaInicioFeriado, this.fbSrvc.parametrosFB.horaFinFeriado);
      break;
      default: // Dia de semana
        this.recalculaHoras(this.fbSrvc.parametrosFB.horaInicioSemana, this.fbSrvc.parametrosFB.horaFinSemana);
        break;
    }
    this.siguiente();
  }

  seleccionaHora(idx: number) {
    this.horaSeleccionada = true;
    this.nuevaReserva.fechaSolicitud = moment().toDate();    
    this.nuevaReserva.fechaInicioReserva = moment(this.nuevaReserva.fechaInicioReserva).startOf('day').add(moment(this.horariosDisponibles[idx]).hour(),'hours').toDate();    
    this.nuevaReserva.fechaFinReserva = moment(this.nuevaReserva.fechaInicioReserva).add(59,'minutes').add(59,'seconds').toDate();    
    console.log('%cmodal-reserva.component.ts line:84 this.nuevaReserva', 'color: #007acc;', this.nuevaReserva);
    this.siguiente();
  }
  siguiente() {
    this.paso++;
    if (this.paso === 3) {
      setTimeout(() => {
        const divTextarea = document.getElementById('paso3');
        const textarea = divTextarea.querySelector('ion-textarea');
        textarea.setFocus();
      }, 600);
    }
  }

  sumarMinutos(hora: Date) {
    return moment(hora).add(59, 'minutes').toDate();
  }

  soloFecha(fecha: Date) {
    return(moment(fecha).format('DD-MM-YYYY'));
  }
}
