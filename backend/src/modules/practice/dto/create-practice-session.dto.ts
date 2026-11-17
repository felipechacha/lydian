import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePracticeSessionDto {
  @ApiPropertyOptional({
    example: 'Treino de improvisação',
    description: 'Título opcional da sessão.',
  })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    format: 'date-time',
    example: '2026-07-28T18:00:00.000Z',
    description:
      'Início da sessão. O banco usa o horário atual quando omitido.',
  })
  @IsDateString()
  @IsOptional()
  started_at?: string;

  @ApiPropertyOptional({
    format: 'date-time',
    example: '2026-07-28T18:45:00.000Z',
    description: 'Término da sessão; deve ser posterior ao início.',
  })
  @IsDateString()
  @IsOptional()
  ended_at?: string;

  @ApiPropertyOptional({
    minimum: 0,
    example: 45,
    description:
      'Duração em minutos. É calculada quando início e término são fornecidos.',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  duration_minutes?: number;

  @ApiPropertyOptional({
    minimum: 0,
    example: 2700,
    description: 'Duração efetiva da sessão em segundos.',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  duration_seconds?: number;

  @ApiPropertyOptional({
    minimum: 0,
    example: 120,
    description: 'Tempo total pausado durante a sessão, em segundos.',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  paused_seconds?: number;

  @ApiPropertyOptional({
    example: 'Boa evolução nos arpejos.',
    description: 'Anotações gerais da sessão.',
  })
  @IsString()
  @MaxLength(5000)
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    example: 'focused',
    description: 'Humor ou estado percebido durante a prática.',
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  mood?: string;

  @ApiPropertyOptional({
    example: 'Improvisação',
    description: 'Área principal de foco da sessão.',
  })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  focus_area?: string;
}
