import { TipoDoc } from './tipoDoc.enum';

export class Huesped {
  id: number;

  tipo_documento: TipoDoc;
  numero_documento: string;

  prmimer_apellido: string;
  segundo_apellido: string;
  nombres: string;

  pais_recidencia: string;
  departamento_recidencia: string;
  ciudad_recidencia: string;

  lugar_nacimiento: string;
  fecha_nacimiento: Date;
  nacionalidad: string;
  ocupacion: string;
  genero: string;

  telefono: string;
  correo: string;

  reservas: [] | null;
  huespedes_secundarios: [] | null;
  documentos_subidos: [] | null;

  createdAt: Date;
  updatedAt: Date;

  deleted: boolean;
}
