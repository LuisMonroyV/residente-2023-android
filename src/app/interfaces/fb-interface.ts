// import * as firebase from 'firebase';
export interface Aviso {
    avisar: boolean;
    empresa: string;
    fecha: Date;
    idAviso: string;
    idDireccion: string;
    nota: string;
    patente: string;
    vigente: boolean;
}
export interface AvisoDePago {
    estadoAviso: string;
    fechaAprobacion: Date;
    fechaAviso: Date;
    fechaRechazo: Date;
    fechaTransferencia: Date;
    idAvisoPago: string;
    idDireccion: string;
    mesesPagados: MesImpago[];
    montoPago: number;
    obsResidente: string;
    obsRevisor: string;
    revisor: string;
    transfiere: string;
}
export interface Calle {
    descCalle: string;
    numeracion: [];
}
export interface CasoEspecial {
    idCasoEspecial: string;
    idDireccion: string;
    cuotaEspecial: number;
    fechaInicioCuotaEspecial: string;
    fechaTerminoCuotaEspecial: string;
    observaciones: string;
}
export interface Emergencia {
    estado: string;
    fechaInicio: Date;
    fechaTermino: Date;
    guardia: string;
    idDireccion: string;
    idEmergencia: string;
    obs: string;
}
export interface Estadistica {
    fechaCreacion: Date;
    ano: number;
    mes: number;
    totalVisitas: number;
    promedioDiarioVisitas: number;
    avisosApp: number;
    promedioDiarioAvisosApp: number;
    avisosEfectivos: number;
    porcentajeEfectividad: number;
    guardias: EstadisticasGuardia[];
    calles: EstadisticasCalle[];
}
export interface EstadisticasCalle {
    calle: string;
    visitasTotales: number;
    visitasAvisadas: number;
    direcciones: EstadisticasDirecciones[];
}
export interface EstadisticasDirecciones {
    numeracion: string;
    visitasTotales: number;
    visitasAvisadas: number;
    minutosInvertidos: number;
}
export interface EstadisticasGuardia {
    nombre: string;
    registrosTotales: number;
    registrosAvisados: number;
}
export interface Gasto {
    fecha: Date;
    categoria: string;
    monto: number;
    destinatario: string;
    obs: string;
}
export interface MesImpago {
    fecha: Date;
    mesAno: string;
    monto: number;
    documento: string;
    idTransaccion: string;
}
export interface Noticia {
    creadaPor: string;
    fecha: Date;
    fechaFin: Date;
    idNoticia: string;
    notificar: boolean;
    texto: string;
    titulo: string;
    urlImagen: string;
}
export interface Novedad {
    fecha: Date;
    descripcion: string;
}
export interface Pago {
    ano: number;
    comentario: string;
    idDireccion: string;
    mes: number;
    pagado: boolean;
    ultAct: string;
}
export interface Parametros {
    appVersionAndroidStr: string;
    appVersionIosStr: string;
    cuadrante: string;
    emergenciaComunal: string;
    fechaCambioCuota: Date;
    guardia: string;
    horaFinSemana: number;
    horaFinSabado: number;
    horaFinFeriado: number;
    horaInicioSemana: number;
    horaInicioSabado: number;
    horaInicioFeriado: number;
    feriados: Date[];
    // llamadaReal: boolean;
    maxAnoPagos: number;
    maxEstadisticas: number;
    maxDiasAvisos: number;
    maxDiasAvisosDePago: number;
    maxDiasNoticias: number;
    maxNumAccesos: number;
    maxNumEmergencias: number;
    maxNumNoticias: number;
    maxNumRondas: number;
    maxReservasDiarias: number;
    minAppVersionAndroid: string;
    minAppVersionIos: string;
    moduloAgenda: boolean;
    moduloAvisoVisitas: boolean;
    moduloEstadisticas: boolean;
    moduloMisDatos: boolean;
    moduloPagos: boolean;
    moduloReservas: boolean;
    pruebasTienda: boolean;
    seguridadComunal: string;
    urlAppAndroid: string;
    urlAppIos: string;
    valorCuotaActual: number;
    valorCuotaAnterior: number;
}
export interface ParametrosApp {
    codigoDir: string; // codigo calle + numero
    identificado: boolean; // Login
    codigoAlerta: string;
    primeraVez: boolean; // para mostrar slides
    validado: boolean; // por el administrador
    verificado: boolean; // email verificado
    verEmergencias: boolean;
    verAccesos: boolean;
    verRondas: boolean;
}
export interface Persona {
    adminOk: boolean;
    apellidoPaterno: string;
    apellidoMaterno: null | string;
    authUid: string;
    calle: string;
    email: string;
    emailOk: boolean;
    esAdmin: boolean;
    esAdminCancha: boolean;
    esMenordeEdad: boolean;
    estado: string;
    esTesorero: boolean;
    fechaRegistro: Date;
    idMovil: string;
    idPersona: string;
    movil: null | string;
    nombres: string;
    notificaciones: boolean;
    numero: string;
    telefono: string;
    obs: string;
    versionApp: string;
}
export interface Qr {
    calle: string;
    generado: string;
    idQr: string;
    numero: string;
    validoHasta: string;
    utilizado: boolean;
}
export interface RegistroVisita {
    duracion: number;
    fecha: any;
    guardia: string;
    idDireccion: string;
    nombreVisitante: string;
    numeroCartel: string;
    obs: string;
    patente: string;
    residenteResponde: boolean;
    turno: string;
}
export interface RegistroVisitaS {
    fecha: string;
    guardia: string;
    idDireccion: string;
    nombreVisitante: string;
    numeroCartel: string;
    obs: string;
    patente: string;
    residenteResponde: boolean;
    turno: string;
}
export interface Reserva {
    contacto: string;
    estado: string;
    fechaFinReserva: Date;
    fechaInicioReserva: Date;
    fechaSolicitud: Date;
    idDireccion: string;
    idReserva: string;
    obsAdmin: string;
    obsResid: string;
}
export interface Ronda {
    fechaInicio: Date;
    fechaTermino: Date;
    guardia: string;
    novedades: Novedad[];
}
export interface Dia {
    dia: Date;
    horas: Hora[];
}
export interface Hora {
    hora: Date;
    reserva: Reserva;
}
export interface Visita {
    idDireccion: string;
    autorizados: string[];
    rechazados: string[];
}
