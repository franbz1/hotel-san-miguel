import { TipoDoc } from './tipoDoc.enum';

export class Huesped {
  id: number;
  nombre: string;
  tipo_documento: TipoDoc;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: Date;
  direccion: string;
  procedencia: string;
  destino: string;
  motivo_viaje: string;
  correo: string;
  documentos_subidos: [] | null;
}
