import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class ReorderSetlistSongsDto {
  @ApiProperty({
    type: [String],
    description:
      'Lista completa das músicas ativas na nova ordem. Posições serão 0..n-1.',
    maxItems: 1000,
  })
  @IsArray()
  @ArrayMaxSize(1000)
  @ArrayUnique()
  @IsUUID('all', { each: true })
  song_ids: string[];
}

export class SetlistOrderResponseDto {
  @ApiProperty({ format: 'uuid' }) id: string;
}
