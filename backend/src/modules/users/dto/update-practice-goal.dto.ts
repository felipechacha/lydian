import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdatePracticeGoalDto {
  @ApiPropertyOptional({
    minimum: 60,
    maximum: 86400,
    example: 3600,
    description: 'Meta diária de prática em segundos.',
  })
  @IsInt()
  @Min(60)
  @Max(86400)
  @IsOptional()
  daily_target_seconds?: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 7,
    example: 5,
    description: 'Quantidade desejada de dias de prática por semana.',
  })
  @IsInt()
  @Min(1)
  @Max(7)
  @IsOptional()
  weekly_target_days?: number;

  @ApiPropertyOptional({
    example: 'America/Sao_Paulo',
    maxLength: 100,
    description: 'Timezone IANA usado para fechar dias e semanas de prática.',
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  timezone?: string;
}
