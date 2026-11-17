import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class AddSongToSetlistDto {
  @ApiProperty({
    format: 'uuid',
    example: 'a2577370-af8e-4fd9-a4a8-930a0c9a5d62',
    description: 'ID de uma música pertencente ao mesmo usuário.',
  })
  @IsUUID()
  song_id: string;

  @ApiPropertyOptional({
    minimum: 0,
    example: 0,
    description: 'Posição na setlist. Quando omitida, a música entra ao final.',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;

  @ApiPropertyOptional({
    example: 'Começar com contagem de quatro tempos.',
    description: 'Nota específica desta música na setlist.',
  })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  notes?: string;
}
