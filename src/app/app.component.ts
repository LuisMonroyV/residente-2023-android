/* eslint-disable @typescript-eslint/dot-notation */
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FirebaseService } from './services/firebase.service';
import { NativeAudio } from '@awesome-cordova-plugins/native-audio/ngx';
import { Platform, MenuController, IonSplitPane } from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import OneSignal from 'onesignal-cordova-plugin';
import { oneSignalConfig } from '../environments/environment';


let contBack = 1;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('split', { static: true }) split: IonSplitPane;
  retorno: any[];
  auth = getAuth();
  public selectedIndex = 0;
  temaCambiado = false;
  constructor(
              private appVersion: AppVersion,
              private audio: NativeAudio,
              public fbSrvc: FirebaseService,
              private menu: MenuController,
              private platform: Platform,
              private router: Router,
              private storage: Storage,
             ) {
    this.platform.ready()
    .then(() => {
      this.fbSrvc.esAndroid = this.platform.is('android');
      this.fbSrvc.esOtro = this.platform.is('desktop');
      console.log('%cthis.fbSrvc.esAndroid', 'color: #007acc;', this.fbSrvc.esAndroid);
      console.log('%cthis.fbSrvc.esOtro', 'color: #007acc;', this.fbSrvc.esOtro);
      this.oneSignalInit();
      this.initializeApp();
    });
  }
  oneSignalInit() {
    console.log('%capp.component.ts oneSignalInit()', 'color: #007acc;');
    OneSignal.setAppId(oneSignalConfig.OSapiId);
    OneSignal.getDeviceState( stat => {
      console.log('%capp.component.ts line:95 getDeviceState:', 'color: #007acc;', stat);
      // id Suscriptor
        console.log('ID Movil: ', stat.userId);
        this.fbSrvc.persona.idMovil = stat.userId;
        if (this.fbSrvc.persona.idPersona.length > 0) {
          this.fbSrvc.putPersona(this.fbSrvc.persona);
        } else {
          console.log('Esperamos 10 segs para que vuelva el servicio getPersona()');
          setTimeout(() => {
            this.fbSrvc.persona.idMovil = stat.userId;
            this.fbSrvc.putPersona(this.fbSrvc.persona);
          }, 10000);
        }
    });
    OneSignal.setNotificationWillShowInForegroundHandler(notifR => {
      console.log('notificación recibida', notifR);
      const notificationR = notifR.getNotification();
      const dataR = notificationR.additionalData;
      console.log('additionalData: ', dataR);
      if (notifR.getNotification().additionalData['nombre'] === 'Alerta de residente' ) {
        this.fbSrvc.lanzarSonido('smokeAlarm');
        console.log('moviendo a Emergencias...');
        this.fbSrvc.expandidoEmergencias = true;
        this.router.navigateByUrl('/folder/inicio#emergencias');
      } else if (notifR.getNotification().additionalData['nombre'] === 'Alerta de guardia') {
        this.fbSrvc.lanzarSonido('siren');
        console.log('moviendo a Emergencias...');
        this.fbSrvc.expandidoEmergencias = true;
        this.router.navigateByUrl('/folder/inicio#emergencias');
      } else if (notifR.getNotification().additionalData['nombre'] === 'reservas de multicancha') {
        this.fbSrvc.lanzarSonido('siren');
        console.log('moviendo a Reservas...');
        this.router.navigateByUrl('/reservas-cancha');
      }
      notifR.complete(notificationR);
    });
    OneSignal.setNotificationOpenedHandler(notifO => {
      console.log('notificationOpenedCallback: ', JSON.stringify(notifO));
        if (notifO.notification.additionalData['nombre'] === 'Aviso de visita') {
          this.fbSrvc.expandidoAccesos = true;
          this.router.navigateByUrl('/folder/inicio#visitas');
        } else if (notifO.notification.additionalData['nombre'] === 'Nueva noticia') {
          this.fbSrvc.lanzarSonido('sms');
          this.fbSrvc.expandidoNoticias = true;
          this.router.navigateByUrl('/folder/inicio#noticias');
        } else if (notifO.notification.additionalData['nombre'] === 'Alerta de residente' ) {
          this.fbSrvc.lanzarSonido('smokeAlarm');
          this.fbSrvc.expandidoEmergencias = true;
          this.router.navigateByUrl('/folder/inicio#emergencias');
        } else if (notifO.notification.additionalData['nombre'] === 'Alerta de guardia') {
          this.fbSrvc.lanzarSonido('siren');
          this.fbSrvc.expandidoEmergencias = true;
          this.router.navigateByUrl('/folder/inicio#emergencias');
        } else if (notifO.notification.additionalData['nombre'] === 'Nuevo usuario esperando aprobación') {
          setTimeout(() => {
            this.router.navigateByUrl('/usuarios');
          }, 3000);
        } else if (notifO.notification.additionalData['nombre'] === 'Visita no informada') {
          this.fbSrvc.expandidoAccesos = true;
          this.router.navigateByUrl('/folder/inicio#visitas');
        } else if (notifO.notification.additionalData['nombre'] === 'Tu aviso de pago ha cambiado de estado' ||
                   notifO.notification.additionalData['nombre'] === 'Nuevo aviso de pago esperando aprobación') {
          this.router.navigate(['/mis-pagos']);
        } else if (notifO.notification.additionalData['nombre'] === 'reservas de multicancha') {
          this.router.navigateByUrl('/reservas-cancha');
        }
      });
    OneSignal.promptForPushNotificationsWithUserResponse(accepted => {
      console.log('User accepted notifications: ' + accepted);
    });
  }
  cargarSonidos() {
    this.audio.preloadComplex('woop', 'assets/sounds/woopWoop.mp3', 1, 1, 0)
    .then( () => {
      console.log('sonido woop OK!');
    })
    .catch( (err) => {
      console.log('sonido woop Error: ', err);
    });
    this.audio.preloadComplex('click', 'assets/sounds/click-2.wav', 1, 1, 0)
    .then( () => {
      console.log('sonido click OK!');
    })
    .catch( (err) => {
      console.log('sonido click Error: ', err);
    });
    this.audio.preloadComplex('smokeAlarm', 'assets/sounds/smokeAlarm.mp3', 1, 1, 0)
    .then( () => {
      console.log('sonido smokeAlarm OK!');
    })
    .catch( (err) => {
      console.log('sonido smokeAlarm Error: ', err);
    });
    this.audio.preloadComplex('blop', 'assets/sounds/blop.mp3', 1, 1, 0)
    .then( () => {
      console.log('sonido blop OK!');
    })
    .catch( (err) => {
      console.log('sonido blop Error: ', err);
    });
    this.audio.preloadComplex('sms', 'assets/sounds/sms-alert.mp3', 1, 1, 0)
    .then( () => {
      console.log('sonido sms OK!');
    })
    .catch( (err) => {
      console.log('sonido sms Error: ', err);
    });
    this.audio.preloadComplex('ding', 'assets/sounds/ding.mp3', 1, 1, 0)
    .then( () => {
      console.log('sonido ding OK!');
    })
    .catch( (err) => {
      console.log('sonido ding Error: ', err);
    });
    this.audio.preloadComplex('siren', 'assets/sounds/siren-noise.mp3', 1, 1, 0)
    .then( () => {
      console.log('sonido siren OK!');
    })
    .catch( (err) => {
      console.log('sonido siren Error: ', err);
    });
    this.audio.preloadComplex('door', 'assets/sounds/door.mp3', 1, 1, 0)
    .then( () => {
      console.log('sonido door OK!');
    })
    .catch( (err) => {
      console.log('sonido door Error: ', err);
    });
  }
  cerrarSesion() {
    this.menu.close();
    this.fbSrvc.logOutFirebase();
    this.limpiarParametros();
    this.router.navigate(['login']);
  }
  async getParametros() {
    await this.storage.get('parametros')
    .then( params => {
      if ( params ) {
        this.fbSrvc.parametros = params;
      }
      this.redirigir();
    })
    .catch( err => {
      console.error('no encontré parametros: ', err);
      this.fbSrvc.parametros.primeraVez = true;
      this.redirigir();
    });
  }
  initializeApp() {
      this.cargarSonidos();
      this.platform.backButton.subscribeWithPriority(9999, () => {
        document.addEventListener('backbutton', (event => {
          event.preventDefault();
          event.stopPropagation();
          console.log('backButton: ', contBack);
          if (contBack === 2) {
            console.log ('exit');
            // eslint-disable-next-line @typescript-eslint/dot-notation
            navigator['app'].exitApp();
          } else {
            this.fbSrvc.mostrarMensaje('Doble tap para salir de la aplicación.');
            contBack++;
            setTimeout(() => {
              contBack--;
              console.log('backButton: ', contBack);
            }, 2000);
            return;
          }
        }), false);
      });
      setTimeout(() => {
        if (this.platform.is('desktop')) {
          this.fbSrvc.verAppStr = 'Desktop';
          this.fbSrvc.actualizarApp = false;
        } else if (this.platform.is('android')) {
          this.appVersion.getVersionNumber()
          .then( data => {
            console.log('%capp.component.ts getVersionNumber()', 'color: #007acc;', data);
            this.fbSrvc.verAppStr = data;
            this.fbSrvc.persona.versionApp = data;
            this.fbSrvc.putPersona(this.fbSrvc.persona);
            this.fbSrvc.validarVersionApp(data);
          })
          .catch( err => {
            this.fbSrvc.actualizarApp = false;
            this.fbSrvc.verAppStr = '---';
            console.error('error getVersionNumber: ', err);
          });
        }
      }, 5000);
  }
  limpiarParametros() {
    this.fbSrvc.parametros.codigoDir = '';
    this.fbSrvc.parametros.identificado = false;
    this.fbSrvc.parametros.primeraVez = false;
    this.fbSrvc.guardarStorage('parametros', this.fbSrvc.parametros);
  }
  async ngOnInit() {
    await this.storage.create()
    .then( () => {
      console.log('%capp.component.ts storage.create OK', 'color: #007acc;');
    })
    .catch( err => {
      console.error('%capp.component.ts storage.create error', 'color: white; background-color: #007acc;', err);
    });
    this.getParametros()
    .then( () => {
      if ( !this.fbSrvc.parametros.primeraVez ) {
        onAuthStateChanged(this.auth, user => {
          if (user) {
            console.log('[onAuthStateChanged] Cambio en estado del usuario.', user.email);
            // if (!this.fbSrvc.escuchandoPersona) {
              const listener = this.fbSrvc.getPersonaxAuthUid(user.uid)
              .subscribe( per => {
                console.log('[getPersonaxAuthUid] Cambio en persona.', per);
                if (per && per.length > 0) {
                  this.fbSrvc.persona = per[0];
                  this.fbSrvc.parametros.verificado = per[0].emailOk;
                  console.log('Email OK: ', per[0].emailOk);
                  this.fbSrvc.parametros.validado = per[0].adminOk;
                  console.log('Admin OK: ', per[0].adminOk);
                  this.fbSrvc.guardarStorage('parametros', this.fbSrvc.parametros);
                  console.log('Parametros guardados en Storage.');
                  if (!this.fbSrvc.parametros.codigoDir) {
                    this.fbSrvc.creaCodigo();
                  }
                  if (this.fbSrvc.persona.esAdmin) {
                    this.fbSrvc.getCalles();
                    this.fbSrvc.appPages[3].visible = (!this.fbSrvc.parametrosFB.pruebasTienda || !this.fbSrvc.persona.esAdmin);
                  }
                  if (!per[0].emailOk || !per[0].adminOk) {
                    this.redirigir();
                  }
                }
                listener.unsubscribe();
              });
            // }
          }
        });
      }
    });
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    document.body.classList.toggle('dark', prefersDark.matches);
    console.log('Preferencia dark mode: ', prefersDark.matches );
    this.fbSrvc.dark = prefersDark.matches;
    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener('change', mediaQuery => {
      this.fbSrvc.dark = mediaQuery.matches;
      if (!this.temaCambiado) { // Para que lo haga una sola vez 
        this.temaCambiado = true;
        this.fbSrvc.toggleDarkTheme(mediaQuery.matches);
      }
    });

  }
  redirigir() {
    if (!this.fbSrvc.redirigido) {
      this.fbSrvc.redirigido = true;
      if (this.fbSrvc.parametros.primeraVez) {
        console.log('Redirigiendo a slides...');
        this.router.navigate(['/slides']);
        return;
      } else if (!this.fbSrvc.parametros.identificado) {
        console.log('Redirigiendo a login...');
        this.router.navigate(['/login']);
        return;
      } else if (!this.fbSrvc.parametros.validado || !this.fbSrvc.parametros.verificado) {
        console.log('Redirigiendo a activar mail...');
        this.router.navigate(['/activar-mail']);
        return;
      } else {
        console.log('Redirigiendo a inicio...');
        this.router.navigate(['/folder/inicio']);
        return;
      }
    } else {
      console.log('Ignorando redirección.');
    }
  }
  usuarios() {
    this.router.navigate(['usuarios']);
  }
}
