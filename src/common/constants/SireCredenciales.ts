interface SireCredenciales {
  codigoHotelSire: number;
  codigoCiudadSire: number;

  SireUrl: string;
}

const codigoHotelSire = 1;
const codigoCiudadSire = 1;
const SireUrl = 'https://apps.migracioncolombia.gov.co/sire/public/login.jsf';

export const SIRE_CREDENCIALES: SireCredenciales = {
  codigoHotelSire,
  codigoCiudadSire,
  SireUrl,
};
