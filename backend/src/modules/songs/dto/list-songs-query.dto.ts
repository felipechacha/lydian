import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class ListSongsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['created_at', 'updated_at', 'title', 'artist', 'bpm'],
    default: 'created_at',
    description: 'Campo permitido para ordenação das músicas.',
  })
  @IsIn(['created_at', 'updated_at', 'title', 'artist', 'bpm'])
  @IsOptional()
  sort_by: 'created_at' | 'updated_at' | 'title' | 'artist' | 'bpm' =
    'created_at';
}
