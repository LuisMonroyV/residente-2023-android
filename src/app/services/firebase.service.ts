/* eslint-disable max-len */
import firebase from 'firebase/compat/app';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { ApplicationRef, Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { NativeAudio } from '@awesome-cordova-plugins/native-audio/ngx';
import { CasoEspecial, MesImpago, Noticia, Pago, Qr, Visita, Aviso, AvisoDePago } from '../interfaces/fb-interface';
import { ParametrosApp, Persona, Calle, Parametros, RegistroVisita, Emergencia, Estadistica, Ronda } from '../interfaces/fb-interface';
import { Storage } from '@ionic/storage';
import { ToastController } from '@ionic/angular';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  auth = firebase.auth();
  actualizarApp = false;
  actualizarAppObligatorio = false;
  alertaEnviada = false;
  appPages = [
    {
      title: 'Agenda',
      url: '/agenda',
      icon: 'call',
      visible: true
    },
    {
      title: 'Aviso de Visitas',
      url: '/aviso',
      icon: 'pizza',
      visible: true
    },
    {
      title: 'Botón de Pánico',
      url: '/alerta',
      icon: 'megaphone',
      visible: true
    },
    {
      title: 'Estadísticas',
      url: '/estadisticas',
      icon: 'bar-chart',
      visible: true
    },
    {
      title: 'Mis Datos',
      url: '/mis-datos',
      icon: 'document-text',
      visible: true
    },
    {
      title: 'Mis Pagos',
      url: '/mis-pagos',
      icon: 'cash',
      visible: false // luego se actualiza con el parametro de FB
    },
  ];
  calles: Calle[] = [];
  cargando = false;
  casosEspeciales: CasoEspecial[];
  dark = false;
  enviado = false;
  esAndroid = false;
  esIos = false;
  esOtro = false;
  escuchandoPersona = false;
  expandidoNoticias = false;
  expandidoEmergencias = false;
  expandidoAccesos = false;
  expandidoRondas = false;
  estadisticas: Estadistica[] = [];
  idDirConsulta = '';
  idEncuesta = '';
  imagenEmergenciaActivar = 'assets/images/boton-emergencia-activar.png';
  imagenEmergenciaIncendio = 'assets/images/boton-emergencia-incendio.png';
  imagenEmergenciaMedica = 'assets/images/boton-emergencia-medica.png';
  imagenEmergenciaOtra = 'assets/images/boton-emergencia-otra.png';
  imagenEmergenciaSeguridad = 'assets/images/boton-emergencia-seguridad.png';
  imagenEmergenciaSeleccionada = '';
  imagenes: any[] = [];
  intentosFB = 0;
  login = {
    email: '',
    contrasena: '',
    identificado: false
  };
  pagosDir: Pago[] = [];
  misMesesImpagos: MesImpago[] = [];
  pagosCreados = false;
  parametros: ParametrosApp = {
    codigoDir: '',
    identificado: false,
    codigoAlerta: '000',
    primeraVez: true,
    validado: false,
    verificado: false,
    verEmergencias: true,
    verAccesos: true,
    verRondas: true
  };
  parametrosFB: Parametros = {
    appVersionAndroidStr: '',
    appVersionIosStr: '',
    cuadrante: '',
    emergenciaComunal: '',
    fechaCambioCuota: null,
    guardia: '',
    llamadaReal: false,
    maxAnoPagos: 0,
    maxDiasNoticias: 365,
    maxDiasAvisos: 30,
    maxDiasAvisosDePago: 30,
    maxDiasPatentes: 30,
    maxDiasRegistros: 30,
    maxDiasRondas: 30,
    maxDiasVisitas: 30,
    minDiasRespaldo: 30,
    maxEstadisticas: 6,
    maxNumAccesos: 5,
    maxNumEmergencias: 5,
    maxNumNoticias: 10,
    maxNumRondas: 5,
    minAppVersionAndroid: '',
    minAppVersionIos: '',
    moduloAgenda: true,
    moduloAvisoVisitas: true,
    moduloEstadisticas: true,
    moduloMisDatos: true,
    moduloPagos: true,
    montoCuotaActual: 0,
    montoCuotaAnterior: 0,
    pruebasTienda: false,
    seguridadComunal: '',
    urlAppAndroid: '',
    urlAppIos: '',
  };
  pasoAlerta = 0;
  persona: Persona = {
      adminOk: false,
      apellidoMaterno: '',
      apellidoPaterno: '',
      authUid: '',
      calle: '',
      email: '',
      emailOk: false,
      esAdmin: false,
      esMenordeEdad: false,
      estado: '',
      esTesorero: false,
      fechaRegistro: null,
      idMovil: '',
      idPersona: '',
      movil: '',
      nombres: '',
      notificaciones: false,
      numero: '',
      obs: '',
      telefono: '',
      versionApp: ''
  };
  redirigido = false;
  registrando = false;
  registroAvisado = false;
  textoAlerta = '';
  ultimoAcceso: Date;
  verAppStr = '';


  constructor( private db: AngularFirestore,
               private toast: ToastController,
               private storage: Storage,
               private audio: NativeAudio,
               public loadCtrl: LoadingController,
               private afStorage: AngularFireStorage,
               private appRef: ApplicationRef
              ) {
    this.db.firestore.enablePersistence()
    .then ( () => {
      console.log('Persistencia de datos para FireBase habilitada!');
    })
    .catch( err => {
        console.log('No se pudo habilitar persistencia de datos para FireBase: ', err.code);
    });
    this.getParametrosFB();
  }

  creaCodigo() {
    let miCodDir = '';
    if (this.persona.calle) {
      miCodDir = `${this.persona.calle}-${this.persona.numero}`;
      console.log('Codigo Dirección: ', miCodDir);
      this.parametros.codigoDir = miCodDir;
      this.guardarStorage('parametros', this.parametros);
    } else {
      this.leerStorage('parametros')
      .then( data => {
        miCodDir = data.codigoDir;
        console.log('Codigo Dirección desde storage: ', miCodDir);
      });
      this.parametros.codigoDir = miCodDir;
      this.guardarStorage('parametros', this.parametros);
    }

  }

  deleteEstadisticas() {
    const fechaAnt = moment().startOf('day').subtract(7, 'months').toDate();
    console.log(`Eliminando estadísticas anteriores a: ${moment(fechaAnt).format('DD-MM-YYYY')}`);
    this.db.collection('estadisticas', ref => ref.where('fechaCreacion', '<', fechaAnt))
    .get()
    .subscribe( est => {
      if ( !est.empty ) {
        est.forEach( result => {
          result.ref.delete();
        });
        console.log(`Eliminadas ${est.size} estadísticas`);
      } else {
        console.log(`No se eliminaron estadísticas.`);
      }
    });
  }
  deletePatentes() {
    if (this.parametrosFB.maxDiasPatentes && this.parametrosFB.maxDiasPatentes > 0) {
      const fechaAnt = moment().startOf('day').subtract(this.parametrosFB.maxDiasPatentes, 'days').toDate();
      console.log(`Eliminando patentes anteriores a: ${moment(fechaAnt).format('DD-MM-YYYY')}`);
      this.db.collection('patentes', ref => ref.where('ultimaVisita', '<', fechaAnt))
      .get()
      .subscribe( ppu => {
        if (!ppu.empty ) {
          ppu.forEach( result => {
            result.ref.delete();
          });
          console.log(`Eliminadas ${ppu.size} patentes.`);
        } else {
          console.log(`No se eliminaron patentes.`);
        }
      });
    } else {
      console.log('%cNo hay parámetro de maxDiasPatentes', 'color: #007acc;');
      return;
    }
  }
  async deletePagos() {
    // ELIMINACION DE PAGOS
    this.db.collection('pagos', ref => ref.where('ano', '<', this.parametrosFB.maxAnoPagos))
    .get()
    .subscribe( pagElim => {
      pagElim.forEach( result => {
        result.ref.delete(); 
      });
      console.log(`Eliminados ${pagElim.size} registros de Pagos`);
    });
    // ELIMINACION DE AVISOS DE PAGOS
    const fechaMin = moment('01-01-'+ this.parametrosFB.maxAnoPagos.toString(10), 'DD-MM-YYYY').toDate();
    console.log(`Eliminando avisos de pago anteriores a: ${moment(fechaMin).format('DD-MM-YYYY')}`);
    this.db.collection<AvisoDePago>('avisosDePago')
    .get()
    .subscribe( avisoP => {
      avisoP.docs.forEach( result => {
        const periodosElim = result.data().mesesPagados.filter(elim => this.timestampToDate(elim.fecha) < fechaMin);
        const periodosOk = result.data().mesesPagados.filter(noElim => this.timestampToDate(noElim.fecha) >= fechaMin);
        
        if (result.data().mesesPagados.length === periodosOk.length) {
          // Aviso OK
        } else if (result.data().mesesPagados.length === periodosElim.length) {
          // Eliminar Aviso
          result.ref.delete();
          console.log('%cfirebase.service.ts Aviso Eliminado', 'color: #007acc;');
        } else {
          // Actualizar aviso
          // this.putMesesPagados(result.data().idAvisoPago, periodosOk);
          // console.log('%cfirebase.service.ts Aviso Actualizado', 'color: #007acc;');
        }
        // Eliminación de la(s) imagen(es)
        periodosElim.forEach(async mes => {
          if (mes.documento.length > 0) {
            const url = mes.documento;
            const ref = this.afStorage.storage.refFromURL(url);
            await ref.delete();
          }    
        });
        if (periodosElim.length > 0) {
          console.log('%cfirebase.service.ts imágenes eliminadas: ', 'color: #ff0000;', periodosElim.length);
        }
      });
    })
  }
  deleteRegistros() {
    if (this.parametrosFB.maxDiasRegistros && this.parametrosFB.maxDiasRegistros > 0) {
      const fechaAnt = moment().startOf('day').subtract(this.parametrosFB.maxDiasRegistros, 'days').toDate();
      console.log(`Eliminando registros de visitantes anteriores a: ${moment(fechaAnt).format('DD-MM-YYYY')}`);
      this.db.collection('registro', ref => ref.where('fecha', '<', fechaAnt))
      .get()
      .subscribe( vis => {
        vis.forEach( result => {
          result.ref.delete();
        });
        console.log(`Eliminados ${vis.size} registros de Visitantes.`);
      });
    } else {
      console.log('%cfirebase.service.ts no hay parámetro de maxDiasRegistros', 'color: #007acc;');
      return;
    }
  }
  deleteRondas() {
    if (this.parametrosFB.maxDiasRondas && this.parametrosFB.maxDiasRondas > 0) {
      const fechaAnt = moment().startOf('day').subtract(this.parametrosFB.maxDiasRondas, 'days').toDate();
      console.log(`Eliminando rondas anteriores a: ${moment(fechaAnt).format('DD-MM-YYYY')}`);
      this.db.collection('rondas', ref => ref.where('fechaInicio', '<', fechaAnt))
      .get()
      .subscribe( rnd => {
        rnd.forEach( result => {
          result.ref.delete();
        });
        console.log(`Eliminadas ${rnd.size} Rondas.`);
      });
    } else {
      console.log('%cNo hay parámetro de maxDiaRondas', 'color: #ff0000;');
      return;
    }
  }
  deleteVisitas() {
    if (this.parametrosFB.maxDiasAvisos && this.parametrosFB.maxDiasAvisos > 0) {
      const fechaAnt = moment().startOf('day').subtract(this.parametrosFB.maxDiasAvisos, 'days').toDate();
      console.log(`Eliminando avisos de visitas anteriores a: ${moment(fechaAnt).format('DD-MM-YYYY')}`);
      this.db.collection('avisos', ref => ref.where('fecha', '<', fechaAnt))
      .get()
      .subscribe( avis => {
        avis.forEach( result => {
          result.ref.delete();
        });
        console.log(`Eliminados ${avis.size} avisos de visitas.`);
      });
    } else {
      console.log('%cNo hay parámetro de maxDiasAvisos', 'color: #ff0000;');
      return;
    }
  }

  async deleteNoticias() {
    if (this.persona.esAdmin) {
      const fechaHoy = moment().startOf('day').toDate();
      console.log(`Eliminando noticias ya finalizadas.`);
      return this.db.collection('noticias', ref => ref.where('fechaFin', '<', fechaHoy))
      .get()
      .subscribe( noti => {
        noti.forEach( async result => {
          await result.ref.delete();
        });
        console.log(`Eliminadas ${noti.size} noticias.`);
      });
    } else {
      return;
    }
  }
  async deleteAviso(id: string) {
    return this.db.collection('avisos', ref => ref.where('idAviso', '==', id))
    .get()
    .subscribe( avi => {
      avi.forEach( async result => {
        await result.ref.delete();
      });
    });
  }
  async deleteAvisos() {
    if (this.parametrosFB.maxDiasAvisos && this.parametrosFB.maxDiasAvisos > 0 && this.persona.esAdmin) {
      const fechaAnt = moment().startOf('day').subtract(this.parametrosFB.maxDiasAvisos, 'days').toDate();
      console.log(`Eliminando registros de Avisos de visitas anteriores a: '${moment(fechaAnt).format('DD-MM-YYYY')}`);
      return this.db.collection('avisos', ref => ref.where('fecha', '<', fechaAnt))
      .get()
      .subscribe( avi => {
        avi.forEach( async result => {
          await result.ref.delete();
        });
        console.log(`Eliminados ${avi.size} avisos de visitas.`);
      });
    } else {
      return;
    }
  }
  deleteQRs() {
    const hoy = moment().startOf('day').date();
      console.log(`Eliminando códigos QR utilizados`);
      this.db.collection('qr', ref => ref.where('utilizado', '==', true))
      .get()
      .subscribe( qrsUsados => {
        qrsUsados.forEach( async result => {
          await result.ref.delete();
        });
        console.log(`Eliminados ${qrsUsados.size} códigos QR utilizados.`);
      });
      console.log(`Eliminando códigos QR vencidos`);
      this.db.collection('qr', ref => ref.where('generado', '<', hoy)
                                      .where('validoHasta', '==', 'hoy'))
      .get()
      .subscribe( qrsVencidos => {
        qrsVencidos.forEach( async result => {
          await result.ref.delete();
        });
        console.log(`Eliminados ${qrsVencidos.size} códigos QR vencidos`);
      });
  }
  async deleteUsuario(id: string) {
    console.log('borrando usuario de bd id: ', id);
    this.db.collection('persona', ref => ref.where('idPersona', '==', id))
    .get()
    .subscribe( usu => {
      usu.forEach( async result => {
        await result.ref.delete();
      });
    });
    console.log('borrando usuario de Auth: ');
    (await this.auth.currentUser).delete()
    .then( () => {
      console.log('auth - usuario eliminado correctamente');
    })
    .catch( err => {
      console.log('auth - Error al eliminar usuario: ', err);
    });
  }
  getAdministradores() {
    return this.db.collection<Persona>('persona', ref => ref.where('esAdmin', '==', true)).get();
  }
  getAvisosDePago() {
    console.log('getAvisosDePago()');
    return this.db.collection<AvisoDePago>('avisosDePago', ref => ref.where('estadoAviso', '==', '0-Pendiente')
                                                                     .orderBy('fechaAviso', 'asc'))
                                                                     .valueChanges();
  }
  getCalles() {
    console.log('getCalles()');
    this.calles = [];
    return this.db.collection<Calle>('calles', ref => ref.orderBy('descCalle', 'asc'))
                                                         .get()
                                                         .subscribe( data => {
                                                          data.docs.forEach( calle => {
                                                            this.calles.push({descCalle: calle.data().descCalle,
                                                                              numeracion: calle.data().numeracion,
                                                                             });
                                                          });
                                                          // Eliminación de la calle TODAS
                                                          this.calles = this.calles.slice(0, this.calles.length - 1);
                                                         });
  }
  getCasosEspeciales() {
    console.log('getCasosespeciales()');
    this.casosEspeciales = [];
    return this.db.collection<any>('casosEspeciales')
    .get()
    .subscribe( dataCasos => {
     dataCasos.docs.forEach( caso => {
      const newCaso: CasoEspecial = {
        idCasoEspecial: caso.data().idCasoEspecial,
        idDireccion: caso.data().idDireccion,
        cuotaEspecial: caso.data().cuotaEspecial,
        fechaInicioCuotaEspecial: caso.data().fechaInicioCuotaEspecial,
        fechaTerminoCuotaEspecial: caso.data().fechaTerminoCuotaEspecial ? caso.data().fechaTerminoCuotaEspecial : null,
        observaciones: caso.data().observaciones,
      };
      this.casosEspeciales.push(newCaso);
     });
     console.log('casosEspeciales:', this.casosEspeciales);
    });
  }
  getEmergencias() {
    console.log(`getEmergencias(${this.parametrosFB.maxNumEmergencias})`);
    return this.db.collection<Emergencia>('emergencias', ref => ref.limit(this.parametrosFB.maxNumEmergencias)
                                                                   .orderBy('fechaInicio', 'desc'))
                                                                   .valueChanges();
  }
  getEstadisticasAll() {
    console.log(`Buscando todas las estadísticas.`);
    this.estadisticas = [];
    return this.db.collection<Estadistica>('estadisticas', ref => ref.orderBy('fechaCreacion', 'desc')
                                                                     .limit(this.parametrosFB.maxEstadisticas))
                                                                     .get()
                                                                     .subscribe( data => {
                                                                      data.docs.forEach( estad => {
                                                                        this.estadisticas.push({ fechaCreacion: estad.data().fechaCreacion,
                                                                                                 ano: estad.data().ano,
                                                                                                 mes: estad.data().mes,
                                                                                                 totalVisitas: estad.data().totalVisitas,
                                                                                                 promedioDiarioVisitas: estad.data().promedioDiarioVisitas,
                                                                                                 avisosApp: estad.data().avisosApp,
                                                                                                 promedioDiarioAvisosApp: estad.data().promedioDiarioAvisosApp,
                                                                                                 avisosEfectivos: estad.data().avisosEfectivos,
                                                                                                 porcentajeEfectividad: estad.data().porcentajeEfectividad,
                                                                                                 guardias: estad.data().guardias,
                                                                                                 calles: estad.data().calles,
                                                                                                });
                                                                      });
                                                                      console.log('fbsrvc.getEstadisticasAll: ',this.estadisticas);
                                                                     });
  }
  getMisAccesos() {
    console.log(`getMisAccesos(${this.parametrosFB.maxNumAccesos}): ${this.parametros.codigoDir}`);
    return this.db.collection<RegistroVisita>('registro', ref => ref.limit(this.parametrosFB.maxNumAccesos)
                                                                    .where('idDireccion', '==', this.parametros.codigoDir)
                                                                    .orderBy('fecha', 'desc'))
                                                                    .valueChanges();
  }
  getMisAvisos() {
    console.log('getMisAvisos()');
    const fechaInicioHoy = moment().startOf('day').toDate();
    const fechaFinHoy = moment().endOf('day').toDate();
    return this.db.collection<Aviso>('avisos', ref => ref.where('idDireccion', '==', this.parametros.codigoDir)
                                                         .where('fecha', '>=', fechaInicioHoy)
                                                         .where('fecha', '<=', fechaFinHoy)
                                                         .where('vigente', '==', true)
                                                         .orderBy('fecha', 'asc'))
                                                         .valueChanges();
  }
  getMisAvisosDePago() {
    console.log('getMisAvisosDePago()');
    const fechaCorte = moment().subtract(this.parametrosFB.maxDiasAvisosDePago, 'days').startOf('day').toDate();
    return this.db.collection<AvisoDePago>('avisosDePago', ref => ref.where('idDireccion', '==', this.parametros.codigoDir)
                                                         .where('fechaAviso', '>=', fechaCorte)
                                                         .orderBy('fechaAviso', 'desc'))
                                                         .valueChanges();
  }
  getMisAvisosProgramados() {
    console.log('getMisAvisosProgramados()');
    const fechaFinHoy = moment().endOf('day').toDate();
    return this.db.collection<Aviso>('avisos', ref => ref.where('idDireccion', '==', this.parametros.codigoDir)
                                                         .where('fecha', '>=', fechaFinHoy)
                                                         .where('vigente', '==', true)
                                                         .orderBy('fecha', 'asc'))
                                                         .valueChanges();
  }
  getPagosDir(idDireccion: string) {
    console.log(`getPagosDir(${idDireccion})`);
    return this.db.collection<Pago>('pagos', ref => ref.where('idDireccion', '==', idDireccion)
                                                       .orderBy('ano', 'desc')
                                                       .orderBy('mes', 'asc'))
                                                       .valueChanges();
  }
  async getMisPagosNoAdm() {
    console.log(`getMisPagosNoAdm(${this.parametros.codigoDir})`);
    this.pagosDir = [];
    return await this.db.collection<Pago>('pagos', ref => ref.where('idDireccion', '==', this.parametros.codigoDir)
                                                       .orderBy('ano', 'desc')
                                                       .orderBy('mes', 'asc'))
                                                       .get()
                                                       .toPromise()
                                                       .then( data => {
                                                        data.docs.forEach( pago => {
                                                          this.pagosDir.push({ano: pago.data().ano,
                                                                                   mes: pago.data().mes,
                                                                                   comentario: pago.data().comentario,
                                                                                   idDireccion: pago.data().idDireccion,
                                                                                   pagado: pago.data().pagado,
                                                                                   ultAct: pago.data().ultAct,
                                                                                   });
                                                        });
                                                        console.log('fbsrvc.misPagosNoAdm: ', this.pagosDir);
                                                       });
  }
  getMisVisitas() {
    return this.db.collection<Visita>('visitas', ref => ref.where('idDireccion', '==', this.parametros.codigoDir))
                                                           .valueChanges();
  }
  getMovil(idMovil: string) {
    console.log(`getMovil(${idMovil})`);
    return this.db.collection<Persona>('persona', ref => ref.where('movil', '==', idMovil))
                                                            .get();
  }
  getNoticias() {
    console.log(`getNoticias(${this.parametrosFB.maxNumNoticias})`);
    const fechaFin = moment().toDate();
    return this.db.collection<Noticia>('noticias', ref => ref.limit(this.parametrosFB.maxNumNoticias)
                                                             .where('fechaFin', '>=', fechaFin))
                                                             .valueChanges();
  }
  getNuevasPersonas() {
    return this.db.collection<Persona>('persona', ref => ref.where('estado', '>=', '0-nuevo')
                                                            .where('estado', '<=', '1-rechazado'))
                                                            .valueChanges();
  }
  getNuevosRegistros() {
    return this.db.collection<Persona>('persona', ref => ref.where('estado', '==', '0-nuevo')).valueChanges();
  }
  getPagos( idDir: string) {
    console.log('getPagos()');
    return this.db.collection<Pago>('pagos', ref => ref.where('idDireccion', '==', idDir)
                                                       .orderBy('mes', 'desc'))
                                                       .valueChanges();
  }
  getParametrosFB() {
    console.log('%cfirebase.service.ts getParametrosFB', 'color: #007acc;', moment().format('HH:mm:ss'));
    this.db.collection('parametros')
    .get()
    .subscribe( params => {
      // ACTIVACIONES
      this.parametrosFB.llamadaReal = params.docs[0].get('llamadaReal');
      this.parametrosFB.moduloAgenda = params.docs[0].get('moduloAgenda');
      this.appPages[0].visible = this.parametrosFB.moduloAgenda;
      this.parametrosFB.moduloAvisoVisitas = params.docs[0].get('moduloAvisoVisitas');
      this.appPages[1].visible = this.parametrosFB.moduloAvisoVisitas;
      this.parametrosFB.pruebasTienda = params.docs[0].get('pruebasTienda');
      this.appPages[2].visible = (!this.parametrosFB.pruebasTienda || !this.persona.esAdmin);
      this.parametrosFB.moduloEstadisticas = params.docs[0].get('moduloEstadisticas');
      this.appPages[3].visible = this.parametrosFB.moduloEstadisticas;
      this.parametrosFB.moduloMisDatos = params.docs[0].get('moduloMisDatos');
      this.appPages[4].visible = this.parametrosFB.moduloMisDatos;
      this.parametrosFB.moduloPagos = params.docs[0].get('moduloPagos');
      this.appPages[5].visible = this.parametrosFB.moduloPagos;
      // FECHAS
      this.parametrosFB.fechaCambioCuota = params.docs[1].get('fechaCambioCuota').toDate();
      this.parametrosFB.montoCuotaActual = params.docs[1].get('valorCuotaActual');
      this.parametrosFB.montoCuotaAnterior = params.docs[1].get('valorCuotaAnterior');
      // MAXIMOS
      this.parametrosFB.appVersionAndroidStr = params.docs[2].get('appVersionAndroidStr');
      this.parametrosFB.appVersionIosStr = params.docs[2].get('appVersionIosStr');
      this.parametrosFB.maxAnoPagos = params.docs[2].get('maxAnoPagos'); // 2021
      this.parametrosFB.maxDiasAvisos = params.docs[2].get('maxDiasAvisos');
      this.parametrosFB.maxDiasAvisosDePago = params.docs[2].get('maxDiasAvisosDePago');
      this.parametrosFB.maxDiasNoticias = params.docs[2].get('maxDiasNoticias');
      this.parametrosFB.maxDiasPatentes = params.docs[2].get('maxDiasPatentes');
      this.parametrosFB.maxDiasRegistros = params.docs[2].get('maxDiasRegistros');
      this.parametrosFB.maxDiasRondas = params.docs[2].get('maxDiasRondas');
      this.parametrosFB.maxDiasVisitas = params.docs[2].get('maxDiasVisitas');
      this.parametrosFB.maxEstadisticas = params.docs[2].get('maxEstadisticas');
      this.parametrosFB.maxNumAccesos = params.docs[2].get('maxNumAccesos');
      this.parametrosFB.maxNumEmergencias = params.docs[2].get('maxNumEmergencias');
      this.parametrosFB.maxNumNoticias = params.docs[2].get('maxNumNoticias');
      this.parametrosFB.maxNumRondas = params.docs[2].get('maxNumRondas');
      this.parametrosFB.minAppVersionAndroid = params.docs[2].get('minAppVersionAndroid');
      this.parametrosFB.minAppVersionIos = params.docs[2].get('minAppVersionIos');
      // NUMEROS
      this.parametrosFB.cuadrante = params.docs[3].get('cuadrante');
      this.parametrosFB.guardia = params.docs[3].get('guardia');
      this.parametrosFB.seguridadComunal = params.docs[3].get('seguridadComunal');
      this.parametrosFB.emergenciaComunal = params.docs[3].get('emergenciaComunal');
      // RESERVAS
      // URLS
      this.parametrosFB.urlAppAndroid = params.docs[5].get('urlAppAndroid');
      this.parametrosFB.urlAppIos = params.docs[5].get('urlAppIos');
      console.log('%cfirebase.service.ts getParametrosFB [OK]', 'color: #007acc;', moment().format('HH:mm:ss'), this.parametrosFB);
      this.appRef.tick();
    });
  }
  getPersonas(ultimo?: Persona) {
    if (ultimo) {
      return this.db.collection<Persona>('persona', ref => ref.where('estado', '>=', '2-vigente')
                                                              .orderBy('estado', 'desc')
                                                              .orderBy('nombres', 'asc')
                                                              .orderBy('apellidoPaterno', 'asc')
                                                              .startAfter(ultimo.estado, ultimo.nombres, ultimo.apellidoPaterno)
                                                              .limit(50))
                                                              .valueChanges();
    } else {
      return this.db.collection<Persona>('persona', ref => ref.where('estado', '>=', '2-vigente')
                                                              .orderBy('estado', 'desc')
                                                              .orderBy('nombres', 'asc')
                                                              .orderBy('apellidoPaterno', 'asc')
                                                              .limit(50))
                                                              .valueChanges();
    }
  }
  getPersonasRegistradas(ultimo?: Persona) {
    if (ultimo) {
      return this.db.collection<Persona>('persona', ref => ref.where('estado', '>=', '2-vigente')
                                                              .where('estado', '<=', '3-suspendido')
                                                              .orderBy('estado', 'asc')
                                                              .orderBy('nombres', 'asc')
                                                              .orderBy('apellidoPaterno', 'asc')
                                                              .startAfter(ultimo.estado, ultimo.nombres, ultimo.apellidoPaterno)
                                                              .limit(50))
                                                              .valueChanges();
    } else {
      return this.db.collection<Persona>('persona', ref => ref.where('estado', '>=', '2-vigente')
                                                              .where('estado', '<=', '3-suspendido')
                                                              .orderBy('estado', 'asc')
                                                              .orderBy('nombres', 'asc')
                                                              .orderBy('apellidoPaterno', 'asc'))
                                                              .valueChanges();
    }
  }
  getPersonaxAuthUid( id: string)  {
    console.log(`getPersonaxAuthUid(${id})`);
    if (id && id.length > 0) {
      this.escuchandoPersona = true;
    }
    return this.db.collection<Persona>('persona', ref => ref.where('authUid', '==', id))
                                                            .valueChanges();
  }
  getPersonasxDireccion( id: string)  {
    console.log(`getPersonasxDireccion(${id})`);
    const idDir = id.substring(0, id.search('-'));
    // eslint-disable-next-line max-len
    const idNum = id.substring(id.search('-') + 1, id.length);
    return this.db.collection<Persona>('persona', ref => ref.where('calle', '==', idDir)
                                                            .where('numero', '==', idNum))
                                                            .get();
  }
  getPersonaxId( id: string)  {
    console.log(`getPersonaxId(${id})`);
    return this.db.collection<Persona>('persona', ref => ref.where('authUid', '==', id))
                                                            .get();
  }
  getRondas() {
    console.log(`getRondas(${this.parametrosFB.maxNumRondas})`);
    return this.db.collection<Ronda>('rondas', ref => ref.limit(this.parametrosFB.maxNumRondas)
                                                         .orderBy('fechaInicio', 'desc'))
                                                         .get();
  }
  async getUrlImagenesNoticias() {
    this.imagenes = [];
    const fechaHoy = moment().startOf('day').toDate();
    return await this.db.collection('noticias').ref.where('fechaFin', '<', fechaHoy)
    .get()
    .then( (querySnapshot) => {
      querySnapshot.forEach( async doc => {
        this.imagenes.push(doc.data());
        if (this.imagenes[0].urlImagen.length > 0) {
          const url = this.imagenes[0].urlImagen;
          const ref = this.afStorage.storage.refFromURL(url);
          await ref.delete();
        }
        console.log(this.imagenes);
        this.imagenes.splice(0, 1);
      });
    })
    .catch( err => {
      console.log('Error al obtener url de imagenes. ', err );
    });
  }
  guardarStorage( clave: string, struct: any ) {
    this.storage.set( clave, struct );
  }
  lanzarSonido( id: string, times?: number ) {
    setTimeout(() => {
      let veces = 1;
      if (times) {
        veces = times;
      }
      for (let index = 0; index < veces; index++) {
        if ( index > 0 ) {
          // Esperar 2 segundos entre sonidos
          setTimeout(() => {
            this.audio.play(id)
            .then(() => {
              console.log('Sonido ' + index + ' ' + id + ' lanzado!');
            });
          }, 2000);
        } else {
          this.audio.play(id)
          .then(() => {
            console.log('Sonido inicial ' + id + ' lanzado!');
          });
        }
      }
    }, 250);
  }
  async leerStorage( clave: string ) {
    console.log('leyendo storage.', clave );
    return await this.storage.get( clave );
  }
  async loading(texto?: string) {
    const load = await this.loadCtrl.create({
      spinner: 'circular',
      mode: 'ios',
      message: texto
    });
    await load.present();
    setTimeout(() => {
      this.stopLoading();
    }, 10000);
    const { role, data } = await load.onDidDismiss();
    console.log('Loading dismissed!');
  }
  loginFirebase(email: string, pass?: string) {  // Posteo en FireBase
    // console.log(`loginFirebase(email: ${email}, pass?: ${pass})`);
    return this.auth.signInWithEmailAndPassword(email, pass);
  }
  logOutFirebase() {
    console.log('logOutFirebase()');
    this.parametros.identificado = false;
    this.parametros.validado = false;
    this.parametros.verificado = false;
    this.guardarStorage('parametros', this.parametros);
    this.persona.emailOk = false;
    this.persona.esAdmin = false;
    this.persona.adminOk = false;
    return this.auth.signOut();
  }
  async mostrarMensaje( texto: string, duracion?: number ) {
    const toast = await this.toast.create({
      message: texto,
      duration: duracion ? duracion : 2000,
      position: 'bottom'
    });
    toast.present();
  }
  async postAviso( avi: Aviso ) {
    if (avi.nota.length + avi.empresa.length + avi.patente.length > 0) {
      await this.db.collection('avisos').add(avi)
      .then( docRef => {
        console.log('Aviso ID: ', docRef.id);
        avi.idAviso = docRef.id;
        this.putAviso(avi)
        .then( () => {
          console.log('Aviso Actualizado.');
        })
        .catch( err => {
          console.log('Error al actualizar aviso: ', err);
        });
      })
      .catch( err => {
        console.log('Error al ingresar Aviso: ', err);
      });
    }
  }
  async postAvisoDePago( avisoPago: AvisoDePago ) {
    await this.db.collection('avisosDePago').add(avisoPago)
    .then( docRef => {
      console.log('Aviso de Pago ID: ', docRef.id);
      avisoPago.idAvisoPago = docRef.id;
      this.putAvisoDePago(avisoPago)
      .then( () => {
        console.log('Aviso de Pago actualizado.');
      })
      .catch( err => {
        console.log('Error al actualizar aviso de pago: ', err);
      });
    })
    .catch( err => {
      console.log('Error al ingresar aviso de pago: ', err);
    });
  }
  async postEmergencia( eme: Emergencia ) {
    if (eme.obs.length > 0) {
      await this.db.collection('emergencias').add(eme)
      .then( docRef => {
        console.log('Emergencia ID: ', docRef.id);
        eme.idEmergencia = docRef.id;
        this.putEmergencia(eme)
        .then( () => {
          console.log('Emergencia Actualizada.');
        })
        .catch( err => {
          console.log('Error al actualizar emergencia: ', err);
        });
      })
      .catch( err => {
        console.log('Error al ingresar Emergencia: ', err);
      });
    }
  }
  async postNoticia( noti: Noticia) {
    await this.db.collection('noticias').add(noti)
    .then( docRef => {
      console.log('Noticia ID: ', docRef.id);
      noti.idNoticia = docRef.id;
      this.putNoticia( noti )
      .then( () => {
        console.log('ID de noticia actualizada.');
      });
    });
  }
  async postPago( pagos: Pago) {
    const idPago = `${pagos.ano}${pagos.mes}${pagos.idDireccion}`;
    return await this.db.collection('pagos').doc(`${idPago}`).set(pagos) // Si no existe, lo crea
    .then( () => {
      console.log('Pago Agregado correctamente.');
    })
    .catch( err => {
      console.log('Error al crear pago: ', err);
    });
  }
  async postPersona( per: Persona ) {
    await this.db.collection('persona').add(per)
    .then( docRef => {
      console.log('Persona ID: ', docRef.id);
      this.persona.idPersona = docRef.id;
      this.putPersona( this.persona)
      .then( () => {
        console.log('ID de persona actualizada.');
      });
    })
    .catch( err => {
      console.log('Error en postPersona(): ', err, per);
      this.mostrarMensaje('Hubo un error al guardar el nuevo usuario: ', err);
    });
  }
  async postQr( qr: Qr ) {
    return await this.db.collection('qr').add(qr);
  }
  postVisitas( visita: Visita) {
    return this.db.collection('visitas').doc(`${visita.idDireccion}`).set(visita);
  }
  putAviso( avi: Aviso) {
    return this.db.collection('avisos').doc(avi.idAviso).update(avi);
  }
  putAvisoDePago( avisoPago: AvisoDePago) {
    return this.db.collection('avisosDePago').doc(avisoPago.idAvisoPago).update(avisoPago);
  }
  putEmergencia( eme: Emergencia) {
    return this.db.collection('emergencias').doc(eme.idEmergencia).update(eme);
  }
  putNoticia( noti: Noticia) {
    return this.db.collection('noticias').doc(noti.idNoticia).update(noti);
  }
  async putPago( pag: Pago) { 
    pag.ultAct = moment().toISOString(true);
    return await this.db.collection('pagos').doc(`${pag.ano}${pag.mes}${pag.idDireccion}`).set(pag);
  }
  putPersona( per: Persona) {
    if (this.parametros.identificado || this.registrando) {
      console.log('putPersona()', per);
      this.registrando = false;
      return this.db.collection('persona').doc(per.idPersona).update(per);
    } else {
      return null;
    }
  }
  putPersonaEmailOk( per: Persona) {
    return this.db.collection('persona').doc(per.idPersona).update({ emailOk: true });
  }
  putIdQr( id: string) {
    return this.db.collection('qr').doc(id).update({ idQr: id });
  }
  putInvalidarQr( id: string) {
    return this.db.collection('qr').doc(id).update({ utilizado: true });
  }
  async registroFirebase( email: string, pass: string ) {
    console.log('registroFirebase()');
    return await this.auth.createUserWithEmailAndPassword( email, pass);
  }
  async resetPassword() {
    await this.auth.sendPasswordResetEmail( this.login.email )
    .then( () => {
      this.mostrarMensaje('Instrucciones enviadas al mail.');
    })
    .catch( (err) => {
      console.log('Error al enviar correo para reset de contraseña: ', err);
      this.mostrarMensaje('No se pudo enviar el correo.');
    });
  }
  async sendEmailVerification() {
    this.enviado = true;
    (await this.auth.currentUser).sendEmailVerification()
    .then( () => {
      this.mostrarMensaje('Correo enviado.');
    })
    .catch( err => {
      console.log('Error al enviar correo: ', err);
      this.mostrarMensaje('No pudimos enviar el correo, reintenta en unos momentos.');
    });
  }
  stopLoading() {
    console.log('stopLoading()');
    this.loadCtrl.getTop().then( elem => {
      if (elem) {
        this.loadCtrl.dismiss();
      }
    })
    .catch( err => {
      console.error(err);
    });
  }
  timestampToDate(fechaTS: any): Date {
    if (fechaTS.seconds) {
      // console.log('%ctimestampToDate fechaTS', 'color: #007acc;', fechaTS);
      return moment(fechaTS.seconds * 1000).toDate();
    } else {
      // console.log('%ctimestampToDate fechaTS', 'color: #007acc;', fechaTS);
      return moment(fechaTS).toDate();
    }
  }
  toggleDarkTheme(estado: boolean) {
    console.log('cambiar darkMode a:', estado);
    document.body.classList.toggle('dark', estado);
    this.dark = estado;
  }
  validarVersionApp( data: string) {
    if (this.parametrosFB.appVersionAndroidStr) {
      this.intentosFB = 0;
      let verNumDisp = parseInt(data.split('.').join(''), 10);
      let verNumAct = parseInt(this.parametrosFB.appVersionAndroidStr.split('.').join(''), 10);
      let verNumMin = parseInt(this.parametrosFB.minAppVersionAndroid.split('.').join(''), 10);
      if (verNumDisp < 1000) { 
        verNumDisp *= 10;
      }
      if (verNumAct < 1000) { 
        verNumAct *= 10; 
      }
      if (verNumMin < 1000) { 
        verNumMin *= 10;       
      }
      console.log('%cverNumDisp, verNumAct, verNumMin', 'color: #007acc;', `${verNumDisp}, ${verNumAct}, ${verNumMin}`);
      this.actualizarApp = verNumDisp < verNumAct;
      this.actualizarAppObligatorio = verNumDisp < verNumMin;
      console.log('fbSrvc.actualizarApp: ', this.actualizarApp);
      console.log('fbSrvc.actualizarApp Obligatorio: ', this.actualizarAppObligatorio);
      if (this.actualizarApp) {
        this.lanzarSonido('sms', 1);
      }
    } else {
      // No se ha cargado aún los parámetros de Firebase
      this.intentosFB++;
      if (this.intentosFB <= 3) { // Tres intentos como máximo
        console.log('%cfirebase.service.ts esperando 5 segundos a los parámetros de Firebase', 'color: #007acc;');
        setTimeout(() => {
          this.validarVersionApp(data); // Recursividad cada 5 segundos
        }, 5000);
      }
    }
  }
}
