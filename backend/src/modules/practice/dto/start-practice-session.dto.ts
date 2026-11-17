import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class StartPracticeSessionDto {
  @ApiProperty({
    format: 'uuid',
    description: 'ID da música da biblioteca que será praticada.',
  })
  @IsUUID()
  song_id: string;

  @ApiPropertyOptional({ example: 'Prática de Enter Sandman' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsDateString()
  @IsOptional()
  started_at?: string;

  @ApiPropertyOptional({ example: 'Começar em velocidade reduzida.' })
  @IsString()
  @MaxLength(5000)
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 'focused' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  mood?: string;

  @ApiPropertyOptional({ example: 'Palm mute' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  focus_area?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 400, example: 90 })
  @IsInt()
  @Min(1)
  @Max(400)
  @IsOptional()
  practiced_bpm?: number;

  @ApiPropertyOptional({
    type: String,
    isArray: true,
    format: 'uuid',
    maxItems: 20,
  })
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsUUID('4', { each: true })
  @IsOptional()
  technique_ids?: string[];
}
