import { ApiProperty } from '@nestjs/swagger';

export class UpdateLinkFormularioDto {
  @ApiProperty({
    description: 'Indica si el formulario ha sido completado',
    required: false,
  })
  completado?: boolean;

  @ApiProperty({
    description: 'Indica si el link ha expirado',
    required: false,
  })
  expirado?: boolean;

  @ApiProperty({
    description: 'ID del formulario asociado',
    required: false,
  })
  formularioId?: number;
}
