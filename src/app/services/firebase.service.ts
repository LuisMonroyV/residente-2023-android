/* eslint-disable max-len */
import firebase from 'firebase/compat/app';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ApplicationRef, Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { NativeAudio } from '@awesome-cordova-plugins/native-audio/ngx';
import { CasoEspecial, MesImpago, Noticia, Pago, Qr, Visita, Aviso, AvisoDePago, Reserva } from '../interfaces/fb-interface';
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
    {
      title: 'Multicancha',
      url: '/reservas-cancha',
      icon: 'calendar-number',
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
    feriados: [],
    guardia: '',
    horaFinSemana: null,
    horaFinSabado: null,
    horaFinFeriado: null,
    horaInicioSemana: null,
    horaInicioSabado: null,
    horaInicioFeriado: null,
    // llamadaReal: false,
    maxAnoPagos: 0,
    maxDiasNoticias: 365,
    maxDiasAvisos: 30,
    maxDiasAvisosDePago: 30,
    maxEstadisticas: 6,
    maxNumAccesos: 5,
    maxNumEmergencias: 5,
    maxNumNoticias: 10,
    maxNumRondas: 5,
    maxReservasDiarias: 2,
    minAppVersionAndroid: '',
    minAppVersionIos: '',
    moduloAgenda: true,
    moduloAvisoVisitas: true,
    moduloEstadisticas: true,
    moduloMisDatos: true,
    moduloPagos: true,
    moduloReservas: true,
    pruebasTienda: false,
    seguridadComunal: '',
    urlAppAndroid: '',
    urlAppIos: '',
    valorCuotaActual: 0,
    valorCuotaAnterior: 0,
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
      esAdminCancha: false,
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
  reservasCancha: Reserva[] = [];
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
    // console.log('%cLlamando a getParametrosFB() desde firebaseService.ts', 'color: #007acc;');
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
  async deleteNoticias() {
    if (this.persona.esAdmin) {
      const fechaHoy = moment().startOf('day').toDate();
      console.log(`Eliminando registros de Noticias finalizadas.`);
      return this.db.collection('noticias', ref => ref.where('fechaFin', '<', fechaHoy))
      .get()
      .subscribe( noti => {
        noti.forEach( async result => {
          await result.ref.delete();
        });
        console.log(`Eliminados ${noti.size} registros`);
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
      console.log(`Eliminando registros de Avisos anteriores a: '${fechaAnt}`);
      return this.db.collection('avisos', ref => ref.where('fecha', '<', fechaAnt))
      .get()
      .subscribe( avi => {
        avi.forEach( async result => {
          await result.ref.delete();
        });
        console.log(`Eliminados ${avi.size} registros`);
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
        console.log(`Eliminados ${qrsUsados.size} registros`);
      });
      console.log(`Eliminando códigos QR vencidos`);
      this.db.collection('qr', ref => ref.where('generado', '<', hoy)
                                      .where('validoHasta', '==', 'hoy'))
      .get()
      .subscribe( qrsVencidos => {
        qrsVencidos.forEach( async result => {
          await result.ref.delete();
        });
        console.log(`Eliminados ${qrsVencidos.size} registros`);
      });
  }
  async deleteReserva(id: string) {
    return this.db.collection('reservas', ref => ref.where('idReserva', '==', id))
    .get()
    .subscribe( res => {
      res.forEach( async result => {
        await result.ref.delete();
      });
      this.appRef.tick();
      console.log(`Eliminada la reserva.`);
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
  esFeriado(fecha: Date): boolean { // Retorna true si es feriado o Domingo
    return (this.parametrosFB.feriados.findIndex(fer => this.soloFecha(this.timestampToDate(fer)) === this.soloFecha(fecha)) > -1) || 
           (moment(fecha).day() === 0);
  }
  getAdministradores() {
    return this.db.collection<Persona>('persona', ref => ref.where('esAdmin', '==', true)).get();
  }
  getAdminsCancha() {
    return this.db.collection<Persona>('persona', ref => ref.where('esAdminCancha', '==', true)).get();
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
    console.log(`getPagosDir(${this.parametros.codigoDir})`);
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
  getMisReservas() {
    const inicioSemana = moment().startOf('day').toDate();
    const finalSemana = moment().endOf('day').add(6,'days').toDate();
    console.log(`getMisReservas(${moment(inicioSemana).format('DD-MMM')} al ${moment(finalSemana).format('DD-MMM')})`);
    return this.db.collection<Reserva>('reservas', ref => ref.where('fechaInicioReserva', '>=', inicioSemana)
                                                             .where('idDireccion', '==', this.parametros.codigoDir)
                                                             .orderBy('fechaInicioReserva', 'asc'))
                                                             .valueChanges();
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
    this.db.collection<Parametros>('parametros')
    .valueChanges()
    .subscribe( params => {
      console.log('%cfirebase.service.ts getParametrosFB', 'color: #007acc;', moment().format('HH:mm:ss'));
      // ACTIVACIONES
      // this.parametrosFB.llamadaReal = params[0].llamadaReal;
      this.parametrosFB.moduloAgenda = params[0].moduloAgenda;
      this.appPages[0].visible = this.parametrosFB.moduloAgenda;
      this.parametrosFB.moduloAvisoVisitas = params[0].moduloAvisoVisitas;
      this.appPages[1].visible = this.parametrosFB.moduloAvisoVisitas;
      this.parametrosFB.pruebasTienda = params[0].pruebasTienda;
      this.appPages[2].visible = (!this.parametrosFB.pruebasTienda || !this.persona.esAdmin);
      this.parametrosFB.moduloEstadisticas = params[0].moduloEstadisticas;
      this.appPages[3].visible = this.parametrosFB.moduloEstadisticas;
      this.parametrosFB.moduloMisDatos = params[0].moduloMisDatos;
      this.appPages[4].visible = this.parametrosFB.moduloMisDatos;
      this.parametrosFB.moduloPagos = params[0].moduloPagos;
      this.appPages[5].visible = this.parametrosFB.moduloPagos;
      this.parametrosFB.moduloReservas = params[0].moduloReservas;
      this.appPages[6].visible = this.parametrosFB.moduloReservas;
      // FECHAS
      this.parametrosFB.fechaCambioCuota = this.timestampToDate(params[1].fechaCambioCuota);
      this.parametrosFB.valorCuotaActual = params[1].valorCuotaActual;
      this.parametrosFB.valorCuotaAnterior = params[1].valorCuotaAnterior;
      // // MAXIMOS
      this.parametrosFB.appVersionAndroidStr = params[2].appVersionAndroidStr;
      this.parametrosFB.appVersionIosStr = params[2].appVersionIosStr;
      this.parametrosFB.maxAnoPagos = params[2].maxAnoPagos;
      this.parametrosFB.maxDiasAvisos = params[2].maxDiasAvisos;
      this.parametrosFB.maxDiasAvisosDePago = params[2].maxDiasAvisosDePago;
      this.parametrosFB.maxDiasNoticias = params[2].maxDiasNoticias;
      this.parametrosFB.maxEstadisticas = params[2].maxEstadisticas;
      this.parametrosFB.maxNumAccesos = params[2].maxNumAccesos;
      this.parametrosFB.maxNumEmergencias = params[2].maxNumEmergencias;
      this.parametrosFB.maxNumNoticias = params[2].maxNumNoticias;
      this.parametrosFB.maxNumRondas = params[2].maxNumRondas;
      this.parametrosFB.minAppVersionAndroid = params[2].minAppVersionAndroid;
      this.parametrosFB.minAppVersionIos = params[2].minAppVersionIos;
      // // NUMEROS
      this.parametrosFB.cuadrante = params[3].cuadrante;
      this.parametrosFB.guardia = params[3].guardia;
      this.parametrosFB.seguridadComunal = params[3].seguridadComunal;
      this.parametrosFB.emergenciaComunal = params[3].emergenciaComunal;
      // // RERSERVAS
      this.parametrosFB.horaFinSemana = params[4].horaFinSemana;
      this.parametrosFB.horaFinSabado = params[4].horaFinSabado;
      this.parametrosFB.horaFinFeriado = params[4].horaFinFeriado;
      this.parametrosFB.horaInicioSemana = params[4].horaInicioSemana;
      this.parametrosFB.horaInicioSabado = params[4].horaInicioSabado;
      this.parametrosFB.horaInicioFeriado = params[4].horaInicioFeriado;
      this.parametrosFB.feriados = params[4].feriados;
      // // URLS
      this.parametrosFB.urlAppAndroid = params[5].urlAppAndroid;
      this.parametrosFB.urlAppIos = params[5].urlAppIos;
      console.log('%cfirebase.service.ts getParametrosFB [OK]', 'color: #007acc;', moment().format('HH:mm:ss'),this.parametrosFB);
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
  getReservas() {
    const inicioSemana = moment().startOf('day').toDate();
    const finalSemana = moment().startOf('day').add(6,'days').toDate();
    console.log(`getReservas(${moment(inicioSemana).format('DD-MMM')} al ${moment(finalSemana).format('DD-MMM')})`);
    return this.db.collection<Reserva>('reservas', ref => ref.where('fechaInicioReserva', '>=', inicioSemana))
                                                                  //  .where('fechaSolicitud', '<=', finalSemana))
                                                                   .valueChanges();
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
  hayReserva(fecha: Date): Reserva {
    return this.reservasCancha.find(res => this.soloFecha(res.fechaInicioReserva) === this.soloFecha(fecha) &&
                                           this.soloHora(res.fechaInicioReserva) === this.soloHora(fecha));
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
  async postReserva( res: Reserva) {
    await this.db.collection('reservas').add(res)
    .then( docRef => {
      console.log('Reserva ID: ', docRef.id);
      res.idReserva = docRef.id;
      this.putReserva( res )
      .then( () => {
        console.log('ID de reserva actualizada.');
      });
    });
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
  putReserva( res: Reserva) {
    return this.db.collection('reservas').doc(res.idReserva).update(res);
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
  soloFecha(fecha: Date) {
    return(moment(fecha).format('DD-MM-YYYY'));
  }
  soloHora(fecha: Date) {
    return(moment(fecha).format('HH:mm'));
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
      console.log('%ctimestampToDate fechaTS sin seconds', 'color: #007acc;', fechaTS);
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
