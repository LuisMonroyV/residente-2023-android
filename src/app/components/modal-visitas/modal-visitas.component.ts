import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, IonInput } from '@ionic/angular';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-modal-visitas',
  templateUrl: './modal-visitas.component.html',
  styleUrls: ['./modal-visitas.component.scss'],
})
export class ModalVisitasComponent implements OnInit {
  @ViewChild('nombreInput', {static: true}) nombreInput: IonInput;
  // @Input() tipo: string;
  nuevaVisita = {
    nombre: '',
    apellido: '',
  };
  constructor(private modalCtrl: ModalController,
              public fbSrvc: FirebaseService) { }

  ngOnInit() {
    setTimeout(() => {
      this.nombreInput.setFocus();
    }, 600);
  }
  cerrarModal() {
    this.modalCtrl.dismiss();
  }
  guardarVisita() {
    this.modalCtrl.dismiss({ guardar: 'SI', visita: this.nuevaVisita.nombre + ' ' + this.nuevaVisita.apellido});
  }

}
