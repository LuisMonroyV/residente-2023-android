import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalQrComponent } from '../modal-qr/modal-qr.component';
import { FirebaseService } from 'src/app/services/firebase.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() titulo: string;
  @Input() qr: string;
  constructor( private modalCtrl: ModalController,
               public fbSrvc: FirebaseService
             ) {
  }

  ngOnInit() {
  }

  async modalQr() {
    const modalQr = await this.modalCtrl.create({
      component: ModalQrComponent,
      componentProps: {
        compartir: '?',
      }
    });
    await modalQr.present();
    const {data} = await modalQr.onDidDismiss();
    if (data) {
      if (data.compartir === 'SI') {
        console.log('Compartir SI');
      }
    }
  }

}
