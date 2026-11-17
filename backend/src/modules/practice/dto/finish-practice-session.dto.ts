import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
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
  ValidateNested,
} from 'class-validator';

export class FinishPracticeSongDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  song_id: string;

  @ApiPropertyOptional({ minimum: 0, example: 1845 })
  @IsInt()
  @Min(0)
  @IsOptional()
  seconds_practiced?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 400, example: 118 })
  @IsInt()
  @Min(1)
  @Max(400)
  @IsOptional()
  practiced_bpm?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5, example: 4 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  progress_rating?: number;

  @ApiPropertyOptional({ minimum: 0, example: 8 })
  @IsInt()
  @Min(0)
  @IsOptional()
  repetitions?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 5, example: 4 })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  quality_rating?: number;

  @ApiPropertyOptional({ example: 'Rever o último riff.' })
  @IsString()
  @MaxLength(2000)
  @IsOptional()
  notes?: string;

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

export class FinishPracticeSessionDto {
  @ApiPropertyOptional({ format: 'date-time' })
  @IsDateString()
  @IsOptional()
  ended_at?: string;

  @ApiPropertyOptional({ minimum: 0, example: 1845 })
  @IsInt()
  @Min(0)
  @IsOptional()
  duration_seconds?: number;

  @ApiPropertyOptional({ minimum: 0, example: 120 })
  @IsInt()
  @Min(0)
  @IsOptional()
  paused_seconds?: number;

  @ApiPropertyOptional({ example: 'A execução ficou mais consistente.' })
  @IsString()
  @MaxLength(5000)
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 'focused' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  mood?: string;

  @ApiPropertyOptional({ example: 'Precisão rítmica' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  focus_area?: string;

  @ApiProperty({ type: FinishPracticeSongDto })
  @ValidateNested()
  @Type(() => FinishPracticeSongDto)
  song: FinishPracticeSongDto;
}
