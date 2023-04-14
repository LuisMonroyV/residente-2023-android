import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-slides',
  templateUrl: './slides.page.html',
  styleUrls: ['./slides.page.scss'],
})
export class SlidesPage implements OnInit {

  constructor( private router: Router,
               public fbSrvc: FirebaseService) { }

  ngOnInit() {
    // console.log('apagando dark mode.');
    // document.body.classList.toggle('dark', false);
  }

  primeraVez() {
    this.fbSrvc.parametros.primeraVez = false;
    this.fbSrvc.guardarStorage('parametros', this.fbSrvc.parametros);
    console.log('dejando dark mode como estaba.');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    document.body.classList.toggle('dark', prefersDark.matches);
    this.router.navigate(['/login']);
  }

}
