import { CreateHuespedPrincipalTraDto } from './huespedPrincipalTraDto';

export class PostHuespedPrincipalDto extends CreateHuespedPrincipalTraDto {
  nombre_establecimiento: string;
  rnt_establecimiento: string;
}
