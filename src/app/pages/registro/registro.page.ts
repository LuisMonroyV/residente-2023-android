import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { PushService } from '../../services/push.service';
import { Calle } from 'src/app/interfaces/fb-interface';
import { id } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  creandoCuenta = false;
  verPass = 'password';
  prefijoMovil = '+569';
  prefijoFijo = '+562';
  interv: any;
  mockCalles: Calle[] = [{ descCalle: 'Av. del Parque', numeracion: []},
                { descCalle: 'Cabernet', numeracion: []},
                { descCalle: 'Canal de la Luz', numeracion: []},
                { descCalle: 'Chardonay', numeracion: []},
                { descCalle: 'Merlot', numeracion: []},
                { descCalle: 'Riesling', numeracion: []},
                { descCalle: 'Sauvignon', numeracion: []},
               ];
  constructor( private router: Router,
               public fbSrvc: FirebaseService,
               private pushSrvc: PushService) { }

  creaCuenta(form: NgForm) {
    if (form.valid) {
      this.creandoCuenta = true;
      this.fbSrvc.persona.movil = this.prefijoMovil + this.fbSrvc.persona.movil;
      this.fbSrvc.persona.telefono = this.prefijoFijo + this.fbSrvc.persona.telefono;
      this.fbSrvc.persona.numero = this.fbSrvc.persona.numero.trim();
      this.fbSrvc.persona.fechaRegistro = new Date();
      this.fbSrvc.registroFirebase( this.fbSrvc.login.email, this.fbSrvc.login.contrasena)
        .then( async respFB => {
          if (respFB) {
            this.fbSrvc.parametros.identificado = true;
            this.fbSrvc.creaCodigo();
            this.fbSrvc.loading('Creando cuenta...');
            this.fbSrvc.sendEmailVerification();
            this.fbSrvc.guardarStorage('parametros', this.fbSrvc.parametros);
            this.fbSrvc.persona.authUid = respFB.user.uid;
            this.fbSrvc.persona.email = this.fbSrvc.login.email;
            this.fbSrvc.persona.estado = '0-nuevo';
            this.fbSrvc.persona.obs = 'Los datos de tu cuenta deben ser validados por el administrador de la aplicación.';
            await this.fbSrvc.postPersona(this.fbSrvc.persona);
            this.pushSrvc.avisarAdmins('Registro');
            this.fbSrvc.mostrarMensaje('Cuenta creada. Bienvenido!');
            this.fbSrvc.stopLoading();
            this.router.navigate(['/activar-mail']);
          }
        }).catch( err => {
          console.log('Error al crear ususario en firebase: ', err);
        });
    } else {
      this.creandoCuenta = false;
      return;
    }
  }
  limpiarCampos() {
    this.fbSrvc.login.contrasena = '';
    this.fbSrvc.persona.apellidoMaterno = '';
    this.fbSrvc.persona.apellidoPaterno = '';
    this.fbSrvc.persona.calle = '';
    this.fbSrvc.persona.movil = '';
    this.fbSrvc.persona.nombres = '';
    this.fbSrvc.persona.numero = '';
    this.fbSrvc.persona.telefono = '';
  }
  ngOnInit() {
    // Calles, direcciones y personas
    this.fbSrvc.loginFirebase('admin@admin.cl', '123456')
    .then( usr => {
      this.fbSrvc.getCalles();
      console.log('%cregistro.page.ts line:93 Logueado como admin', 'color: #007acc;');
    })
    .catch( err => {
      console.log('Error en login con admin. ', err);
      this.fbSrvc.calles = this.mockCalles;
    });
    this.limpiarCampos();
  }
  validarMovil() {
    this.fbSrvc.getMovil('+569'+this.fbSrvc.persona.movil)
    .subscribe( data => {
      if (!data.empty) {
        // Existe el movil
        this.fbSrvc.mostrarMensaje('Ya existe este número de movil', 3000);
        this.fbSrvc.persona.movil = '';
      }
    });
  }
}
