import { CreateHuespedPrincipalTraDto } from './huespedPrincipalDto';

export class PostHuespedPrincipalDto extends CreateHuespedPrincipalTraDto {
  nombre_establecimiento: string;
  nit_establecimiento: string;
  rnt_establecimiento: string;
  n_habitaciones: string;
}
