import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../services/firebase.service';
import { PushService } from '../../services/push.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder: string;
  constructor(private activatedRoute: ActivatedRoute,
              public fbSrvc: FirebaseService,
              private pushSrvc: PushService,
              private router: Router,
              ) {
      this.folder = this.activatedRoute.snapshot.paramMap.get('id');
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
  alerta() {
    this.router.navigate(['alerta']);
  }
  nuevaNoticia() {
    this.router.navigate(['noticia-add']);
  }
}
