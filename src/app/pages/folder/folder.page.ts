import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { PushService } from '../../services/push.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  eliminacionesOK: boolean;
  public selectedIndex = 0;
  constructor(public fbSrvc: FirebaseService,
              private pushSrvc: PushService,
              private router: Router,
              ) {
    fbSrvc.leerStorage('eliminacionesAdmin') // Boolean
      .then(resp => {
        this.eliminacionesOK = resp;
      })
      .catch( () => {
        this.eliminacionesOK = false;
      });
  }
  alerta() {
    this.router.navigate(['alerta']);
  }
  cerrarSesion() {
    this.fbSrvc.logOutFirebase();
    this.limpiarParametros();
    this.router.navigate(['login']);
  }
  ionViewWillEnter() {
    console.log('Home() - ionViewWillEnter(): ', this.fbSrvc.persona);
    // PASO 2: Validacion de administrador
    if (!this.fbSrvc.escuchandoPersona) {
      this.fbSrvc.getPersonaxAuthUid(this.fbSrvc.persona.authUid)
      .subscribe( per => {
        if (per && per.length > 0) {
          console.log('%cfolder.page.ts cambio en Persona: ', 'color: #007acc;', per);
          this.fbSrvc.persona.estado = per[0].estado;
          if (per[0].estado === '3-suspendido' || !per[0].emailOk || !per[0].adminOk) {
            this.router.navigate(['login']);
          }
        }
      });  
    }
  }
  limpiarParametros() {
    this.fbSrvc.parametros.codigoDir = '';
    this.fbSrvc.parametros.identificado = false;
    this.fbSrvc.parametros.primeraVez = false;
    this.fbSrvc.guardarStorage('parametros', this.fbSrvc.parametros);
  }
  ngOnInit() {
    console.log(`Es admin: ${this.fbSrvc.persona.esAdmin}`);
    setTimeout(() => {
      this.pushSrvc.configuracionInicialCliente();
      if (this.fbSrvc.persona.esAdmin) {
        this.fbSrvc.getNuevosRegistros()
        // tslint:disable-next-line: deprecation
        .subscribe( nuevos => {
          if (nuevos && nuevos.length > 0) {
            console.log('nuevos usuarios registrados:', nuevos.length);
            this.fbSrvc.lanzarSonido('ding', nuevos.length);
            if (nuevos.length === 1) {
              this.fbSrvc.mostrarMensaje(`${nuevos.length} nuevo usuario espera aprobación.`);
            } else {
              this.fbSrvc.mostrarMensaje(`${nuevos.length} nuevos usuarios esperan aprobación.`);
            }
          }
        });
      }
      setTimeout(() => {
        this.fbSrvc.getUrlImagenesNoticias();
      }, 10000);

      if (!this.eliminacionesOK) {
        console.log('%cEliminando datos como admin', 'color: #007acc;');
        setTimeout(() => {
          this.fbSrvc.deleteNoticias();
        }, 15000);
        setTimeout(() => {
          this.fbSrvc.deleteEstadisticas();
        }, 20000);
        setTimeout(() => {
          this.fbSrvc.deletePatentes();
        }, 25000);
        setTimeout(() => {
          this.fbSrvc.deletePagos();
        }, 30000);
        setTimeout(() => {
          this.fbSrvc.deleteRegistros();
        }, 35000);
        setTimeout(() => {
          this.fbSrvc.deleteRondas();
        }, 40000);
        setTimeout(() => {
          this.fbSrvc.deleteVisitas();
        }, 45000);
        this.fbSrvc.guardarStorage('eliminacionesAdmin', true);
      } else {
        console.log('%cYa se eliminaron datos en esta sesión', 'color: #007acc;');
      }
    }, 5000); 
  }
  nuevaNoticia() {
    this.router.navigate(['noticia-add']);
  }
  usuarios() {
    this.router.navigate(['usuarios']);
  }
}
