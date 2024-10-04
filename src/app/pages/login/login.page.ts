import { Component, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { IonInput } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  @ViewChild('loginInput', { static: true }) loginInput: IonInput;

  constructor(private route: Router,
              public fbSrvc: FirebaseService ) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    document.body.classList.toggle('dark', prefersDark.matches);
    console.log('dark?: ', prefersDark.matches);
  }

  ngOnInit() {
    console.log('%cloginBiometrico', 'color: #007acc;', this.fbSrvc.parametros.loginBiometrico);
    console.log('%cemail', 'color: #007acc;', this.fbSrvc.parametros.email);
    console.log('%ccontraseña', 'color: #007acc;', this.fbSrvc.parametros.contrasena);
  }
  
  ionViewWillEnter() {
    console.log(' login - ionViewWillEnter()');
    this.fbSrvc.logOutFirebase();
    this.loginInput.setFocus();
  }
  validaMail(form: NgForm) {
    if (form.valid) {
      // this.fbSrvc.loading('Verificando...');
      this.fbSrvc.loginFirebase(this.fbSrvc.login.email, 'ninguna')
      .then( ret => {
        console.log('retorno signInFirebase: ', ret);
      }).catch(err => {
        console.log('error firebase: ', err.code);
        if (err.code === 'auth/wrong-password') {
          this.fbSrvc.stopLoading();
          this.route.navigate(['/contrasena']);
        } else {
          // EMAIL_NOT_FOUND
          if (err.code === 'auth/invalid-email') {
            this.fbSrvc.stopLoading();
            this.fbSrvc.registrando = true;
            this.route.navigate(['/registro']);
          } else {
            // USER NOT FOUND
            if (err.code === 'auth/user-not-found') {
              this.fbSrvc.stopLoading();
              this.fbSrvc.registrando = true;
              this.route.navigate(['/registro']);
            }
          }
        }
      });
    } else {
      return;
    }

  }
}
