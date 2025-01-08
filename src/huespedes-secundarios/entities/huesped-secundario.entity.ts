import { TipoDoc } from 'src/huespedes/entities/tipoDoc.enum';

export class HuespedSecundario {
  id: number;
  tipo_documento: TipoDoc;
  numero_documento: string;
  primer_apellido: string;
  segundo_apellido: string;
  nombres: string;
  pais_residencia: string;
  departamento_residencia: string;
  ciudad_residencia: string;
  lugar_nacimiento: string;
  fecha_nacimiento: Date;
  nacionalidad: string;
  ocupacion: string;
  genero: string;
  telefono?: string;
  correo?: string;

  huespedId: number;
  documentos_subidos: [];
}
