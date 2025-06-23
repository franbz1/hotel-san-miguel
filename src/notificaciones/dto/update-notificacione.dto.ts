import { PartialType } from '@nestjs/swagger';
import { CreateNotificacioneDto } from './create-notificacione.dto';

export class UpdateNotificacioneDto extends PartialType(CreateNotificacioneDto) {}
