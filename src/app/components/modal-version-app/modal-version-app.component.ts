import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-modal-version-app',
  templateUrl: './modal-version-app.component.html',
  styleUrls: ['./modal-version-app.component.scss'],
})
export class ModalVersionAppComponent implements OnInit {
  constructor(private modalCtrl: ModalController,
               public fbSrvc: FirebaseService) { }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {}

}
