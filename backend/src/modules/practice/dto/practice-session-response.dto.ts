import { ApiProperty } from '@nestjs/swagger';
import { SongResponseDto } from '../../songs/dto/song-response.dto';
import { TechniqueResponseDto } from '../../techniques/dto/technique-response.dto';

export class PracticeSessionTechniqueResponseDto {
  @ApiProperty({ type: TechniqueResponseDto })
  techniques: TechniqueResponseDto;
}

export class PracticeSessionSongResponseDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ format: 'uuid' }) practice_session_id: string;
  @ApiProperty({ format: 'uuid' }) song_id: string;
  @ApiProperty({ example: 30, minimum: 0, nullable: true })
  minutes_practiced: number | null;
  @ApiProperty({ example: 'Treinar o solo lentamente.', nullable: true })
  notes: string | null;
  @ApiProperty({ example: 4, minimum: 1, maximum: 5, nullable: true })
  progress_rating: number | null;
  @ApiProperty({ example: 1800, minimum: 0, nullable: true })
  seconds_practiced: number | null;
  @ApiProperty({ example: 118, minimum: 1, maximum: 400, nullable: true })
  practiced_bpm: number | null;
  @ApiProperty({ example: 8, minimum: 0, nullable: true })
  repetitions: number | null;
  @ApiProperty({ example: 4, minimum: 1, maximum: 5, nullable: true })
  quality_rating: number | null;
  @ApiProperty({ format: 'date-time' }) created_at: string;
}

export class PracticeSessionSongDetailResponseDto extends PracticeSessionSongResponseDto {
  @ApiProperty({ type: SongResponseDto })
  songs: SongResponseDto;

  @ApiProperty({ type: PracticeSessionTechniqueResponseDto, isArray: true })
  practice_session_techniques: PracticeSessionTechniqueResponseDto[];
}

export class PracticeSessionResponseDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ format: 'uuid' }) user_id: string;
  @ApiProperty({ example: 'Treino de improvisação', nullable: true })
  title: string | null;
  @ApiProperty({ format: 'date-time' }) started_at: string;
  @ApiProperty({ format: 'date-time', nullable: true }) ended_at: string | null;
  @ApiProperty({ example: 45, minimum: 0, nullable: true })
  duration_minutes: number | null;
  @ApiProperty({ example: 2700, minimum: 0, nullable: true })
  duration_seconds: number | null;
  @ApiProperty({ example: 120, minimum: 0 })
  paused_seconds: number;
  @ApiProperty({ example: 'Boa evolução.', nullable: true }) notes:
    | string
    | null;
  @ApiProperty({ example: 'focused', nullable: true }) mood: string | null;
  @ApiProperty({ example: 'Improvisação', nullable: true }) focus_area:
    | string
    | null;
  @ApiProperty({ format: 'date-time' }) created_at: string;
  @ApiProperty({ format: 'date-time' }) updated_at: string;
}

export class PracticeSessionDetailResponseDto extends PracticeSessionResponseDto {
  @ApiProperty({ type: PracticeSessionSongDetailResponseDto, isArray: true })
  practice_session_songs: PracticeSessionSongDetailResponseDto[];
}

export class PracticeSessionSongDeletedResponseDto {
  @ApiProperty({ format: 'uuid' }) practice_session_id: string;
  @ApiProperty({ format: 'uuid' }) song_id: string;
}
