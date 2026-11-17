import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSongDto {
  @ApiProperty({
    minLength: 1,
    maxLength: 200,
    example: 'Little Wing',
    description: 'Título da música.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    minLength: 1,
    maxLength: 200,
    example: 'Jimi Hendrix',
    description: 'Artista ou banda.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  artist: string;

  @ApiPropertyOptional({
    example: 'Axis: Bold as Love',
    description: 'Álbum da música.',
  })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  album?: string;

  @ApiPropertyOptional({ example: 'Rock', description: 'Gênero musical.' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  genre?: string;

  @ApiPropertyOptional({ example: 'E minor', description: 'Tom musical.' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  musical_key?: string;

  @ApiPropertyOptional({
    minimum: 0,
    maximum: 24,
    example: 0,
    description: 'Casa em que o capotraste deve ser posicionado.',
  })
  @IsInt()
  @Min(0)
  @Max(24)
  @IsOptional()
  capo?: number;

  @ApiPropertyOptional({
    example: 'E Standard',
    description: 'Afinação utilizada.',
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  tuning?: string;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 400,
    example: 70,
    description: 'Andamento em batidas por minuto.',
  })
  @IsInt()
  @Min(1)
  @Max(400)
  @IsOptional()
  bpm?: number;

  @ApiPropertyOptional({
    enum: ['beginner', 'intermediate', 'advanced'],
    example: 'intermediate',
    description: 'Dificuldade estimada.',
  })
  @IsIn(['beginner', 'intermediate', 'advanced'])
  @IsOptional()
  difficulty?: 'beginner' | 'intermediate' | 'advanced';

  @ApiPropertyOptional({
    example: 'spotify-track-id',
    description: 'Identificador da faixa no Spotify.',
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  spotify_track_id?: string;

  @ApiPropertyOptional({
    format: 'uri',
    example: 'https://p.scdn.co/mp3-preview/example',
    description: 'URL de prévia fornecida pelo Spotify.',
  })
  @IsUrl({ require_protocol: true })
  @IsOptional()
  spotify_preview_url?: string;

  @ApiPropertyOptional({
    format: 'uri',
    example: 'https://open.spotify.com/track/example',
    description: 'URL externa da faixa no Spotify.',
  })
  @IsUrl({ require_protocol: true })
  @IsOptional()
  spotify_external_url?: string;

  @ApiPropertyOptional({
    format: 'uri',
    example: 'https://example.com/cover.webp',
    description: 'URL da capa da música.',
  })
  @IsUrl({ require_protocol: true })
  @IsOptional()
  cover_image_url?: string;

  @ApiPropertyOptional({
    example: 'Praticar bends no solo.',
    description: 'Anotações pessoais sobre a música.',
  })
  @IsString()
  @MaxLength(5000)
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    minimum: 0,
    example: 331,
    description: 'Duração conhecida da faixa em segundos.',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  duration_seconds?: number;

  @ApiPropertyOptional({
    enum: ['apple_music', 'spotify', 'manual', 'other'],
    example: 'apple_music',
    description: 'Origem externa ou manual dos metadados da música.',
  })
  @IsIn(['apple_music', 'spotify', 'manual', 'other'])
  @IsOptional()
  provider?: 'apple_music' | 'spotify' | 'manual' | 'other';

  @ApiPropertyOptional({ example: '1440833098' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  provider_track_id?: string;

  @ApiPropertyOptional({
    format: 'uri',
    example: 'https://example.com/preview.m4a',
  })
  @IsUrl({ require_protocol: true })
  @IsOptional()
  preview_url?: string;

  @ApiPropertyOptional({
    format: 'uri',
    example: 'https://music.apple.com/track/example',
  })
  @IsUrl({ require_protocol: true })
  @IsOptional()
  external_url?: string;

  @ApiPropertyOptional({
    enum: ['new', 'learning', 'maintaining', 'mastered', 'archived'],
    default: 'new',
    description: 'Estado atual da música na jornada de aprendizado.',
  })
  @IsIn(['new', 'learning', 'maintaining', 'mastered', 'archived'])
  @IsOptional()
  learning_status?:
    | 'new'
    | 'learning'
    | 'maintaining'
    | 'mastered'
    | 'archived';

  @ApiPropertyOptional({ minimum: 1, maximum: 400, example: 123 })
  @IsInt()
  @Min(1)
  @Max(400)
  @IsOptional()
  target_bpm?: number;

  @ApiPropertyOptional({
    minimum: 0,
    maximum: 5,
    default: 0,
    description: 'Prioridade pessoal usada nas recomendações de prática.',
  })
  @IsInt()
  @Min(0)
  @Max(5)
  @IsOptional()
  priority?: number;
}
