import { TipoDocumentoSireUpload } from '../enums/tipoDocSireUpload';

interface SireCredenciales {
  codigoHotelSire: number;
  codigoCiudadSire: number;
  usuarioSire: string;
  passwordSire: string;
  tipoDocSireUpload: TipoDocumentoSireUpload;

  SireUrl: string;
}

const codigoHotelSire = 1;
const codigoCiudadSire = 1;
const SireUrl = 'https://apps.migracioncolombia.gov.co/sire/public/login.jsf';
const usuarioSire = '12991769';
const passwordSire = 'arcangel';
const tipoDocSireUpload = TipoDocumentoSireUpload.CC;

export const SIRE_CREDENCIALES: SireCredenciales = {
  codigoHotelSire,
  codigoCiudadSire,
  SireUrl,
  usuarioSire,
  passwordSire,
  tipoDocSireUpload,
};
