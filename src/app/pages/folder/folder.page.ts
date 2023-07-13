import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { PushService } from '../../services/push.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder: string;
  public selectedIndex = 0;
  constructor(private activatedRoute: ActivatedRoute,
              public fbSrvc: FirebaseService,
              private menu: MenuController,
              private pushSrvc: PushService,
              private router: Router,
              ) {
      this.folder = this.activatedRoute.snapshot.paramMap.get('id');
  }
  alerta() {
    this.router.navigate(['alerta']);
  }
  cerrarSesion() {
    this.menu.close();
    this.fbSrvc.logOutFirebase();
    this.limpiarParametros();
    this.router.navigate(['login']);
  }
  ionViewWillEnter() {
    console.log('Home() - ionViewWillEnter(): ', this.fbSrvc.persona);
    // PASO 2: Validacion de administrador
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
  limpiarParametros() {
    this.fbSrvc.parametros.codigoDir = '';
    this.fbSrvc.parametros.identificado = false;
    this.fbSrvc.parametros.primeraVez = false;
    this.fbSrvc.guardarStorage('parametros', this.fbSrvc.parametros);
  }
  ngOnInit() {
    setTimeout(() => {
      this.pushSrvc.configuracionInicialCliente();
      console.log(`Es admin: ${this.fbSrvc.persona.esAdmin}`);
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
    }, 5000);

    if (this.fbSrvc.persona.esAdmin) {
      setTimeout(() => {
        this.fbSrvc.getUrlImagenesNoticias();
      }, 10000);
      setTimeout(() => {
        this.fbSrvc.deleteNoticias();
      }, 15000);
    }
  }
  nuevaNoticia() {
    this.router.navigate(['noticia-add']);
  }
  usuarios() {
    this.router.navigate(['usuarios']);
  }
}
