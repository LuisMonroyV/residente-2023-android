import { Component, OnInit } from '@angular/core';
import { Noticia } from '../../interfaces/fb-interface';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-noticias',
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.scss'],
})
export class NoticiasComponent implements OnInit {
  noticias: Noticia[] = [];
  constructor(public fbSrvc: FirebaseService) { }

  ngOnInit() {
    this.fbSrvc.getNoticias()
    .subscribe( noti => {
      if (noti && noti.length > 0) {
        this.noticias = noti.sort((a,b) => {
            if ( a.fecha < b.fecha ){
              return 1;
            }
            if ( a.fecha > b.fecha ){
              return -1;
            }
            return 0;
          });
      }
    });
  }

}
