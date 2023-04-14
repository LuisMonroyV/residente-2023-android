import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-rondas',
  templateUrl: './rondas.component.html',
  styleUrls: ['./rondas.component.scss'],
})
export class RondasComponent implements OnInit {
  public rondas: any;
  constructor(public fbSrvc: FirebaseService) { }

  ngOnInit() {
      this.fbSrvc.getRondas()
      .subscribe( rnd => {
        if (rnd && !rnd.empty) {
          this.rondas = rnd;
        }
      });
  }
}
