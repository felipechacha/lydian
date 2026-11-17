import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class GetSignedUrlQueryDto {
  @ApiProperty({
    example: 'a2577370-af8e-4fd9-a4a8-930a0c9a5d62/avatar/file.webp',
    description: 'Caminho privado retornado na criação da URL de upload.',
  })
  @IsString()
  @MaxLength(500)
  path: string;
}
