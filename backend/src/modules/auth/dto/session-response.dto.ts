import { ApiProperty } from '@nestjs/swagger';

export class SessionUserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'email', example: 'musico@example.com' })
  email: string;

  @ApiProperty({ example: 'authenticated' })
  role: string;
}
