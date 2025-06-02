import { ApiProperty } from '@nestjs/swagger';

export class TokenBlacklist {
  @ApiProperty({
    description: 'Identificador único del token en blacklist',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Token JWT que ha sido invalidado',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2023-01-01T00:00:00.000Z',
    type: Date,
  })
  createdAt: Date;
}
