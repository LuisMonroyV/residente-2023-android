import { Component, OnInit, ViewChild } from '@angular/core';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { FirebaseService } from '../../services/firebase.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { IonInput } from '@ionic/angular';

@Component({
  selector: 'app-contrasena',
  templateUrl: './contrasena.page.html',
  styleUrls: ['./contrasena.page.scss'],
})
export class ContrasenaPage implements OnInit {
  @ViewChild('passInput', { static: true }) passInput: IonInput;
  verPass = 'password';
  contrasenaEnviada = false;
  iconoCandado = 'lock-closed-sharp';
  auth = firebase.auth();
  getAut = getAuth();
  constructor( public fbSrvc: FirebaseService,
               private router: Router ) { }
  limpiarParametros() {
    this.fbSrvc.parametros.codigoDir = '';
    this.fbSrvc.parametros.identificado = false;
    this.fbSrvc.parametros.codigoAlerta = '000';
    this.fbSrvc.parametros.primeraVez = false;
    this.fbSrvc.parametros.validado = false;
    this.fbSrvc.parametros.verificado = false;
    this.fbSrvc.parametros.verEmergencias = true;
    this.fbSrvc.parametros.verAccesos = true;
    this.fbSrvc.parametros.verRondas = true;
    this.fbSrvc.guardarStorage('parametros', this.fbSrvc.parametros);
    this.fbSrvc.enviado = false;
    this.fbSrvc.stopLoading();
  }
  ngOnInit() {
    setTimeout(() => {
      this.passInput.setFocus();
      this.getAut.onAuthStateChanged( aut => {
        console.log(`getAut.onAuthStateChanged ${aut.email}...`);
        // this.fbSrvc.getParametrosFB();
        this.fbSrvc.loading(`Ingresando...`);
        this.fbSrvc.getPersonaxId(aut.uid)
        .subscribe( per => {
          console.log('per: ', per);
          if (per && !per.empty) {
            this.iconoCandado = 'lock-open-sharp';
            this.fbSrvc.persona = per.docs[0].data();
            console.log('authId: ', aut.uid);
            console.log('persona: ', per);
            this.fbSrvc.parametros.identificado = true;
            this.fbSrvc.parametros.verificado = aut.emailVerified;
            this.fbSrvc.parametros.validado = this.fbSrvc.persona.adminOk;
            this.fbSrvc.persona.emailOk = aut.emailVerified;
            this.fbSrvc.persona.email = this.fbSrvc.login.email;
            this.fbSrvc.creaCodigo();
            this.fbSrvc.guardarStorage('parametros', this.fbSrvc.parametros);
            if ((aut.emailVerified) && (this.fbSrvc.persona.adminOk)) {
              console.log('Redireccionando hacia Inicio.');
              this.fbSrvc.stopLoading();
              this.router.navigate(['/folder/inicio']);
            } else {
              console.log('Redireccionando hacia Activar Mail.');
              this.fbSrvc.stopLoading();
              this.router.navigate(['/activar-mail']);
            }
          } else {
            this.fbSrvc.stopLoading();
            console.log('no se encontró persona con authId: ', aut.uid);
            this.fbSrvc.mostrarMensaje(`No encontramos un usuario con el correo: ${this.fbSrvc.persona.email}`);
            setTimeout(() => {
              this.fbSrvc.logOutFirebase();
              this.limpiarParametros();
              this.router.navigate(['/login']);
            }, 1000);
          }
        });
      });
    }, 500);
  }
  validaContrasena( form: NgForm) {
    console.log('%ccontrasena.page.ts line:40 form.valid', 'color: #007acc;', form.valid);
    if (form.valid) {
      this.fbSrvc.loginFirebase( this.fbSrvc.login.email, this.fbSrvc.login.contrasena)
      .catch( err => {
        console.log('Contraseña incorrecta: ', err);
        this.fbSrvc.mostrarMensaje('Contraseña Incorrecta.');
      });
    } else {
      console.log('%ccontrasena.page.ts Formulario No válido', 'color: #007acc;');
    }
    }
  restablecerContrasena() {
    this.contrasenaEnviada = true;
    this.fbSrvc.resetPassword();
  }
}
