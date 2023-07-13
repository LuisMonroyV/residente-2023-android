import { Component, OnInit, ViewChild } from '@angular/core';
import { Aviso } from '../../interfaces/fb-interface';
import { FirebaseService } from '../../services/firebase.service';
import { ModalController, IonInput } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-modal-aviso',
  templateUrl: './modal-aviso.component.html',
  styleUrls: ['./modal-aviso.component.scss'],
})
export class ModalAvisoComponent implements OnInit {
  @ViewChild('empresaInput', {static: false}) empresaInput: IonInput;
  fechaHoyIso = '';
  fechaMaxIso = '';
  fechaString = '';
  nuevoAviso: Aviso = {
    avisar: false,
    empresa: '',
    fecha: null,
    idAviso: '',
    idDireccion: this.fbSrvc.parametros.codigoDir,
    nota: '',
    patente: '',
    vigente: true
  };

  constructor(public fbSrvc: FirebaseService,
              private modalCtrl: ModalController) {
    this.fechaHoyIso = moment().startOf('day').toISOString();
    this.fechaMaxIso = moment().endOf('day').add(7, 'days').toISOString();
    this.fechaString = moment().toISOString(true);
    // console.log('this.fechaHoyIso:', moment(this.fechaHoyIso).format('DD-MM-YYYY HH:mm'));
    // console.log('this.fechaMaxIso:', moment(this.fechaMaxIso).format('DD-MM-YYYY HH:mm'));
    // console.log('this.fechaString:', moment(this.fechaString).format('DD-MM-YYYY HH:mm'));
  }
  actualizarPersona() {
    // console.log('%cmodal-aviso.component.ts actualizarPersona()', 'color: #007acc;');
    this.fbSrvc.putPersona(this.fbSrvc.persona);
  }
  ngOnInit() {
    setTimeout(() => {
      this.empresaInput.setFocus();
    }, 1000);
  }
  cerrarModal() {
    this.modalCtrl.dismiss();
  }
  guardarAviso() {
    // this.nuevoAviso.fecha = moment(this.fechaString).startOf('day').toDate();
    this.nuevoAviso.fecha = moment(this.fechaString).toDate();
    // console.log('fecha de aviso: ', this.nuevoAviso.fecha);
    this.modalCtrl.dismiss({ guardar: 'SI', aviso: this.nuevoAviso });
  }

}
