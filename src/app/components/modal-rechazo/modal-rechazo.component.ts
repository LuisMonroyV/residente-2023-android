import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonInput } from '@ionic/angular';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-modal-rechazo',
  templateUrl: './modal-rechazo.component.html',
  styleUrls: ['./modal-rechazo.component.scss'],
})
export class ModalRechazoComponent implements OnInit {
  @Input() tipo: string;
  @ViewChild('motivoInput', { static: false }) motivoInput: IonInput;

  motivo = '';
  titulo = '';
  constructor(private modalCtrl: ModalController,
              public fbSrvc: FirebaseService) { }

  ngOnInit() {
    if (this.tipo && this.tipo === 'aprobar') {
      this.titulo = 'Observaciones';
    } else {
      this.titulo = 'Motivo del rechazo';
    }
    this.motivo = '';
    setTimeout(() => {
      this.motivoInput.setFocus();
    }, 1000);
  }
  cerrarModal() {
    this.modalCtrl.dismiss();
  }
  guardarMotivo() {
    this.modalCtrl.dismiss({ guardar: 'SI', motivo: this.motivo });
  }

}
