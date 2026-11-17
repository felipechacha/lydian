import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AddPracticeSongDto {
  @ApiProperty({
    format: 'uuid',
    example: 'a2577370-af8e-4fd9-a4a8-930a0c9a5d62',
    description: 'ID de uma música pertencente ao usuário.',
  })
  @IsUUID()
  song_id: string;

  @ApiPropertyOptional({
    minimum: 0,
    example: 30,
    description: 'Minutos dedicados à música nesta sessão.',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  minutes_practiced?: number;

  @ApiPropertyOptional({
    example: 'Treinar o solo em 70% da velocidade.',
    description: 'Anotação específica da música praticada.',
  })
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 5,
    example: 4,
    description: 'Avaliação subjetiva de progresso de 1 a 5.',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  progress_rating?: number;

  @ApiPropertyOptional({
    minimum: 0,
    example: 1800,
    description: 'Tempo dedicado à música em segundos.',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  seconds_practiced?: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 400,
    example: 118,
    description: 'BPM efetivamente usado durante a prática.',
  })
  @IsInt()
  @Min(1)
  @Max(400)
  @IsOptional()
  practiced_bpm?: number;

  @ApiPropertyOptional({
    minimum: 0,
    example: 8,
    description: 'Quantidade de repetições intencionais realizadas.',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  repetitions?: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 5,
    example: 4,
    description: 'Avaliação subjetiva da qualidade da execução, de 1 a 5.',
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  quality_rating?: number;

  @ApiPropertyOptional({
    type: String,
    isArray: true,
    format: 'uuid',
    maxItems: 20,
    description: 'IDs das técnicas trabalhadas na música durante a sessão.',
  })
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsUUID('4', { each: true })
  @IsOptional()
  technique_ids?: string[];
}
