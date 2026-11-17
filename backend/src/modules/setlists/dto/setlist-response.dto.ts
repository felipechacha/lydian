import { ApiProperty } from '@nestjs/swagger';
import { SongResponseDto } from '../../songs/dto/song-response.dto';

export class SetlistSongResponseDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ format: 'uuid' }) setlist_id: string;
  @ApiProperty({ format: 'uuid' }) song_id: string;
  @ApiProperty({ example: 0, minimum: 0 }) position: number;
  @ApiProperty({ example: 'Abrir o show com esta música.', nullable: true })
  notes: string | null;
  @ApiProperty({ format: 'date-time' }) created_at: string;
}

export class SetlistSongDetailResponseDto extends SetlistSongResponseDto {
  @ApiProperty({ type: SongResponseDto })
  songs: SongResponseDto;
}

export class SetlistResponseDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ format: 'uuid' }) user_id: string;
  @ApiProperty({ example: 'Show de sábado' }) name: string;
  @ApiProperty({ example: 'Repertório principal.', nullable: true })
  description: string | null;
  @ApiProperty({ enum: ['private', 'public', 'unlisted'], example: 'private' })
  visibility: 'private' | 'public' | 'unlisted';
  @ApiProperty({ format: 'date-time' }) created_at: string;
  @ApiProperty({ format: 'date-time' }) updated_at: string;
}

export class SetlistDetailResponseDto extends SetlistResponseDto {
  @ApiProperty({ type: SetlistSongDetailResponseDto, isArray: true })
  setlist_songs: SetlistSongDetailResponseDto[];
}

export class SetlistSongDeletedResponseDto {
  @ApiProperty({ format: 'uuid' }) setlist_id: string;
  @ApiProperty({ format: 'uuid' }) song_id: string;
}

export class SetlistSummaryResponseDto extends SetlistResponseDto {
  @ApiProperty({
    description: 'Quantidade de músicas ativas do mesmo usuário.',
  })
  song_count: number;
  @ApiProperty({
    description:
      'Soma das durações conhecidas, sem estimativa para músicas sem duração.',
  })
  duration_seconds: number;
  @ApiProperty({ description: 'Músicas ativas sem duração cadastrada.' })
  missing_duration_count: number;
  @ApiProperty({
    type: [String],
    maxItems: 4,
    description: 'Até quatro capas na ordem do repertório.',
  })
  cover_image_urls: string[];
}
