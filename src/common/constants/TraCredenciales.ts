interface TraCredenciales {
  NOMBRE_ESTABLECIMIENTO: string;
  NIT_ESTABLECIMIENTO: string;
  RNT_ESTABLECIMIENTO: string;
  TOKEN_ESTABLECIMIENTO: string;
  ENDPOINT_TRA_PRINCIPAL: string;
  ENDPOINT_TRA_SECUNDARIO: string;
  NUMERO_HABITACIONES: string;
  MEDIO_PAGO: string;
  MEDIO_RESERVA: string;
}

const NOMBRE_ESTABLECIMIENTO = 'Hotel San Miguel';
const NIT_ESTABLECIMIENTO = '12991769';
const RNT_ESTABLECIMIENTO = '11917';
const TOKEN_ESTABLECIMIENTO = 'KQKjGuSFBx05g4LReq3Ey5lGiS5DIN2q3JDzwpLX';
const NUMERO_HABITACIONES = '9';
const MEDIO_PAGO = 'EFECTIVO';
const MEDIO_RESERVA = 'Ninguno';

const ENDPOINT_TRA_PRINCIPAL = 'https://pms.mincit.gov.co/one/';
const ENDPOINT_TRA_SECUNDARIO = 'https://pms.mincit.gov.co/two/';

export const TRA_CREDENCIALES: TraCredenciales = {
  NOMBRE_ESTABLECIMIENTO,
  NIT_ESTABLECIMIENTO,
  RNT_ESTABLECIMIENTO,
  TOKEN_ESTABLECIMIENTO,
  ENDPOINT_TRA_PRINCIPAL,
  ENDPOINT_TRA_SECUNDARIO,
  NUMERO_HABITACIONES,
  MEDIO_PAGO,
  MEDIO_RESERVA,
};
