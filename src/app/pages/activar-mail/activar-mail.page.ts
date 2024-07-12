import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { PushService } from 'src/app/services/push.service';


@Component({
  selector: 'app-activar-mail',
  templateUrl: './activar-mail.page.html',
  styleUrls: ['./activar-mail.page.scss'],
})
export class ActivarMailPage implements OnInit {
  inter: any;
  intervalsegundos: any;
  verificando = false;
  eliminando = false;
  chequeoInicial = true;
  segundosRevision = 2;
  horaRevision = moment().add(this.segundosRevision, 'seconds').toDate();
  public siguienteRevision = moment().to(this.horaRevision);
  constructor(public fbSrvc: FirebaseService,
              private router: Router,
              private pushSrvc: PushService) {
  }
  private activarUsuario() {
    clearInterval(this.inter);
    this.fbSrvc.parametros.verificado = true;
    this.fbSrvc.parametros.validado = true;
    this.fbSrvc.guardarStorage('parametros', this.fbSrvc.parametros);
    this.router.navigate(['/folder/inicio']);
}
  checkEstadoUsuario() {
    if (moment().toDate() >= this.horaRevision || this.chequeoInicial) {
      this.fbSrvc.loginFirebase(this.fbSrvc.login.email, this.fbSrvc.login.contrasena)
      .then( usr => {
        if (!this.chequeoInicial) {
          this.segundosRevision = this.segundosRevision * 2;
        }
        this.chequeoInicial = false;
        this.horaRevision = moment().add(this.segundosRevision, 'seconds').toDate();
        console.log('segundos: +', this.segundosRevision);
        console.log('Próxima revisión: ', moment(this.horaRevision).format('HH:mm:ss'));
        this.fbSrvc.persona.emailOk = usr.user.emailVerified;
        this.fbSrvc.parametros.verificado = usr.user.emailVerified;
        // Validacion de email
        if (usr.user.emailVerified) {
          console.log('Email verificado');
          this.fbSrvc.putPersonaEmailOk(this.fbSrvc.persona)
          .then( oki => {
            console.log('Usuario marcado como emailOk!!');
          })
          .catch(err => {
            console.log('No se pudo marcar el usuario con emailOk: ', err);
          });
        } else {
          console.log('Email NO verificado');
          this.fbSrvc.mostrarMensaje('Revise su correo electrónico: ' + this.fbSrvc.login.email);
        }
        // Validacion de administrador
        if (this.fbSrvc.parametros.validado) {
          this.fbSrvc.persona.adminOk = true;
        } else {
          this.fbSrvc.getPersonaxAuthUid(usr.user.uid)
          .subscribe( per => {
            if (per) {
              this.fbSrvc.persona.estado = per[0].estado;
              setTimeout(() => {
                if (this.fbSrvc.persona.estado === '1-rechazado' || this.fbSrvc.persona.estado === '3-suspendido') {
                  this.fbSrvc.mostrarMensaje(`Usuario ${this.fbSrvc.persona.estado.substr(2, this.fbSrvc.persona.estado.length)}.`);
                  clearInterval(this.inter);
                  console.log('Verificación finalizada.');
                } else if (per[0].emailOk && per[0].adminOk) {
                  this.activarUsuario();
                } else {
                  this.fbSrvc.mostrarMensaje('Seguimos esperando OK del administrador.');
                }
              }, 2500);
            }
          });
        }
      })
      .catch( err => {
        console.log('Error al iniciar sesión: ', err);
        clearInterval(this.inter);
      });
      if (this.fbSrvc.parametros.verificado && this.fbSrvc.parametros.validado) {
        this.activarUsuario();
      }
    } else {
      this.siguienteRevision = moment().to(this.horaRevision);
    }

  }
  eliminarCuenta() {
    this.fbSrvc.loading('Eliminando información...');
    this.eliminando = true;
    console.log('Usuario a eliminar: ', this.fbSrvc.persona.idPersona);
    this.fbSrvc.deleteUsuario(this.fbSrvc.persona.idPersona)
    .then( () => {
      console.log('Usuario Eliminado de BD, redirigiendo a Login.');
      setTimeout(() => {
        this.fbSrvc.logOutFirebase();
        this.limpiarParametros();
        this.pushSrvc.avisarAdmins('Eliminacion');
        window.location.reload();
        this.fbSrvc.stopLoading();
      }, 3000);
    })
    .catch( err => {
      console.log('error al eliminar cuenta del usuario: ', err);
      this.fbSrvc.stopLoading();
    });
  }
  ionViewWillLeave() {
    console.log(' Activar Mail - ionViewWillLeave()');
    clearInterval(this.inter);
    this.verificando = false;
    this.fbSrvc.enviado = false;
  }
  ionViewWillEnter() {
    console.log(' Activar Mail - ionViewWillEnter()');
    this.verificarEstado();
  }
  irLogin() {
    clearInterval(this.inter);
    clearInterval(this.intervalsegundos);
    if (this.fbSrvc.persona.adminOk && this.fbSrvc.persona.emailOk) {
      this.router.navigate(['/folder/inicio']);
    } else {
      this.fbSrvc.logOutFirebase();
      this.fbSrvc.parametros.identificado = false;
      this.fbSrvc.parametros.verificado = false;
      this.fbSrvc.parametros.codigoDir = '';
      this.fbSrvc.guardarStorage('parametros', this.fbSrvc.parametros);
      console.log('Redirigiendo hacia login...');
      this.router.navigate(['/login']);
    }
  }
  limpiarParametros() {
    this.fbSrvc.parametros = null;
    this.fbSrvc.guardarStorage('parametros', null);
    this.fbSrvc.persona = null;
  }
  ngOnInit() {
    console.log(' Activar Mail - Init');
    this.verificarEstado();
  }
  async reenviar() {
    await this.fbSrvc.sendEmailVerification();
  }
  verificarEstado() {
    console.log(`verificando Estado: ${this.verificando}`);
    if (!this.verificando) {
      this.verificando = true;
      console.log('Login: ', this.fbSrvc.login);
      if ((this.fbSrvc.login.email.length > 0) && (this.fbSrvc.login.contrasena.length > 0)) {
        console.log('Interval activado');
        console.log('segundos: +', this.segundosRevision);
        console.log('Próxima revisión: ', moment(this.horaRevision).format('HH:mm:ss'));
        this.inter = setInterval( () => {
          this.checkEstadoUsuario();
        }, 1000); // Cada un segundo
      } else {
        this.irLogin();
      }
    } else {
      console.log('Ya se está verificando estado.');
    }
  }
}
