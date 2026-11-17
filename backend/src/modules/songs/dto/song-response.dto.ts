import { ApiProperty } from '@nestjs/swagger';
import { TechniqueResponseDto } from '../../techniques/dto/technique-response.dto';

export class SongTechniqueResponseDto {
  @ApiProperty({ type: TechniqueResponseDto })
  techniques: TechniqueResponseDto;
}

export class SongResponseDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ format: 'uuid' }) user_id: string;
  @ApiProperty({ example: 'Little Wing' }) title: string;
  @ApiProperty({ example: 'Jimi Hendrix' }) artist: string;
  @ApiProperty({ example: 'Axis: Bold as Love', nullable: true }) album:
    | string
    | null;
  @ApiProperty({ example: 'Rock', nullable: true }) genre: string | null;
  @ApiProperty({ example: 'E minor', nullable: true }) musical_key:
    | string
    | null;
  @ApiProperty({ example: 0, nullable: true }) capo: number | null;
  @ApiProperty({ example: 'E Standard', nullable: true }) tuning: string | null;
  @ApiProperty({ example: 70, nullable: true }) bpm: number | null;
  @ApiProperty({
    enum: ['beginner', 'intermediate', 'advanced'],
    nullable: true,
  })
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
  @ApiProperty({ example: 'spotify-track-id', nullable: true })
  spotify_track_id: string | null;
  @ApiProperty({ format: 'uri', nullable: true }) spotify_preview_url:
    | string
    | null;
  @ApiProperty({ format: 'uri', nullable: true }) spotify_external_url:
    | string
    | null;
  @ApiProperty({ format: 'uri', nullable: true }) cover_image_url:
    | string
    | null;
  @ApiProperty({ example: 'Praticar bends no solo.', nullable: true }) notes:
    | string
    | null;
  @ApiProperty({ example: 331, minimum: 0, nullable: true })
  duration_seconds: number | null;
  @ApiProperty({
    enum: ['apple_music', 'spotify', 'manual', 'other'],
    nullable: true,
  })
  provider: 'apple_music' | 'spotify' | 'manual' | 'other' | null;
  @ApiProperty({ example: '1440833098', nullable: true })
  provider_track_id: string | null;
  @ApiProperty({ format: 'uri', nullable: true }) preview_url: string | null;
  @ApiProperty({ format: 'uri', nullable: true }) external_url: string | null;
  @ApiProperty({
    enum: ['new', 'learning', 'maintaining', 'mastered', 'archived'],
  })
  learning_status: 'new' | 'learning' | 'maintaining' | 'mastered' | 'archived';
  @ApiProperty({ example: 123, minimum: 1, maximum: 400, nullable: true })
  target_bpm: number | null;
  @ApiProperty({ example: 3, minimum: 0, maximum: 5 }) priority: number;
  @ApiProperty({ format: 'date-time', nullable: true })
  last_practiced_at: string | null;
  @ApiProperty({
    type: SongTechniqueResponseDto,
    isArray: true,
    required: false,
  })
  song_techniques?: SongTechniqueResponseDto[];
  @ApiProperty({ format: 'date-time' }) created_at: string;
  @ApiProperty({ format: 'date-time' }) updated_at: string;
}
